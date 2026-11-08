/**
 * Watershed Physics & Connected Road Pathfinding Engine
 *
 * Implements downhill hydrological gradient simulation, tributary confluence,
 * estuary termination, inter-tile river/road spline routing, and A* lowest-friction
 * road network pathfinding across terrain contours.
 */

import { MapState } from './types'
import { getTileElevationRank } from './cartographyShadingEngine'
import { getNeighbors, hexDistance, OffsetCoord } from './hexTopologyEngine'

export type MapLayerId =
  | 'terrain'
  | 'relief'
  | 'watershed'
  | 'roads'
  | 'territories'
  | 'slots'
  | 'labels'
  | 'fog'

export interface LayerMetadata {
  id: MapLayerId
  label: string
  description: string
  icon: string
}

export const MAP_LAYERS: LayerMetadata[] = [
  { id: 'terrain', label: 'Base Terrain', description: 'Biomes, oceans, and ground colors', icon: '🌍' },
  { id: 'relief', label: 'Elevation & Relief', description: 'Mountains, hills, crags, and plateaus', icon: '🏔️' },
  { id: 'watershed', label: 'Watershed & Rivers', description: 'Downhill river splines, tributaries, and estuaries', icon: '🌊' },
  { id: 'roads', label: 'Roads & Highways', description: 'Connected trade roads between settlements', icon: '🛣️' },
  { id: 'territories', label: 'Faction Borders', description: 'Territorial claims and geopolitical borders', icon: '🚩' },
  { id: 'slots', label: 'POI & Feature Tokens', description: 'Settlements, ruins, resources, and monuments', icon: '🏛️' },
  { id: 'labels', label: 'Cartographic Labels', description: 'Tile names, realm banners, and place markers', icon: '🏷️' },
  { id: 'fog', label: 'Fog of War', description: 'Wilderness shroud on unexplored provinces', icon: '🌫️' },
]

export const DEFAULT_MAP_LAYERS: Record<MapLayerId, boolean> = {
  terrain: true,
  relief: true,
  watershed: true,
  roads: true,
  territories: true,
  slots: true,
  labels: true,
  fog: true,
}

export interface RiverSegment {
  coord: OffsetCoord
  flowTo?: OffsetCoord
  flowFrom: OffsetCoord[]
  flux: number // River volume (1 = headwater creek, 2-3 = river, >=4 = great river)
  isEstuary?: boolean
}

export interface ConnectedDirection {
  dx: number
  dy: number
  name: 'north' | 'south' | 'east' | 'west' | 'northWest' | 'northEast' | 'southWest' | 'southEast'
}

/**
 * Returns direction name between two adjacent tiles.
 */
export function getRelativeDirectionName(
  from: OffsetCoord,
  to: OffsetCoord
): 'north' | 'south' | 'east' | 'west' | 'northWest' | 'northEast' | 'southWest' | 'southEast' {
  const dx = to.col - from.col
  const dy = to.row - from.row

  if (dx === 0 && dy < 0) return 'north'
  if (dx === 0 && dy > 0) return 'south'
  if (dx > 0 && dy === 0) return 'east'
  if (dx < 0 && dy === 0) return 'west'
  if (dx < 0 && dy < 0) return 'northWest'
  if (dx > 0 && dy < 0) return 'northEast'
  if (dx < 0 && dy > 0) return 'southWest'
  return 'southEast'
}

/**
 * Simulates downhill hydrological flow from a starting coordinate following steepest descent.
 * Terminates at the nearest water body, map edge, or local depression lake.
 */
export function traceDownhillRiver(
  map: MapState,
  start: OffsetCoord,
  maxSteps = 30
): OffsetCoord[] {
  const path: OffsetCoord[] = [start]
  const visited = new Set<string>([`${start.col},${start.row}`])
  let current = start

  for (let step = 0; step < maxSteps; step++) {
    const currentTile = map.tiles[`${current.col},${current.row}`]
    const currentElevation = getTileElevationRank(currentTile)

    // Reached open ocean or coastal water: estuary reached!
    if (currentElevation <= 1 && step > 0) {
      break
    }

    const neighbors = getNeighbors(current, map.gridTopology || 'square', {
      width: map.width,
      height: map.height,
    })

    // Find neighbor with steepest downward descent
    let steepestNeighbor: OffsetCoord | null = null
    let lowestElev = currentElevation

    for (const n of neighbors) {
      const key = `${n.col},${n.row}`
      if (visited.has(key)) continue

      const nTile = map.tiles[key]
      const nElev = getTileElevationRank(nTile)

      if (nElev < lowestElev) {
        lowestElev = nElev
        steepestNeighbor = n
      }
    }

    // If no strictly lower neighbor, seek closest water neighbor to escape local depression
    if (!steepestNeighbor) {
      for (const n of neighbors) {
        const key = `${n.col},${n.row}`
        if (visited.has(key)) continue
        const nTile = map.tiles[key]
        if (nTile && (nTile.terrain === 'water' || nTile.terrain === 'ocean')) {
          steepestNeighbor = n
          break
        }
      }
    }

    // If still no path, water pools into an inland basin sink
    if (!steepestNeighbor) {
      break
    }

    visited.add(`${steepestNeighbor.col},${steepestNeighbor.row}`)
    path.push(steepestNeighbor)
    current = steepestNeighbor
  }

  return path
}

