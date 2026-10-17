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
} from 'lucide-react'
import {
  Card,
  DrawRecord,
  MapState,
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
  saveWorld,
  serializeWorld,
  setActiveWorldId,
} from '../engine/storageService'
import { MapCanvas } from '../components/MapCanvas'
import { TimelinePanel } from '../components/TimelinePanel'
import { EntityRegistry } from '../components/EntityRegistry'
import { WorldManagerModal } from '../components/WorldManagerModal'

type StudioTab = 'cards' | 'map' | 'timeline' | 'entities' | 'split'

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
  const [exportFileName, setExportFileName] = useState('')
  const [cardColors, setCardColors] = useState<Record<string, string>>(DEFAULT_CARD_COLORS)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const { deckConfig, currentStage, stageNotes, drawHistory } = world
  const { numberRange, faceCards, aceCount, jokerCount, stagesEnabled } = deckConfig

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
    }

    persistWorldUpdate((prev) => ({
      ...prev,
      drawHistory: [...prev.drawHistory, record],
    }))

    if (newDeck.length === 0) {
      setShowDeckEmptyDialog(true)
    }
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Studio Top Bar */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{world.name}</h1>
              {currentStageData && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                  Stage {currentStageData.number}: {currentStageData.name}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Auto-saved locally · {drawHistory.length} turns · {world.entities.length} entities
            </p>
          </div>
        </div>

        {/* Workspace View Selector */}
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Studio Workspace Tabs">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'cards'}
            onClick={() => setActiveTab('cards')}
            className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'cards'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent text-foreground'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Deck & Draw</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'map'}
            onClick={() => setActiveTab('map')}
            className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'map'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent text-foreground'
            }`}
          >
            <MapIcon className="h-4 w-4" />
            <span>World Map</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'timeline'}
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'timeline'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent text-foreground'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Timeline ({drawHistory.length})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'entities'}
            onClick={() => setActiveTab('entities')}
            className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'entities'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent text-foreground'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Registry ({world.entities.length})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'split'}
            onClick={() => setActiveTab('split')}
            className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'split'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent text-foreground'
            }`}
          >
            <Columns className="h-4 w-4" />
            <span>Full Studio</span>
          </button>
        </div>

        {/* World Management & File Actions */}
        <div className="flex flex-wrap items-center gap-2">
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

      {/* Tab Content: Cards or Split View */}
      {(activeTab === 'cards' || activeTab === 'split') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Card Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Card Visual */}
              <div className="card p-6">
                <div className="flex flex-col items-center justify-center min-h-[360px]">
                  {drawnCard ? (
                    <div
                      className={`w-full max-w-[240px] aspect-[5/7] ${bgColor} rounded-xl border-4 border-gray-300 dark:border-gray-600 shadow-2xl flex flex-col items-center justify-center p-6 relative`}
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
                        {isFantastical && powerData.fantasticalDescription ? 'Fantastical ' : ''}
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

                {latestRecord && (
                  <div className="border-t border-border pt-3 space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground block">
                      Turn #{latestRecord.moveId} Chronicle Note:
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
                onClick={handleReshuffleDeck}
                className="btn-outline flex items-center space-x-2 px-5 py-3 text-sm"
              >
                <Shuffle className="h-4 w-4" />
                <span>Reset Deck</span>
              </button>
              <button
                type="button"
                onClick={() => setShowRestartDialog(true)}
                className="btn-outline flex items-center space-x-2 px-5 py-3 text-sm"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Restart World</span>
              </button>
            </div>

            {/* Stage Pre-Setup & Suit Legend */}
            {stagesEnabled && currentStageData && (
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
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                      Stage Preparation Notes:
                    </label>
                    <textarea
                      value={stageNotes[currentStage] || ''}
                      onChange={(e) => handleStageNoteChange(e.target.value)}
                      placeholder="Record your species, societies, or starting geography for this stage..."
                      className="input w-full text-sm min-h-[68px]"
                    />
                  </div>
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
      {(activeTab === 'map' || activeTab === 'split') && (
        <MapCanvas
          map={world.map}
          worldName={world.name}
          drawHistory={world.drawHistory}
          entities={world.entities}
          onChange={handleMapChange}
        />
      )}

      {/* Entities View */}
      {(activeTab === 'entities' || activeTab === 'split') && (
        <EntityRegistry
          entities={world.entities}
          currentStage={currentStage}
          drawHistory={world.drawHistory}
          onChange={handleEntitiesChange}
        />
      )}

      {/* Timeline View (Always shown at bottom of 'cards', 'timeline', and 'split' tabs) */}
      {(activeTab === 'cards' || activeTab === 'timeline' || activeTab === 'split') && (
        <TimelinePanel
          world={world}
          cardColors={cardColors}
          onUpdateRecord={handleUpdateRecord}
          onClearHistory={handleClearHistory}
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
                <h4 className="font-semibold">1. Deck & Card Draws</h4>
                <p className="text-muted-foreground">
                  Draw cards to trigger stage powers (Genesis, Primal, Civilization, Intrigue). Record what you create in the turn note box.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">2. Interactive 20×12 Map Canvas</h4>
                <p className="text-muted-foreground">
                  Switch to the <strong>World Map</strong> tab to paint terrain, mix 2-color patterns, stamp settlements/monuments, and inspect individual tile histories. Export your map to SVG or PNG at any time.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">3. Species, Civilizations & Myths</h4>
                <p className="text-muted-foreground">
                  Use the <strong>Registry</strong> tab to log sentient species in Primal, kingdoms in Civilization, and schemes/myths in Intrigue. Link entities and map coordinates directly to timeline turns.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">4. Automatic Local Save & JSON / Markdown Export</h4>
                <p className="text-muted-foreground">
                  Every move is automatically saved in your browser. Click <strong>Worlds</strong> to manage multiple worlds, <strong>Export JSON</strong> to save a backup file, or <strong>Export Chronicle (.md)</strong> in the Timeline to download a formatted history book.
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
            <h3 className="text-xl font-semibold">Export World JSON</h3>
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
                Includes deck config, timeline turns, map grid, and registered entities
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
