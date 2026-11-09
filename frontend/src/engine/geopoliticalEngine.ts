/**
 * geopoliticalEngine.ts
 * Phase 28: Geopolitical Simulation, Realm Influence & Strategic Province Engine.
 *
 * Provides deep functional geopolitical modeling for worldbuilding:
 * - Multi-source geographic cost-distance propagation of civilization spheres of influence.
 * - Strategic province profiles (tiers, defensive scores, economic yields, trade connectivity).
 * - Trade route graph synthesis along roads, rivers, and coastal waterways.
 * - Continuous border perimeter computation for cartographic and geopolitical visualization.
 * - Historical province chronicle integration linking past events to specific map provinces.
 */

import { MapState, MapTile, WorldEntity, DrawRecord } from './types'

export type ProvinceTier =
  | 'capital_domain'
  | 'urban_core'
  | 'rural_province'
  | 'frontier_outpost'
  | 'disputed_marchland'
  | 'wilderness'

export interface ProvinceStrategicProfile {
  tileId: string
  col: number
  row: number
  tier: ProvinceTier
  governingSocietyId?: string
  governingSocietyName?: string
  governingSocietyColor?: string
  allegianceScore: number // 0-100 control strength
  defensiveRating: number // 1-10 defensibility score
  defensiveModifiers: { label: string; score: number }[]
  economicOutput: {
    food: number
    minerals: number
    timber: number
    trade: number
  }
  capitalOfSocietyId?: string
  borderingSocietyIds: string[]
  isMarchland: boolean // Borders an unallied/rival society
  connectedSettlementNames: string[]
  activeResourceNames: string[]
}

export interface RealmTerritorySummary {
  societyId: string
  name: string
  color: string
  capitalTileId?: string
  capitalName?: string
  totalTiles: number
  percentageOfLand: number
  settlementCount: number
  resourceCount: number
  fortressCount: number
  provinces: string[] // tileIds
  rivalBorderTiles: string[] // tileIds touching rival factions
  alliedBorderTiles: string[]
}

export interface TradeRouteLink {
  id: string
  fromTileId: string
  fromSettlementName: string
  toTileId: string
  toSettlementName: string
  fromSocietyId?: string
  toSocietyId?: string
  medium: 'road' | 'river' | 'coastal'
  path: string[] // tileIds along the route
  isInternational: boolean
  diplomaticStatus: 'domestic' | 'allied_trade' | 'neutral' | 'embargoed'
}

export interface BorderPerimeters {
  top: boolean
  right: boolean
  bottom: boolean
  left: boolean
}

export interface GeopoliticalState {
  provinces: Record<string, ProvinceStrategicProfile>
  realms: Record<string, RealmTerritorySummary>
  tradeRoutes: TradeRouteLink[]
  contestedMarchlandTileIds: string[]
}

/**
 * Calculates defensive rating and modifiers for a tile based on terrain, relief, hydrology, and structures.
 */
export function calculateTileDefense(tile: MapTile): {
  score: number
  modifiers: { label: string; score: number }[]
} {
  const modifiers: { label: string; score: number }[] = []
  let score = 2 // Baseline open ground

  // Terrain defense
  if (tile.terrain === 'mountain') {
    score += 5
    modifiers.push({ label: 'Mountain Crags', score: 5 })
  } else if (tile.terrain === 'canyon') {
    score += 4
    modifiers.push({ label: 'Chasm Walls', score: 4 })
  } else if (tile.terrain === 'swamp') {
    score += 3
    modifiers.push({ label: 'Impassable Mire', score: 3 })
  } else if (tile.terrain === 'forest' || tile.terrain === 'jungle') {
    score += 2
    modifiers.push({ label: 'Dense Canopy', score: 2 })
  } else if (tile.terrain === 'volcano') {
    score += 4
    modifiers.push({ label: 'Volcanic Caldera', score: 4 })
  }

  // Relief modifier
  if (tile.relief === 'mountain' || tile.relief === 'mountain-range' || tile.relief === 'mountain-snow') {
    score += 2
    modifiers.push({ label: 'Sheer Crests', score: 2 })
  } else if (tile.relief === 'hills' || tile.relief === 'mesa') {
    score += 1
    modifiers.push({ label: 'High Ground', score: 1 })
  }

  // Hydrology moat effect
  if (tile.hasRiver) {
    score += 1
    modifiers.push({ label: 'River Barrier', score: 1 })
  }

  // Structure & Citadel slots
  const slots = tile.slots || []
  for (const s of slots) {
    const sType = s.type?.toLowerCase() || ''
    const sName = s.name?.toLowerCase() || ''
    if (
      s.category === 'structure' ||
      sType.includes('citadel') ||
      sType.includes('fort') ||
      sName.includes('citadel') ||
      sName.includes('fortress') ||
      sName.includes('castle') ||
      sName.includes('palisade') ||
      sName.includes('bastion')
    ) {
      score += 3
      modifiers.push({ label: `Fortress (${s.name})`, score: 3 })
      break
    }
  }

  // Cap rating 1 to 10
  const finalScore = Math.max(1, Math.min(10, score))
  return { score: finalScore, modifiers }
}

