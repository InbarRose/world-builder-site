import { describe, it, expect } from 'vitest'
import {
  MAX_ROLLING_TURN_SNAPSHOTS,
  appendCappedTurnSnapshot,
  createNewWorld,
  migrateWorldState,
  parseImportedWorld,
  recordTurnSnapshot,
  serializeWorld,
  serializeWorldForExport,
} from '../engine/storageService'
import { CURRENT_SCHEMA_VERSION } from '../engine/types'

describe('Phase 65: Schema Migration Resilience & Storage Fuzz Suite (ADR-069)', () => {
  it('migrates minimal legacy v1/v2 world JSON payloads safely without data loss', () => {
    const legacyV1 = {
      name: 'Ancient V1 Realm',
      currentStage: 'primal',
      drawHistory: [
        {
          card: { suit: '♠', value: '7' },
          note: 'First mountain raised',
        },
        {
          moveId: 2,
          card: { suit: '♥', value: 'K' },
          note: 'Great river carved',
          linkedTileIds: ['5,5'],
        },
      ],
      map: {
        width: 10,
        height: 6,
        tiles: {
          '5,5': { terrain: 'mountain', label: 'Iron Peak' },
        },
      },
    }

    const migrated = migrateWorldState(legacyV1)
    expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect(migrated.name).toBe('Ancient V1 Realm')
    expect(migrated.currentStage).toBe('primal')
    expect(migrated.drawHistory.length).toBe(2)
    expect(migrated.drawHistory[0].moveId).toBe(1)
    expect(migrated.drawHistory[1].linkedTileIds).toEqual(['5,5'])
    // All 60 tiles in 10x6 grid are normalized with safe arrays
    expect(Object.keys(migrated.map.tiles).length).toBe(60)
    expect(migrated.map.tiles['5,5'].label).toBe('Iron Peak')
    expect(Array.isArray(migrated.map.tiles['5,5'].slots)).toBe(true)
    expect(Array.isArray(migrated.map.tiles['0,0'].tags)).toBe(true)
    expect(migrated.players.length).toBeGreaterThan(0)
    expect(migrated.generationSettings).toBeDefined()
  })

  it('rejects malformed, truncated, and non-object JSON payloads cleanly with deterministic errors', () => {
    const badPayloads = ['', '{truncated', 'null', '[]', '42', '"just-a-string"', 'true']
    for (const raw of badPayloads) {
      expect(() => parseImportedWorld(raw)).toThrow()
    }
  })

  it('caps rolling in-memory turn snapshots strictly at MAX_ROLLING_TURN_SNAPSHOTS and strips snapshots on export', () => {
    const world = createNewWorld('Snapshot Cap Test', 'snap-cap-seed')
    let snapshots = world.snapshots || []

    for (let moveId = 1; moveId <= 50; moveId++) {
      const snap = recordTurnSnapshot(world, moveId)
      snapshots = appendCappedTurnSnapshot(snapshots, snap)
      expect(snapshots.length).toBeLessThanOrEqual(MAX_ROLLING_TURN_SNAPSHOTS)
    }

    expect(snapshots.length).toBe(MAX_ROLLING_TURN_SNAPSHOTS)
    expect(snapshots[0].moveId).toBe(50 - MAX_ROLLING_TURN_SNAPSHOTS + 1)
    expect(snapshots[snapshots.length - 1].moveId).toBe(50)

    const worldWithSnaps = { ...world, snapshots }
    const exportedA = parseImportedWorld(serializeWorld(worldWithSnaps))
    const exportedB = parseImportedWorld(serializeWorldForExport(worldWithSnaps, false))
    expect(exportedA.snapshots?.length ?? 0).toBe(0)
    expect(exportedB.snapshots?.length ?? 0).toBe(0)
    expect(exportedA.name).toBe('Snapshot Cap Test')
  })
})
