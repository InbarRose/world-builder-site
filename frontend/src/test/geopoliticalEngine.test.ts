import { describe, it, expect } from 'vitest'
import {
  calculateTileDefense,
  calculateProvinceEconomy,
  computeBorderPerimeters,
  projectRealmInfluence,
  detectTradeRoutes,
  getProvinceChronicleHistory,
} from '../engine/geopoliticalEngine'
import { MapState, WorldEntity, DrawRecord } from '../engine/types'
import { createDefaultTile } from '../engine/mapEngine'

function createTestMap(w = 5, h = 5): MapState {
  const tiles: Record<string, any> = {}
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      tiles[`${c},${r}`] = createDefaultTile(c, r)
    }
  }
  return { width: w, height: h, tiles }
}

describe('geopoliticalEngine (Phase 28)', () => {
  it('calculates realistic defensive ratings and modifiers based on terrain and fortresses', () => {
    const plainsTile = createDefaultTile(0, 0)
    const plainsDef = calculateTileDefense(plainsTile)
    expect(plainsDef.score).toBe(2) // Baseline open ground

    const mountainTile = {
      ...createDefaultTile(1, 0),
      terrain: 'mountain' as const,
      relief: 'mountain-range' as const,
      hasRiver: true,
      slots: [
        {
          id: 's1',
          category: 'structure' as const,
          type: 'citadel',
          name: 'High Bastion Citadel',
          icon: '🏰',
          priority: 80,
        },
      ],
    }
    const mtnDef = calculateTileDefense(mountainTile)
    // Mountain (+5) + Mountain-Range (+2) + River (+1) + Citadel (+3) = 11, capped at 10
    expect(mtnDef.score).toBe(10)
    expect(mtnDef.modifiers.some((m) => m.label.includes('High Bastion Citadel'))).toBe(true)
    expect(mtnDef.modifiers.some((m) => m.label.includes('Mountain Crags'))).toBe(true)
  })

  it('calculates provincial economic yields based on terrain, transport, and resource slots', () => {
    const tile = {
      ...createDefaultTile(2, 2),
      terrain: 'plains' as const,
      hasRiver: true,
      hasRoad: true,
      slots: [
        {
          id: 'res_1',
          category: 'resource' as const,
          type: 'grain_fields',
          name: 'Golden Wheat Fields',
          icon: '🌾',
          priority: 60,
        },
      ],
    }
    const eco = calculateProvinceEconomy(tile)
    // plains (+3) + river (+1) + grain slot (+4) = 9
    expect(eco.food).toBeGreaterThanOrEqual(8)
    // river (+2) + road (+2) = 5
    expect(eco.trade).toBeGreaterThanOrEqual(5)
  })

  it('computes directional border perimeters for cartographic border rendering', () => {
    const map = createTestMap(3, 3)
    map.tiles['1,1'].territoryId = 'realm_a'
    // Neighbor 1,0 is unaligned ('') -> top border should be true
    // Neighbor 1,2 is unaligned ('') -> bottom border should be true
    // Neighbor 0,1 is realm_a -> left border should be false
    map.tiles['0,1'].territoryId = 'realm_a'
    // Neighbor 2,1 is realm_b -> right border should be true
    map.tiles['2,1'].territoryId = 'realm_b'

    const perim = computeBorderPerimeters(map, '1,1')
    expect(perim.top).toBe(true)
    expect(perim.bottom).toBe(true)
    expect(perim.left).toBe(false)
    expect(perim.right).toBe(true)
  })

  it('projects multi-source realm influence from settlement hubs across terrain friction', () => {
    const map = createTestMap(6, 6)
    // Society A Capital at (1,1) with a road heading East to (2,1)
    map.tiles['1,1'].slots = [
      {
        id: 'cap_a',
        category: 'settlement',
        type: 'capital_city',
        name: 'Aethelgard Imperial Seat',
        icon: '👑',
        priority: 95,
      },
    ]
    map.tiles['1,1'].hasRoad = true
    map.tiles['2,1'].hasRoad = true
    map.tiles['1,1'].territoryId = 'soc_a'

    // Society B Town at (4,4)
    map.tiles['4,4'].slots = [
      {
        id: 'town_b',
        category: 'settlement',
        type: 'town',
        name: 'Ironpeak Citadel',
        icon: '🏰',
        priority: 85,
      },
    ]
    map.tiles['4,4'].territoryId = 'soc_b'

    const societies: WorldEntity[] = [
      {
        id: 'soc_a',
        name: 'Aethelgard Empire',
        category: 'society',
        stageCreated: 'civilization',
        description: 'Imperial realm',
        traits: ['Imperial'],
        status: 'active',
        color: '#eab308',
      },
      {
        id: 'soc_b',
        name: 'Ironpeak Clans',
        category: 'society',
        stageCreated: 'civilization',
        description: 'Mountain clans',
        traits: ['Martial'],
        status: 'active',
        color: '#ef4444',
      },
    ]

    const { mapWithTerritories, geopolitical } = projectRealmInfluence(map, societies)

    // Capital domain assigned
    expect(mapWithTerritories.tiles['1,1'].territoryId).toBe('soc_a')
    expect(mapWithTerritories.tiles['4,4'].territoryId).toBe('soc_b')

    // Road between (1,1) and (2,1) facilitated influence propagation
    expect(mapWithTerritories.tiles['2,1'].territoryId).toBe('soc_a')

    // Realm summaries generated
    const realmA = geopolitical.realms['soc_a']
    expect(realmA.totalTiles).toBeGreaterThanOrEqual(2)
    expect(realmA.capitalName).toContain('Aethelgard')

    const realmB = geopolitical.realms['soc_b']
    expect(realmB.totalTiles).toBeGreaterThanOrEqual(1)

    // Provinces have strategic profiles
    const prof11 = geopolitical.provinces['1,1']
    expect(prof11.tier).toBe('capital_domain')
    expect(prof11.governingSocietyId).toBe('soc_a')
  })

  it('detects trade route connections between settlements', () => {
    const map = createTestMap(4, 4)
    map.tiles['0,0'].slots = [
      {
        id: 's1',
        category: 'settlement',
        type: 'town',
        name: 'Port Haven',
        icon: '🏘️',
        priority: 80,
      },
    ]
    map.tiles['0,0'].hasRoad = true
    map.tiles['0,0'].territoryId = 'soc_1'

    map.tiles['0,2'].slots = [
      {
        id: 's2',
        category: 'settlement',
        type: 'town',
        name: 'Oakhaven Town',
        icon: '🏡',
        priority: 80,
      },
    ]
    map.tiles['0,2'].hasRoad = true
    map.tiles['0,2'].territoryId = 'soc_1'

    const societies: WorldEntity[] = [
      {
        id: 'soc_1',
        name: 'Verdant League',
        category: 'society',
        stageCreated: 'civilization',
        description: 'Trade league',
        traits: ['Merchants'],
        status: 'active',
      },
    ]

    const routes = detectTradeRoutes(map, societies)
    expect(routes.length).toBe(1)
    expect(routes[0].fromSettlementName).toBe('Port Haven')
    expect(routes[0].toSettlementName).toBe('Oakhaven Town')
    expect(routes[0].medium).toBe('road')
  })

  it('retrieves provincial historical chronicle records', () => {
    const history: DrawRecord[] = [
      {
        id: 'turn_1',
        moveId: 1,
        stage: 'genesis',
        card: { id: 'c1', suit: '♠', value: '7' },
        timestamp: '2026-01-01T00:00:00Z',
        power: 'Shape Mountain',
        note: 'At (2,3), the Jagged Spire pierced the clouds.',
        linkedTileIds: ['2,3'],
      },
      {
        id: 'turn_2',
        moveId: 2,
        stage: 'primal',
        card: { id: 'c2', suit: '♥', value: '4' },
        timestamp: '2026-01-01T01:00:00Z',
        power: 'Spring of Waters',
        note: 'At (5,5), fresh springs emerged.',
        linkedTileIds: ['5,5'],
      },
    ]

    const provinceEvents = getProvinceChronicleHistory(history, '2,3')
    expect(provinceEvents.length).toBe(1)
    expect(provinceEvents[0].id).toBe('turn_1')
    expect(provinceEvents[0].power).toBe('Shape Mountain')
  })
})
