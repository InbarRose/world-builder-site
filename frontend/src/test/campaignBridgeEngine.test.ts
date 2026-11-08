import { describe, it, expect } from 'vitest'
import {
  getRandomCreativeSpark,
  generateCampaignAdventureHooks,
  generateSessionZeroPrimer,
  CREATIVE_SPARKS,
} from '../engine/campaignBridgeEngine'
import { createDefaultTile, createInitialMap } from '../engine/mapEngine'
import { MapState, WorldEntity } from '../engine/types'

describe('campaignBridgeEngine', () => {
  describe('Creative Sparks', () => {
    it('returns evocative guided questions for worldbuilding domains', () => {
      const spark = getRandomCreativeSpark('civilization')
      expect(spark).toBeDefined()
      expect(spark.category).toBe('Civilization & Factions')
      expect(typeof spark.question).toBe('string')
      expect(spark.exampleIdea.length).toBeGreaterThan(10)
    })

    it('falls back to random domain when domain is unknown or empty', () => {
      const spark = getRandomCreativeSpark()
      expect(spark).toBeDefined()
      expect(spark.question).toBeDefined()
    })

    it('covers all 4 primary creative spark categories', () => {
      expect(CREATIVE_SPARKS.geography.length).toBeGreaterThan(0)
      expect(CREATIVE_SPARKS.ecology.length).toBeGreaterThan(0)
      expect(CREATIVE_SPARKS.civilization.length).toBeGreaterThan(0)
      expect(CREATIVE_SPARKS.myth.length).toBeGreaterThan(0)
    })
  })

  describe('Campaign Adventure Hook Synthesis', () => {
    it('generates playable D&D/TTRPG quest hooks based on board features', () => {
      const map = createInitialMap(6, 6)
      map.tiles['2,2'] = {
        ...createDefaultTile(2, 2, 'mountain'),
        overlay: 'ruins',
        label: 'Sunken Citadel of Karas',
      }
      map.tiles['4,1'] = {
        ...createDefaultTile(4, 1, 'plains'),
        overlay: 'settlement',
        label: 'Oakhaven Village',
      }
      map.tiles['3,4'] = {
        ...createDefaultTile(3, 4, 'jungle'),
        overlay: 'myth',
        label: 'The Weeping Crater',
      }

      const entities: WorldEntity[] = [
        {
          id: 'ent-1',
          name: 'The Iron Syndicate',
          category: 'society',
          stageCreated: 'genesis',
          status: 'active',
          color: '#ef4444',
          description: 'A mercenary guild',
          traits: ['Mercantile greed', 'Iron discipline'],
        },
        {
          id: 'ent-2',
          name: 'The Moon Conclave',
          category: 'society',
          stageCreated: 'genesis',
          status: 'active',
          color: '#3b82f6',
          description: 'Lunar druids',
          traits: ['Nature preservation', 'Secret oaths'],
        },
      ]

      const hooks = generateCampaignAdventureHooks(map, entities, [])

      expect(hooks.length).toBeGreaterThanOrEqual(3)

      // Dungeon hook should incorporate Sunken Citadel of Karas
      const dungeonHook = hooks.find((h) => h.category === 'dungeon_crawl')
      expect(dungeonHook).toBeDefined()
      expect(dungeonHook!.location).toContain('Sunken Citadel of Karas')
      expect(dungeonHook!.tavernRumor).toContain('Sunken Citadel of Karas')
      expect(dungeonHook!.suggestedTier).toBe('Tier 1 (Levels 1-4)')

      // Political hook should pit Iron Syndicate against Moon Conclave
      const politicalHook = hooks.find((h) => h.category === 'political_intrigue')
      expect(politicalHook).toBeDefined()
      expect(politicalHook!.title).toContain('Iron Syndicate')
      expect(politicalHook!.title).toContain('Moon Conclave')
      expect(politicalHook!.involvedEntityIds).toContain('ent-1')
      expect(politicalHook!.involvedEntityIds).toContain('ent-2')

      // Wilderness hook should reference Weeping Crater
      const wildernessHook = hooks.find((h) => h.category === 'wilderness_expedition')
      expect(wildernessHook).toBeDefined()
      expect(wildernessHook!.location).toContain('Weeping Crater')
    })

    it('generates fallback quest hooks gracefully for empty or sparse maps', () => {
      const emptyMap: MapState = { width: 4, height: 4, tiles: {} }
      const hooks = generateCampaignAdventureHooks(emptyMap, [], [])

      expect(hooks.length).toBeGreaterThan(0)
      for (const h of hooks) {
        expect(h.title).toBeDefined()
        expect(h.tavernRumor).toBeDefined()
        expect(h.complication).toBeDefined()
      }
    })
  })

  describe('Session Zero Campaign Primer Generation', () => {
    it('generates an executive 1-page campaign handout for tabletop players', () => {
      const map = createInitialMap(6, 6)
      map.tiles['2,2'] = {
        ...createDefaultTile(2, 2, 'plains'),
        overlay: 'capital',
        label: 'Aethelgard High Throne',
      }
      map.tiles['1,1'] = {
        ...createDefaultTile(1, 1, 'mountain'),
        overlay: 'ruins',
        label: 'Drakon Spire',
      }

      const entities: WorldEntity[] = [
        {
          id: 'ent-soc',
          name: 'The Sun League',
          category: 'society',
          stageCreated: 'genesis',
          status: 'active',
          color: '#f59e0b',
          description: 'Solar knights',
          traits: ['Unyielding honor'],
        },
      ]

      const primer = generateSessionZeroPrimer('Valdor', map, entities, [
        { moveId: 1, age: 'Dawn', roll: 'A', details: 'The realm awakens' } as any,
      ])

      expect(primer.worldName).toBe('Valdor')
      expect(primer.pitch).toContain('Valdor')
      expect(primer.startingHub.name).toBe('Aethelgard High Throne')
      expect(primer.startingHub.localRumors).toHaveLength(3)
      expect(primer.knownRegions.length).toBeGreaterThan(0)
      expect(primer.factionsInPlay[0].name).toBe('The Sun League')
      expect(primer.dungeonSites.some((d) => d.name === 'Drakon Spire')).toBe(true)
    })
  })
})
