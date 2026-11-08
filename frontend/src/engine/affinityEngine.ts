/**
 * affinityEngine.ts
 * Internal metadata, affinity, and anti-affinity scoring engine for presets.
 * Links world events, geography, and player bot personalities to compute
 * transparent weighted choices for realistic, cohesive tabletop worldbuilding.
 */

import { StageActionPreset, getEffectiveBotWeights, BOT_PERSONALITIES } from './presets'
import { loadCatalogAffinityRules } from './catalogLoader'
import { WorldState, PlayerSeat } from './types'

export const CATALOG_AFFINITY_RULES = loadCatalogAffinityRules()

export type StudioConceptGroup =
  | 'all'
  | 'habitations'
  | 'geography'
  | 'traditions'
  | 'statecraft'
  | 'intrigue'
  | 'myths'

export interface AffinityFactor {
  label: string
  score: number
}

export interface PresetAffinityEvaluation {
  presetId: string
  presetName: string
  totalScore: number
  factors: AffinityFactor[]
}

// ========================================================
// 1. CONCEPT GROUP MAPPINGS & INFERRED TAGS
// ========================================================

export function getPresetConceptGroup(preset: StageActionPreset): StudioConceptGroup {
  const id = preset.id.toLowerCase()
  const cat = preset.slotCategory

  if (id.includes('conf_') || id.includes('sch_') || id.includes('coop_') || preset.stage === 'intrigue') {
    return 'intrigue'
  }
  if (cat === 'settlement' || id.includes('settle') || id.includes('const_') || id.includes('castle') || id.includes('city')) {
    return 'habitations'
  }
  if (cat === 'elevation' || cat === 'hydrology' || cat === 'vegetation' || preset.stage === 'genesis') {
    return 'geography'
  }
  if (id.includes('trad_') || id.includes('skill_') || cat === 'resource') {
    return 'traditions'
  }
  if (id.includes('enl_') || id.includes('exp_') || id.includes('dip_') || preset.relationshipType) {
    return 'statecraft'
  }
  if (id.includes('myth') || preset.isFantastical || cat === 'myth') {
    return 'myths'
  }

  return 'geography'
}

/**
 * Extracts semantic tags for a preset based on its ID, slot category, and name
 */
export function inferPresetTags(preset: StageActionPreset): string[] {
  const tags: string[] = []
  const text = `${preset.id} ${preset.name} ${preset.description}`.toLowerCase()

  if (text.includes('water') || text.includes('river') || text.includes('sea') || text.includes('port') || text.includes('stilt') || text.includes('fish') || text.includes('coast') || text.includes('ocean')) {
    tags.push('maritime', 'water')
  }
  if (text.includes('mountain') || text.includes('peak') || text.includes('cliff') || text.includes('pueblo') || text.includes('citadel') || text.includes('climb')) {
    tags.push('mountain', 'highland')
  }
  if (text.includes('forest') || text.includes('wood') || text.includes('jungle') || text.includes('flora') || text.includes('tree')) {
    tags.push('forest', 'nature')
  }
  if (text.includes('war') || text.includes('siege') || text.includes('sword') || text.includes('shield') || text.includes('conquest') || text.includes('fort') || text.includes('army') || text.includes('raids')) {
    tags.push('martial', 'military')
  }
  if (text.includes('solar') || text.includes('sun') || text.includes('lunar') || text.includes('moon') || text.includes('faith') || text.includes('cult') || text.includes('temple') || text.includes('sacred') || text.includes('sanctuary')) {
    tags.push('spiritual', 'faith')
  }
  if (text.includes('republic') || text.includes('law') || text.includes('code') || text.includes('scholar') || text.includes('astrolabe') || text.includes('university') || text.includes('academy') || text.includes('medicine')) {
    tags.push('scholarly', 'enlightenment')
  }
  if (text.includes('trade') || text.includes('market') || text.includes('guild') || text.includes('crossroads') || text.includes('merchant') || text.includes('coin') || text.includes('silver')) {
    tags.push('commerce', 'trade')
  }
  if (text.includes('peace') || text.includes('marriage') || text.includes('treaty') || text.includes('alliance') || text.includes('embassy') || text.includes('coalition') || text.includes('reconstruction')) {
    tags.push('diplomacy', 'peace')
  }
  if (text.includes('assassin') || text.includes('spy') || text.includes('cabal') || text.includes('coup') || text.includes('blackmail') || text.includes('smuggler') || text.includes('inquisition')) {
    tags.push('intrigue', 'covert')
  }
  if (text.includes('dragon') || text.includes('titan') || text.includes('lich') || text.includes('blade') || text.includes('celestial') || text.includes('star') || preset.isFantastical) {
    tags.push('mythic', 'arcane')
  }
  if (text.includes('nomad') || text.includes('yurt') || text.includes('steppe') || text.includes('horse') || text.includes('herds') || text.includes('wheat') || text.includes('oxen')) {
    tags.push('pastoral', 'nomadic')
  }

  return Array.from(new Set(tags))
}

