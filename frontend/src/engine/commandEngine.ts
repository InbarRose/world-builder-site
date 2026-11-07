import { WorldEntity, MapTile, WorldState } from './types'

export interface CommandMetadata {
  id: string
  name: string
  category: 'map' | 'codex' | 'turn' | 'config'
  timestamp: number
  description: string
}

export interface Command {
  metadata: CommandMetadata
  execute: (state: WorldState) => WorldState
  undo: (state: WorldState) => WorldState
}

export interface CommandHistoryState {
  canUndo: boolean
  canRedo: boolean
  undoCount: number
  redoCount: number
  lastActionName: string | null
  nextRedoActionName: string | null
}

export class CommandEngine {
  private undoStack: Command[] = []
  private redoStack: Command[] = []
  private maxHistorySize: number
  private currentState: WorldState

  constructor(initialState: WorldState, maxHistorySize = 50) {
    this.currentState = initialState
    this.maxHistorySize = maxHistorySize
  }

  public getState(): WorldState {
    return this.currentState
  }

  public setState(state: WorldState): void {
    this.currentState = state
  }

  public execute(command: Command): WorldState {
    const nextState = command.execute(this.currentState)
    this.currentState = nextState
    this.undoStack.push(command)
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift()
    }
    // Any new action clears the redo stack
    this.redoStack = []
    return this.currentState
  }

  public undo(): WorldState | null {
    if (this.undoStack.length === 0) return null
    const command = this.undoStack.pop()!
    const revertedState = command.undo(this.currentState)
    this.currentState = revertedState
    this.redoStack.push(command)
    return this.currentState
  }

  public redo(): WorldState | null {
    if (this.redoStack.length === 0) return null
    const command = this.redoStack.pop()!
    const reappliedState = command.execute(this.currentState)
    this.currentState = reappliedState
    this.undoStack.push(command)
    return this.currentState
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0
  }

  public clear(): void {
    this.undoStack = []
    this.redoStack = []
  }

  public getHistoryState(): CommandHistoryState {
    const lastUndo = this.undoStack[this.undoStack.length - 1]
    const nextRedo = this.redoStack[this.redoStack.length - 1]
    return {
      canUndo: this.undoStack.length > 0,
      canRedo: this.redoStack.length > 0,
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
      lastActionName: lastUndo ? lastUndo.metadata.name : null,
      nextRedoActionName: nextRedo ? nextRedo.metadata.name : null,
    }
  }
}

// ==========================================
// Command Factory Helpers for Common Actions
// ==========================================

let commandCounter = 0
function generateCommandId(prefix: string): string {
  commandCounter += 1
  return `${prefix}_${Date.now()}_${commandCounter}`
}

/**
 * Creates a reversible command for painting a single map tile.
 */
export function createTilePaintCommand(
  coord: string,
  oldTile: MapTile,
  newTile: MapTile,
  actionDescription?: string
): Command {
  return {
    metadata: {
      id: generateCommandId('tile_paint'),
      name: `Paint Tile (${coord})`,
      category: 'map',
      timestamp: Date.now(),
      description: actionDescription || `Painted tile at ${coord}`,
    },
    execute: (world: WorldState): WorldState => ({
      ...world,
      updatedAt: new Date().toISOString(),
      map: {
        ...world.map,
        tiles: {
          ...world.map.tiles,
          [coord]: { ...newTile },
        },
      },
    }),
    undo: (world: WorldState): WorldState => ({
      ...world,
      updatedAt: new Date().toISOString(),
      map: {
        ...world.map,
        tiles: {
          ...world.map.tiles,
          [coord]: { ...oldTile },
        },
      },
    }),
  }
}

/**
 * Creates a reversible composite command for continuous drag strokes or batch area fills.
 */
