import { DrawRecord, RelationshipType, StageId, WorldEntity, WorldState } from './types'
import { STAGES } from './deckEngine'

export type EventSignificance = 'creation' | 'expansion' | 'conflict' | 'cataclysm' | 'diplomacy'

export interface SagaEvent {
  moveId: number
  epochYear: string
  title: string
  note: string
  significance: EventSignificance
  playerName?: string
  entitiesInvolved: string[]
  tilesInvolved: string[]
}

export interface SagaChapter {
  stageId: StageId
  stageName: string
  title: string
  epochRange: string
  summary: string
  events: SagaEvent[]
}

export interface RealmSaga {
  realmName: string
  worldSeed: string
  totalTurns: number
  generatedAt: string
  overallSummary: string
  chapters: SagaChapter[]
  dominantFaction?: string
  historicFeats: Record<string, EntityFeat[]>
}

export interface EntityFeat {
  id: string
  entityId: string
  title: string
  description: string
  moveId: number
  icon: string
  badgeColor: string
}

export interface DiplomaticRelationItem {
  targetId: string
  targetName: string
  type: RelationshipType
  label: string
  icon: string
  harmonyScore: number // -100 to +100
}

/**
 * Classifies an event's narrative significance based on card power, action title, and notes.
 */
export function classifyEventSignificance(rec: DrawRecord): EventSignificance {
  const text = `${rec.power || ''} ${rec.actionTitle || ''} ${rec.note || ''}`.toLowerCase()

  if (text.includes('disaster') || text.includes('cataclysm') || text.includes('plague') || text.includes('rift') || text.includes('volcano')) {
    return 'cataclysm'
  }
  if (text.includes('war') || text.includes('battle') || text.includes('conflict') || text.includes('rival') || text.includes('conquest')) {
    return 'conflict'
  }
  if (text.includes('treaty') || text.includes('alliance') || text.includes('pact') || text.includes('marriage') || text.includes('trade')) {
    return 'diplomacy'
  }
  if (text.includes('settlement') || text.includes('city') || text.includes('expand') || text.includes('road') || text.includes('founded')) {
    return 'expansion'
  }
  return 'creation'
}

/**
 * Generates an evocative fantasy chapter title based on stage and history contents.
 */
function getEvocativeChapterTitle(stageId: StageId, events: SagaEvent[]): string {
  const cataclysms = events.filter((e) => e.significance === 'cataclysm').length
  const conflicts = events.filter((e) => e.significance === 'conflict').length
  const diplomacy = events.filter((e) => e.significance === 'diplomacy').length

  switch (stageId) {
    case 'genesis':
      if (cataclysms > 0) return 'The Fractured Primordium'
      return 'The Dawning of Continents and Seas'
    case 'primal':
      if (conflicts > 0) return 'The Struggle for Primordial Domains'
      return 'The Awakening of Ancient Kindreds'
    case 'civilization':
      if (diplomacy > 1) return 'The Golden Age of Guilds & Treaties'
      if (conflicts > 0) return 'The Rise of Spires and Standards'
      return 'The Era of Great Settlements'
    case 'intrigue':
      if (conflicts > 1) return 'The Broken Crowns & Shadow Wars'
      if (diplomacy > 0) return 'The Twilight Compacts'
      return 'The Era of Whispers and Shifting Thrones'
    default:
      return 'A Chronicle of the Realm'
  }
}

/**
 * Synthesizes prose narrative for a chapter from its events and participants.
 */
