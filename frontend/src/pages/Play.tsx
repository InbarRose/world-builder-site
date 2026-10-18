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
import {
  BOT_PERSONALITIES,
  EntityPreset,
  PLAYER_COLORS,
  RELATIONSHIP_PRESETS,
  SOCIETY_PRESETS,
  SPECIES_PRESETS,
  StageActionPreset,
  getActionPresetsForDraw,
} from '../engine/presets'
import { addSlotToTile, createInitialMap, getTileId } from '../engine/mapEngine'
import { MapCanvas } from '../components/MapCanvas'
import { TimelinePanel } from '../components/TimelinePanel'
import { EntityRegistry } from '../components/EntityRegistry'
import { WorldManagerModal } from '../components/WorldManagerModal'

type StudioTab = 'cards' | 'map' | 'timeline' | 'entities' | 'split'
type SetupWizardStep = 1 | 2 | 3 | 4

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
  const [showSetupWizard, setShowSetupWizard] = useState(false)
  const [setupWizardStep, setSetupWizardStep] = useState<SetupWizardStep>(1)
  const [showDeckDrawer, setShowDeckDrawer] = useState(false)
  const [showStageBriefDrawer, setShowStageBriefDrawer] = useState(false)
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [showDigitalPresets, setShowDigitalPresets] = useState(false)
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
    persistWorldUpdate((prev) => {
      const target = findOpenLandCoord(prev.map)
      const coordStr = getTileId(target.col, target.row)
      const parentSpecies =
        preset.category === 'society'
          ? prev.entities.find((e) => e.category === 'species')
          : undefined
      const settlementIcons =
        preset.settlementIcons || parentSpecies?.settlementIcons

      const newEntity: WorldEntity = {
        id: `ent_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: preset.name,
        category: preset.category,
        stageCreated: prev.currentStage,
        description: preset.description,
        traits: [...preset.traits],
        abilities: [...preset.abilities],
        status: 'Flourishing',
        color: preset.color,
        secondaryColor: preset.secondaryColor,
        icon: preset.icon,
        archetype: preset.archetype,
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
            icon: settlementIcons?.camp || preset.icon,
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
            icon: settlementIcons?.city || preset.icon,
            priority: 99,
            linkedEntityId: newEntity.id,
          })
        } else {
          updated.overlay = 'myth'
          updated = addSlotToTile(updated, {
            category: 'myth',
            type: preset.id,
            name: preset.name,
            icon: preset.icon,
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
          [prev.currentStage]: `${stagePrefix}• Pre-Stage Created: ${preset.icon} ${preset.name} at (${coordStr})`,
        },
      }
    })
  }

  const handleApplyActionPreset = (preset: StageActionPreset) => {
    if (!latestRecord) return

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

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Streamlined Studio Top Bar */}
      <div className="no-print card p-3 sm:p-4 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <Globe className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h1 className="text-lg sm:text-xl font-bold truncate">{world.name}</h1>
                {currentStageData && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                    {currentStageData.number}. {currentStageData.name}
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
                {drawHistory.length} turns · {world.entities.length} codex entries · {players.length} seat(s)
              </p>
            </div>
          </div>

          {/* Primary Quick Toggles: Auto-Play, Players, Worlds & Options */}
          <div className="flex flex-wrap items-center gap-1.5">
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
                Step through world geography, player seats, pre-stage species/kingdom creation, and deck pacing
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

          {/* Step 3: Pre-Stage Creation Ceremony */}
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

              {/* Stage 2 Primal: Spawn Species Presets with Companion Settlement Icons */}
              {currentStage === 'primal' && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-primary">
                    Click a Species Preset to Spawn in Your World (includes matching Camp → Village → Town → City → Capital icons):
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
                            <span>{sp.icon}</span>
                            <span>{sp.name}</span>
                          </span>
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: sp.color }}
                          />
                        </div>
                        <div className="text-[11px] text-muted-foreground line-clamp-1">
                          {sp.description}
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
                            <span>{soc.icon}</span>
                            <span>{soc.name}</span>
                          </span>
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: soc.color }}
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

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAutoStepOneTurn}
                className="btn-outline px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5"
              >
                <PlayIcon className="h-3.5 w-3.5" />
                <span>Auto-Play 1 Turn</span>
              </button>
              <button
                type="button"
                onClick={handleAutoPlayCurrentStage}
                className="btn-outline px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5"
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
          {/* Primary Action & Stage Bar — Clean & Distraction-Free */}
          <div className="card p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDrawCard}
                disabled={deck.length === 0}
                className="btn-primary flex items-center space-x-2 px-5 sm:px-6 py-2.5 text-sm font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlayIcon className="h-4 w-4" />
                <span>Draw Card ({deck.length})</span>
              </button>
              <button
                type="button"
                onClick={handleAutoStepOneTurn}
                className="btn-outline flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold"
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

            {/* Quick Stage Switcher & Stage Brief Toggle */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
              {stagesEnabled && (
                <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border">
                  {STAGES.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleStageChange(st.id)}
                      className={`px-2 sm:px-2.5 py-1 rounded text-xs font-semibold transition-colors whitespace-nowrap ${
                        currentStage === st.id
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {st.number}. {st.name}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowStageBriefDrawer(!showStageBriefDrawer)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium border flex items-center gap-1 ${
                  showStageBriefDrawer
                    ? 'bg-secondary border-primary/40 font-semibold'
                    : 'bg-background border-border hover:bg-accent'
                }`}
              >
                <span>Stage Suits</span>
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
                  <div className="text-center text-muted-foreground py-6 space-y-1.5">
                    <p className="text-sm sm:text-base font-medium">
                      Draw a card to reveal its stage power & prompt
                    </p>
                    <p className="text-xs">
                      Play purely with physical paper & pencil, or record events into the Historian Timeline, Keeper Codex, and World Atlas.
                    </p>
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
            initialViewOnly={isMobileDefaultViewOnly}
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
