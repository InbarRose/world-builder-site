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
  Sliders,
  Wand2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Lock,
  Unlock,
  BookOpen,
  ArrowLeftRight,
  Compass,
} from 'lucide-react'
import {
  BotPersonalityId,
  BotPersonalityWeights,
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
  serializeWorld,
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
  COLOR_SWATCH_PALETTES,
  ENTITY_ICON_GALLERY,
  EntityPreset,
  MYTH_PRESETS,
  PLAYER_COLORS,
  RELATIONSHIP_PRESETS,
  SOCIETY_PRESETS,
  SPECIES_PRESETS,
  STAGE_ACTION_PRESETS,
  StageActionPreset,
  getActionPresetsForDraw,
  getEffectiveBotWeights,
} from '../engine/presets'
import { addSlotToTile, createInitialMap, getTileId } from '../engine/mapEngine'
import { MapCanvas } from '../components/MapCanvas'
import { TimelinePanel } from '../components/TimelinePanel'
import { EntityRegistry } from '../components/EntityRegistry'
import { CreateWorldOptions, WorldManagerModal } from '../components/WorldManagerModal'

type StudioTab = 'cards' | 'map' | 'timeline' | 'entities' | 'split'
type SetupWizardStep = 1 | 2 | 3 | 4

const ROLES: PlayerRole[] = ['Artist', 'Historian', 'Keeper', 'Player']

