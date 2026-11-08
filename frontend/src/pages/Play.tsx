import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
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
  Check,
  FileJson,
  Volume2,
  Home,
  Settings,
  Share2,
  ChevronDown,
  Search,
  Keyboard,
  X,
  Radio,
  Sliders,
} from 'lucide-react'
import {
  BotPersonalityId,
  BotPersonalityWeights,
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
  getEffectiveBotWeights,
} from '../engine/presets'
import {
  StudioConceptGroup,
  getPresetConceptGroup,
  recommendBestPreset,
} from '../engine/affinityEngine'
import {
  generateFeatureName,
  generateLedgerProse,
} from '../engine/flavorNameEngine'
import { addSlotToTile, createDefaultTile, getTileId } from '../engine/mapEngine'
import { MapCanvas } from '../components/MapCanvas'
import { TimelinePanel } from '../components/TimelinePanel'
import { EntityRegistry } from '../components/EntityRegistry'
import { CreateWorldOptions, WorldManagerModal } from '../components/WorldManagerModal'
import { ExportSuiteModal } from '../components/ExportSuiteModal'
import { ShareTableModal } from '../components/ShareTableModal'
import { IncomingSharedWorldModal } from '../components/IncomingSharedWorldModal'
import { AgesReferenceModal } from '../components/AgesReferenceModal'
import { PlayerRosterModal } from '../components/PlayerRosterModal'
import { AutoPlayConsoleModal } from '../components/AutoPlayConsoleModal'
import { GameSetupWizardModal } from '../components/GameSetupWizardModal'
import { LoreFlyoutDrawer } from '../components/LoreFlyoutDrawer'
import { StudioLauncher } from '../components/StudioLauncher'
import { NewGameCeremonyModal } from '../components/NewGameCeremonyModal'
import { EpochCeremonyModal } from '../components/EpochCeremonyModal'
import { CommandPalette } from '../components/CommandPalette'
import { KeyboardShortcutsModal } from '../components/KeyboardShortcutsModal'
import { CampaignHooksModal } from '../components/CampaignHooksModal'
import { PresetCompendiumModal } from '../components/PresetCompendiumModal'
import { SessionZeroPrimerModal } from '../components/SessionZeroPrimerModal'
import { TableSyncModal } from '../components/TableSyncModal'
import {
  TablePeerSession,
  PeerNodeInfo,
  PeerRole,
  generateRoomCode,
  shouldAcceptIncomingWorldSync,
} from '../engine/peerSyncEngine'
import {
  getRandomCreativeSpark,
  CreativeSpark,
} from '../engine/campaignBridgeEngine'
import { saveWorldAsync } from '../engine/storageIndexedDb'
import {
  decodeWorldFromCompressedHash,
  parseSeedShareUrl,
} from '../engine/shareService'
import {
  playCardDrawSound,
  playCardFlipSound,
  playTurnPassSound,
  playStageAdvanceSound,
  playUndoSound,
  playTokenPlaceSound,
  startAmbientSoundscape,
  stopAmbientSoundscape,
  getAmbientMood,
  getAmbientVolume,
  setAmbientVolume,
  AmbientSoundscapeMood,
} from '../engine/soundEngine'
import { computeWorldStabilityIndex } from '../engine/narrativeEngine'

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
  const [flyoutEntityId, setFlyoutEntityId] = useState<string | null>(null)
  const [ambientMood, setAmbientMood] = useState<AmbientSoundscapeMood>(() => getAmbientMood())
  const [ambientVolume, setAmbientVolumeState] = useState<number>(() => getAmbientVolume())
  const worldStability = useMemo(() => computeWorldStabilityIndex(world), [world])

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
  const [presetCategory, setPresetCategory] = useState<StudioConceptGroup>('all')
  const [presetSearchQuery, setPresetSearchQuery] = useState('')
  const [showAffinityDetails, setShowAffinityDetails] = useState(false)
  const [generatedFeatureName, setGeneratedFeatureName] = useState('')
  const [showTurnVerifyDialog, setShowTurnVerifyDialog] = useState(false)
  const [turnModifiedTiles, setTurnModifiedTiles] = useState<string[]>([])
  const [turnModifiedEntities, setTurnModifiedEntities] = useState<string[]>([])
  const [stageCelebration, setStageCelebration] = useState<{ active: boolean; stageName: string } | null>(null)

  // Dedicated Modals
  const [showExportModal, setShowExportModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [incomingSharedWorld, setIncomingSharedWorld] = useState<WorldState | null>(null)
  const [showWorldManager, setShowWorldManager] = useState(false)
  const [showPlayersModal, setShowPlayersModal] = useState(false)
  const [showAutoPlayModal, setShowAutoPlayModal] = useState(false)
  const [showSetupWizardModal, setShowSetupWizardModal] = useState(false)
  const [showAgesModal, setShowAgesModal] = useState(false)
  const [showDeckEmptyDialog, setShowDeckEmptyDialog] = useState(false)
  const [showAtmosphereMenu, setShowAtmosphereMenu] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const [showEpochCeremonyModal, setShowEpochCeremonyModal] = useState(false)
  const [showNewGameCeremonyModal, setShowNewGameCeremonyModal] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)
  const [isDraftingWorkshop, setIsDraftingWorkshop] = useState(false)
  const [showCampaignHooksModal, setShowCampaignHooksModal] = useState(false)
  const [showSessionZeroPrimerModal, setShowSessionZeroPrimerModal] = useState(false)
  const [showCompendiumModal, setShowCompendiumModal] = useState(false)
  const [showTableSyncModal, setShowTableSyncModal] = useState(false)
  const [showInlineBotWeightTuner, setShowInlineBotWeightTuner] = useState(false)
  const [isSyncActive, setIsSyncActive] = useState(false)
  const [syncRoomCode, setSyncRoomCode] = useState<string>(() => {
    const paramRoom = searchParams.get('syncRoom')
    return paramRoom || generateRoomCode(world.id)
  })
  const [syncPeerRole, setSyncPeerRole] = useState<PeerRole>(() => {
    const paramRole = searchParams.get('syncRole')
    if (paramRole === 'host' || paramRole === 'co-creator' || paramRole === 'spectator') {
      return paramRole
    }
    return 'host'
  })
  const [syncDisplayName, setSyncDisplayName] = useState('Tabletop Facilitator')
  const [syncClaimedSeatId, setSyncClaimedSeatId] = useState<string | undefined>(undefined)
  const [connectedPeers, setConnectedPeers] = useState<PeerNodeInfo[]>([])
  const [syncStats, setSyncStats] = useState({
    packetsSent: 0,
    packetsReceived: 0,
    revision: 1,
  })
  const peerSessionRef = useRef<TablePeerSession | null>(null)
  const [activeCreativeSpark, setActiveCreativeSpark] = useState<CreativeSpark | null>(null)
  const [conclaveHandoff, setConclaveHandoff] = useState<{
    active: boolean
    player: PlayerSeat
    previousPlayerName: string
  } | null>(null)

  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase()
      const isInput = activeTag === 'input' || activeTag === 'textarea'

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setShowCommandPalette((prev) => !prev)
      } else if (e.key === '?' && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        setShowShortcutsModal(true)
      }
    }
    window.addEventListener('keydown', handleGlobalShortcuts)
    return () => window.removeEventListener('keydown', handleGlobalShortcuts)
  }, [])
  const [isInLauncher, setIsInLauncher] = useState<boolean>(() => {
    const view = searchParams.get('view')
    const menu = searchParams.get('menu')
    if (view === 'launcher' || menu === 'true') return true
    if (searchParams.get('world') || searchParams.get('syncRoom')) return false
    return true
  })

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
      saveWorldAsync(next).catch(() => {})
      setSavedWorlds(listSavedWorlds())
      if (peerSessionRef.current && peerSessionRef.current.getRole() !== 'spectator') {
        peerSessionRef.current.broadcastWorldState(next)
        setSyncStats(peerSessionRef.current.getStats())
      }
      return next
    })
  }, [])

  const handleStartTableSync = useCallback(
    (options: {
      roomCode: string
      role: PeerRole
      displayName: string
      claimedSeatId?: string
    }) => {
      if (peerSessionRef.current) {
        peerSessionRef.current.stop()
      }
      const session = new TablePeerSession({
        roomCode: options.roomCode,
        displayName: options.displayName,
        role: options.role,
        claimedSeatId: options.claimedSeatId,
        callbacks: {
          onWorldSync: (incomingWorld, envelope) => {
            setWorld((prev) => {
              const localRev = peerSessionRef.current?.getRevision() ?? 1
              if (
                shouldAcceptIncomingWorldSync(
                  prev,
                  incomingWorld,
                  envelope.revision,
                  localRev - 1
                )
              ) {
                const saved = saveWorld(incomingWorld)
                saveWorldAsync(saved).catch(() => {})
                setSavedWorlds(listSavedWorlds())
                return saved
              }
              return prev
            })
            if (peerSessionRef.current) {
              setSyncStats(peerSessionRef.current.getStats())
            }
          },
          onCardDrawn: (card) => {
            if (card !== undefined) {
              setDrawnCard(card)
              playCardFlipSound()
            }
          },
          onTileSpotlight: (tileId) => {
            setSelectedTileId(tileId)
          },
          onPeersChanged: (peers) => {
            setConnectedPeers(peers)
            if (peerSessionRef.current) {
              setSyncStats(peerSessionRef.current.getStats())
            }
          },
          onRequestSync: () => {
            if (peerSessionRef.current && peerSessionRef.current.getRole() === 'host') {
              peerSessionRef.current.broadcastWorldState(world, drawnCard, powerData?.power)
              setSyncStats(peerSessionRef.current.getStats())
            }
          },
        },
      })
      peerSessionRef.current = session
      session.start()
      setSyncRoomCode(session.roomCode)
      setSyncPeerRole(options.role)
      setSyncDisplayName(options.displayName)
      setSyncClaimedSeatId(options.claimedSeatId)
      setIsSyncActive(true)
      setSyncStats(session.getStats())
    },
    [world, drawnCard, powerData]
  )

  const handleStopTableSync = useCallback(() => {
    if (peerSessionRef.current) {
      peerSessionRef.current.stop()
      peerSessionRef.current = null
    }
    setIsSyncActive(false)
    setConnectedPeers([])
  }, [])

  useEffect(() => {
    const paramRoom = searchParams.get('syncRoom')
    const paramRole = searchParams.get('syncRole') as PeerRole | null
    if (paramRoom && !peerSessionRef.current) {
      handleStartTableSync({
        roomCode: paramRoom,
        role:
          paramRole === 'spectator' || paramRole === 'co-creator'
            ? paramRole
            : 'spectator',
        displayName:
          paramRole === 'spectator' ? 'Tabletop TV Display' : 'Co-Creator Screen',
      })
    }
    return () => {
      if (peerSessionRef.current) {
        peerSessionRef.current.stop()
        peerSessionRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Tabletop Frictionless Sharing: Check for incoming shared realm from URL hash (#state=...) or query (?seed=...)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash
    const search = window.location.search

    let foundWorld: WorldState | null = null
    if (hash && hash.includes('state=')) {
      foundWorld = decodeWorldFromCompressedHash(hash)
    } else if (search && (search.includes('seed=') || search.includes('shareType=seed'))) {
      foundWorld = parseSeedShareUrl(search)
    }

    if (foundWorld) {
      setIncomingSharedWorld(foundWorld)
    }
  }, [])


  const handleAcceptSharedWorld = useCallback(() => {
    if (!incomingSharedWorld) return
    const saved = saveWorld(incomingSharedWorld)
    setActiveWorldId(saved.id)
    setWorld(saved)
    setSavedWorlds(listSavedWorlds())
    setIncomingSharedWorld(null)
    setIsInLauncher(false)
    playStageAdvanceSound()
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [incomingSharedWorld])

  const handleDeclineSharedWorld = useCallback(() => {
    setIncomingSharedWorld(null)
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Hydrate world from URL if specified
  useEffect(() => {
    const worldParam = searchParams.get('world')
    if (worldParam) {
      const all = listSavedWorlds()
      const found = all.find((w) => w.id === worldParam)
      if (found && found.id !== world.id) {
        setActiveWorldId(found.id)
        setWorld(found)
      }
      setIsInLauncher(false)
    } else if (searchParams.get('view') === 'launcher' || searchParams.get('menu') === 'true') {
      setIsInLauncher(true)
    }
  }, [searchParams])

  // Dismiss focus zone popovers on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.focus-popover-container')) {
        setShowAtmosphereMenu(false)
        setShowShareMenu(false)
        setShowSettingsMenu(false)
      }
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [])

  const handleReturnToLauncher = useCallback(() => {
    setIsInLauncher(true)
    setSearchParams({ view: 'launcher' })
  }, [setSearchParams])

  const handleLauncherSelectWorld = useCallback((selectedWorld: WorldState) => {
    setActiveWorldId(selectedWorld.id)
    setWorld(selectedWorld)
    setSavedWorlds(listSavedWorlds())
    setIsInLauncher(false)
    setSearchParams({ world: selectedWorld.id, mode: selectedWorld.gameMode || 'studio' })
  }, [setSearchParams])

  const handleAdvanceStageCeremonially = (nextStage: StageId, epilogueNote?: string) => {
    persistWorldUpdate((prev) => {
      const updatedHistory = [...prev.drawHistory]
      if (epilogueNote) {
        updatedHistory.push({
          id: `epilogue-${Date.now()}`,
          moveId: updatedHistory.length + 1,
          stage: prev.currentStage,
          card: { id: 'epilogue', suit: '♠', value: 'A' },
          power: 'Era Epilogue',
          playerId: activePlayer?.id || 'p1',
          playerName: activePlayer?.name || 'Table',
          timestamp: new Date().toISOString(),
          note: `[ERA CONCLUDED: ${prev.currentStage.toUpperCase()}] ${epilogueNote}`,
        })
      }
      return {
        ...prev,
        currentStage: nextStage,
        drawHistory: updatedHistory,
      }
    })
    setStageCelebration({
      active: true,
      stageName: STAGES.find((s) => s.id === nextStage)?.name || nextStage,
    })
  }


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
    setFlyoutEntityId(entityId)
    if (gameMode === 'companion') {
      setCompanionShowCodex(true)
    } else if (activeTab === 'split') {
      setSplitRightPanel('entities')
    } else {
      setActiveTab('entities')
    }
  }

  const handleToggleAmbientMood = (newMood: AmbientSoundscapeMood) => {
    if (newMood === ambientMood) {
      stopAmbientSoundscape()
      setAmbientMood('none')
    } else {
      startAmbientSoundscape(newMood)
      setAmbientMood(newMood)
    }
  }

  const isSoundMuted = ambientMood === 'none'
  const handleToggleSound = () => {
    if (ambientMood !== 'none') {
      stopAmbientSoundscape()
      setAmbientMood('none')
    } else {
      startAmbientSoundscape('campfire')
      setAmbientMood('campfire')
    }
  }

  // Global Keyboard Hotkey: Press 'M' to toggle ambient soundscape atmosphere
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement
      const isInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable)
      if (isInput) return

      if (e.key === 'm' || e.key === 'M') {
        if (ambientMood !== 'none') {
          stopAmbientSoundscape()
          setAmbientMood('none')
        } else {
          startAmbientSoundscape('campfire')
          setAmbientMood('campfire')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [ambientMood])

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

  // Target Coordinates Quick Actions: direct 1-click slot injection on selectedTileId
  const handleQuickInjectSlot = (actionType: 'settlement' | 'mountain' | 'forest' | 'anomaly') => {
    const [colStr, rowStr] = selectedTileId.split(',')
    const col = parseInt(colStr, 10) || 0
    const row = parseInt(rowStr, 10) || 0
    const tile = world.map.tiles[selectedTileId] || createDefaultTile(col, row)

    let category: 'settlement' | 'elevation' | 'vegetation' | 'structure' = 'settlement'
    let icon = '🏡'
    let name = 'New Settlement'
    let priority = 90

    if (actionType === 'mountain') {
      category = 'elevation'
      icon = '🏔️'
      name = 'Mountain Peak'
      priority = 60
    } else if (actionType === 'forest') {
      category = 'vegetation'
      icon = '🌲'
      name = 'Ancient Forest'
      priority = 50
    } else if (actionType === 'anomaly') {
      category = 'structure'
      icon = '✨'
      name = 'Arcane Anomaly'
      priority = 95
    }

    const updatedTile = addSlotToTile(tile, {
      category,
      type: actionType,
      name,
      icon,
      priority,
    })

    const newMap: MapState = {
      ...world.map,
      tiles: {
        ...world.map.tiles,
        [selectedTileId]: updatedTile,
      },
    }

    playTokenPlaceSound()
    handleWorkspaceMapChange(newMap)
  }

  // Quick link/unlink entity to current active turn
  const handleToggleLinkEntityToTurn = (entityId: string) => {
    if (turnModifiedEntities.includes(entityId)) {
      setTurnModifiedEntities((prev) => prev.filter((id) => id !== entityId))
    } else {
      setTurnModifiedEntities((prev) => [...prev, entityId])
      playTokenPlaceSound()
    }
  }

  // Draw Card action
  const handleDrawCard = async () => {
    if (world.isLocked) return
    if (deck.length === 0) {
      setShowDeckEmptyDialog(true)
      return
    }

    playCardDrawSound()
    setTimeout(() => {
      playCardFlipSound()
    }, 110)

    const newDeck = [...deck]
    const card = newDeck.pop()!
    setDeck(newDeck)
    setDrawnCard(card)
    setSelectedPreset(null)
    setGeneratedFeatureName('')
    setPresetCategory('all')
    setPresetSearchQuery('')
    setShowAffinityDetails(false)
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
      if (players.length > 1) {
        const nextIdx = (currentPlayerIndex + 1) % players.length
        const nextSeat = players[nextIdx]
        if (nextSeat) {
          setConclaveHandoff({
            active: true,
            player: nextSeat,
            previousPlayerName: players[currentPlayerIndex % players.length]?.name || 'Player',
          })
        }
      }
      playTurnPassSound()
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
    playTurnPassSound()
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
    playTurnPassSound()

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
          if (selectedPreset.cartographicSymbol) updated.cartographicSymbol = selectedPreset.cartographicSymbol
          if (selectedPreset.hasRiver) updated.hasRiver = true
          if (selectedPreset.hasRoad) updated.hasRoad = true
          if (generatedFeatureName) updated.label = generatedFeatureName

          updated = addSlotToTile(updated, {
            category: selectedPreset.slotCategory,
            type: selectedPreset.id,
            name: generatedFeatureName || selectedPreset.name,
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
    setGeneratedFeatureName('')
    setPresetCategory('all')
    setPresetSearchQuery('')
    setShowAffinityDetails(false)
    setPendingNote('')
    setTurnModifiedTiles([])
    setTurnModifiedEntities([])
    setActiveCreativeSpark(null)

    if (players.length > 1) {
      const nextIdx = (currentPlayerIndex + 1) % players.length
      const nextSeat = players[nextIdx]
      if (nextSeat) {
        setConclaveHandoff({
          active: true,
          player: nextSeat,
          previousPlayerName: players[currentPlayerIndex % players.length]?.name || 'Player',
        })
      }
    }
    playTurnPassSound()

    if (deck.length === 0) {
      setShowDeckEmptyDialog(true)
    }
  }

  // Undo Last Turn
  const handleUndoLastTurn = () => {
    if (drawHistory.length === 0 || world.isLocked) return
    playUndoSound()
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
    playStageAdvanceSound()
    const stData = STAGES.find((s) => s.id === newStage)
    setStageCelebration({ active: true, stageName: stData?.name || newStage })
    setTimeout(() => setStageCelebration(null), 3000)
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

  const botRecommendation = useMemo(() => {
    if (!drawnCard || availableActionPresets.length === 0) return null
    return recommendBestPreset(availableActionPresets, world, activePlayer, selectedTileId)
  }, [availableActionPresets, world, activePlayer, selectedTileId, drawnCard])

  const filteredActionPresets = useMemo(() => {
    return availableActionPresets.filter((preset) => {
      if (presetCategory !== 'all') {
        const group = getPresetConceptGroup(preset)
        if (group !== presetCategory) return false
      }
      if (presetSearchQuery.trim()) {
        const q = presetSearchQuery.toLowerCase()
        const match =
          preset.name.toLowerCase().includes(q) ||
          preset.description.toLowerCase().includes(q) ||
          preset.id.toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [availableActionPresets, presetCategory, presetSearchQuery])

  const handleSelectPreset = (preset: StageActionPreset | null) => {
    if (!preset) {
      setSelectedPreset(null)
      return
    }
    setSelectedPreset(preset)
    const newName = generateFeatureName(preset.slotCategory, preset.cartographicSymbol || preset.name)
    setGeneratedFeatureName(newName)
    if (!pendingNote.trim()) {
      setPendingNote(generateLedgerProse(preset, newName, undefined, selectedTileId))
    }
  }

  const handleRerollFeatureName = () => {
    if (!selectedPreset) return
    const newName = generateFeatureName(selectedPreset.slotCategory, selectedPreset.cartographicSymbol || selectedPreset.name)
    setGeneratedFeatureName(newName)
    setPendingNote(generateLedgerProse(selectedPreset, newName, undefined, selectedTileId))
  }

  const { color, bgColor } = drawnCard
    ? getCardDisplay(drawnCard, cardColors)
    : { color: '', bgColor: '' }
  const currentStageData = STAGES.find((s) => s.id === currentStage)
  const latestTurnRecord =
    drawHistory.length > 0 ? drawHistory[drawHistory.length - 1] : undefined

  if (isInLauncher) {
    return (
      <div className="max-w-7xl mx-auto py-4">
        <StudioLauncher onSelectWorld={handleLauncherSelectWorld} />
        {showNewGameCeremonyModal && (
          <NewGameCeremonyModal
            isOpen={showNewGameCeremonyModal}
            onClose={() => setShowNewGameCeremonyModal(false)}
            onLaunchWorld={(nw) => {
              saveWorld(nw)
              handleLauncherSelectWorld(nw)
              setShowNewGameCeremonyModal(false)
            }}
          />
        )}
        {incomingSharedWorld && (
          <IncomingSharedWorldModal
            incomingWorld={incomingSharedWorld}
            onAccept={handleAcceptSharedWorld}
            onDecline={handleDeclineSharedWorld}
          />
        )}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* =========================================================================
          1. LEVEL 1: UNIFIED PLAY WORKSPACE HEADER (AAA HIERARCHY & FOCUS ZONES)
          ========================================================================= */}
      <header className="no-print card p-3 sm:p-3.5 space-y-2.5 border-border/80 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* ZONE 1 (Left): Navigation Hierarchy & Breadcrumbs */}
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            {/* Title Screen / Main Menu Button */}
            <button
              type="button"
              onClick={handleReturnToLauncher}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Return to Play Studio Main Menu"
            >
              <Home className="h-3.5 w-3.5 text-primary" />
              <span>Main Menu</span>
            </button>

            <span className="text-muted-foreground/60 select-none">/</span>

            {/* Realm Identity Pill */}
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate max-w-[200px] sm:max-w-[280px]">
                {world.name}
              </span>
              {world.isLocked && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1 border border-amber-500/30">
                  <Lock className="h-3 w-3" /> Read-Only
                </span>
              )}
            </div>

            <span className="text-muted-foreground/60 select-none">/</span>

            {/* Ceremonial Era / Stage Pill */}
            {currentStageData && gameMode !== 'free-create' && (
              <button
                type="button"
                onClick={() => setShowEpochCeremonyModal(true)}
                className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1.5 transition-all shadow-2xs"
                title="Era of the Realm: Tap to view Era Chronicle or enact Epoch Advancement Ceremony"
              >
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>Age {currentStageData.number}: {currentStageData.name}</span>
              </button>
            )}

            {/* Turn Counter Pill */}
            <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground font-mono font-medium">
              Turn #{drawHistory.length}
            </span>

            {/* Stability Index */}
            <span
              className={`hidden md:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium border ${worldStability.badgeColor}`}
              title={`World Stability Index: ${worldStability.score}/100 (${worldStability.status})`}
            >
              <span>{worldStability.icon}</span>
              <span>Stability {worldStability.score}%</span>
            </span>
          </div>

          {/* ZONE 2 (Center): Play Studio Mode Segment */}
          <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border text-xs font-semibold shadow-inner">
            <button
              type="button"
              onClick={() => handleModeChange('companion')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                gameMode === 'companion'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="3.1 Companion Mode: Card draw & live table companion"
            >
              <span>🃏 Companion</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('studio')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                gameMode === 'studio'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="3.2 Full Studio: Complete turn orchestration"
            >
              <span>🏆 Studio</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('free-create')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                gameMode === 'free-create'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="3.3 Free-Create: Map drafting & codex without rules"
            >
              <span>🎨 Free-Create</span>
            </button>
          </div>

          {/* ZONE 3 (Right): Focus Zone Trays & Administrative Settings */}
          <div className="flex items-center gap-1.5 focus-popover-container">
            {/* Active Seat Pill */}
            {activePlayer && gameMode !== 'free-create' && (
              <button
                type="button"
                onClick={() => setShowPlayersModal(true)}
                className="text-[11px] px-2.5 py-1 rounded-full text-white font-medium flex items-center gap-1 shadow-2xs hover:opacity-90 transition-opacity"
                style={{ backgroundColor: activePlayer.color }}
                title="Active Player Seat (Click to open Player Council)"
              >
                <span>{activePlayer.name}</span>
                {activePlayer.isBot && <span>· {BOT_PERSONALITIES[activePlayer.personality]?.icon}</span>}
              </button>
            )}

            {/* Atmosphere Popover / Sound Tray */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowAtmosphereMenu((prev) => !prev)
                  setShowSettingsMenu(false)
                  setShowShareMenu(false)
                }}
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  ambientMood !== 'none'
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border bg-background hover:bg-muted text-muted-foreground'
                }`}
                title="Atmosphere & Ambient Soundscapes"
                aria-label="Atmosphere Menu"
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {ambientMood === 'campfire' ? 'Hearth' : ambientMood === 'ocean' ? 'Ocean' : ambientMood === 'ether' ? 'Ether' : 'Atmosphere'}
                </span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>

              {/* Atmosphere Popover Menu */}
              {showAtmosphereMenu && (
                <div className="absolute right-0 mt-1.5 w-56 rounded-xl border border-border bg-popover/95 backdrop-blur-md p-2.5 shadow-xl z-30 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                    Ambient Atmosphere
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => handleToggleAmbientMood('campfire')}
                      className={`px-2 py-1.5 rounded-lg font-semibold flex flex-col items-center gap-0.5 transition-colors ${
                        ambientMood === 'campfire'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-muted/50 hover:bg-muted text-foreground'
                      }`}
                    >
                      <span className="text-sm">🔥</span>
                      <span className="text-[10px]">Hearth</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAmbientMood('ocean')}
                      className={`px-2 py-1.5 rounded-lg font-semibold flex flex-col items-center gap-0.5 transition-colors ${
                        ambientMood === 'ocean'
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-muted/50 hover:bg-muted text-foreground'
                      }`}
                    >
                      <span className="text-sm">🌊</span>
                      <span className="text-[10px]">Ocean</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAmbientMood('ether')}
                      className={`px-2 py-1.5 rounded-lg font-semibold flex flex-col items-center gap-0.5 transition-colors ${
                        ambientMood === 'ether'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-muted/50 hover:bg-muted text-foreground'
                      }`}
                    >
                      <span className="text-sm">✨</span>
                      <span className="text-[10px]">Ether</span>
                    </button>
                  </div>
                  {ambientMood !== 'none' && (
                    <div className="space-y-1 pt-1 border-t border-border/60">
                      <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                        <span>Volume</span>
                        <span>{Math.round(ambientVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={ambientVolume}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value)
                          setAmbientVolumeState(val)
                          setAmbientVolume(val)
                        }}
                        className="w-full h-1.5 accent-primary cursor-pointer"
                        aria-label="Ambient Volume Slider"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Spotlight Command Palette (Ctrl+K) */}
            <button
              type="button"
              onClick={() => setShowCommandPalette(true)}
              className="btn-outline px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 hover:border-primary/60"
              title="Open Spotlight Command Palette (Ctrl+K)"
              aria-label="Command Palette"
            >
              <Search className="h-3.5 w-3.5 text-primary" />
              <span className="hidden md:inline font-mono text-[10px] bg-muted px-1 py-0.5 rounded border border-border text-muted-foreground">
                Ctrl+K
              </span>
            </button>

            {/* TTRPG Campaign Quick Launchers */}
            <button
              type="button"
              onClick={() => setShowCompendiumModal(true)}
              aria-label="Tabletop Presets & Tropes Compendium"
              className="btn-outline px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10"
              title="Tabletop Presets & Tropes Compendium (200+ canonical powers, whiteboard tropes, traditions, and skills)"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Compendium</span>
            </button>
            <button
              type="button"
              onClick={() => setShowCampaignHooksModal(true)}
              aria-label="Tabletop Campaign Adventure Hooks"
              className="btn-outline px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
              title="Tabletop Campaign Adventure Hooks & Rumor Tables (D&D / OSR)"
            >
              <Compass className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Hooks</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSessionZeroPrimerModal(true)}
              aria-label="Session Zero 1-Page Campaign Primer"
              className="btn-outline px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 text-primary border-primary/30 hover:bg-primary/10"
              title="Session Zero 1-Page Campaign Primer Handout"
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Primer</span>
            </button>
            <button
              type="button"
              onClick={() => setShowTableSyncModal(true)}
              aria-label="Real-Time Table Peer Synchronization"
              className={`btn-outline px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 ${
                isSyncActive
                  ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
                  : 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
              }`}
              title="Real-Time Table Peer & Second-Screen TV Sync"
            >
              <Radio className={`h-3.5 w-3.5 ${isSyncActive ? 'animate-pulse' : ''}`} />
              <span className="hidden lg:inline">
                {isSyncActive ? `Sync (${connectedPeers.length + 1})` : 'Table Sync'}
              </span>
            </button>

            {/* Share & Export Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowShareMenu((prev) => !prev)
                  setShowAtmosphereMenu(false)
                  setShowSettingsMenu(false)
                }}
                className="btn-outline px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1.5"
                title="Share Realm & Export Suite"
                aria-label="Share & Export Menu"
              >
                <Share2 className="h-3.5 w-3.5 text-primary" />
                <span className="hidden sm:inline">Share</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>

              {showShareMenu && (
                <div className="absolute right-0 mt-1.5 w-56 rounded-xl border border-border bg-popover/95 backdrop-blur-md p-1.5 shadow-xl z-30 space-y-1 animate-in fade-in zoom-in-95 duration-150 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCompendiumModal(true)
                      setShowShareMenu(false)
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-accent flex items-center gap-2 font-medium text-indigo-600 dark:text-indigo-400"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>📖 Presets & Tropes Compendium</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCampaignHooksModal(true)
                      setShowShareMenu(false)
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-accent flex items-center gap-2 font-medium text-amber-600 dark:text-amber-400"
                  >
                    <Compass className="h-3.5 w-3.5" />
                    <span>⚔️ Campaign Hooks & Rumors</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSessionZeroPrimerModal(true)
                      setShowShareMenu(false)
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-accent flex items-center gap-2 font-medium text-primary"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>📜 Session Zero Primer Handout</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTableSyncModal(true)
                      setShowShareMenu(false)
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-accent flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400"
                  >
                    <Radio className="h-3.5 w-3.5" />
                    <span>📡 Live Table &amp; TV Sync</span>
                  </button>
                  <div className="border-t border-border my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setShowShareModal(true)
                      setShowShareMenu(false)
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-accent flex items-center gap-2 font-medium"
                  >
                    <FileJson className="h-3.5 w-3.5 text-primary" />
                    <span>Share & Backup JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowExportModal(true)
                      setShowShareMenu(false)
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-accent flex items-center gap-2 font-medium"
                  >
                    <Download className="h-3.5 w-3.5 text-primary" />
                    <span>Export Suite</span>
                  </button>
                </div>
              )}
            </div>

            {/* ⚙️ Administrative Settings Menu (Hiding Administrative Clutter Away) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowSettingsMenu((prev) => !prev)
                  setShowAtmosphereMenu(false)
                  setShowShareMenu(false)
                }}
                className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Studio Administration & Ceremony Settings"
                aria-label="Settings Menu"
              >
                <Settings className="h-4 w-4" />
              </button>

              {showSettingsMenu && (
                <div className="absolute right-0 mt-1.5 w-56 rounded-xl border border-border bg-popover/95 backdrop-blur-md p-1.5 shadow-xl z-30 space-y-1 animate-in fade-in zoom-in-95 duration-150 text-xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                    Game Ceremonies & Roster
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPlayersModal(true)
                      setShowSettingsMenu(false)
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-accent flex items-center justify-between font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      <span>Player Council</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                      {players.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowEpochCeremonyModal(true)
                      setShowSettingsMenu(false)
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-accent flex items-center gap-2 font-medium text-amber-700 dark:text-amber-300"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>Epoch Ceremony</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAutoPlayModal(true)
                      setShowSettingsMenu(false)
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-accent flex items-center gap-2 font-medium"
                  >
                    <Bot className="h-3.5 w-3.5 text-primary" />
                    <span>Auto-Play Console</span>
                  </button>

                  <div className="h-px bg-border my-1" />
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                    Realm Administration
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowWorldManager(true)
                      setShowSettingsMenu(false)
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-accent flex items-center justify-between font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-primary" />
                      <span>World Archives</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                      {savedWorlds.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowSetupWizardModal(true)
                      setShowSettingsMenu(false)
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-accent flex items-center gap-2 font-medium"
                  >
                    <Wand2 className="h-3.5 w-3.5 text-primary" />
                    <span>Setup Wizard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleToggleLockWorld(world.id)
                      setShowSettingsMenu(false)
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-accent flex items-center gap-2 font-medium"
                  >
                    {world.isLocked ? (
                      <>
                        <Unlock className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Unlock Realm</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5 text-amber-500" />
                        <span>Lock Realm (Read-Only)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowShortcutsModal(true)
                      setShowSettingsMenu(false)
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-accent flex items-center gap-2 font-medium"
                  >
                    <Keyboard className="h-3.5 w-3.5 text-primary" />
                    <span>Keyboard Shortcuts (?)</span>
                  </button>

                  <div className="h-px bg-border my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setShowSettingsMenu(false)
                      handleReturnToLauncher()
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-accent flex items-center gap-2 font-medium text-muted-foreground hover:text-foreground"
                  >
                    <Home className="h-3.5 w-3.5" />
                    <span>Exit to Title Screen</span>
                  </button>
                </div>
              )}
            </div>

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
              {/* Geopolitical Stability / World Tension Index */}
              <div
                className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all ${worldStability.badgeColor}`}
                title={`${worldStability.summary} (Score: ${worldStability.score}/100 • Alliances: ${worldStability.breakdown.alliancesCount}, Conflicts: ${worldStability.breakdown.conflictsCount}, Cataclysms: ${worldStability.breakdown.cataclysmsCount}, Settlements: ${worldStability.breakdown.settlementCount})`}
                aria-label={`World Stability Index: ${worldStability.status}`}
              >
                <span>{worldStability.icon}</span>
                <span className="font-bold hidden md:inline">{worldStability.status}</span>
                <span className="text-[10px] font-mono opacity-85">({worldStability.score}%)</span>
              </div>

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

      {/* Celebratory Stage Advance Banner */}
      {stageCelebration && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 top-16 z-50 flex items-center justify-center pointer-events-none animate-in fade-in zoom-in-95 duration-300"
        >
          <div className="px-6 py-2.5 rounded-2xl bg-amber-500 text-stone-950 font-black shadow-2xl backdrop-blur-md border border-amber-300 flex items-center gap-3">
            <Sparkles className="h-5 w-5 animate-spin text-amber-950" />
            <span className="text-sm tracking-wide">
              Dawn of a New Era: {stageCelebration.stageName}
            </span>
            <span className="text-lg">🌟</span>
          </div>
        </div>
      )}

      {/* Tabletop Conclave Turn Handoff Ritual Toast */}
      {conclaveHandoff && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 top-16 z-50 flex items-center justify-center p-3 animate-in fade-in slide-in-from-top-2 duration-300 pointer-events-auto"
        >
          <div
            className="card max-w-lg w-full p-4 rounded-2xl shadow-2xl border-2 flex items-center justify-between gap-3.5 bg-card/95 backdrop-blur-md"
            style={{ borderColor: conclaveHandoff.player.color }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm"
                style={{ backgroundColor: conclaveHandoff.player.color }}
              >
                {conclaveHandoff.player.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <span>Tabletop Conclave Handoff</span>
                  <span className="text-primary font-mono">• {conclaveHandoff.player.role}</span>
                </div>
                <div className="text-sm font-black text-foreground">
                  {conclaveHandoff.player.name}, the realm awaits your hand
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Passed from {conclaveHandoff.previousPlayerName}. Draw a card or sculpt the map.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setConclaveHandoff(null)}
              className="btn-primary text-xs px-3.5 py-1.5 shrink-0 shadow-sm font-semibold"
            >
              Ready
            </button>
          </div>
        </div>
      )}

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
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    }`}
                  >
                    {st.name}
                  </button>
                )
              })}
            </div>

            {/* Geopolitical Stability Index in Companion Mode */}
            <div
              className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold flex items-center gap-1 shrink-0 ${worldStability.badgeColor}`}
              title={worldStability.summary}
            >
              <span>{worldStability.icon}</span>
              <span className="font-bold">{worldStability.status}</span>
              <span className="text-[10px] font-mono opacity-85">({worldStability.score}%)</span>
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
            {/* Left: Tactile Card Display with 3D Physics */}
            <div className="w-full md:w-5/12 flex flex-col items-center justify-center perspective-1000">
              {drawnCard ? (
                <div
                  key={`${drawnCard.id}_${drawHistory.length}`}
                  className={`w-full max-w-[220px] aspect-[5/7] ${bgColor} rounded-2xl border-4 border-gray-300 dark:border-gray-600 shadow-2xl flex flex-col items-center justify-center p-6 relative select-none transition-transform hover:scale-[1.03] animate-card-deal animate-card-flip`}
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
                initialViewOnly={true}
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
                onOpenCompendium={() => setShowCompendiumModal(true)}
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
                  {/* Card Visual with 3D Flip Physics */}
                  <div
                    className={`${
                      activeTab === 'split' ? '' : 'lg:col-span-4'
                    } card p-6 flex flex-col items-center justify-center min-h-[240px] perspective-1000`}
                  >
                    {drawnCard ? (
                      <div
                        key={`${drawnCard.id}_${drawHistory.length}`}
                        className={`w-full max-w-[180px] aspect-[5/7] ${bgColor} rounded-xl border-4 border-gray-300 dark:border-gray-600 shadow-xl flex flex-col items-center justify-center p-5 relative select-none animate-card-deal animate-card-flip`}
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

                        {/* Action Presets & Tabletop Compendium Header */}
                        <div className="flex items-center justify-between gap-2 pt-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Action Presets & Tabletop Tropes
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowCompendiumModal(true)}
                            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                            title="Browse all 200+ canonical powers, whiteboard tropes, traditions, and action presets"
                          >
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>Browse 200+ Tropes Compendium</span>
                          </button>
                        </div>

                        {/* Optional Action Presets Workshop with Categories, Search, and Affinity Engine */}
                        {availableActionPresets.length > 0 && (
                          <div className="space-y-3 pt-2">
                            {/* Bot Recommendation Banner */}
                            {botRecommendation && (
                              <div className="p-3 rounded-xl bg-gradient-to-r from-primary/10 via-amber-500/10 to-primary/5 border border-primary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
                                    <Bot className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <div className="font-bold flex items-center gap-1.5">
                                      <span>Recommended: {botRecommendation.preset.icon} {botRecommendation.preset.name}</span>
                                      <span className="px-1.5 py-0.2 rounded bg-primary/20 text-primary text-[10px] font-mono">
                                        Score: {botRecommendation.evaluation.totalScore}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-muted-foreground">
                                      Weighted by world history, tile terrain, and {activePlayer?.name || 'Bot'} personality
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleSelectPreset(botRecommendation.preset)}
                                    className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all flex items-center gap-1 shadow-sm"
                                  >
                                    <Check className="h-3 w-3" />
                                    <span>Apply Bot Pick</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setShowAffinityDetails((prev) => !prev)}
                                    className="px-2.5 py-1 rounded-lg bg-background border border-border text-xs hover:bg-muted font-medium transition-all"
                                    title="View affinity score breakdown and weights"
                                  >
                                    {showAffinityDetails ? 'Hide Rationale' : 'Why this Pick?'}
                                  </button>
                                  {!world.isLocked && activePlayer && (
                                    <button
                                      type="button"
                                      onClick={() => setShowInlineBotWeightTuner((prev) => !prev)}
                                      className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all flex items-center gap-1 ${
                                        showInlineBotWeightTuner
                                          ? 'bg-primary text-primary-foreground border-primary'
                                          : 'bg-background border-border hover:bg-muted'
                                      }`}
                                      title="Live-adjust active seat bot personality & decision weights"
                                    >
                                      <Sliders className="h-3 w-3" />
                                      <span>Tune Weights</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setShowPlayersModal(true)}
                                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
                                    title="Configure full player council & bot roster"
                                  >
                                    <Settings className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Inline Live Bot Personality & Weight Tuner (Editable Mid-Session) */}
                            {showInlineBotWeightTuner && !world.isLocked && activePlayer && (
                              <div
                                data-testid="inline-bot-weight-tuner"
                                className="p-3.5 rounded-xl bg-card border border-primary/40 text-xs space-y-3 animate-in fade-in duration-150"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
                                  <div className="font-bold flex items-center gap-1.5">
                                    <Sliders className="h-3.5 w-3.5 text-primary" />
                                    <span>
                                      Live Bot Weight Tuner: {activePlayer.name} ({activePlayer.role})
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <label
                                      htmlFor="inline-bot-personality-select"
                                      className="text-[10px] font-semibold text-muted-foreground"
                                    >
                                      Archetype:
                                    </label>
                                    <select
                                      id="inline-bot-personality-select"
                                      value={activePlayer.personality}
                                      onChange={(e) => {
                                        const nextPersonality = e.target.value as BotPersonalityId
                                        persistWorldUpdate((prev) => ({
                                          ...prev,
                                          players: prev.players.map((p) =>
                                            p.id === activePlayer.id
                                              ? {
                                                  ...p,
                                                  personality: nextPersonality,
                                                  customWeights: undefined,
                                                }
                                              : p
                                          ),
                                        }))
                                      }}
                                      className="input h-7 text-xs py-0 px-2"
                                    >
                                      {Object.values(BOT_PERSONALITIES).map((bp) => (
                                        <option key={bp.id} value={bp.id}>
                                          {bp.icon} {bp.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                  {(
                                    [
                                      { key: 'geography', label: 'Geography', icon: '🏔️' },
                                      { key: 'ecology', label: 'Ecology', icon: '🌿' },
                                      { key: 'civilization', label: 'Civilization', icon: '🏛️' },
                                      { key: 'diplomacy', label: 'Diplomacy', icon: '📜' },
                                      { key: 'conflict', label: 'Conflict', icon: '⚔️' },
                                      { key: 'myth', label: 'Myth & Magic', icon: '✨' },
                                    ] as { key: keyof BotPersonalityWeights; label: string; icon: string }[]
                                  ).map((w) => {
                                    const currentWeights = getEffectiveBotWeights(activePlayer)
                                    return (
                                      <div
                                        key={w.key}
                                        className="p-2 rounded-lg bg-muted/30 border border-border/60 space-y-1"
                                      >
                                        <div className="flex items-center justify-between text-[11px]">
                                          <span className="font-medium">
                                            {w.icon} {w.label}
                                          </span>
                                          <span className="font-mono font-bold text-primary">
                                            {currentWeights[w.key]}%
                                          </span>
                                        </div>
                                        <input
                                          type="range"
                                          aria-label={`Tune ${w.label} weight`}
                                          min="0"
                                          max="100"
                                          step="5"
                                          value={currentWeights[w.key]}
                                          onChange={(e) => {
                                            const val = parseInt(e.target.value, 10)
                                            persistWorldUpdate((prev) => ({
                                              ...prev,
                                              players: prev.players.map((p) =>
                                                p.id === activePlayer.id
                                                  ? {
                                                      ...p,
                                                      customWeights: {
                                                        ...currentWeights,
                                                        [w.key]: val,
                                                      },
                                                    }
                                                  : p
                                              ),
                                            }))
                                          }}
                                          className="w-full h-1.5"
                                        />
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Affinity Breakdown Detail Box */}
                            {showAffinityDetails && botRecommendation && (
                              <div className="p-3 rounded-xl bg-card border border-border/80 text-xs space-y-2 animate-in fade-in duration-150">
                                <div className="font-bold text-muted-foreground flex items-center justify-between">
                                  <span>Affinity Breakdown for {botRecommendation.preset.name}:</span>
                                  <span className="font-mono text-primary font-bold">{botRecommendation.evaluation.totalScore} pts</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                  {botRecommendation.evaluation.factors.map((f, idx) => (
                                    <div key={idx} className="flex items-center justify-between px-2 py-1 rounded bg-muted/40 border border-border/40 text-[11px]">
                                      <span className="text-muted-foreground truncate">{f.label}</span>
                                      <span className={`font-mono font-bold ${f.score >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                                        {f.score >= 0 ? `+${f.score}` : f.score}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Category Filter Pills & Search Bar */}
                            <div className="space-y-2">
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-[11px]">
                                  {(
                                    [
                                      { id: 'all', label: 'All', icon: '🌐' },
                                      { id: 'habitations', label: 'Habitations', icon: '🏘️' },
                                      { id: 'geography', label: 'Geography', icon: '🌲' },
                                      { id: 'traditions', label: 'Traditions', icon: '📜' },
                                      { id: 'statecraft', label: 'Statecraft', icon: '⚖️' },
                                      { id: 'intrigue', label: 'Intrigue', icon: '⚔️' },
                                      { id: 'myths', label: 'Myths', icon: '✨' },
                                    ] as const
                                  ).map((cat) => {
                                    const count = cat.id === 'all'
                                      ? availableActionPresets.length
                                      : availableActionPresets.filter((p) => getPresetConceptGroup(p) === cat.id).length
                                    if (count === 0 && cat.id !== 'all') return null
                                    const isActive = presetCategory === cat.id
                                    return (
                                      <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setPresetCategory(cat.id)}
                                        className={`px-2.5 py-1 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-1 ${
                                          isActive
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                      >
                                        <span>{cat.icon}</span>
                                        <span>{cat.label}</span>
                                        <span className={`text-[9px] px-1 rounded-full ${isActive ? 'bg-primary-foreground/20' : 'bg-muted-foreground/20'}`}>
                                          {count}
                                        </span>
                                      </button>
                                    )
                                  })}
                                </div>
                                <div className="relative shrink-0 sm:w-48">
                                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                  <input
                                    type="text"
                                    value={presetSearchQuery}
                                    onChange={(e) => setPresetSearchQuery(e.target.value)}
                                    placeholder="Filter presets..."
                                    className="w-full pl-8 pr-3 py-1 rounded-lg bg-background border border-border text-xs focus:ring-1 focus:ring-primary outline-none"
                                  />
                                </div>
                              </div>

                              {/* Presets Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                                {filteredActionPresets.map((preset) => {
                                  const isSelected = selectedPreset?.id === preset.id
                                  const isTopBotPick = botRecommendation?.preset.id === preset.id
                                  return (
                                    <button
                                      key={preset.id}
                                      type="button"
                                      onClick={() => handleSelectPreset(isSelected ? null : preset)}
                                      className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-start gap-2 relative ${
                                        isSelected
                                          ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                          : 'border-border bg-background hover:border-primary/50'
                                      }`}
                                    >
                                      <span className="text-xl shrink-0">{preset.icon}</span>
                                      <div className="min-w-0 flex-1">
                                        <div className="font-bold truncate flex items-center gap-1">
                                          <span>{preset.name}</span>
                                          {isTopBotPick && (
                                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold shrink-0">
                                              ⭐ Bot Pick
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground line-clamp-1">
                                          {preset.description}
                                        </div>
                                      </div>
                                    </button>
                                  )
                                })}
                                {filteredActionPresets.length === 0 && (
                                  <div className="col-span-full py-4 text-center text-xs text-muted-foreground italic">
                                    No presets found matching &ldquo;{presetSearchQuery}&rdquo; in this category.
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Selected Preset Evocative Name Generator & Creative Prompt */}
                        {selectedPreset && (
                          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-3 animate-in fade-in duration-150">
                            {/* Evocative Name Customizer & Re-roll */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-background/80 p-2.5 rounded-lg border border-amber-500/30">
                              <div className="flex-1 w-full">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block mb-1">
                                  Evocative Name / Map Label:
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={generatedFeatureName}
                                    onChange={(e) => {
                                      setGeneratedFeatureName(e.target.value)
                                      setPendingNote(generateLedgerProse(selectedPreset, e.target.value, undefined, selectedTileId))
                                    }}
                                    className="flex-1 px-2.5 py-1 rounded bg-background border border-border text-xs font-semibold focus:ring-1 focus:ring-amber-500 outline-none"
                                    placeholder="Enter or generate feature name..."
                                  />
                                  <button
                                    type="button"
                                    onClick={handleRerollFeatureName}
                                    className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-semibold transition-all flex items-center gap-1 shrink-0"
                                    title="Re-roll an evocative combinatorial fantasy name"
                                  >
                                    <span>🎲 Re-roll</span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {selectedPreset.creativePrompt && (
                              <div className="text-amber-900 dark:text-amber-200 leading-relaxed">
                                <strong className="font-bold text-amber-700 dark:text-amber-400">
                                  💡 Creative Prompt:{' '}
                                </strong>
                                <span>{selectedPreset.creativePrompt}</span>
                              </div>
                            )}

                            {selectedPreset.exampleNarrative && (
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1.5 border-t border-amber-500/20">
                                <div className="text-muted-foreground italic text-[11px] leading-relaxed border-l-2 border-amber-500/50 pl-2">
                                  &ldquo;{selectedPreset.exampleNarrative}&rdquo;
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPendingNote(
                                      generateLedgerProse(
                                        selectedPreset,
                                        generatedFeatureName || selectedPreset.name,
                                        undefined,
                                        selectedTileId
                                      )
                                    )
                                  }
                                  className="shrink-0 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-200 text-[10px] font-semibold transition-colors flex items-center gap-1"
                                  title="Copy this example prose directly into your turn chronicle note"
                                >
                                  <span>✍️ Sync to Note</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Live Turn Activity Basket (Shows Map Tiles & Codex Entries touched this turn) */}
                        <div className="p-3 rounded-xl bg-primary/[0.03] border border-primary/25 space-y-2.5 text-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2">
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
                                <button
                                  key={tid}
                                  type="button"
                                  onClick={() => handleNavigateToTile(tid)}
                                  className="px-2 py-0.5 rounded bg-background border border-border font-mono hover:border-primary transition-all cursor-pointer"
                                  title="Jump to tile"
                                >
                                  🗺️ ({tid})
                                </button>
                              ))}
                              {turnModifiedEntities.map((eid) => {
                                const ent = world.entities.find((e) => e.id === eid)
                                return ent ? (
                                  <button
                                    key={eid}
                                    type="button"
                                    onClick={() => setFlyoutEntityId(eid)}
                                    className="px-2 py-0.5 rounded bg-background border border-border font-semibold hover:border-primary transition-all cursor-pointer flex items-center gap-1"
                                    title="Open interconnected dossier drawer"
                                  >
                                    <span>{ent.icon}</span>
                                    <span>{ent.name}</span>
                                  </button>
                                ) : null
                              })}
                              {!selectedPreset &&
                                turnModifiedTiles.length === 0 &&
                                turnModifiedEntities.length === 0 && (
                                  <span className="text-muted-foreground italic">
                                    Pick a preset above, use quick actions, or open Map / Codex.
                                  </span>
                                )}
                            </div>
                            {activeTab !== 'split' && (
                              <div className="flex items-center gap-1.5 shrink-0">
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

                          {/* 1-Click Tabletop Quick Actions on selected coordinate */}
                          <div className="pt-2 border-t border-border/40 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground font-semibold flex items-center gap-1">
                                <Compass className="h-3.5 w-3.5 text-primary" />
                                <span>Quick Place on ({selectedTileId}):</span>
                              </span>
                              <div className="flex flex-wrap items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleQuickInjectSlot('settlement')}
                                  className="px-2 py-0.5 rounded bg-background border border-border hover:border-primary text-[11px] font-medium transition-all shadow-2xs hover:scale-105 active:scale-95 flex items-center gap-1"
                                  title="Add a Settlement token to this coordinate"
                                >
                                  <span>🏡</span>
                                  <span>Settle</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickInjectSlot('mountain')}
                                  className="px-2 py-0.5 rounded bg-background border border-border hover:border-primary text-[11px] font-medium transition-all shadow-2xs hover:scale-105 active:scale-95 flex items-center gap-1"
                                  title="Erect a Mountain Peak slot on this coordinate"
                                >
                                  <span>🏔️</span>
                                  <span>Mountain</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickInjectSlot('forest')}
                                  className="px-2 py-0.5 rounded bg-background border border-border hover:border-primary text-[11px] font-medium transition-all shadow-2xs hover:scale-105 active:scale-95 flex items-center gap-1"
                                  title="Sprout Ancient Forest woods on this coordinate"
                                >
                                  <span>🌲</span>
                                  <span>Forest</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickInjectSlot('anomaly')}
                                  className="px-2 py-0.5 rounded bg-background border border-border hover:border-primary text-[11px] font-medium transition-all shadow-2xs hover:scale-105 active:scale-95 flex items-center gap-1"
                                  title="Place an Arcane Anomaly landmark on this coordinate"
                                >
                                  <span>✨</span>
                                  <span>Anomaly</span>
                                </button>
                              </div>
                            </div>

                            {/* Entity Link Chips */}
                            {world.entities.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1">
                                <span className="text-[11px] text-muted-foreground mr-1">Link Faction/Actor:</span>
                                {world.entities.slice(0, 5).map((ent) => {
                                  const isLinked = turnModifiedEntities.includes(ent.id)
                                  return (
                                    <button
                                      key={ent.id}
                                      type="button"
                                      onClick={() => handleToggleLinkEntityToTurn(ent.id)}
                                      onContextMenu={(e) => {
                                        e.preventDefault()
                                        setFlyoutEntityId(ent.id)
                                      }}
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium border transition-all flex items-center gap-1 ${
                                        isLinked
                                          ? 'bg-primary/20 border-primary text-primary font-bold shadow-2xs'
                                          : 'bg-background/80 border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
                                      }`}
                                      title="Click to link to turn record; right-click for dossier"
                                    >
                                      <span>{ent.icon}</span>
                                      <span>{ent.name}</span>
                                      {isLinked && <Check className="h-2.5 w-2.5 ml-0.5" />}
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Turn Note & Chronicle Action */}
                        <div className="space-y-2 pt-2 border-t border-border">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-muted-foreground block">
                              Turn #{drawHistory.length} Event Chronicle Note:
                            </label>
                            <button
                              type="button"
                              onClick={() => setActiveCreativeSpark(getRandomCreativeSpark(currentStage))}
                              className="text-[11px] text-amber-600 dark:text-amber-400 hover:text-amber-500 font-semibold flex items-center gap-1 transition-colors"
                              title="Stuck? Roll a provocative worldbuilding question and story spark"
                            >
                              <Sparkles className="h-3 w-3" />
                              <span>💡 Spark Inspiration</span>
                            </button>
                          </div>

                          {/* Creative Spark Callout Box */}
                          {activeCreativeSpark && (
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2 animate-in fade-in">
                              <div className="flex items-center justify-between">
                                <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                                  <Sparkles className="h-3.5 w-3.5" />
                                  <span>Creative Spark: {activeCreativeSpark.category}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setActiveCreativeSpark(getRandomCreativeSpark(currentStage))}
                                    className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-0.5 rounded bg-muted/60 transition-colors"
                                  >
                                    Roll Another
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setActiveCreativeSpark(null)}
                                    className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
                                    aria-label="Dismiss creative spark"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                              <p className="font-semibold text-foreground/90 italic">
                                &ldquo;{activeCreativeSpark.question}&rdquo;
                              </p>
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 border-t border-amber-500/20 text-muted-foreground">
                                <span className="text-[11px]">Example: {activeCreativeSpark.exampleIdea}</span>
                                <button
                                  type="button"
                                  onClick={() => setPendingNote(activeCreativeSpark.exampleIdea)}
                                  className="shrink-0 text-[10px] px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 font-semibold transition-colors"
                                >
                                  Use as Note
                                </button>
                              </div>
                            </div>
                          )}

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
                      initialViewOnly={true}
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
                      onOpenCompendium={() => setShowCompendiumModal(true)}
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
                initialViewOnly={true}
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
                onOpenCompendium={() => setShowCompendiumModal(true)}
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
        onOpenShare={() => setShowShareModal(true)}
      />

      {/* Share with Table & JSON Backup Modal */}
      <ShareTableModal
        isOpen={showShareModal}
        world={world}
        onClose={() => setShowShareModal(false)}
        onImportWorld={(imported) => {
          setActiveWorldId(imported.id)
          setWorld(imported)
          setSavedWorlds(listSavedWorlds())
          playStageAdvanceSound()
        }}
      />

      {/* Incoming Shared Realm Hydration Prompt */}
      {incomingSharedWorld && (
        <IncomingSharedWorldModal
          incomingWorld={incomingSharedWorld}
          onAccept={handleAcceptSharedWorld}
          onDecline={handleDeclineSharedWorld}
        />
      )}

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

      {/* Deliberate AAA Historical Epoch Advancement Ceremony Modal */}
      {showEpochCeremonyModal && (
        <EpochCeremonyModal
          isOpen={showEpochCeremonyModal}
          currentStage={currentStage}
          world={world}
          onClose={() => setShowEpochCeremonyModal(false)}
          onAdvanceStage={handleAdvanceStageCeremonially}
        />
      )}

      {/* Deliberate AAA Realm Creation Ceremony Modal */}
      {showNewGameCeremonyModal && (
        <NewGameCeremonyModal
          isOpen={showNewGameCeremonyModal}
          onClose={() => setShowNewGameCeremonyModal(false)}
          onLaunchWorld={(nw) => {
            saveWorld(nw)
            handleLauncherSelectWorld(nw)
            setShowNewGameCeremonyModal(false)
          }}
        />
      )}

      {/* Interconnected Lore & Dossier Flyout Drawer */}
      <LoreFlyoutDrawer
        entityId={flyoutEntityId}
        world={world}
        onClose={() => setFlyoutEntityId(null)}
        onNavigateToTile={handleNavigateToTile}
        onNavigateToEntity={handleNavigateToEntity}
      />

      {/* Tabletop Campaign Adventure Hooks & Rumor Tables Modal */}
      <CampaignHooksModal
        isOpen={showCampaignHooksModal}
        onClose={() => setShowCampaignHooksModal(false)}
        world={world}
        onSelectCoord={(col, row) => handleNavigateToTile(`${col},${row}`)}
        onSelectEntity={(eid) => setFlyoutEntityId(eid)}
      />

      {/* Session Zero 1-Page Campaign Primer Modal */}
      <SessionZeroPrimerModal
        isOpen={showSessionZeroPrimerModal}
        onClose={() => setShowSessionZeroPrimerModal(false)}
        world={world}
        onSelectCoord={(col, row) => handleNavigateToTile(`${col},${row}`)}
      />

      {/* Tabletop Presets & Tropes Compendium Modal */}
      <PresetCompendiumModal
        isOpen={showCompendiumModal}
        onClose={() => setShowCompendiumModal(false)}
        onSelectActionPreset={handleSelectPreset}
        currentStage={currentStage}
      />

      {/* Real-Time Table Peer & Second-Screen Sync Modal */}
      <TableSyncModal
        isOpen={showTableSyncModal}
        onClose={() => setShowTableSyncModal(false)}
        isSyncActive={isSyncActive}
        roomCode={syncRoomCode}
        peerRole={syncPeerRole}
        displayName={syncDisplayName}
        claimedSeatId={syncClaimedSeatId}
        connectedPeers={connectedPeers}
        syncStats={syncStats}
        players={players}
        onStartSync={handleStartTableSync}
        onStopSync={handleStopTableSync}
        onPushManualSync={() => {
          if (peerSessionRef.current) {
            peerSessionRef.current.broadcastWorldState(world, drawnCard, powerData?.power)
            setSyncStats(peerSessionRef.current.getStats())
          }
        }}
        onCreateWebRtcOffer={
          peerSessionRef.current
            ? () => peerSessionRef.current!.createWebRtcOfferToken()
            : undefined
        }
        onAcceptWebRtcOffer={
          peerSessionRef.current
            ? (token) => peerSessionRef.current!.acceptWebRtcOfferAndCreateAnswer(token)
            : undefined
        }
        onAcceptWebRtcAnswer={
          peerSessionRef.current
            ? (token) => peerSessionRef.current!.acceptWebRtcAnswerToken(token)
            : undefined
        }
      />

      {/* Global Spotlight Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        world={world}
        currentMode={gameMode}
        onSelectMode={handleModeChange}
        onToggleSafeMode={() => setIsDraftingWorkshop((prev) => !prev)}
        isDraftingWorkshop={isDraftingWorkshop}
        onUndo={() => {}}
        onRedo={() => {}}
        canUndo={false}
        canRedo={false}
        onToggleSound={handleToggleSound}
        isSoundMuted={isSoundMuted}
        onOpenExportModal={() => setShowExportModal(true)}
        onOpenShareModal={() => setShowShareModal(true)}
        onOpenCampaignHooksModal={() => setShowCampaignHooksModal(true)}
        onOpenSessionZeroPrimerModal={() => setShowSessionZeroPrimerModal(true)}
        onOpenCompendiumModal={() => setShowCompendiumModal(true)}
        onOpenTableSyncModal={() => setShowTableSyncModal(true)}
        onOpenCodexEntity={(eid) => setFlyoutEntityId(eid)}
        onReturnToLauncher={handleReturnToLauncher}
        onOpenShortcutsModal={() => setShowShortcutsModal(true)}
      />

      {/* Keyboard Shortcuts Cheat Sheet (?) */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </div>
  )
}
