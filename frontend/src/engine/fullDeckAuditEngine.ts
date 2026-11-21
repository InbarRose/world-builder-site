/**
 * fullDeckAuditEngine.ts
 *
 * Phase 58 (ADR-062): Exhaustive 54-card × 4-stage preset audit & full-deck-per-phase
 * E2E simulation + step-by-step audit engine (logs, chronicle, map, 2-page overview,
 * SVG map export, and lossless .world.json re-import verification).
 */

import { generateNaturalWorld } from './proceduralWorldEngine'
import { createNewWorld, parseImportedWorld } from './storageService'
import { autoPlayFullWorld } from './autoPlayEngine'
import {
  DEFAULT_DECK_CONFIG,
  buildShuffledDeck,
  getPhaseRelevantExamples,
  isFantasticalCard,
} from './deckEngine'
import { getActionPresetsForDraw } from './presets'
import { createDraftFromPreset, stampDraftOnMapTile } from './turnWorkbenchEngine'
import {
  buildWorldTwoPageOverview,
  exportTwoPageOverviewMarkdown,
} from './twoPageOverviewEngine'
import { exportMapToSvgString } from './mapEngine'
import {
  GeographyPreset,
  StageId,
  WorldState,
} from './types'

const ALL_STAGES: StageId[] = ['genesis', 'primal', 'civilization', 'intrigue']

export interface StageCardAuditSummary {
  stage: StageId
  cardsChecked: number
  minPresets: number
  maxPresets: number
  avgPresets: number
  minExamples: number
  failures: string[]
}

export interface FullDeckCardAuditResult {
  totalCardStagePairs: number
  passedPairs: number
  failures: string[]
  byStage: StageCardAuditSummary[]
}

export interface WorldPermutationSpec {
  slug: string
  name: string
  seed: string
  preset: GeographyPreset
  turnsPerStage: number
  fantasyLevel: 'low' | 'medium' | 'high'
  disasterIntensity: 'mild' | 'standard' | 'cataclysmic'
  allowDisasters: boolean
  allowFantastical: boolean
}

export interface AuditedSimulatedWorld {
  spec: WorldPermutationSpec
  world: WorldState
  overviewMarkdown: string
  mapSvg: string
  audit: {
    passed: boolean
    issues: string[]
    totalTurns: number
    turnsByStage: Record<StageId, number>
    settlements: number
    namedLandmarks: number
    entities: number
    jsonBytes: number
    svgBytes: number
    reimportVerified: boolean
    overviewEraCount: number
  }
}

export const FULL_DECK_PERMUTATION_SPECS: WorldPermutationSpec[] = [
  {
    slug: '01-valdoria-full-54-deck-per-phase-continent',
    name: 'Valdoria — Full 54-Card Deck Per Phase',
    seed: 'e2e-full-54-continent',
    preset: 'continent',
    turnsPerStage: 54, // 54 × 4 = 216 turns!
    fantasyLevel: 'medium',
    disasterIntensity: 'standard',
    allowDisasters: true,
    allowFantastical: true,
  },
  {
    slug: '02-shattered-isles-high-fantasy-archipelago',
    name: 'The Shattered Isles (High Fantasy)',
    seed: 'e2e-archipelago-high',
    preset: 'archipelago',
    turnsPerStage: 15, // 60 turns
    fantasyLevel: 'high',
    disasterIntensity: 'cataclysmic',
    allowDisasters: true,
    allowFantastical: true,
  },
  {
    slug: '03-twin-realms-sol-vesper-twin-continents',
    name: 'Twin Realms of Sol & Vesper',
    seed: 'e2e-twin-continents-std',
    preset: 'twin-continents',
    turnsPerStage: 15,
    fantasyLevel: 'medium',
    disasterIntensity: 'standard',
    allowDisasters: true,
    allowFantastical: true,
  },
  {
    slug: '04-ironspine-low-fantasy-highlands',
    name: 'Ironspine Reaches (Low Fantasy)',
    seed: 'e2e-highlands-low',
    preset: 'highlands',
    turnsPerStage: 15,
    fantasyLevel: 'low',
    disasterIntensity: 'mild',
    allowDisasters: true,
    allowFantastical: true,
  },
  {
    slug: '05-sunken-sea-no-disasters-inland-sea',
    name: 'The Sunken Sea (Peaceful Chronology)',
    seed: 'e2e-inland-sea-calm',
    preset: 'inland-sea',
    turnsPerStage: 15,
    fantasyLevel: 'high',
    disasterIntensity: 'mild',
    allowDisasters: false,
    allowFantastical: true,
  },
  {
    slug: '06-pangaea-prime-grounded-classic',
    name: 'Pangaea Prime (Grounded Classic)',
    seed: 'e2e-pangaea-grounded',
    preset: 'pangaea',
    turnsPerStage: 15,
    fantasyLevel: 'low',
    disasterIntensity: 'standard',
    allowDisasters: true,
    allowFantastical: false,
  },
]