/**
 * Scans the map for natural headwaters (mountain peaks, springs, plateaus)
 * and traces procedural watersheds down to sea basins with tributary flux accumulation.
 */
export function generateWorldWatersheds(
  map: MapState
): Record<string, RiverSegment> {
  const watershed: Record<string, RiverSegment> = {}

  // 1. Identify natural headwaters
  const headwaters: OffsetCoord[] = []
  for (let r = 0; r < map.height; r++) {
    for (let c = 0; c < map.width; c++) {
      const tile = map.tiles[`${c},${r}`]
      if (!tile) continue

      const elev = getTileElevationRank(tile)
      const hasHydrology = (tile.slots || []).some((s) => s.category === 'hydrology')

      // Mountains, volcanic cones, or springs form river sources
      if (elev >= 5 || hasHydrology || tile.hasRiver) {
        headwaters.push({ col: c, row: r })
      }
    }
  }

  // 2. Trace downhill channels
  for (const source of headwaters) {
    const flowPath = traceDownhillRiver(map, source)
    for (let i = 0; i < flowPath.length; i++) {
      const node = flowPath[i]
      const key = `${node.col},${node.row}`
      const nextNode = flowPath[i + 1]
      const prevNode = flowPath[i - 1]

      if (!watershed[key]) {
        watershed[key] = {
          coord: node,
          flowFrom: [],
          flux: 1,
        }
      } else {
        watershed[key].flux += 1 // Tributary confluence increases river volume!
      }

      if (nextNode) {
        watershed[key].flowTo = nextNode
      } else {
        watershed[key].isEstuary = true
      }

      if (prevNode) {
        const hasPrev = watershed[key].flowFrom.some(
          (p) => p.col === prevNode.col && p.row === prevNode.row
        )
        if (!hasPrev) {
          watershed[key].flowFrom.push(prevNode)
        }
      }
    }
  }

  return watershed
}

/**
 * Cost calculation for A* road pathfinding between two terrain tiles.
 * Evaluates distance, elevation changes, biomes, and existing road infrastructure.
 */
export function getRoadTraverseCost(
  fromMap: MapState,
  from: OffsetCoord,
  to: OffsetCoord
): number {
  const toTile = fromMap.tiles[`${to.col},${to.row}`]
  const fromTile = fromMap.tiles[`${from.col},${from.row}`]

  if (!toTile || !fromTile) return 999

  // Discount heavily if tile already has a road (connects to established trade highway)
  if (toTile.hasRoad) {
    return 0.35
  }

  const fromElev = getTileElevationRank(fromTile)
  const toElev = getTileElevationRank(toTile)
  const elevDiff = toElev - fromElev

  let cost = 1.0 // Base step cost

  // Elevation ascent penalty (roads follow mountain passes and contours)
  if (elevDiff > 0) {
    cost += elevDiff * 2.2
  } else if (elevDiff < 0) {
    cost += Math.abs(elevDiff) * 0.4
  }

  // Terrain friction
  switch (toTile.terrain) {
    case 'plains':
      cost += 0.2
      break
    case 'forest':
      cost += 0.9
      break
    case 'jungle':
      cost += 1.8
      break
    case 'swamp':
      cost += 2.8
      break
    case 'desert':
      cost += 1.2
      break
    case 'canyon':
      cost += 2.5
      break
    case 'mountain':
      cost += 4.5
      break
    case 'volcano':
      cost += 6.0
      break
    case 'water':
      cost += 5.0 // Ferry / bridge cost
      break
    case 'ocean':
      cost += 12.0 // Impassable deep ocean unless forced
      break
    default:
      cost += 0.5
  }

  // Relief friction
  if (toTile.relief === 'mountain' || toTile.relief === 'mountain-range') {
    cost += 4.0
  } else if (toTile.relief === 'crag' || toTile.relief === 'canyon') {
    cost += 3.0
  } else if (toTile.relief === 'hills' || toTile.relief === 'mesa') {
    cost += 1.2
  }

  return cost
}

/**
 * A* pathfinding algorithm finding the lowest-friction trade road between two tiles.
 */
