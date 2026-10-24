import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Play as PlayIcon,
  Shuffle,
  Globe,
  Map as MapIcon,
  Clock,
  Users,
  Layers,
  Columns,
  Bot,
  Download,
  Wand2,
  CheckCircle2,
  Lock,
  Unlock,
  BookOpen,
  ArrowRight,
  Undo2,
  AlertCircle,
} from 'lucide-react'
import {
  Card,
  DrawRecord,
  GameMode,
  PlayerSeat,
  PowerData,
  StageId,
  TurnPhase,
  WorldEntity,
  WorldState,
  MapState,
} from '../engine/types'
import {
  DEFAULT_CARD_COLORS,
  JOKER,
  STAGES,
  buildShuffledDeck,
  calculateEpochYear,
  getCardDisplay,
  getNextStage,
  isFantasticalCard,
  loadCardColors,
  loadPowerData,
} from '../engine/deckEngine'
import {
  branchWorldAtMove,
  createNewWorld,
  deleteWorld,
  duplicateWorld,
  getActiveWorld,
  listSavedWorlds,
  parseImportedWorld,
  recordTurnSnapshot,
  rewindWorldToMove,
  saveWorld,
  setActiveWorldId,
} from '../engine/storageService'
import {
  autoPlayFullWorld,
  autoPlayStage,
  createSeededRng,
  executeAutomatedTurn,
} from '../engine/autoPlayEngine'
import {
  BOT_PERSONALITIES,
  PLAYER_COLORS,
  StageActionPreset,
  getActionPresetsForDraw,
} from '../engine/presets'
import { addSlotToTile, getTileId } from '../engine/mapEngine'
import { MapCanvas } from '../components/MapCanvas'
import { TimelinePanel } from '../components/TimelinePanel'
import { EntityRegistry } from '../components/EntityRegistry'
import { CreateWorldOptions, WorldManagerModal } from '../components/WorldManagerModal'
import { ExportSuiteModal } from '../components/ExportSuiteModal'
import { AgesReferenceModal } from '../components/AgesReferenceModal'
import { PlayerRosterModal } from '../components/PlayerRosterModal'
import { AutoPlayConsoleModal } from '../components/AutoPlayConsoleModal'
import { GameSetupWizardModal } from '../components/GameSetupWizardModal'

type StudioTab = 'cards' | 'map' | 'timeline' | 'entities' | 'split'

