/**
 * twoPageOverviewEngine.ts
 * Phase 24: Deterministic Non-LLM 2-Pager World Overview Condenser (ADR-030).
 *
 * Uses heuristic importance scoring, spatial/biome aggregation, and strict
 * information-density budgeting to condense any WorldState (even 60+ turns,
 * 240 tiles, and dozens of factions) into a crisp, scannable 2-Page Executive
 * World Overview:
 * - Page 1: Physical Atlas, Biome Breakdown & Top 8 Landmarks Gazetteer
 * - Page 2: Major Powers/Species/Myths Roster, Diplomatic Web & 4-Ages Digest
 */

import { DrawRecord, StageId, WorldEntity, WorldState } from './types'
import { STAGES, isFantasticalCard, JOKER } from './deckEngine'
import { TERRAIN_PALETTE, getTileDomain } from './mapEngine'
import {
  classifyEventSignificance,
  computeWorldStabilityIndex,
  EventSignificance,
} from './narrativeEngine'

export interface CondensedLandmarkEntry {
  tileId: string
  col: number
  row: number
  name: string
  icon: string
  terrainLabel: string
  categoryLabel: string
  turnMentions: number
  importanceScore: number
  summary: string
}

export interface CondensedEntityEntry {
  id: string
  name: string
  icon: string
  category: 'species' | 'society' | 'myth'
  status: string
  originTileId?: string
  traitsSummary: string
  turnMentions: number
  importanceScore: number
  shortDescription: string
}

export interface CondensedDiplomacyEntry {
  id: string
  sourceId: string
  sourceName: string
  sourceIcon: string
  targetId: string
  targetName: string
  targetIcon: string
  type: string
  description: string
}

export interface CondensedEraHighlight {
  moveId: number
  epochYear: string
  title: string
  summary: string
  significance: EventSignificance
  tileId?: string
  importanceScore: number
}

export interface CondensedEraDigest {
  stageId: StageId
  stageNumber: number
  stageName: string
  eraLabel: string
  totalTurns: number
  headline: string
  pivotalEvents: CondensedEraHighlight[]
}

export interface WorldBiomeBreakdown {
  totalTiles: number
  landTiles: number
  waterTiles: number
  landPercent: number
  waterPercent: number
  mountainCount: number
  forestCount: number
  riverCount: number
  roadCount: number
  settlementCount: number
  landmarkCount: number
  topBiomes: { terrain: string; label: string; count: number; percent: number }[]
}

export interface WorldTwoPageOverview {
  worldName: string
  seed: string
  currentStageId: StageId
  currentStageName: string
  totalTurns: number
  totalEntities: number
  stability: {
    score: number
    status: string
    icon: string
    summary: string
  }
  page1: {
    executiveSynopsis: string
    biomeBreakdown: WorldBiomeBreakdown
    topLandmarks: CondensedLandmarkEntry[]
  }
  page2: {
    topEntities: CondensedEntityEntry[]
    diplomaticHighlights: CondensedDiplomacyEntry[]
    eraDigests: CondensedEraDigest[]
  }
}

function truncateText(text: string, maxLength: number): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= maxLength) return clean
  return `${clean.slice(0, maxLength - 1).trimEnd()}…`
}

/**
 * Computes deterministic map & biome statistics for Page 1.
 */
