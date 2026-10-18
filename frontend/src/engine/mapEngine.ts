import {
  FloraType,
  GeographyPreset,
  MapState,
  MapTile,
  ReliefType,
  TerrainType,
  TileOverlay,
  TilePattern,
  WorldEntity,
} from './types'

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
    label: 'Coastal / Lake',
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
    color: '#d6d3d1',
    borderColor: '#a8a29e',
    symbol: '⛰️',
  },
  forest: {
    id: 'forest',
    label: 'Woodland',
    color: '#22c55e',
    borderColor: '#16a34a',
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
    label: 'Alpine Peaks',
    color: '#78716c',
    borderColor: '#57534e',
    symbol: '🏔️',
  },
  canyon: {
    id: 'canyon',
    label: 'Canyon / Badlands',
    color: '#c2410c',
    borderColor: '#9a3412',
    symbol: '🏜️',
  },
  desert: {
    id: 'desert',
    label: 'Golden Dunes',
    color: '#fde047',
    borderColor: '#eab308',
    symbol: '☀️',
  },
  swamp: {
    id: 'swamp',
    label: 'Marsh / Fen',
    color: '#4d7c0f',
    borderColor: '#3f6212',
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
    color: '#b91c1c',
    borderColor: '#7f1d1d',
    symbol: '🌋',
  },
}

export const RELIEF_PALETTE: Record<ReliefType, { id: ReliefType; label: string; symbol: string }> =
  {
    none: { id: 'none', label: 'Flat', symbol: '' },
    hills: { id: 'hills', label: 'Rolling Hills', symbol: '⛰️' },
    mountain: { id: 'mountain', label: 'Mountain Range', symbol: '🏔️' },
    canyon: { id: 'canyon', label: 'Deep Canyon', symbol: '🕳️' },
    volcano: { id: 'volcano', label: 'Active Volcano', symbol: '🌋' },
  }

export const FLORA_PALETTE: Record<FloraType, { id: FloraType; label: string; symbol: string }> = {
  none: { id: 'none', label: 'None', symbol: '' },
  forest: { id: 'forest', label: 'Pine / Oak Forest', symbol: '🌲' },
  jungle: { id: 'jungle', label: 'Tropical Canopy', symbol: '🌴' },
  marsh: { id: 'marsh', label: 'Wetland Reeds', symbol: '🌿' },
  oasis: { id: 'oasis', label: 'Lush Oasis', symbol: '🏝️' },
}

export interface OverlayMetadata {
  id: TileOverlay
  label: string
  symbol: string
}

export const OVERLAY_PALETTE: Record<TileOverlay, OverlayMetadata> = {
  none: { id: 'none', label: 'None', symbol: '' },
  settlement: { id: 'settlement', label: 'Village / Outpost', symbol: '⛺' },
  town: { id: 'town', label: 'Trading Town', symbol: '🏘️' },
  city: { id: 'city', label: 'Walled City', symbol: '🏛️' },
  capital: { id: 'capital', label: 'Grand Capital', symbol: '👑' },
  castle: { id: 'castle', label: 'Fortress / Citadel', symbol: '🏰' },
  monument: { id: 'monument', label: 'Wonder / Monument', symbol: '🗿' },
  ruins: { id: 'ruins', label: 'Ancient Ruins', symbol: '🏚️' },
  cave: { id: 'cave', label: 'Cavern / Lair', symbol: '🕳️' },
  resource: { id: 'resource', label: 'Strategic Resource', symbol: '💎' },
  battle: { id: 'battle', label: 'Historic Battleground', symbol: '⚔️' },
  myth: { id: 'myth', label: 'Mythic Anomaly', symbol: '✨' },
  historic_site: { id: 'historic_site', label: 'Historic Landmark', symbol: '📍' },
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
    relief: 'none',
    flora: 'none',
    pattern: 'solid',
    overlay: 'none',
    hasRiver: false,
    hasRoad: false,
    tags: [],
    linkedEventIds: [],
    linkedEntityIds: [],
  }
}

