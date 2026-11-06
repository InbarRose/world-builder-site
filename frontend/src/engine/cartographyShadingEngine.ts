import { MapState, MapTile } from './types'

function getTileDomain(tile: Pick<MapTile, 'domain' | 'terrain'>): 'land' | 'water' {
  if (tile.domain === 'land' || tile.domain === 'water') {
    return tile.domain
  }
  return tile.terrain === 'ocean' || tile.terrain === 'water' ? 'water' : 'land'
}

function getTileId(col: number, row: number): string {
  return `${col},${row}`
}

export interface TileNeighborContext {
  col: number
  row: number
  isLand: boolean
  isWater: boolean
  elevationRank: number
  north?: MapTile
  south?: MapTile
  east?: MapTile
  west?: MapTile
  northWest?: MapTile
  northEast?: MapTile
  southWest?: MapTile
  southEast?: MapTile
  waterBorders: {
    north: boolean
    south: boolean
    east: boolean
    west: boolean
  }
  landBorders: {
    north: boolean
    south: boolean
    east: boolean
    west: boolean
  }
  hasNorthWestSunlightShadow: boolean
  elevationDropShadowEast: boolean
  elevationDropShadowSouth: boolean
  isForestOrJungle: boolean
  adjacentForestBorders: {
    north: boolean
    south: boolean
    east: boolean
    west: boolean
  }
}

/**
 * Computes an elevation tier (0 to 6) for directional lighting and hillshading.
 * 0: Deep ocean
 * 1: Coastal water / shallows
 * 2: Flat plains, desert, swamp, tundra
 * 3: Forest, jungle, steppe / highlands
 * 4: Canyons / badlands
 * 5: Rolling hills
 * 6: High alpine peaks, active volcanoes
 */
export function getTileElevationRank(tile?: MapTile): number {
  if (!tile) return 0
  const relief = tile.relief
  if (relief === 'mountain' || tile.terrain === 'mountain') return 6
  if (relief === 'volcano' || tile.terrain === 'volcano') return 6
  if (relief === 'hills') return 5
  if (relief === 'canyon' || tile.terrain === 'canyon') return 4
  if (tile.terrain === 'forest' || tile.terrain === 'jungle' || tile.terrain === 'earth') return 3
  if (tile.terrain === 'ocean') return 0
  if (tile.domain === 'water' || tile.terrain === 'water') return 1
  return 2
}

/**
 * Inspects all 8 cardinal and diagonal neighbors of a tile to establish spatial context
 * for organic biome blending, beach rims, hillshading, and canopy fringe.
 */
export function computeTileNeighborContext(
  map: MapState,
  col: number,
  row: number
): TileNeighborContext {
  const currentTile = map.tiles[getTileId(col, row)]
  const isLand = currentTile ? getTileDomain(currentTile) === 'land' : false
  const isWater = !isLand
  const currentRank = getTileElevationRank(currentTile)

  const north = map.tiles[getTileId(col, row - 1)]
  const south = map.tiles[getTileId(col, row + 1)]
  const east = map.tiles[getTileId(col + 1, row)]
  const west = map.tiles[getTileId(col - 1, row)]
  const northWest = map.tiles[getTileId(col - 1, row - 1)]
  const northEast = map.tiles[getTileId(col + 1, row - 1)]
  const southWest = map.tiles[getTileId(col - 1, row + 1)]
  const southEast = map.tiles[getTileId(col + 1, row + 1)]

  const isWaterTile = (t?: MapTile) => (t ? getTileDomain(t) === 'water' : true)
  const isLandTile = (t?: MapTile) => (t ? getTileDomain(t) === 'land' : false)
  const isForest = (t?: MapTile) =>
    Boolean(
      t &&
        (t.terrain === 'forest' ||
          t.terrain === 'jungle' ||
          t.flora === 'forest' ||
          t.flora === 'jungle')
    )

  const waterBorders = {
    north: isWaterTile(north),
    south: isWaterTile(south),
    east: isWaterTile(east),
    west: isWaterTile(west),
  }

  const landBorders = {
    north: isLandTile(north),
    south: isLandTile(south),
    east: isLandTile(east),
    west: isLandTile(west),
  }

  // Sunlight comes from North-West (315° standard cartographic illumination).
  // A tile receives shadow if its NW, N, or W neighbor has higher elevation.
  const rankNW = getTileElevationRank(northWest)
  const rankN = getTileElevationRank(north)
  const rankW = getTileElevationRank(west)
  const hasNorthWestSunlightShadow =
    rankNW > currentRank || rankN > currentRank || rankW > currentRank

  // Does this tile cast an elevation drop shadow to the East or South?
  const elevationDropShadowEast = currentRank >= 5 && getTileElevationRank(east) < currentRank
  const elevationDropShadowSouth = currentRank >= 5 && getTileElevationRank(south) < currentRank

  const isCurrentForest = isForest(currentTile)
  const adjacentForestBorders = {
    north: isForest(north),
    south: isForest(south),
    east: isForest(east),
    west: isForest(west),
  }

  return {
    col,
    row,
    isLand,
    isWater,
    elevationRank: currentRank,
    north,
    south,
    east,
    west,
    northWest,
    northEast,
    southWest,
    southEast,
    waterBorders,
    landBorders,
    hasNorthWestSunlightShadow,
    elevationDropShadowEast,
    elevationDropShadowSouth,
    isForestOrJungle: isCurrentForest,
    adjacentForestBorders,
  }
}

