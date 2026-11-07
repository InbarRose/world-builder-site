import { describe, it, expect } from 'vitest'
import {
  axialToCube,
  cubeToAxial,
  offsetToAxialPointy,
  axialToOffsetPointy,
  offsetToAxialFlat,
  axialToOffsetFlat,
  offsetToAxial,
  axialToOffset,
  cubeRound,
  hexToPixel,
  pixelToHex,
  getHexCorners,
  getHexPolygonPoints,
  hexDistance,
  getNeighbors,
  getHexLine,
  getHexRange,
  measureTabletopDistance,
  getGridPixelDimensions,
} from '../engine/hexTopologyEngine'

describe('hexTopologyEngine', () => {
  describe('Coordinate Conversions', () => {
    it('converts axial to cube coordinates maintaining q + r + s = 0', () => {
      const cube = axialToCube({ q: 3, r: -5 })
      expect(cube.q).toBe(3)
      expect(cube.r).toBe(-5)
      expect(cube.s).toBe(2)
      expect(cube.q + cube.r + cube.s).toBe(0)
    })

    it('converts cube to axial coordinates cleanly', () => {
      const axial = cubeToAxial({ q: -4, r: 7, s: -3 })
      expect(axial).toEqual({ q: -4, r: 7 })
    })

    it('bijectively converts pointy-topped offset to axial and back', () => {
      const testCases = [
        { col: 0, row: 0 },
        { col: 1, row: 0 },
        { col: 0, row: 1 },
        { col: 4, row: 5 },
        { col: 10, row: 12 },
      ]

      for (const offset of testCases) {
        const axial = offsetToAxialPointy(offset)
        const roundtrip = axialToOffsetPointy(axial)
        expect(roundtrip).toEqual(offset)
      }
    })

    it('bijectively converts flat-topped offset to axial and back', () => {
      const testCases = [
        { col: 0, row: 0 },
        { col: 1, row: 0 },
        { col: 0, row: 1 },
        { col: 7, row: 3 },
        { col: 15, row: 8 },
      ]

      for (const offset of testCases) {
        const axial = offsetToAxialFlat(offset)
        const roundtrip = axialToOffsetFlat(axial)
        expect(roundtrip).toEqual(offset)
      }
    })

    it('handles generic offsetToAxial and axialToOffset for square and hex topologies', () => {
      expect(offsetToAxial({ col: 5, row: 6 }, 'square')).toEqual({ q: 5, r: 6 })
      expect(axialToOffset({ q: 5, r: 6 }, 'square')).toEqual({ col: 5, row: 6 })

      const pointyAxial = offsetToAxial({ col: 3, row: 4 }, 'hex-pointy')
      expect(axialToOffset(pointyAxial, 'hex-pointy')).toEqual({ col: 3, row: 4 })

      const flatAxial = offsetToAxial({ col: 3, row: 4 }, 'hex-flat')
      expect(axialToOffset(flatAxial, 'hex-flat')).toEqual({ col: 3, row: 4 })
    })
  })

  describe('Cube Rounding', () => {
    it('rounds floating cube coordinates to integers preserving q + r + s = 0', () => {
      const rounded = cubeRound({ q: 1.1, r: -2.3, s: 1.2 })
      expect(rounded.q + rounded.r + rounded.s).toBe(0)
      expect(rounded.q).toBe(1)
      expect(rounded.r).toBe(-2)
      expect(rounded.s).toBe(1)
    })

    it('accurately resolves fractional ambiguity on boundary values', () => {
      const rounded = cubeRound({ q: 0.4, r: 0.4, s: -0.8 })
      expect(rounded.q + rounded.r + rounded.s).toBe(0)
    })
  })

  describe('Geometric Pixel Projections', () => {
    const radius = 24

    it('projects pointy hex centers and inverse projects pixels back to identical hex', () => {
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const center = hexToPixel({ col: c, row: r }, radius, 'hex-pointy')
          const inverted = pixelToHex(center, radius, 'hex-pointy')
          expect(inverted).toEqual({ col: c, row: r })
        }
      }
    })

    it('projects flat hex centers and inverse projects pixels back to identical hex', () => {
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const center = hexToPixel({ col: c, row: r }, radius, 'hex-flat')
          const inverted = pixelToHex(center, radius, 'hex-flat')
          expect(inverted).toEqual({ col: c, row: r })
        }
      }
    })

    it('generates 6 regular hexagon corner points', () => {
      const corners = getHexCorners({ x: 100, y: 100 }, radius, 'hex-pointy')
      expect(corners).toHaveLength(6)

      // Radius from center to every corner should equal radius
      for (const corner of corners) {
        const dist = Math.hypot(corner.x - 100, corner.y - 100)
        expect(dist).toBeCloseTo(radius, 2)
      }
    })

    it('generates SVG polygon points string format', () => {
      const pts = getHexPolygonPoints({ x: 50, y: 50 }, radius, 'hex-pointy')
      expect(typeof pts).toBe('string')
      const pairs = pts.split(' ')
      expect(pairs).toHaveLength(6)
      for (const pair of pairs) {
        expect(pair).toMatch(/^[0-9.]+,[0-9.]+$/)
      }
    })
  })

  describe('Hex Distance Metric', () => {
    it('computes 0 distance from a hex to itself', () => {
      expect(hexDistance({ col: 2, row: 3 }, { col: 2, row: 3 }, 'hex-pointy')).toBe(0)
      expect(hexDistance({ col: 2, row: 3 }, { col: 2, row: 3 }, 'hex-flat')).toBe(0)
      expect(hexDistance({ col: 2, row: 3 }, { col: 2, row: 3 }, 'square')).toBe(0)
    })

    it('computes exactly 1 distance between immediate hex neighbors', () => {
      const center = { col: 4, row: 4 }
      const neighbors = getNeighbors(center, 'hex-pointy')
      expect(neighbors).toHaveLength(6)

      for (const neighbor of neighbors) {
        expect(hexDistance(center, neighbor, 'hex-pointy')).toBe(1)
      }
    })

    it('computes accurate multi-hex distances', () => {
      const d1 = hexDistance({ col: 0, row: 0 }, { col: 5, row: 0 }, 'hex-pointy')
      expect(d1).toBe(5)

      const d2 = hexDistance({ col: 0, row: 0 }, { col: 0, row: 4 }, 'hex-pointy')
      expect(d2).toBe(4)
    })
  })

  describe('Adjacency & Neighbors', () => {
    it('returns 6 hex neighbors for hex topologies and 8 neighbors for square', () => {
      expect(getNeighbors({ col: 3, row: 3 }, 'hex-pointy')).toHaveLength(6)
      expect(getNeighbors({ col: 3, row: 3 }, 'hex-flat')).toHaveLength(6)
      expect(getNeighbors({ col: 3, row: 3 }, 'square')).toHaveLength(8)
    })

    it('filters neighbors within board boundaries when bounds are supplied', () => {
      const cornerNeighbors = getNeighbors(
        { col: 0, row: 0 },
        'hex-pointy',
        { width: 10, height: 10 }
      )
      for (const n of cornerNeighbors) {
        expect(n.col).toBeGreaterThanOrEqual(0)
        expect(n.col).toBeLessThan(10)
        expect(n.row).toBeGreaterThanOrEqual(0)
        expect(n.row).toBeLessThan(10)
      }
      expect(cornerNeighbors.length).toBeLessThan(6)
    })
  })

  describe('Line Interpolation (Bresenham Hex Path)', () => {
    it('returns single tile for distance 0', () => {
      const line = getHexLine({ col: 2, row: 2 }, { col: 2, row: 2 }, 'hex-pointy')
      expect(line).toEqual([{ col: 2, row: 2 }])
    })

    it('returns continuous contiguous connected path from start to end', () => {
      const start = { col: 1, row: 1 }
      const end = { col: 6, row: 4 }
      const path = getHexLine(start, end, 'hex-pointy')

      expect(path[0]).toEqual(start)
      expect(path[path.length - 1]).toEqual(end)

      // Every step must be adjacent (distance 1)
      for (let i = 0; i < path.length - 1; i++) {
        const stepDist = hexDistance(path[i], path[i + 1], 'hex-pointy')
        expect(stepDist).toBe(1)
      }
    })
  })

  describe('Area & Range Selection', () => {
    it('returns 1 tile for radius 0', () => {
      const range = getHexRange({ col: 3, row: 3 }, 0, 'hex-pointy')
      expect(range).toHaveLength(1)
      expect(range[0]).toEqual({ col: 3, row: 3 })
    })

    it('returns 7 tiles for radius 1 in hex (center + 6 neighbors: 1 + 3*n*(n+1) = 7)', () => {
      const range = getHexRange({ col: 5, row: 5 }, 1, 'hex-pointy')
      expect(range).toHaveLength(7)
    })

    it('returns 19 tiles for radius 2 in hex (1 + 3*2*3 = 19)', () => {
      const range = getHexRange({ col: 5, row: 5 }, 2, 'hex-pointy')
      expect(range).toHaveLength(19)
    })
  })

  describe('Tabletop Scale Measurement', () => {
    it('computes realistic tabletop distance, fantasy leagues, miles, and march days', () => {
      const measurement = measureTabletopDistance(
        { col: 1, row: 1 },
        { col: 5, row: 1 },
        'hex-pointy',
        5
      )

      expect(measurement.tiles).toBe(4)
      expect(measurement.leagues).toBe(20) // 4 * 5
      expect(measurement.miles).toBe(60) // 20 * 3
      expect(measurement.daysWalk).toBe(2.5) // 60 / 24
      expect(measurement.path).toHaveLength(5)
    })
  })

  describe('Grid Pixel Dimensions', () => {
    it('computes bounding box for square, pointy hex, and flat hex grids', () => {
      const squareDim = getGridPixelDimensions(10, 10, 20, 'square')
      expect(squareDim.totalWidth).toBe(400)
      expect(squareDim.totalHeight).toBe(400)

      const pointyDim = getGridPixelDimensions(10, 10, 20, 'hex-pointy')
      expect(pointyDim.totalWidth).toBeGreaterThan(0)
      expect(pointyDim.totalHeight).toBeGreaterThan(0)

      const flatDim = getGridPixelDimensions(10, 10, 20, 'hex-flat')
      expect(flatDim.totalWidth).toBeGreaterThan(0)
      expect(flatDim.totalHeight).toBeGreaterThan(0)
    })
  })
})