function generateChapterProseSummary(
  stageName: string,
  events: SagaEvent[],
  entities: WorldEntity[]
): string {
  if (events.length === 0) {
    return `In this era, the lands remained quiet and unwritten, awaiting the hands of creators.`
  }

  const entityNames = Array.from(new Set(events.flatMap((e) => e.entitiesInvolved)))
    .map((id) => entities.find((ent) => ent.id === id)?.name)
    .filter(Boolean)

  const cataclysms = events.filter((e) => e.significance === 'cataclysm')
  const expansions = events.filter((e) => e.significance === 'expansion')
  const wars = events.filter((e) => e.significance === 'conflict')
  const alliances = events.filter((e) => e.significance === 'diplomacy')

  const parts: string[] = []
  parts.push(`During the ${stageName}, ${events.length} pivotal historical events shaped the land.`)

  if (entityNames.length > 0) {
    parts.push(`The destinies of ${entityNames.slice(0, 3).join(', ')} became inextricably woven into the landscape.`)
  }

  if (expansions.length > 0) {
    parts.push(`New outposts and centers of power flourished across fertile regions.`)
  }
  if (cataclysms.length > 0) {
    parts.push(`Sudden upheavals and cataclysmic disturbances tested the fortitude of the inhabitants.`)
  }
  if (wars.length > 0) {
    parts.push(`Borders clashed and rivalries flared as factions contested regional dominion.`)
  }
  if (alliances.length > 0) {
    parts.push(`Oaths of fellowship and trading pacts anchored diplomacy against the encroaching dark.`)
  }

  return parts.join(' ')
}

/**
 * Computes historical achievements and feats for all world entities based on game events.
 */
export function computeEntityAchievements(world: WorldState): Record<string, EntityFeat[]> {
  const feats: Record<string, EntityFeat[]> = {}

  for (const ent of world.entities) {
    feats[ent.id] = []
  }

  // Track mentions and accomplishments
  const mentionsPerEntity: Record<string, number> = {}
  const tilesPerEntity: Record<string, Set<string>> = {}

  for (const rec of world.drawHistory) {
    for (const entId of rec.linkedEntityIds || []) {
      mentionsPerEntity[entId] = (mentionsPerEntity[entId] || 0) + 1
      if (!tilesPerEntity[entId]) tilesPerEntity[entId] = new Set()
      for (const tId of rec.linkedTileIds || []) {
        tilesPerEntity[entId].add(tId)
      }

      const sig = classifyEventSignificance(rec)
      if (sig === 'diplomacy') {
        const ent = world.entities.find((e) => e.id === entId)
        if (ent && !feats[entId].some((f) => f.title === 'Treaty Forger')) {
          feats[entId].push({
            id: `feat_diplo_${rec.moveId}`,
            entityId: entId,
            title: 'Treaty Forger',
            description: `Forged diplomatic accord during Turn #${rec.moveId}`,
            moveId: rec.moveId,
            icon: '📜',
            badgeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
          })
        }
      } else if (sig === 'cataclysm') {
        const ent = world.entities.find((e) => e.id === entId)
        if (ent && !feats[entId].some((f) => f.title === 'Cataclysm Survivor')) {
          feats[entId].push({
            id: `feat_cata_${rec.moveId}`,
            entityId: entId,
            title: 'Cataclysm Survivor',
            description: `Endured the great upheaval of Turn #${rec.moveId}`,
            moveId: rec.moveId,
            icon: '🔥',
            badgeColor: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300',
          })
        }
      }
    }
  }

  // Territory dominance feats
  for (const ent of world.entities) {
    const controlledTiles = Object.values(world.map.tiles).filter((t) => t.territoryId === ent.id).length
    if (controlledTiles >= 3) {
      feats[ent.id].push({
        id: `feat_sovereign_${ent.id}`,
        entityId: ent.id,
        title: 'Sovereign Realm',
        description: `Commanded ${controlledTiles} contiguous territorial provinces`,
        moveId: 1,
        icon: '👑',
        badgeColor: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300',
      })
    }

    if ((mentionsPerEntity[ent.id] || 0) >= 4) {
      feats[ent.id].push({
        id: `feat_historic_${ent.id}`,
        entityId: ent.id,
        title: 'Historic Pillar',
        description: `Shaped the chronicle across 4+ recorded world turns`,
        moveId: 1,
        icon: '⭐',
        badgeColor: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300',
      })
    }
  }

  return feats
}

/**
 * Computes the complete diplomatic network for an entity, including bidirectional relationships.
 */
