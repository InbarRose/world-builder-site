import { beforeEach, describe, expect, it } from 'vitest'
import { createNewWorld } from '../engine/storageService'
import { createDefaultTile } from '../engine/mapEngine'
import {
  CommandEngine,
  createAddEntityCommand,
  createBatchTilePaintCommand,
  createCompositeCommand,
  createDeleteEntityCommand,
  createTilePaintCommand,
  createUpdateEntityCommand,
} from '../engine/commandEngine'
import { MapTile, WorldEntity, WorldState } from '../engine/types'

describe('CommandEngine & Multi-Domain Reversible Transactions', () => {
  let world: WorldState
  let engine: CommandEngine

  beforeEach(() => {
    world = createNewWorld('Aethelgard Test Realm', 'seed-123')
    engine = new CommandEngine(world, 10)
  })

  it('initializes with empty history and correct boundary states', () => {
    expect(engine.canUndo()).toBe(false)
    expect(engine.canRedo()).toBe(false)
    expect(engine.undo()).toBeNull()
    expect(engine.redo()).toBeNull()

    const history = engine.getHistoryState()
    expect(history.undoCount).toBe(0)
    expect(history.redoCount).toBe(0)
    expect(history.lastActionName).toBeNull()
  })

  it('executes and rolls back tile paint commands', () => {
    const coord = '4,5'
    const oldTile: MapTile = createDefaultTile(4, 5, 'plains')
    const newTile: MapTile = {
      ...createDefaultTile(4, 5, 'mountain'),
      relief: 'mountain-snow',
    }

    world.map.tiles[coord] = oldTile
    engine.setState(world)

    const cmd = createTilePaintCommand(coord, oldTile, newTile, 'Glacial Peak Painted')
    const executedState = engine.execute(cmd)

    expect(executedState.map.tiles[coord].terrain).toBe('mountain')
    expect(executedState.map.tiles[coord].relief).toBe('mountain-snow')
    expect(engine.canUndo()).toBe(true)
    expect(engine.canRedo()).toBe(false)
    expect(engine.getHistoryState().lastActionName).toContain('Paint Tile (4,5)')

    // Undo
    const undoneState = engine.undo()
    expect(undoneState).not.toBeNull()
    expect(undoneState!.map.tiles[coord].terrain).toBe('plains')
    expect(undoneState!.map.tiles[coord].relief).toBe('none')
    expect(engine.canUndo()).toBe(false)
    expect(engine.canRedo()).toBe(true)

    // Redo
    const redoneState = engine.redo()
    expect(redoneState).not.toBeNull()
    expect(redoneState!.map.tiles[coord].terrain).toBe('mountain')
    expect(redoneState!.map.tiles[coord].relief).toBe('mountain-snow')
    expect(engine.canUndo()).toBe(true)
    expect(engine.canRedo()).toBe(false)
  })

  it('supports batch continuous drag painting and rollback', () => {
    const changes = [
      {
        coord: '1,1',
        oldTile: createDefaultTile(1, 1, 'ocean'),
        newTile: createDefaultTile(1, 1, 'plains'),
      },
      {
        coord: '1,2',
        oldTile: createDefaultTile(1, 2, 'ocean'),
        newTile: createDefaultTile(1, 2, 'forest'),
      },
    ]

    const batchCmd = createBatchTilePaintCommand(changes, 'Reclaim Coastline')
    engine.execute(batchCmd)

    expect(engine.getState().map.tiles['1,1'].terrain).toBe('plains')
    expect(engine.getState().map.tiles['1,2'].terrain).toBe('forest')

    // Single undo rolls back both tiles simultaneously
    engine.undo()
    expect(engine.getState().map.tiles['1,1'].terrain).toBe('ocean')
    expect(engine.getState().map.tiles['1,2'].terrain).toBe('ocean')
  })

  it('executes and rolls back Codex entity creation, update, and deletion', () => {
    const newEntity: WorldEntity = {
      id: 'ent_elven_clan',
      name: 'Silverleaf Elves',
      category: 'society',
      description: 'Ancient tree dwellers.',
      status: 'active',
      stageCreated: 'primal',
      traits: ['Keen Senses'],
    }

    // 1. Add Entity
    engine.execute(createAddEntityCommand(newEntity))
    expect(engine.getState().entities).toHaveLength(1)
    expect(engine.getState().entities[0].name).toBe('Silverleaf Elves')

    // 2. Update Entity
    const updatedEntity: WorldEntity = {
      ...newEntity,
      name: 'High Silverleaf Dominion',
      traits: ['Keen Senses', 'Star Magic'],
    }
    engine.execute(createUpdateEntityCommand(newEntity, updatedEntity))
    expect(engine.getState().entities[0].name).toBe('High Silverleaf Dominion')
    expect(engine.getState().entities[0].traits).toContain('Star Magic')

    // Undo update
    engine.undo()
    expect(engine.getState().entities[0].name).toBe('Silverleaf Elves')

    // 3. Delete Entity
    engine.execute(createDeleteEntityCommand(newEntity))
    expect(engine.getState().entities).toHaveLength(0)

    // Undo delete restores entity
    engine.undo()
    expect(engine.getState().entities).toHaveLength(1)
    expect(engine.getState().entities[0].name).toBe('Silverleaf Elves')
  })

  it('executes composite multi-domain transactions atomically', () => {
    const tileChange = {
      coord: '3,3',
      oldTile: createDefaultTile(3, 3, 'plains'),
      newTile: { ...createDefaultTile(3, 3, 'volcano'), relief: 'volcano' as const },
    }
    const tileCmd = createTilePaintCommand(tileChange.coord, tileChange.oldTile, tileChange.newTile)

    const mythEntity: WorldEntity = {
      id: 'ent_fire_titan',
      name: 'Ignis the Fire Titan',
      category: 'myth',
      description: 'Slumbering under the volcano.',
      status: 'active',
      stageCreated: 'genesis',
      originTileId: '3,3',
      traits: ['Fire-Wreathed'],
    }
    const entityCmd = createAddEntityCommand(mythEntity)

    // Composite command
    const composite = createCompositeCommand('Erect Volcano & Awaken Titan', 'turn', [tileCmd, entityCmd])
    engine.execute(composite)

    expect(engine.getState().map.tiles['3,3'].terrain).toBe('volcano')
    expect(engine.getState().entities).toHaveLength(1)
    expect(engine.getState().entities[0].name).toBe('Ignis the Fire Titan')

    // Single undo rolls back BOTH the map tile and the codex entity
    engine.undo()
    expect(engine.getState().map.tiles['3,3'].terrain).toBe('plains')
    expect(engine.getState().entities).toHaveLength(0)

    // Redo restores both
    engine.redo()
    expect(engine.getState().map.tiles['3,3'].terrain).toBe('volcano')
    expect(engine.getState().entities).toHaveLength(1)
  })

  it('prunes history when exceeding maximum stack size', () => {
    const smallEngine = new CommandEngine(world, 3)

    for (let i = 1; i <= 5; i++) {
      smallEngine.execute(
        createAddEntityCommand({
          id: `ent_${i}`,
          name: `Faction ${i}`,
          category: 'society',
          description: '',
          status: 'active',
          stageCreated: 'civilization',
          traits: [],
        })
      )
    }

    // Only 3 items kept in undo stack
    expect(smallEngine.getHistoryState().undoCount).toBe(3)
  })

  it('clears redo stack upon executing a fresh command', () => {
    const entity1: WorldEntity = {
      id: 'ent_1',
      name: 'Kingdom of Oakhaven',
      category: 'society',
      description: '',
      status: 'active',
      stageCreated: 'civilization',
      traits: [],
    }
    const entity2: WorldEntity = {
      id: 'ent_2',
      name: 'Dwarven Delving',
      category: 'society',
      description: '',
      status: 'active',
      stageCreated: 'civilization',
      traits: [],
    }

    engine.execute(createAddEntityCommand(entity1))
    engine.undo()
    expect(engine.canRedo()).toBe(true)

    // Executing a new action purges the old branch
    engine.execute(createAddEntityCommand(entity2))
    expect(engine.canRedo()).toBe(false)
    expect(engine.getState().entities[0].name).toBe('Dwarven Delving')
  })
})