export function findOptimalRoadPath(
  map: MapState,
  start: OffsetCoord,
  end: OffsetCoord
): OffsetCoord[] | null {
  const startKey = `${start.col},${start.row}`
  const endKey = `${end.col},${end.row}`

  if (startKey === endKey) return [start]

  interface PriorityNode {
    coord: OffsetCoord
    g: number // Cost from start
    f: number // g + h
  }

  const openSet: PriorityNode[] = [
    {
      coord: start,
      g: 0,
      f: hexDistance(start, end, map.gridTopology || 'square'),
    },
  ]

  const cameFrom: Record<string, OffsetCoord> = {}
  const gScore: Record<string, number> = { [startKey]: 0 }
  const closedSet = new Set<string>()

  while (openSet.length > 0) {
    // Find node with lowest f score
    openSet.sort((a, b) => a.f - b.f)
    const current = openSet.shift()!
    const curKey = `${current.coord.col},${current.coord.row}`

    if (curKey === endKey) {
      // Reconstruct path
      const path: OffsetCoord[] = [current.coord]
      let stepKey = curKey
      while (cameFrom[stepKey]) {
        const prev = cameFrom[stepKey]
        path.unshift(prev)
        stepKey = `${prev.col},${prev.row}`
      }
      return path
    }

    closedSet.add(curKey)

    const neighbors = getNeighbors(current.coord, map.gridTopology || 'square', {
      width: map.width,
      height: map.height,
    })

    for (const neighbor of neighbors) {
      const nKey = `${neighbor.col},${neighbor.row}`
      if (closedSet.has(nKey)) continue

      const stepCost = getRoadTraverseCost(map, current.coord, neighbor)
      const tentativeG = current.g + stepCost

      if (gScore[nKey] === undefined || tentativeG < gScore[nKey]) {
        cameFrom[nKey] = current.coord
        gScore[nKey] = tentativeG
        const h = hexDistance(neighbor, end, map.gridTopology || 'square')
        const f = tentativeG + h

        const existingOpen = openSet.find(
          (node) => node.coord.col === neighbor.col && node.coord.row === neighbor.row
        )
        if (!existingOpen) {
          openSet.push({ coord: neighbor, g: tentativeG, f })
        } else if (tentativeG < existingOpen.g) {
          existingOpen.g = tentativeG
          existingOpen.f = f
        }
      }
    }
  }

  return null
}

/**
 * Returns connected road neighbors for a tile to draw seamless road ribbons.
 */
export function getConnectedRoadAdjacencies(
  map: MapState,
  col: number,
  row: number
): OffsetCoord[] {
  const currentTile = map.tiles[`${col},${row}`]
  if (!currentTile || !currentTile.hasRoad) return []

  const neighbors = getNeighbors({ col, row }, map.gridTopology || 'square', {
    width: map.width,
    height: map.height,
  })

  return neighbors.filter((n) => {
    const nTile = map.tiles[`${n.col},${n.row}`]
    return nTile && nTile.hasRoad
  })
}

/**
 * Returns connected river neighbors for a tile to draw seamless river splines.
 */
export function getConnectedRiverAdjacencies(
  map: MapState,
  col: number,
  row: number
): OffsetCoord[] {
  const currentTile = map.tiles[`${col},${row}`]
  if (!currentTile || !currentTile.hasRiver) return []

  const neighbors = getNeighbors({ col, row }, map.gridTopology || 'square', {
    width: map.width,
    height: map.height,
  })

  return neighbors.filter((n) => {
    const nTile = map.tiles[`${n.col},${n.row}`]
    return nTile && (nTile.hasRiver || nTile.terrain === 'ocean' || nTile.terrain === 'water')
  })
}

/**
 * Generates an SVG path string connecting tile center to adjacent river or road points.
 */
export function generateConnectedPathD(
  centerX: number,
  centerY: number,
  tileSize: number,
  connectedAdjacencies: OffsetCoord[],
  originCoord: OffsetCoord
): string {
  if (connectedAdjacencies.length === 0) {
    // Isolated segment: render a gentle curve through center
    return `M ${centerX - tileSize * 0.3} ${centerY} Q ${centerX} ${centerY + tileSize * 0.1}, ${centerX + tileSize * 0.3} ${centerY}`
  }

  let d = ''
  for (const adj of connectedAdjacencies) {
    const dx = adj.col - originCoord.col
    const dy = adj.row - originCoord.row
    // Target edge boundary
    const edgeX = centerX + (dx * tileSize) / 2
    const edgeY = centerY + (dy * tileSize) / 2

    d += `M ${centerX} ${centerY} L ${edgeX} ${edgeY} `
  }

  return d.trim()
}