/**
 * Returns raw SVG markup string for organic shading layers (useful for standalone export).
 */
export function generateOrganicShadingSvgString(
  context: TileNeighborContext,
  x: number,
  y: number,
  tileSize = 48
): string {
  let svg = ''

  // 1. Coastlines & Beach Shallows
  if (context.isLand) {
    // Warm shoreline sand rim on edges facing water
    if (context.waterBorders.north) {
      svg += `<rect x="${x}" y="${y}" width="${tileSize}" height="3" fill="#fef08a" opacity="0.45" />`
    }
    if (context.waterBorders.south) {
      svg += `<rect x="${x}" y="${y + tileSize - 3}" width="${tileSize}" height="3" fill="#fef08a" opacity="0.45" />`
    }
    if (context.waterBorders.west) {
      svg += `<rect x="${x}" y="${y}" width="3" height="${tileSize}" fill="#fef08a" opacity="0.45" />`
    }
    if (context.waterBorders.east) {
      svg += `<rect x="${x + tileSize - 3}" y="${y}" width="3" height="${tileSize}" fill="#fef08a" opacity="0.45" />`
    }
  } else if (context.isWater) {
    // Shallows turquoise shelf on water edges facing land
    if (context.landBorders.north) {
      svg += `<rect x="${x}" y="${y}" width="${tileSize}" height="4.5" fill="#38bdf8" opacity="0.38" />`
    }
    if (context.landBorders.south) {
      svg += `<rect x="${x}" y="${y + tileSize - 4.5}" width="${tileSize}" height="4.5" fill="#38bdf8" opacity="0.38" />`
    }
    if (context.landBorders.west) {
      svg += `<rect x="${x}" y="${y}" width="4.5" height="${tileSize}" fill="#38bdf8" opacity="0.38" />`
    }
    if (context.landBorders.east) {
      svg += `<rect x="${x + tileSize - 4.5}" y="${y}" width="4.5" height="${tileSize}" fill="#38bdf8" opacity="0.38" />`
    }
  }

  // 2. Multi-Octave Hillshading (Sunlit NW edge, shaded SE edge)
  if (context.elevationRank >= 5) {
    // High relief: Crest highlight on top-left
    svg += `<polygon points="${x},${y} ${x + tileSize},${y} ${x},${y + tileSize}" fill="#ffffff" opacity="0.16" />`
    // Shaded slope on bottom-right
    svg += `<polygon points="${x + tileSize},${y} ${x + tileSize},${y + tileSize} ${x},${y + tileSize}" fill="#0f172a" opacity="0.22" />`
  } else if (context.hasNorthWestSunlightShadow) {
    // Lowland receiving shadow from elevated NW neighbor
    svg += `<polygon points="${x},${y} ${x + tileSize * 0.45},${y} ${x},${y + tileSize * 0.45}" fill="#0f172a" opacity="0.14" />`
  }

  return svg
}