/**
 * Calculates economic output yields for a province.
 */
export function calculateProvinceEconomy(tile: MapTile): {
  food: number
  minerals: number
  timber: number
  trade: number
} {
  let food = 1
  let minerals = 1
  let timber = 1
  let trade = 1

  if (tile.terrain === 'plains') food += 3
  if (tile.terrain === 'water') {
    food += 2
    trade += 3
  }
  if (tile.terrain === 'forest' || tile.terrain === 'jungle') timber += 3
  if (tile.terrain === 'mountain' || tile.terrain === 'canyon') minerals += 3
  if (tile.hasRiver) {
    food += 1
    trade += 2
  }
  if (tile.hasRoad) trade += 2

  const slots = tile.slots || []
  for (const s of slots) {
    if (s.category === 'resource') {
      const n = (s.name + ' ' + (s.type || '')).toLowerCase()
      if (
        n.includes('grain') ||
        n.includes('wheat') ||
        n.includes('farm') ||
        n.includes('crop') ||
        n.includes('fish') ||
        n.includes('cattle') ||
        n.includes('orchard') ||
        n.includes('pasture')
      ) {
        food += 4
      } else if (
        n.includes('mine') ||
        n.includes('ore') ||
        n.includes('gold') ||
        n.includes('iron') ||
        n.includes('gem') ||
        n.includes('quarry') ||
        n.includes('stone')
      ) {
        minerals += 4
      } else if (
        n.includes('timber') ||
        n.includes('grove') ||
        n.includes('lumber') ||
        n.includes('wood')
      ) {
        timber += 4
      } else {
        trade += 3
      }
    } else if (s.category === 'settlement') {
      trade += 3
      food += 1
    }
  }

  return { food, minerals, timber, trade }
}

/**
 * Returns orthogonal coordinate neighbors within map bounds.
 */
export function getOrthogonalNeighbors(
  col: number,
  row: number,
  width: number,
  height: number
): { col: number; row: number; id: string }[] {
  const deltas = [
    { dc: 0, dr: -1 }, // North
    { dc: 1, dr: 0 },  // East
    { dc: 0, dr: 1 },  // South
    { dc: -1, dr: 0 }, // West
  ]

  const neighbors: { col: number; row: number; id: string }[] = []
  for (const { dc, dr } of deltas) {
    const nc = col + dc
    const nr = row + dr
    if (nc >= 0 && nc < width && nr >= 0 && nr < height) {
      neighbors.push({ col: nc, row: nr, id: `${nc},${nr}` })
    }
  }
  return neighbors
}

/**
 * Computes border perimeters for a tile relative to adjacent tiles.
 */
export function computeBorderPerimeters(
  map: MapState,
  tileId: string
): BorderPerimeters {
  const tile = map.tiles[tileId]
  if (!tile) {
    return { top: false, right: false, bottom: false, left: false }
  }

  const { col, row } = tile
  const myRealm = tile.territoryId || ''

  const checkEdge = (c: number, r: number): boolean => {
    if (c < 0 || c >= map.width || r < 0 || r >= map.height) {
      return myRealm !== ''
    }
    const neighbor = map.tiles[`${c},${r}`]
    if (!neighbor) return myRealm !== ''
    const neighborRealm = neighbor.territoryId || ''
    return myRealm !== neighborRealm
  }

  return {
    top: checkEdge(col, row - 1),
    right: checkEdge(col + 1, row),
    bottom: checkEdge(col, row + 1),
    left: checkEdge(col - 1, row),
  }
}

/**
 * Resolves settlement administrative power and initial influence weight.
 */