export function getEntityDiplomaticRelations(
  entity: WorldEntity,
  allEntities: WorldEntity[]
): DiplomaticRelationItem[] {
  const result: DiplomaticRelationItem[] = []
  const links = entity.diplomaticLinks || []

  for (const link of links) {
    const target = allEntities.find((e) => e.id === link.targetEntityId)
    const targetName = target?.name || link.targetEntityName || 'Unknown Faction'

    let harmonyScore = 50
    if (link.type === 'war' || link.type === 'rivalry') harmonyScore = -80
    else if (link.type === 'alliance' || link.type === 'royal_marriage') harmonyScore = 90
    else if (link.type === 'trade_pact' || link.type === 'shared_faith') harmonyScore = 60

    result.push({
      targetId: link.targetEntityId,
      targetName,
      type: link.type,
      label: link.label || link.type.replace('_', ' '),
      icon: link.icon || '🤝',
      harmonyScore,
    })
  }

  return result
}

/**
 * Synthesizes a structured Realm Saga from the current WorldState.
 */
export function synthesizeRealmSaga(world: WorldState): RealmSaga {
  const chapters: SagaChapter[] = []

  for (const stage of STAGES) {
    const stageRecords = world.drawHistory.filter((rec) => rec.stage === stage.id)

    const events: SagaEvent[] = stageRecords.map((rec) => ({
      moveId: rec.moveId,
      epochYear: rec.epochYear || `Year ${rec.moveId * 10}`,
      title: rec.actionTitle || rec.power || `Turn #${rec.moveId}`,
      note: rec.note || '',
      significance: classifyEventSignificance(rec),
      playerName: rec.playerName,
      entitiesInvolved: rec.linkedEntityIds || [],
      tilesInvolved: rec.linkedTileIds || [],
    }))

    const startEpoch = events[0]?.epochYear || 'First Era'
    const endEpoch = events[events.length - 1]?.epochYear || 'Late Era'
    const epochRange = events.length > 0 ? `${startEpoch} – ${endEpoch}` : 'Uncharted'

    chapters.push({
      stageId: stage.id,
      stageName: stage.name,
      title: getEvocativeChapterTitle(stage.id, events),
      epochRange,
      summary: generateChapterProseSummary(stage.name, events, world.entities),
      events,
    })
  }

  // Find dominant faction by territory count
  const territoryCounts: Record<string, number> = {}
  for (const tile of Object.values(world.map.tiles)) {
    if (tile.territoryId) {
      territoryCounts[tile.territoryId] = (territoryCounts[tile.territoryId] || 0) + 1
    }
  }

  let dominantFaction: string | undefined
  let maxProvinces = 0
  for (const [entId, count] of Object.entries(territoryCounts)) {
    if (count > maxProvinces) {
      maxProvinces = count
      dominantFaction = world.entities.find((e) => e.id === entId)?.name
    }
  }

  const totalTurns = world.drawHistory.length
  const overallSummary =
    totalTurns === 0
      ? `The realm of ${world.name} rests in quiet potential, awaiting the first stroke of destiny.`
      : `From the initial shaping in the Genesis epoch to the intricate rivalries of late ages, ${world.name} has undergone ${totalTurns} recorded events across ${world.entities.length} recognized species, civilizations, and myths.`

  return {
    realmName: world.name,
    worldSeed: world.generationSettings?.seed || 'custom',
    totalTurns,
    generatedAt: new Date().toISOString(),
    overallSummary,
    chapters,
    dominantFaction,
    historicFeats: computeEntityAchievements(world),
  }
}

/**
 * Lineage and Dynasty relationships for an entity.
 */
export interface EntityLineage {
  parents: WorldEntity[]
  descendants: WorldEntity[]
  peers: WorldEntity[]
}

export function buildEntityLineageTree(
  entityId: string,
  allEntities: WorldEntity[]
): EntityLineage {
  const current = allEntities.find((e) => e.id === entityId)
  if (!current) {
    return { parents: [], descendants: [], peers: [] }
  }

  const parents = current.parentEntityId
    ? allEntities.filter((e) => e.id === current.parentEntityId)
    : []

  const descendants = allEntities.filter((e) => e.parentEntityId === entityId)

  const peers = current.parentEntityId
    ? allEntities.filter((e) => e.parentEntityId === current.parentEntityId && e.id !== entityId)
    : []

  return { parents, descendants, peers }
}