export function Play() {
  const [world, setWorld] = useState<WorldState>(() => getActiveWorld())
  const [savedWorlds, setSavedWorlds] = useState<WorldState[]>(() => listSavedWorlds())
  const [gameMode, setGameMode] = useState<GameMode>(() => world.gameMode || 'studio')
  const [activeTab, setActiveTab] = useState<StudioTab>('split')
  const [deck, setDeck] = useState<Card[]>([])
  const [drawnCard, setDrawnCard] = useState<Card | null>(null)
  const [powerData, setPowerData] = useState<PowerData | null>(null)

  // Turn state machine for Studio Mode
  const [turnPhase, setTurnPhase] = useState<TurnPhase>('await_draw')
  const [pendingNote, setPendingNote] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<StageActionPreset | null>(null)
  const [showTurnVerifyDialog, setShowTurnVerifyDialog] = useState(false)

  // Dedicated Modals
  const [showExportModal, setShowExportModal] = useState(false)
  const [showWorldManager, setShowWorldManager] = useState(false)
  const [showPlayersModal, setShowPlayersModal] = useState(false)
  const [showAutoPlayModal, setShowAutoPlayModal] = useState(false)
  const [showSetupWizardModal, setShowSetupWizardModal] = useState(false)
  const [showAgesModal, setShowAgesModal] = useState(false)
  const [showDeckEmptyDialog, setShowDeckEmptyDialog] = useState(false)

  const [generateIntoNewWorld, setGenerateIntoNewWorld] = useState(false)
  const [cardColors, setCardColors] = useState<Record<string, string>>(DEFAULT_CARD_COLORS)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    deckConfig,
    currentStage,
    drawHistory,
    players,
    currentPlayerIndex,
    generationSettings,
  } = world

  const activePlayer: PlayerSeat | undefined =
    players && players.length > 0
      ? players[currentPlayerIndex % players.length]
      : undefined

  const persistWorldUpdate = useCallback((updater: (prev: WorldState) => WorldState) => {
    setWorld((prev) => {
      const next = saveWorld(updater(prev))
      setSavedWorlds(listSavedWorlds())
      return next
    })
  }, [])

  useEffect(() => {
    loadCardColors().then(setCardColors)
  }, [])

  const rebuildDeck = useCallback(() => {
    return buildShuffledDeck({
      numberRange: deckConfig.numberRange,
      faceCards: deckConfig.faceCards,
      aceCount: deckConfig.aceCount,
      jokerCount: deckConfig.jokerCount,
    })
  }, [deckConfig])

  useEffect(() => {
    setDeck(rebuildDeck())
  }, [rebuildDeck])

  useEffect(() => {
    if (drawnCard && deckConfig.stagesEnabled) {
      loadPowerData(currentStage, drawnCard).then(setPowerData)
    } else {
      setPowerData(null)
    }
  }, [drawnCard, currentStage, deckConfig.stagesEnabled])

  // Sync mode changes into world state
  const handleModeChange = (newMode: GameMode) => {
    setGameMode(newMode)
    persistWorldUpdate((prev) => ({
      ...prev,
      gameMode: newMode,
      companionMode: newMode === 'companion' ? 'companion-tracker' : 'full-studio',
    }))
  }

  // Draw Card action
  const handleDrawCard = async () => {
    if (world.isLocked) return
    if (deck.length === 0) {
      setShowDeckEmptyDialog(true)
      return
    }

    const newDeck = [...deck]
    const card = newDeck.pop()!
    setDeck(newDeck)
    setDrawnCard(card)
    setSelectedPreset(null)
    setPendingNote('')

    // Auto-Bot resolving seat in Studio mode
    if (activePlayer?.isBot && gameMode === 'studio') {
      const rng = createSeededRng(
        `${generationSettings.seed}-${drawHistory.length}-${card.id}`
      )
      persistWorldUpdate((prev) => executeAutomatedTurn(prev, card, rng))
      setTurnPhase('await_draw')
      if (newDeck.length === 0) {
        setShowDeckEmptyDialog(true)
      }
      return
    }

    let power: string | undefined = undefined
    if (deckConfig.stagesEnabled) {
      const data = await loadPowerData(currentStage, card)
      power = data?.power
    }
    const moveId = drawHistory.length + 1
    const record: DrawRecord = {
      id: `draw_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      moveId,
      card,
      timestamp: new Date().toISOString(),
      stage: deckConfig.stagesEnabled ? currentStage : undefined,
      power,
      note: '',
      linkedTileIds: [],
      linkedEntityIds: [],
      epochYear: calculateEpochYear(deckConfig.stagesEnabled ? currentStage : undefined, moveId),
      playerId: activePlayer?.id,
      playerName: activePlayer?.name,
      playerColor: activePlayer?.color,
      isAutoPlayed: false,
    }

    if (gameMode === 'companion') {
      // Companion Mode: instant resolution with zero verification friction
      persistWorldUpdate((prev) => {
        const nextPlayerIdx =
          prev.players.length > 0 ? (prev.currentPlayerIndex + 1) % prev.players.length : 0
        const updated: WorldState = {
          ...prev,
          drawHistory: [...prev.drawHistory, record],
          currentPlayerIndex: nextPlayerIdx,
        }
        const snap = recordTurnSnapshot(updated, moveId)
        updated.snapshots = [...(updated.snapshots || []), snap]
        return updated
      })
      setTurnPhase('await_draw')
      if (newDeck.length === 0) setShowDeckEmptyDialog(true)
      return
    }

    // Studio Mode: record turn into history so timeline updates, and enter action select phase
    persistWorldUpdate((prev) => {
      const updated: WorldState = {
        ...prev,
        drawHistory: [...prev.drawHistory, record],
      }
      const snap = recordTurnSnapshot(updated, moveId)
      updated.snapshots = [...(updated.snapshots || []), snap]
      return updated
    })
    setTurnPhase('action_select')
    if (newDeck.length === 0) setShowDeckEmptyDialog(true)
  }

  // Confirm and Chronicle Turn in Studio Mode
  const handleConfirmTurnChronicle = () => {
    if (!drawnCard || world.isLocked) return

    persistWorldUpdate((prev) => {
      const lastIndex = prev.drawHistory.length - 1
      if (lastIndex < 0) return prev

      const record: DrawRecord = { ...prev.drawHistory[lastIndex] }
      if (pendingNote.trim()) {
        record.note = pendingNote.trim()
      }
      if (selectedPreset) {
        record.actionTitle = selectedPreset.name
        record.presetId = selectedPreset.id
        record.power = record.power || selectedPreset.name
      }

      let nextTiles = { ...prev.map.tiles }
      let nextEntities = [...prev.entities]

      // Apply preset to map and entities if selected
      if (selectedPreset) {
        // Find land candidate
        const candidates: { col: number; row: number }[] = []
        for (let r = 0; r < prev.map.height; r++) {
          for (let c = 0; c < prev.map.width; c++) {
            const id = getTileId(c, r)
            const t = prev.map.tiles[id]
            if (t && t.terrain !== 'ocean' && t.terrain !== 'water') {
              candidates.push({ col: c, row: r })
            }
          }
        }
        const target = candidates[0] || { col: Math.floor(prev.map.width / 2), row: Math.floor(prev.map.height / 2) }
        const coordStr = getTileId(target.col, target.row)

        const existingTile = nextTiles[coordStr]
        if (existingTile) {
          let updated = { ...existingTile }
          if (selectedPreset.terrainChange) updated.terrain = selectedPreset.terrainChange
          if (selectedPreset.reliefChange) updated.relief = selectedPreset.reliefChange
          if (selectedPreset.floraChange) updated.flora = selectedPreset.floraChange
          if (selectedPreset.overlayChange) updated.overlay = selectedPreset.overlayChange
          if (selectedPreset.hasRiver) updated.hasRiver = true
          if (selectedPreset.hasRoad) updated.hasRoad = true

          updated = addSlotToTile(updated, {
            category: selectedPreset.slotCategory,
            type: selectedPreset.id,
            name: selectedPreset.name,
            icon: selectedPreset.icon,
            priority: selectedPreset.slotPriority,
            linkedEventId: record.id,
            moveId: record.moveId,
          })
          nextTiles[coordStr] = updated
          record.linkedTileIds = [coordStr]
        }
      }

      const nextPlayerIdx =
        prev.players.length > 0 ? (prev.currentPlayerIndex + 1) % prev.players.length : 0

      const nextHistory = [...prev.drawHistory]
      nextHistory[lastIndex] = record

      const updated: WorldState = {
        ...prev,
        map: { ...prev.map, tiles: nextTiles },
        entities: nextEntities,
        drawHistory: nextHistory,
        currentPlayerIndex: nextPlayerIdx,
      }
      const snap = recordTurnSnapshot(updated, record.moveId)
      updated.snapshots = [...(updated.snapshots || []), snap]
      return updated
    })

    setTurnPhase('await_draw')
    setShowTurnVerifyDialog(false)
    setSelectedPreset(null)
    setPendingNote('')

    if (deck.length === 0) {
      setShowDeckEmptyDialog(true)
    }
  }

  // Undo Last Turn in Studio Mode
  const handleUndoLastTurn = () => {
    if (drawHistory.length === 0 || world.isLocked) return
    const targetMove = drawHistory.length - 1
    if (targetMove === 0) {
      persistWorldUpdate((prev) => ({
        ...prev,
        drawHistory: [],
        snapshots: [],
        currentPlayerIndex: Math.max(0, prev.currentPlayerIndex - 1),
      }))
    } else {
      persistWorldUpdate((prev) => rewindWorldToMove(prev, targetMove))
    }
    setDeck(rebuildDeck())
    setDrawnCard(null)
    setTurnPhase('await_draw')
  }

  const handleAutoStepOneTurn = () => {
    if (world.isLocked) return
    let currentDeck = deck.length > 0 ? [...deck] : rebuildDeck()
    const card = currentDeck.pop()!
    setDeck(currentDeck)
    setDrawnCard(card)

    const rng = createSeededRng(
      `${generationSettings.seed}-step-${drawHistory.length}-${card.id}`
    )
    persistWorldUpdate((prev) => executeAutomatedTurn(prev, card, rng))
    setTurnPhase('await_draw')
  }

  const handleAutoPlayCurrentStage = () => {
    if (world.isLocked) return
    const turns = generationSettings.turnsPerStage ?? 12
    const { world: nextWorld, deck: remainingDeck } = autoPlayStage(world, deck, turns)
    const saved = saveWorld(nextWorld)
    setWorld(saved)
    setSavedWorlds(listSavedWorlds())
    setDeck(remainingDeck)
    if (saved.drawHistory.length > 0) {
      setDrawnCard(saved.drawHistory[saved.drawHistory.length - 1].card)
    }
    setTurnPhase('await_draw')
  }

  const handleAutoPlayFullWorld = () => {
    const turns = generationSettings.turnsPerStage ?? 8
    if (generateIntoNewWorld || world.isLocked) {
      const baseNewWorld = createNewWorld(`${world.name} (${generationSettings.seed})`)
      baseNewWorld.generationSettings = { ...generationSettings }
      baseNewWorld.players = [...players]
      baseNewWorld.deckConfig = { ...deckConfig }
      baseNewWorld.gameMode = gameMode
      const simulated = autoPlayFullWorld(baseNewWorld, turns)
      const saved = saveWorld(simulated)
      setActiveWorldId(saved.id)
      setWorld(saved)
      setSavedWorlds(listSavedWorlds())
      setDeck(buildShuffledDeck(saved.deckConfig))
      if (saved.drawHistory.length > 0) {
        setDrawnCard(saved.drawHistory[saved.drawHistory.length - 1].card)
      }
      return
    }

    const simulated = autoPlayFullWorld(world, turns)
    const saved = saveWorld(simulated)
    setWorld(saved)
    setSavedWorlds(listSavedWorlds())
    setDeck(buildShuffledDeck(saved.deckConfig))
    if (saved.drawHistory.length > 0) {
      setDrawnCard(saved.drawHistory[saved.drawHistory.length - 1].card)
    }
    setTurnPhase('await_draw')
  }

  const handleStageChange = (newStage: StageId) => {
    if (world.isLocked) return
    persistWorldUpdate((prev) => ({
      ...prev,
      currentStage: newStage,
      deckConfig: {
        ...prev.deckConfig,
        selectedStage: newStage,
      },
    }))
  }

  const handleProgressToNextStage = () => {
    const nextStage = getNextStage(currentStage)
    if (nextStage) {
      handleStageChange(nextStage)
      setDeck(rebuildDeck())
      setDrawnCard(null)
      setPowerData(null)
      setShowDeckEmptyDialog(false)
      setTurnPhase('await_draw')
    }
  }

  const handleReshuffleDeck = () => {
    setDeck(rebuildDeck())
    setDrawnCard(null)
    setPowerData(null)
    setShowDeckEmptyDialog(false)
    setTurnPhase('await_draw')
  }

  const handleDuplicateWorld = (worldId: string) => {
    const target = worldId === world.id ? world : savedWorlds.find((w) => w.id === worldId)
    if (target) {
      duplicateWorld(target)
      setSavedWorlds(listSavedWorlds())
    }
  }

  const handleToggleLockWorld = (worldId: string) => {
    if (worldId === world.id) {
      persistWorldUpdate((prev) => ({ ...prev, isLocked: !prev.isLocked }))
    } else {
      const target = savedWorlds.find((w) => w.id === worldId)
      if (target) {
        saveWorld({ ...target, isLocked: !target.isLocked })
        setSavedWorlds(listSavedWorlds())
      }
    }
  }

  const handleAddPlayerSeat = () => {
    if (players.length >= 6) return
    const idx = players.length
    const defaultRole = idx === 0 ? 'Artist' : idx === 1 ? 'Historian' : idx === 2 ? 'Keeper' : 'Player'
    const newSeat: PlayerSeat = {
      id: `player_${Date.now()}_${idx}`,
      name: `Player ${idx + 1}`,
      color: PLAYER_COLORS[idx % PLAYER_COLORS.length],
      role: defaultRole as any,
      isBot: false,
      personality: 'shaper',
    }
    persistWorldUpdate((prev) => ({
      ...prev,
      players: [...prev.players, newSeat],
    }))
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const imported = parseImportedWorld(text)
      const saved = saveWorld(imported)
      setWorld(saved)
      setSavedWorlds(listSavedWorlds())
      setDeck(buildShuffledDeck(saved.deckConfig))
      setDrawnCard(null)
      setPowerData(null)
    } catch (err) {
      console.error('Import error:', err)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const isFantastical = isFantasticalCard(drawnCard)
  const isDisasterAce = drawnCard?.value === 'A'
  const availableActionPresets = drawnCard
    ? getActionPresetsForDraw(
        currentStage,
        drawnCard.value === JOKER ? '♠' : drawnCard.suit,
        isFantastical,
        isDisasterAce
      )
    : []

  const { color, bgColor } = drawnCard
    ? getCardDisplay(drawnCard, cardColors)
    : { color: '', bgColor: '' }
  const currentStageData = STAGES.find((s) => s.id === currentStage)

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* =========================================================================
          1. SLEEK UNIFIED TOP BAR
          ========================================================================= */}
      <header className="no-print card p-3 sm:p-4 space-y-3 border-border/80 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: World Identity & Editable Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 shadow-inner">
              <Globe className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-lg sm:text-xl font-bold truncate tracking-tight">
                  {world.name}
                </span>
                {currentStageData && (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary/15 text-primary font-bold">
                    Age {currentStageData.number}/4: {currentStageData.name}
                  </span>
                )}
                {world.isLocked && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Read-Only
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                {drawHistory.length} turns · {world.entities.length} codex entries · {players.length} seat(s)
              </p>
            </div>
          </div>

          {/* Center/Right: 3-Mode Switcher */}
          <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border text-xs font-semibold shadow-inner">
            <button
              type="button"
              onClick={() => handleModeChange('studio')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                gameMode === 'studio'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Guided campaign with enforced turn sequence and verification"
            >
              <span>🏆 Studio</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('companion')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                gameMode === 'companion'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Tactile card draw companion for physical paper & pencil tabletop play"
            >
              <span>🃏 Companion</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('free-create')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                gameMode === 'free-create'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Creative sandbox for direct map painting, slot building, and codex wiki editing"
            >
              <span>🎨 Free-Create</span>
            </button>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-1.5">
            {activePlayer && (
              <span
                className="text-[11px] px-2.5 py-1 rounded-full text-white font-medium flex items-center gap-1 shadow-sm"
                style={{ backgroundColor: activePlayer.color }}
              >
                <span>{activePlayer.name} ({activePlayer.role})</span>
                {activePlayer.isBot && <span>· {BOT_PERSONALITIES[activePlayer.personality]?.icon}</span>}
              </span>
            )}

            <button
              type="button"
              onClick={() => setShowAutoPlayModal(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              title="Procedural Seeded Auto-Play & World Generator"
            >
              <Bot className="h-3.5 w-3.5" />
              <span>Auto-Play</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPlayersModal(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-border bg-background hover:bg-muted transition-colors"
              title="Configure 1–6 Hotseat Players or Bot Seats"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Players ({players.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setShowWorldManager(true)}
              className="btn-outline px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1.5"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Worlds ({savedWorlds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="btn-outline px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1.5"
              title="Export Markdown, YAML, JSON, or Map assets"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </button>

            <button
              type="button"
              onClick={() => handleToggleLockWorld(world.id)}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                world.isLocked
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                  : 'border-border hover:bg-muted text-muted-foreground'
              }`}
              title={world.isLocked ? 'World Locked (Read-Only)' : 'Lock World'}
            >
              {world.isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={() => setShowSetupWizardModal(true)}
              className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground"
              title="Game Setup Wizard"
            >
              <Wand2 className="h-4 w-4 text-primary" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </div>
        </div>

        {/* Workspace Sub-Page Tabs (Chronicle, Atlas Map, Keeper Codex, Historian Timeline) */}
        {gameMode !== 'companion' && (
          <nav
            className="flex items-center gap-1 pt-2 border-t border-border/60 overflow-x-auto"
            role="tablist"
            aria-label="Studio Workspace Tabs"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'cards'}
              onClick={() => setActiveTab('cards')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
                activeTab === 'cards'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/50 hover:bg-muted text-foreground'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Deck & Draw</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'map'}
              onClick={() => setActiveTab('map')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
                activeTab === 'map'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/50 hover:bg-muted text-foreground'
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" />
              <span>World Map</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'entities'}
              onClick={() => setActiveTab('entities')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
                activeTab === 'entities'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/50 hover:bg-muted text-foreground'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Codex</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'timeline'}
              onClick={() => setActiveTab('timeline')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
                activeTab === 'timeline'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/50 hover:bg-muted text-foreground'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Historian · Timeline</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'split'}
              onClick={() => setActiveTab('split')}
              className={`hidden lg:flex px-3.5 py-1.5 rounded-lg text-xs font-semibold items-center gap-1.5 shrink-0 transition-all ${
                activeTab === 'split'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/50 hover:bg-muted text-foreground'
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
              <span>Full Studio</span>
            </button>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAgesModal(true)}
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">4-Ages Matrix</span>
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* =========================================================================
          2. MODE 2: ZEN TABLETOP COMPANION MODE (Distraction-Free)
          ========================================================================= */}
      {gameMode === 'companion' && (
        <main className="space-y-4">
          <div className="card p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-primary/20 bg-card">
            {/* Left: Tactile Card Display */}
            <div className="w-full md:w-5/12 flex flex-col items-center justify-center">
              {drawnCard ? (
                <div
                  className={`w-full max-w-[220px] aspect-[5/7] ${bgColor} rounded-2xl border-4 border-gray-300 dark:border-gray-600 shadow-2xl flex flex-col items-center justify-center p-6 relative select-none transition-transform hover:scale-[1.02]`}
                >
                  {drawnCard.value !== JOKER && (
                    <>
                      <div className={`absolute top-3 left-4 text-2xl font-black ${color}`}>
                        {drawnCard.value}
                      </div>
                      <div className={`absolute top-9 left-4 text-xl ${color}`}>
                        {drawnCard.suit}
                      </div>
                    </>
                  )}
                  <div className={`text-7xl font-bold ${color} mb-3`}>
                    {drawnCard.value === JOKER ? '🃏' : drawnCard.suit}
                  </div>
                  {drawnCard.value !== JOKER && (
                    <div className={`text-5xl font-extrabold ${color}`}>{drawnCard.value}</div>
                  )}
                  {drawnCard.value !== JOKER && (
                    <>
                      <div className={`absolute bottom-3 right-4 text-2xl font-black ${color} rotate-180`}>
                        {drawnCard.value}
                      </div>
                      <div className={`absolute bottom-9 right-4 text-xl ${color} rotate-180`}>
                        {drawnCard.suit}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-full max-w-[220px] aspect-[5/7] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center p-4 text-center text-muted-foreground bg-muted/20">
                  <span className="text-5xl mb-2">🃏</span>
                  <span className="font-semibold text-sm">Draw a Card to Begin</span>
                  <span className="text-xs text-muted-foreground mt-1">{deck.length} cards in deck</span>
                </div>
              )}
            </div>

            {/* Right: Companion Power & Scratchpad Note */}
            <div className="w-full md:w-7/12 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    Stage {currentStageData?.number}: {currentStageData?.name}
                  </span>
                  <h2 className="text-2xl font-black">{powerData?.power || 'Draw to Reveal Stage Power'}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAgesModal(true)}
                  className="btn-outline px-3 py-1.5 text-xs flex items-center gap-1.5"
                >
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  <span>All Ages Reference</span>
                </button>
              </div>

              {powerData && (
                <div className="space-y-2.5 text-sm">
                  <p className="leading-relaxed bg-muted/40 p-3.5 rounded-xl border border-border">
                    {isFantastical && powerData.fantasticalDescription
                      ? powerData.fantasticalDescription
                      : powerData.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <strong>Inspiration:</strong> {powerData.examples}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDrawCard}
                  disabled={deck.length === 0 || world.isLocked}
                  className="btn-primary px-7 py-3 text-sm font-bold flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  <PlayIcon className="h-4 w-4" />
                  <span>Draw Card ({deck.length})</span>
                </button>

                <button
                  type="button"
                  onClick={handleReshuffleDeck}
                  className="btn-outline px-4 py-3 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Shuffle className="h-3.5 w-3.5" />
                  <span>Reshuffle Deck</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* =========================================================================
          3. MODE 1 & 3: STUDIO & FREE-CREATE WORKSPACE
          ========================================================================= */}
      {gameMode !== 'companion' && (
        <main className="space-y-4">
          {/* Sub-Page 1: Turn Chronicle (Deck & Draw Engine) */}
          {(activeTab === 'cards' || activeTab === 'split') && (
            <section className="space-y-4">
              {/* Studio Turn Flow / Action Bar */}
              <div className="card p-4 flex flex-wrap items-center justify-between gap-3 bg-card border-border/80">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDrawCard}
                    disabled={deck.length === 0 || world.isLocked || (gameMode === 'studio' && turnPhase === 'action_select')}
                    className="btn-primary flex items-center space-x-2 px-6 py-2.5 text-sm font-bold shadow-sm disabled:opacity-50"
                  >
                    <PlayIcon className="h-4 w-4" />
                    <span>Draw Card ({deck.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAutoStepOneTurn}
                    disabled={world.isLocked}
                    className="btn-outline flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold"
                    title="Auto-Step 1 Turn"
                  >
                    <Bot className="h-3.5 w-3.5" />
                    <span>Auto-Step</span>
                  </button>

                  {drawHistory.length > 0 && gameMode === 'studio' && (
                    <button
                      type="button"
                      onClick={handleUndoLastTurn}
                      disabled={world.isLocked}
                      className="btn-outline flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                      title="Undo the last turn and restore previous state"
                    >
                      <Undo2 className="h-3.5 w-3.5" />
                      <span>Undo Turn</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleReshuffleDeck}
                    className="btn-outline flex items-center space-x-1.5 px-2.5 py-2 text-xs"
                    title="Reshuffle Deck"
                  >
                    <Shuffle className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Reset Deck</span>
                  </button>
                </div>

                {/* Studio Phase Tracker */}
                {gameMode === 'studio' && (
                  <div className="flex items-center gap-2 text-xs font-medium bg-muted/50 px-3 py-1.5 rounded-xl border border-border">
                    <span className="text-muted-foreground">Turn Sequence:</span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        turnPhase === 'await_draw' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      1. Draw
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        turnPhase === 'action_select' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      2. Choose Action
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="px-2 py-0.5 rounded text-muted-foreground font-bold">
                      3. Verify & Next
                    </span>
                  </div>
                )}
              </div>

              {/* Turn Chronicle Card & Power Resolution Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left Card Visual */}
                <div className="lg:col-span-4 card p-6 flex flex-col items-center justify-center min-h-[260px]">
                  {drawnCard ? (
                    <div
                      className={`w-full max-w-[190px] aspect-[5/7] ${bgColor} rounded-xl border-4 border-gray-300 dark:border-gray-600 shadow-xl flex flex-col items-center justify-center p-5 relative select-none`}
                    >
                      {drawnCard.value !== JOKER && (
                        <>
                          <div className={`absolute top-2 left-3 text-xl font-bold ${color}`}>
                            {drawnCard.value}
                          </div>
                          <div className={`absolute top-7 left-3 text-lg ${color}`}>
                            {drawnCard.suit}
                          </div>
                        </>
                      )}
                      <div className={`text-6xl font-bold ${color} mb-2`}>
                        {drawnCard.value === JOKER ? '🃏' : drawnCard.suit}
                      </div>
                      {drawnCard.value !== JOKER && (
                        <div className={`text-4xl font-black ${color}`}>{drawnCard.value}</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-6 space-y-2">
                      <div className="text-5xl">🃏</div>
                      <p className="text-sm font-semibold">Tap "Draw Card" to Begin</p>
                      <p className="text-xs">{deck.length} cards remaining in {currentStageData?.name || 'stage'}</p>
                    </div>
                  )}
                </div>

                {/* Right Power Prompt & Event Resolution */}
                <div className="lg:col-span-8 card p-6 flex flex-col justify-between space-y-4">
                  {drawnCard && powerData ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Stage {currentStageData?.number}: {currentStageData?.name} ({currentStageData?.eraLabel})
                          </span>
                          <h2 className="text-xl sm:text-2xl font-bold mt-0.5">
                            {isFantastical && powerData.fantasticalDescription ? 'Fantastical ' : ''}
                            {powerData.power}
                          </h2>
                        </div>
                        {isFantastical && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400">
                            ✨ Fantastical Face Card
                          </span>
                        )}
                        {isDisasterAce && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-destructive/15 text-destructive">
                            🌋 Ace Cataclysm
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-muted/30 p-3.5 rounded-xl border border-border/60 text-xs">
                        <div>
                          <span className="font-bold text-muted-foreground block mb-1">Rule Prompt:</span>
                          <p className="leading-relaxed">
                            {isFantastical && powerData.fantasticalDescription
                              ? powerData.fantasticalDescription
                              : powerData.description}
                          </p>
                        </div>
                        <div>
                          <span className="font-bold text-muted-foreground block mb-1">Inspiration:</span>
                          <p className="text-muted-foreground leading-relaxed">{powerData.examples}</p>
                        </div>
                      </div>

                      {/* Optional Action Presets Chips */}
                      {availableActionPresets.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-muted-foreground block">
                            Quick Action Presets (Optional):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {availableActionPresets.map((preset) => {
                              const isSelected = selectedPreset?.id === preset.id
                              return (
                                <button
                                  key={preset.id}
                                  type="button"
                                  onClick={() => setSelectedPreset(isSelected ? null : preset)}
                                  className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-start gap-2 ${
                                    isSelected
                                      ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                      : 'border-border bg-background hover:border-primary/50'
                                  }`}
                                >
                                  <span className="text-xl shrink-0">{preset.icon}</span>
                                  <div className="min-w-0 flex-1">
                                    <div className="font-bold truncate">{preset.name}</div>
                                    <div className="text-[10px] text-muted-foreground line-clamp-1">
                                      {preset.description}
                                    </div>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Turn Note & Chronicle Action */}
                      <div className="space-y-2 pt-2 border-t border-border">
                        <label className="text-xs font-semibold text-muted-foreground block">
                          Turn #{drawHistory.length + 1} Event Chronicle Note:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={pendingNote}
                            onChange={(e) => setPendingNote(e.target.value)}
                            placeholder="Describe what occurred in the world on this turn..."
                            className="input flex-1 text-xs h-9"
                          />
                          {gameMode === 'studio' && (
                            <button
                              type="button"
                              onClick={() => setShowTurnVerifyDialog(true)}
                              className="btn-primary px-4 text-xs font-bold shrink-0 flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Confirm Turn</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <p className="font-medium">Draw a card to reveal its stage power and chronicle history.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Sub-Page 2: World Atlas (Expansive Map View) */}
          {(activeTab === 'map' || activeTab === 'split') && (
            <section className="space-y-2">
              <MapCanvas
                map={world.map}
                worldName={world.name}
                drawHistory={world.drawHistory}
                entities={world.entities}
                onChange={(newMap: MapState) => persistWorldUpdate((prev) => ({ ...prev, map: newMap }))}
                initialViewOnly={gameMode === 'studio'}
              />
            </section>
          )}

          {/* Sub-Page 3: Keeper Codex */}
          {(activeTab === 'entities' || activeTab === 'split') && (
            <section className="space-y-2">
              <EntityRegistry
                entities={world.entities}
                currentStage={currentStage}
                drawHistory={world.drawHistory}
                map={world.map}
                onChange={(newEntities: WorldEntity[]) =>
                  persistWorldUpdate((prev) => ({ ...prev, entities: newEntities }))
                }
              />
            </section>
          )}

          {/* Sub-Page 4: Historian Timeline */}
          {(activeTab === 'timeline' || activeTab === 'split' || (activeTab === 'cards' && drawHistory.length > 0)) && (
            <section className="space-y-2">
              <TimelinePanel
                world={world}
                cardColors={cardColors}
                onUpdateRecord={(recordId, updates) =>
                  persistWorldUpdate((prev) => ({
                    ...prev,
                    drawHistory: prev.drawHistory.map((r) =>
                      r.id === recordId ? { ...r, ...updates } : r
                    ),
                  }))
                }
                onClearHistory={() =>
                  persistWorldUpdate((prev) => ({ ...prev, drawHistory: [], snapshots: [] }))
                }
                onRewindToMove={(targetMoveId) => {
                  persistWorldUpdate((prev) => rewindWorldToMove(prev, targetMoveId))
                  setDeck(rebuildDeck())
                }}
                onBranchFromMove={(targetMoveId) => {
                  const branched = branchWorldAtMove(world, targetMoveId)
                  setWorld(branched)
                  setSavedWorlds(listSavedWorlds())
                  setDeck(buildShuffledDeck(branched.deckConfig))
                }}
              />
            </section>
          )}
        </main>
      )}

      {/* =========================================================================
          4. MODALS & DIALOGS (Progressive Disclosure)
          ========================================================================= */}
      {/* Studio Turn Verification Modal */}
      {showTurnVerifyDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" role="dialog">
          <div className="card p-6 max-w-md w-full space-y-4 shadow-xl border-primary/30">
            <div className="flex items-center gap-2.5 text-primary">
              <AlertCircle className="h-5 w-5" />
              <h3 className="font-bold text-lg">Confirm Turn Chronicle</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to chronicle Turn #{drawHistory.length + 1} and record this event into history? This will advance the tabletop turn to the next player seat.
            </p>
            {selectedPreset && (
              <div className="bg-muted/40 p-2.5 rounded-lg border border-border text-xs">
                <strong>Action:</strong> {selectedPreset.icon} {selectedPreset.name}
              </div>
            )}
            {pendingNote && (
              <div className="bg-muted/40 p-2.5 rounded-lg border border-border text-xs italic">
                "{pendingNote}"
              </div>
            )}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleConfirmTurnChronicle}
                className="btn-primary flex-1 text-xs py-2 font-bold"
              >
                Yes, Chronicle Turn
              </button>
              <button
                type="button"
                onClick={() => setShowTurnVerifyDialog(false)}
                className="btn-outline flex-1 text-xs py-2"
              >
                Review & Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Suite Modal */}
      <ExportSuiteModal
        isOpen={showExportModal}
        world={world}
        onClose={() => setShowExportModal(false)}
      />

      {/* All 4 Ages Reference Matrix Modal */}
      <AgesReferenceModal
        isOpen={showAgesModal}
        currentStage={currentStage}
        onClose={() => setShowAgesModal(false)}
        onSelectStage={handleStageChange}
      />

      {/* Player Roster & Bot Personality Tuner Modal */}
      <PlayerRosterModal
        isOpen={showPlayersModal}
        players={players}
        currentPlayerIndex={currentPlayerIndex}
        onClose={() => setShowPlayersModal(false)}
        onAddPlayerSeat={handleAddPlayerSeat}
        onUpdatePlayerSeat={(seatId, updates) =>
          persistWorldUpdate((prev) => ({
            ...prev,
            players: prev.players.map((p) => (p.id === seatId ? { ...p, ...updates } : p)),
          }))
        }
        onRemovePlayerSeat={(seatId) => {
          if (players.length <= 1) return
          persistWorldUpdate((prev) => ({
            ...prev,
            players: prev.players.filter((p) => p.id !== seatId),
          }))
        }}
      />

      {/* AutoPlay Console Modal */}
      <AutoPlayConsoleModal
        isOpen={showAutoPlayModal}
        world={world}
        generateIntoNewWorld={generateIntoNewWorld}
        onClose={() => setShowAutoPlayModal(false)}
        onAutoStepOneTurn={handleAutoStepOneTurn}
        onAutoPlayCurrentStage={handleAutoPlayCurrentStage}
        onAutoPlayFullWorld={handleAutoPlayFullWorld}
        onUpdateGenerationSettings={(updates) =>
          persistWorldUpdate((prev) => ({
            ...prev,
            generationSettings: { ...prev.generationSettings, ...updates },
          }))
        }
        onSetGenerateIntoNewWorld={setGenerateIntoNewWorld}
      />

      {/* Studio Game Setup Wizard Modal */}
      <GameSetupWizardModal
        isOpen={showSetupWizardModal}
        world={world}
        onClose={() => setShowSetupWizardModal(false)}
        onApplySetup={({ name, generationSettings: gen, deckConfig: dc, players: pl, newMap }) => {
          persistWorldUpdate((prev) => {
            const nextWorld = {
              ...prev,
              name,
              generationSettings: gen,
              deckConfig: dc,
              players: pl,
              currentStage: 'genesis' as StageId,
              drawHistory: [],
              snapshots: [],
            }
            if (newMap) {
              nextWorld.map = {
                ...nextWorld.map,
                // re-seed initial geography
              }
            }
            return nextWorld
          })
          setDeck(rebuildDeck())
          setDrawnCard(null)
          setTurnPhase('await_draw')
        }}
      />

      {/* World Manager Modal */}
      <WorldManagerModal
        isOpen={showWorldManager}
        activeWorld={world}
        savedWorlds={savedWorlds}
        onClose={() => setShowWorldManager(false)}
        onSelectWorld={(selected) => {
          setActiveWorldId(selected.id)
          setWorld(selected)
          setDeck(buildShuffledDeck(selected.deckConfig))
          setDrawnCard(null)
          setPowerData(null)
        }}
        onCreateWorld={(name, options?: CreateWorldOptions) => {
          let created = createNewWorld(name)
          if (options?.geographyPreset) {
            created.generationSettings.geographyPreset = options.geographyPreset
          }
          if (options?.seed) {
            created.generationSettings.seed = `realm-${options.seed}`
          }
          if (options?.autoGenerate) {
            created = autoPlayFullWorld(created, created.generationSettings.turnsPerStage ?? 8)
          }
          const saved = saveWorld(created)
          setActiveWorldId(saved.id)
          setWorld(saved)
          setSavedWorlds(listSavedWorlds())
          setDeck(buildShuffledDeck(saved.deckConfig))
        }}
        onRenameWorld={(newName) => persistWorldUpdate((prev) => ({ ...prev, name: newName }))}
        onDeleteWorld={(worldId) => {
          deleteWorld(worldId)
          const nextActive = getActiveWorld()
          setWorld(nextActive)
          setSavedWorlds(listSavedWorlds())
          setDeck(buildShuffledDeck(nextActive.deckConfig))
        }}
        onDuplicateWorld={handleDuplicateWorld}
        onToggleLockWorld={handleToggleLockWorld}
      />

      {/* Stage Deck Complete Modal */}
      {showDeckEmptyDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" role="dialog">
          <div className="card p-6 max-w-md w-full space-y-4">
            <h3 className="text-xl font-bold">Stage Deck Complete</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All cards in this stage deck have been drawn! Would you like to advance to the next Age of history or reshuffle the current deck?
            </p>
            <div className="flex gap-2.5">
              {getNextStage(currentStage) && (
                <button
                  type="button"
                  onClick={handleProgressToNextStage}
                  className="btn-primary flex-1 text-xs py-2 font-bold"
                >
                  Advance to {STAGES.find((s) => s.id === getNextStage(currentStage))?.name}
                </button>
              )}
              <button
                type="button"
                onClick={handleReshuffleDeck}
                className="btn-outline flex-1 text-xs py-2"
              >
                Reshuffle Deck
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