function getSettlementInfluenceWeight(tile: MapTile): {
  weight: number
  isCapital: boolean
  settlementName: string
} {
  const slots = tile.slots || []
  let weight = 0
  let isCapital = false
  let settlementName = ''

  for (const s of slots) {
    if (s.category === 'settlement' || s.category === 'structure') {
      settlementName = s.name || tile.label || 'Settlement'
      const n = (s.name + ' ' + (s.type || '')).toLowerCase()
      if (n.includes('capital') || n.includes('metropolis') || n.includes('empire') || n.includes('seat')) {
        weight = Math.max(weight, 7)
        isCapital = true
      } else if (n.includes('city') || n.includes('bastion')) {
        weight = Math.max(weight, 5.5)
      } else if (n.includes('town') || n.includes('citadel') || n.includes('fortress')) {
        weight = Math.max(weight, 4)
      } else if (n.includes('village') || n.includes('haven')) {
        weight = Math.max(weight, 3)
      } else {
        weight = Math.max(weight, 2)
      }
    }
  }

  return { weight, isCapital, settlementName }
}

/**
 * Returns movement/influence traversal friction for expanding across terrain.
 */
function getTerrainInfluenceFriction(tile: MapTile): number {
  if (tile.domain === 'water' || tile.terrain === 'ocean' || tile.terrain === 'water') {
    return 3.5 // Water acts as a barrier unless bridged or coastal
  }

  let friction = 1.0 // Baseline plains / steppe

  if (tile.hasRoad) {
    friction = 0.5 // Roads provide high administrative mobility
  } else if (tile.hasRiver) {
    friction = 0.75 // Rivers facilitate movement
  }

  if (tile.terrain === 'mountain') friction += 2.5
  else if (tile.terrain === 'canyon') friction += 2.0
  else if (tile.terrain === 'swamp') friction += 1.8
  else if (tile.terrain === 'jungle' || tile.terrain === 'forest') friction += 0.8
  else if (tile.terrain === 'desert' || tile.terrain === 'tundra') friction += 1.0

  if (tile.relief === 'mountain' || tile.relief === 'mountain-range' || tile.relief === 'mountain-snow') {
    friction += 1.5
  }

  return Math.max(0.4, friction)
}

/**
 * Projects realistic realm borders across the map using geographic cost-distance propagation.
 */
