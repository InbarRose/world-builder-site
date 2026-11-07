import { beforeEach, describe, expect, it } from 'vitest'
import { createNewWorld } from '../engine/storageService'
import {
  deleteWorldAsync,
  getWorldAsync,
  listWorldsAsync,
  migrateLocalStorageToIndexedDb,
  saveWorldAsync,
} from '../engine/storageIndexedDb'

describe('storageIndexedDb & Resilient Storage Adapter', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves and retrieves worlds with fallback and schema migration', async () => {
    const world = createNewWorld('Aethelgard High Realm', 'seed-idb-1')
    world.drawHistory.push({
      id: 'move_1',
      moveId: 1,
      card: { suit: '♠', value: 'K', id: '♠-K' },
      timestamp: new Date().toISOString(),
      stage: 'genesis',
      power: 'Granite Mountain Range',
      note: 'The high peaks arose.',
      linkedTileIds: ['2,3'],
      linkedEntityIds: [],
    })

    const saved = await saveWorldAsync(world)
    expect(saved.id).toBe(world.id)
    expect(saved.name).toBe('Aethelgard High Realm')

    const retrieved = await getWorldAsync(world.id)
    expect(retrieved).not.toBeNull()
    expect(retrieved?.id).toBe(world.id)
    expect(retrieved?.name).toBe('Aethelgard High Realm')
    expect(retrieved?.drawHistory).toHaveLength(1)
  })

  it('lists saved worlds accurately', async () => {
    const w1 = createNewWorld('Valenreach', 'seed-1')
    const w2 = createNewWorld('Frostfell', 'seed-2')

    await saveWorldAsync(w1)
    await saveWorldAsync(w2)

    const worlds = await listWorldsAsync()
    expect(worlds.length).toBeGreaterThanOrEqual(2)
    const names = worlds.map((w) => w.name)
    expect(names).toContain('Valenreach')
    expect(names).toContain('Frostfell')
  })

  it('deletes worlds safely', async () => {
    const w = createNewWorld('Sunken Isles', 'seed-delete')
    await saveWorldAsync(w)

    let found = await getWorldAsync(w.id)
    expect(found).not.toBeNull()

    await deleteWorldAsync(w.id)
    found = await getWorldAsync(w.id)
    expect(found).toBeNull()
  })

  it('migrates legacy localStorage items into storage adapter', async () => {
    const legacy = createNewWorld('Legacy Realm', 'seed-legacy')
    localStorage.setItem('wb_saved_worlds_v1', JSON.stringify([legacy]))

    const count = await migrateLocalStorageToIndexedDb()
    expect(count).toBeGreaterThanOrEqual(1)

    const retrieved = await getWorldAsync(legacy.id)
    expect(retrieved?.name).toBe('Legacy Realm')
  })
})
