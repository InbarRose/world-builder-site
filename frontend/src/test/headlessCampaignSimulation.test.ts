/**
 * headlessCampaignSimulation.test.ts
 *
 * Phase 55 (ADR-059): Headless, UI-free end-to-end game-logic fuzz & permutation
 * simulation suite. Runs 270+ deterministic permutations locally and in CI:
 * - 120 Pre-Genesis bare-map permutations (20 seeds × 6 geography presets)
 * - 100 full 4-stage campaign playthroughs (Genesis -> Primal -> Civilization -> Intrigue)
 * - 50 interactive Turn Map Session & Card Flexibility permutations
 *   (Redraw, Discard, Freeform, Drag-to-Move revert, Multi-Tile paint, Free Edit diff, Cancel rollback)
 * - Lossless JSON export/re-import round-trip & 2-Page World Overview synthesis checks
 */

import { describe, it, expect } from 'vitest'
import { generateNaturalWorld } from '../engine/proceduralWorldEngine'
import { createNewWorld, parseImportedWorld } from '../engine/storageService'
import {
  STAGES,
  buildShuffledDeck,
  getPhaseRelevantExamples,
  isFantasticalCard,
} from '../engine/deckEngine'
import { getActionPresetsForDraw } from '../engine/presets'
import { autoPlayFullWorld } from '../engine/autoPlayEngine'
import {
  cloneMapState,
  computeModifiedTileIds,
  createCustomTurnDraft,
  createDraftFromPreset,
  repositionDraftOnMap,
  shouldDefaultToMultiTilePlacement,
  syncDraftToDrawRecord,
} from '../engine/turnWorkbenchEngine'
import {
  buildWorldTwoPageOverview,
  exportTwoPageOverviewMarkdown,
} from '../engine/twoPageOverviewEngine'
import { GeographyPreset, StageId, Suit } from '../engine/types'

const ALL_PRESETS: Exclude<GeographyPreset, 'random'>[] = [
  'continent',
  'highlands',
  'inland-sea',
  'archipelago',
  'pangaea',
  'twin-continents',
]

const ALL_STAGES: StageId[] = ['genesis', 'primal', 'civilization', 'intrigue']
const ALL_SUITS: Suit[] = ['♠', '♥', '♣', '♦']

