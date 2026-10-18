import {
  FloraType,
  GeographyPreset,
  MapState,
  MapTile,
  ReliefType,
  TerrainType,
  TileColoringMode,
  TileOverlay,
  TilePattern,
  TileSlot,
  WorldEntity,
} from './types'

export const DEFAULT_MAP_WIDTH = 20
export const DEFAULT_MAP_HEIGHT = 12

export interface TerrainMetadata {
  id: TerrainType
  label: string
  domain: 'land' | 'water'
  color: string
  secondaryColor: string
  borderColor: string
  symbol: string
  isBackgroundTerrain: boolean // true if an empty tile of this type should NOT show a center icon
}

export const TERRAIN_PALETTE: Record<TerrainType, TerrainMetadata> = {
  ocean: {
    id: 'ocean',
    label: 'Deep Ocean',
    domain: 'water',
    color: '#1e3a5f',
    secondaryColor: '#172554',
    borderColor: '#162c4a',
    symbol: '🌊',
    isBackgroundTerrain: true,
  },
  water: {
    id: 'water',
    label: 'Coastal Sea / Shallows',
    domain: 'water',
    color: '#2b5b84',
    secondaryColor: '#38bdf8',
    borderColor: '#234b6e',
    symbol: '💧',
    isBackgroundTerrain: true,
  },
  plains: {
    id: 'plains',
    label: 'Grasslands & Meadows',
    domain: 'land',
    color: '#a3be7b',
    secondaryColor: '#84a95c',
    borderColor: '#8aa663',
    symbol: '🌾',
    isBackgroundTerrain: true,
  },
  earth: {
    id: 'earth',
    label: 'Steppe & Highlands',
    domain: 'land',
    color: '#cbb892',
    secondaryColor: '#b59e72',
    borderColor: '#b39f78',
    symbol: '⛰️',
    isBackgroundTerrain: true,
  },
  forest: {
    id: 'forest',
    label: 'Woodland & Timber',
    domain: 'land',
    color: '#6b9459',
    secondaryColor: '#4a723b',
    borderColor: '#567a46',
    symbol: '🌲',
    isBackgroundTerrain: false,
  },
  jungle: {
    id: 'jungle',
    label: 'Dense Rainforest',
    domain: 'land',
    color: '#487a4b',
    secondaryColor: '#2d5a34',
    borderColor: '#39633c',
    symbol: '🌴',
    isBackgroundTerrain: false,
  },
  mountain: {
    id: 'mountain',
    label: 'Alpine Peaks',
    domain: 'land',
    color: '#9c9284',
    secondaryColor: '#e7e2da',
    borderColor: '#7d7365',
    symbol: '🏔️',
    isBackgroundTerrain: false,
  },
  canyon: {
    id: 'canyon',
    label: 'Redstone Badlands',
    domain: 'land',
    color: '#c47b52',
    secondaryColor: '#9a4e28',
    borderColor: '#a6623c',
    symbol: '🏜️',
    isBackgroundTerrain: false,
  },
  desert: {
    id: 'desert',
    label: 'Golden Dunes & Arid',
    domain: 'land',
    color: '#e3c785',
    secondaryColor: '#cfa95b',
    borderColor: '#cbb06e',
    symbol: '☀️',
    isBackgroundTerrain: true,
  },
  swamp: {
    id: 'swamp',
    label: 'Fen & Marshland',
    domain: 'land',
    color: '#6e8258',
    secondaryColor: '#4c5e3a',
    borderColor: '#5a6c46',
    symbol: '芦',
    isBackgroundTerrain: false,
  },
  tundra: {
    id: 'tundra',
    label: 'Frost & Snowfield',
    domain: 'land',
    color: '#dce6ea',
    secondaryColor: '#b8cdd6',
    borderColor: '#c2d2d9',
    symbol: '❄️',
    isBackgroundTerrain: true,
  },
  volcano: {
    id: 'volcano',
    label: 'Volcanic Caldera',
    domain: 'land',
    color: '#7a4942',
    secondaryColor: '#dc2626',
    borderColor: '#5c342e',
    symbol: '🌋',
    isBackgroundTerrain: false,
  },
}

export const RELIEF_PALETTE: Record<
  ReliefType,
  { id: ReliefType; label: string; symbol: string; priority: number }
> = {
  none: { id: 'none', label: 'Flat', symbol: '', priority: 0 },
  hills: { id: 'hills', label: 'Rolling Hills', symbol: '⛰️', priority: 62 },
  mountain: { id: 'mountain', label: 'Mountain Range', symbol: '🏔️', priority: 75 },
  canyon: { id: 'canyon', label: 'Deep Canyon', symbol: '🏜️', priority: 72 },
  volcano: { id: 'volcano', label: 'Active Volcano', symbol: '🌋', priority: 84 },
}