/**
 * Real-time World Stability and Geopolitical Tension index.
 */
export interface WorldStabilityMetrics {
  score: number // 0 to 100
  status: 'Golden Age' | 'Pax & Stability' | 'Tense Borderlands' | 'Realm at War' | 'Age of Chaos'
  icon: string
  badgeColor: string
  breakdown: {
    alliancesCount: number
    conflictsCount: number
    cataclysmsCount: number
    settlementCount: number
  }
  summary: string
}

export function computeWorldStabilityIndex(world: WorldState): WorldStabilityMetrics {
  let alliancesCount = 0
  let conflictsCount = 0

  for (const ent of world.entities) {
    for (const rel of ent.diplomaticLinks || []) {
      if (
        rel.type === 'alliance' ||
        rel.type === 'trade_pact' ||
        rel.type === 'royal_marriage' ||
        rel.type === 'shared_faith'
      ) {
        alliancesCount++
      } else if (rel.type === 'war' || rel.type === 'rivalry') {
        conflictsCount++
      }
    }
  }

  // Count cataclysm turns in draw history
  let cataclysmsCount = 0
  for (const rec of world.drawHistory) {
    if (
      rec.card?.suit === '♠' ||
      (rec.stage === 'genesis' && rec.note.toLowerCase().includes('cataclysm'))
    ) {
      cataclysmsCount++
    }
  }

  // Count settlements on map
  let settlementCount = 0
  for (const tile of Object.values(world.map.tiles)) {
    if (tile.slots?.some((s) => s.category === 'settlement') || tile.territoryId) {
      settlementCount++
    }
  }

  // Calculate score: base 60 + alliances * 10 - conflicts * 15 - cataclysms * 6 + settlements * 3
  const rawScore =
    60 + alliancesCount * 10 - conflictsCount * 15 - cataclysmsCount * 6 + settlementCount * 3
  const score = Math.max(5, Math.min(100, rawScore))

  let status: WorldStabilityMetrics['status'] = 'Pax & Stability'
  let icon = '🛡️'
  let badgeColor = 'text-teal-700 bg-teal-500/15 border-teal-500/30 dark:text-teal-300'
  let summary = 'Order and civil progress prevail across the established realms.'

  if (score >= 82) {
    status = 'Golden Age'
    icon = '🕊️'
    badgeColor = 'text-emerald-700 bg-emerald-500/15 border-emerald-500/30 dark:text-emerald-300'
    summary = 'Flourishing treaties, peace pacts, and thriving settlements unite the lands.'
  } else if (score >= 60) {
    status = 'Pax & Stability'
    icon = '🛡️'
    badgeColor = 'text-teal-700 bg-teal-500/15 border-teal-500/30 dark:text-teal-300'
    summary = 'Order and civil progress prevail across the established realms.'
  } else if (score >= 40) {
    status = 'Tense Borderlands'
    icon = '⚡'
    badgeColor = 'text-amber-700 bg-amber-500/15 border-amber-500/30 dark:text-amber-300'
    summary = 'Rivalries and border disputes strain alliances; tension simmers.'
  } else if (score >= 20) {
    status = 'Realm at War'
    icon = '⚔️'
    badgeColor = 'text-orange-700 bg-orange-500/15 border-orange-500/30 dark:text-orange-300'
    summary = 'Active skirmishes and hostile rivalries tear through provinces.'
  } else {
    status = 'Age of Chaos'
    icon = '🌋'
    badgeColor = 'text-rose-700 bg-rose-500/15 border-rose-500/30 dark:text-rose-300'
    summary = 'Cataclysms and widespread strife have unraveled the established order.'
  }

  return {
    score,
    status,
    icon,
    badgeColor,
    breakdown: {
      alliancesCount,
      conflictsCount,
      cataclysmsCount,
      settlementCount,
    },
    summary,
  }
}
