import {
  GeographicRegion,
  GeographicRegionCategory,
  MapState,
  MapTile,
} from './types'
import { createDefaultTile, getTileDomain, getTileId } from './mapEngine'
import { getNeighbors } from './hexTopologyEngine'

export const REGION_CATEGORY_METADATA: Record<
  GeographicRegionCategory,
  { label: string; icon: string }
> = {
  mountain_range: { label: 'Mountain Range', icon: '🏔️' },
  forest_woodland: { label: 'Forest & Woodland', icon: '🌲' },
  desert_waste: { label: 'Desert & Arid Waste', icon: '🏜️' },
  swamp_mire: { label: 'Swamp & Mire', icon: '🐊' },
  tundra_frost: { label: 'Tundra & Frostland', icon: '❄️' },
  inland_sea: { label: 'Inland Sea / Great Lake', icon: '🌊' },
  ocean_expanse: { label: 'Ocean Expanse', icon: '⚓' },
  plains_steppe: { label: 'Plains & Steppe', icon: '🌾' },
}

const REGION_NAME_POOLS: Record<GeographicRegionCategory, string[]> = {
  mountain_range: [
    'The Spine of Elders',
    'Ironcrown Peaks',
    'Frostfang Cordillera',
    'Ashveil Mountains',
    'Dragonstooth Ridge',
    'Sundered Crags',
    'Cloudpiercer Massif',
    'Obsidian Spires',
  ],
  forest_woodland: [
    'The Whispering Weald',
    'Silverleaf Canopy',
    'Briarheart Wilds',
    'Ebonwood Thicket',
    'Emerald Sylvan',
    'Moonshadow Grove',
    'Stagrun Timberlands',
    'Ancient Wyrdwood',
  ],
  desert_waste: [
    'The Sunscourged Wastes',
    'Glass-Sand Dunes',
    'Ochre Barrens',
    'Sirocco Expanse',
    'Cinder-Salt Flats',
    'Redstone Badlands',
    'Scorched Mirage Sea',
    'Golden Dust Waste',
  ],
  swamp_mire: [
    'The Sunken Fen',
    'Witchwater Mire',
    'Gloomreed Marsh',
    'Blackmoss Bog',
    'Miasma Shallows',
    'Weeping Mangrove',
    'Drowned Hollows',
    'Serpent Fenlands',
  ],
  tundra_frost: [
    'The Rimefrost Reach',
    'Whitewind Waste',
    'Glacier-Born Tundra',
    'Boreal Permafrost',
    'Icewrack Steppe',
    'Wintercrown Expanse',
    'Pale Gale Wastes',
    'Shiverpeak Flats',
  ],
  inland_sea: [
    'The Mirror Sea',
    'Lake of Stars',
    'Silvermist Loch',
    'Emerald Basin',
    'Sapphire Inland Sea',
    'Cradle Waters',
    'Moonwell Mere',
    'Crystal Reach',
  ],
  ocean_expanse: [
    'The Tempest Deep',
    'Sea of Ghosts',
    'Leviathan Abyss',
    'Shattered Tides',
    'Starlit Ocean',
    'SirenReach Waters',
    'Outer Maelstrom',
    'Azure Horizon',
  ],
  plains_steppe: [
    'The Golden Steppe',
    'Windrider Downs',
    'Sungrass Prairie',
    'Emerald Heartland',
    'Verdant Vale',
    'Ambergrain Plains',
    'Highland Meadows',
    'Bannerlord Reach',
  ],
}

/**
 * Classifies an individual tile into its macro-geographic region category.
 * Water tiles are initially classified as 'ocean_expanse' and refined to 'inland_sea'
 * during contiguous cluster analysis if enclosed by land.
 */