/**
 * Exhaustively audits EVERY card in a 54-card deck (52 standard + 2 Jokers)
 * across ALL 4 stages (216 total card × stage combinations).
 */
export function auditFullDeckAcrossAllStages(): FullDeckCardAuditResult {
  const fullDeck = buildShuffledDeck({
    ...DEFAULT_DECK_CONFIG,
    aceCount: 4,
    jokerCount: 2,
  })
  const sampleMap = generateNaturalWorld({
    width: 20,
    height: 12,
    preset: 'continent',
    seed: 'audit-sample-tile',
  })
  const sampleLandTile = Object.values(sampleMap.tiles).find((t) => t.domain === 'land')!

  const byStage: StageCardAuditSummary[] = []
  const allFailures: string[] = []
  let passedPairs = 0

  for (const stage of ALL_STAGES) {
    let minPresets = Number.POSITIVE_INFINITY
    let maxPresets = 0
    let sumPresets = 0
    let minExamples = Number.POSITIVE_INFINITY
    const stageFailures: string[] = []

    for (const card of fullDeck) {
      const isDisaster = card.value === 'A'
      const isFantastical = isFantasticalCard(card)
      const presets = getActionPresetsForDraw(stage, card.suit, isFantastical, isDisaster)
      const examples = getPhaseRelevantExamples(stage, card, 'Classic fantasy example')

      minPresets = Math.min(minPresets, presets.length)
      maxPresets = Math.max(maxPresets, presets.length)
      sumPresets += presets.length
      minExamples = Math.min(minExamples, examples.length)

      if (presets.length < 10) {
        stageFailures.push(
          `[${stage}] Card ${card.value}${card.suit} has only ${presets.length} presets (< 10)`
        )
        continue
      }
      if (examples.length < 15) {
        stageFailures.push(
          `[${stage}] Card ${card.value}${card.suit} has only ${examples.length} examples (< 15)`
        )
        continue
      }

      // Verify first preset creates a valid draft and stamps cleanly onto a map tile
      const draft = createDraftFromPreset(presets[0], stage, sampleLandTile.id)
      const stamped = stampDraftOnMapTile(sampleLandTile, draft, `audit_${stage}_${card.id}`, 1)
      if (!draft.actionTitle || !stamped.updatedTile) {
        stageFailures.push(
          `[${stage}] Card ${card.value}${card.suit} preset ${presets[0].id} failed draft/stamp`
        )
        continue
      }

      passedPairs++
    }

    allFailures.push(...stageFailures)
    byStage.push({
      stage,
      cardsChecked: fullDeck.length,
      minPresets: minPresets === Number.POSITIVE_INFINITY ? 0 : minPresets,
      maxPresets,
      avgPresets: Number((sumPresets / Math.max(1, fullDeck.length)).toFixed(1)),
      minExamples: minExamples === Number.POSITIVE_INFINITY ? 0 : minExamples,
      failures: stageFailures,
    })
  }

  return {
    totalCardStagePairs: fullDeck.length * ALL_STAGES.length,
    passedPairs,
    failures: allFailures,
    byStage,
  }
}

/**
 * Runs a single permutation spec through all 4 stages and performs a full
 * step-by-step audit of Chronicle, Map, 2-Page Overview, SVG, and JSON re-import.
 */