export const FLORA_PALETTE: Record<
  FloraType,
  { id: FloraType; label: string; symbol: string; priority: number }
> = {
  none: { id: 'none', label: 'None', symbol: '', priority: 0 },
  forest: { id: 'forest', label: 'Pine / Oak Forest', symbol: '🌲', priority: 60 },
  jungle: { id: 'jungle', label: 'Tropical Canopy', symbol: '🌴', priority: 64 },
  marsh: { id: 'marsh', label: 'Wetland Reeds', symbol: '🌿', priority: 56 },
  oasis: { id: 'oasis', label: 'Lush Oasis', symbol: '🏝️', priority: 68 },
}

export interface OverlayMetadata {
  id: TileOverlay
  label: string
  symbol: string
  priority: number
}

export const OVERLAY_PALETTE: Record<TileOverlay, OverlayMetadata> = {
  none: { id: 'none', label: 'None', symbol: '', priority: 0 },
  settlement: { id: 'settlement', label: 'Village / Outpost', symbol: '🏡', priority: 92 },
  town: { id: 'town', label: 'Trading Town', symbol: '🏘️', priority: 94 },
  city: { id: 'city', label: 'Walled City', symbol: '🏰', priority: 96 },
  capital: { id: 'capital', label: 'Grand Capital', symbol: '👑', priority: 99 },
  castle: { id: 'castle', label: 'Fortress / Citadel', symbol: '🛡️', priority: 91 },
  monument: { id: 'monument', label: 'Wonder / Monument', symbol: '🏛️', priority: 89 },
  ruins: { id: 'ruins', label: 'Ancient Ruins', symbol: '🏚️', priority: 85 },
  cave: { id: 'cave', label: 'Cavern / Lair', symbol: '🕳️', priority: 76 },
  resource: { id: 'resource', label: 'Strategic Resource', symbol: '💎', priority: 70 },
  battle: { id: 'battle', label: 'Historic Battleground', symbol: '⚔️', priority: 86 },
  myth: { id: 'myth', label: 'Mythic Anomaly', symbol: '✨', priority: 90 },
  historic_site: { id: 'historic_site', label: 'Historic Landmark', symbol: '📍', priority: 82 },
}

export function getTileId(col: number, row: number): string {
  return `${col},${row}`
}

export function getTileDomain(tile: Pick<MapTile, 'domain' | 'terrain'>): 'land' | 'water' {
  if (tile.domain === 'land' || tile.domain === 'water') {
    return tile.domain
  }
  return tile.terrain === 'ocean' || tile.terrain === 'water' ? 'water' : 'land'
}

export function getTileVariantSeed(col: number, row: number): number {
  return Math.abs((col * 37 + row * 101 + col * row * 13) % 4)
}

export function createDefaultTile(
  col: number,
  row: number,
  terrain: TerrainType = 'ocean'
): MapTile {
  const domain = terrain === 'ocean' || terrain === 'water' ? 'water' : 'land'
  return {
    id: getTileId(col, row),
    col,
    row,
    domain,
    terrain,
    relief: 'none',
    flora: 'none',
    pattern: 'solid',
    coloringMode: 'fill',
    slots: [],
    overlay: 'none',
    hasRiver: false,
    hasRoad: false,
    tags: [],
    linkedEventIds: [],
    linkedEntityIds: [],
  }
}

export function addSlotToTile(
  tile: MapTile,
  slotInput: Omit<TileSlot, 'id'> & { id?: string }
): MapTile {
  const existingSlots = [...(tile.slots || [])]
  const id = slotInput.id || `slot_${slotInput.category}_${existingSlots.length + 1}`
  const newSlot: TileSlot = {
    ...slotInput,
    id,
  }
  // Avoid exact duplicate slot name + category on the same tile
  const filtered = existingSlots.filter(
    (s) => !(s.category === newSlot.category && s.name === newSlot.name)
  )
  const merged = [...filtered, newSlot].sort((a, b) => b.priority - a.priority)
  return {
    ...tile,
    slots: merged,
  }
}

export function removeSlotFromTile(tile: MapTile, slotId: string): MapTile {
  return {
    ...tile,
    slots: (tile.slots || []).filter((s) => s.id !== slotId),
  }
}

/**
 * Computes the prioritized list of visual slots for a tile.
 * Empty background tiles (grassland, ocean, water, desert, tundra, flat steppe) return []
 * so the map remains clean and free of redundant icon clutter.
 */
