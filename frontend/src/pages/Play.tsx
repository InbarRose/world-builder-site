import { useState, useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
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
  FileText,
  Sparkles,
  FastForward,
  Compass,
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
  STAGE_POWERS,
  STAGE_PRE_SETUP,
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
  const [searchParams, setSearchParams] = useSearchParams()
  const [world, setWorld] = useState<WorldState>(() => getActiveWorld())
  const [savedWorlds, setSavedWorlds] = useState<WorldState[]>(() => listSavedWorlds())

  const urlMode = searchParams.get('mode')
  const [gameMode, setGameMode] = useState<GameMode>(() => {
    if (urlMode === 'companion' || urlMode === 'studio' || urlMode === 'free-create') {
      return urlMode
    }
    return world.gameMode || 'studio'
  })

  // Focused Workspace Views (No 3000px vertical stacking!)
  const [activeTab, setActiveTab] = useState<StudioTab>(() =>
    gameMode === 'free-create' ? 'map' : 'cards'
  )
  const [splitRightPanel, setSplitRightPanel] = useState<'map' | 'entities' | 'timeline'>('map')

  // Shared Wiki Selection State (Map Tile <-> Codex Entity <-> Timeline Event)
  const [selectedTileId, setSelectedTileId] = useState<string>('10,6')
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)

  // 3.1 Companion Mode Optional Toggleable Panels (All Collapsible & Independent)
  const [companionShowEventLog, setCompanionShowEventLog] = useState(false)
  const [companionShowCodex, setCompanionShowCodex] = useState(false)
  const [companionShowMap, setCompanionShowMap] = useState(false)
  const [companionShowPlayers, setCompanionShowPlayers] = useState(false)
  const [companionShowStageRules, setCompanionShowStageRules] = useState(false)
  const [companionNote, setCompanionNote] = useState('')
  const [companionTileTag, setCompanionTileTag] = useState('')
  const [companionEntityTag, setCompanionEntityTag] = useState('')

  const [deck, setDeck] = useState<Card[]>([])
  const [drawnCard, setDrawnCard] = useState<Card | null>(null)
  const [powerData, setPowerData] = useState<PowerData | null>(null)

  // Turn state machine & Activity Basket for 3.2 Studio Mode
  const [turnPhase, setTurnPhase] = useState<TurnPhase>('await_draw')
  const [pendingNote, setPendingNote] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<StageActionPreset | null>(null)
  const [showTurnVerifyDialog, setShowTurnVerifyDialog] = useState(false)
  const [turnModifiedTiles, setTurnModifiedTiles] = useState<string[]>([])
  const [turnModifiedEntities, setTurnModifiedEntities] = useState<string[]>([])

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

  // Sync URL ?mode= param if navigated from Home Launchpad
  useEffect(() => {
    const paramMode = searchParams.get('mode')
    if (
      (paramMode === 'companion' || paramMode === 'studio' || paramMode === 'free-create') &&
      paramMode !== gameMode
    ) {
      setGameMode(paramMode)
      if (paramMode === 'free-create' && activeTab === 'cards') {
        setActiveTab('map')
      }
    }
  }, [searchParams, gameMode, activeTab])

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
    setSearchParams({ mode: newMode }, { replace: true })
    if (newMode === 'free-create' && activeTab === 'cards') {
      setActiveTab('map')
    } else if (newMode === 'studio' && activeTab === 'map' && drawHistory.length === 0) {
      setActiveTab('cards')
    }
    persistWorldUpdate((prev) => ({
      ...prev,
      gameMode: newMode,
      companionMode: newMode === 'companion' ? 'companion-tracker' : 'full-studio',
    }))
  }

  // Bi-Directional Wiki Navigation Helpers
  const handleNavigateToTile = (tileId: string) => {
    setSelectedTileId(tileId)
    if (gameMode === 'companion') {
      setCompanionShowMap(true)
    } else if (activeTab === 'split') {
      setSplitRightPanel('map')
    } else {
      setActiveTab('map')
    }
  }

  const handleNavigateToEntity = (entityId: string) => {
    setSelectedEntityId(entityId)
    if (gameMode === 'companion') {
      setCompanionShowCodex(true)
    } else if (activeTab === 'split') {
      setSplitRightPanel('entities')
    } else {
      setActiveTab('entities')
    }
  }

  const handleNavigateToEvent = () => {
    if (gameMode === 'companion') {
      setCompanionShowEventLog(true)
    } else if (activeTab === 'split') {
      setSplitRightPanel('timeline')
    } else {
      setActiveTab('timeline')
    }
  }

  // Track Map Edits and attribute to Current Studio Turn if active
  const handleWorkspaceMapChange = (newMap: MapState) => {
    const changedTileIds: string[] = []
    for (const [tid, nextTile] of Object.entries(newMap.tiles)) {
      const prevTile = world.map.tiles[tid]
      if (prevTile !== nextTile) {
        changedTileIds.push(tid)
      }
    }

    if (gameMode === 'studio' && turnPhase === 'action_select' && changedTileIds.length > 0) {
      setTurnModifiedTiles((prev) => Array.from(new Set([...prev, ...changedTileIds])))
    }

    persistWorldUpdate((prev) => {
      const nextHistory = [...prev.drawHistory]
      // In Studio mode during an active turn, automatically record edited tiles onto the current turn record!
      if (
        prev.gameMode !== 'companion' &&
        turnPhase === 'action_select' &&
        nextHistory.length > 0 &&
        changedTileIds.length > 0
      ) {
        const lastIdx = nextHistory.length - 1
        const lastRec = { ...nextHistory[lastIdx] }
        lastRec.linkedTileIds = Array.from(
          new Set([...(lastRec.linkedTileIds || []), ...changedTileIds])
        )
        nextHistory[lastIdx] = lastRec
      }
      return {
        ...prev,
        map: newMap,
        drawHistory: nextHistory,
      }
    })
  }

  // Track Codex Entity Additions/Edits and attribute to Current Studio Turn if active
  const handleWorkspaceEntitiesChange = (newEntities: WorldEntity[]) => {
    const prevIds = new Set(world.entities.map((e) => e.id))
    const addedIds = newEntities.filter((e) => !prevIds.has(e.id)).map((e) => e.id)

    if (gameMode === 'studio' && turnPhase === 'action_select' && addedIds.length > 0) {
      setTurnModifiedEntities((prev) => Array.from(new Set([...prev, ...addedIds])))
    }

    persistWorldUpdate((prev) => {
      const nextHistory = [...prev.drawHistory]
      if (
        prev.gameMode !== 'companion' &&
        turnPhase === 'action_select' &&
        nextHistory.length > 0 &&
        addedIds.length > 0
      ) {
        const lastIdx = nextHistory.length - 1
        const lastRec = { ...nextHistory[lastIdx] }
        lastRec.linkedEntityIds = Array.from(
          new Set([...(lastRec.linkedEntityIds || []), ...addedIds])
        )
        nextHistory[lastIdx] = lastRec
      }
      return {
        ...prev,
        entities: newEntities,
        drawHistory: nextHistory,
      }
    })
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
    setTurnModifiedTiles([])
    setTurnModifiedEntities([])
    setCompanionNote('')
    setCompanionTileTag('')
    setCompanionEntityTag('')

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

  // Save Optional Note / Connections to Current Companion Turn
  const handleSaveCompanionTurnNote = () => {
    if (drawHistory.length === 0) return
    persistWorldUpdate((prev) => {
      const lastIdx = prev.drawHistory.length - 1
      if (lastIdx < 0) return prev
      const rec = { ...prev.drawHistory[lastIdx] }
      if (companionNote.trim()) {
        rec.note = companionNote.trim()
      }
      if (companionTileTag.trim()) {
        rec.linkedTileIds = Array.from(
          new Set([...(rec.linkedTileIds || []), companionTileTag.trim()])
        )
      }
      if (companionEntityTag) {
        rec.linkedEntityIds = Array.from(
          new Set([...(rec.linkedEntityIds || []), companionEntityTag])
        )
      }
      const nextHistory = [...prev.drawHistory]
      nextHistory[lastIdx] = rec
      return {
        ...prev,
        drawHistory: nextHistory,
      }
    })
    setCompanionNote('')
    setCompanionTileTag('')
    setCompanionEntityTag('')
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

      const nextTiles = { ...prev.map.tiles }
      const nextEntities = [...prev.entities]

      // Apply preset to selected/inspected land tile if selected
      if (selectedPreset) {
        let coordStr = selectedTileId
        if (!nextTiles[coordStr] || nextTiles[coordStr].terrain === 'ocean') {
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
          const target = candidates[0] || {
            col: Math.floor(prev.map.width / 2),
            row: Math.floor(prev.map.height / 2),
          }
          coordStr = getTileId(target.col, target.row)
        }

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
          record.linkedTileIds = Array.from(
            new Set([...(record.linkedTileIds || []), coordStr, ...turnModifiedTiles])
          )
        }
      } else if (turnModifiedTiles.length > 0) {
        record.linkedTileIds = Array.from(
          new Set([...(record.linkedTileIds || []), ...turnModifiedTiles])
        )
      }

      if (turnModifiedEntities.length > 0) {
        record.linkedEntityIds = Array.from(
          new Set([...(record.linkedEntityIds || []), ...turnModifiedEntities])
        )
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
    setTurnModifiedTiles([])
    setTurnModifiedEntities([])

    if (deck.length === 0) {
      setShowDeckEmptyDialog(true)
    }
  }

  // Undo Last Turn
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
    setTurnModifiedTiles([])
    setTurnModifiedEntities([])
  }

  const handleAutoStepOneTurn = () => {
    if (world.isLocked) return
    const currentDeck = deck.length > 0 ? [...deck] : rebuildDeck()
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
    const defaultRole =
      idx === 0 ? 'Artist' : idx === 1 ? 'Historian' : idx === 2 ? 'Keeper' : 'Player'
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
  const latestTurnRecord =
    drawHistory.length > 0 ? drawHistory[drawHistory.length - 1] : undefined

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* =========================================================================
          1. LEVEL 1: UNIFIED PLAY WORKSPACE HEADER
          ========================================================================= */}
      <header className="no-print card p-3.5 sm:p-4 space-y-3 border-border/80 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: World Identity & Stage Badge */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setShowWorldManager(true)}
              className="p-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary shrink-0 shadow-inner transition-colors"
              title="Switch or Manage Saved Worlds"
            >
              <Globe className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-lg sm:text-xl font-bold truncate tracking-tight">
                  {world.name}
                </span>
                {currentStageData && gameMode !== 'free-create' && (
                  <button
                    type="button"
                    onClick={() => setShowAgesModal(true)}
                    className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary/15 hover:bg-primary/25 text-primary font-bold transition-colors"
                    title="Click to switch Stage or inspect all 4 Ages"
                  >
                    Age {currentStageData.number}/4: {currentStageData.name}
                  </button>
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

          {/* Center: 3-Mode Switcher (3.1 Companion, 3.2 Studio, 3.3 Freeform) */}
          <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border text-xs font-semibold shadow-inner">
            <button
              type="button"
              onClick={() => handleModeChange('companion')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                gameMode === 'companion'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="3.1 Play Companion: Tactile card draw, stage tracker, and optional manual panels"
            >
              <span>🃏 Companion</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('studio')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                gameMode === 'studio'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="3.2 Studio Mode: Guided turn-by-turn campaign with automatic turn activity tracking and Bot Auto-Play"
            >
              <span>🏆 Studio</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('free-create')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                gameMode === 'free-create'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="3.3 Freeform Sandbox: Create maps, codex wiki entries, and lore without cards"
            >
              <span>🎨 Free-Create</span>
            </button>
          </div>

          {/* Right: Contextual Utility Controls */}
          <div className="flex flex-wrap items-center gap-1.5">
            {activePlayer && gameMode !== 'free-create' && (
              <button
                type="button"
                onClick={() => setShowPlayersModal(true)}
                className="text-[11px] px-2.5 py-1 rounded-full text-white font-medium flex items-center gap-1 shadow-sm hover:opacity-90"
                style={{ backgroundColor: activePlayer.color }}
                title="Active Player Seat (Click to configure roster)"
              >
                <span>
                  {activePlayer.name} ({activePlayer.role})
                </span>
                {activePlayer.isBot && (
                  <span>· {BOT_PERSONALITIES[activePlayer.personality]?.icon}</span>
                )}
              </button>
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

        {/* =====================================================================
            SUB-NAVIGATION BAR FOR STUDIO (3.2) & FREEFORM (3.3)
            ===================================================================== */}
        {gameMode !== 'companion' && (
          <nav
            className="flex items-center gap-1.5 pt-2 border-t border-border/60 overflow-x-auto"
            role="tablist"
            aria-label="Studio Workspace Tabs"
          >
            {gameMode === 'studio' && (
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
            )}

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
              {turnModifiedTiles.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                  +{turnModifiedTiles.length}
                </span>
              )}
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
              {turnModifiedEntities.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                  +{turnModifiedEntities.length}
                </span>
              )}
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
              <span>Historian · Timeline ({drawHistory.length})</span>
            </button>

            {gameMode === 'studio' && (
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
                <span>Side-by-Side Studio</span>
              </button>
            )}

            <div className="ml-auto flex items-center gap-2 shrink-0">
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
          2. AREA 3.1: PLAY COMPANION MODE (Digital Tabletop & Optional Panels)
          ========================================================================= */}
      {gameMode === 'companion' && (
        <main className="space-y-4">
          {/* Simple Stage Tracker & Optional Panel Toggle Bar */}
          <div className="card p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 bg-card border-border/80">
            {/* Direct 4-Stage Tracker Switcher */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
                Stage:
              </span>
              {STAGES.map((st) => {
                const isAct = st.id === currentStage
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleStageChange(st.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isAct
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    {st.number}. {st.name}
                  </button>
                )
              })}
            </div>

            {/* Optional Toggleable Panels (Off by default, available whenever the user wants) */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-muted-foreground font-semibold mr-1 hidden xl:inline">
                Optional Panels:
              </span>
              <button
                type="button"
                onClick={() => setCompanionShowStageRules((v) => !v)}
                className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 transition-colors ${
                  companionShowStageRules
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Stage Rules</span>
              </button>
              <button
                type="button"
                onClick={() => setCompanionShowEventLog((v) => !v)}
                className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 transition-colors ${
                  companionShowEventLog
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Event Log ({drawHistory.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setCompanionShowCodex((v) => !v)}
                className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 transition-colors ${
                  companionShowCodex
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Codex ({world.entities.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setCompanionShowMap((v) => !v)}
                className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 transition-colors ${
                  companionShowMap
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <MapIcon className="h-3.5 w-3.5" />
                <span>Map</span>
              </button>
              <button
                type="button"
                onClick={() => setCompanionShowPlayers((v) => !v)}
                className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 transition-colors ${
                  companionShowPlayers
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Players ({players.length})</span>
              </button>
            </div>
          </div>

          {/* Optional Panel: Multiplayer Turn & Role Tracker */}
          {companionShowPlayers && (
            <div className="card p-4 border-primary/30 bg-primary/[0.02] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Tabletop Seats:
                </span>
                {players.map((seat, idx) => {
                  const isCurrent = idx === currentPlayerIndex % players.length
                  return (
                    <button
                      key={seat.id}
                      type="button"
                      onClick={() =>
                        persistWorldUpdate((prev) => ({
                          ...prev,
                          currentPlayerIndex: idx,
                        }))
                      }
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                        isCurrent
                          ? 'ring-2 ring-primary font-bold shadow-sm'
                          : 'opacity-75 hover:opacity-100'
                      }`}
                      style={{
                        borderColor: seat.color,
                        backgroundColor: isCurrent ? seat.color : 'transparent',
                        color: isCurrent ? '#fff' : undefined,
                      }}
                    >
                      <span>{seat.name}</span>
                      <span className="text-[10px] opacity-85">({seat.role})</span>
                    </button>
                  )
                })}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    persistWorldUpdate((prev) => ({
                      ...prev,
                      currentPlayerIndex:
                        prev.players.length > 0
                          ? (prev.currentPlayerIndex + 1) % prev.players.length
                          : 0,
                    }))
                  }
                  className="btn-outline px-3 py-1 text-xs font-semibold"
                >
                  Pass Turn →
                </button>
                <button
                  type="button"
                  onClick={() => setShowPlayersModal(true)}
                  className="btn-outline px-3 py-1 text-xs"
                >
                  Edit Roster
                </button>
              </div>
            </div>
          )}

          {/* Optional Panel: Active Stage Suit & Abilities Reference */}
          {companionShowStageRules && currentStageData && (
            <div className="card p-4 border-primary/30 bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-primary">
                    Stage {currentStageData.number}: {currentStageData.name} ({currentStageData.eraLabel})
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <strong>Pre-Stage Setup:</strong> {STAGE_PRE_SETUP[currentStage]}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAgesModal(true)}
                  className="btn-outline px-2.5 py-1 text-xs"
                >
                  Full 4-Ages Matrix
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                {Object.entries(STAGE_POWERS[currentStage] || {}).map(([suit, p]) => (
                  <div
                    key={suit}
                    className="p-2.5 rounded-lg border border-border bg-card flex items-center gap-2"
                  >
                    <span
                      className={`text-xl font-black ${
                        suit === '♥' || suit === '♦' ? 'text-red-600' : ''
                      }`}
                    >
                      {suit}
                    </span>
                    <div>
                      <div className="font-bold text-primary uppercase">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        2–10 Normal · J/Q/K Fantastical
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Core Companion Centerpiece: Card Deck & Active Stage Power */}
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
                    <div className={`text-5xl font-extrabold ${color}`}>
                      {drawnCard.value}
                    </div>
                  )}
                  {drawnCard.value !== JOKER && (
                    <>
                      <div
                        className={`absolute bottom-3 right-4 text-2xl font-black ${color} rotate-180`}
                      >
                        {drawnCard.value}
                      </div>
                      <div
                        className={`absolute bottom-9 right-4 text-xl ${color} rotate-180`}
                      >
                        {drawnCard.suit}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-full max-w-[220px] aspect-[5/7] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center p-4 text-center text-muted-foreground bg-muted/20">
                  <span className="text-5xl mb-2">🃏</span>
                  <span className="font-semibold text-sm">Draw a Card to Begin</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {deck.length} cards in deck
                  </span>
                </div>
              )}
            </div>

            {/* Right: Companion Power & Optional Turn Event Recorder */}
            <div className="w-full md:w-7/12 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    Stage {currentStageData?.number}: {currentStageData?.name}
                  </span>
                  <h2 className="text-2xl font-black">
                    {powerData?.power || 'Draw to Reveal Stage Power'}
                  </h2>
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

              {/* Optional Quick Event/Activity Scratchpad for Current Draw */}
              {drawnCard && latestTurnRecord && (
                <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground block">
                    Optional Turn #{latestTurnRecord.moveId} Activity / Event Note (Freeform):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="text"
                      value={companionNote}
                      onChange={(e) => setCompanionNote(e.target.value)}
                      placeholder="Record what happened on this turn (optional)..."
                      className="input h-8 text-xs flex-1 min-w-[180px]"
                    />
                    <input
                      type="text"
                      value={companionTileTag}
                      onChange={(e) => setCompanionTileTag(e.target.value)}
                      placeholder="Tile (col,row)"
                      className="input h-8 text-xs w-24"
                    />
                    {world.entities.length > 0 && (
                      <select
                        value={companionEntityTag}
                        onChange={(e) => setCompanionEntityTag(e.target.value)}
                        className="input h-8 text-xs py-0 w-36"
                      >
                        <option value="">Link Codex...</option>
                        {world.entities.map((ent) => (
                          <option key={ent.id} value={ent.id}>
                            {ent.icon} {ent.name}
                          </option>
                        ))}
                      </select>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveCompanionTurnNote}
                      className="btn-outline h-8 px-3 text-xs font-semibold"
                    >
                      Save Note
                    </button>
                  </div>
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

                {drawHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={handleUndoLastTurn}
                    disabled={world.isLocked}
                    className="btn-outline px-4 py-3 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                    <span>Undo Draw</span>
                  </button>
                )}

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

          {/* Optional Toggleable Companion Panels */}
          {companionShowMap && (
            <section className="space-y-2">
              <MapCanvas
                map={world.map}
                worldName={world.name}
                drawHistory={world.drawHistory}
                entities={world.entities}
                selectedTileId={selectedTileId}
                onSelectTile={setSelectedTileId}
                onSelectEntity={handleNavigateToEntity}
                onSelectEvent={handleNavigateToEvent}
                onChange={handleWorkspaceMapChange}
                initialViewOnly={false}
              />
            </section>
          )}

          {companionShowCodex && (
            <section className="space-y-2">
              <EntityRegistry
                entities={world.entities}
                currentStage={currentStage}
                drawHistory={world.drawHistory}
                map={world.map}
                selectedEntityId={selectedEntityId}
                onSelectEntity={setSelectedEntityId}
                onSelectTile={handleNavigateToTile}
                onSelectEvent={handleNavigateToEvent}
                onChange={handleWorkspaceEntitiesChange}
              />
            </section>
          )}

          {companionShowEventLog && (
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
                onAddCustomRecord={(newRec) =>
                  persistWorldUpdate((prev) => ({
                    ...prev,
                    drawHistory: [...prev.drawHistory, newRec],
                  }))
                }
                onSelectTile={handleNavigateToTile}
                onSelectEntity={handleNavigateToEntity}
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
          3. AREA 3.2 (STUDIO MODE) & AREA 3.3 (FREEFORM SANDBOX)
          ========================================================================= */}
      {gameMode !== 'companion' && (
        <main className="space-y-4">
          {/* Active Studio Turn Context Banner when viewing Map or Codex mid-turn */}
          {gameMode === 'studio' &&
            turnPhase === 'action_select' &&
            drawnCard &&
            activeTab !== 'cards' &&
            activeTab !== 'split' && (
              <div className="card p-3 border-primary bg-primary/5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-primary text-primary-foreground font-bold">
                    Active Turn #{drawHistory.length}
                  </span>
                  <span className="font-bold">
                    [{drawnCard.value}
                    {drawnCard.suit}] {powerData?.power}
                  </span>
                  <span className="text-muted-foreground">
                    — Any map tiles or codex entries you edit/add are automatically recorded for this turn!
                  </span>
                  {(turnModifiedTiles.length > 0 || turnModifiedEntities.length > 0) && (
                    <span className="font-semibold text-primary">
                      ({turnModifiedTiles.length} tile(s), {turnModifiedEntities.length} codex entry(s) logged)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('cards')}
                    className="btn-outline px-2.5 py-1 text-xs"
                  >
                    Back to Card
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmTurnChronicle}
                    className="btn-primary px-3 py-1 text-xs font-bold flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Complete & Pass Turn</span>
                  </button>
                </div>
              </div>
            )}

          {/* Freeform Mode Intro Bar */}
          {gameMode === 'free-create' && (
            <div className="card p-3 bg-muted/30 border-border/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-primary" />
                <span className="font-bold">Freeform World Sandbox</span>
                <span className="text-muted-foreground">
                  Sculpt your map, build your interconnected Codex wiki, and log custom events without drawing cards.
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {STAGES.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleStageChange(st.id)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      currentStage === st.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border border-border text-muted-foreground'
                    }`}
                  >
                    Era: {st.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* =================================================================
              VIEW 1: TURN & DECK ENGINE (Studio Mode Focused View or Left Split)
              ================================================================= */}
          {gameMode === 'studio' && (activeTab === 'cards' || activeTab === 'split') && (
            <div
              className={
                activeTab === 'split'
                  ? 'grid grid-cols-1 lg:grid-cols-12 gap-5 items-start'
                  : 'space-y-4'
              }
            >
              <section
                className={activeTab === 'split' ? 'lg:col-span-5 space-y-4' : 'space-y-4'}
              >
                {/* Studio Turn Flow & Bot Auto-Play Controller Bar */}
                <div className="card p-4 flex flex-wrap items-center justify-between gap-3 bg-card border-border/80">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDrawCard}
                      disabled={
                        deck.length === 0 ||
                        world.isLocked ||
                        (gameMode === 'studio' && turnPhase === 'action_select')
                      }
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
                      title="Simulate 1 Bot Turn automatically"
                    >
                      <Bot className="h-3.5 w-3.5 text-primary" />
                      <span>Auto-Step Turn</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAutoPlayCurrentStage}
                      disabled={world.isLocked}
                      className="btn-outline flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold"
                      title="Auto-Play remaining turns in current Stage"
                    >
                      <FastForward className="h-3.5 w-3.5 text-primary" />
                      <span className="hidden sm:inline">Auto-Stage</span>
                    </button>

                    {drawHistory.length > 0 && (
                      <button
                        type="button"
                        onClick={handleUndoLastTurn}
                        disabled={world.isLocked}
                        className="btn-outline flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                        title="Undo the last turn and restore previous state"
                      >
                        <Undo2 className="h-3.5 w-3.5" />
                        <span>Undo</span>
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
                  <div className="flex items-center gap-2 text-xs font-medium bg-muted/50 px-3 py-1.5 rounded-xl border border-border">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        turnPhase === 'await_draw'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      1. Draw
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        turnPhase === 'action_select'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      2. Act & Record
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="px-2 py-0.5 rounded text-muted-foreground font-bold">
                      3. Pass Turn
                    </span>
                  </div>
                </div>

                {/* Turn Chronicle Card & Power Resolution Grid */}
                <div
                  className={
                    activeTab === 'split'
                      ? 'space-y-4'
                      : 'grid grid-cols-1 lg:grid-cols-12 gap-4'
                  }
                >
                  {/* Card Visual */}
                  <div
                    className={`${
                      activeTab === 'split' ? '' : 'lg:col-span-4'
                    } card p-6 flex flex-col items-center justify-center min-h-[240px]`}
                  >
                    {drawnCard ? (
                      <div
                        className={`w-full max-w-[180px] aspect-[5/7] ${bgColor} rounded-xl border-4 border-gray-300 dark:border-gray-600 shadow-xl flex flex-col items-center justify-center p-5 relative select-none`}
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
                          <div className={`text-4xl font-black ${color}`}>
                            {drawnCard.value}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-6 space-y-2">
                        <div className="text-5xl">🃏</div>
                        <p className="text-sm font-semibold">Tap "Draw Card" to Begin</p>
                        <p className="text-xs">
                          {deck.length} cards remaining in {currentStageData?.name || 'stage'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Power Prompt, Turn Activity Basket & Event Resolution */}
                  <div
                    className={`${
                      activeTab === 'split' ? '' : 'lg:col-span-8'
                    } card p-6 flex flex-col justify-between space-y-4`}
                  >
                    {drawnCard && powerData ? (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                              Stage {currentStageData?.number}: {currentStageData?.name} (
                              {currentStageData?.eraLabel})
                            </span>
                            <h2 className="text-xl sm:text-2xl font-bold mt-0.5">
                              {isFantastical && powerData.fantasticalDescription
                                ? 'Fantastical '
                                : ''}
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
                            <span className="font-bold text-muted-foreground block mb-1">
                              Rule Prompt:
                            </span>
                            <p className="leading-relaxed">
                              {isFantastical && powerData.fantasticalDescription
                                ? powerData.fantasticalDescription
                                : powerData.description}
                            </p>
                          </div>
                          <div>
                            <span className="font-bold text-muted-foreground block mb-1">
                              Inspiration:
                            </span>
                            <p className="text-muted-foreground leading-relaxed">
                              {powerData.examples}
                            </p>
                          </div>
                        </div>

                        {/* Optional Action Presets Chips */}
                        {availableActionPresets.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-muted-foreground">
                                Choose a Preset Action (Applies to Tile {selectedTileId}) OR Edit Map/Codex Directly:
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {availableActionPresets.map((preset) => {
                                const isSelected = selectedPreset?.id === preset.id
                                return (
                                  <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() =>
                                      setSelectedPreset(isSelected ? null : preset)
                                    }
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

                        {/* Live Turn Activity Basket (Shows Map Tiles & Codex Entries touched this turn) */}
                        <div className="p-3 rounded-xl bg-primary/[0.03] border border-primary/25 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-primary flex items-center gap-1">
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>Turn #{drawHistory.length} Activity Recorded:</span>
                            </span>
                            {selectedPreset && (
                              <span className="px-2 py-0.5 rounded bg-primary/15 text-primary font-semibold">
                                {selectedPreset.icon} {selectedPreset.name} @ ({selectedTileId})
                              </span>
                            )}
                            {turnModifiedTiles.map((tid) => (
                              <span
                                key={tid}
                                className="px-2 py-0.5 rounded bg-background border border-border font-mono"
                              >
                                🗺️ ({tid})
                              </span>
                            ))}
                            {turnModifiedEntities.map((eid) => {
                              const ent = world.entities.find((e) => e.id === eid)
                              return ent ? (
                                <span
                                  key={eid}
                                  className="px-2 py-0.5 rounded bg-background border border-border font-semibold"
                                >
                                  {ent.icon} {ent.name}
                                </span>
                              ) : null
                            })}
                            {!selectedPreset &&
                              turnModifiedTiles.length === 0 &&
                              turnModifiedEntities.length === 0 && (
                                <span className="text-muted-foreground italic">
                                  Pick a preset above, or open Map / Codex to make changes for this turn.
                                </span>
                              )}
                          </div>
                          {activeTab !== 'split' && (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setActiveTab('map')}
                                className="btn-outline px-2.5 py-1 text-[11px]"
                              >
                                🗺️ Edit Map
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveTab('entities')}
                                className="btn-outline px-2.5 py-1 text-[11px]"
                              >
                                📚 Add Codex
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Turn Note & Chronicle Action */}
                        <div className="space-y-2 pt-2 border-t border-border">
                          <label className="text-xs font-semibold text-muted-foreground block">
                            Turn #{drawHistory.length} Event Chronicle Note:
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <input
                              type="text"
                              value={pendingNote}
                              onChange={(e) => setPendingNote(e.target.value)}
                              placeholder="Describe what occurred in the world on this turn..."
                              className="input flex-1 text-xs h-9 min-w-[200px]"
                            />
                            <button
                              type="button"
                              onClick={handleConfirmTurnChronicle}
                              className="btn-primary px-4 h-9 text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Complete & Pass Turn</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowTurnVerifyDialog(true)}
                              className="btn-outline px-3 h-9 text-xs shrink-0"
                            >
                              Verify Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8 space-y-2">
                        <p className="font-medium">
                          Draw a card to reveal its stage power, or use Auto-Play to simulate bot turns.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Compact Recent Turn Log on Cards Tab (Avoids 3000px stack while keeping turn visibility) */}
                {activeTab === 'cards' && drawHistory.length > 0 && (
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
                    onSelectTile={handleNavigateToTile}
                    onSelectEntity={handleNavigateToEntity}
                    onClearHistory={() =>
                      persistWorldUpdate((prev) => ({
                        ...prev,
                        drawHistory: [],
                        snapshots: [],
                      }))
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
                )}
              </section>

              {/* Right Column in Side-by-Side Split Studio Mode */}
              {activeTab === 'split' && (
                <section className="lg:col-span-7 space-y-3">
                  <div className="card p-2.5 flex items-center justify-between gap-2 bg-muted/40">
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setSplitRightPanel('map')}
                        className={`px-3 py-1 rounded-md transition-colors ${
                          splitRightPanel === 'map'
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                        }`}
                      >
                        🗺️ World Map
                      </button>
                      <button
                        type="button"
                        onClick={() => setSplitRightPanel('entities')}
                        className={`px-3 py-1 rounded-md transition-colors ${
                          splitRightPanel === 'entities'
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                        }`}
                      >
                        📚 Codex Wiki ({world.entities.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setSplitRightPanel('timeline')}
                        className={`px-3 py-1 rounded-md transition-colors ${
                          splitRightPanel === 'timeline'
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                        }`}
                      >
                        📜 Chronicle ({drawHistory.length})
                      </button>
                    </div>
                  </div>

                  {splitRightPanel === 'map' && (
                    <MapCanvas
                      map={world.map}
                      worldName={world.name}
                      drawHistory={world.drawHistory}
                      entities={world.entities}
                      selectedTileId={selectedTileId}
                      onSelectTile={setSelectedTileId}
                      onSelectEntity={handleNavigateToEntity}
                      onSelectEvent={handleNavigateToEvent}
                      onChange={handleWorkspaceMapChange}
                      initialViewOnly={false}
                    />
                  )}
                  {splitRightPanel === 'entities' && (
                    <EntityRegistry
                      entities={world.entities}
                      currentStage={currentStage}
                      drawHistory={world.drawHistory}
                      map={world.map}
                      selectedEntityId={selectedEntityId}
                      onSelectEntity={setSelectedEntityId}
                      onSelectTile={handleNavigateToTile}
                      onSelectEvent={handleNavigateToEvent}
                      onChange={handleWorkspaceEntitiesChange}
                    />
                  )}
                  {splitRightPanel === 'timeline' && (
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
                      onSelectTile={handleNavigateToTile}
                      onSelectEntity={handleNavigateToEntity}
                      onClearHistory={() =>
                        persistWorldUpdate((prev) => ({
                          ...prev,
                          drawHistory: [],
                          snapshots: [],
                        }))
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
                  )}
                </section>
              )}
            </div>
          )}

          {/* =================================================================
              VIEW 2: WORLD ATLAS (Dedicated Focused View)
              ================================================================= */}
          {activeTab === 'map' && (
            <section className="space-y-2">
              <MapCanvas
                map={world.map}
                worldName={world.name}
                drawHistory={world.drawHistory}
                entities={world.entities}
                selectedTileId={selectedTileId}
                onSelectTile={setSelectedTileId}
                onSelectEntity={handleNavigateToEntity}
                onSelectEvent={handleNavigateToEvent}
                onChange={handleWorkspaceMapChange}
                initialViewOnly={false}
              />
            </section>
          )}

          {/* =================================================================
              VIEW 3: KEEPER CODEX WIKI (Dedicated Focused View)
              ================================================================= */}
          {activeTab === 'entities' && (
            <section className="space-y-2">
              <EntityRegistry
                entities={world.entities}
                currentStage={currentStage}
                drawHistory={world.drawHistory}
                map={world.map}
                selectedEntityId={selectedEntityId}
                onSelectEntity={setSelectedEntityId}
                onSelectTile={handleNavigateToTile}
                onSelectEvent={handleNavigateToEvent}
                onChange={handleWorkspaceEntitiesChange}
              />
            </section>
          )}

          {/* =================================================================
              VIEW 4: HISTORIAN TIMELINE (Dedicated Focused View)
              ================================================================= */}
          {activeTab === 'timeline' && (
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
                onAddCustomRecord={(newRec) =>
                  persistWorldUpdate((prev) => ({
                    ...prev,
                    drawHistory: [...prev.drawHistory, newRec],
                  }))
                }
                onSelectTile={handleNavigateToTile}
                onSelectEntity={handleNavigateToEntity}
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
          4. LEVEL 4: MODALS & DIALOGS (Progressive Disclosure)
          ========================================================================= */}
      {/* Studio Turn Verification Modal */}
      {showTurnVerifyDialog && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          role="dialog"
        >
          <div className="card p-6 max-w-md w-full space-y-4 shadow-xl border-primary/30">
            <div className="flex items-center gap-2.5 text-primary">
              <AlertCircle className="h-5 w-5" />
              <h3 className="font-bold text-lg">Confirm Turn Chronicle</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to chronicle Turn #{drawHistory.length} and record this event into history? This will advance the tabletop turn to the next player seat.
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
        onApplySetup={({
          name,
          generationSettings: gen,
          deckConfig: dc,
          players: pl,
          newMap,
        }) => {
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
            created = autoPlayFullWorld(
              created,
              created.generationSettings.turnsPerStage ?? 8
            )
          }
          const saved = saveWorld(created)
          setActiveWorldId(saved.id)
          setWorld(saved)
          setSavedWorlds(listSavedWorlds())
          setDeck(buildShuffledDeck(saved.deckConfig))
        }}
        onRenameWorld={(newName) =>
          persistWorldUpdate((prev) => ({ ...prev, name: newName }))
        }
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
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          role="dialog"
        >
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