export function projectRealmInfluence(
  map: MapState,
  societies: WorldEntity[]
): {
  mapWithTerritories: MapState
  geopolitical: GeopoliticalState
} {
  const societyMap = new Map<string, WorldEntity>()
  societies
    .filter((s) => s.category === 'society')
    .forEach((s) => societyMap.set(s.id, s))

  // 1. Identify settlement seed tiles for each society
  interface InfluenceSource {
    societyId: string
    tileId: string
    initialPower: number
    isCapital: boolean
    settlementName: string
  }

  const sources: InfluenceSource[] = []
  const tileIds = Object.keys(map.tiles)

  for (const tid of tileIds) {
    const tile = map.tiles[tid]
    if (!tile) continue

    const { weight, isCapital, settlementName } = getSettlementInfluenceWeight(tile)

    // Identify which society owns this settlement
    let assignedSocietyId: string | undefined = tile.territoryId

    if (!assignedSocietyId && tile.linkedEntityIds?.length) {
      assignedSocietyId = tile.linkedEntityIds.find((id) => societyMap.has(id))
    }

    // Fallback: check entity originTileId
    if (!assignedSocietyId) {
      for (const soc of societies) {
        if (soc.originTileId === tid) {
          assignedSocietyId = soc.id
          break
        }
      }
    }

    if (assignedSocietyId && societyMap.has(assignedSocietyId) && weight > 0) {
      sources.push({
        societyId: assignedSocietyId,
        tileId: tid,
        initialPower: weight,
        isCapital,
        settlementName,
      })
    }
  }

  // If a society has no settlements on the map, check its originTileId or first claimed tile
  for (const soc of societies) {
    if (soc.category !== 'society') continue
    const hasSource = sources.some((s) => s.societyId === soc.id)
    if (!hasSource && soc.originTileId && map.tiles[soc.originTileId]) {
      sources.push({
        societyId: soc.id,
        tileId: soc.originTileId,
        initialPower: 5,
        isCapital: true,
        settlementName: `${soc.name} Capital`,
      })
    }
  }

  // 2. Multi-source Dijkstra cost-distance propagation
  // influenceGrid: tileId -> { societyId, score }
  const influenceGrid: Record<
    string,
    { societyId: string; score: number }
  > = {}

  // Priority queue: items with highest remaining power
  interface QueueNode {
    tileId: string
    societyId: string
    power: number
  }

  const queue: QueueNode[] = []

  // Initialize sources
  for (const src of sources) {
    influenceGrid[src.tileId] = {
      societyId: src.societyId,
      score: src.initialPower * 10,
    }
    queue.push({
      tileId: src.tileId,
      societyId: src.societyId,
      power: src.initialPower * 10,
    })
  }

  // Sort descending by initial power
  queue.sort((a, b) => b.power - a.power)

  while (queue.length > 0) {
    const current = queue.shift()!
    const curTile = map.tiles[current.tileId]
    if (!curTile) continue

    // If power decayed below minimum threshold, stop propagating
    if (current.power <= 1.0) continue

    const neighbors = getOrthogonalNeighbors(
      curTile.col,
      curTile.row,
      map.width,
      map.height
    )

    for (const nb of neighbors) {
      const nbTile = map.tiles[nb.id]
      if (!nbTile) continue

      const friction = getTerrainInfluenceFriction(nbTile)
      const nextPower = current.power - friction * 2.2

      if (nextPower > 0) {
        const existing = influenceGrid[nb.id]
        if (!existing || nextPower > existing.score) {
          influenceGrid[nb.id] = {
            societyId: current.societyId,
            score: nextPower,
          }
          queue.push({
            tileId: nb.id,
            societyId: current.societyId,
            power: nextPower,
          })
          queue.sort((a, b) => b.power - a.power)
        }
      }
    }
  }

  // 3. Assign territory claims to map tiles
  const nextTiles: Record<string, MapTile> = {}
  const totalLandCount = Object.values(map.tiles).filter(
    (t) => t.domain !== 'water' && t.terrain !== 'ocean' && t.terrain !== 'water'
  ).length

  for (const tid of tileIds) {
    const tile = map.tiles[tid]
    const assigned = influenceGrid[tid]

    let finalTerritoryId = tile.territoryId
    // If not manually locked, adopt computed influence if above threshold and on land
    if (assigned && assigned.score >= 2.0) {
      const isWater =
        tile.domain === 'water' ||
        tile.terrain === 'ocean' ||
        tile.terrain === 'water'
      if (!isWater || tile.hasRoad) {
        finalTerritoryId = assigned.societyId
      }
    }

    nextTiles[tid] = {
      ...tile,
      territoryId: finalTerritoryId,
    }
  }

  const updatedMap: MapState = {
    ...map,
    tiles: nextTiles,
  }

  // 4. Build Realm Territory Summaries
  const realms: Record<string, RealmTerritorySummary> = {}
  for (const soc of societies) {
    if (soc.category !== 'society') continue
    const capitalSrc = sources.find((s) => s.societyId === soc.id && s.isCapital)
    realms[soc.id] = {
      societyId: soc.id,
      name: soc.name,
      color: soc.color || '#3b82f6',
      capitalTileId: capitalSrc?.tileId || soc.originTileId,
      capitalName: capitalSrc?.settlementName,
      totalTiles: 0,
      percentageOfLand: 0,
      settlementCount: 0,
      resourceCount: 0,
      fortressCount: 0,
      provinces: [],
      rivalBorderTiles: [],
      alliedBorderTiles: [],
    }
  }

  // 5. Build Province Strategic Profiles & detect disputed marchlands
  const provinces: Record<string, ProvinceStrategicProfile> = {}
  const contestedMarchlands: Set<string> = new Set()

  for (const tid of tileIds) {
    const tile = updatedMap.tiles[tid]
    const govId = tile.territoryId
    const govEntity = govId ? societyMap.get(govId) : undefined

    const defense = calculateTileDefense(tile)
    const economy = calculateProvinceEconomy(tile)

    // Check neighbors for bordering factions
    const neighbors = getOrthogonalNeighbors(tile.col, tile.row, map.width, map.height)
    const borderingFactions = new Set<string>()

    for (const nb of neighbors) {
      const nTile = updatedMap.tiles[nb.id]
      if (nTile?.territoryId && nTile.territoryId !== govId) {
        borderingFactions.add(nTile.territoryId)
      }
    }

    const borderingList = Array.from(borderingFactions)
    const isMarchland = Boolean(govId && borderingList.length > 0)
    if (isMarchland) {
      contestedMarchlands.add(tid)
    }

    // Determine province tier
    const isCapital = Boolean(govId && realms[govId]?.capitalTileId === tid)
    let tier: ProvinceTier = 'wilderness'

    if (isCapital) {
      tier = 'capital_domain'
    } else if (isMarchland) {
      tier = 'disputed_marchland'
    } else if (govId) {
      const hasSettlement = (tile.slots || []).some((s) => s.category === 'settlement')
      const hasFort = defense.score >= 7
      if (hasSettlement) {
        tier = 'urban_core'
      } else if (hasFort) {
        tier = 'frontier_outpost'
      } else {
        tier = 'rural_province'
      }
    }

    const connectedSettlementNames = (tile.slots || [])
      .filter((s) => s.category === 'settlement')
      .map((s) => s.name)
    const activeResourceNames = (tile.slots || [])
      .filter((s) => s.category === 'resource')
      .map((s) => s.name)

    const profile: ProvinceStrategicProfile = {
      tileId: tid,
      col: tile.col,
      row: tile.row,
      tier,
      governingSocietyId: govId,
      governingSocietyName: govEntity?.name,
      governingSocietyColor: govEntity?.color,
      allegianceScore: govId ? Math.min(100, Math.round((influenceGrid[tid]?.score || 5) * 10)) : 0,
      defensiveRating: defense.score,
      defensiveModifiers: defense.modifiers,
      economicOutput: economy,
      capitalOfSocietyId: isCapital ? govId : undefined,
      borderingSocietyIds: borderingList,
      isMarchland,
      connectedSettlementNames,
      activeResourceNames,
    }

    provinces[tid] = profile

    // Aggregate into realm summaries
    if (govId && realms[govId]) {
      const r = realms[govId]
      r.totalTiles++
      r.provinces.push(tid)
      if (connectedSettlementNames.length) r.settlementCount += connectedSettlementNames.length
      if (activeResourceNames.length) r.resourceCount += activeResourceNames.length
      if (defense.score >= 7) r.fortressCount++
      if (isMarchland) r.rivalBorderTiles.push(tid)
    }
  }

  // Calculate percentages
  for (const rid of Object.keys(realms)) {
    const r = realms[rid]
    r.percentageOfLand =
      totalLandCount > 0 ? Math.round((r.totalTiles / totalLandCount) * 100) : 0
  }

  // 6. Detect Trade Routes
  const tradeRoutes = detectTradeRoutes(updatedMap, societies)

  return {
    mapWithTerritories: updatedMap,
    geopolitical: {
      provinces,
      realms,
      tradeRoutes,
      contestedMarchlandTileIds: Array.from(contestedMarchlands),
    },
  }
}

