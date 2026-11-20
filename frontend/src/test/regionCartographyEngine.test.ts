import { describe, it, expect } from 'vitest'
import { createDefaultTile } from '../engine/mapEngine'
import { MapState } from '../engine/types'
import {
  detectGeographicRegions,
  assignRegionNameToCluster,
  autoNameMajorRegions,
  generateEvocativeRegionName,
  claimRegionForFaction,
  toggleRegionFogOfWar,
  applyCanopyOrReliefToRegion,
} from '../engine/regionCartographyEngine'

function createTestBlankMap(width: number, height: number): MapState {
  const tiles: MapState['tiles'] = {}
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      tiles[`${c},${r}`] = {
        ...createDefaultTile(c, r, 'plains'),
        domain: 'land',
        terrain: 'plains',
        relief: 'none',
        flora: 'none',
      }
    }
  }
  return { width, height, gridTopology: 'square', tiles }
}

describe('regionCartographyEngine', () => {
  it('detects contiguous mountain ranges, forests, and distinguishes enclosed inland seas from outer oceans', () => {
    const map = createTestBlankMap(8, 8)

    // 1. Paint a 4-tile contiguous Mountain Cordillera at (2,1), (2,2), (2,3), (3,3)
    const mountainCoords = ['2,1', '2,2', '2,3', '3,3']
    for (const id of mountainCoords) {
      map.tiles[id] = {
        ...map.tiles[id],
        terrain: 'mountain',
        relief: 'mountain',
      }
    }

    // 2. Paint a 3-tile Enclosed Inland Sea in the interior (5,4), (5,5), (6,5) — touches 0 map borders
    const inlandSeaCoords = ['5,4', '5,5', '6,5']
    for (const id of inlandSeaCoords) {
      map.tiles[id] = {
        ...map.tiles[id],
        domain: 'water',
        terrain: 'water',
      }
    }

    const { tileRegionMap } = detectGeographicRegions(map, 1)

    const mtnRegion = tileRegionMap['2,2']
    expect(mtnRegion).toBeDefined()
    expect(mtnRegion.category).toBe('mountain_range')
    expect(mtnRegion.tileIds).toHaveLength(4)
    expect(mountainCoords).toContain(
      `${mtnRegion.centroid.col},${mtnRegion.centroid.row}`
    )

    const seaRegion = tileRegionMap['5,5']
    expect(seaRegion).toBeDefined()
    expect(seaRegion.category).toBe('inland_sea')
    expect(seaRegion.tileIds).toHaveLength(3)
  })

  it('assigns a regional name across all tiles in a contiguous cluster and supports clearing it', () => {
    let map = createTestBlankMap(6, 6)

    // Paint a 3-tile forest at (1,1), (1,2), (2,2)
    for (const id of ['1,1', '1,2', '2,2']) {
      map.tiles[id] = {
        ...map.tiles[id],
        terrain: 'plains',
        flora: 'forest',
      }
    }

    map = assignRegionNameToCluster(map, '1,2', 'The Whispering Weald')

    expect(map.tiles['1,1'].regionName).toBe('The Whispering Weald')
    expect(map.tiles['1,2'].regionName).toBe('The Whispering Weald')
    expect(map.tiles['2,2'].regionName).toBe('The Whispering Weald')
    // Non-forest neighbor stays unnamed
    expect(map.tiles['0,0'].regionName).toBeUndefined()

    const { tileRegionMap } = detectGeographicRegions(map, 1)
    expect(tileRegionMap['1,1'].isNamed).toBe(true)
    expect(tileRegionMap['1,1'].name).toBe('The Whispering Weald')

    // Clearing the name removes regionName from all cluster tiles
    map = assignRegionNameToCluster(map, '2,2', '')
    expect(map.tiles['1,1'].regionName).toBeUndefined()
    expect(map.tiles['2,2'].regionName).toBeUndefined()
  })

  it('auto-names major contiguous geographic regions deterministically', () => {
    let map = createTestBlankMap(6, 6)

    // Add 3-tile desert cluster
    for (const id of ['4,1', '4,2', '4,3']) {
      map.tiles[id] = {
        ...map.tiles[id],
        terrain: 'desert',
      }
    }

    map = autoNameMajorRegions(map, 3)

    expect(map.tiles['4,1'].regionName).toBeTruthy()
    expect(map.tiles['4,1'].regionName).toBe(map.tiles['4,2'].regionName)
    expect(generateEvocativeRegionName('desert_waste', 0)).toBeTruthy()
  })

  it('Phase 33: supports 1-Click Bulk Region Operations (Claim Region for Faction, Toggle Region Fog, Apply Region Canopy)', () => {
    let map = createTestBlankMap(6, 6)

    // Create a 3-tile desert region at (1,1), (1,2), (2,2)
    for (const id of ['1,1', '1,2', '2,2']) {
      map.tiles[id] = {
        ...map.tiles[id],
        terrain: 'desert',
      }
    }

    // 1. Claim entire contiguous desert region for 'soc_dune_kings'
    map = claimRegionForFaction(map, '1,2', 'soc_dune_kings')
    expect(map.tiles['1,1'].territoryId).toBe('soc_dune_kings')
    expect(map.tiles['1,2'].territoryId).toBe('soc_dune_kings')
    expect(map.tiles['2,2'].territoryId).toBe('soc_dune_kings')
    expect(map.tiles['0,0'].territoryId).toBeUndefined()

    // 2. Toggle Fog of War across entire contiguous desert region
    map = toggleRegionFogOfWar(map, '1,1')
    expect(map.tiles['1,1'].isUnexplored).toBe(true)
    expect(map.tiles['1,2'].isUnexplored).toBe(true)
    expect(map.tiles['2,2'].isUnexplored).toBe(true)
    expect(map.tiles['0,0'].isUnexplored).toBeFalsy()

    // 3. Apply Forest canopy across the contiguous region
    map = applyCanopyOrReliefToRegion(map, '2,2', { flora: 'forest' })
    expect(map.tiles['1,1'].flora).toBe('forest')
    expect(map.tiles['1,2'].flora).toBe('forest')
    expect(map.tiles['2,2'].flora).toBe('forest')
    expect(map.tiles['0,0'].flora).toBe('none')
  })
})
