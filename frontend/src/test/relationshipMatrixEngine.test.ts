import { describe, it, expect } from 'vitest'
import {
  buildRelationshipMatrix,
  cyclePairRelationship,
  getPairRelationship,
  setPairRelationship,
} from '../engine/relationshipMatrixEngine'
import { WorldEntity } from '../engine/types'

const SAMPLE_ENTITIES: WorldEntity[] = [
  {
    id: 'ent_1',
    name: 'Sylvan Elves',
    category: 'species',
    stageCreated: 'primal',
    description: 'Ancient forest dwellers',
    traits: ['Archery'],
    status: 'Flourishing',
    icon: '🧝',
    diplomaticLinks: [],
  },
  {
    id: 'ent_2',
    name: 'Ironbound Clan',
    category: 'society',
    stageCreated: 'civilization',
    description: 'Deep mountain smiths',
    traits: ['Metallurgy'],
    status: 'Active',
    icon: '⛏️',
    diplomaticLinks: [],
  },
  {
    id: 'ent_3',
    name: 'Obsidian Cabal',
    category: 'myth',
    stageCreated: 'intrigue',
    description: 'Shadowy conspirators',
    traits: ['Secrecy'],
    status: 'Active',
    icon: '🐉',
    diplomaticLinks: [],
  },
]

describe('Phase 25: Interactive Codex Relationship Matrix Engine (relationshipMatrixEngine)', () => {
  it('sets and deduplicates symmetric relationships between two entities and clears on none', () => {
    const withAlliance = setPairRelationship(
      SAMPLE_ENTITIES,
      'ent_1',
      'ent_2',
      'alliance',
      'Pact of Silver & Iron'
    )

    const cell12 = getPairRelationship(withAlliance, 'ent_1', 'ent_2')
    const cell21 = getPairRelationship(withAlliance, 'ent_2', 'ent_1')
    expect(cell12.type).toBe('alliance')
    expect(cell12.label).toBe('Pact of Silver & Iron')
    expect(cell12.tone).toBe('alliance')
    expect(cell21.type).toBe('alliance')

    // Updating the same pair to war replaces the previous link without duplicating
    const withWar = setPairRelationship(withAlliance, 'ent_1', 'ent_2', 'war')
    const ent1Links = withWar.find((e) => e.id === 'ent_1')?.diplomaticLinks || []
    expect(ent1Links.length).toBe(1)
    expect(ent1Links[0].type).toBe('war')
    expect(getPairRelationship(withWar, 'ent_1', 'ent_2').tone).toBe('conflict')

    // Clearing with 'none' removes links from both sides
    const cleared = setPairRelationship(withWar, 'ent_1', 'ent_2', 'none')
    expect(getPairRelationship(cleared, 'ent_1', 'ent_2').type).toBe('none')
  })

  it('cycles relationships deterministically and builds an N x N matrix', () => {
    const step1 = cyclePairRelationship(SAMPLE_ENTITIES, 'ent_1', 'ent_3')
    expect(getPairRelationship(step1, 'ent_1', 'ent_3').type).toBe('alliance')

    const step2 = cyclePairRelationship(step1, 'ent_1', 'ent_3')
    expect(getPairRelationship(step2, 'ent_1', 'ent_3').type).toBe('trade_pact')

    const matrix = buildRelationshipMatrix(step2)
    expect(matrix.length).toBe(3)
    expect(matrix[0].length).toBe(3)
    expect(matrix[0][0].label).toBe('Self')
    expect(matrix[0][2].type).toBe('trade_pact')
  })
})
