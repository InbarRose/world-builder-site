/**
 * Hexagonal & Orthogonal Topology Engine
 *
 * Implements axial (q, r) and cube (q, r, s where q + r + s = 0) coordinate mathematics,
 * pointy-topped and flat-topped geometric projection, cube rounding, hex distance calculation,
 * neighbor adjacency, line-of-sight/Bresenham interpolation, and tabletop measurement metrics.
 */

import { GridTopology } from './types'

export interface AxialCoord {
  q: number
  r: number
}

export interface CubeCoord {
  q: number
  r: number
  s: number
}

export interface OffsetCoord {
  col: number
  row: number
}

export interface Point2D {
  x: number
  y: number
}

export interface MeasurementResult {
  tiles: number
  leagues: number
  miles: number
  daysWalk: number
  path: OffsetCoord[]
}

/**
 * 6 Hexagonal direction vectors in axial space (Pointy-topped / standard axial)
 */
export const HEX_DIRECTIONS: AxialCoord[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
]

/**
 * Converts axial coordinates (q, r) to cube coordinates (q, r, s) where q + r + s = 0.
 */
export function axialToCube(axial: AxialCoord): CubeCoord {
  return {
    q: axial.q,
    r: axial.r,
    s: -axial.q - axial.r,
  }
}

/**
 * Converts cube coordinates to axial (q, r).
 */
export function cubeToAxial(cube: CubeCoord): AxialCoord {
  return {
    q: cube.q,
    r: cube.r,
  }
}

/**
 * Converts offset (col, row) to axial (q, r) for pointy-topped hexagons (odd-r layout).
 * Odd rows are shoved right by half a hex width.
 */
export function offsetToAxialPointy(offset: OffsetCoord): AxialCoord {
  const q = offset.col - Math.floor((offset.row - (offset.row & 1)) / 2)
  const r = offset.row
  return { q, r }
}

/**
 * Converts axial (q, r) to offset (col, row) for pointy-topped hexagons (odd-r layout).
 */
export function axialToOffsetPointy(axial: AxialCoord): OffsetCoord {
  const col = axial.q + Math.floor((axial.r - (axial.r & 1)) / 2)
  const row = axial.r
  return { col, row }
}

/**
 * Converts offset (col, row) to axial (q, r) for flat-topped hexagons (odd-q layout).
 * Odd columns are shoved down by half a hex height.
 */
export function offsetToAxialFlat(offset: OffsetCoord): AxialCoord {
  const q = offset.col
  const r = offset.row - Math.floor((offset.col - (offset.col & 1)) / 2)
  return { q, r }
}

/**
 * Converts axial (q, r) to offset (col, row) for flat-topped hexagons (odd-q layout).
 */
export function axialToOffsetFlat(axial: AxialCoord): OffsetCoord {
  const col = axial.q
  const row = axial.r + Math.floor((axial.q - (axial.q & 1)) / 2)
  return { col, row }
}

/**
 * Converts generic offset coordinates to axial based on the active grid topology.
 */
export function offsetToAxial(
  offset: OffsetCoord,
  topology: GridTopology = 'square'
): AxialCoord {
  if (topology === 'hex-pointy') {
    return offsetToAxialPointy(offset)
  }
  if (topology === 'hex-flat') {
    return offsetToAxialFlat(offset)
  }
  return { q: offset.col, r: offset.row }
}

/**
 * Converts generic axial coordinates to offset based on the active grid topology.
 */
export function axialToOffset(
  axial: AxialCoord,
  topology: GridTopology = 'square'
): OffsetCoord {
  if (topology === 'hex-pointy') {
    return axialToOffsetPointy(axial)
  }
  if (topology === 'hex-flat') {
    return axialToOffsetFlat(axial)
  }
  return { col: axial.q, row: axial.r }
}

/**
 * Cube coordinate rounding: rounds floating-point cube coordinates to the nearest
 * valid integer cube coordinate, preserving q + r + s = 0.
 */
export function cubeRound(cube: { q: number; r: number; s: number }): CubeCoord {
  let q = Math.round(cube.q)
  let r = Math.round(cube.r)
  let s = Math.round(cube.s)

  const qDiff = Math.abs(q - cube.q)
  const rDiff = Math.abs(r - cube.r)
  const sDiff = Math.abs(s - cube.s)

  if (qDiff > rDiff && qDiff > sDiff) {
    q = -r - s
  } else if (rDiff > sDiff) {
    r = -q - s
  } else {
    s = -q - r
  }

  return { q, r, s }
}

/**
 * Calculates center pixel position (x, y) for a hex tile.
 */
export function hexToPixel(
  offset: OffsetCoord,
  radius: number,
  topology: 'hex-pointy' | 'hex-flat' = 'hex-pointy',
  padX = 0,
  padY = 0
): Point2D {
  if (topology === 'hex-pointy') {
    const width = Math.sqrt(3) * radius
    const x = padX + width * offset.col + (offset.row & 1 ? 0.5 * width : 0) + width / 2
    const y = padY + 1.5 * radius * offset.row + radius
    return { x, y }
  } else {
    const height = Math.sqrt(3) * radius
    const x = padX + 1.5 * radius * offset.col + radius
    const y = padY + height * offset.row + (offset.col & 1 ? 0.5 * height : 0) + height / 2
    return { x, y }
  }
}

