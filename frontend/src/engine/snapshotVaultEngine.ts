/**
 * snapshotVaultEngine.ts
 * Phase 27: Tabletop Session Checkpoint Vault & Crash Resilience Engine.
 *
 * Provides deterministic named checkpoint snapshots for single-PC tabletop drivers:
 * - Creates deep snapshots of WorldState with automatic diff summaries (tiles modified,
 *   entities added, turns delta).
 * - Categorizes checkpoints by trigger type: manual, era_transition, cataclysm, auto_interval.
 * - Safely restores world state with non-destructive cloning.
 * - Manages browser-local persistence (localStorage + quota-safe FIFO pruning) and 1-click
 *   JSON export for specific historical checkpoints.
 */

import { StageId, WorldState } from './types'

export type CheckpointTrigger =
  | 'manual'
  | 'era_transition'
  | 'cataclysm'
  | 'auto_interval'

export interface CheckpointDiffSummary {
  tilesChanged: number
  entitiesAdded: number
  turnsDelta: number
  newEntities: string[]
}

export interface WorldCheckpoint {
  id: string
  worldId: string
  createdAt: string
  turnNumber: number
  moveId: number
  stage: StageId
  title: string
  description: string
  triggerType: CheckpointTrigger
  worldSnapshot: WorldState
  diffFromPrevious?: CheckpointDiffSummary
}

const VAULT_STORAGE_KEY_PREFIX = 'wb_vault_'
const MAX_CHECKPOINTS_PER_WORLD = 25

/**
 * Deep clones an object safely without reference leaks.
 */
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Computes a readable difference summary between two WorldStates.
 */
export function computeCheckpointDiff(
  current: WorldState,
  base?: WorldState | null
): CheckpointDiffSummary {
  if (!base) {
    const tilesWithSlots = Object.values(current.map?.tiles || {}).filter(
      (t) => (t.slots && t.slots.length > 0) || t.label
    ).length
    return {
      tilesChanged: tilesWithSlots,
      entitiesAdded: current.entities?.length || 0,
      turnsDelta: current.drawHistory?.length || 0,
      newEntities: (current.entities || []).map((e) => e.name),
    }
  }

  const currentTiles = current.map?.tiles || {}
  const baseTiles = base.map?.tiles || {}

  let tilesChanged = 0
  const allTileKeys = new Set([
    ...Object.keys(currentTiles),
    ...Object.keys(baseTiles),
  ])

  for (const tid of allTileKeys) {
    const cur = currentTiles[tid]
    const b = baseTiles[tid]
    if (!cur && !b) continue
    if (!cur || !b) {
      tilesChanged++
      continue
    }
    const slotsDiff = (cur.slots?.length || 0) !== (b.slots?.length || 0)
    const labelDiff = cur.label !== b.label
    const terrainDiff = cur.terrain !== b.terrain
    const symbolDiff = cur.cartographicSymbol !== b.cartographicSymbol
    if (slotsDiff || labelDiff || terrainDiff || symbolDiff) {
      tilesChanged++
    }
  }

  const baseEntityIds = new Set((base.entities || []).map((e) => e.id))
  const newEntitiesList = (current.entities || [])
    .filter((e) => !baseEntityIds.has(e.id))
    .map((e) => e.name)

  const turnsDelta = Math.max(
    0,
    (current.drawHistory?.length || 0) - (base.drawHistory?.length || 0)
  )

  return {
    tilesChanged,
    entitiesAdded: newEntitiesList.length,
    turnsDelta,
    newEntities: newEntitiesList,
  }
}

/**
 * Creates a new named WorldCheckpoint with snapshot state and diff summary.
 */
export function createWorldCheckpoint(
  world: WorldState,
  title: string,
  description = '',
  triggerType: CheckpointTrigger = 'manual',
  previousCheckpoint?: WorldCheckpoint | null
): WorldCheckpoint {
  const turnNumber = world.drawHistory?.length || 0
  const moveId =
    world.drawHistory && world.drawHistory.length > 0
      ? world.drawHistory[world.drawHistory.length - 1].moveId
      : 0

  const diffFromPrevious = computeCheckpointDiff(
    world,
    previousCheckpoint ? previousCheckpoint.worldSnapshot : null
  )

  const snapshot: WorldState = deepClone(world)

  const id = `chk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

  return {
    id,
    worldId: world.id,
    createdAt: new Date().toISOString(),
    turnNumber,
    moveId,
    stage: world.currentStage,
    title: title.trim() || `Turn #${turnNumber} Checkpoint`,
    description: description.trim(),
    triggerType,
    worldSnapshot: snapshot,
    diffFromPrevious,
  }
}

