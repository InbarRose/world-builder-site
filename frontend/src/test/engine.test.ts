import { describe, it, expect, beforeEach } from 'vitest'
import {
  DEFAULT_DECK_CONFIG,
  SHORT_GAME_DECK_CONFIG,
  createDeck,
  shuffleDeck,
  isFantasticalCard,
  getNextStage,
  calculateEpochYear,
  getCardDisplay,
} from '../engine/deckEngine'
import {
  createInitialMap,
  paintTile,
  bucketFillTerrain,
  exportMapToSvgString,
  getTileId,
  resizeMap,
  addSlotToTile,
  getEffectiveTileSlots,
  getTileDomain,
} from '../engine/mapEngine'
import {
  createNewWorld,
  saveWorld,
  listSavedWorlds,
  getActiveWorld,
  deleteWorld,
  parseImportedWorld,
  exportWorldChronicleMarkdown,
  rewindWorldToMove,
} from '../engine/storageService'
import {
  createSeededRng,
  executeAutomatedTurn,
  autoPlayFullWorld,
} from '../engine/autoPlayEngine'
import { getActionPresetsForDraw } from '../engine/presets'
import { CURRENT_SCHEMA_VERSION } from '../engine/types'

describe('DeckEngine', () => {
  it('builds a full 54-card deck with default config', () => {
    const deck = createDeck(DEFAULT_DECK_CONFIG)
    expect(deck).toHaveLength(54)
    expect(deck.filter((c) => c.value === 'A')).toHaveLength(4)
    expect(deck.filter((c) => c.value === 'Joker')).toHaveLength(2)
  })

  it('builds a short game deck with 27 cards', () => {
    const deck = createDeck(SHORT_GAME_DECK_CONFIG)
    expect(deck).toHaveLength(27)
    expect(deck.filter((c) => c.value === 'K')).toHaveLength(4)
    expect(deck.filter((c) => c.value === 'J')).toHaveLength(0)
    expect(deck.filter((c) => c.value === 'A')).toHaveLength(2)
    expect(deck.filter((c) => c.value === 'Joker')).toHaveLength(1)
  })

  it('shuffles deterministically when provided a seeded RNG', () => {
    const deck = createDeck(SHORT_GAME_DECK_CONFIG)
    const shuffled = shuffleDeck(deck, () => 0.5)
    expect(shuffled).toHaveLength(deck.length)
  })

  it('identifies fantastical cards accurately', () => {
    expect(isFantasticalCard({ suit: '♠', value: 'K', id: '1' })).toBe(true)
    expect(isFantasticalCard({ suit: '', value: 'Joker', id: '2' })).toBe(true)
    expect(isFantasticalCard({ suit: '♥', value: '7', id: '3' })).toBe(false)
    expect(isFantasticalCard(null)).toBe(false)
  })

  it('returns correct next stage progression', () => {
    expect(getNextStage('genesis')).toBe('primal')
    expect(getNextStage('primal')).toBe('civilization')
    expect(getNextStage('civilization')).toBe('intrigue')
    expect(getNextStage('intrigue')).toBeNull()
  })

  it('calculates relative epoch year per stage', () => {
    expect(calculateEpochYear('genesis', 1)).toContain('Eon I')
    expect(calculateEpochYear('primal', 2)).toContain('Age of Dawn')
    expect(calculateEpochYear('civilization', 3)).toContain('Imperial Era')
    expect(calculateEpochYear('intrigue', 4)).toContain('Present Reckoning')
  })

  it('formats card display strings and colors', () => {
    const spadeDisplay = getCardDisplay({ suit: '♠', value: '10', id: '♠-10' })
    expect(spadeDisplay.display).toBe('10♠')
    const jokerDisplay = getCardDisplay({ suit: '', value: 'Joker', id: 'joker-0' })
    expect(jokerDisplay.display).toBe('Joker')
  })
})