/**
 * Converts pixel coordinate (x, y) into the nearest tile offset coordinate.
 */
export function pixelToHex(
  pixel: Point2D,
  radius: number,
  topology: 'hex-pointy' | 'hex-flat' = 'hex-pointy',
  padX = 0,
  padY = 0
): OffsetCoord {
  const px = pixel.x - padX
  const py = pixel.y - padY

  if (topology === 'hex-pointy') {
    const width = Math.sqrt(3) * radius
    // Centered reference
    const x = px - width / 2
    const y = py - radius

    const q = (Math.sqrt(3) / 3 * x - 1 / 3 * y) / radius
    const r = (2 / 3 * y) / radius
    const cube = cubeRound({ q, r, s: -q - r })
    return axialToOffsetPointy(cubeToAxial(cube))
  } else {
    const height = Math.sqrt(3) * radius
    const x = px - radius
    const y = py - height / 2

    const q = (2 / 3 * x) / radius
    const r = (-1 / 3 * x + Math.sqrt(3) / 3 * y) / radius
    const cube = cubeRound({ q, r, s: -q - r })
    return axialToOffsetFlat(cubeToAxial(cube))
  }
}

/**
 * Calculates the 6 corner vertices of a regular hexagon.
 */
export function getHexCorners(
  center: Point2D,
  radius: number,
  topology: 'hex-pointy' | 'hex-flat' = 'hex-pointy'
): Point2D[] {
  const corners: Point2D[] = []
  for (let i = 0; i < 6; i++) {
    const angleDeg = topology === 'hex-pointy' ? 60 * i + 30 : 60 * i
    const angleRad = (Math.PI / 180) * angleDeg
    corners.push({
      x: center.x + radius * Math.cos(angleRad),
      y: center.y + radius * Math.sin(angleRad),
    })
  }
  return corners
}

/**
 * Returns SVG polygon points string format ("x1,y1 x2,y2 ...")
 */
export function getHexPolygonPoints(
  center: Point2D,
  radius: number,
  topology: 'hex-pointy' | 'hex-flat' = 'hex-pointy'
): string {
  const corners = getHexCorners(center, radius, topology)
  return corners.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
}

/**
 * Calculates distance between two hexes in tile units.
 * In cube coordinates, hex distance is (|dq| + |dr| + |ds|) / 2.
 */
export function hexDistance(
  a: OffsetCoord,
  b: OffsetCoord,
  topology: GridTopology = 'hex-pointy'
): number {
  if (topology === 'square') {
    // Chebyshev distance (diagonal step counts as 1)
    return Math.max(Math.abs(a.col - b.col), Math.abs(a.row - b.row))
  }

  const axialA = offsetToAxial(a, topology)
  const axialB = offsetToAxial(b, topology)
  const cubeA = axialToCube(axialA)
  const cubeB = axialToCube(axialB)

  return (
    (Math.abs(cubeA.q - cubeB.q) +
      Math.abs(cubeA.r - cubeB.r) +
      Math.abs(cubeA.s - cubeB.s)) /
    2
  )
}

/**
 * Returns all valid immediate neighbors of a tile.
 */
export function getNeighbors(
  coord: OffsetCoord,
  topology: GridTopology = 'square',
  bounds?: { width: number; height: number }
): OffsetCoord[] {
  let neighbors: OffsetCoord[] = []

  if (topology === 'square') {
    // 8-neighbor Moore neighborhood for square
    const dirs = [
      [-1, -1], [0, -1], [1, -1],
      [-1, 0],           [1, 0],
      [-1, 1],  [0, 1],  [1, 1],
    ]
    neighbors = dirs.map(([dc, dr]) => ({
      col: coord.col + dc,
      row: coord.row + dr,
    }))
  } else {
    // 6 Hex directions in axial space
    const axial = offsetToAxial(coord, topology)
    neighbors = HEX_DIRECTIONS.map((dir) => {
      const neighborAxial = { q: axial.q + dir.q, r: axial.r + dir.r }
      return axialToOffset(neighborAxial, topology)
    })
  }

  if (bounds) {
    return neighbors.filter(
      (n) => n.col >= 0 && n.col < bounds.width && n.row >= 0 && n.row < bounds.height
    )
  }

  return neighbors
}

/**
 * Linear cube interpolation for line drawing.
 */
function cubeLerp(
  a: CubeCoord,
  b: CubeCoord,
  t: number
): { q: number; r: number; s: number } {
  return {
    q: a.q + (b.q - a.q) * t,
    r: a.r + (b.r - a.r) * t,
    s: a.s + (b.s - a.s) * t,
  }
}

/**
 * Calculates straight line of tiles between start and end (Bresenham-style cube interpolation).
 */