/**
 * Restores a WorldState from a checkpoint with a updated timestamp.
 */
export function restoreWorldFromCheckpoint(checkpoint: WorldCheckpoint): WorldState {
  const restored: WorldState = deepClone(checkpoint.worldSnapshot)
  restored.updatedAt = new Date().toISOString()
  return restored
}

/**
 * Retrieves the localStorage key for a given world ID.
 */
function getStorageKey(worldId: string): string {
  return `${VAULT_STORAGE_KEY_PREFIX}${worldId}`
}

/**
 * Lists all checkpoints for a given world sorted newest to oldest.
 */
export function listWorldCheckpoints(worldId: string): WorldCheckpoint[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return []
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(worldId))
    if (!raw) return []
    const parsed: WorldCheckpoint[] = JSON.parse(raw)
    return parsed.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  } catch (err) {
    console.warn(`Failed to list checkpoints for world ${worldId}:`, err)
    return []
  }
}

/**
 * Saves a checkpoint into browser storage with quota-aware pruning.
 */
export function saveWorldCheckpoint(checkpoint: WorldCheckpoint): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return
  }

  try {
    const existing = listWorldCheckpoints(checkpoint.worldId)
    // Replace if exists, or prepend
    const filtered = existing.filter((c) => c.id !== checkpoint.id)
    filtered.unshift(checkpoint)

    // Prune if exceeds max limit (prefer keeping manual checkpoints, remove oldest auto)
    if (filtered.length > MAX_CHECKPOINTS_PER_WORLD) {
      const autoCheckpoints = filtered.filter((c) => c.triggerType !== 'manual')

      while (filtered.length > MAX_CHECKPOINTS_PER_WORLD && autoCheckpoints.length > 5) {
        const removed = autoCheckpoints.pop()
        if (removed) {
          const idx = filtered.findIndex((c) => c.id === removed.id)
          if (idx >= 0) filtered.splice(idx, 1)
        }
      }

      // If still over quota, slice strictly
      if (filtered.length > MAX_CHECKPOINTS_PER_WORLD) {
        filtered.splice(MAX_CHECKPOINTS_PER_WORLD)
      }
    }

    window.localStorage.setItem(
      getStorageKey(checkpoint.worldId),
      JSON.stringify(filtered)
    )
  } catch (err) {
    console.warn(`Failed to save checkpoint ${checkpoint.id}:`, err)
  }
}

/**
 * Deletes a single checkpoint by ID.
 */
export function deleteWorldCheckpoint(
  worldId: string,
  checkpointId: string
): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return
  }

  try {
    const existing = listWorldCheckpoints(worldId)
    const next = existing.filter((c) => c.id !== checkpointId)
    window.localStorage.setItem(getStorageKey(worldId), JSON.stringify(next))
  } catch (err) {
    console.warn(`Failed to delete checkpoint ${checkpointId}:`, err)
  }
}

/**
 * Clears all checkpoints for a world.
 */
export function clearWorldCheckpoints(worldId: string): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return
  }
  try {
    window.localStorage.removeItem(getStorageKey(worldId))
  } catch (err) {
    console.warn(`Failed to clear checkpoints for world ${worldId}:`, err)
  }
}

/**
 * Exports a WorldCheckpoint as an archival JSON string.
 */
export function exportCheckpointAsJson(checkpoint: WorldCheckpoint): string {
  return JSON.stringify(
    {
      schema: 'world-builder-checkpoint-v1',
      checkpointId: checkpoint.id,
      title: checkpoint.title,
      description: checkpoint.description,
      triggerType: checkpoint.triggerType,
      createdAt: checkpoint.createdAt,
      turnNumber: checkpoint.turnNumber,
      stage: checkpoint.stage,
      worldState: checkpoint.worldSnapshot,
    },
    null,
    2
  )
}

/**
 * Returns UI metadata (label, icon, styling) for a checkpoint trigger.
 */
export function getCheckpointTriggerBadge(trigger: CheckpointTrigger): {
  label: string
  icon: string
  badgeClass: string
} {
  switch (trigger) {
    case 'manual':
      return {
        label: 'Manual Checkpoint',
        icon: '📸',
        badgeClass: 'bg-primary/10 text-primary border-primary/30',
      }
    case 'era_transition':
      return {
        label: 'Era Transition',
        icon: '⏳',
        badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      }
    case 'cataclysm':
      return {
        label: 'Cataclysm Event',
        icon: '⚔️',
        badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      }
    case 'auto_interval':
      return {
        label: 'Auto Milestone',
        icon: '⏱️',
        badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      }
  }
}