export function runAndAuditWorldPermutation(spec: WorldPermutationSpec): AuditedSimulatedWorld {
  const baseWorld = createNewWorld(spec.name, spec.seed)
  baseWorld.map = generateNaturalWorld({
    width: 20,
    height: 12,
    seed: spec.seed,
    preset: spec.preset,
  })
  baseWorld.deckConfig = {
    ...baseWorld.deckConfig,
    aceCount: spec.allowDisasters ? 4 : 0,
    jokerCount: spec.allowFantastical ? 2 : 0,
  }
  baseWorld.generationSettings = {
    ...baseWorld.generationSettings!,
    seed: spec.seed,
    geographyPreset: spec.preset,
    fantasyLevel: spec.fantasyLevel,
    disasterIntensity: spec.disasterIntensity,
    turnsPerStage: spec.turnsPerStage,
    allowDisasters: spec.allowDisasters,
    allowFantastical: spec.allowFantastical,
  }

  const finished = autoPlayFullWorld(baseWorld, spec.turnsPerStage)
  const issues: string[] = []

  // 1. Chronicle & Stage Audit
  const turnsByStage: Record<StageId, number> = {
    genesis: 0,
    primal: 0,
    civilization: 0,
    intrigue: 0,
  }
  finished.drawHistory.forEach((rec, idx) => {
    if (rec.moveId !== idx + 1) {
      issues.push(`Non-contiguous moveId at index ${idx}: got ${rec.moveId}`)
    }
    if (!rec.note || rec.note.trim().length < 5) {
      issues.push(`Empty or too-short chronicle note on turn #${rec.moveId}`)
    }
    const st = rec.stage || 'genesis'
    turnsByStage[st] = (turnsByStage[st] || 0) + 1
  })

  for (const st of ALL_STAGES) {
    if (turnsByStage[st] < spec.turnsPerStage) {
      issues.push(`Stage ${st} had ${turnsByStage[st]} turns (expected >= ${spec.turnsPerStage})`)
    }
  }
  if (finished.currentStage !== 'intrigue') {
    issues.push(`Final stage was ${finished.currentStage}, expected intrigue`)
  }

  // 2. Map Audit
  const tiles = Object.values(finished.map.tiles)
  if (tiles.length !== finished.map.width * finished.map.height) {
    issues.push(`Map tile count mismatch: ${tiles.length}`)
  }
  const settlements = tiles.filter(
    (t) =>
      (t.slots || []).some((s) => s.category === 'settlement') ||
      t.overlay === 'settlement'
  ).length
  const namedLandmarks = tiles.filter((t) => Boolean(t.label && t.label.trim())).length

  // 3. 2-Page World Overview Audit
  const overview = buildWorldTwoPageOverview(finished)
  const overviewMarkdown = exportTwoPageOverviewMarkdown(overview)
  if (!overviewMarkdown.includes(spec.name)) {
    issues.push('2-Page Overview markdown missing world name')
  }
  if (overview.page2.eraDigests.length !== 4) {
    issues.push(`2-Page Overview had ${overview.page2.eraDigests.length} era digests (expected 4)`)
  }

  // 4. Standalone SVG Map Export Audit
  const mapSvg = exportMapToSvgString(finished.map, finished.name, finished.entities)
  if (!mapSvg.startsWith('<svg') || !mapSvg.includes('</svg>')) {
    issues.push('SVG map export is malformed')
  }

  // 5. Lossless JSON Export & Re-Import Round-Trip Audit
  const jsonStr = JSON.stringify(finished, null, 2)
  const reimported = parseImportedWorld(jsonStr)
  const reimportVerified = Boolean(
    reimported &&
      reimported.name === finished.name &&
      reimported.drawHistory.length === finished.drawHistory.length &&
      Object.keys(reimported.map.tiles).length === tiles.length
  )
  if (!reimportVerified) {
    issues.push('Lossless JSON export/re-import round-trip failed')
  }

  return {
    spec,
    world: finished,
    overviewMarkdown,
    mapSvg,
    audit: {
      passed: issues.length === 0,
      issues,
      totalTurns: finished.drawHistory.length,
      turnsByStage,
      settlements,
      namedLandmarks,
      entities: finished.entities.length,
      jsonBytes: jsonStr.length,
      svgBytes: mapSvg.length,
      reimportVerified,
      overviewEraCount: overview.page2.eraDigests.length,
    },
  }
}
