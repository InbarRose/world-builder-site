import { describe, it, expect } from 'vitest'
import {
  generateFeatureName,
  generateEntityName,
  generateLedgerProse,
} from '../engine/flavorNameEngine'
import { STAGE_ACTION_PRESETS } from '../engine/presets'

describe('flavorNameEngine - Combinatorial Names & Ledger Chronicles', () => {
  it('generates evocative names for geographic features', () => {
    const mountainName = generateFeatureName('mountain', 'single-peak', 42)
    expect(mountainName).toBeTruthy()
    expect(typeof mountainName).toBe('string')

    const canyonName = generateFeatureName('canyon', 'gorge', 99)
    expect(['Gorge', 'Chasm', 'Rift', 'Abyss', 'Ravine', 'Sunder', 'Cenote', 'Cleft', 'Flume', 'Pass'].some(s => canyonName.includes(s))).toBe(true)

    const forestName = generateFeatureName('forest', 'taiga', 105)
    expect(forestName).toBeTruthy()

    const waterName = generateFeatureName('river', 'meander', 77)
    expect(waterName).toBeTruthy()
  })

  it('generates distinct names across different seeds deterministically', () => {
    const nameA = generateFeatureName('mountain', 'peak', 'seed-alpha')
    const nameB = generateFeatureName('mountain', 'peak', 'seed-alpha')
    const nameC = generateFeatureName('mountain', 'peak', 'seed-beta')

    expect(nameA).toBe(nameB)
    expect(nameA).not.toBe(nameC)
  })

  it('generates evocative names for species, societies, characters, and myths', () => {
    const species = generateEntityName('species', 'warrior', 12)
    expect(species).toBeTruthy()

    const society = generateEntityName('society', 'imperial', 45)
    expect(society).toContain('of')

    const character = generateEntityName('character', 'leader', 88)
    expect(character).toContain('the')

    const myth = generateEntityName('myth', 'dragon', 101)
    expect(myth).toContain('The Legend of')
  })

  it('generates rich ledger chronicle prose integrating preset, feature name, and coordinates', () => {
    const preset = STAGE_ACTION_PRESETS.find((p) => p.id === 'pri_settle_village')!
    expect(preset).toBeDefined()

    const prose = generateLedgerProse(preset, 'Oakhaven', 'Sun-Seekers', '4,7')
    expect(prose).toContain('[Oakhaven at coordinates (4,7)]')
    expect(prose).toContain('Sun-Seekers')
  })
})