export function classifyTileBaseRegionCategory(
  tile: MapTile
): GeographicRegionCategory {
  const domain = getTileDomain(tile)
  if (domain === 'water' || tile.terrain === 'ocean' || tile.terrain === 'water') {
    return 'ocean_expanse'
  }

  const relief = tile.relief || 'none'
  if (
    relief === 'mountain' ||
    relief === 'mountain-snow' ||
    relief === 'mountain-range' ||
    relief === 'volcano' ||
    relief === 'canyon' ||
    relief === 'mesa' ||
    relief === 'crag' ||
    tile.terrain === 'mountain' ||
    tile.terrain === 'volcano' ||
    tile.terrain === 'canyon'
  ) {
    return 'mountain_range'
  }

  const flora = tile.flora || 'none'
  if (
    flora === 'forest' ||
    flora === 'jungle' ||
    tile.terrain === 'forest' ||
    tile.terrain === 'jungle'
  ) {
    return 'forest_woodland'
  }

  if (tile.terrain === 'swamp' || flora === 'marsh') {
    return 'swamp_mire'
  }

  if (tile.terrain === 'desert') {
    return 'desert_waste'
  }

  if (tile.terrain === 'tundra') {
    return 'tundra_frost'
  }

  return 'plains_steppe'
}

/**
 * Generates an evocative fantasy regional name for the given geographic category.
 */
export function generateEvocativeRegionName(
  category: GeographicRegionCategory,
  seed = 0
): string {
  const pool = REGION_NAME_POOLS[category] || REGION_NAME_POOLS.plains_steppe
  const index = Math.abs(Math.floor(seed)) % pool.length
  return pool[index]
}

/**
 * Detects contiguous geographic regions across the map grid using BFS flood-fill.
 * Automatically distinguishes enclosed Inland Seas / Great Lakes from open Ocean Expanses.
 */
export function detectGeographicRegions(
  map: MapState,
  minClusterSize = 1
): {
  regions: GeographicRegion[]
  tileRegionMap: Record<string, GeographicRegion>
} {
  const visited = new Set<string>()
  const regions: GeographicRegion[] = []
  const tileRegionMap: Record<string, GeographicRegion> = {}
  const topology = map.gridTopology || 'square'

  for (let row = 0; row < map.height; row++) {
    for (let col = 0; col < map.width; col++) {
      const startId = getTileId(col, row)
      if (visited.has(startId)) continue

      const startTile = map.tiles[startId] || createDefaultTile(col, row)
      const baseCat = classifyTileBaseRegionCategory(startTile)
      const explicitName = startTile.regionName?.trim() || ''

      // BFS flood-fill
      const queue: Array<{ col: number; row: number }> = [{ col, row }]
      const clusterTileIds: string[] = []
      const clusterCoords: Array<{ col: number; row: number }> = []
      let touchesBorderCount = 0
      let foundExplicitName = explicitName
      let foundExplicitId = startTile.regionId

      visited.add(startId)

      while (queue.length > 0) {
        const curr = queue.shift()
        if (!curr) break
        const currId = getTileId(curr.col, curr.row)
        const currTile = map.tiles[currId] || createDefaultTile(curr.col, curr.row)

        clusterTileIds.push(currId)
        clusterCoords.push(curr)

        if (
          curr.col === 0 ||
          curr.row === 0 ||
          curr.col === map.width - 1 ||
          curr.row === map.height - 1
        ) {
          touchesBorderCount++
        }

        if (!foundExplicitName && currTile.regionName?.trim()) {
          foundExplicitName = currTile.regionName.trim()
        }
        if (!foundExplicitId && currTile.regionId) {
          foundExplicitId = currTile.regionId
        }

        const neighbors = getNeighbors(curr, topology, {
          width: map.width,
          height: map.height,
        })

        for (const nb of neighbors) {
          const nbId = getTileId(nb.col, nb.row)
          if (visited.has(nbId)) continue

          const nbTile = map.tiles[nbId] || createDefaultTile(nb.col, nb.row)
          const nbCat = classifyTileBaseRegionCategory(nbTile)
          const nbExplicitName = nbTile.regionName?.trim() || ''

          // Group together if they share the same base category and aren't split by conflicting explicit region names
          const sameCategory = nbCat === baseCat
          const compatibleNames =
            !foundExplicitName ||
            !nbExplicitName ||
            foundExplicitName === nbExplicitName

          if (sameCategory && compatibleNames) {
            visited.add(nbId)
            queue.push(nb)
          }
        }
      }

      if (clusterTileIds.length < minClusterSize) {
        continue
      }

      // Refine water category: enclosed water bodies (or mostly enclosed basins) are Inland Seas / Lakes
      let finalCategory: GeographicRegionCategory = baseCat
      if (baseCat === 'ocean_expanse') {
        const totalMapTiles = map.width * map.height
        const isEnclosed = touchesBorderCount === 0
        const isSmallEnclosedBay =
          touchesBorderCount <= 2 && clusterTileIds.length <= Math.max(6, totalMapTiles * 0.12)
        if (isEnclosed || isSmallEnclosedBay) {
          finalCategory = 'inland_sea'
        }
      }

      // Compute geometric centroid and snap to closest member tile
      const avgCol =
        clusterCoords.reduce((acc, c) => acc + c.col, 0) / clusterCoords.length
      const avgRow =
        clusterCoords.reduce((acc, c) => acc + c.row, 0) / clusterCoords.length

      let bestCentroid = clusterCoords[0]
      let bestDistSq = Infinity
      for (const c of clusterCoords) {
        const dSq = (c.col - avgCol) ** 2 + (c.row - avgRow) ** 2
        if (dSq < bestDistSq) {
          bestDistSq = dSq
          bestCentroid = c
        }
      }

      const meta = REGION_CATEGORY_METADATA[finalCategory]
      const regionId =
        foundExplicitId || `region_${finalCategory}_${bestCentroid.col}_${bestCentroid.row}`
      const isNamed = Boolean(foundExplicitName)
      const displayName = foundExplicitName || `Unnamed ${meta.label}`

      const region: GeographicRegion = {
        id: regionId,
        name: displayName,
        category: finalCategory,
        categoryLabel: meta.label,
        icon: meta.icon,
        tileIds: clusterTileIds,
        centroid: bestCentroid,
        isNamed,
      }

      regions.push(region)
      for (const tid of clusterTileIds) {
        tileRegionMap[tid] = region
      }
    }
  }

  return { regions, tileRegionMap }
}