export function computeBiomeBreakdown(world: WorldState): WorldBiomeBreakdown {
  const tiles = Object.values(world.map.tiles)
  const totalTiles = Math.max(1, world.map.width * world.map.height)
  let landTiles = 0
  let waterTiles = 0
  let mountainCount = 0
  let forestCount = 0
  let riverCount = 0
  let roadCount = 0
  let settlementCount = 0
  let landmarkCount = 0

  const biomeCounts: Record<string, number> = {}

  for (const tile of tiles) {
    const domain = getTileDomain(tile)
    if (domain === 'water') {
      waterTiles++
    } else {
      landTiles++
      biomeCounts[tile.terrain] = (biomeCounts[tile.terrain] || 0) + 1
    }

    if (
      tile.terrain === 'mountain' ||
      tile.terrain === 'volcano' ||
      tile.relief === 'mountain' ||
      tile.relief === 'mountain-snow' ||
      tile.relief === 'mountain-range' ||
      tile.relief === 'volcano'
    ) {
      mountainCount++
    }

    if (
      tile.terrain === 'forest' ||
      tile.terrain === 'jungle' ||
      tile.flora === 'forest' ||
      tile.flora === 'jungle'
    ) {
      forestCount++
    }

    if (tile.hasRiver) riverCount++
    if (tile.hasRoad) roadCount++

    const slots = tile.slots || []
    if (
      slots.some((s) => s.category === 'settlement') ||
      tile.overlay === 'settlement' ||
      tile.overlay === 'town' ||
      tile.overlay === 'city' ||
      tile.overlay === 'capital'
    ) {
      settlementCount++
    }
    if (
      slots.some((s) => s.category === 'structure' || s.category === 'myth') ||
      tile.overlay === 'monument' ||
      tile.overlay === 'ruins' ||
      tile.overlay === 'castle'
    ) {
      landmarkCount++
    }
  }

  // Account for uninitialized default ocean tiles if sparse
  const unaccounted = Math.max(0, totalTiles - (landTiles + waterTiles))
  waterTiles += unaccounted

  const landPercent = Math.round((landTiles / totalTiles) * 100)
  const waterPercent = 100 - landPercent

  const topBiomes = Object.entries(biomeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([terrain, count]) => ({
      terrain,
      label: TERRAIN_PALETTE[terrain as keyof typeof TERRAIN_PALETTE]?.label || terrain,
      count,
      percent: landTiles > 0 ? Math.round((count / landTiles) * 100) : 0,
    }))

  return {
    totalTiles,
    landTiles,
    waterTiles,
    landPercent,
    waterPercent,
    mountainCount,
    forestCount,
    riverCount,
    roadCount,
    settlementCount,
    landmarkCount,
    topBiomes,
  }
}

/**
 * Ranks and condenses the Top N most important map landmarks/regions for Page 1.
 */
export function condenseTopLandmarks(
  world: WorldState,
  limit = 8
): CondensedLandmarkEntry[] {
  const tileMentionCounts: Record<string, number> = {}
  const tileLatestNote: Record<string, string> = {}

  for (const rec of world.drawHistory) {
    for (const tid of rec.linkedTileIds || []) {
      tileMentionCounts[tid] = (tileMentionCounts[tid] || 0) + 1
      if (rec.note && !tileLatestNote[tid]) {
        tileLatestNote[tid] = rec.note
      }
    }
  }

  const candidates: CondensedLandmarkEntry[] = []

  for (const tile of Object.values(world.map.tiles)) {
    const slots = tile.slots || []
    const mentions = tileMentionCounts[tile.id] || 0
    const hasLabel = Boolean(tile.label && tile.label.trim())
    const hasSlots = slots.length > 0

    if (!hasLabel && !hasSlots && mentions === 0 && !tile.notes) continue

    const topSlot = slots[0]
    const maxPriority = topSlot?.priority || 0

    let score = mentions * 18 + maxPriority * 0.4
    if (hasLabel) score += 30
    if (slots.some((s) => s.category === 'settlement')) score += 28
    if (slots.some((s) => s.category === 'myth' || s.category === 'structure')) score += 22
    if (tile.hasRiver) score += 6
    if (tile.hasRoad) score += 6

    const name =
      tile.label?.trim() ||
      topSlot?.name ||
      `${TERRAIN_PALETTE[tile.terrain]?.label || 'Province'} (${tile.id})`

    const icon =
      topSlot?.icon ||
      (tile.terrain === 'mountain'
        ? '🏔️'
        : tile.terrain === 'forest'
        ? '🌲'
        : tile.terrain === 'volcano'
        ? '🌋'
        : '📍')

    const terrainLabel = TERRAIN_PALETTE[tile.terrain]?.label || tile.terrain
    const categoryLabel = topSlot?.category || 'region'

    const rawSummary =
      tile.notes?.trim() ||
      tileLatestNote[tile.id] ||
      (slots.length > 1
        ? `Features ${slots.map((s) => s.name).join(', ')} in ${terrainLabel.toLowerCase()} terrain.`
        : `Notable ${categoryLabel} in the ${terrainLabel.toLowerCase()} province at (${tile.id}).`)

    candidates.push({
      tileId: tile.id,
      col: tile.col,
      row: tile.row,
      name,
      icon,
      terrainLabel,
      categoryLabel,
      turnMentions: mentions,
      importanceScore: Math.round(score),
      summary: truncateText(rawSummary, 105),
    })
  }

  candidates.sort((a, b) => b.importanceScore - a.importanceScore)
  return candidates.slice(0, limit)
}

