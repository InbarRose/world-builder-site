import { describe, it, expect } from 'vitest'
import {
  evaluatePresetAffinity,
  getPresetConceptGroup,
  inferPresetTags,
  recommendBestPreset,
  sampleWeightedPreset,
} from '../engine/affinityEngine'
import { STAGE_ACTION_PRESETS } from '../engine/presets'
import { createNewWorld } from '../engine/storageService'
import { PlayerSeat } from '../engine/types'

describe('affinityEngine - Preset Metadata, Affinities, and Weighted Bot Selection', () => {
  it('correctly categorizes presets into studio concept groups', () => {
    const settle = STAGE_ACTION_PRESETS.find((p) => p.id === 'pri_settle_village')!
    expect(getPresetConceptGroup(settle)).toBe('habitations')

    const peak = STAGE_ACTION_PRESETS.find((p) => p.id.includes('mountain'))!
    expect(getPresetConceptGroup(peak)).toBe('geography')

    const trad = STAGE_ACTION_PRESETS.find((p) => p.id === 'pri_trad_solar')!
    expect(getPresetConceptGroup(trad)).toBe('traditions')

    const war = STAGE_ACTION_PRESETS.find((p) => p.id === 'int_conf_war')!
    expect(getPresetConceptGroup(war)).toBe('intrigue')
  })

  it('infers accurate semantic tags from preset properties', () => {
    const port = STAGE_ACTION_PRESETS.find((p) => p.id === 'civ_const_port')!
    const portTags = inferPresetTags(port)
    expect(portTags).toContain('maritime')
    expect(portTags).toContain('water')

    const siege = STAGE_ACTION_PRESETS.find((p) => p.id === 'int_conf_siege')!
    const siegeTags = inferPresetTags(siege)
    expect(siegeTags).toContain('martial')
  })

  it('boosts affinity score when world history aligns with preset tags', () => {
    const world = createNewWorld('Test World')
    // Add a prior maritime move to world history
    world.drawHistory.push({
      id: 'd1',
      moveId: 1,
      card: { id: 'c1', suit: '♠', value: '7' },
      timestamp: new Date().toISOString(),
      actionTitle: 'Coastal Port Settlement',
      note: 'Built a deepwater port and coastal stilt village',
    })

    const portPreset = STAGE_ACTION_PRESETS.find((p) => p.id === 'civ_const_port')!
    const castlePreset = STAGE_ACTION_PRESETS.find((p) => p.id === 'civ_const_castle')!

    const evalPort = evaluatePresetAffinity(portPreset, world)
    const evalCastle = evaluatePresetAffinity(castlePreset, world)

    expect(evalPort.totalScore).toBeGreaterThan(evalCastle.totalScore)
    expect(evalPort.factors.some((f) => f.label.includes('MARITIME'))).toBe(true)
  })

  it('penalizes maritime presets on arid desert tiles (anti-affinity)', () => {
    const world = createNewWorld('Test World')
    world.map.tiles['2,2'] = {
      ...world.map.tiles['2,2'],
      terrain: 'desert',
    }

    const portPreset = STAGE_ACTION_PRESETS.find((p) => p.id === 'civ_const_port')!
    const evalDesert = evaluatePresetAffinity(portPreset, world, undefined, '2,2')

    expect(evalDesert.factors.some((f) => f.label.includes('Anti-Affinity'))).toBe(true)
  })

  it('respects bot personality and custom weights in evaluation', () => {
    const world = createNewWorld('Test World')
    const warriorBot: PlayerSeat = {
      id: 'p1',
      name: 'Warlord Bot',
      color: '#ef4444',
      isBot: true,
      role: 'Player',
      personality: 'catalyst',
      customWeights: {
        geography: 20,
        ecology: 20,
        civilization: 40,
        diplomacy: 10,
        conflict: 95,
        myth: 40,
      },
    }

    const warPreset = STAGE_ACTION_PRESETS.find((p) => p.id === 'int_conf_war')!
    const evalWar = evaluatePresetAffinity(warPreset, world, warriorBot)

    expect(evalWar.factors.some((f) => f.label.includes('Conflict Preference'))).toBe(true)
    expect(evalWar.totalScore).toBeGreaterThan(50)
  })

  it('selects the recommended best preset and samples weighted candidates', () => {
    const world = createNewWorld('Test World')
    const candidates = STAGE_ACTION_PRESETS.filter((p) => p.stage === 'civilization')

    const rec = recommendBestPreset(candidates, world)
    expect(rec).not.toBeNull()
    expect(rec?.preset).toBeDefined()
    expect(rec?.evaluation.totalScore).toBeGreaterThanOrEqual(5)

    const sampled = sampleWeightedPreset(candidates, world, undefined, undefined, () => 0.5)
    expect(sampled).toBeDefined()
  })
})
