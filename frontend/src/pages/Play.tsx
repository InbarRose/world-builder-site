import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  Play as PlayIcon,
  Shuffle,
  X,
  Download,
  Upload,
  RotateCcw,
  ExternalLink,
  HelpCircle,
  Globe,
  Map as MapIcon,
  Clock,
  Users,
  Layers,
  Columns,
  Bot,
  Sparkles,
  UserPlus,
  Trash2,
  FastForward,
  Dices,
} from 'lucide-react'
import {
  BotPersonalityId,
  Card,
  CompanionViewMode,
  DrawRecord,
  GeographyPreset,
  MapState,
  PlayerRole,
  PlayerSeat,
  PowerData,
  StageId,
  WorldEntity,
  WorldState,
} from '../engine/types'
import {
  DEFAULT_CARD_COLORS,
  JOKER,
  SHORT_GAME_DECK_CONFIG,
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
  createNewWorld,
  deleteWorld,
  getActiveWorld,
  listSavedWorlds,
  parseImportedWorld,
  recordTurnSnapshot,
  rewindWorldToMove,
  saveWorld,
  serializeWorld,
  setActiveWorldId,
} from '../engine/storageService'
import {
  autoPlayFullWorld,
  autoPlayStage,
  createSeededRng,
  executeAutomatedTurn,
} from '../engine/autoPlayEngine'
import { BOT_PERSONALITIES, PLAYER_COLORS } from '../engine/presets'
import { MapCanvas } from '../components/MapCanvas'
import { TimelinePanel } from '../components/TimelinePanel'
import { EntityRegistry } from '../components/EntityRegistry'
import { WorldManagerModal } from '../components/WorldManagerModal'

type StudioTab = 'cards' | 'map' | 'timeline' | 'entities' | 'split'

const ROLES: PlayerRole[] = ['Artist', 'Historian', 'Keeper', 'Player']