/**
 * Ranks and condenses the Top N most influential Species, Societies, and Myths for Page 2.
 */
export function condenseTopEntities(
  world: WorldState,
  limit = 8
): CondensedEntityEntry[] {
  const mentionCounts: Record<string, number> = {}
  for (const rec of world.drawHistory) {
    for (const eid of rec.linkedEntityIds || []) {
      mentionCounts[eid] = (mentionCounts[eid] || 0) + 1
    }
  }

  const scored: CondensedEntityEntry[] = world.entities.map((ent: WorldEntity) => {
    const mentions = mentionCounts[ent.id] || 0
    const diploCount = ent.diplomaticLinks?.length || 0
    const traitList = [...(ent.traits || []), ...(ent.abilities || [])]

    const importanceScore =
      mentions * 18 +
      diploCount * 14 +
      traitList.length * 6 +
      (ent.originTileId ? 10 : 0) +
      (ent.category === 'society' ? 8 : 5)

    return {
      id: ent.id,
      name: ent.name,
      icon: ent.icon || '🏛️',
      category: ent.category,
      status: ent.status || 'Active',
      originTileId: ent.originTileId,
      traitsSummary:
        traitList.length > 0
          ? traitList.slice(0, 3).join(' · ')
          : ent.archetype || ent.category,
      turnMentions: mentions,
      importanceScore,
      shortDescription: truncateText(
        ent.description || `Prominent ${ent.category} of ${world.name}.`,
        110
      ),
    }
  })

  scored.sort((a, b) => b.importanceScore - a.importanceScore)
  return scored.slice(0, limit)
}

/**
 * Extracts and deduplicates key diplomatic alliances, rivalries, and wars for Page 2.
 */
export function condenseDiplomaticWeb(
  world: WorldState,
  limit = 6
): CondensedDiplomacyEntry[] {
  const seenPairs = new Set<string>()
  const entries: (CondensedDiplomacyEntry & { priority: number })[] = []

  for (const ent of world.entities) {
    for (const link of ent.diplomaticLinks || []) {
      const target = world.entities.find((e) => e.id === link.targetEntityId)
      const targetId = target?.id || link.targetEntityId
      const targetName = target?.name || link.targetEntityName
      if (!targetId || !targetName) continue
      const pairKey = [ent.id, targetId].sort().join('::') + `::${link.type}`
      if (seenPairs.has(pairKey)) continue
      seenPairs.add(pairKey)

      const t = link.type.toLowerCase()
      const priority =
        t.includes('war') || t.includes('rival') || t.includes('feud')
          ? 30
          : t.includes('alliance') || t.includes('treaty') || t.includes('vassal')
          ? 25
          : 15

      entries.push({
        id: pairKey,
        sourceId: ent.id,
        sourceName: ent.name,
        sourceIcon: ent.icon || '🏛️',
        targetId,
        targetName,
        targetIcon: target?.icon || link.icon || '🏛️',
        type: link.label || link.type,
        description: truncateText(
          link.description || `${ent.name} and ${targetName} maintain a ${link.label || link.type} relation.`,
          95
        ),
        priority,
      })
    }
  }

  entries.sort((a, b) => b.priority - a.priority)
  return entries.slice(0, limit)
}

/**
 * Condenses the entire DrawHistory into 4 Stage Boxes with up to 3 pivotal events each.
 */