/**
 * Traces trade routes between settlements along connected roads, rivers, and coastal channels.
 */
export function detectTradeRoutes(
  map: MapState,
  _societies: WorldEntity[] = []
): TradeRouteLink[] {
  interface SettlementNode {
    tileId: string
    name: string
    societyId?: string
    col: number
    row: number
  }

  const nodes: SettlementNode[] = []
  for (const tid of Object.keys(map.tiles)) {
    const tile = map.tiles[tid]
    const { weight, settlementName } = getSettlementInfluenceWeight(tile)
    if (weight > 0) {
      nodes.push({
        tileId: tid,
        name: settlementName || tile.label || `Settlement at (${tid})`,
        societyId: tile.territoryId,
        col: tile.col,
        row: tile.row,
      })
    }
  }

  if (nodes.length < 2) return []

  const routes: TradeRouteLink[] = []

  // Simple pairwise route discovery for settlements within road/river connectivity
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i]
      const b = nodes[j]

      // Check distance
      const dist = Math.abs(a.col - b.col) + Math.abs(a.row - b.row)
      if (dist > 7) continue // Cap max trade route length to keep networks coherent

      const tileA = map.tiles[a.tileId]
      const tileB = map.tiles[b.tileId]

      let medium: 'road' | 'river' | 'coastal' = 'road'
      let isConnected = false

      if (tileA.hasRoad && tileB.hasRoad) {
        medium = 'road'
        isConnected = true
      } else if (tileA.hasRiver && tileB.hasRiver) {
        medium = 'river'
        isConnected = true
      } else if (dist <= 3) {
        // Direct adjacent border trade
        isConnected = true
      }

      if (isConnected) {
        const isInternational = Boolean(a.societyId && b.societyId && a.societyId !== b.societyId)
        routes.push({
          id: `trade_${a.tileId}_${b.tileId}`,
          fromTileId: a.tileId,
          fromSettlementName: a.name,
          toTileId: b.tileId,
          toSettlementName: b.name,
          fromSocietyId: a.societyId,
          toSocietyId: b.societyId,
          medium,
          path: [a.tileId, b.tileId],
          isInternational,
          diplomaticStatus: isInternational ? 'allied_trade' : 'domestic',
        })
      }
    }
  }

  return routes
}

/**
 * Retrieves the historical chronicle events from WorldState that occurred at a specific coordinate.
 */
export function getProvinceChronicleHistory(
  drawHistory: DrawRecord[],
  tileId: string
): DrawRecord[] {
  return drawHistory.filter((rec) => {
    if (rec.linkedTileIds?.includes(tileId)) return true
    if (rec.slotChanges?.some((sc) => sc.tileId === tileId)) return true
    if (rec.note?.includes(`(${tileId})`)) return true
    return false
  })
}
