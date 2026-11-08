import { describe, it, expect } from 'vitest'
import {
  getAllCompendiumItems,
  getCompendiumCategories,
  searchCompendium,
} from '../engine/compendiumEngine'

describe('compendiumEngine - Unified Tabletop Presets & Tropes Inventory', () => {
  it('indexes a massive comprehensive catalog of over 200 items across all categories', () => {
    const items = getAllCompendiumItems()
    expect(items.length).toBeGreaterThanOrEqual(200)
  })

  it('contains all 16 canonical card powers with rich rulebook descriptions and prompts', () => {
    const powers = searchCompendium({ category: 'powers' })
    expect(powers.length).toBe(16)

    for (const p of powers) {
      expect(p.title).toBeTruthy()
      expect(p.stage).toBeTruthy()
      expect(p.suit).toBeTruthy()
      expect(p.summary).toBeTruthy()
      expect(p.description).toBeTruthy()
      expect(p.tabletopPrompt).toBeTruthy()
      expect(p.exampleNarrative).toBeTruthy()
    }
  })

  it('contains whiteboard tropes, action presets, traditions, abilities, ancestries, and myths', () => {
    const tropes = searchCompendium({ category: 'tropes' })
    expect(tropes.length).toBeGreaterThanOrEqual(110)

    const actions = searchCompendium({ category: 'actions' })
    expect(actions.length).toBeGreaterThanOrEqual(90)

    const traditions = searchCompendium({ category: 'traditions' })
    expect(traditions.length).toBeGreaterThanOrEqual(20)

    const abilities = searchCompendium({ category: 'abilities' })
    expect(abilities.length).toBeGreaterThanOrEqual(15)

    const ancestries = searchCompendium({ category: 'ancestries' })
    expect(ancestries.length).toBeGreaterThanOrEqual(10)

    const myths = searchCompendium({ category: 'myths' })
    expect(myths.length).toBeGreaterThanOrEqual(5)
  })

  it('filters compendium items accurately by keyword, stage, and category', () => {
    const elfResults = searchCompendium({ query: 'elf' })
    expect(elfResults.length).toBeGreaterThan(0)
    expect(elfResults.some((item) => item.title.toLowerCase().includes('elf'))).toBe(true)

    const genesisItems = searchCompendium({ stage: 'genesis' })
    expect(genesisItems.length).toBeGreaterThanOrEqual(50)
    expect(genesisItems.every((item) => item.stage === 'genesis')).toBe(true)

    const traditions = searchCompendium({ category: 'traditions', query: 'ancestor' })
    expect(traditions.length).toBeGreaterThanOrEqual(1)
    expect(traditions[0].title).toContain('Ancestor')
  })

  it('provides category breakdown counts matching the inventory', () => {
    const categories = getCompendiumCategories()
    expect(categories.length).toBe(9)

    const allCat = categories.find((c) => c.id === 'all')!
    expect(allCat).toBeDefined()
    expect(allCat.count).toBeGreaterThanOrEqual(200)

    const tropesCat = categories.find((c) => c.id === 'tropes')!
    expect(tropesCat.count).toBeGreaterThanOrEqual(110)
  })
})