/**
 * Assigns (or clears) a custom regional name across all tiles belonging to the contiguous region of targetTileId.
 */
export function assignRegionNameToCluster(
  map: MapState,
  targetTileId: string,
  newRegionName: string
): MapState {
  const { tileRegionMap } = detectGeographicRegions(map, 1)
  const region = tileRegionMap[targetTileId]
  if (!region) return map

  const trimmed = newRegionName.trim()
  const nextTiles = { ...map.tiles }

  for (const tid of region.tileIds) {
    const [colStr, rowStr] = tid.split(',')
    const col = Number(colStr)
    const row = Number(rowStr)
    const existing = nextTiles[tid] || createDefaultTile(col, row)
    nextTiles[tid] = {
      ...existing,
      regionId: trimmed ? region.id : undefined,
      regionName: trimmed || undefined,
    }
  }

  return {
    ...map,
    tiles: nextTiles,
  }
}

/**
 * Automatically names all major unnamed contiguous geographic regions (e.g. Mountain Ranges,
 * Forests, Deserts, Swamps, Inland Seas) of size >= minClusterSize.
 */
export function autoNameMajorRegions(
  map: MapState,
  minClusterSize = 3
): MapState {
  const { regions } = detectGeographicRegions(map, minClusterSize)
  const nextTiles = { ...map.tiles }
  const usedNames = new Set<string>()

  regions.forEach((reg, idx) => {
    if (reg.isNamed) {
      usedNames.add(reg.name)
      return
    }
    // Skip open perimeter ocean expanse unless user explicitly names it
    if (reg.category === 'ocean_expanse') {
      return
    }

    let seed =
      reg.centroid.col * 31 + reg.centroid.row * 17 + idx * 13 + reg.tileIds.length
    let candidate = generateEvocativeRegionName(reg.category, seed)
    let attempts = 0
    while (usedNames.has(candidate) && attempts < 10) {
      seed += 7
      candidate = generateEvocativeRegionName(reg.category, seed)
      attempts++
    }
    usedNames.add(candidate)

    for (const tid of reg.tileIds) {
      const [colStr, rowStr] = tid.split(',')
      const col = Number(colStr)
      const row = Number(rowStr)
      const existing = nextTiles[tid] || createDefaultTile(col, row)
      nextTiles[tid] = {
        ...existing,
        regionId: reg.id,
        regionName: candidate,
      }
    }
  })

  return {
    ...map,
    tiles: nextTiles,
  }
}