export function createBatchTilePaintCommand(
  changes: Array<{ coord: string; oldTile: MapTile; newTile: MapTile }>,
  batchName = 'Batch Terrain Paint'
): Command {
  return {
    metadata: {
      id: generateCommandId('batch_tile_paint'),
      name: batchName,
      category: 'map',
      timestamp: Date.now(),
      description: `Modified ${changes.length} map tile(s)`,
    },
    execute: (world: WorldState): WorldState => {
      const updatedTiles = { ...world.map.tiles }
      for (const change of changes) {
        updatedTiles[change.coord] = { ...change.newTile }
      }
      return {
        ...world,
        updatedAt: new Date().toISOString(),
        map: {
          ...world.map,
          tiles: updatedTiles,
        },
      }
    },
    undo: (world: WorldState): WorldState => {
      const restoredTiles = { ...world.map.tiles }
      for (const change of changes) {
        restoredTiles[change.coord] = { ...change.oldTile }
      }
      return {
        ...world,
        updatedAt: new Date().toISOString(),
        map: {
          ...world.map,
          tiles: restoredTiles,
        },
      }
    },
  }
}

/**
 * Creates a reversible command for registering a new species, society, or mythic entity in the Codex.
 */
export function createAddEntityCommand(entity: WorldEntity): Command {
  return {
    metadata: {
      id: generateCommandId('add_entity'),
      name: `Add ${entity.category}: ${entity.name}`,
      category: 'codex',
      timestamp: Date.now(),
      description: `Registered ${entity.category} '${entity.name}' in World Codex`,
    },
    execute: (world: WorldState): WorldState => ({
      ...world,
      updatedAt: new Date().toISOString(),
      entities: [...world.entities.filter((e) => e.id !== entity.id), { ...entity }],
    }),
    undo: (world: WorldState): WorldState => ({
      ...world,
      updatedAt: new Date().toISOString(),
      entities: world.entities.filter((e) => e.id !== entity.id),
    }),
  }
}

/**
 * Creates a reversible command for modifying an existing entity.
 */
export function createUpdateEntityCommand(oldEntity: WorldEntity, updatedEntity: WorldEntity): Command {
  return {
    metadata: {
      id: generateCommandId('update_entity'),
      name: `Update ${updatedEntity.name}`,
      category: 'codex',
      timestamp: Date.now(),
      description: `Modified traits or details for '${updatedEntity.name}'`,
    },
    execute: (world: WorldState): WorldState => ({
      ...world,
      updatedAt: new Date().toISOString(),
      entities: world.entities.map((e) => (e.id === updatedEntity.id ? { ...updatedEntity } : e)),
    }),
    undo: (world: WorldState): WorldState => ({
      ...world,
      updatedAt: new Date().toISOString(),
      entities: world.entities.map((e) => (e.id === oldEntity.id ? { ...oldEntity } : e)),
    }),
  }
}

/**
 * Creates a reversible command for deleting an entity.
 */
export function createDeleteEntityCommand(entity: WorldEntity): Command {
  return {
    metadata: {
      id: generateCommandId('delete_entity'),
      name: `Delete ${entity.name}`,
      category: 'codex',
      timestamp: Date.now(),
      description: `Removed '${entity.name}' from Codex`,
    },
    execute: (world: WorldState): WorldState => ({
      ...world,
      updatedAt: new Date().toISOString(),
      entities: world.entities.filter((e) => e.id !== entity.id),
    }),
    undo: (world: WorldState): WorldState => ({
      ...world,
      updatedAt: new Date().toISOString(),
      entities: [...world.entities, { ...entity }],
    }),
  }
}

/**
 * Creates a reversible composite command combining multiple actions across map and codex.
 */
export function createCompositeCommand(
  name: string,
  category: CommandMetadata['category'],
  commands: Command[]
): Command {
  return {
    metadata: {
      id: generateCommandId('composite'),
      name,
      category,
      timestamp: Date.now(),
      description: `Executed composite transaction of ${commands.length} step(s)`,
    },
    execute: (world: WorldState): WorldState => {
      let state = world
      for (const cmd of commands) {
        state = cmd.execute(state)
      }
      return state
    },
    undo: (world: WorldState): WorldState => {
      let state = world
      // Rollback in reverse order
      for (let i = commands.length - 1; i >= 0; i--) {
        state = commands[i].undo(state)
      }
      return state
    },
  }
}