describe('MapEngine', () => {
  it('creates an initial 20x12 map with 240 tiles and supports geography presets', () => {
    const map = createInitialMap(20, 12, 'archipelago')
    expect(map.width).toBe(20)
    expect(map.height).toBe(12)
    expect(Object.keys(map.tiles)).toHaveLength(240)
  })

  it('paints individual tiles with multi-layer relief, flora, roads, rivers, and overlays', () => {
    let map = createInitialMap(5, 5)
    map = paintTile(map, 2, 2, {
      terrain: 'mountain',
      relief: 'mountain',
      flora: 'forest',
      hasRiver: true,
      hasRoad: true,
      overlay: 'castle',
      label: 'Ironhold',
    })
    const tile = map.tiles[getTileId(2, 2)]
    expect(tile.terrain).toBe('mountain')
    expect(tile.relief).toBe('mountain')
    expect(tile.flora).toBe('forest')
    expect(tile.hasRiver).toBe(true)
    expect(tile.hasRoad).toBe(true)
    expect(tile.overlay).toBe('castle')
    expect(tile.label).toBe('Ironhold')
  })

  it('resizes map dimensions non-destructively', () => {
    let map = createInitialMap(8, 6)
    map = paintTile(map, 2, 2, { label: 'KeepMe' })
    const resized = resizeMap(map, 12, 10)
    expect(resized.width).toBe(12)
    expect(resized.height).toBe(10)
    expect(resized.tiles['2,2'].label).toBe('KeepMe')
  })

  it('bucket fills contiguous terrain regions', () => {
    let map = createInitialMap(4, 4)
    const cornerTerrain = map.tiles['0,0'].terrain
    map = bucketFillTerrain(map, 0, 0, 'desert')
    expect(map.tiles['0,0'].terrain).toBe('desert')
    expect(cornerTerrain).not.toBe('desert')
  })

  it('exports map state to valid SVG string with composite symbols', () => {
    let map = createInitialMap(4, 4)
    map = paintTile(map, 1, 1, {
      terrain: 'forest',
      relief: 'mountain',
      flora: 'forest',
      hasRiver: true,
      hasRoad: true,
      label: 'Silverwood',
    })
    const svg = exportMapToSvgString(map, 'Test Realm')
    expect(svg).toContain('<svg')
    expect(svg).toContain('Test Realm')
    expect(svg).toContain('Silverwood')
  })

  it('enforces zero-noise empty tiles, priority slot ordering, and land/water domain rules', () => {
    const map = createInitialMap(10, 8)
    // Empty plains tile should return 0 effective slots (zero icon noise!)
    let plainsTile = paintTile(map, 5, 4, {
      terrain: 'plains',
      relief: 'none',
      flora: 'none',
      overlay: 'none',
      slots: [],
    }).tiles['5,4']
    expect(getTileDomain(plainsTile)).toBe('land')
    expect(getEffectiveTileSlots(plainsTile)).toHaveLength(0)

    // Adding a Lake slot + Mountain slot + Settlement slot keeps domain='land' and orders Settlement first
    plainsTile = addSlotToTile(plainsTile, {
      category: 'hydrology',
      type: 'lake',
      name: 'Mirror Lake',
      icon: '💧',
      priority: 66,
    })
    plainsTile = addSlotToTile(plainsTile, {
      category: 'elevation',
      type: 'mountain',
      name: 'Frost Peak',
      icon: '🏔️',
      priority: 75,
    })
    plainsTile = addSlotToTile(plainsTile, {
      category: 'settlement',
      type: 'city',
      name: 'Highhearth',
      icon: '🏰',
      priority: 95,
    })

    expect(getTileDomain(plainsTile)).toBe('land')
    const orderedSlots = getEffectiveTileSlots(plainsTile)
    expect(orderedSlots).toHaveLength(3)
    expect(orderedSlots[0].name).toBe('Highhearth')
    expect(orderedSlots[1].name).toBe('Frost Peak')
    expect(orderedSlots[2].name).toBe('Mirror Lake')

    // Stage action presets return appropriate options for normal, fantastical, and disaster draws
    const genSpades = getActionPresetsForDraw('genesis', '♠', false, false)
    expect(genSpades.length).toBeGreaterThanOrEqual(2)
    const genFantastical = getActionPresetsForDraw('genesis', '♠', true, false)
    expect(genFantastical[0].isFantastical).toBe(true)
    const disasterPresets = getActionPresetsForDraw('civilization', '♥', false, true)
    expect(disasterPresets[0].isDisaster).toBe(true)
  })
})