/**
 * 1-Click Bulk Region Operation: Assigns or clears faction territory ownership across
 * all tiles in the contiguous geographic region containing targetTileId.
 */
export function claimRegionForFaction(
  map: MapState,
  targetTileId: string,
  territoryId: string | undefined
): MapState {
  const { tileRegionMap } = detectGeographicRegions(map, 1)
  const region = tileRegionMap[targetTileId]
  if (!region) return map

  const nextTiles = { ...map.tiles }
  const cleanTerritoryId = territoryId?.trim() || undefined

  for (const tid of region.tileIds) {
    const [colStr, rowStr] = tid.split(',')
    const col = Number(colStr)
    const row = Number(rowStr)
    const existing = nextTiles[tid] || createDefaultTile(col, row)
    nextTiles[tid] = {
      ...existing,
      territoryId: cleanTerritoryId,
    }
  }

  return {
    ...map,
    tiles: nextTiles,
  }
}

/**
 * 1-Click Bulk Region Operation: Shrouds or reveals Fog of War across all tiles
 * in the contiguous geographic region containing targetTileId.
 */
export function toggleRegionFogOfWar(
  map: MapState,
  targetTileId: string
): MapState {
  const { tileRegionMap } = detectGeographicRegions(map, 1)
  const region = tileRegionMap[targetTileId]
  if (!region) return map

  const [targetCol, targetRow] = targetTileId.split(',').map(Number)
  const targetTile =
    map.tiles[targetTileId] || createDefaultTile(targetCol || 0, targetRow || 0)
  const nextUnexplored = !targetTile.isUnexplored
  const nextTiles = { ...map.tiles }

  for (const tid of region.tileIds) {
    const [colStr, rowStr] = tid.split(',')
    const col = Number(colStr)
    const row = Number(rowStr)
    const existing = nextTiles[tid] || createDefaultTile(col, row)
    nextTiles[tid] = {
      ...existing,
      isUnexplored: nextUnexplored,
    }
  }

  return {
    ...map,
    tiles: nextTiles,
  }
}

/**
 * 1-Click Bulk Region Operation: Applies flora canopy or elevation relief across
 * all land tiles in the contiguous geographic region containing targetTileId.
 */
export function applyCanopyOrReliefToRegion(
  map: MapState,
  targetTileId: string,
  updates: { flora?: MapTile['flora']; relief?: MapTile['relief'] }
): MapState {
  const { tileRegionMap } = detectGeographicRegions(map, 1)
  const region = tileRegionMap[targetTileId]
  if (!region) return map

  const nextTiles = { ...map.tiles }

  for (const tid of region.tileIds) {
    const [colStr, rowStr] = tid.split(',')
    const col = Number(colStr)
    const row = Number(rowStr)
    const existing = nextTiles[tid] || createDefaultTile(col, row)
    if (getTileDomain(existing) === 'water') continue
    nextTiles[tid] = {
      ...existing,
      ...(updates.flora !== undefined ? { flora: updates.flora } : {}),
      ...(updates.relief !== undefined ? { relief: updates.relief } : {}),
    }
  }

  return {
    ...map,
    tiles: nextTiles,
  }
}