// ========================================================
// 2. WORLD & HISTORICAL TRAIT ACCUMULATOR
// ========================================================

export function getAccumulatedWorldTags(world: WorldState): Map<string, number> {
  const counts = new Map<string, number>()

  const addTag = (tag: string, weight = 1) => {
    counts.set(tag, (counts.get(tag) || 0) + weight)
  }

  // Count tags from past moves
  for (const record of world.drawHistory) {
    const text = `${record.actionTitle || ''} ${record.power || ''} ${record.note || ''}`.toLowerCase()
    if (text.includes('port') || text.includes('stilt') || text.includes('river') || text.includes('sea') || text.includes('ocean')) addTag('maritime', 2)
    if (text.includes('mountain') || text.includes('peak') || text.includes('citadel') || text.includes('canyon')) addTag('mountain', 2)
    if (text.includes('forest') || text.includes('jungle') || text.includes('wood')) addTag('forest', 2)
    if (text.includes('war') || text.includes('siege') || text.includes('battle') || text.includes('castle')) addTag('martial', 2)
    if (text.includes('faith') || text.includes('solar') || text.includes('temple') || text.includes('ritual')) addTag('spiritual', 2)
    if (text.includes('trade') || text.includes('market') || text.includes('merchant')) addTag('commerce', 2)
    if (text.includes('peace') || text.includes('alliance') || text.includes('treaty')) addTag('diplomacy', 2)
    if (text.includes('scheme') || text.includes('assassin') || text.includes('spy')) addTag('intrigue', 2)
  }

  // Count tags from entity traits & abilities
  for (const entity of world.entities) {
    for (const trait of entity.traits) {
      const t = trait.toLowerCase()
      if (t.includes('seafar') || t.includes('wave') || t.includes('tide') || t.includes('aquatic')) addTag('maritime', 3)
      if (t.includes('war') || t.includes('shield') || t.includes('archer') || t.includes('iron')) addTag('martial', 3)
      if (t.includes('sun') || t.includes('moon') || t.includes('divin') || t.includes('sacred')) addTag('spiritual', 3)
      if (t.includes('trade') || t.includes('market') || t.includes('caravan')) addTag('commerce', 3)
      if (t.includes('scholar') || t.includes('acad') || t.includes('code') || t.includes('republic')) addTag('scholarly', 3)
    }
  }

  return counts
}

// ========================================================
// 3. AFFINITY EVALUATOR
// ========================================================

/**
 * Evaluates the full affinity score of a preset in the context of the world,
 * active player seat, and target tile.
 */
