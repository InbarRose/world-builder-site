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
} from '../engine/mapEngine'
import {
  createNewWorld,
  saveWorld,
  listSavedWorlds,
  getActiveWorld,
  deleteWorld,
  parseImportedWorld,
  exportWorldChronicleMarkdown,
} from '../engine/storageService'

describe('DeckEngine', () => {
  it('builds a full 54-card deck with default config', () => {
    const deck = createDeck(DEFAULT_DECK_CONFIG)
    // 4 suits * (9 number cards + 3 face cards) + 4 aces + 2 jokers = 48 + 4 + 2 = 54
    expect(deck).toHaveLength(54)
    expect(deck.filter((c) => c.value === 'A')).toHaveLength(4)
    expect(deck.filter((c) => c.value === 'Joker')).toHaveLength(2)
  })

  it('builds a short game deck with 27 cards', () => {
    const deck = createDeck(SHORT_GAME_DECK_CONFIG)
    // 4 suits * (5 number cards 2..6 + 1 King) + 2 aces + 1 joker = 24 + 2 + 1 = 27
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
  it('creates an initial 20x12 map with 240 tiles', () => {
    const map = createInitialMap(20, 12)
    expect(map.width).toBe(20)
    expect(map.height).toBe(12)
    expect(Object.keys(map.tiles)).toHaveLength(240)
  })

  it('paints individual tiles with terrain, overlays, and labels', () => {
    let map = createInitialMap(5, 5)
    map = paintTile(map, 2, 2, {
      terrain: 'mountain',
      overlay: 'castle',
      label: 'Ironhold',
    })
    const tile = map.tiles[getTileId(2, 2)]
    expect(tile.terrain).toBe('mountain')
    expect(tile.overlay).toBe('castle')
    expect(tile.label).toBe('Ironhold')
  })

  it('bucket fills contiguous terrain regions', () => {
    let map = createInitialMap(4, 4)
    // Paint corner ocean region to desert
    const cornerTerrain = map.tiles['0,0'].terrain
    map = bucketFillTerrain(map, 0, 0, 'desert')
    expect(map.tiles['0,0'].terrain).toBe('desert')
    expect(cornerTerrain).not.toBe('desert')
  })

  it('exports map state to valid SVG string', () => {
    let map = createInitialMap(4, 4)
    map = paintTile(map, 1, 1, { terrain: 'forest', label: 'Silverwood' })
    const svg = exportMapToSvgString(map, 'Test Realm')
    expect(svg).toContain('<svg')
    expect(svg).toContain('Test Realm')
    expect(svg).toContain('Silverwood')
  })
})

describe('WorldStorageService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('creates, saves, lists, and deletes named worlds in localStorage', () => {
    const w1 = createNewWorld('Aethelgard')
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

  it('parses legacy and current world JSON payloads and exports markdown chronicle', () => {
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
    expect(imported.drawHistory).toHaveLength(1)
    expect(imported.drawHistory[0].moveId).toBe(1)
    expect(imported.drawHistory[0].note).toContain('mountain range')

    const md = exportWorldChronicleMarkdown(imported)
    expect(md).toContain('# Chronicle of Imported World')
    expect(md).toContain('Great mountain range rises in the north.')
    expect(md).toContain('Single supercontinent.')
  })
})