describe('WorldStorageService & Schema v2 Migration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('creates, saves, lists, and deletes named worlds in localStorage with schema v2', () => {
    const w1 = createNewWorld('Aethelgard')
    expect(w1.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    saveWorld(w1)
    const w2 = createNewWorld('Sunspire')
    saveWorld(w2)

    const worlds = listSavedWorlds()
    expect(worlds).toHaveLength(2)
    expect(getActiveWorld().name).toBe('Sunspire')

    const remaining = deleteWorld(w2.id)
    expect(remaining).toHaveLength(1)
    expect(getActiveWorld().name).toBe('Aethelgard')
  })

  it('migrates legacy v0/v1 JSON payloads to Schema v2 and exports markdown chronicle', () => {
    const legacyPayload = JSON.stringify({
      drawHistory: [
        {
          id: 'rec-1',
          card: { suit: '♠', value: '8', id: '♠-8' },
          timestamp: '2026-01-01T00:00:00.000Z',
          stage: 'genesis',
          power: 'Earth',
          note: 'Great mountain range rises in the north.',
        },
      ],
      deckConfig: DEFAULT_DECK_CONFIG,
      currentStage: 'genesis',
      stageNotes: { genesis: 'Single supercontinent.' },
      timestamp: '2026-01-01T00:00:00.000Z',
    })

    const imported = parseImportedWorld(legacyPayload)
    expect(imported.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect(imported.players.length).toBeGreaterThanOrEqual(1)
    expect(imported.drawHistory).toHaveLength(1)
    expect(imported.drawHistory[0].moveId).toBe(1)

    const md = exportWorldChronicleMarkdown(imported)
    expect(md).toContain('# Chronicle of Imported World')
    expect(md).toContain('Great mountain range rises in the north.')
  })
})

describe('AutoPlayEngine & Time-Travel Rewind', () => {
  it('generates identical deterministic sequences from the same seed', () => {
    const rng1 = createSeededRng('avalon-42')
    const rng2 = createSeededRng('avalon-42')
    expect(rng1()).toBe(rng2())
    expect(rng1()).toBe(rng2())
  })

  it('auto-plays a full 4-stage world and supports rewinding to any historical turn', () => {
    let world = createNewWorld('Chronos Realm', 'seed-chronos-99')
    world.players = [
      {
        id: 'p1',
        name: 'Aurelia',
        color: '#3b82f6',
        role: 'Artist',
        isBot: true,
        personality: 'shaper',
      },
      {
        id: 'p2',
        name: 'Theron',
        color: '#10b981',
        role: 'Historian',
        isBot: true,
        personality: 'naturalist',
      },
    ]

    const simulated = autoPlayFullWorld(world, 3)
    // 4 stages * 3 turns = 12 turns
    expect(simulated.drawHistory).toHaveLength(12)
    expect(simulated.entities.length).toBeGreaterThanOrEqual(4) // Species + Societies + Myths
    expect(simulated.currentStage).toBe('intrigue')

    // Rewind to move #4 (end of Genesis / start of Primal)
    const rewound = rewindWorldToMove(simulated, 4)
    expect(rewound.drawHistory).toHaveLength(4)
    expect(rewound.snapshots?.length).toBe(4)

    // Execute a new turn from move #4
    const rng = createSeededRng('branch-seed')
    const branched = executeAutomatedTurn(
      rewound,
      { suit: '♠', value: 'K', id: '♠-K' },
      rng
    )
    expect(branched.drawHistory).toHaveLength(5)
    expect(branched.drawHistory[4].moveId).toBe(5)
  })
})