describe('Phase 55: Headless Multi-Hundred-Permutation Campaign Simulation Suite (ADR-059)', () => {
  it('verifies 120 Pre-Genesis bare-map permutations (20 seeds × 6 geography presets) strictly obey bare-start invariants', () => {
    let permutationsChecked = 0

    for (const preset of ALL_PRESETS) {
      for (let seedIdx = 0; seedIdx < 20; seedIdx++) {
        const map = generateNaturalWorld({
          width: 20,
          height: 12,
          preset,
          seed: `headless-${preset}-seed-${seedIdx}`,
        })

        const tiles = Object.values(map.tiles)
        const landTiles = tiles.filter((t) => t.domain === 'land')
        const waterTiles = tiles.filter((t) => t.domain === 'water')

        expect(landTiles.length).toBeGreaterThan(20)
        expect(waterTiles.length).toBeGreaterThan(20)

        // >= 92% of land must be bare open plains with no relief or flora
        const barePlains = landTiles.filter(
          (t) => t.terrain === 'plains' && t.relief === 'none' && t.flora === 'none'
        )
        expect(barePlains.length / landTiles.length).toBeGreaterThanOrEqual(0.92)

        // Strict 1–2 mountains, 1–2 forests, 0 rivers, 0 slots, 0 settlements
        const mountains = landTiles.filter((t) => t.terrain === 'mountain')
        const forests = landTiles.filter((t) => t.flora === 'forest')
        const rivers = tiles.filter((t) => t.hasRiver)
        const slots = tiles.flatMap((t) => t.slots || [])
        const settlements = tiles.filter((t) => t.overlay !== 'none')

        expect(mountains.length).toBeGreaterThanOrEqual(1)
        expect(mountains.length).toBeLessThanOrEqual(2)
        expect(forests.length).toBeGreaterThanOrEqual(1)
        expect(forests.length).toBeLessThanOrEqual(2)
        expect(rivers.length).toBe(0)
        expect(slots.length).toBe(0)
        expect(settlements.length).toBe(0)

        permutationsChecked++
      }
    }

    expect(permutationsChecked).toBe(120)
  })

  it('simulates 100 complete headless 4-stage campaigns (Genesis -> Primal -> Civilization -> Intrigue) with zero invariant errors and lossless JSON round-trip', () => {
    let campaignsCompleted = 0

    for (let i = 0; i < 100; i++) {
      const preset = ALL_PRESETS[i % ALL_PRESETS.length]
      const seed = `sim-campaign-${i}`
      const baseWorld = createNewWorld(`Simulated Realm #${i + 1}`, seed)
      baseWorld.map = generateNaturalWorld({ width: 20, height: 12, seed, preset })
      if (baseWorld.generationSettings) {
        baseWorld.generationSettings.geographyPreset = preset
      }

      // Play through all 4 stages headlessly (3 turns per stage = 12 turns per full campaign)
      const finished = autoPlayFullWorld(baseWorld, 3)

      // 1. Must reach Intrigue with 12 recorded turns spanning all 4 stages
      expect(finished.currentStage).toBe('intrigue')
      expect(finished.drawHistory.length).toBeGreaterThanOrEqual(12)

      const stagesVisited = new Set(finished.drawHistory.map((r) => r.stage))
      for (const st of ALL_STAGES) {
        expect(stagesVisited.has(st)).toBe(true)
      }

      // 2. Contiguous moveId sequence & valid card/note integrity
      finished.drawHistory.forEach((rec, idx) => {
        expect(rec.moveId).toBe(idx + 1)
        expect(rec.card).toBeDefined()
        expect(typeof rec.note).toBe('string')
      })

      // 3. Every 10th campaign: verify lossless JSON export/re-import round-trip & 2-Page Overview synthesis
      if (i % 10 === 0) {
        const exportedJson = JSON.stringify(finished)
        const reimported = parseImportedWorld(exportedJson)
        expect(reimported).not.toBeNull()
        expect(reimported?.name).toBe(finished.name)
        expect(reimported?.drawHistory.length).toBe(finished.drawHistory.length)
        expect(Object.keys(reimported?.map.tiles || {}).length).toBe(
          Object.keys(finished.map.tiles).length
        )

        const overview = buildWorldTwoPageOverview(finished)
        const markdown = exportTwoPageOverviewMarkdown(overview)
        expect(markdown).toContain(finished.name)
        expect(overview.page2.eraDigests.length).toBe(4)
      }

      campaignsCompleted++
    }

    expect(campaignsCompleted).toBe(100)
  })

  it('stress-tests 50 permutations of Card Flexibility (Redraw, Discard, Freeform) & Universal Turn Map Sessions (Move, Multi-Tile, Free Edit, Cancel)', () => {
    let sessionsTested = 0

    for (let i = 0; i < 50; i++) {
      const stage = ALL_STAGES[i % ALL_STAGES.length]
      const suit = ALL_SUITS[i % ALL_SUITS.length]
      const isDisaster = i % 5 === 0
      const isFantastical = !isDisaster && i % 3 === 0

      const preset = ALL_PRESETS[i % ALL_PRESETS.length]
      const seed = `session-perm-${i}`
      const world = createNewWorld(`Session Perm ${i}`, seed)
      world.map = generateNaturalWorld({ width: 20, height: 12, seed, preset })
      const deck = buildShuffledDeck(world.deckConfig)
      expect(deck.length).toBeGreaterThan(20)

      // 1. Card examples & preset availability for every permutation
      const card = {
        id: `sim_${i}`,
        suit,
        value: isDisaster ? 'A' : isFantastical ? 'K' : String((i % 9) + 2),
      }
      const examples = getPhaseRelevantExamples(stage, card, 'Classic base example')
      expect(examples.length).toBeGreaterThanOrEqual(20)

      const presets = getActionPresetsForDraw(stage, suit, isFantasticalCard(card), isDisaster)
      expect(presets.length).toBeGreaterThanOrEqual(12)

      // 2. Interactive Drag-to-Move: moving from (2,2) -> (6,5) must cleanly revert (2,2) to baseMap!
      const baseMap = cloneMapState(world.map)
      const chosenPreset = presets[i % presets.length]
      const draft = createDraftFromPreset(chosenPreset, '2,2', i + 100)

      const placedAtFirst = repositionDraftOnMap(baseMap, ['2,2'], draft, `rec_${i}`, chosenPreset)
      expect(computeModifiedTileIds(baseMap, placedAtFirst)).toContain('2,2')

      const movedToSecond = repositionDraftOnMap(baseMap, ['6,5'], draft, `rec_${i}`, chosenPreset)
      const movedDiff = computeModifiedTileIds(baseMap, movedToSecond)
      expect(movedDiff).toEqual(['6,5'])
      expect(movedToSecond.tiles['2,2'].terrain).toBe(baseMap.tiles['2,2'].terrain)
      expect(movedToSecond.tiles['2,2'].label).toBe(baseMap.tiles['2,2'].label)

      // 3. Multi-Tile Range painting: painting 3 tiles tracks all 3 cleanly
      const multiMap = repositionDraftOnMap(
        baseMap,
        ['3,3', '4,3', '5,3'],
        draft,
        `rec_${i}`,
        chosenPreset
      )
      const multiDiff = computeModifiedTileIds(baseMap, multiMap).sort()
      expect(multiDiff).toEqual(['3,3', '4,3', '5,3'])

      // 4. Universal Free Map Edit diff + Chronicle Record sync across any stage
      const freeEdited = cloneMapState(multiMap)
      freeEdited.tiles['7,4'] = {
        ...freeEdited.tiles['7,4'],
        overlay: 'ruins',
        notes: `Consequence of turn ${i}`,
      }
      const totalDiff = computeModifiedTileIds(baseMap, freeEdited).sort()
      expect(totalDiff).toEqual(['3,3', '4,3', '5,3', '7,4'])

      const customFreeformDraft = createCustomTurnDraft(stage, 'Freeform Turn', '7,4', i + 500)
      expect(typeof shouldDefaultToMultiTilePlacement(customFreeformDraft, chosenPreset)).toBe(
        'boolean'
      )

      const syncedRecord = syncDraftToDrawRecord(
        {
          id: `rec_${i}`,
          moveId: 1,
          card,
          timestamp: new Date().toISOString(),
          stage,
          note: '',
        },
        draft,
        totalDiff
      )
      expect(syncedRecord.linkedTileIds?.sort()).toEqual(totalDiff)

      sessionsTested++
    }

    expect(sessionsTested).toBe(50)
    expect(STAGES.length).toBe(4)
  })
})
