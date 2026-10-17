import { MapState, MapTile, TerrainType, TileOverlay, TilePattern } from './types'

export const DEFAULT_MAP_WIDTH = 20
export const DEFAULT_MAP_HEIGHT = 12

export interface TerrainMetadata {
  id: TerrainType
  label: string
  color: string
  borderColor: string
  symbol: string
}

export const TERRAIN_PALETTE: Record<TerrainType, TerrainMetadata> = {
  ocean: {
    id: 'ocean',
    label: 'Deep Ocean',
    color: '#1e3a8a',
    borderColor: '#172554',
    symbol: '🌊',
  },
  water: {
    id: 'water',
    label: 'Coastal / River',
    color: '#3b82f6',
    borderColor: '#2563eb',
    symbol: '💧',
  },
  plains: {
    id: 'plains',
    label: 'Grasslands',
    color: '#86efac',
    borderColor: '#4ade80',
    symbol: '🌾',
  },
  earth: {
    id: 'earth',
    label: 'Highlands / Hills',
    color: '#a8a29e',
    borderColor: '#78716c',
    symbol: '⛰️',
  },
  forest: {
    id: 'forest',
    label: 'Forest',
    color: '#166534',
    borderColor: '#14532d',
    symbol: '🌲',
  },
  jungle: {
    id: 'jungle',
    label: 'Dense Jungle',
    color: '#15803d',
    borderColor: '#166534',
    symbol: '🌴',
  },
  mountain: {
    id: 'mountain',
    label: 'Mountain Peaks',
    color: '#57534e',
    borderColor: '#44403c',
    symbol: '🏔️',
  },
  canyon: {
    id: 'canyon',
    label: 'Canyon / Rift',
    color: '#9a3412',
    borderColor: '#7c2d12',
    symbol: '🏜️',
  },
  desert: {
    id: 'desert',
    label: 'Arid Desert',
    color: '#fde047',
    borderColor: '#facc15',
    symbol: '☀️',
  },
  swamp: {
    id: 'swamp',
    label: 'Marsh / Swamp',
    color: '#3f6212',
    borderColor: '#365314',
    symbol: '🐊',
  },
  tundra: {
    id: 'tundra',
    label: 'Frozen Tundra',
    color: '#e0f2fe',
    borderColor: '#bae6fd',
    symbol: '❄️',
  },
  volcano: {
    id: 'volcano',
    label: 'Volcanic Lands',
    color: '#dc2626',
    borderColor: '#991b1b',
    symbol: '🌋',
  },
}

export interface OverlayMetadata {
  id: TileOverlay
  label: string
  symbol: string
}

export const OVERLAY_PALETTE: Record<TileOverlay, OverlayMetadata> = {
  none: { id: 'none', label: 'None', symbol: '' },
  settlement: { id: 'settlement', label: 'Village / Settlement', symbol: '⛺' },
  city: { id: 'city', label: 'Major City', symbol: '🏛️' },
  castle: { id: 'castle', label: 'Fortress / Citadel', symbol: '🏰' },
  monument: { id: 'monument', label: 'Grand Monument', symbol: '🗿' },
  ruins: { id: 'ruins', label: 'Ancient Ruins', symbol: '🏚️' },
  cave: { id: 'cave', label: 'Cavern / Lair', symbol: '🕳️' },
  resource: { id: 'resource', label: 'Rich Resource', symbol: '💎' },
  battle: { id: 'battle', label: 'Battleground', symbol: '⚔️' },
  myth: { id: 'myth', label: 'Mythic Anomaly', symbol: '✨' },
}

export function getTileId(col: number, row: number): string {
  return `${col},${row}`
}

export function createDefaultTile(
  col: number,
  row: number,
  terrain: TerrainType = 'ocean'
): MapTile {
  return {
    id: getTileId(col, row),
    col,
    row,
    terrain,
    pattern: 'solid',
    overlay: 'none',
    tags: [],
    linkedEventIds: [],
    linkedEntityIds: [],
  }
}

export function createInitialMap(
  width: number = DEFAULT_MAP_WIDTH,
  height: number = DEFAULT_MAP_HEIGHT
): MapState {
  const tiles: Record<string, MapTile> = {}
  const centerX = (width - 1) / 2
  const centerY = (height - 1) / 2
  const radiusX = width * 0.35
  const radiusY = height * 0.35

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      // Create a gentle default central continent surrounded by ocean
      const normDist =
        Math.pow((col - centerX) / radiusX, 2) + Math.pow((row - centerY) / radiusY, 2)
      let terrain: TerrainType = 'ocean'
      if (normDist < 0.35) {
        terrain = 'earth'
      } else if (normDist < 0.85) {
        terrain = 'plains'
      } else if (normDist < 1.05) {
        terrain = 'water'
      }
      tiles[getTileId(col, row)] = createDefaultTile(col, row, terrain)
    }
  }

  return { width, height, tiles }
}