export function condenseFourAgesDigest(
  world: WorldState,
  maxEventsPerStage = 3
): CondensedEraDigest[] {
  return STAGES.map((stageMeta) => {
    const stageRecords = world.drawHistory.filter(
      (r) => (r.stage || 'genesis') === stageMeta.id
    )

    const scoredEvents: CondensedEraHighlight[] = stageRecords.map((rec: DrawRecord) => {
      const sig = classifyEventSignificance(rec)
      let score = 10
      if (rec.card.value === 'A' || sig === 'cataclysm') score += 40
      if (rec.card.value === JOKER || isFantasticalCard(rec.card)) score += 30
      if (sig === 'conflict' || sig === 'diplomacy') score += 20
      if (rec.actionTitle) score += 15
      score += ((rec.linkedTileIds?.length || 0) + (rec.linkedEntityIds?.length || 0)) * 8

      const title =
        rec.actionTitle?.trim() ||
        rec.power?.trim() ||
        `Turn #${rec.moveId} (${rec.card.value}${rec.card.suit})`

      const rawSummary =
        rec.note?.trim() ||
        (rec.slotChanges && rec.slotChanges.length > 0
          ? `Placed ${rec.slotChanges.map((s) => `${s.slotIcon} ${s.slotName} (${s.tileId})`).join(', ')}.`
          : `${title} shaped the realm during ${stageMeta.name}.`)

      return {
        moveId: rec.moveId,
        epochYear: rec.epochYear || `Turn #${rec.moveId}`,
        title,
        summary: truncateText(rawSummary, 110),
        significance: sig,
        tileId: rec.linkedTileIds?.[0],
        importanceScore: score,
      }
    })

    // Pick top N events by importance score, then sort chronologically by moveId
    const pivotalEvents = scoredEvents
      .slice()
      .sort((a, b) => b.importanceScore - a.importanceScore)
      .slice(0, maxEventsPerStage)
      .sort((a, b) => a.moveId - b.moveId)

    const cataclysms = scoredEvents.filter((e) => e.significance === 'cataclysm').length
    const conflicts = scoredEvents.filter((e) => e.significance === 'conflict').length

    let headline = 'Unrecorded Era'
    if (stageRecords.length > 0) {
      if (cataclysms > 0) {
        headline = `${stageRecords.length} turns · Marked by ${cataclysms} major upheaval${cataclysms > 1 ? 's' : ''}`
      } else if (conflicts > 0) {
        headline = `${stageRecords.length} turns · Defined by ${conflicts} contested struggle${conflicts > 1 ? 's' : ''}`
      } else {
        headline = `${stageRecords.length} turns · Age of steady creation and expansion`
      }
    }

    return {
      stageId: stageMeta.id,
      stageNumber: stageMeta.number,
      stageName: stageMeta.name,
      eraLabel: stageMeta.eraLabel,
      totalTurns: stageRecords.length,
      headline,
      pivotalEvents,
    }
  })
}

/**
 * Main entry point: deterministically condenses a WorldState into a 2-Page Overview.
 */
export function buildWorldTwoPageOverview(world: WorldState): WorldTwoPageOverview {
  const stability = computeWorldStabilityIndex(world)
  const biomeBreakdown = computeBiomeBreakdown(world)
  const topLandmarks = condenseTopLandmarks(world, 8)
  const topEntities = condenseTopEntities(world, 8)
  const diplomaticHighlights = condenseDiplomaticWeb(world, 6)
  const eraDigests = condenseFourAgesDigest(world, 3)

  const currentStageMeta =
    STAGES.find((s) => s.id === world.currentStage) || STAGES[0]

  const dominantBiomeNames =
    biomeBreakdown.topBiomes.length > 0
      ? biomeBreakdown.topBiomes
          .slice(0, 2)
          .map((b) => `${b.label.toLowerCase()} (${b.percent}%)`)
          .join(' and ')
      : 'untamed waters and primordial shores'

  const topLandmarkNames =
    topLandmarks.length > 0
      ? topLandmarks
          .slice(0, 3)
          .map((l) => `${l.name} (${l.tileId})`)
          .join(', ')
      : 'uncharted frontier provinces'

  const speciesCount = world.entities.filter((e) => e.category === 'species').length
  const societyCount = world.entities.filter((e) => e.category === 'society').length
  const mythCount = world.entities.filter((e) => e.category === 'myth').length

  const leadEntityText =
    topEntities.length > 0
      ? `anchored by ${topEntities
          .slice(0, 3)
          .map((e) => `${e.icon} ${e.name}`)
          .join(', ')}`
      : 'awaiting its first chronicled civilizations'

  const executiveSynopsis = `${world.name} is a ${world.generationSettings.geographyPreset} realm (${biomeBreakdown.landPercent}% landmass, ${biomeBreakdown.waterPercent}% seas) dominated by ${dominantBiomeNames}, with key geographic anchors at ${topLandmarkNames}. Across ${world.drawHistory.length} recorded turns reaching Age ${currentStageMeta.number}: ${currentStageMeta.name}, ${speciesCount} species, ${societyCount} societies, and ${mythCount} mythic forces have risen—${leadEntityText}. Current geopolitical climate: ${stability.status} (${stability.score}/100) — ${stability.summary}`

  return {
    worldName: world.name,
    seed: world.generationSettings.seed,
    currentStageId: world.currentStage,
    currentStageName: `${currentStageMeta.number}. ${currentStageMeta.name}`,
    totalTurns: world.drawHistory.length,
    totalEntities: world.entities.length,
    stability: {
      score: stability.score,
      status: stability.status,
      icon: stability.icon,
      summary: stability.summary,
    },
    page1: {
      executiveSynopsis,
      biomeBreakdown,
      topLandmarks,
    },
    page2: {
      topEntities,
      diplomaticHighlights,
      eraDigests,
    },
  }
}

