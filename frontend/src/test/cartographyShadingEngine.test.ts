import { describe, it, expect } from 'vitest'
import {
  computeTileNeighborContext,
  getTileElevationRank,
  generateOrganicShadingSvgString,
} from '../engine/cartographyShadingEngine'
import { createDefaultTile } from '../engine/mapEngine'

describe('cartographyShadingEngine', () => {
  it('correctly ranks elevation for deep ocean, water, flatlands, hills, and mountains', () => {
    expect(getTileElevationRank(undefined)).toBe(0)
    expect(getTileElevationRank(createDefaultTile(0, 0, 'ocean'))).toBe(0)
    expect(getTileElevationRank(createDefaultTile(0, 0, 'water'))).toBe(1)
    expect(getTileElevationRank(createDefaultTile(0, 0, 'plains'))).toBe(2)
    expect(getTileElevationRank(createDefaultTile(0, 0, 'forest'))).toBe(3)

    const canyonTile = createDefaultTile(0, 0, 'canyon')
    expect(getTileElevationRank(canyonTile)).toBe(4)

    const hillTile = createDefaultTile(0, 0, 'plains')
    hillTile.relief = 'hills'
    expect(getTileElevationRank(hillTile)).toBe(5)

    const mountainTile = createDefaultTile(0, 0, 'mountain')
    expect(getTileElevationRank(mountainTile)).toBe(6)

    const volcanoTile = createDefaultTile(0, 0, 'volcano')
    expect(getTileElevationRank(volcanoTile)).toBe(6)
  })

  it('computes neighbor water and land borders accurately', () => {
    const map: { width: number; height: number; tiles: Record<string, any> } = {
      width: 5,
      height: 5,
      tiles: {},
    }
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        map.tiles[`${c},${r}`] = createDefaultTile(c, r, 'ocean')
      }
    }

    // Place an island at (2, 2)
    map.tiles['2,2'] = createDefaultTile(2, 2, 'plains')

    const islandContext = computeTileNeighborContext(map as any, 2, 2)
    expect(islandContext.isLand).toBe(true)
    expect(islandContext.waterBorders.north).toBe(true)
    expect(islandContext.waterBorders.south).toBe(true)
    expect(islandContext.waterBorders.east).toBe(true)
    expect(islandContext.waterBorders.west).toBe(true)

    // The water tile at (2, 1) has land to its south
    const waterNorthContext = computeTileNeighborContext(map as any, 2, 1)
    expect(waterNorthContext.isWater).toBe(true)
    expect(waterNorthContext.landBorders.south).toBe(true)
    expect(waterNorthContext.landBorders.north).toBe(false)
  })

  it('detects NW directional hillshading and cast shadows onto adjacent lowlands', () => {
    const map: { width: number; height: number; tiles: Record<string, any> } = {
      width: 5,
      height: 5,
      tiles: {},
    }
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        map.tiles[`${c},${r}`] = createDefaultTile(c, r, 'ocean')
      }
    }

    // Place mountain at (1, 1) and plains at (2, 2)
    map.tiles['1,1'] = createDefaultTile(1, 1, 'mountain')
    map.tiles['2,2'] = createDefaultTile(2, 2, 'plains')

    const plainsContext = computeTileNeighborContext(map as any, 2, 2)
    expect(plainsContext.hasNorthWestSunlightShadow).toBe(true)

    const svg = generateOrganicShadingSvgString(plainsContext, 96, 96, 48)
    expect(svg).toContain('fill="#0f172a"')
  })

  it('generates beach sand rims on land tiles bordering water', () => {
    const map: { width: number; height: number; tiles: Record<string, any> } = {
      width: 3,
      height: 3,
      tiles: {},
    }
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        map.tiles[`${c},${r}`] = createDefaultTile(c, r, 'ocean')
      }
    }
    map.tiles['1,1'] = createDefaultTile(1, 1, 'plains')

    const context = computeTileNeighborContext(map as any, 1, 1)
    const svg = generateOrganicShadingSvgString(context, 48, 48, 48)

    expect(svg).toContain('fill="#fef08a"')
  })
})
