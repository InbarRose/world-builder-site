import { describe, it, expect, beforeEach } from 'vitest'
import {
  computeCheckpointDiff,
  createWorldCheckpoint,
  restoreWorldFromCheckpoint,
  listWorldCheckpoints,
  saveWorldCheckpoint,
  deleteWorldCheckpoint,
  exportCheckpointAsJson,
  getCheckpointTriggerBadge,
} from '../engine/snapshotVaultEngine'
import { WorldState } from '../engine/types'
import { createDefaultTile } from '../engine/mapEngine'

function createMockWorld(name = 'Aethelgard'): WorldState {
  return {
    schemaVersion: 2,
    id: 'world-vault-test-1',
    name,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    currentStage: 'genesis',
    stageNotes: {},
    drawHistory: [],
    deckConfig: {
      numberRange: [2, 10],
      faceCards: { J: true, Q: true, K: true },
      aceCount: 4,
      jokerCount: 2,
      stagesEnabled: true,
      selectedStage: 'genesis',
    },
    generationSettings: {
      seed: 'test-seed',
      geographyPreset: 'continent',
      fantasyLevel: 'medium',
      disasterIntensity: 'standard',
    },
    map: {
      width: 4,
      height: 4,
      tiles: {
        '0,0': createDefaultTile(0, 0),
        '0,1': {
          ...createDefaultTile(0, 1),
          terrain: 'water',
          domain: 'water',
        },
      },
    },
    entities: [],
    players: [],
    currentPlayerIndex: 0,
    companionMode: 'full-studio',
  }
}

describe('snapshotVaultEngine', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('computes differential summary between world states', () => {
    const base = createMockWorld()
    const diffInitial = computeCheckpointDiff(base, null)
    expect(diffInitial.tilesChanged).toBe(0)
    expect(diffInitial.entitiesAdded).toBe(0)

    const next = createMockWorld()
    next.map.tiles['0,0'] = {
      ...next.map.tiles['0,0'],
      terrain: 'mountain',
      label: 'Dragon Spine',
      slots: [
        {
          id: 's1',
          category: 'elevation',
          type: 'mountain',
          name: 'Dragon Spine',
          icon: '🏔️',
          priority: 80,
        },
      ],
    }
    next.entities.push({
      id: 'ent_1',
      name: 'High Elves',
      category: 'species',
      stageCreated: 'genesis',
      description: 'Ancient immortals',
      traits: ['wise'],
      status: 'active',
    })
    next.drawHistory.push({
      id: 'rec_1',
      moveId: 1,
      card: { suit: '♠', value: '7', id: 'spades-7' },
      stage: 'genesis',
      timestamp: '2026-01-01T01:00:00Z',
      actionTitle: 'Spire Formed',
      power: 'Shape Mountain',
      note: 'The mountain rose.',
    })

    const diff = computeCheckpointDiff(next, base)
    expect(diff.tilesChanged).toBe(1)
    expect(diff.entitiesAdded).toBe(1)
    expect(diff.newEntities).toEqual(['High Elves'])
    expect(diff.turnsDelta).toBe(1)
  })

  it('creates and restores a WorldCheckpoint with non-destructive cloning', () => {
    const world = createMockWorld('Eldoria Prime')
    const checkpoint = createWorldCheckpoint(
      world,
      'The Dawn Age',
      'Initial baseline prior to First Turn',
      'era_transition'
    )

    expect(checkpoint.title).toBe('The Dawn Age')
    expect(checkpoint.triggerType).toBe('era_transition')
    expect(checkpoint.stage).toBe('genesis')
    expect(checkpoint.worldSnapshot.name).toBe('Eldoria Prime')

    // Mutate original world to test non-destructive decoupling
    world.name = 'Ruined Eldoria'
    expect(checkpoint.worldSnapshot.name).toBe('Eldoria Prime')

    // Restore from checkpoint
    const restored = restoreWorldFromCheckpoint(checkpoint)
    expect(restored.name).toBe('Eldoria Prime')
    expect(restored.updatedAt).not.toBe('2026-01-01T00:00:00.000Z')
  })

  it('persists, lists, prunes, and deletes checkpoints from browser storage', () => {
    const world = createMockWorld()
    expect(listWorldCheckpoints(world.id)).toHaveLength(0)

    const chk1 = createWorldCheckpoint(world, 'Checkpoint #1', '', 'manual')
    saveWorldCheckpoint(chk1)

    const list1 = listWorldCheckpoints(world.id)
    expect(list1).toHaveLength(1)
    expect(list1[0].id).toBe(chk1.id)

    const chk2 = createWorldCheckpoint(world, 'Cataclysm 1', '', 'cataclysm')
    saveWorldCheckpoint(chk2)
    const list2 = listWorldCheckpoints(world.id)
    expect(list2).toHaveLength(2)

    deleteWorldCheckpoint(world.id, chk1.id)
    const list3 = listWorldCheckpoints(world.id)
    expect(list3).toHaveLength(1)
    expect(list3[0].id).toBe(chk2.id)
  })

  it('exports checkpoint JSON with valid schema and metadata', () => {
    const world = createMockWorld()
    const chk = createWorldCheckpoint(
      world,
      'Cataclysmic Flood',
      'The seas engulfed the east.',
      'cataclysm'
    )
    const jsonStr = exportCheckpointAsJson(chk)
    const parsed = JSON.parse(jsonStr)

    expect(parsed.schema).toBe('world-builder-checkpoint-v1')
    expect(parsed.checkpointId).toBe(chk.id)
    expect(parsed.title).toBe('Cataclysmic Flood')
    expect(parsed.triggerType).toBe('cataclysm')
    expect(parsed.worldState.name).toBe('Aethelgard')
  })

  it('provides appropriate UI badges for all trigger types', () => {
    expect(getCheckpointTriggerBadge('manual').label).toBe('Manual Checkpoint')
    expect(getCheckpointTriggerBadge('era_transition').label).toBe('Era Transition')
    expect(getCheckpointTriggerBadge('cataclysm').label).toBe('Cataclysm Event')
    expect(getCheckpointTriggerBadge('auto_interval').label).toBe('Auto Milestone')
  })
})