/**
 * Formats the 2-Page World Overview into clean, portable Markdown with an explicit page break.
 */
export function exportTwoPageOverviewMarkdown(overview: WorldTwoPageOverview): string {
  const { page1, page2 } = overview
  const lines: string[] = []

  // PAGE 1
  lines.push(`# 📄 ${overview.worldName} — 2-Page World Overview`)
  lines.push(
    `**Seed**: \`${overview.seed}\` · **Current Era**: ${overview.currentStageName} · **Turns**: ${overview.totalTurns} · **Stability**: ${overview.stability.icon} ${overview.stability.status} (${overview.stability.score}/100)`
  )
  lines.push('')
  lines.push('## Page 1: Physical Atlas & Iconic Landmarks')
  lines.push(`> ${page1.executiveSynopsis}`)
  lines.push('')
  lines.push(
    `**Cartographic Profile**: ${page1.biomeBreakdown.landPercent}% Land (${page1.biomeBreakdown.landTiles} tiles) / ${page1.biomeBreakdown.waterPercent}% Water (${page1.biomeBreakdown.waterTiles} tiles) · 🏔️ ${page1.biomeBreakdown.mountainCount} Peaks · 🌲 ${page1.biomeBreakdown.forestCount} Forests · 🌊 ${page1.biomeBreakdown.riverCount} Rivers · 🏘️ ${page1.biomeBreakdown.settlementCount} Settlements · 🏛️ ${page1.biomeBreakdown.landmarkCount} Landmarks`
  )
  lines.push('')
  lines.push('### Top Named Regions & Landmarks Gazetteer')
  if (page1.topLandmarks.length === 0) {
    lines.push('- *No named landmarks recorded yet.*')
  } else {
    for (const lm of page1.topLandmarks) {
      lines.push(
        `- **${lm.icon} ${lm.name}** \`(${lm.tileId})\` [${lm.terrainLabel}]: ${lm.summary}`
      )
    }
  }

  lines.push('')
  lines.push('---')
  lines.push('')

  // PAGE 2
  lines.push('## Page 2: Peoples, Powers & The Four Ages Digest')
  lines.push('### Major Species, Societies & Mythic Forces')
  if (page2.topEntities.length === 0) {
    lines.push('- *No Codex entities forged yet.*')
  } else {
    for (const ent of page2.topEntities) {
      const origin = ent.originTileId ? ` @ \`(${ent.originTileId})\`` : ''
      lines.push(
        `- **${ent.icon} ${ent.name}** (${ent.category} · ${ent.status}${origin}) — *${ent.traitsSummary}*: ${ent.shortDescription}`
      )
    }
  }

  if (page2.diplomaticHighlights.length > 0) {
    lines.push('')
    lines.push('### Active Diplomatic Web & Fault Lines')
    for (const dip of page2.diplomaticHighlights) {
      lines.push(
        `- **${dip.sourceIcon} ${dip.sourceName}** ↔ **${dip.targetIcon} ${dip.targetName}** [${dip.type}]: ${dip.description}`
      )
    }
  }

  lines.push('')
  lines.push('### Condensed Four Ages Chronicle')
  for (const era of page2.eraDigests) {
    lines.push(`#### Age ${era.stageNumber}: ${era.stageName} (${era.headline})`)
    if (era.pivotalEvents.length === 0) {
      lines.push('- *No turns recorded in this age.*')
    } else {
      for (const ev of era.pivotalEvents) {
        const coord = ev.tileId ? ` \`(${ev.tileId})\`` : ''
        lines.push(`- **Turn #${ev.moveId} — ${ev.title}**${coord}: ${ev.summary}`)
      }
    }
  }

  return lines.join('\n')
}