export function Play() {
  const [world, setWorld] = useState<WorldState>(() => getActiveWorld())
  const [savedWorlds, setSavedWorlds] = useState<WorldState[]>(() => listSavedWorlds())
  const [activeTab, setActiveTab] = useState<StudioTab>('cards')
  const [deck, setDeck] = useState<Card[]>([])
  const [drawnCard, setDrawnCard] = useState<Card | null>(null)
  const [powerData, setPowerData] = useState<PowerData | null>(null)

  const [showDeckEmptyDialog, setShowDeckEmptyDialog] = useState(false)
  const [showRestartDialog, setShowRestartDialog] = useState(false)
  const [showHelpDialog, setShowHelpDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showWorldManager, setShowWorldManager] = useState(false)
  const [showPlayersPanel, setShowPlayersPanel] = useState(false)
  const [showAutoPlayPanel, setShowAutoPlayPanel] = useState(false)
  const [exportFileName, setExportFileName] = useState('')
  const [cardColors, setCardColors] = useState<Record<string, string>>(DEFAULT_CARD_COLORS)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    deckConfig,
    currentStage,
    stageNotes,
    drawHistory,
    players,
    currentPlayerIndex,
    companionMode,
    generationSettings,
  } = world
  const { numberRange, faceCards, aceCount, jokerCount, stagesEnabled } = deckConfig

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
      numberRange,
      faceCards,
      aceCount,
      jokerCount,
    })
  }, [numberRange, faceCards, aceCount, jokerCount])

  useEffect(() => {
    setDeck(rebuildDeck())
  }, [rebuildDeck])

  useEffect(() => {
    if (drawnCard && stagesEnabled) {
      loadPowerData(currentStage, drawnCard).then(setPowerData)
    } else {
      setPowerData(null)
    }
  }, [drawnCard, currentStage, stagesEnabled])

  const handleDrawCard = async () => {
    if (deck.length === 0) {
      setShowDeckEmptyDialog(true)
      return
    }

    const newDeck = [...deck]
    const card = newDeck.pop()!
    setDeck(newDeck)
    setDrawnCard(card)

    // If the active seat is set to Auto-Bot, run the bot's intelligent turn!
    if (activePlayer?.isBot) {
      const rng = createSeededRng(
        `${generationSettings.seed}-${drawHistory.length}-${card.id}`
      )
      persistWorldUpdate((prev) => executeAutomatedTurn(prev, card, rng))
      if (newDeck.length === 0) {
        setShowDeckEmptyDialog(true)
      }
      return
    }

    let power: string | undefined = undefined
    if (stagesEnabled) {
      const data = await loadPowerData(currentStage, card)
      power = data?.power
    }

    const moveId = drawHistory.length + 1
    const record: DrawRecord = {
      id: `draw_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      moveId,
      card,
      timestamp: new Date().toISOString(),
      stage: stagesEnabled ? currentStage : undefined,
      power,
      note: '',
      linkedTileIds: [],
      linkedEntityIds: [],
      epochYear: calculateEpochYear(stagesEnabled ? currentStage : undefined, moveId),
      playerId: activePlayer?.id,
      playerName: activePlayer?.name,
      playerColor: activePlayer?.color,
      isAutoPlayed: false,
    }

    persistWorldUpdate((prev) => {
      const nextPlayerIdx =
        prev.players.length > 0
          ? (prev.currentPlayerIndex + 1) % prev.players.length
          : 0
      const updated: WorldState = {
        ...prev,
        drawHistory: [...prev.drawHistory, record],
        currentPlayerIndex: nextPlayerIdx,
      }
      const snap = recordTurnSnapshot(updated, moveId)
      updated.snapshots = [...(updated.snapshots || []), snap]
      return updated
    })

    if (newDeck.length === 0) {
      setShowDeckEmptyDialog(true)
    }
  }

  const handleAutoStepOneTurn = () => {
    let currentDeck = deck.length > 0 ? [...deck] : rebuildDeck()
    const card = currentDeck.pop()!
    setDeck(currentDeck)
    setDrawnCard(card)

    const rng = createSeededRng(
      `${generationSettings.seed}-step-${drawHistory.length}-${card.id}`
    )
    persistWorldUpdate((prev) => executeAutomatedTurn(prev, card, rng))
  }

  const handleAutoPlayCurrentStage = () => {
    const { world: nextWorld, deck: remainingDeck } = autoPlayStage(world, deck, 12)
    const saved = saveWorld(nextWorld)
    setWorld(saved)
    setSavedWorlds(listSavedWorlds())
    setDeck(remainingDeck)
    if (saved.drawHistory.length > 0) {
      setDrawnCard(saved.drawHistory[saved.drawHistory.length - 1].card)
    }
  }

  const handleAutoPlayFullWorld = () => {
    const simulated = autoPlayFullWorld(world, 8)
    const saved = saveWorld(simulated)
    setWorld(saved)
    setSavedWorlds(listSavedWorlds())
    setDeck(buildShuffledDeck(saved.deckConfig))
    if (saved.drawHistory.length > 0) {
      setDrawnCard(saved.drawHistory[saved.drawHistory.length - 1].card)
    }
  }

  const handleRewindToMove = (targetMoveId: number) => {
    persistWorldUpdate((prev) => rewindWorldToMove(prev, targetMoveId))
    setDeck(rebuildDeck())
  }

  const handleAddPlayerSeat = () => {
    if (players.length >= 6) return
    const idx = players.length
    const defaultRole: PlayerRole =
      idx === 0 ? 'Artist' : idx === 1 ? 'Historian' : idx === 2 ? 'Keeper' : 'Player'
    const personalities: BotPersonalityId[] = [
      'shaper',
      'naturalist',
      'architect',
      'chronicler',
      'catalyst',
      'mythmaker',
    ]
    const newSeat: PlayerSeat = {
      id: `player_${Date.now()}_${idx}`,
      name: `Player ${idx + 1}`,
      color: PLAYER_COLORS[idx % PLAYER_COLORS.length],
      role: defaultRole,
      isBot: false,
      personality: personalities[idx % personalities.length],
    }
    persistWorldUpdate((prev) => ({
      ...prev,
      players: [...prev.players, newSeat],
    }))
  }

  const handleUpdatePlayerSeat = (seatId: string, updates: Partial<PlayerSeat>) => {
    persistWorldUpdate((prev) => ({
      ...prev,
      players: prev.players.map((p) => (p.id === seatId ? { ...p, ...updates } : p)),
    }))
  }

  const handleRemovePlayerSeat = (seatId: string) => {
    if (players.length <= 1) return
    persistWorldUpdate((prev) => {
      const filtered = prev.players.filter((p) => p.id !== seatId)
      return {
        ...prev,
        players: filtered,
        currentPlayerIndex: prev.currentPlayerIndex % filtered.length,
      }
    })
  }

  const handleUpdateRecord = (recordId: string, updates: Partial<DrawRecord>) => {
    persistWorldUpdate((prev) => ({
      ...prev,
      drawHistory: prev.drawHistory.map((r) =>
        r.id === recordId ? { ...r, ...updates } : r
      ),
    }))
  }

  const handleStageNoteChange = (note: string) => {
    persistWorldUpdate((prev) => ({
      ...prev,
      stageNotes: { ...prev.stageNotes, [prev.currentStage]: note },
    }))
  }

  const handleStageChange = (newStage: StageId) => {
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
    }
  }

  const handleReshuffleDeck = () => {
    setDeck(rebuildDeck())
    setDrawnCard(null)
    setPowerData(null)
    setShowDeckEmptyDialog(false)
  }

  const handleRestart = () => {
    const reset = createNewWorld(world.name)
    reset.id = world.id
    const saved = saveWorld(reset)
    setWorld(saved)
    setSavedWorlds(listSavedWorlds())
    setDeck(buildShuffledDeck(saved.deckConfig))
    setDrawnCard(null)
    setPowerData(null)
    setShowRestartDialog(false)
  }

  const handleClearHistory = () => {
    persistWorldUpdate((prev) => ({
      ...prev,
      drawHistory: [],
      snapshots: [],
    }))
  }

  const handleMapChange = (newMap: MapState) => {
    persistWorldUpdate((prev) => ({
      ...prev,
      map: newMap,
    }))
  }

  const handleEntitiesChange = (newEntities: WorldEntity[]) => {
    persistWorldUpdate((prev) => ({
      ...prev,
      entities: newEntities,
    }))
  }

  const handleCompanionModeChange = (mode: CompanionViewMode) => {
    persistWorldUpdate((prev) => ({
      ...prev,
      companionMode: mode,
    }))
    if (mode !== 'full-studio') {
      setActiveTab('cards')
    }
  }

  const handleExportGameState = () => {
    setExportFileName(
      `${world.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}`
    )
    setShowExportDialog(true)
  }

  const handleConfirmExport = () => {
    const blob = new Blob([serializeWorld(world)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = exportFileName.endsWith('.json')
      ? exportFileName
      : `${exportFileName}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setShowExportDialog(false)
    setExportFileName('')
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
    } catch (error) {
      console.error('Error importing world state:', error)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const applyPreset = (preset: 'all' | 'short') => {
    if (preset === 'all') {
      persistWorldUpdate((prev) => ({
        ...prev,
        deckConfig: {
          ...prev.deckConfig,
          numberRange: [2, 10],
          faceCards: { J: true, Q: true, K: true },
          aceCount: 4,
          jokerCount: 2,
        },
      }))
    } else {
      persistWorldUpdate((prev) => ({
        ...prev,
        deckConfig: {
          ...prev.deckConfig,
          ...SHORT_GAME_DECK_CONFIG,
        },
      }))
    }
  }

  const getStageRulesUrl = (stageId: string, powerId?: string) => {
    const baseUrl = '/rules'
    if (powerId) {
      return `${baseUrl}#${encodeURIComponent(powerId)}`
    }
    const stageMap: Record<string, string> = {
      genesis: '1.-genesis',
      primal: '2.-primal',
      civilization: '3.-civilization',
      intrigue: '4.-intrigue',
    }
    return `${baseUrl}#${stageMap[stageId] || stageId}`
  }

  const isFantastical = isFantasticalCard(drawnCard)
  const { color, bgColor } = drawnCard
    ? getCardDisplay(drawnCard, cardColors)
    : { color: '', bgColor: '' }
  const currentStageData = STAGES.find((s) => s.id === currentStage)
  const latestRecord =
    drawHistory.length > 0 ? drawHistory[drawHistory.length - 1] : null

  const showPowerDetails = companionMode !== 'cards-only'
  const showTimelineRecords =
    companionMode === 'companion-tracker' || companionMode === 'full-studio'

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Studio Top Bar */}
      <div className="no-print card p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">{world.name}</h1>
                {currentStageData && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                    Stage {currentStageData.number}: {currentStageData.name}
                  </span>
                )}
                {activePlayer && (
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-full text-white font-medium flex items-center gap-1"
                    style={{ backgroundColor: activePlayer.color }}
                  >
                    <span>
                      Turn: {activePlayer.name} ({activePlayer.role})
                    </span>
                    {activePlayer.isBot && (
                      <span>
                        · {BOT_PERSONALITIES[activePlayer.personality]?.icon} Bot
                      </span>
                    )}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Schema v{world.schemaVersion || 2} · {drawHistory.length} turns ·{' '}
                {world.entities.length} codex entries · {players.length} player seat(s)
              </p>
            </div>
          </div>

          {/* World Management, Players, Auto-Play & File Actions */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowPlayersPanel(!showPlayersPanel)}
              className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                showPlayersPanel
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:bg-accent'
              }`}
              title="Configure 1–6 Hotseat Players or Bot Seats"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Players ({players.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAutoPlayPanel(!showAutoPlayPanel)}
              className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                showAutoPlayPanel
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:bg-accent'
              }`}
              title="Procedural Seeded Auto-Play & World Generator"
            >
              <Bot className="h-3.5 w-3.5" />
              <span>Auto-Play</span>
            </button>

            <button
              type="button"
              onClick={() => setShowWorldManager(true)}
              className="btn-outline px-3 py-2 text-xs font-semibold flex items-center gap-1.5"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Worlds ({savedWorlds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-outline px-3 py-2 text-xs flex items-center gap-1.5"
              title="Import world JSON file"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Import</span>
            </button>

            <button
              type="button"
              onClick={handleExportGameState}
              className="btn-outline px-3 py-2 text-xs flex items-center gap-1.5"
              title="Export complete world state to JSON"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHelpDialog(true)}
              className="btn-outline px-2.5 py-2 text-xs flex items-center gap-1"
              title="Help & instructions"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Help</span>
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

        {/* Second Row: Companion Mode Selector & Studio Workspace Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
          {/* Companion Mode Toggles */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">
              Mode:
            </span>
            {(
              [
                { id: 'cards-only', label: 'Cards Only' },
                { id: 'cards-and-powers', label: 'Cards + Powers' },
                { id: 'companion-tracker', label: 'Companion Tracker' },
                { id: 'full-studio', label: 'Full World Studio' },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleCompanionModeChange(m.id)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  companionMode === m.id
                    ? 'bg-secondary text-foreground font-semibold ring-1 ring-primary/40'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Workspace View Tabs (Visible in Full World Studio mode) */}
          {companionMode === 'full-studio' && (
            <div
              className="flex flex-wrap items-center gap-1.5"
              role="tablist"
              aria-label="Studio Workspace Tabs"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'cards'}
                onClick={() => setActiveTab('cards')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'cards'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-accent text-foreground'
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
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'map'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-accent text-foreground'
                }`}
              >
                <MapIcon className="h-3.5 w-3.5" />
                <span>World Map</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'timeline'}
                onClick={() => setActiveTab('timeline')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'timeline'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-accent text-foreground'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Timeline ({drawHistory.length})</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'entities'}
                onClick={() => setActiveTab('entities')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'entities'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-accent text-foreground'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Codex ({world.entities.length})</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'split'}
                onClick={() => setActiveTab('split')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'split'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-accent text-foreground'
                }`}
              >
                <Columns className="h-3.5 w-3.5" />
                <span>Full Studio</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Collapsible Hotseat Players Manager (1–6 Seats) */}
      {showPlayersPanel && (
        <div className="no-print card p-5 space-y-4 border-primary/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>Hotseat Players & Bot Personalities (1–6 Seats)</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Track whose turn it is in hotseat play, or assign Bot Personalities for hybrid human + bot world building
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddPlayerSeat}
                disabled={players.length >= 6}
                className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Add Player Seat ({players.length}/6)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPlayersPanel(false)}
                className="p-1 hover:bg-accent rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {players.map((seat, idx) => {
              const isCurrentTurn = idx === currentPlayerIndex % players.length
              return (
                <div
                  key={seat.id}
                  className={`p-3 rounded-lg border space-y-2.5 ${
                    isCurrentTurn
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="color"
                        value={seat.color}
                        onChange={(e) =>
                          handleUpdatePlayerSeat(seat.id, { color: e.target.value })
                        }
                        className="w-6 h-6 rounded border-0 p-0 cursor-pointer"
                        title="Player badge color"
                      />
                      <input
                        type="text"
                        value={seat.name}
                        onChange={(e) =>
                          handleUpdatePlayerSeat(seat.id, { name: e.target.value })
                        }
                        className="input h-7 text-xs font-semibold flex-1 px-2"
                      />
                    </div>
                    {players.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePlayerSeat(seat.id)}
                        className="text-muted-foreground hover:text-destructive p-1"
                        title="Remove seat"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-muted-foreground block">
                        Tabletop Role
                      </label>
                      <select
                        value={seat.role}
                        onChange={(e) =>
                          handleUpdatePlayerSeat(seat.id, {
                            role: e.target.value as PlayerRole,
                          })
                        }
                        className="input h-7 text-xs py-0 px-2"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-muted-foreground block">
                        Seat Control
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdatePlayerSeat(seat.id, { isBot: !seat.isBot })
                        }
                        className={`w-full h-7 rounded border text-xs font-medium px-2 flex items-center justify-center gap-1 ${
                          seat.isBot
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-border'
                        }`}
                      >
                        {seat.isBot ? '🤖 Auto-Bot' : '👤 Human'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-muted-foreground block">
                      Bot / Auto-Play Personality
                    </label>
                    <select
                      value={seat.personality}
                      onChange={(e) =>
                        handleUpdatePlayerSeat(seat.id, {
                          personality: e.target.value as BotPersonalityId,
                        })
                      }
                      className="input h-7 text-xs py-0 px-2 w-full"
                    >
                      {Object.values(BOT_PERSONALITIES).map((bp) => (
                        <option key={bp.id} value={bp.id}>
                          {bp.icon} {bp.name} — {bp.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Collapsible Procedural Auto-Play & Seed Panel */}
      {showAutoPlayPanel && (
        <div className="no-print card p-5 space-y-4 border-primary/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Procedural Seeded Auto-Play & World Generator</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Deterministic decision-tree simulation using player personalities & world constraints (no external AI/LLM)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAutoPlayPanel(false)}
              className="p-1 hover:bg-accent rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-muted/40 p-3 rounded-lg">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Random Seed
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={generationSettings.seed}
                  onChange={(e) =>
                    persistWorldUpdate((prev) => ({
                      ...prev,
                      generationSettings: {
                        ...prev.generationSettings,
                        seed: e.target.value,
                      },
                    }))
                  }
                  className="input h-8 text-xs flex-1"
                  placeholder="e.g., avalon-777"
                />
                <button
                  type="button"
                  onClick={() =>
                    persistWorldUpdate((prev) => ({
                      ...prev,
                      generationSettings: {
                        ...prev.generationSettings,
                        seed: `realm-${Math.floor(1000 + Math.random() * 9000)}`,
                      },
                    }))
                  }
                  className="btn-outline px-2.5 h-8 text-xs"
                  title="Generate new random seed"
                >
                  <Dices className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Geography Direction
              </label>
              <select
                value={generationSettings.geographyPreset}
                onChange={(e) =>
                  persistWorldUpdate((prev) => ({
                    ...prev,
                    generationSettings: {
                      ...prev.generationSettings,
                      geographyPreset: e.target.value as GeographyPreset,
                    },
                  }))
                }
                className="input h-8 text-xs py-0"
              >
                <option value="continent">Central Continent</option>
                <option value="archipelago">Island Archipelago</option>
                <option value="twin-continents">Twin Continents</option>
                <option value="inland-sea">Inland Sea Basin</option>
                <option value="pangaea">Supercontinent (Pangaea)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Fantasy Level
              </label>
              <select
                value={generationSettings.fantasyLevel}
                onChange={(e) =>
                  persistWorldUpdate((prev) => ({
                    ...prev,
                    generationSettings: {
                      ...prev.generationSettings,
                      fantasyLevel: e.target.value as 'low' | 'medium' | 'high',
                    },
                  }))
                }
                className="input h-8 text-xs py-0"
              >
                <option value="low">Low Fantasy (Grounded & Historical)</option>
                <option value="medium">Standard Fantasy (Balanced)</option>
                <option value="high">High Mythic Fantasy (Extraordinary)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleAutoStepOneTurn}
              className="btn-outline px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
            >
              <PlayIcon className="h-3.5 w-3.5" />
              <span>Auto-Play 1 Turn</span>
            </button>
            <button
              type="button"
              onClick={handleAutoPlayCurrentStage}
              className="btn-outline px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
            >
              <FastForward className="h-3.5 w-3.5" />
              <span>Auto-Play Current Stage</span>
            </button>
            <button
              type="button"
              onClick={handleAutoPlayFullWorld}
              className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Generate Full 4-Stage World</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab Content: Cards or Split View */}
      {(activeTab === 'cards' || activeTab === 'split') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Card Area */}
          <div className="lg:col-span-2 space-y-6">
            <div
              className={`grid grid-cols-1 ${
                showPowerDetails ? 'md:grid-cols-2' : ''
              } gap-6`}
            >
              {/* Left: Card Visual */}
              <div className="card p-6">
                <div className="flex flex-col items-center justify-center min-h-[340px]">
                  {drawnCard ? (
                    <div
                      className={`w-full max-w-[230px] aspect-[5/7] ${bgColor} rounded-xl border-4 border-gray-300 dark:border-gray-600 shadow-2xl flex flex-col items-center justify-center p-6 relative`}
                    >
                      {drawnCard.value !== JOKER && (
                        <>
                          <div className={`absolute top-2 left-3 text-2xl font-bold ${color}`}>
                            {drawnCard.value}
                          </div>
                          <div className={`absolute top-8 left-3 text-xl ${color}`}>
                            {drawnCard.suit}
                          </div>
                        </>
                      )}
                      <div className={`text-7xl font-bold ${color} mb-3`}>
                        {drawnCard.value === JOKER ? '🃏' : drawnCard.suit}
                      </div>
                      {drawnCard.value !== JOKER && (
                        <div className={`text-5xl font-bold ${color}`}>{drawnCard.value}</div>
                      )}
                      {drawnCard.value !== JOKER && (
                        <>
                          <div
                            className={`absolute bottom-2 right-3 text-2xl font-bold ${color} rotate-180`}
                          >
                            {drawnCard.value}
                          </div>
                          <div
                            className={`absolute bottom-8 right-3 text-xl ${color} rotate-180`}
                          >
                            {drawnCard.suit}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <div className="text-6xl mb-4">🃏</div>
                      <p className="text-lg font-medium">Click "Draw Card" to begin</p>
                      <p className="text-sm mt-1">Deck: {deck.length} cards remaining</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Stage Power Details + Immediate Note Box */}
              {showPowerDetails && (
                <div className="card p-6 flex flex-col justify-between space-y-4">
                  {drawnCard && stagesEnabled && powerData ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Stage {currentStageData?.number}: {currentStageData?.name}
                        </span>
                        {isFantastical && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400">
                            ✨ Fantastical
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="text-2xl font-bold">
                          {isFantastical && powerData.fantasticalDescription
                            ? 'Fantastical '
                            : ''}
                          {powerData.power}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-muted-foreground mb-1">
                          Description
                        </div>
                        <p className="text-sm">
                          {isFantastical && powerData.fantasticalDescription
                            ? powerData.fantasticalDescription
                            : powerData.description}
                        </p>
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-muted-foreground mb-1">
                          Examples
                        </div>
                        <p className="text-xs text-muted-foreground">{powerData.examples}</p>
                      </div>
                    </div>
                  ) : drawnCard ? (
                    <div className="text-center text-muted-foreground py-8">
                      <p>Enable Stages & Powers to see details</p>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <p>Draw a card to reveal its world-shaping power</p>
                    </div>
                  )}

                  {showTimelineRecords && latestRecord && (
                    <div className="border-t border-border pt-3 space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground block">
                        Turn #{latestRecord.moveId} Chronicle Note
                        {latestRecord.playerName ? ` (${latestRecord.playerName})` : ''}:
                      </label>
                      <textarea
                        value={latestRecord.note || ''}
                        onChange={(e) =>
                          handleUpdateRecord(latestRecord.id, { note: e.target.value })
                        }
                        placeholder="Describe what you created or changed on this turn..."
                        className="input w-full text-sm min-h-[68px]"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Controls */}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleDrawCard}
                disabled={deck.length === 0}
                className="btn-primary flex items-center space-x-2 px-6 py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlayIcon className="h-5 w-5" />
                <span>Draw Card ({deck.length})</span>
              </button>
              <button
                type="button"
                onClick={handleAutoStepOneTurn}
                className="btn-outline flex items-center space-x-2 px-4 py-3 text-sm"
                title="Let the current player's Bot Personality resolve 1 turn automatically"
              >
                <Bot className="h-4 w-4" />
                <span>Auto-Step Turn</span>
              </button>
              <button
                type="button"
                onClick={handleReshuffleDeck}
                className="btn-outline flex items-center space-x-2 px-4 py-3 text-sm"
              >
                <Shuffle className="h-4 w-4" />
                <span>Reset Deck</span>
              </button>
              <button
                type="button"
                onClick={() => setShowRestartDialog(true)}
                className="btn-outline flex items-center space-x-2 px-4 py-3 text-sm"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Restart World</span>
              </button>
            </div>

            {/* Stage Pre-Setup & Suit Legend */}
            {showPowerDetails && stagesEnabled && currentStageData && (
              <div className="card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">
                      {currentStageData.number}. {currentStageData.name} Stage
                    </h3>
                    <p className="text-xs text-muted-foreground">{currentStageData.eraLabel}</p>
                  </div>
                  <a
                    href={getStageRulesUrl(currentStage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline flex items-center space-x-1.5 px-3 py-1.5 text-xs"
                  >
                    <span>Stage Rules</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <div>
                    <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1">
                      Pre-Stage Setup:
                    </p>
                    <p className="text-sm">{STAGE_PRE_SETUP[currentStage]}</p>
                  </div>
                  {showTimelineRecords && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                        Stage Preparation Notes:
                      </label>
                      <textarea
                        value={stageNotes[currentStage] || ''}
                        onChange={(e) => handleStageNoteChange(e.target.value)}
                        placeholder="Record your species, societies, or starting geography for this stage..."
                        className="input w-full text-sm min-h-[64px]"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <p className="font-semibold mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                    Powers by Suit:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(STAGE_POWERS[currentStage] || {}).map(([suit, power]) => (
                      <div
                        key={suit}
                        className="flex items-center justify-between p-2.5 bg-muted/40 border border-border rounded-md"
                      >
                        <span className="text-lg font-bold">{suit}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium">{power.name}</span>
                          <a
                            href={getStageRulesUrl(currentStage, power.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                            title={`View ${power.name} rules`}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Deck Configuration */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-bold mb-4">Deck Configuration</h3>

              <div className="space-y-5">
                {/* Presets */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                    Presets
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => applyPreset('all')}
                      className="btn-outline flex-1 text-xs py-2"
                    >
                      Standard (54)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('short')}
                      className="btn-outline flex-1 text-xs py-2"
                    >
                      Short Game (27)
                    </button>
                  </div>
                </div>

                {/* Numbered Cards Range */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                    Numbered Cards: {numberRange[0]} – {numberRange[1]}
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-8">Min:</span>
                      <input
                        type="range"
                        min="2"
                        max="10"
                        value={numberRange[0]}
                        onChange={(e) => {
                          const min = parseInt(e.target.value, 10)
                          persistWorldUpdate((prev) => ({
                            ...prev,
                            deckConfig: {
                              ...prev.deckConfig,
                              numberRange: [min, Math.max(min, prev.deckConfig.numberRange[1])],
                            },
                          }))
                        }}
                        className="flex-1"
                      />
                      <span className="text-xs font-semibold w-6">{numberRange[0]}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-8">Max:</span>
                      <input
                        type="range"
                        min="2"
                        max="10"
                        value={numberRange[1]}
                        onChange={(e) => {
                          const max = parseInt(e.target.value, 10)
                          persistWorldUpdate((prev) => ({
                            ...prev,
                            deckConfig: {
                              ...prev.deckConfig,
                              numberRange: [Math.min(prev.deckConfig.numberRange[0], max), max],
                            },
                          }))
                        }}
                        className="flex-1"
                      />
                      <span className="text-xs font-semibold w-6">{numberRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Face Cards */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                    Fantastical Face Cards
                  </label>
                  <div className="flex gap-2">
                    {(['J', 'Q', 'K'] as const).map((face) => (
                      <button
                        key={face}
                        type="button"
                        onClick={() =>
                          persistWorldUpdate((prev) => ({
                            ...prev,
                            deckConfig: {
                              ...prev.deckConfig,
                              faceCards: {
                                ...prev.deckConfig.faceCards,
                                [face]: !prev.deckConfig.faceCards[face],
                              },
                            },
                          }))
                        }
                        className={`flex-1 py-1.5 px-3 rounded border text-xs font-semibold ${
                          faceCards[face]
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-border hover:bg-accent'
                        }`}
                      >
                        {face}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aces & Jokers */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                      Aces (Disasters): {aceCount}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="4"
                      value={aceCount}
                      onChange={(e) =>
                        persistWorldUpdate((prev) => ({
                          ...prev,
                          deckConfig: {
                            ...prev.deckConfig,
                            aceCount: parseInt(e.target.value, 10),
                          },
                        }))
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                      Jokers (Wild): {jokerCount}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      value={jokerCount}
                      onChange={(e) =>
                        persistWorldUpdate((prev) => ({
                          ...prev,
                          deckConfig: {
                            ...prev.deckConfig,
                            jokerCount: parseInt(e.target.value, 10),
                          },
                        }))
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Stages Selector */}
                <div className="border-t border-border pt-4 space-y-2">
                  <label className="flex items-center space-x-2 text-xs font-medium">
                    <input
                      type="checkbox"
                      checked={stagesEnabled}
                      onChange={(e) =>
                        persistWorldUpdate((prev) => ({
                          ...prev,
                          deckConfig: {
                            ...prev.deckConfig,
                            stagesEnabled: e.target.checked,
                          },
                        }))
                      }
                      className="rounded"
                    />
                    <span>Enable Stages & Powers Overlay</span>
                  </label>
                  {stagesEnabled && (
                    <select
                      aria-label="Current Stage"
                      value={currentStage}
                      onChange={(e) => handleStageChange(e.target.value as StageId)}
                      className="input w-full text-sm h-9"
                    >
                      {STAGES.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.number}. {stage.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleReshuffleDeck}
                  className="btn-primary w-full py-2 text-sm"
                >
                  Apply & Rebuild Deck
                </button>
              </div>
            </div>

            {/* Deck Status */}
            <div className="card p-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cards Remaining</span>
                <span className="font-bold">{deck.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Historical Turns</span>
                <span className="font-bold">{drawHistory.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map View */}
      {companionMode === 'full-studio' &&
        (activeTab === 'map' || activeTab === 'split') && (
          <MapCanvas
            map={world.map}
            worldName={world.name}
            drawHistory={world.drawHistory}
            entities={world.entities}
            onChange={handleMapChange}
          />
        )}

      {/* Entities / Codex View */}
      {companionMode === 'full-studio' &&
        (activeTab === 'entities' || activeTab === 'split') && (
          <EntityRegistry
            entities={world.entities}
            currentStage={currentStage}
            drawHistory={world.drawHistory}
            map={world.map}
            onChange={handleEntitiesChange}
          />
        )}

      {/* Timeline View */}
      {showTimelineRecords &&
        (activeTab === 'cards' ||
          activeTab === 'timeline' ||
          activeTab === 'split') && (
          <TimelinePanel
            world={world}
            cardColors={cardColors}
            onUpdateRecord={handleUpdateRecord}
            onClearHistory={handleClearHistory}
            onRewindToMove={handleRewindToMove}
          />
        )}

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
        onCreateWorld={(name) => {
          const created = saveWorld(createNewWorld(name))
          setWorld(created)
          setSavedWorlds(listSavedWorlds())
          setDeck(buildShuffledDeck(created.deckConfig))
          setDrawnCard(null)
          setPowerData(null)
        }}
        onRenameWorld={(newName) => {
          persistWorldUpdate((prev) => ({
            ...prev,
            name: newName,
          }))
        }}
        onDeleteWorld={(worldId) => {
          deleteWorld(worldId)
          const nextActive = getActiveWorld()
          setWorld(nextActive)
          setSavedWorlds(listSavedWorlds())
          setDeck(buildShuffledDeck(nextActive.deckConfig))
        }}
      />

      {/* Restart Dialog */}
      {showRestartDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Reset Current World</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              Are you sure you want to reset "{world.name}"? This will clear all draw history, entities, and map changes for this world.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={handleRestart} className="btn-primary flex-1">
                Yes, Reset World
              </button>
              <button
                type="button"
                onClick={() => setShowRestartDialog(false)}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deck Empty Dialog */}
      {showDeckEmptyDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Stage Deck Complete</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              {stagesEnabled
                ? 'All cards in this stage have been drawn! Would you like to advance to the next stage of history or reshuffle the current stage deck?'
                : 'Would you like to reshuffle the deck?'}
            </p>
            <div className="flex gap-3">
              {stagesEnabled && (
                <button
                  type="button"
                  onClick={handleProgressToNextStage}
                  disabled={!getNextStage(currentStage)}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!getNextStage(currentStage)
                    ? 'Final Stage Reached'
                    : `Advance to ${
                        STAGES.find((s) => s.id === getNextStage(currentStage))?.name
                      }`}
                </button>
              )}
              <button type="button" onClick={handleReshuffleDeck} className="btn-outline flex-1">
                Reshuffle Deck
              </button>
              <button
                type="button"
                onClick={() => setShowDeckEmptyDialog(false)}
                className="btn-outline px-3"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Dialog */}
      {showHelpDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-xl font-bold">World Building Studio Guide</h3>
              <button
                type="button"
                onClick={() => setShowHelpDialog(false)}
                className="p-1 hover:bg-accent rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold">1. Companion Modes</h4>
                <p className="text-muted-foreground">
                  Use the <strong>Mode</strong> bar to toggle between <em>Cards Only</em> (for physical map play), <em>Cards + Powers</em>, <em>Companion Tracker</em>, and <em>Full World Studio</em>.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">2. Hotseat Multiplayer (1–6 Players)</h4>
                <p className="text-muted-foreground">
                  Click <strong>Players</strong> to add up to 6 seats, assign Artist/Historian/Keeper roles, and mix Human players with Bot Personalities.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">3. Seeded Auto-Play & Time-Travel Rewind</h4>
                <p className="text-muted-foreground">
                  Click <strong>Auto-Play</strong> to step 1 turn, simulate a stage, or generate a complete 4-stage world from a deterministic seed. Click <strong>Rewind Here</strong> on any turn in the Timeline to roll back the world and branch history!
                </p>
              </div>
              <div>
                <h4 className="font-semibold">4. Multi-Layer Map & Codex Wiki</h4>
                <p className="text-muted-foreground">
                  Combine base biomes with relief (mountains/hills/canyons), flora (forest/jungle), rivers, roads, and faction territory borders. Use the <strong>Codex</strong> tab to load preset races and civilizations or customize your own.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export File Name Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 max-w-md w-full mx-4 space-y-4">
            <h3 className="text-xl font-semibold">Export World JSON (Schema v2)</h3>
            <div>
              <label className="text-sm font-medium mb-2 block">File Name</label>
              <input
                type="text"
                value={exportFileName}
                onChange={(e) => setExportFileName(e.target.value)}
                placeholder="world-state"
                className="input w-full"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-1">
                Includes deck config, timeline turns, snapshots, multi-layer map grid, hotseat players, and codex entries
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleConfirmExport}
                className="btn-primary flex-1"
              >
                Download .json
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExportDialog(false)
                  setExportFileName('')
                }}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