export function getEffectiveTileSlots(
  tile: MapTile,
  entities: WorldEntity[] = []
): TileSlot[] {
  const explicitSlots = [...(tile.slots || [])]
  const derived: TileSlot[] = [...explicitSlots]

  const hasCategory = (cat: TileSlot['category']) =>
    derived.some((s) => s.category === cat)

  // Check if an owning entity provides custom settlement icons
  const ownerEntity = entities.find(
    (e) =>
      e.id === tile.territoryId ||
      (tile.linkedEntityIds && tile.linkedEntityIds.includes(e.id))
  )

  // 1. Overlay-derived slot (if not already covered)
  if (tile.overlay && tile.overlay !== 'none') {
    const ov = OVERLAY_PALETTE[tile.overlay]
    const isSettlementOverlay = ['settlement', 'town', 'city', 'capital', 'castle'].includes(
      tile.overlay
    )
    if (ov && (!isSettlementOverlay || !hasCategory('settlement'))) {
      let icon = ov.symbol
      if (isSettlementOverlay && ownerEntity?.settlementIcons) {
        if (tile.overlay === 'settlement') icon = ownerEntity.settlementIcons.village
        else if (tile.overlay === 'town') icon = ownerEntity.settlementIcons.town
        else if (tile.overlay === 'city' || tile.overlay === 'castle')
          icon = ownerEntity.settlementIcons.city
        else if (tile.overlay === 'capital') icon = ownerEntity.settlementIcons.metropolis
      }
      const alreadyExists = derived.some((s) => s.type === tile.overlay)
      if (!alreadyExists) {
        derived.push({
          id: `derived_overlay_${tile.overlay}`,
          category: isSettlementOverlay
            ? 'settlement'
            : tile.overlay === 'myth'
            ? 'myth'
            : tile.overlay === 'resource'
            ? 'resource'
            : 'structure',
          type: tile.overlay,
          name: tile.label || ov.label,
          icon,
          priority: ov.priority,
          color: ownerEntity?.color,
        })
      }
    }
  }

  // 2. Relief-derived slot
  const effectiveRelief: ReliefType =
    tile.relief && tile.relief !== 'none'
      ? tile.relief
      : tile.terrain === 'mountain'
      ? 'mountain'
      : tile.terrain === 'volcano'
      ? 'volcano'
      : tile.terrain === 'canyon'
      ? 'canyon'
      : 'none'

  if (effectiveRelief !== 'none' && !hasCategory('elevation')) {
    const rel = RELIEF_PALETTE[effectiveRelief]
    derived.push({
      id: `derived_relief_${effectiveRelief}`,
      category: 'elevation',
      type: effectiveRelief,
      name: rel.label,
      icon: rel.symbol,
      priority: rel.priority,
    })
  }

  // 3. Flora-derived slot
  const effectiveFlora: FloraType =
    tile.flora && tile.flora !== 'none'
      ? tile.flora
      : tile.terrain === 'forest'
      ? 'forest'
      : tile.terrain === 'jungle'
      ? 'jungle'
      : tile.terrain === 'swamp'
      ? 'marsh'
      : 'none'

  if (effectiveFlora !== 'none' && !hasCategory('vegetation')) {
    const fl = FLORA_PALETTE[effectiveFlora]
    derived.push({
      id: `derived_flora_${effectiveFlora}`,
      category: 'vegetation',
      type: effectiveFlora,
      name: fl.label,
      icon: fl.symbol,
      priority: fl.priority,
    })
  }

  return derived.sort((a, b) => b.priority - a.priority)
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
        if (minDist < 0.36) {
          terrain = 'earth'
          relief = 'hills'
        } else if (minDist < 0.85) {
          terrain = 'plains'
          flora = minDist < 0.52 ? 'forest' : 'none'
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
        if (d < 0.25) {
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
          if (distFromCenter > 0.95) relief = 'hills'
        } else {
          terrain = 'earth'
          relief = 'mountain'
        }
      } else if (preset === 'pangaea') {
        const normDist =
          Math.pow((col - centerX) / (width * 0.44), 2) +
          Math.pow((row - centerY) / (height * 0.44), 2) +
          jitter
        if (normDist < 0.2) {
          terrain = 'mountain'
          relief = 'mountain'
        } else if (normDist < 0.42) {
          terrain = 'earth'
          relief = 'hills'
        } else if (normDist < 0.92) {
          terrain = 'plains'
        } else if (normDist < 1.08) {
          terrain = 'water'
        }
      } else {
        // Standard central continent: mostly calm plains with a central spine so the map starts clean
        const normDist =
          Math.pow((col - centerX) / radiusX, 2) +
          Math.pow((row - centerY) / radiusY, 2) +
          jitter
        if (normDist < 0.22) {
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
  const nextTerrain = updates.terrain ?? existing.terrain
  const nextDomain =
    updates.domain ??
    (updates.terrain
      ? nextTerrain === 'ocean' || nextTerrain === 'water'
        ? 'water'
        : 'land'
      : getTileDomain(existing))

  return {
    ...map,
    tiles: {
      ...map.tiles,
      [id]: {
        ...existing,
        ...updates,
        domain: nextDomain,
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
  pattern: TilePattern = 'solid',
  coloringMode: TileColoringMode = 'fill',
  customColors?: { primary?: string; secondary?: string }
): MapState {
  const startId = getTileId(startCol, startRow)
  const startTile = map.tiles[startId]
  if (!startTile) return map

  const targetTerrain = startTile.terrain
  if (
    targetTerrain === newTerrain &&
    startTile.secondaryTerrain === secondaryTerrain &&
    startTile.pattern === pattern &&
    startTile.coloringMode === coloringMode
  ) {
    return map
  }

  const newDomain = newTerrain === 'ocean' || newTerrain === 'water' ? 'water' : 'land'
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
      domain: newDomain,
      terrain: newTerrain,
      secondaryTerrain,
      pattern,
      coloringMode,
      customColors: customColors ?? current.customColors,
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
      const x = col * tileSize
      const y = row * tileSize

      const primaryColor = tile.customColors?.primary || meta.color
      const secondaryColor =
        tile.customColors?.secondary ||
        (tile.secondaryTerrain ? TERRAIN_PALETTE[tile.secondaryTerrain]?.color : undefined) ||
        meta.secondaryColor

      const territoryColor = tile.territoryId ? entityColorMap[tile.territoryId] : undefined
      const strokeColor = territoryColor || meta.borderColor
      const strokeWidth = territoryColor ? '2.5' : '0.8'

      if (tile.coloringMode === 'outline') {
        rects += `<rect x="${x}" y="${y}" width="${tileSize}" height="${tileSize}" fill="#f5eedc" stroke="${primaryColor}" stroke-width="3" />`
      } else {
        rects += `<rect x="${x}" y="${y}" width="${tileSize}" height="${tileSize}" fill="${primaryColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`
      }

      if (
        (tile.coloringMode === 'patterned' || (tile.pattern && tile.pattern !== 'solid')) &&
        secondaryColor
      ) {
        const pat = tile.pattern || 'diagonal'
        if (pat === 'diagonal') {
          rects += `<polygon points="${x},${y + tileSize} ${x + tileSize},${y} ${x + tileSize},${y + tileSize}" fill="${secondaryColor}" opacity="0.55" />`
        } else if (pat === 'horizontal') {
          rects += `<rect x="${x}" y="${y + tileSize / 2}" width="${tileSize}" height="${tileSize / 2}" fill="${secondaryColor}" opacity="0.55" />`
        } else if (pat === 'vertical') {
          rects += `<rect x="${x + tileSize / 2}" y="${y}" width="${tileSize / 2}" height="${tileSize}" fill="${secondaryColor}" opacity="0.55" />`
        }
      }

      if (tile.hasRiver) {
        rects += `<path d="M ${x} ${y + tileSize * 0.3} Q ${x + tileSize * 0.5} ${y + tileSize * 0.72}, ${x + tileSize} ${y + tileSize * 0.38}" stroke="#2563eb" stroke-width="3.5" fill="none" stroke-linecap="round" />`
      }

      if (tile.hasRoad) {
        rects += `<line x1="${x}" y1="${y + tileSize * 0.5}" x2="${x + tileSize}" y2="${y + tileSize * 0.5}" stroke="#78350f" stroke-width="2" stroke-dasharray="4 2" />`
      }

      // Render only high-priority slots (Zero noise on empty background tiles!)
      const slots = getEffectiveTileSlots(tile, entities)
      if (slots.length === 1) {
        rects += `<text x="${x + tileSize / 2}" y="${y + tileSize / 2 + 6}" font-size="18" text-anchor="middle">${slots[0].icon}</text>`
      } else if (slots.length >= 2) {
        rects += `<text x="${x + 17}" y="${y + 27}" font-size="16" text-anchor="middle">${slots[0].icon}</text>`
        rects += `<text x="${x + 33}" y="${y + 31}" font-size="13" text-anchor="middle">${slots[1].icon}</text>`
        if (slots.length > 2) {
          rects += `<circle cx="${x + tileSize - 8}" cy="${y + 8}" r="6" fill="#1e293b" opacity="0.85" />`
          rects += `<text x="${x + tileSize - 8}" y="${y + 11}" font-size="7" fill="#ffffff" text-anchor="middle">+${slots.length - 2}</text>`
        }
      }

      if (tile.label) {
        const escapedLabel = tile.label
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
        rects += `<text x="${x + tileSize / 2}" y="${y + tileSize - 4}" font-size="8.5" font-family="Georgia, serif" font-weight="bold" fill="#ffffff" stroke="#1c1917" stroke-width="0.45" text-anchor="middle">${escapedLabel}</text>`
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}">
  <title>${worldName.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</title>
  ${rects}
</svg>`
}