export function getHexLine(
  start: OffsetCoord,
  end: OffsetCoord,
  topology: GridTopology = 'hex-pointy'
): OffsetCoord[] {
  const dist = hexDistance(start, end, topology)
  if (dist === 0) return [start]

  const line: OffsetCoord[] = []

  if (topology === 'square') {
    // Standard Bresenham line for orthogonal/square
    let x0 = start.col
    let y0 = start.row
    const x1 = end.col
    const y1 = end.row
    const dx = Math.abs(x1 - x0)
    const dy = Math.abs(y1 - y0)
    const sx = x0 < x1 ? 1 : -1
    const sy = y0 < y1 ? 1 : -1
    let err = dx - dy

    while (true) {
      line.push({ col: x0, row: y0 })
      if (x0 === x1 && y0 === y1) break
      const e2 = 2 * err
      if (e2 > -dy) {
        err -= dy
        x0 += sx
      }
      if (e2 < dx) {
        err += dx
        y0 += sy
      }
    }
    return line
  }

  const axialStart = offsetToAxial(start, topology)
  const axialEnd = offsetToAxial(end, topology)
  const cubeStart = axialToCube(axialStart)
  const cubeEnd = axialToCube(axialEnd)

  for (let i = 0; i <= dist; i++) {
    const t = dist === 0 ? 0 : i / dist
    // Nudge slightly to avoid ambiguous edge crossings
    const nudgedLerp = cubeLerp(
      { q: cubeStart.q + 1e-6, r: cubeStart.r + 1e-6, s: cubeStart.s - 2e-6 },
      cubeEnd,
      t
    )
    const roundedCube = cubeRound(nudgedLerp)
    line.push(axialToOffset(cubeToAxial(roundedCube), topology))
  }

  return line
}

/**
 * Returns all tiles within a given radius around a center tile (for multi-radius brushes / area of effect).
 */
export function getHexRange(
  center: OffsetCoord,
  radius: number,
  topology: GridTopology = 'hex-pointy',
  bounds?: { width: number; height: number }
): OffsetCoord[] {
  const results: OffsetCoord[] = []

  if (topology === 'square') {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const col = center.col + dx
        const row = center.row + dy
        if (
          !bounds ||
          (col >= 0 && col < bounds.width && row >= 0 && row < bounds.height)
        ) {
          results.push({ col, row })
        }
      }
    }
    return results
  }

  const centerAxial = offsetToAxial(center, topology)
  const centerCube = axialToCube(centerAxial)

  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius)
    const r2 = Math.min(radius, -q + radius)
    for (let r = r1; r <= r2; r++) {
      const s = -q - r
      const targetCube = {
        q: centerCube.q + q,
        r: centerCube.r + r,
        s: centerCube.s + s,
      }
      const targetOffset = axialToOffset(cubeToAxial(targetCube), topology)
      if (
        !bounds ||
        (targetOffset.col >= 0 &&
          targetOffset.col < bounds.width &&
          targetOffset.row >= 0 &&
          targetOffset.row < bounds.height)
      ) {
        results.push(targetOffset)
      }
    }
  }

  return results
}

/**
 * Measures the distance between two coordinates and calculates tabletop scale units.
 * Benchmark standard: 1 hex = 5 leagues = 15 miles = ~0.65 day march.
 */
export function measureTabletopDistance(
  start: OffsetCoord,
  end: OffsetCoord,
  topology: GridTopology = 'hex-pointy',
  leaguesPerTile = 5
): MeasurementResult {
  const tiles = hexDistance(start, end, topology)
  const leagues = tiles * leaguesPerTile
  const miles = leagues * 3 // 1 fantasy league ≈ 3 standard statute miles
  const daysWalk = +(miles / 24).toFixed(1) // Normal fantasy march: ~24 miles/day
  const path = getHexLine(start, end, topology)

  return {
    tiles,
    leagues,
    miles,
    daysWalk,
    path,
  }
}

/**
 * Calculates total pixel bounding box for a grid given dimensions and radius.
 */
export function getGridPixelDimensions(
  width: number,
  height: number,
  radius: number,
  topology: GridTopology = 'hex-pointy'
): { totalWidth: number; totalHeight: number } {
  if (topology === 'square') {
    const tileSize = radius * 2
    return {
      totalWidth: width * tileSize,
      totalHeight: height * tileSize,
    }
  }

  if (topology === 'hex-pointy') {
    const hexWidth = Math.sqrt(3) * radius
    // Odd rows shift by half width, so add extra 0.5 * hexWidth
    const totalWidth = Math.ceil(width * hexWidth + 0.5 * hexWidth)
    const totalHeight = Math.ceil(height * (1.5 * radius) + 0.5 * radius)
    return { totalWidth, totalHeight }
  } else {
    const hexHeight = Math.sqrt(3) * radius
    const totalWidth = Math.ceil(width * (1.5 * radius) + 0.5 * radius)
    const totalHeight = Math.ceil(height * hexHeight + 0.5 * hexHeight)
    return { totalWidth, totalHeight }
  }
}