export function createInitialMap(
  width: number = DEFAULT_MAP_WIDTH,
  height: number = DEFAULT_MAP_HEIGHT,
  preset: GeographyPreset = 'continent',
  rng?: () => number
): MapState {
  const tiles: Record<string, MapTile> = {}
  const centerX = (width - 1) / 2
  const centerY = (height - 1) / 2
  const radiusX = width * 0.35
  const radiusY = height * 0.35

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const jitter = rng ? (rng() - 0.5) * 0.28 : 0
      let terrain: TerrainType = 'ocean'
      let relief: ReliefType = 'none'
      let flora: FloraType = 'none'

      if (preset === 'archipelago') {
        const c1 =
          Math.pow((col - width * 0.25) / (width * 0.16), 2) +
          Math.pow((row - height * 0.35) / (height * 0.22), 2)
        const c2 =
          Math.pow((col - width * 0.65) / (width * 0.18), 2) +
          Math.pow((row - height * 0.6) / (height * 0.22), 2)
        const c3 =
          Math.pow((col - width * 0.5) / (width * 0.12), 2) +
          Math.pow((row - height * 0.25) / (height * 0.16), 2)
        const minDist = Math.min(c1, c2, c3) + jitter
        if (minDist < 0.4) {
          terrain = 'earth'
          relief = 'hills'
        } else if (minDist < 0.85) {
          terrain = 'plains'
          flora = minDist < 0.6 ? 'forest' : 'none'
        } else if (minDist < 1.15) {
          terrain = 'water'
        }
      } else if (preset === 'twin-continents') {
        const leftDist =
          Math.pow((col - width * 0.26) / (width * 0.2), 2) +
          Math.pow((row - centerY) / (height * 0.36), 2) +
          jitter
        const rightDist =
          Math.pow((col - width * 0.74) / (width * 0.2), 2) +
          Math.pow((row - centerY) / (height * 0.36), 2) +
          jitter
        const d = Math.min(leftDist, rightDist)
        if (d < 0.3) {
          terrain = 'earth'
          relief = 'mountain'
        } else if (d < 0.85) {
          terrain = 'plains'
        } else if (d < 1.1) {
          terrain = 'water'
        }
      } else if (preset === 'inland-sea') {
        const distFromCenter =
          Math.pow((col - centerX) / radiusX, 2) +
          Math.pow((row - centerY) / radiusY, 2) +
          jitter
        if (distFromCenter < 0.35) {
          terrain = 'water'
        } else if (distFromCenter < 1.2) {
          terrain = 'plains'
          if (distFromCenter > 0.9) relief = 'hills'
        } else {
          terrain = 'earth'
          relief = 'mountain'
        }
      } else if (preset === 'pangaea') {
        const normDist =
          Math.pow((col - centerX) / (width * 0.44), 2) +
          Math.pow((row - centerY) / (height * 0.44), 2) +
          jitter
        if (normDist < 0.25) {
          terrain = 'mountain'
          relief = 'mountain'
        } else if (normDist < 0.5) {
          terrain = 'earth'
          relief = 'hills'
        } else if (normDist < 0.92) {
          terrain = 'plains'
        } else if (normDist < 1.08) {
          terrain = 'water'
        }
      } else {
        // Standard central continent
        const normDist =
          Math.pow((col - centerX) / radiusX, 2) +
          Math.pow((row - centerY) / radiusY, 2) +
          jitter
        if (normDist < 0.35) {
          terrain = 'earth'
          relief = 'hills'
        } else if (normDist < 0.85) {
          terrain = 'plains'
        } else if (normDist < 1.05) {
          terrain = 'water'
        }
      }

      const tile = createDefaultTile(col, row, terrain)
      tile.relief = relief
      tile.flora = flora
      tiles[tile.id] = tile
    }
  }

  return { width, height, tiles }
}

export function resizeMap(map: MapState, newWidth: number, newHeight: number): MapState {
  const clampedW = Math.max(6, Math.min(40, newWidth))
  const clampedH = Math.max(6, Math.min(30, newHeight))
  const tiles: Record<string, MapTile> = {}

  for (let row = 0; row < clampedH; row++) {
    for (let col = 0; col < clampedW; col++) {
      const id = getTileId(col, row)
      if (map.tiles[id]) {
        tiles[id] = { ...map.tiles[id], col, row, id }
      } else {
        tiles[id] = createDefaultTile(col, row, 'ocean')
      }
    }
  }

  return {
    width: clampedW,
    height: clampedH,
    tiles,
  }
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

export function exportMapToSvgString(
  map: MapState,
  worldName: string = 'World Map',
  entities: WorldEntity[] = []
): string {
  const tileSize = 48
  const svgWidth = map.width * tileSize
  const svgHeight = map.height * tileSize

  const entityColorMap: Record<string, string> = {}
  for (const ent of entities) {
    if (ent.color) {
      entityColorMap[ent.id] = ent.color
    }
  }

  let rects = ''
  for (let row = 0; row < map.height; row++) {
    for (let col = 0; col < map.width; col++) {
      const id = getTileId(col, row)
      const tile = map.tiles[id] || createDefaultTile(col, row)
      const meta = TERRAIN_PALETTE[tile.terrain] || TERRAIN_PALETTE.ocean
      const overlayMeta = OVERLAY_PALETTE[tile.overlay] || OVERLAY_PALETTE.none
      const x = col * tileSize
      const y = row * tileSize

      const territoryColor = tile.territoryId ? entityColorMap[tile.territoryId] : undefined
      const strokeColor = territoryColor || meta.borderColor
      const strokeWidth = territoryColor ? '2.5' : '1'

      rects += `<rect x="${x}" y="${y}" width="${tileSize}" height="${tileSize}" fill="${meta.color}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`

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

      if (tile.hasRiver) {
        rects += `<path d="M ${x} ${y + tileSize * 0.3} Q ${x + tileSize * 0.5} ${y + tileSize * 0.7}, ${x + tileSize} ${y + tileSize * 0.4}" stroke="#2563eb" stroke-width="3.5" fill="none" />`
      }

      if (tile.hasRoad) {
        rects += `<line x1="${x}" y1="${y + tileSize * 0.5}" x2="${x + tileSize}" y2="${y + tileSize * 0.5}" stroke="#78350f" stroke-width="2" stroke-dasharray="4 2" />`
      }

      // Composite symbols (relief + flora + overlay)
      const reliefSym =
        tile.relief && tile.relief !== 'none' ? RELIEF_PALETTE[tile.relief]?.symbol : ''
      const floraSym =
        tile.flora && tile.flora !== 'none' ? FLORA_PALETTE[tile.flora]?.symbol : ''

      if (reliefSym && floraSym && overlayMeta.id === 'none') {
        rects += `<text x="${x + 14}" y="${y + 24}" font-size="14" text-anchor="middle">${reliefSym}</text>`
        rects += `<text x="${x + 34}" y="${y + 30}" font-size="14" text-anchor="middle">${floraSym}</text>`
      } else {
        const displaySymbol = overlayMeta.symbol || floraSym || reliefSym || meta.symbol
        if (displaySymbol) {
          rects += `<text x="${x + tileSize / 2}" y="${y + tileSize / 2 + 5}" font-size="18" text-anchor="middle">${displaySymbol}</text>`
        }
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
