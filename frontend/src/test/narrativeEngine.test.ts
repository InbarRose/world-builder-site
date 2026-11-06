import { describe, expect, it } from 'vitest'
import { createNewWorld } from '../engine/storageService'
import {
  classifyEventSignificance,
  computeEntityAchievements,
  getEntityDiplomaticRelations,
  synthesizeRealmSaga,
  computeWorldStabilityIndex,
  buildEntityLineageTree,
} from '../engine/narrativeEngine'

describe('narrativeEngine', () => {
  it('classifies event significance accurately based on power, title, and note', () => {
    expect(
      classifyEventSignificance({
        id: '1',
        moveId: 1,
        card: { suit: '♠', value: 'A', id: '♠-A' },
        timestamp: '',
        power: 'Volcanic Cataclysm',
        note: 'The ground split in a furious eruption.',
      })
    ).toBe('cataclysm')

    expect(
      classifyEventSignificance({
        id: '2',
        moveId: 2,
        card: { suit: '♥', value: 'K', id: '♥-K' },
        timestamp: '',
        power: 'Royal Treaty',
        note: 'The two kingdoms signed an alliance of peace.',
      })
    ).toBe('diplomacy')

    expect(
      classifyEventSignificance({
        id: '3',
        moveId: 3,
        card: { suit: '♣', value: '10', id: '♣-10' },
        timestamp: '',
        power: 'Great Settlement',
        note: 'A coastal village was founded.',
      })
    ).toBe('expansion')

    expect(
      classifyEventSignificance({
        id: '4',
        moveId: 4,
        card: { suit: '♦', value: 'J', id: '♦-J' },
        timestamp: '',
        power: 'Border Skirmish',
        note: 'War erupted across the western pass.',
      })
    ).toBe('conflict')
  })

  it('computes entity achievements and diplomatic relations', () => {
    const world = createNewWorld('Sovereignty')
    world.entities = [
      {
        id: 'ent_highborne',
        name: 'Highborne Elves',
        category: 'society',
        stageCreated: 'genesis',
        description: 'First dwellers.',
        traits: ['Ancient'],
        status: 'active',
        diplomaticLinks: [
          {
            id: 'link_1',
            targetEntityId: 'ent_dwarves',
            targetEntityName: 'Ironhold Dwarves',
            type: 'trade_pact',
            label: 'The Obsidian Accord',
            icon: '💎',
          },
        ],
      },
      {
        id: 'ent_dwarves',
        name: 'Ironhold Dwarves',
        category: 'society',
        stageCreated: 'genesis',
        description: 'Mountain miners.',
        traits: ['Industrious'],
        status: 'active',
      },
    ]

    world.drawHistory = [
      {
        id: 'd1',
        moveId: 1,
        card: { suit: '♠', value: '5', id: '♠-5' },
        timestamp: '',
        stage: 'civilization',
        power: 'Alliance Treaty',
        note: 'Signed peace treaty',
        linkedEntityIds: ['ent_highborne'],
      },
    ]

    const feats = computeEntityAchievements(world)
    expect(feats['ent_highborne']).toBeDefined()
    expect(feats['ent_highborne'].some((f) => f.title === 'Treaty Forger')).toBe(true)

    const relations = getEntityDiplomaticRelations(world.entities[0], world.entities)
    expect(relations).toHaveLength(1)
    expect(relations[0].targetName).toBe('Ironhold Dwarves')
    expect(relations[0].harmonyScore).toBeGreaterThan(0)
  })

  it('synthesizes a complete 4-chapter saga from world history', () => {
    const world = createNewWorld('Chronicle of Ages', 'seed-saga-77')
    world.entities.push({
      id: 'ent_celestial',
      name: 'Sky Weavers',
      category: 'species',
      stageCreated: 'genesis',
      description: 'Loom makers of the dawn sky.',
      status: 'active',
      traits: ['Winged'],
    })

    world.drawHistory = [
      {
        id: 'rec_1',
        moveId: 1,
        card: { suit: '♠', value: 'A', id: '♠-A' },
        timestamp: new Date().toISOString(),
        stage: 'genesis',
        power: 'World Shaping',
        note: 'The first continents rose from the azure depths.',
        epochYear: 'Year 10',
        linkedEntityIds: ['ent_celestial'],
      },
      {
        id: 'rec_2',
        moveId: 2,
        card: { suit: '♥', value: 'K', id: '♥-K' },
        timestamp: new Date().toISOString(),
        stage: 'civilization',
        power: 'Royal Treaty',
        note: 'Great trade alliances united the kingdoms.',
        epochYear: 'Year 350',
        linkedEntityIds: ['ent_celestial'],
      },
    ]

    const saga = synthesizeRealmSaga(world)
    expect(saga.realmName).toBe('Chronicle of Ages')
    expect(saga.totalTurns).toBe(2)
    expect(saga.chapters).toHaveLength(4) // 4 canonical stages
    expect(saga.chapters[0].stageId).toBe('genesis')
    expect(saga.chapters[0].events).toHaveLength(1)
    expect(saga.chapters[2].stageId).toBe('civilization')
    expect(saga.chapters[2].events).toHaveLength(1)
    expect(saga.overallSummary).toContain('2 recorded events')
  })

  it('computes world stability index and lineage trees', () => {
    const world = createNewWorld('Chronicle of Eldoria')
    world.entities = [
      {
        id: 'ent_empire',
        name: 'First Empire',
        category: 'society',
        stageCreated: 'genesis',
        description: 'The founding realm.',
        traits: ['Ancient'],
        status: 'active',
        diplomaticLinks: [
          {
            id: 'l1',
            targetEntityId: 'ent_colony',
            targetEntityName: 'Southern Colony',
            type: 'alliance',
            label: 'Grand Alliance',
            icon: '🤝',
          },
        ],
      },
      {
        id: 'ent_colony',
        name: 'Southern Colony',
        parentEntityId: 'ent_empire',
        category: 'society',
        stageCreated: 'primal',
        description: 'Breakaway colony.',
        traits: ['Pioneers'],
        status: 'active',
      },
    ]

    // Lineage Tree
    const tree = buildEntityLineageTree('ent_colony', world.entities)
    expect(tree.parents.length).toBe(1)
    expect(tree.parents[0].id).toBe('ent_empire')

    const parentTree = buildEntityLineageTree('ent_empire', world.entities)
    expect(parentTree.descendants.length).toBe(1)
    expect(parentTree.descendants[0].id).toBe('ent_colony')

    // Stability Index
    const stability = computeWorldStabilityIndex(world)
    expect(stability.score).toBeGreaterThan(50)
    expect(['Golden Age', 'Pax & Stability']).toContain(stability.status)
  })
})