export function paintTile(
  map: MapState,
  col: number,
  row: number,
  updates: Partial<Omit<MapTile, 'id' | 'col' | 'row'>>
): MapState {
  const id = getTileId(col, row)
  const existing = map.tiles[id] || createDefaultTile(col, row)
  return {
    ...map,
    tiles: {
      ...map.tiles,
      [id]: {
        ...existing,
        ...updates,
      },
    },
  }
}

export function bucketFillTerrain(
  map: MapState,
  startCol: number,
  startRow: number,
  newTerrain: TerrainType,
  secondaryTerrain?: TerrainType,
  pattern: TilePattern = 'solid'
): MapState {
  const startId = getTileId(startCol, startRow)
  const startTile = map.tiles[startId]
  if (!startTile) return map

  const targetTerrain = startTile.terrain
  if (
    targetTerrain === newTerrain &&
    startTile.secondaryTerrain === secondaryTerrain &&
    startTile.pattern === pattern
  ) {
    return map
  }

  const newTiles = { ...map.tiles }
  const visited = new Set<string>()
  const queue: [number, number][] = [[startCol, startRow]]

  while (queue.length > 0) {
    const [col, row] = queue.shift()!
    const id = getTileId(col, row)
    if (visited.has(id)) continue
    visited.add(id)

    const current = newTiles[id]
    if (!current || current.terrain !== targetTerrain) continue

    newTiles[id] = {
      ...current,
      terrain: newTerrain,
      secondaryTerrain,
      pattern,
    }

    const neighbors: [number, number][] = [
      [col + 1, row],
      [col - 1, row],
      [col, row + 1],
      [col, row - 1],
    ]
    for (const [nCol, nRow] of neighbors) {
      if (nCol >= 0 && nCol < map.width && nRow >= 0 && nRow < map.height) {
        const nId = getTileId(nCol, nRow)
        if (!visited.has(nId) && newTiles[nId]?.terrain === targetTerrain) {
          queue.push([nCol, nRow])
        }
      }
    }
  }

  return {
    ...map,
    tiles: newTiles,
  }
}

export function exportMapToSvgString(map: MapState, worldName: string = 'World Map'): string {
  const tileSize = 48
  const svgWidth = map.width * tileSize
  const svgHeight = map.height * tileSize

  let rects = ''
  for (let row = 0; row < map.height; row++) {
    for (let col = 0; col < map.width; col++) {
      const id = getTileId(col, row)
      const tile = map.tiles[id] || createDefaultTile(col, row)
      const meta = TERRAIN_PALETTE[tile.terrain] || TERRAIN_PALETTE.ocean
      const overlayMeta = OVERLAY_PALETTE[tile.overlay] || OVERLAY_PALETTE.none
      const x = col * tileSize
      const y = row * tileSize

      rects += `<rect x="${x}" y="${y}" width="${tileSize}" height="${tileSize}" fill="${meta.color}" stroke="${meta.borderColor}" stroke-width="1" />`

      if (tile.secondaryTerrain && tile.pattern && tile.pattern !== 'solid') {
        const secColor = TERRAIN_PALETTE[tile.secondaryTerrain]?.color || meta.color
        if (tile.pattern === 'diagonal') {
          rects += `<polygon points="${x},${y + tileSize} ${x + tileSize},${y} ${x + tileSize},${y + tileSize}" fill="${secColor}" />`
        } else if (tile.pattern === 'horizontal') {
          rects += `<rect x="${x}" y="${y + tileSize / 2}" width="${tileSize}" height="${tileSize / 2}" fill="${secColor}" />`
        } else if (tile.pattern === 'vertical') {
          rects += `<rect x="${x + tileSize / 2}" y="${y}" width="${tileSize / 2}" height="${tileSize}" fill="${secColor}" />`
        }
      }

      const displaySymbol = overlayMeta.symbol || meta.symbol
      if (displaySymbol) {
        rects += `<text x="${x + tileSize / 2}" y="${y + tileSize / 2 + 5}" font-size="18" text-anchor="middle">${displaySymbol}</text>`
      }

      if (tile.label) {
        const escapedLabel = tile.label
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
        rects += `<text x="${x + tileSize / 2}" y="${y + tileSize - 4}" font-size="9" font-family="sans-serif" fill="#ffffff" stroke="#000000" stroke-width="0.4" text-anchor="middle">${escapedLabel}</text>`
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}">
  <title>${worldName.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</title>
  ${rects}
</svg>`
}
