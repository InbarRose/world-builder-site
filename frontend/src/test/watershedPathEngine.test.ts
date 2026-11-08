import { describe, it, expect } from 'vitest'
import {
  getRelativeDirectionName,
  traceDownhillRiver,
  generateWorldWatersheds,
  getRoadTraverseCost,
  findOptimalRoadPath,
  getConnectedRoadAdjacencies,
  getConnectedRiverAdjacencies,
  generateConnectedPathD,
  MAP_LAYERS,
  DEFAULT_MAP_LAYERS,
} from '../engine/watershedPathEngine'
import { createDefaultTile, createInitialMap } from '../engine/mapEngine'
import { MapState } from '../engine/types'

describe('watershedPathEngine', () => {
  describe('Compass Direction Detection', () => {
    it('detects cardinal and diagonal directions accurately', () => {
      expect(getRelativeDirectionName({ col: 3, row: 3 }, { col: 3, row: 2 })).toBe('north')
      expect(getRelativeDirectionName({ col: 3, row: 3 }, { col: 3, row: 4 })).toBe('south')
      expect(getRelativeDirectionName({ col: 3, row: 3 }, { col: 4, row: 3 })).toBe('east')
      expect(getRelativeDirectionName({ col: 3, row: 3 }, { col: 2, row: 3 })).toBe('west')
      expect(getRelativeDirectionName({ col: 3, row: 3 }, { col: 2, row: 2 })).toBe('northWest')
      expect(getRelativeDirectionName({ col: 3, row: 3 }, { col: 4, row: 2 })).toBe('northEast')
      expect(getRelativeDirectionName({ col: 3, row: 3 }, { col: 2, row: 4 })).toBe('southWest')
      expect(getRelativeDirectionName({ col: 3, row: 3 }, { col: 4, row: 4 })).toBe('southEast')
    })
  })

  describe('Downhill Watershed Physics', () => {
    it('traces river flow downhill from mountain peak to coastal water', () => {
      // 5x5 map with a mountain ridge sloping down to coastal water
      const map: MapState = {
        width: 5,
        height: 5,
        tiles: {},
      }
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          map.tiles[`${c},${r}`] = { ...createDefaultTile(c, r, 'mountain'), relief: 'mountain' }
        }
      }

      // Elevation gradient valley: (1,1)=peak(6) -> (2,1)=hills(5) -> (3,1)=forest(3) -> (4,1)=water(1)
      map.tiles['1,1'] = { ...createDefaultTile(1, 1, 'mountain'), relief: 'mountain' }
      map.tiles['2,1'] = { ...createDefaultTile(2, 1, 'plains'), relief: 'hills' }
      map.tiles['3,1'] = createDefaultTile(3, 1, 'forest')
      map.tiles['4,1'] = createDefaultTile(4, 1, 'water')

      const river = traceDownhillRiver(map, { col: 1, row: 1 })

      expect(river.length).toBeGreaterThanOrEqual(3)
      expect(river[0]).toEqual({ col: 1, row: 1 })
      // Last node should be the sea basin / water tile at (4, 1)
      const lastNode = river[river.length - 1]
      expect(map.tiles[`${lastNode.col},${lastNode.row}`].terrain).toBe('water')
    })

    it('identifies headwaters and accumulates flux at tributary confluence', () => {
      const map: MapState = {
        width: 6,
        height: 6,
        tiles: {},
      }
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          map.tiles[`${c},${r}`] = createDefaultTile(c, r, 'plains')
        }
      }

      // Two peaks converging into a valley river
      map.tiles['1,1'] = { ...createDefaultTile(1, 1, 'mountain'), relief: 'mountain' }
      map.tiles['1,3'] = { ...createDefaultTile(1, 3, 'mountain'), relief: 'mountain' }
      map.tiles['2,2'] = createDefaultTile(2, 2, 'forest') // Confluence point
      map.tiles['5,2'] = createDefaultTile(5, 2, 'ocean')

      const watershed = generateWorldWatersheds(map)

      expect(Object.keys(watershed).length).toBeGreaterThan(0)
      // Headwaters at (1, 1) and (1, 3) must be in watershed
      expect(watershed['1,1']).toBeDefined()
      expect(watershed['1,3']).toBeDefined()
    })
  })

  describe('Road Network Pathfinding (A*)', () => {
    it('penalizes steep mountain ascents and rewards existing road infrastructure', () => {
      const map = createInitialMap(5, 5)
      const plainFrom = { col: 1, row: 1 }
      const plainTo = { col: 2, row: 1 }
      map.tiles['1,1'] = createDefaultTile(1, 1, 'plains')
      map.tiles['2,1'] = createDefaultTile(2, 1, 'plains')

      const normalCost = getRoadTraverseCost(map, plainFrom, plainTo)

      // Mountain climb
      map.tiles['2,1'] = { ...createDefaultTile(2, 1, 'mountain'), relief: 'mountain' }
      const mountainCost = getRoadTraverseCost(map, plainFrom, plainTo)
      expect(mountainCost).toBeGreaterThan(normalCost)

      // Existing road discount
      map.tiles['2,1'] = { ...createDefaultTile(2, 1, 'plains'), hasRoad: true }
      const roadDiscountCost = getRoadTraverseCost(map, plainFrom, plainTo)
      expect(roadDiscountCost).toBeLessThan(normalCost)
    })

    it('finds optimal path detouring around impassable mountain ranges', () => {
      const map: MapState = {
        width: 7,
        height: 5,
        tiles: {},
      }
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 7; c++) {
          map.tiles[`${c},${r}`] = createDefaultTile(c, r, 'plains')
        }
      }

      // Create an impassable mountain wall at column 3 except at row 4
      map.tiles['3,0'] = { ...createDefaultTile(3, 0, 'mountain'), relief: 'mountain' }
      map.tiles['3,1'] = { ...createDefaultTile(3, 1, 'mountain'), relief: 'mountain' }
      map.tiles['3,2'] = { ...createDefaultTile(3, 2, 'mountain'), relief: 'mountain' }
      map.tiles['3,3'] = { ...createDefaultTile(3, 3, 'mountain'), relief: 'mountain' }
      // Row 4 is open plains pass!

      const path = findOptimalRoadPath(map, { col: 1, row: 1 }, { col: 5, row: 1 })

      expect(path).not.toBeNull()
      expect(path![0]).toEqual({ col: 1, row: 1 })
      expect(path![path!.length - 1]).toEqual({ col: 5, row: 1 })

      // Path should avoid the impassable peak at (3, 1)
      const touchesPeak = path!.some((p) => p.col === 3 && p.row === 1)
      expect(touchesPeak).toBe(false)
    })
  })

  describe('Connected Splines & Layer Stacking', () => {
    it('detects adjacent connected road and river neighbors', () => {
      const map = createInitialMap(5, 5)
      map.tiles['2,2'] = { ...createDefaultTile(2, 2, 'plains'), hasRoad: true, hasRiver: true }
      map.tiles['2,1'] = { ...createDefaultTile(2, 1, 'plains'), hasRoad: true }
      map.tiles['3,2'] = { ...createDefaultTile(3, 2, 'plains'), hasRiver: true }

      const roadAdjacencies = getConnectedRoadAdjacencies(map, 2, 2)
      expect(roadAdjacencies).toHaveLength(1)
      expect(roadAdjacencies[0]).toEqual({ col: 2, row: 1 })

      const riverAdjacencies = getConnectedRiverAdjacencies(map, 2, 2)
      expect(riverAdjacencies).toHaveLength(1)
      expect(riverAdjacencies[0]).toEqual({ col: 3, row: 2 })
    })

    it('generates connected SVG path d strings for ribbon segments', () => {
      const pathD = generateConnectedPathD(24, 24, 48, [{ col: 2, row: 1 }], { col: 2, row: 2 })
      expect(pathD).toContain('M 24 24')
      expect(pathD).toContain('L')
    })

    it('provides 8 default map layers enabled by default', () => {
      expect(MAP_LAYERS).toHaveLength(8)
      expect(DEFAULT_MAP_LAYERS.terrain).toBe(true)
      expect(DEFAULT_MAP_LAYERS.watershed).toBe(true)
      expect(DEFAULT_MAP_LAYERS.roads).toBe(true)
      expect(DEFAULT_MAP_LAYERS.territories).toBe(true)
      expect(DEFAULT_MAP_LAYERS.slots).toBe(true)
    })
  })
})