const WEIGHT_LABELS: { key: keyof BotPersonalityWeights; label: string; icon: string }[] = [
  { key: 'geography', label: 'Geography', icon: '🏔️' },
  { key: 'ecology', label: 'Ecology', icon: '🌿' },
  { key: 'civilization', label: 'Civilization', icon: '🏛️' },
  { key: 'diplomacy', label: 'Diplomacy', icon: '📜' },
  { key: 'conflict', label: 'Conflict', icon: '⚔️' },
  { key: 'myth', label: 'Myth & Magic', icon: '✨' },
]

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
  const [showSetupWizard, setShowSetupWizard] = useState(false)
  const [setupWizardStep, setSetupWizardStep] = useState<SetupWizardStep>(1)
  const [showDeckDrawer, setShowDeckDrawer] = useState(false)
  const [showStageBriefDrawer, setShowStageBriefDrawer] = useState(false)
  const [showAgesMatrix, setShowAgesMatrix] = useState(false)
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [showDigitalPresets, setShowDigitalPresets] = useState(false)
  const [showPresetPoolFilter, setShowPresetPoolFilter] = useState(false)
  const [presetFilterTab, setPresetFilterTab] = useState<'species' | 'society' | 'myth' | 'actions'>('species')
  const [expandedBotWeightSeatId, setExpandedBotWeightSeatId] = useState<string | null>(null)
  const [generateIntoNewWorld, setGenerateIntoNewWorld] = useState(false)

  // Pre-Stage Lego-Block Customizer state (for customizing plain Species/Kingdoms before spawning)
  const [customSpawnColor, setCustomSpawnColor] = useState<string>('#10b981')
  const [customSpawnSecondary, setCustomSpawnSecondary] = useState<string>('#d1fae5')
  const [customSpawnIcon, setCustomSpawnIcon] = useState<string>('')
  const [showSpawnCustomizer, setShowSpawnCustomizer] = useState(false)

  const [actionTargetTileCoord, setActionTargetTileCoord] = useState<string>('')
  const [actionTargetEntityId, setActionTargetEntityId] = useState<string>('')
  const [actionSecondEntityId, setActionSecondEntityId] = useState<string>('')
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
    if (world.isLocked) return
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
    if (world.isLocked) return
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
  }

  const handleAutoPlayFullWorld = () => {
    const turns = generationSettings.turnsPerStage ?? 8
    // Non-destructive guard: if user requested new world OR current world is locked, generate into a fresh saved world
    if (generateIntoNewWorld || world.isLocked) {
      const baseNewWorld = createNewWorld(`${world.name} (${generationSettings.seed})`)
      baseNewWorld.generationSettings = { ...generationSettings }
      baseNewWorld.players = [...players]
      baseNewWorld.deckConfig = { ...deckConfig }
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
  }

  const handleRewindToMove = (targetMoveId: number) => {
    if (world.isLocked) return
    persistWorldUpdate((prev) => rewindWorldToMove(prev, targetMoveId))
    setDeck(rebuildDeck())
  }

  const handleBranchFromMove = (targetMoveId: number) => {
    const branched = branchWorldAtMove(world, targetMoveId)
    setWorld(branched)
    setSavedWorlds(listSavedWorlds())
    setDeck(buildShuffledDeck(branched.deckConfig))
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

  const handleUpdateBotWeight = (
    seat: PlayerSeat,
    key: keyof BotPersonalityWeights,
    value: number
  ) => {
    const currentWeights = getEffectiveBotWeights(seat)
    handleUpdatePlayerSeat(seat.id, {
      customWeights: {
        ...currentWeights,
        [key]: value,
      },
    })
  }

  const handleResetBotWeights = (seatId: string) => {
    handleUpdatePlayerSeat(seatId, { customWeights: undefined })
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

  const handleTogglePresetDisabled = (presetId: string) => {
    persistWorldUpdate((prev) => {
      const current = prev.generationSettings.disabledPresetIds || []
      const next = current.includes(presetId)
        ? current.filter((id) => id !== presetId)
        : [...current, presetId]
      return {
        ...prev,
        generationSettings: {
          ...prev.generationSettings,
          disabledPresetIds: next,
        },
      }
    })
  }

  const handleUpdateRecord = (recordId: string, updates: Partial<DrawRecord>) => {
    if (world.isLocked) return
    persistWorldUpdate((prev) => ({
      ...prev,
      drawHistory: prev.drawHistory.map((r) =>
        r.id === recordId ? { ...r, ...updates } : r
      ),
    }))
  }

  const handleStageNoteChange = (note: string) => {
    if (world.isLocked) return
    persistWorldUpdate((prev) => ({
      ...prev,
      stageNotes: { ...prev.stageNotes, [prev.currentStage]: note },
    }))
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
    if (world.isLocked) return
    persistWorldUpdate((prev) => ({
      ...prev,
      drawHistory: [],
      snapshots: [],
    }))
  }

  const handleMapChange = (newMap: MapState) => {
    if (world.isLocked) return
    persistWorldUpdate((prev) => ({
      ...prev,
      map: newMap,
    }))
  }

  const handleEntitiesChange = (newEntities: WorldEntity[]) => {
    if (world.isLocked) return
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

  const findOpenLandCoord = (mapState: MapState): { col: number; row: number } => {
    const landCandidates: { col: number; row: number; score: number }[] = []
    for (let r = 0; r < mapState.height; r++) {
      for (let c = 0; c < mapState.width; c++) {
        const id = getTileId(c, r)
        const t = mapState.tiles[id]
        if (!t) continue
        const isLand = t.terrain !== 'ocean' && t.terrain !== 'water'
        const slotCount = (t.slots || []).length + (t.overlay !== 'none' ? 2 : 0)
        if (isLand) {
          landCandidates.push({ col: c, row: r, score: 20 - slotCount * 5 })
        }
      }
    }
    if (landCandidates.length > 0) {
      landCandidates.sort((a, b) => b.score - a.score)
      return { col: landCandidates[0].col, row: landCandidates[0].row }
    }
    return {
      col: Math.floor(mapState.width / 2),
      row: Math.floor(mapState.height / 2),
    }
  }

  const handlePreStageSpawnPreset = (preset: EntityPreset) => {
    if (world.isLocked) return
    persistWorldUpdate((prev) => {
      const target = findOpenLandCoord(prev.map)
      const coordStr = getTileId(target.col, target.row)
      const parentSpecies =
        preset.category === 'society'
          ? prev.entities.find((e) => e.category === 'species')
          : undefined
      const settlementIcons =
        preset.settlementIcons || parentSpecies?.settlementIcons

      const effectiveIcon = customSpawnIcon || preset.icon
      const effectivePrimary = showSpawnCustomizer ? customSpawnColor : preset.color
      const effectiveSecondary = showSpawnCustomizer
        ? customSpawnSecondary
        : preset.secondaryColor

      const newEntity: WorldEntity = {
        id: `ent_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: preset.name,
        category: preset.category,
        stageCreated: prev.currentStage,
        // Species start plain like modular Lego blocks!
        description: preset.category === 'species' ? '' : preset.description,
        traits: preset.category === 'species' ? [] : [...preset.traits],
        abilities: preset.category === 'species' ? [] : [...preset.abilities],
        status: 'Flourishing',
        color: effectivePrimary,
        secondaryColor: effectiveSecondary,
        icon: effectiveIcon,
        archetype: preset.category === 'species' ? '' : preset.archetype,
        settlementIcons,
        parentEntityId: parentSpecies?.id,
        diplomaticLinks: [],
        originTileId: coordStr,
      }

      const existingTile = prev.map.tiles[coordStr]
      const nextTiles = { ...prev.map.tiles }

      if (existingTile) {
        let updated = {
          ...existingTile,
          linkedEntityIds: Array.from(
            new Set([...existingTile.linkedEntityIds, newEntity.id])
          ),
        }
        if (preset.category === 'species') {
          updated.overlay = updated.overlay === 'none' ? 'settlement' : updated.overlay
          updated.label = updated.label || `${preset.name} Homeland`
          updated = addSlotToTile(updated, {
            category: 'settlement',
            type: 'camp',
            name: `${preset.name} Camp`,
            icon: settlementIcons?.camp || effectiveIcon,
            priority: 95,
            linkedEntityId: newEntity.id,
          })
        } else if (preset.category === 'society') {
          updated.overlay = 'capital'
          updated.territoryId = newEntity.id
          updated.coloringMode = 'fill'
          updated.label = `${preset.name} Capital`
          updated = addSlotToTile(updated, {
            category: 'settlement',
            type: 'city',
            name: `${preset.name} Capital`,
            icon: settlementIcons?.city || effectiveIcon,
            priority: 99,
            linkedEntityId: newEntity.id,
          })
        } else {
          updated.overlay = 'myth'
          updated = addSlotToTile(updated, {
            category: 'myth',
            type: preset.id,
            name: preset.name,
            icon: effectiveIcon,
            priority: 92,
            linkedEntityId: newEntity.id,
          })
        }
        nextTiles[coordStr] = updated
      }

      const stagePrefix = prev.stageNotes[prev.currentStage]
        ? `${prev.stageNotes[prev.currentStage]}\n`
        : ''

      return {
        ...prev,
        map: { ...prev.map, tiles: nextTiles },
        entities: [...prev.entities, newEntity],
        stageNotes: {
          ...prev.stageNotes,
          [prev.currentStage]: `${stagePrefix}• Pre-Stage Created: ${effectiveIcon} ${preset.name} at (${coordStr})`,
        },
      }
    })
  }

  const handleApplyActionPreset = (preset: StageActionPreset) => {
    if (!latestRecord || world.isLocked) return

    persistWorldUpdate((prev) => {
      // Resolve target coordinate
      let targetCoordObj = findOpenLandCoord(prev.map)
      if (actionTargetTileCoord.includes(',')) {
        const [cStr, rStr] = actionTargetTileCoord.split(',')
        const c = parseInt(cStr.trim(), 10)
        const r = parseInt(rStr.trim(), 10)
        if (
          !isNaN(c) &&
          !isNaN(r) &&
          r >= 0 &&
          r < prev.map.height &&
          c >= 0 &&
          c < prev.map.width
        ) {
          targetCoordObj = { col: c, row: r }
        }
      }
      const coordStr = getTileId(targetCoordObj.col, targetCoordObj.row)

      // Resolve target entities
      const primaryEnt =
        prev.entities.find((e) => e.id === actionTargetEntityId) ||
        prev.entities[prev.entities.length - 1]
      const secondaryEnt =
        prev.entities.find(
          (e) => e.id === actionSecondEntityId && e.id !== primaryEnt?.id
        ) || prev.entities.find((e) => e.id !== primaryEnt?.id)

      const slotChanges = [...(latestRecord.slotChanges || [])]
      let relationshipCreated = latestRecord.relationshipCreated

      const nextTiles = { ...prev.map.tiles }
      const existingTile = nextTiles[coordStr]
      if (existingTile) {
        let updated = { ...existingTile }
        if (preset.terrainChange) {
          updated.terrain = preset.terrainChange
        }
        if (preset.primaryColor || preset.secondaryColor) {
          updated.customColors = {
            primary: preset.primaryColor || updated.customColors?.primary,
            secondary: preset.secondaryColor || updated.customColors?.secondary,
          }
        }
        if (preset.reliefChange) {
          updated.relief = preset.reliefChange
        }
        if (preset.floraChange) {
          updated.flora = preset.floraChange
        }
        if (preset.overlayChange) {
          updated.overlay = preset.overlayChange
        }
        if (preset.hasRiver) {
          updated.hasRiver = true
        }
        if (preset.hasRoad) {
          updated.hasRoad = true
        }

        // Determine slot icon (use companion settlement icon if settlement)
        let slotIcon = preset.icon
        if (preset.slotCategory === 'settlement' && primaryEnt?.settlementIcons) {
          slotIcon = primaryEnt.settlementIcons.town || preset.icon
        }

        updated = addSlotToTile(updated, {
          category: preset.slotCategory,
          type: preset.id,
          name: preset.name,
          icon: slotIcon,
          priority: preset.slotPriority,
          linkedEntityId: primaryEnt?.id,
          linkedEventId: latestRecord.id,
          moveId: latestRecord.moveId,
        })

        slotChanges.push({
          tileId: coordStr,
          slotName: preset.name,
          slotIcon,
          category: preset.slotCategory,
        })

        if (!updated.linkedEventIds.includes(latestRecord.id)) {
          updated.linkedEventIds = [...updated.linkedEventIds, latestRecord.id]
        }
        if (primaryEnt && !updated.linkedEntityIds.includes(primaryEnt.id)) {
          updated.linkedEntityIds = [...updated.linkedEntityIds, primaryEnt.id]
        }
        nextTiles[coordStr] = updated
      }

      let nextEntities = [...prev.entities]
      const linkedEntityIds = new Set<string>(latestRecord.linkedEntityIds || [])

      if (primaryEnt) {
        linkedEntityIds.add(primaryEnt.id)
        if (preset.traitGranted) {
          nextEntities = nextEntities.map((ent) =>
            ent.id === primaryEnt.id && !ent.traits.includes(preset.traitGranted!)
              ? { ...ent, traits: [...ent.traits, preset.traitGranted!] }
              : ent
          )
        }
        if (preset.abilityGranted) {
          nextEntities = nextEntities.map((ent) =>
            ent.id === primaryEnt.id &&
            !(ent.abilities || []).includes(preset.abilityGranted!)
              ? {
                  ...ent,
                  abilities: [...(ent.abilities || []), preset.abilityGranted!],
                }
              : ent
          )
        }
      }

      if (preset.relationshipType && primaryEnt && secondaryEnt) {
        linkedEntityIds.add(primaryEnt.id)
        linkedEntityIds.add(secondaryEnt.id)
        const relMeta = RELATIONSHIP_PRESETS.find(
          (r) => r.type === preset.relationshipType
        )
        const relLabel = relMeta?.label || preset.name
        const relIcon = relMeta?.icon || preset.icon
        relationshipCreated = {
          sourceId: primaryEnt.id,
          targetId: secondaryEnt.id,
          label: `${relLabel}: ${primaryEnt.name} ↔ ${secondaryEnt.name}`,
          icon: relIcon,
        }
        nextEntities = nextEntities.map((ent) =>
          ent.id === primaryEnt.id
            ? {
                ...ent,
                diplomaticLinks: [
                  ...(ent.diplomaticLinks || []),
                  {
                    id: `rel_${Date.now()}`,
                    targetEntityId: secondaryEnt.id,
                    targetEntityName: secondaryEnt.name,
                    type: preset.relationshipType!,
                    label: relLabel,
                    icon: relIcon,
                    description: `${relLabel} forged with ${secondaryEnt.name}`,
                    createdAtMove: latestRecord.moveId,
                    linkedEventId: latestRecord.id,
                  },
                ],
              }
            : ent
        )
      }

      const linkedTileIds = Array.from(
        new Set([...(latestRecord.linkedTileIds || []), coordStr])
      )
      const entityNames = nextEntities
        .filter((e) => linkedEntityIds.has(e.id))
        .map((e) => e.name)

      const noteLine = `${preset.icon} ${preset.name}: ${preset.description} at (${coordStr})${
        entityNames.length > 0 ? ` [${entityNames.join(' & ')}]` : ''
      }.`

      const nextHistory = prev.drawHistory.map((rec) =>
        rec.id === latestRecord.id
          ? {
              ...rec,
              actionTitle: preset.name,
              presetId: preset.id,
              note: rec.note ? `${rec.note} ${noteLine}` : noteLine,
              linkedTileIds,
              linkedEntityIds: Array.from(linkedEntityIds),
              slotChanges,
              relationshipCreated,
            }
          : rec
      )

      return {
        ...prev,
        map: { ...prev.map, tiles: nextTiles },
        entities: nextEntities,
        drawHistory: nextHistory,
      }
    })
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
  const latestRecord =
    drawHistory.length > 0 ? drawHistory[drawHistory.length - 1] : null

  const showPowerDetails = companionMode !== 'cards-only'
  const showTimelineRecords =
    companionMode === 'companion-tracker' || companionMode === 'full-studio'

  const isMobileDefaultViewOnly = typeof window !== 'undefined' && window.innerWidth < 768
  const disabledPresets = generationSettings.disabledPresetIds || []

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Streamlined Studio Top Bar with 2-Mode Switcher & World Protection */}
      <div className="no-print card p-3 sm:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <Globe className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h1 className="text-lg sm:text-xl font-bold truncate">{world.name}</h1>
                {currentStageData && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold">
                    Age {currentStageData.number}/4: {currentStageData.name}
                  </span>
                )}
                {world.isLocked && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Read-Only
                  </span>
                )}
                {activePlayer && (
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full text-white font-medium flex items-center gap-1"
                    style={{ backgroundColor: activePlayer.color }}
                  >
                    <span>
                      {activePlayer.name} ({activePlayer.role})
                    </span>
                    {activePlayer.isBot && (
                      <span>
                        · {BOT_PERSONALITIES[activePlayer.personality]?.icon}
                      </span>
                    )}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                {drawHistory.length} turns · {world.entities.length} codex entries · {players.length} seat(s) · Seed: <span className="font-mono">{generationSettings.seed}</span>
              </p>
            </div>
          </div>

          {/* Primary Quick Toggles: 2-Mode Switcher, Auto-Play, Players, Worlds & Options */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Explicit 2-Mode Switcher: Tabletop Companion vs World Builder Studio */}
            <div className="hidden md:flex items-center bg-muted p-0.5 rounded-lg border border-border mr-1">
              <button
                type="button"
                onClick={() => handleCompanionModeChange('companion-tracker')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  companionMode !== 'full-studio'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Simple Card Draw & Age Reference Companion for physical play"
              >
                🃏 Tabletop Companion
              </button>
              <button
                type="button"
                onClick={() => handleCompanionModeChange('full-studio')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  companionMode === 'full-studio'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Integrated Digital World Map, Keeper Codex, Timeline & Auto-Play Studio"
              >
                🌍 World Studio
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowAutoPlayPanel(!showAutoPlayPanel)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                showAutoPlayPanel
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'
              }`}
              title="Procedural Seeded Auto-Play & World Generator"
            >
              <Bot className="h-3.5 w-3.5" />
              <span>Auto-Play</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPlayersPanel(!showPlayersPanel)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
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
              onClick={() => setShowWorldManager(true)}
              className="btn-outline px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1.5"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Worlds ({savedWorlds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => handleToggleLockWorld(world.id)}
              className={`px-2 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 border transition-colors ${
                world.isLocked
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300'
                  : 'bg-background border-border text-muted-foreground hover:text-foreground'
              }`}
              title={
                world.isLocked
                  ? 'World is Locked (Read-Only) — click to unlock'
                  : 'Lock World to protect against accidental changes'
              }
            >
              {world.isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 border transition-colors ${
                showMoreOptions || showSetupWizard || showDeckDrawer || showStageBriefDrawer
                  ? 'bg-secondary border-primary/40 text-foreground'
                  : 'bg-background border-border hover:bg-accent text-muted-foreground hover:text-foreground'
              }`}
              title="Setup Wizard, Companion Mode, Deck Config & Export Options"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Options</span>
              {showMoreOptions ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
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

        {/* Prominent 4-Age Stepper & Stage Ceremony Bar */}
        {stagesEnabled && (
          <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 flex-1">
              {STAGES.map((st) => {
                const isActiveStage = currentStage === st.id
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleStageChange(st.id)}
                    className={`p-2 rounded-lg border text-left transition-all flex items-center justify-between gap-2 ${
                      isActiveStage
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-border bg-muted/40 hover:bg-accent text-foreground'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">
                        {st.number}. {st.name}
                      </div>
                      <div
                        className={`text-[10px] truncate ${
                          isActiveStage ? 'text-primary-foreground/85' : 'text-muted-foreground'
                        }`}
                      >
                        {st.eraLabel}
                      </div>
                    </div>
                    {isActiveStage && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary-foreground/20 text-primary-foreground shrink-0">
                        Active
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowAgesMatrix(!showAgesMatrix)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                  showAgesMatrix
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border hover:bg-accent'
                }`}
                title="Compare all 4 Ages & Suit Powers side-by-side"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>All 4 Ages Matrix</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSetupWizard(!showSetupWizard)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                  showSetupWizard
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border hover:bg-accent'
                }`}
                title="Open Pre-Stage Creation Ceremony & Game Setup Wizard"
              >
                <Wand2 className="h-3.5 w-3.5 text-primary" />
                <span className="hidden sm:inline">Pre-Stage Ceremony</span>
              </button>
            </div>
          </div>
        )}

        {/* Single Clean Role & Workspace Tab Bar (Mobile Horizontal Scrollable) */}
        <div
          className="flex items-center gap-1.5 pt-2 border-t border-border/60 overflow-x-auto pb-0.5"
          role="tablist"
          aria-label="Studio Workspace Tabs"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'cards'}
            onClick={() => setActiveTab('cards')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors ${
              activeTab === 'cards'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/70 hover:bg-accent text-foreground'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Deck & Draw</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'timeline'}
            onClick={() => {
              if (companionMode !== 'full-studio' && companionMode !== 'companion-tracker') {
                handleCompanionModeChange('full-studio')
              }
              setActiveTab('timeline')
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors ${
              activeTab === 'timeline'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/70 hover:bg-accent text-foreground'
            }`}
            title="Historian Role — Chronological Turn & Era Log"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Historian · Timeline ({drawHistory.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'entities'}
            onClick={() => {
              if (companionMode !== 'full-studio') {
                handleCompanionModeChange('full-studio')
              }
              setActiveTab('entities')
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors ${
              activeTab === 'entities'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/70 hover:bg-accent text-foreground'
            }`}
            title="Keeper Role — Species, Civilizations & Myths Wiki"
          >
            <Users className="h-3.5 w-3.5" />
            <span>Keeper · Codex ({world.entities.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'map'}
            onClick={() => {
              if (companionMode !== 'full-studio') {
                handleCompanionModeChange('full-studio')
              }
              setActiveTab('map')
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors ${
              activeTab === 'map'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/70 hover:bg-accent text-foreground'
            }`}
            title="World Map Viewer & Atlas"
          >
            <MapIcon className="h-3.5 w-3.5" />
            <span>World Map</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'split'}
            onClick={() => {
              if (companionMode !== 'full-studio') {
                handleCompanionModeChange('full-studio')
              }
              setActiveTab('split')
            }}
            className={`hidden lg:flex px-3 py-1.5 rounded-md text-xs font-semibold items-center gap-1.5 shrink-0 transition-colors ${
              activeTab === 'split'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/70 hover:bg-accent text-foreground'
            }`}
          >
            <Columns className="h-3.5 w-3.5" />
            <span>Full Studio</span>
          </button>
        </div>

        {/* Collapsible Secondary Options Bar (Setup Wizard, Companion Mode, Deck Config, Import/Export) */}
        {showMoreOptions && (
          <div className="pt-2.5 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">
                Interface Mode:
              </span>
              {(
                [
                  { id: 'cards-only', label: 'Simple Cards Only' },
                  { id: 'cards-and-powers', label: 'Cards + Powers' },
                  { id: 'companion-tracker', label: 'Tabletop Companion' },
                  { id: 'full-studio', label: 'Full World Studio' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleCompanionModeChange(m.id)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    companionMode === m.id
                      ? 'bg-secondary text-foreground font-semibold ring-1 ring-primary/40'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowSetupWizard(!showSetupWizard)}
                className="btn-outline px-2.5 py-1 text-xs flex items-center gap-1"
              >
                <Wand2 className="h-3.5 w-3.5 text-primary" />
                <span>Setup Wizard</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDeckDrawer(!showDeckDrawer)}
                className="btn-outline px-2.5 py-1 text-xs flex items-center gap-1"
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Deck Config</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-outline px-2.5 py-1 text-xs flex items-center gap-1"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Import</span>
              </button>
              <button
                type="button"
                onClick={handleExportGameState}
                className="btn-outline px-2.5 py-1 text-xs flex items-center gap-1"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export</span>
              </button>
              <button
                type="button"
                onClick={() => setShowRestartDialog(true)}
                className="btn-outline px-2.5 py-1 text-xs flex items-center gap-1 text-destructive"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset World</span>
              </button>
              <button
                type="button"
                onClick={() => setShowHelpDialog(true)}
                className="btn-outline px-2 py-1 text-xs flex items-center gap-1"
                title="Help & instructions"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Abilities Through the Ages Reference Matrix Drawer */}
      {showAgesMatrix && (
        <div className="no-print card p-5 space-y-4 border-2 border-primary/40 bg-primary/[0.02]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span>Abilities & Suit Powers Through the 4 Ages</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Quick companion reference for how Hearts (♥), Clubs (♣), Diamonds (♦), Spades (♠), Face Cards (J/Q/K), Aces, and Jokers evolve across each stage
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAgesMatrix(false)}
              className="p-1.5 hover:bg-accent rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {STAGES.map((st) => {
              const isCurrent = st.id === currentStage
              const suits = STAGE_POWERS[st.id] || {}
              return (
                <div
                  key={st.id}
                  className={`p-3.5 rounded-lg border space-y-2.5 ${
                    isCurrent
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold">
                        {st.number}. {st.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{st.eraLabel}</div>
                    </div>
                    {isCurrent ? (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                        Current Age
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStageChange(st.id)}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded border border-border hover:bg-accent"
                      >
                        Switch Here
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-muted-foreground bg-muted/50 p-2 rounded">
                    <strong>Pre-Stage:</strong> {STAGE_PRE_SETUP[st.id]}
                  </p>

                  <div className="space-y-1.5">
                    {Object.entries(suits).map(([suit, power]) => (
                      <div
                        key={suit}
                        className="flex items-center justify-between text-xs p-1.5 rounded bg-muted/30 border border-border/60"
                      >
                        <span
                          className={`font-bold text-sm ${
                            suit === '♥' || suit === '♦' ? 'text-red-500' : ''
                          }`}
                        >
                          {suit}
                        </span>
                        <span className="font-semibold">{power.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Multi-Step Game Setup & Pre-Stage Ceremony Wizard */}
      {showSetupWizard && (
        <div className="no-print card p-5 space-y-5 border-2 border-primary/50 bg-primary/[0.02]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                <span>Multi-Step Game Setup & Pre-Stage Creation Ceremony</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Step through world geography, player seats, modular Lego-block species/kingdom creation, and deck pacing
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSetupWizard(false)}
              className="p-1.5 hover:bg-accent rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Step Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(
              [
                { step: 1, title: '1. World & Geography', sub: 'Name, Map & Seed' },
                { step: 2, title: '2. Players & Bots', sub: `${players.length} Seat(s)` },
                {
                  step: 3,
                  title: '3. Pre-Stage Ceremony',
                  sub: `Stage: ${currentStageData?.name || currentStage}`,
                },
                { step: 4, title: '4. Deck & Pacing', sub: `${deck.length} Cards` },
              ] as const
            ).map((item) => (
              <button
                key={item.step}
                type="button"
                onClick={() => setSetupWizardStep(item.step)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  setupWizardStep === item.step
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-muted/40 hover:bg-accent'
                }`}
              >
                <div className="text-xs font-bold">{item.title}</div>
                <div
                  className={`text-[10px] ${
                    setupWizardStep === item.step
                      ? 'text-primary-foreground/80'
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.sub}
                </div>
              </button>
            ))}
          </div>

          {/* Step 1: World & Geography */}
          {setupWizardStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-lg border border-border">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  World Name
                </label>
                <input
                  type="text"
                  value={world.name}
                  onChange={(e) =>
                    persistWorldUpdate((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="input h-9 text-sm w-full font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Starting Geography Template
                </label>
                <div className="flex gap-2">
                  <select
                    value={generationSettings.geographyPreset}
                    onChange={(e) => {
                      const preset = e.target.value as GeographyPreset
                      persistWorldUpdate((prev) => ({
                        ...prev,
                        map: createInitialMap(
                          prev.map.width,
                          prev.map.height,
                          preset,
                          createSeededRng(prev.generationSettings.seed)
                        ),
                        generationSettings: {
                          ...prev.generationSettings,
                          geographyPreset: preset,
                        },
                      }))
                    }}
                    className="input h-9 text-xs flex-1 py-0"
                  >
                    <option value="continent">Central Continent</option>
                    <option value="archipelago">Island Archipelago</option>
                    <option value="twin-continents">Twin Continents</option>
                    <option value="inland-sea">Inland Sea Basin</option>
                    <option value="pangaea">Supercontinent (Pangaea)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Active Stage of History
                </label>
                <select
                  value={currentStage}
                  onChange={(e) => handleStageChange(e.target.value as StageId)}
                  className="input h-9 text-xs w-full py-0"
                >
                  {STAGES.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      Stage {stage.number}: {stage.name} ({stage.eraLabel})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Players & Bots */}
          {setupWizardStep === 2 && (
            <div className="space-y-3 bg-muted/30 p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  Configure 1–6 Hotseat Players or Deterministic Bot Personalities
                </span>
                <button
                  type="button"
                  onClick={handleAddPlayerSeat}
                  disabled={players.length >= 6}
                  className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1.5"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Add Seat ({players.length}/6)</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {players.map((seat) => (
                  <div
                    key={seat.id}
                    className="p-2.5 rounded border border-border bg-background flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: seat.color }}
                      />
                      <span className="font-semibold truncate">{seat.name}</span>
                      <span className="text-muted-foreground">({seat.role})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdatePlayerSeat(seat.id, { isBot: !seat.isBot })
                      }
                      className="px-2 py-0.5 rounded border border-border text-[11px]"
                    >
                      {seat.isBot ? '🤖 Bot' : '👤 Human'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Pre-Stage Creation Ceremony with Plain Lego-Block Species & Color Swatches */}
          {setupWizardStep === 3 && (
            <div className="space-y-4 bg-muted/30 p-4 rounded-lg border border-border">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold">
                    Stage {currentStageData?.number}: {currentStageData?.name} — Pre-Stage Ceremony
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {STAGE_PRE_SETUP[currentStage]}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {STAGES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleStageChange(s.id)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        currentStage === s.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background border border-border'
                      }`}
                    >
                      {s.number}. {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Visual Customizer (Color Swatches + Icon Override) before spawning */}
              {(currentStage === 'primal' || currentStage === 'civilization') && (
                <div className="p-3 rounded-lg border border-border bg-background space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSpawnCustomizer(!showSpawnCustomizer)}
                      className="text-xs font-semibold text-primary flex items-center gap-1.5"
                    >
                      <span>🎨 Customize Color Swatches & Icon Before Spawning</span>
                      {showSpawnCustomizer ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                    {showSpawnCustomizer && (
                      <button
                        type="button"
                        onClick={() => {
                          const prevPrimary = customSpawnColor
                          setCustomSpawnColor(customSpawnSecondary)
                          setCustomSpawnSecondary(prevPrimary)
                        }}
                        className="px-2 py-1 rounded border border-border text-[11px] font-medium flex items-center gap-1 hover:bg-accent"
                      >
                        <ArrowLeftRight className="h-3 w-3" />
                        <span>Swap Primary ↔ Secondary</span>
                      </button>
                    )}
                  </div>

                  {showSpawnCustomizer && (
                    <div className="space-y-2 pt-1 border-t border-border/60">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground mr-1">
                          Swatches:
                        </span>
                        {COLOR_SWATCH_PALETTES.map((sw) => (
                          <button
                            key={sw.id}
                            type="button"
                            onClick={() => {
                              setCustomSpawnColor(sw.primary)
                              setCustomSpawnSecondary(sw.secondary)
                            }}
                            className={`px-2 py-0.5 rounded-full border text-[10px] font-medium flex items-center gap-1 ${
                              customSpawnColor === sw.primary
                                ? 'border-primary ring-1 ring-primary'
                                : 'border-border'
                            }`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: sw.primary }}
                            />
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/10"
                              style={{ backgroundColor: sw.secondary }}
                            />
                            <span>{sw.name}</span>
                          </button>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[11px] text-muted-foreground mr-1">
                          Custom Icon Override:
                        </span>
                        <button
                          type="button"
                          onClick={() => setCustomSpawnIcon('')}
                          className={`px-2 py-0.5 rounded border text-[10px] ${
                            !customSpawnIcon ? 'bg-primary text-primary-foreground' : 'border-border'
                          }`}
                        >
                          Default Preset Icon
                        </button>
                        {ENTITY_ICON_GALLERY.slice(0, 2).flatMap((g) => g.icons).map((ic) => (
                          <button
                            key={ic.icon}
                            type="button"
                            onClick={() => setCustomSpawnIcon(ic.icon)}
                            title={ic.label}
                            className={`w-6 h-6 rounded border text-xs flex items-center justify-center ${
                              customSpawnIcon === ic.icon
                                ? 'border-primary bg-primary/15'
                                : 'border-border hover:bg-muted'
                            }`}
                          >
                            {ic.icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Stage 2 Primal: Spawn Plain Modular Lego-Block Species Presets */}
              {currentStage === 'primal' && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-primary">
                    Click a Plain Lego-Block Species to Spawn in Your World (starts with blank traits & abilities so card draws shape them!):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {SPECIES_PRESETS.map((sp) => (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => handlePreStageSpawnPreset(sp)}
                        className="p-2.5 rounded-lg border border-border bg-background hover:border-primary text-left transition-all space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold flex items-center gap-1.5">
                            <span>{customSpawnIcon || sp.icon}</span>
                            <span>{sp.name}</span>
                          </span>
                          <div className="flex items-center gap-1">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: showSpawnCustomizer
                                  ? customSpawnColor
                                  : sp.color,
                              }}
                            />
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/15"
                              style={{
                                backgroundColor: showSpawnCustomizer
                                  ? customSpawnSecondary
                                  : sp.secondaryColor,
                              }}
                            />
                          </div>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          🧱 Plain Modular Species (0 starting traits/powers)
                        </div>
                        {sp.settlementIcons && (
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1 pt-0.5">
                            <span>Settlements:</span>
                            <span>{sp.settlementIcons.camp}</span>→
                            <span>{sp.settlementIcons.village}</span>→
                            <span>{sp.settlementIcons.town}</span>→
                            <span>{sp.settlementIcons.city}</span>→
                            <span>{sp.settlementIcons.metropolis}</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stage 3 Civilization: Found Initial Kingdoms & Borders */}
              {currentStage === 'civilization' && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-primary">
                    Click a Kingdom / Civilization Preset to Found Its Capital & Claim Territory Borders:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {SOCIETY_PRESETS.map((soc) => (
                      <button
                        key={soc.id}
                        type="button"
                        onClick={() => handlePreStageSpawnPreset(soc)}
                        className="p-2.5 rounded-lg border border-border bg-background hover:border-primary text-left transition-all space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold flex items-center gap-1.5">
                            <span>{customSpawnIcon || soc.icon}</span>
                            <span>{soc.name}</span>
                          </span>
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: showSpawnCustomizer
                                ? customSpawnColor
                                : soc.color,
                            }}
                          />
                        </div>
                        <div className="text-[11px] text-muted-foreground line-clamp-1">
                          {soc.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Stage {currentStageData?.number} Preparation Notes:
                </label>
                <textarea
                  value={stageNotes[currentStage] || ''}
                  onChange={(e) => handleStageNoteChange(e.target.value)}
                  placeholder="Record your species, kingdoms, or starting geography for this stage..."
                  className="input w-full text-xs min-h-[56px]"
                />
              </div>
            </div>
          )}

          {/* Step 4: Deck & Pacing */}
          {setupWizardStep === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-lg border border-border">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Game Length Preset
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset('all')}
                    className="btn-outline flex-1 text-xs py-2"
                  >
                    Standard (54 Cards)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('short')}
                    className="btn-outline flex-1 text-xs py-2"
                  >
                    Short Game (27 Cards)
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Aces ({aceCount}) & Jokers ({jokerCount})
                </label>
                <div className="flex items-center gap-3 text-xs">
                  <span>Aces:</span>
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
                    className="flex-1"
                  />
                  <span>Jokers:</span>
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
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    handleReshuffleDeck()
                    setShowSetupWizard(false)
                  }}
                  className="btn-primary w-full py-2 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Apply Setup & Start Playing</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapsible Hotseat Players & Transparent Tweakable Bot Personalities Manager (1–6 Seats) */}
      {showPlayersPanel && (
        <div className="no-print card p-5 space-y-4 border-primary/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>Hotseat Players & Bot Personalities (1–6 Seats)</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Track whose turn it is in hotseat play, or inspect and tweak transparent Bot Personality decision weights
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
              const botMeta = BOT_PERSONALITIES[seat.personality]
              const effectiveWeights = getEffectiveBotWeights(seat)
              const isWeightsExpanded = expandedBotWeightSeatId === seat.id

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
                          customWeights: undefined,
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
                    {botMeta && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {botMeta.description}
                      </p>
                    )}
                  </div>

                  {/* Transparent Decision Weight Bars & Tweak Sliders */}
                  <div className="pt-1 border-t border-border/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        Decision Weights {seat.customWeights ? '(Custom Tweaked)' : '(Default)'}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedBotWeightSeatId(isWeightsExpanded ? null : seat.id)
                        }
                        className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-0.5"
                      >
                        <span>{isWeightsExpanded ? 'Hide Dials' : '🎛️ Tweak Weights'}</span>
                      </button>
                    </div>

                    {!isWeightsExpanded ? (
                      <div className="grid grid-cols-3 gap-1 text-[10px]">
                        {WEIGHT_LABELS.map((w) => (
                          <div
                            key={w.key}
                            className="bg-background/70 px-1.5 py-0.5 rounded border border-border/50 flex items-center justify-between"
                            title={`${w.label}: ${effectiveWeights[w.key]}/100`}
                          >
                            <span>{w.icon}</span>
                            <span className="font-mono font-semibold">
                              {effectiveWeights[w.key]}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1.5 bg-background p-2 rounded border border-border">
                        {WEIGHT_LABELS.map((w) => (
                          <div key={w.key} className="space-y-0.5">
                            <div className="flex justify-between text-[10px]">
                              <span>
                                {w.icon} {w.label}
                              </span>
                              <span className="font-mono font-bold">
                                {effectiveWeights[w.key]}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={effectiveWeights[w.key]}
                              onChange={(e) =>
                                handleUpdateBotWeight(
                                  seat,
                                  w.key,
                                  parseInt(e.target.value, 10)
                                )
                              }
                              className="w-full h-1.5"
                            />
                          </div>
                        ))}
                        {seat.customWeights && (
                          <button
                            type="button"
                            onClick={() => handleResetBotWeights(seat.id)}
                            className="text-[10px] text-muted-foreground hover:text-foreground underline pt-1 block"
                          >
                            Reset to {botMeta?.name} Defaults
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Collapsible Procedural Auto-Play, World Dials & Studio Preset Filter Panel */}
      {showAutoPlayPanel && (
        <div className="no-print card p-5 space-y-4 border-primary/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Procedural Seeded Auto-Play & World Generator</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Deterministic decision-tree simulation using your tweakable bot personalities, world dials, and enabled Studio Presets
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

          {/* Primary Seed, Geography & Fantasy Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-muted/40 p-3 rounded-lg border border-border/60">
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
                  className="input h-8 text-xs flex-1 font-mono"
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

          {/* World & Game Dials (Turns/Stage, Species Count, Kingdoms Count, Spread Bias, Disasters & Fantastical) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-muted/20 p-3 rounded-lg border border-border/60 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Turns per Stage</span>
                <span className="font-mono text-primary">
                  {generationSettings.turnsPerStage ?? 8} turns
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="16"
                value={generationSettings.turnsPerStage ?? 8}
                onChange={(e) =>
                  persistWorldUpdate((prev) => ({
                    ...prev,
                    generationSettings: {
                      ...prev.generationSettings,
                      turnsPerStage: parseInt(e.target.value, 10),
                    },
                  }))
                }
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Starting Species (Stage 2)</span>
                <span className="font-mono text-primary">
                  {generationSettings.startingSpeciesCount ?? 3}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={generationSettings.startingSpeciesCount ?? 3}
                onChange={(e) =>
                  persistWorldUpdate((prev) => ({
                    ...prev,
                    generationSettings: {
                      ...prev.generationSettings,
                      startingSpeciesCount: parseInt(e.target.value, 10),
                    },
                  }))
                }
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Starting Kingdoms (Stage 3)</span>
                <span className="font-mono text-primary">
                  {generationSettings.startingKingdomsCount ?? 3}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={generationSettings.startingKingdomsCount ?? 3}
                onChange={(e) =>
                  persistWorldUpdate((prev) => ({
                    ...prev,
                    generationSettings: {
                      ...prev.generationSettings,
                      startingKingdomsCount: parseInt(e.target.value, 10),
                    },
                  }))
                }
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Map Spread Bias</span>
                <span className="font-mono text-primary">
                  {generationSettings.spreadBias ?? 75}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={generationSettings.spreadBias ?? 75}
                onChange={(e) =>
                  persistWorldUpdate((prev) => ({
                    ...prev,
                    generationSettings: {
                      ...prev.generationSettings,
                      spreadBias: parseInt(e.target.value, 10),
                    },
                  }))
                }
                className="w-full"
              />
            </div>
          </div>

          {/* Toggles for Disasters, Fantastical Prompts, and Studio Preset Pool Filter */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generationSettings.allowDisasters !== false}
                  onChange={(e) =>
                    persistWorldUpdate((prev) => ({
                      ...prev,
                      generationSettings: {
                        ...prev.generationSettings,
                        allowDisasters: e.target.checked,
                      },
                    }))
                  }
                />
                <span>Allow Ace Cataclysms</span>
              </label>

              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generationSettings.allowFantastical !== false}
                  onChange={(e) =>
                    persistWorldUpdate((prev) => ({
                      ...prev,
                      generationSettings: {
                        ...prev.generationSettings,
                        allowFantastical: e.target.checked,
                      },
                    }))
                  }
                />
                <span>Allow Fantastical Face Cards (J/Q/K)</span>
              </label>

              <label className="inline-flex items-center gap-1.5 cursor-pointer font-semibold text-primary">
                <input
                  type="checkbox"
                  checked={generateIntoNewWorld || !!world.isLocked}
                  onChange={(e) => setGenerateIntoNewWorld(e.target.checked)}
                />
                <span>Save Full Generation as New World (Safe Mode)</span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => setShowPresetPoolFilter(!showPresetPoolFilter)}
              className="btn-outline px-2.5 py-1 text-xs flex items-center gap-1.5"
            >
              <span>
                🧱 Studio Preset Pool ({disabledPresets.length} Disabled)
              </span>
              {showPresetPoolFilter ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {/* Collapsible Studio Preset Pool Filter (Toggle which default Species/Kingdoms/Myths/Actions Auto-Play can use) */}
          {showPresetPoolFilter && (
            <div className="p-3.5 rounded-lg border border-border bg-muted/30 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-1.5">
                  {(
                    [
                      { id: 'species', label: `Species (${SPECIES_PRESETS.length})` },
                      { id: 'society', label: `Kingdoms (${SOCIETY_PRESETS.length})` },
                      { id: 'myth', label: `Myths (${MYTH_PRESETS.length})` },
                      { id: 'actions', label: `Turn Actions (${STAGE_ACTION_PRESETS.length})` },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setPresetFilterTab(t.id)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        presetFilterTab === t.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background border border-border'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                {disabledPresets.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      persistWorldUpdate((prev) => ({
                        ...prev,
                        generationSettings: {
                          ...prev.generationSettings,
                          disabledPresetIds: [],
                        },
                      }))
                    }
                    className="text-xs text-primary hover:underline"
                  >
                    Enable All Studio Presets
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-44 overflow-y-auto pr-1">
                {(presetFilterTab === 'species'
                  ? SPECIES_PRESETS
                  : presetFilterTab === 'society'
                    ? SOCIETY_PRESETS
                    : presetFilterTab === 'myth'
                      ? MYTH_PRESETS
                      : STAGE_ACTION_PRESETS
                ).map((item) => {
                  const isDisabled = disabledPresets.includes(item.id)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTogglePresetDisabled(item.id)}
                      className={`p-1.5 rounded border text-left text-[11px] flex items-center justify-between gap-1.5 transition-colors ${
                        isDisabled
                          ? 'border-border bg-muted/50 opacity-50 line-through'
                          : 'border-primary/40 bg-background font-medium'
                      }`}
                    >
                      <span className="truncate">
                        {item.icon} {item.name}
                      </span>
                      <span className="text-[10px] shrink-0">
                        {isDisabled ? 'OFF' : 'ON'}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAutoStepOneTurn}
                disabled={world.isLocked}
                className="btn-outline px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                <PlayIcon className="h-3.5 w-3.5" />
                <span>Auto-Play 1 Turn</span>
              </button>
              <button
                type="button"
                onClick={handleAutoPlayCurrentStage}
                disabled={world.isLocked}
                className="btn-outline px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                <FastForward className="h-3.5 w-3.5" />
                <span>Auto-Play Current Stage</span>
              </button>
              <button
                type="button"
                onClick={handleAutoPlayFullWorld}
                className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Generate Full 4-Stage World</span>
              </button>
            </div>

            {drawHistory.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (companionMode !== 'full-studio') handleCompanionModeChange('full-studio')
                    setActiveTab('map')
                  }}
                  className="px-2.5 py-1.5 rounded border border-primary/40 bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20"
                >
                  🗺️ View World Map
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (companionMode !== 'full-studio') handleCompanionModeChange('full-studio')
                    setActiveTab('entities')
                  }}
                  className="px-2.5 py-1.5 rounded border border-border bg-background text-xs font-semibold hover:bg-accent"
                >
                  🏛️ Keeper Codex ({world.entities.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (companionMode !== 'full-studio') handleCompanionModeChange('full-studio')
                    setActiveTab('timeline')
                  }}
                  className="px-2.5 py-1.5 rounded border border-border bg-background text-xs font-semibold hover:bg-accent"
                >
                  📜 Historian ({drawHistory.length})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Cards or Split View */}
      {(activeTab === 'cards' || activeTab === 'split') && (
        <div className="space-y-4">
          {/* Primary Action & Stage Suit Summary Bar */}
          <div className="card p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDrawCard}
                disabled={deck.length === 0 || world.isLocked}
                className="btn-primary flex items-center space-x-2 px-5 sm:px-6 py-2.5 text-sm font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlayIcon className="h-4 w-4" />
                <span>Draw Card ({deck.length})</span>
              </button>
              <button
                type="button"
                onClick={handleAutoStepOneTurn}
                disabled={world.isLocked}
                className="btn-outline flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold disabled:opacity-50"
                title="Let the current player's Bot Personality resolve 1 turn automatically"
              >
                <Bot className="h-3.5 w-3.5" />
                <span>Auto-Step</span>
              </button>
              <button
                type="button"
                onClick={handleReshuffleDeck}
                className="btn-outline flex items-center space-x-1.5 px-2.5 py-2 text-xs"
                title="Reshuffle current stage deck"
              >
                <Shuffle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reset Deck</span>
              </button>
            </div>

            {/* Active Stage 4-Suit Quick Pills & Stage Brief Toggle */}
            <div className="flex flex-wrap items-center gap-1.5">
              {stagesEnabled &&
                Object.entries(STAGE_POWERS[currentStage] || {}).map(([suit, power]) => (
                  <span
                    key={suit}
                    className="hidden xl:inline-flex items-center gap-1 px-2 py-1 rounded bg-muted/60 border border-border text-xs font-medium"
                  >
                    <span
                      className={`font-bold ${
                        suit === '♥' || suit === '♦' ? 'text-red-500' : ''
                      }`}
                    >
                      {suit}
                    </span>
                    <span>{power.name}</span>
                  </span>
                ))}

              <button
                type="button"
                onClick={() => setShowStageBriefDrawer(!showStageBriefDrawer)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium border flex items-center gap-1 ${
                  showStageBriefDrawer
                    ? 'bg-secondary border-primary/40 font-semibold'
                    : 'bg-background border-border hover:bg-accent'
                }`}
              >
                <span>Stage Suits & Setup</span>
                {showStageBriefDrawer ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Active Card + Stage Power Display */}
          <div
            className={`grid grid-cols-1 ${
              showPowerDetails ? 'lg:grid-cols-12' : ''
            } gap-4`}
          >
            {/* Left: Playing Card Visual (Compact on Mobile, Full Card on Desktop) */}
            <div className="lg:col-span-4 card p-4 sm:p-6 flex flex-col items-center justify-center min-h-[220px] sm:min-h-[300px]">
              {drawnCard ? (
                <div
                  className={`w-full max-w-[165px] sm:max-w-[205px] aspect-[5/7] ${bgColor} rounded-xl border-4 border-gray-300 dark:border-gray-600 shadow-xl flex flex-col items-center justify-center p-4 sm:p-6 relative`}
                >
                  {drawnCard.value !== JOKER && (
                    <>
                      <div className={`absolute top-2 left-3 text-xl sm:text-2xl font-bold ${color}`}>
                        {drawnCard.value}
                      </div>
                      <div className={`absolute top-7 sm:top-8 left-3 text-lg sm:text-xl ${color}`}>
                        {drawnCard.suit}
                      </div>
                    </>
                  )}
                  <div className={`text-5xl sm:text-7xl font-bold ${color} mb-2 sm:mb-3`}>
                    {drawnCard.value === JOKER ? '🃏' : drawnCard.suit}
                  </div>
                  {drawnCard.value !== JOKER && (
                    <div className={`text-4xl sm:text-5xl font-bold ${color}`}>{drawnCard.value}</div>
                  )}
                  {drawnCard.value !== JOKER && (
                    <>
                      <div
                        className={`absolute bottom-2 right-3 text-xl sm:text-2xl font-bold ${color} rotate-180`}
                      >
                        {drawnCard.value}
                      </div>
                      <div
                        className={`absolute bottom-7 sm:bottom-8 right-3 text-lg sm:text-xl ${color} rotate-180`}
                      >
                        {drawnCard.suit}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  <div className="text-5xl mb-3">🃏</div>
                  <p className="text-sm sm:text-base font-semibold">Tap "Draw Card" to begin</p>
                  <p className="text-xs mt-1">
                    {deck.length} cards remaining in {currentStageData?.name || 'deck'} · Or tap Auto-Play to generate a world
                  </p>
                </div>
              )}
            </div>

            {/* Right: Stage Power Prompt & Optional Digital Map/Codex Presets (8 cols) */}
            {showPowerDetails && (
              <div className="lg:col-span-8 card p-4 sm:p-6 flex flex-col justify-between space-y-4">
                {drawnCard && stagesEnabled && powerData ? (
                  <div className="space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                          Stage {currentStageData?.number}: {currentStageData?.name} ({currentStageData?.eraLabel})
                        </span>
                        <div className="text-xl sm:text-2xl font-bold flex flex-wrap items-center gap-2 mt-0.5">
                          <span>
                            {isFantastical && powerData.fantasticalDescription
                              ? 'Fantastical '
                              : ''}
                            {powerData.power}
                          </span>
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
                      </div>
                      {latestRecord?.actionTitle && (
                        <span className="px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold">
                          ✓ {latestRecord.actionTitle}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-muted/30 p-3.5 rounded-lg border border-border/60 text-xs">
                      <div>
                        <span className="font-semibold text-muted-foreground block mb-1">
                          Rule Prompt:
                        </span>
                        <p className="text-sm leading-relaxed">
                          {isFantastical && powerData.fantasticalDescription
                            ? powerData.fantasticalDescription
                            : powerData.description}
                        </p>
                      </div>
                      <div>
                        <span className="font-semibold text-muted-foreground block mb-1">
                          Inspiration & Examples:
                        </span>
                        <p className="text-muted-foreground leading-relaxed">{powerData.examples}</p>
                      </div>
                    </div>

                    {/* Optional Collapsible Digital Map & Codex Action Presets */}
                    {availableActionPresets.length > 0 && latestRecord && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setShowDigitalPresets(!showDigitalPresets)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-muted/40 hover:bg-accent/50 text-xs font-semibold transition-colors"
                        >
                          <span className="flex items-center gap-1.5 text-primary">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>
                              Apply Turn to Digital Map & Codex (Optional · {availableActionPresets.length} Presets)
                            </span>
                          </span>
                          {showDigitalPresets ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>

                        {showDigitalPresets && (
                          <div className="mt-2.5 p-3 rounded-lg border border-border/70 bg-muted/20 space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-[11px] font-semibold text-muted-foreground">
                                Target Tile / Entities (leave blank for smart auto-placement):
                              </span>
                              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                <input
                                  type="text"
                                  value={actionTargetTileCoord}
                                  onChange={(e) => setActionTargetTileCoord(e.target.value)}
                                  placeholder="Auto tile or col,row"
                                  className="input h-7 w-32 px-2 text-xs font-mono"
                                  title="Target tile coordinate (col,row) or leave blank to auto-pick an open land tile"
                                />
                                {world.entities.length > 0 && (
                                  <select
                                    value={actionTargetEntityId}
                                    onChange={(e) => setActionTargetEntityId(e.target.value)}
                                    className="input h-7 text-xs py-0 px-2"
                                    title="Primary Species / Kingdom / Myth involved"
                                  >
                                    <option value="">
                                      Auto Entity ({world.entities[world.entities.length - 1]?.name})
                                    </option>
                                    {world.entities.map((ent) => (
                                      <option key={ent.id} value={ent.id}>
                                        {ent.icon} {ent.name}
                                      </option>
                                    ))}
                                  </select>
                                )}
                                {world.entities.length > 1 && (
                                  <select
                                    value={actionSecondEntityId}
                                    onChange={(e) => setActionSecondEntityId(e.target.value)}
                                    className="input h-7 text-xs py-0 px-2"
                                    title="Second Entity (for Diplomatic Treaties, Trade, or Wars)"
                                  >
                                    <option value="">2nd Entity (Diplomacy)</option>
                                    {world.entities.map((ent) => (
                                      <option key={ent.id} value={ent.id}>
                                        {ent.icon} {ent.name}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {availableActionPresets.map((preset) => {
                                const isSelected = latestRecord.presetId === preset.id
                                return (
                                  <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => handleApplyActionPreset(preset)}
                                    className={`p-2.5 rounded-lg border text-left transition-all flex items-start gap-2 ${
                                      isSelected
                                        ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                        : 'border-border bg-background hover:border-primary/60 hover:bg-accent/40'
                                    }`}
                                  >
                                    <span className="text-xl shrink-0">{preset.icon}</span>
                                    <div className="min-w-0 flex-1">
                                      <div className="text-xs font-bold truncate">
                                        {preset.name}
                                      </div>
                                      <div className="text-[11px] text-muted-foreground line-clamp-2">
                                        {preset.description}
                                      </div>
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : drawnCard ? (
                  <div className="text-center text-muted-foreground py-8">
                    <p>Enable Stages & Powers to see details</p>
                  </div>
                ) : (
                  <div className="space-y-3 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary block">
                          Current Stage · Age {currentStageData?.number} of 4
                        </span>
                        <h3 className="text-base sm:text-lg font-bold">
                          {currentStageData?.name} ({currentStageData?.eraLabel})
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSetupWizardStep(3)
                          setShowSetupWizard(true)
                        }}
                        className="btn-outline px-2.5 py-1 text-xs flex items-center gap-1"
                      >
                        <Compass className="h-3.5 w-3.5 text-primary" />
                        <span>Open Pre-Stage Ceremony</span>
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/60">
                      <strong>Pre-Stage Ceremony:</strong> {STAGE_PRE_SETUP[currentStage]}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(STAGE_POWERS[currentStage] || {}).map(([suit, power]) => (
                        <div
                          key={suit}
                          className="p-2 rounded-lg border border-border bg-muted/20 flex items-center justify-between"
                        >
                          <span
                            className={`text-base font-bold ${
                              suit === '♥' || suit === '♦' ? 'text-red-500' : ''
                            }`}
                          >
                            {suit}
                          </span>
                          <span className="text-xs font-semibold">{power.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showTimelineRecords && latestRecord && (
                  <div className="border-t border-border pt-3 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Turn #{latestRecord.moveId} Historian Note
                        {latestRecord.playerName ? ` (${latestRecord.playerName})` : ''}:
                      </label>
                      {latestRecord.linkedTileIds && latestRecord.linkedTileIds.length > 0 && (
                        <span className="text-[11px] font-mono text-primary">
                          📍 Linked Tile(s): {latestRecord.linkedTileIds.map((t) => `(${t})`).join(', ')}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={latestRecord.note || ''}
                      onChange={(e) =>
                        handleUpdateRecord(latestRecord.id, { note: e.target.value })
                      }
                      placeholder="Optional note for this turn (e.g., 'Created the Whispering Peaks')..."
                      className="input w-full text-xs sm:text-sm h-9"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Collapsible Stage Pre-Setup & Suit Legend Drawer */}
          {showStageBriefDrawer && showPowerDetails && stagesEnabled && currentStageData && (
            <div className="card p-5 space-y-4 border-primary/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold">
                    {currentStageData.number}. {currentStageData.name} Stage Brief & Suit Matrix
                  </h3>
                  <p className="text-xs text-muted-foreground">{currentStageData.eraLabel}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={getStageRulesUrl(currentStage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline flex items-center space-x-1.5 px-3 py-1 text-xs"
                  >
                    <span>Stage Rules</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setShowStageBriefDrawer(false)}
                    className="p-1 hover:bg-accent rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="bg-muted/50 p-3.5 rounded-lg space-y-2.5">
                <div>
                  <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-0.5">
                    Pre-Stage Setup:
                  </p>
                  <p className="text-xs">{STAGE_PRE_SETUP[currentStage]}</p>
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
                      className="input w-full text-xs min-h-[54px]"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(STAGE_POWERS[currentStage] || {}).map(([suit, power]) => (
                  <div
                    key={suit}
                    className="flex items-center justify-between p-2.5 bg-muted/40 border border-border rounded-md"
                  >
                    <span className="text-lg font-bold">{suit}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold">{power.name}</span>
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
          )}

          {/* Collapsible Deck Configuration Drawer */}
          {showDeckDrawer && (
            <div className="card p-5 space-y-4 border-primary/30">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold">Deck & Stage Configuration</h3>
                <button
                  type="button"
                  onClick={() => setShowDeckDrawer(false)}
                  className="p-1 hover:bg-accent rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                    Presets
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => applyPreset('all')}
                      className="btn-outline flex-1 text-xs py-1.5"
                    >
                      Standard (54)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('short')}
                      className="btn-outline flex-1 text-xs py-1.5"
                    >
                      Short Game (27)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                    Numbered Cards: {numberRange[0]} – {numberRange[1]}
                  </label>
                  <div className="flex items-center gap-2">
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
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                    Fantastical Face Cards
                  </label>
                  <div className="flex gap-1.5">
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
                        className={`flex-1 py-1 px-2 rounded border text-xs font-semibold ${
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

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleReshuffleDeck}
                    className="btn-primary w-full py-1.5 text-xs font-semibold"
                  >
                    Apply & Rebuild Deck
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Map View (Defaults to Clutter-Free View Atlas Mode on Mobile) */}
      {companionMode === 'full-studio' &&
        (activeTab === 'map' || activeTab === 'split') && (
          <MapCanvas
            map={world.map}
            worldName={world.name}
            drawHistory={world.drawHistory}
            entities={world.entities}
            onChange={handleMapChange}
            initialViewOnly={isMobileDefaultViewOnly || !!world.isLocked}
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
            onBranchFromMove={handleBranchFromMove}
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
        onCreateWorld={(name, options?: CreateWorldOptions) => {
          let created = createNewWorld(name)
          if (options?.geographyPreset) {
            created.generationSettings.geographyPreset = options.geographyPreset
          }
          if (options?.seed) {
            created.generationSettings.seed = `realm-${options.seed}`
          }
          if (options?.deckVariant === 'short') {
            created.deckConfig = { ...created.deckConfig, ...SHORT_GAME_DECK_CONFIG }
          }
          created.map = createInitialMap(
            created.map.width,
            created.map.height,
            created.generationSettings.geographyPreset,
            createSeededRng(created.generationSettings.seed)
          )
          if (options?.autoGenerate) {
            created = autoPlayFullWorld(created, created.generationSettings.turnsPerStage ?? 8)
          }
          const saved = saveWorld(created)
          setActiveWorldId(saved.id)
          setWorld(saved)
          setSavedWorlds(listSavedWorlds())
          setDeck(buildShuffledDeck(saved.deckConfig))
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
        onDuplicateWorld={handleDuplicateWorld}
        onToggleLockWorld={handleToggleLockWorld}
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
                <h4 className="font-semibold">1. Companion vs. World Studio Modes</h4>
                <p className="text-muted-foreground">
                  Toggle between <strong>Tabletop Companion</strong> (for physical map play & quick age power lookups) and <strong>World Studio</strong> (integrated map, codex, timeline, and auto-play).
                </p>
              </div>
              <div>
                <h4 className="font-semibold">2. Plain Lego-Block Species & Snap-On Traits</h4>
                <p className="text-muted-foreground">
                  Species start plain like modular Lego blocks—choose an icon, settlement set, and primary/secondary color swatch, then snap on traits and abilities as card draws shape their story.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">3. Transparent Bot Personalities & Preset Dials</h4>
                <p className="text-muted-foreground">
                  Inspect and tweak each Bot Personality’s 6 decision weights, adjust world generation dials, and toggle which Studio Presets Auto-Play can use.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">4. Non-Destructive World & Timeline Protection</h4>
                <p className="text-muted-foreground">
                  Lock worlds against accidental edits, duplicate worlds in the World Manager, or click <strong>Branch New World</strong> on any timeline turn to explore alternate histories safely.
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