export function evaluatePresetAffinity(
  preset: StageActionPreset,
  world: WorldState,
  player?: PlayerSeat,
  targetTileId?: string
): PresetAffinityEvaluation {
  const factors: AffinityFactor[] = []
  let totalScore = 50 // baseline score
  factors.push({ label: 'Base Candidate Score', score: 50 })

  const presetTags = inferPresetTags(preset)
  const worldTags = getAccumulatedWorldTags(world)

  // 1. World Cultural & Historical Affinity (+10 to +35)
  for (const tag of presetTags) {
    const historicalWeight = worldTags.get(tag) || 0
    if (historicalWeight > 0) {
      const bonus = Math.min(30, historicalWeight * 5)
      totalScore += bonus
      factors.push({ label: `Historical ${tag.toUpperCase()} Precedents`, score: bonus })
    }
  }

  // 2. Bot Personality & Custom Player Weights
  if (player) {
    const weights = getEffectiveBotWeights(player)
    const personality = BOT_PERSONALITIES[player.personality]

    if (preset.slotCategory === 'elevation' || preset.stage === 'genesis') {
      const geoWeight = (weights.geography - 50) / 2
      totalScore += geoWeight
      if (geoWeight !== 0) factors.push({ label: `${personality?.name || 'Bot'} Geography Preference`, score: Math.round(geoWeight) })
    }

    if (preset.slotCategory === 'vegetation' || preset.slotCategory === 'resource') {
      const ecoWeight = (weights.ecology - 50) / 2
      totalScore += ecoWeight
      if (ecoWeight !== 0) factors.push({ label: `${personality?.name || 'Bot'} Ecology Preference`, score: Math.round(ecoWeight) })
    }

    if (preset.slotCategory === 'settlement' || preset.slotCategory === 'structure') {
      const civWeight = (weights.civilization - 50) / 2
      totalScore += civWeight
      if (civWeight !== 0) factors.push({ label: `${personality?.name || 'Bot'} Civilization Preference`, score: Math.round(civWeight) })
    }

    const isPeacefulRel = preset.relationshipType && preset.relationshipType !== 'war' && preset.relationshipType !== 'rivalry'
    if (isPeacefulRel || presetTags.includes('diplomacy')) {
      const dipWeight = (weights.diplomacy - 50) / 2
      totalScore += dipWeight
      if (dipWeight !== 0) factors.push({ label: `${personality?.name || 'Bot'} Diplomacy Preference`, score: Math.round(dipWeight) })
    }

    const isConflictRel = preset.relationshipType === 'war' || preset.relationshipType === 'rivalry'
    if (presetTags.includes('martial') || preset.id.includes('conf_') || isConflictRel) {
      const confWeight = (weights.conflict - 50) / 2
      totalScore += confWeight
      if (confWeight !== 0) factors.push({ label: `${personality?.name || 'Bot'} Conflict Preference`, score: Math.round(confWeight) })
    }

    if (preset.isFantastical || preset.slotCategory === 'myth' || presetTags.includes('mythic')) {
      const mythWeight = (weights.myth - 50) / 2
      totalScore += mythWeight
      if (mythWeight !== 0) factors.push({ label: `${personality?.name || 'Bot'} Myth Preference`, score: Math.round(mythWeight) })
    }
  }

  // 3. Geographic Context of Target Tile
  if (targetTileId && world.map.tiles[targetTileId]) {
    const tile = world.map.tiles[targetTileId]

    // Maritime presets prefer water or coastal tiles
    if (presetTags.includes('maritime')) {
      if (tile.terrain === 'water' || tile.terrain === 'ocean' || tile.hasRiver) {
        totalScore += 25
        factors.push({ label: 'Waterfront / Coastal Adjacency', score: 25 })
      } else if (tile.terrain === 'desert') {
        totalScore -= 25
        factors.push({ label: 'Arid Desert Anti-Affinity', score: -25 })
      }
    }

    // Mountain/Highland presets prefer elevation
    if (presetTags.includes('mountain')) {
      if (tile.relief === 'mountain' || tile.relief === 'mountain-snow' || tile.relief === 'hills') {
        totalScore += 25
        factors.push({ label: 'Highland Elevation Fit', score: 25 })
      }
    }

    // Forest presets prefer forested or plain tiles
    if (presetTags.includes('forest')) {
      if (tile.flora === 'forest' || tile.flora === 'jungle' || tile.terrain === 'plains') {
        totalScore += 20
        factors.push({ label: 'Fertile Soil Affinity', score: 20 })
      }
    }
  }

  // 4. Anti-Affinity & Discordance Safeguards
  const diplomacyWeight = worldTags.get('diplomacy') || 0

  // Peaceful era penalizes sudden unprovoked atrocities unless Conflict personality
  if (diplomacyWeight >= 6 && preset.id.includes('inquisition')) {
    totalScore -= 30
    factors.push({ label: 'Enlightened Era Anti-Affinity', score: -30 })
  }

  // Clamp totalScore to positive bounds [5, 300]
  const clamped = Math.max(5, Math.min(300, Math.round(totalScore)))

  return {
    presetId: preset.id,
    presetName: preset.name,
    totalScore: clamped,
    factors
  }
}

// ========================================================
// 4. RECOMMENDATION & WEIGHTED SAMPLER
// ========================================================

/**
 * Returns the highest scoring preset recommendation with evaluation details
 */
export function recommendBestPreset(
  candidatePresets: StageActionPreset[],
  world: WorldState,
  player?: PlayerSeat,
  targetTileId?: string
): { preset: StageActionPreset; evaluation: PresetAffinityEvaluation } | null {
  if (candidatePresets.length === 0) return null

  let bestPreset = candidatePresets[0]
  let bestEval = evaluatePresetAffinity(bestPreset, world, player, targetTileId)

  for (let i = 1; i < candidatePresets.length; i++) {
    const candidate = candidatePresets[i]
    const ev = evaluatePresetAffinity(candidate, world, player, targetTileId)
    if (ev.totalScore > bestEval.totalScore) {
      bestPreset = candidate
      bestEval = ev
    }
  }

  return { preset: bestPreset, evaluation: bestEval }
}

/**
 * Probabilistically samples a preset using roulette-wheel selection weighted
 * by affinity scores, preserving creative variety while respecting affinities.
 */
export function sampleWeightedPreset(
  candidatePresets: StageActionPreset[],
  world: WorldState,
  player?: PlayerSeat,
  targetTileId?: string,
  rng: () => number = Math.random
): StageActionPreset {
  if (candidatePresets.length === 0) throw new Error('No presets available to sample')
  if (candidatePresets.length === 1) return candidatePresets[0]

  const evals = candidatePresets.map((p) => ({
    preset: p,
    score: evaluatePresetAffinity(p, world, player, targetTileId).totalScore
  }))

  const totalSum = evals.reduce((sum, item) => sum + item.score, 0)
  let pick = rng() * totalSum

  for (const item of evals) {
    pick -= item.score
    if (pick <= 0) return item.preset
  }

  return evals[evals.length - 1].preset
}
