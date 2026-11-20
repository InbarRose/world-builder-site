/**
 * turnWorkbenchEngine.ts
 * Phase 23: Editable Turn Event & Map Stamp Workbench Engine (ADR-029).
 *
 * Unifies Preset Selection and Custom Event/Stamp Creation in Studio Mode:
 * - Selecting any preset populates an editable TurnActionDraft (title, feature name,
 *   icon, terrain/relief/flora/symbol overrides, and chronicle note).
 * - Stamping onto any map coordinate immediately populates the tile and the active
 *   Chronicle DrawRecord while keeping all fields 100% editable in-place.
 * - Switching to or starting in Custom Mode provides fast 1-click icon, terrain,
 *   category, name generation, and prose synthesis controls.
 */

import {
  DrawRecord,
  FloraType,
  MapState,
  MapTile,
  ReliefType,
  StageId,
  TerrainType,
  TileOverlay,
  TileSlotCategory,
} from './types'
import { StageActionPreset } from './presets'
import { addSlotToTile, createDefaultTile } from './mapEngine'
import { generateFeatureName, generateLedgerProse } from './flavorNameEngine'

export interface TurnActionDraft {
  source: 'preset' | 'custom'
  presetId?: string
  actionTitle: string
  featureName: string
  icon: string
  slotCategory: TileSlotCategory
  slotPriority: number
  domainChange?: 'land' | 'water'
  terrainChange?: TerrainType
  reliefChange?: ReliefType
  floraChange?: FloraType
  overlayChange?: TileOverlay
  cartographicSymbol?: string
  hasRiver?: boolean
  hasRoad?: boolean
  territoryId?: string
  causedByRecordId?: string
  note: string
  placedTileIds: string[]
}

/**
 * Phase 27: Tabletop Brainstorm Candidate Idea.
 * Stashes candidate turn pitches from chiming-in players without overwriting the active draft.
 */
export interface BrainstormIdea {
  id: string
  title: string
  featureName: string
  icon: string
  slotCategory: TileSlotCategory
  draft: TurnActionDraft
  suggestedBy?: string
  timestamp: number
}

export const WORKBENCH_QUICK_ICONS: { icon: string; label: string }[] = [
  { icon: '🏔️', label: 'Mountain' },
  { icon: '🌋', label: 'Volcano' },
  { icon: '🌲', label: 'Forest' },
  { icon: '🌊', label: 'Water' },
  { icon: '🏜️', label: 'Canyon/Desert' },
  { icon: '❄️', label: 'Glacier' },
  { icon: '🏰', label: 'Citadel' },
  { icon: '🏘️', label: 'Settlement' },
  { icon: '🏛️', label: 'Sanctuary' },
  { icon: '⛩️', label: 'Shrine' },
  { icon: '⚔️', label: 'Conflict' },
  { icon: '📜', label: 'Treaty/Law' },
  { icon: '👑', label: 'Sovereign' },
  { icon: '🐉', label: 'Apex/Beast' },
  { icon: '✨', label: 'Anomaly' },
  { icon: '💎', label: 'Resource' },
  { icon: '🗿', label: 'Monolith' },
  { icon: '💀', label: 'Ruin/Cataclysm' },
]

export const WORKBENCH_TERRAIN_OPTIONS: {
  id: TerrainType | ''
  label: string
  icon: string
}[] = [
  { id: '', label: 'Keep Terrain', icon: '🎯' },
  { id: 'plains', label: 'Plains', icon: '🌾' },
  { id: 'mountain', label: 'Mountain', icon: '🏔️' },
  { id: 'forest', label: 'Forest', icon: '🌲' },
  { id: 'jungle', label: 'Jungle', icon: '🌴' },
  { id: 'canyon', label: 'Canyon', icon: '🏜️' },
  { id: 'desert', label: 'Desert', icon: '☀️' },
  { id: 'water', label: 'Water', icon: '🌊' },
  { id: 'swamp', label: 'Swamp', icon: '🐊' },
  { id: 'tundra', label: 'Tundra', icon: '❄️' },
  { id: 'volcano', label: 'Volcano', icon: '🌋' },
]

export const WORKBENCH_SLOT_CATEGORIES: {
  id: TileSlotCategory
  label: string
  icon: string
}[] = [
  { id: 'elevation', label: 'Landform', icon: '🏔️' },
  { id: 'vegetation', label: 'Flora', icon: '🌲' },
  { id: 'hydrology', label: 'Waters', icon: '🌊' },
  { id: 'settlement', label: 'Settlement', icon: '🏘️' },
  { id: 'structure', label: 'Structure', icon: '🏰' },
  { id: 'resource', label: 'Resource', icon: '💎' },
  { id: 'myth', label: 'Myth / Wonder', icon: '✨' },
]

export const WORKBENCH_RELIEF_OPTIONS: {
  id: ReliefType | ''
  label: string
  icon: string
}[] = [
  { id: '', label: 'Keep Relief', icon: '🎯' },
  { id: 'none', label: 'Flat / Clear', icon: '➖' },
  { id: 'hills', label: 'Hills', icon: '⛰️' },
  { id: 'mountain', label: 'Mountain', icon: '🏔️' },
  { id: 'mountain-snow', label: 'Snow Peak', icon: '❄️' },
  { id: 'canyon', label: 'Canyon', icon: '🏜️' },
  { id: 'volcano', label: 'Volcano', icon: '🌋' },
]

export const WORKBENCH_FLORA_OPTIONS: {
  id: FloraType | ''
  label: string
  icon: string
}[] = [
  { id: '', label: 'Keep Canopy', icon: '🎯' },
  { id: 'none', label: 'Clear Canopy', icon: '➖' },
  { id: 'forest', label: 'Forest', icon: '🌲' },
  { id: 'jungle', label: 'Jungle', icon: '🌴' },
  { id: 'marsh', label: 'Marshland', icon: '🌾' },
  { id: 'oasis', label: 'Oasis', icon: '🏝️' },
]

const STAGE_DEFAULT_CUSTOM_META: Record<
  StageId,
  { icon: string; slotCategory: TileSlotCategory; defaultConcept: string }
> = {
  genesis: {
    icon: '🏔️',
    slotCategory: 'elevation',
    defaultConcept: 'mountain',
  },
  primal: {
    icon: '🐉',
    slotCategory: 'myth',
    defaultConcept: 'landmark',
  },
  civilization: {
    icon: '🏰',
    slotCategory: 'settlement',
    defaultConcept: 'settlement',
  },
  intrigue: {
    icon: '⚔️',
    slotCategory: 'structure',
    defaultConcept: 'citadel',
  },
}

/**
 * Populates a full editable TurnActionDraft from a chosen StageActionPreset.
 */
export function createDraftFromPreset(
  preset: StageActionPreset,
  tileId: string,
  seed: string | number = Date.now(),
  preservePlacedTileIds: string[] = []
): TurnActionDraft {
  const featureName = generateFeatureName(
    `${preset.name} ${preset.slotCategory}`,
    preset.cartographicSymbol || preset.name,
    seed
  )
  const note = generateLedgerProse(preset, featureName, undefined, tileId)

  return {
    source: 'preset',
    presetId: preset.id,
    actionTitle: preset.name,
    featureName,
    icon: preset.icon || '✨',
    slotCategory: preset.slotCategory,
    slotPriority: preset.slotPriority ?? 60,
    terrainChange: preset.terrainChange,
    reliefChange: preset.reliefChange,
    floraChange: preset.floraChange,
    overlayChange: preset.overlayChange,
    cartographicSymbol: preset.cartographicSymbol,
    hasRiver: preset.hasRiver,
    hasRoad: preset.hasRoad,
    note,
    placedTileIds: [...preservePlacedTileIds],
  }
}

/**
 * Creates a fast, ready-to-edit Custom TurnActionDraft for freeform Studio play.
 */
export function createCustomTurnDraft(
  stage: StageId,
  powerName?: string,
  tileId = '4,3',
  seed: string | number = Date.now(),
  preservePlacedTileIds: string[] = []
): TurnActionDraft {
  const stageMeta = STAGE_DEFAULT_CUSTOM_META[stage] || STAGE_DEFAULT_CUSTOM_META.genesis
  const featureName = generateFeatureName(stageMeta.defaultConcept, 'general', seed)
  const actionTitle = powerName ? `Custom ${powerName}` : 'Custom World Event'
  const note = `At (${tileId}), ${featureName} emerged during the ${stage} era (${actionTitle}).`

  return {
    source: 'custom',
    presetId: undefined,
    actionTitle,
    featureName,
    icon: stageMeta.icon,
    slotCategory: stageMeta.slotCategory,
    slotPriority: 65,
    terrainChange: undefined,
    reliefChange: undefined,
    floraChange: undefined,
    overlayChange: undefined,
    cartographicSymbol: undefined,
    hasRiver: false,
    hasRoad: false,
    note,
    placedTileIds: [...preservePlacedTileIds],
  }
}

/**
 * Synthesizes or refreshes the Chronicle Narrative Note from the current editable draft.
 */
export function generateDraftChronicleNote(
  draft: TurnActionDraft,
  stage: StageId,
  tileId: string,
  powerName?: string,
  preset?: StageActionPreset | null
): string {
  const effectiveName = draft.featureName.trim() || draft.actionTitle.trim() || 'Unnamed Feature'

  if (preset && draft.source === 'preset' && draft.presetId === preset.id) {
    const baseProse = generateLedgerProse(preset, effectiveName, undefined, tileId)
    if (draft.actionTitle.trim() && draft.actionTitle.trim() !== preset.name) {
      return `${draft.actionTitle.trim()}: ${baseProse}`
    }
    return baseProse
  }

  const titlePart = draft.actionTitle.trim() || powerName || 'World Event'
  const terrainPart = draft.terrainChange ? ` reshaping the land into ${draft.terrainChange}` : ''
  return `${draft.icon} ${titlePart} — ${effectiveName} was established at (${tileId})${terrainPart} during the ${stage} age.`
}

/**
 * Stamps or updates in-place (idempotently per recordId) a TurnActionDraft onto a MapTile.
 */
export function stampDraftOnMapTile(
  tile: MapTile,
  draft: TurnActionDraft,
  recordId: string,
  moveId: number
): {
  updatedTile: MapTile
  slotChange: {
    tileId: string
    slotName: string
    slotIcon: string
    category: TileSlotCategory
  }
} {
  let updated: MapTile = {
    ...tile,
    slots: [...(tile.slots || [])],
    linkedEntityIds: [...(tile.linkedEntityIds || [])],
  }

  // 1. Domain & Base Terrain Clean Single-Change Hygiene
  const isWaterStamp =
    draft.domainChange === 'water' ||
    draft.terrainChange === 'ocean' ||
    draft.terrainChange === 'water'

  if (isWaterStamp) {
    updated.domain = 'water'
    updated.terrain = draft.terrainChange === 'ocean' ? 'ocean' : 'water'
    updated.relief = 'none'
    updated.flora = 'none'
    updated.hasRoad = false
    updated.cartographicSymbol = draft.cartographicSymbol || undefined
  } else if (draft.domainChange === 'land' || draft.terrainChange) {
    updated.domain = 'land'
    const nextTerrain =
      draft.terrainChange ||
      (updated.terrain === 'ocean' || updated.terrain === 'water'
        ? 'plains'
        : updated.terrain)
    updated.terrain = nextTerrain

    // When changing base terrain to plains/grassland or switching from water to land,
    // cleanly reset leftover relief/flora/symbols unless explicitly requested by the draft
    if (
      nextTerrain === 'plains' ||
      nextTerrain === 'desert' ||
      nextTerrain === 'tundra' ||
      draft.domainChange === 'land'
    ) {
      updated.relief = draft.reliefChange || 'none'
      updated.flora = draft.floraChange || 'none'
      updated.cartographicSymbol = draft.cartographicSymbol || undefined
    }
  }

  // 2. Layer 2: Explicit Relief, Flora & Trope Overrides
  if (draft.reliefChange !== undefined) updated.relief = draft.reliefChange
  if (draft.floraChange !== undefined) updated.flora = draft.floraChange
  if (draft.overlayChange !== undefined) updated.overlay = draft.overlayChange
  if (draft.cartographicSymbol !== undefined) {
    updated.cartographicSymbol = draft.cartographicSymbol || undefined
  }
  if (draft.hasRiver) updated.hasRiver = true
  if (draft.hasRoad && updated.domain !== 'water') updated.hasRoad = true

  // 3. Layer 5: Faction / Realm Claim Override
  if (draft.territoryId !== undefined) {
    updated.territoryId = draft.territoryId || undefined
    if (draft.territoryId && !updated.linkedEntityIds.includes(draft.territoryId)) {
      updated.linkedEntityIds.push(draft.territoryId)
    }
  }

  const slotName =
    draft.featureName.trim() || draft.actionTitle.trim() || 'World Feature'
  updated.label = slotName

  const existingSlotIdx = (updated.slots || []).findIndex(
    (s) => s.linkedEventId === recordId
  )

  if (existingSlotIdx >= 0 && updated.slots) {
    const nextSlots = [...updated.slots]
    nextSlots[existingSlotIdx] = {
      ...nextSlots[existingSlotIdx],
      category: draft.slotCategory,
      type: draft.presetId || `custom_${draft.slotCategory}`,
      name: slotName,
      icon: draft.icon || '✨',
      priority: draft.slotPriority || 65,
      moveId,
    }
    nextSlots.sort((a, b) => b.priority - a.priority)
    updated.slots = nextSlots
  } else {
    updated = addSlotToTile(updated, {
      category: draft.slotCategory,
      type: draft.presetId || `custom_${draft.slotCategory}`,
      name: slotName,
      icon: draft.icon || '✨',
      priority: draft.slotPriority || 65,
      linkedEventId: recordId,
      moveId,
    })
  }

  return {
    updatedTile: updated,
    slotChange: {
      tileId: tile.id,
      slotName,
      slotIcon: draft.icon || '✨',
      category: draft.slotCategory,
    },
  }
}

/**
 * Synchronizes an editable TurnActionDraft into a DrawRecord so the Chronicle
 * immediately reflects the player's current preset or custom edits.
 */
export function syncDraftToDrawRecord(
  record: DrawRecord,
  draft: TurnActionDraft,
  extraLinkedTileIds: string[] = [],
  extraLinkedEntityIds: string[] = []
): DrawRecord {
  const mergedTiles = Array.from(
    new Set([
      ...(record.linkedTileIds || []),
      ...draft.placedTileIds,
      ...extraLinkedTileIds,
    ])
  )
  const mergedEntities = Array.from(
    new Set([...(record.linkedEntityIds || []), ...extraLinkedEntityIds])
  )

  const slotName =
    draft.featureName.trim() || draft.actionTitle.trim() || 'World Feature'

  const updatedSlotChanges =
    draft.placedTileIds.length > 0
      ? draft.placedTileIds.map((tid) => ({
          tileId: tid,
          slotName,
          slotIcon: draft.icon || '✨',
          category: draft.slotCategory,
        }))
      : record.slotChanges

  return {
    ...record,
    actionTitle: draft.actionTitle.trim() || undefined,
    presetId: draft.source === 'preset' ? draft.presetId : undefined,
    power: record.power || draft.actionTitle.trim() || 'World Event',
    note: draft.note.trim(),
    causedByRecordId:
      draft.causedByRecordId !== undefined
        ? draft.causedByRecordId || undefined
        : record.causedByRecordId,
    linkedTileIds: mergedTiles,
    linkedEntityIds: mergedEntities,
    slotChanges: updatedSlotChanges,
  }
}

export interface CausalEventChain {
  parentEvent?: DrawRecord
  childEvents: DrawRecord[]
  rootAncestor?: DrawRecord
  chainDepth: number
}

/**
 * Resolves the immediate causal parent ("Caused by"), downstream consequences ("Led to"),
 * root ancestor, and chain depth for any historical DrawRecord in the Chronicle.
 */
export function getCausalChainForRecord(
  drawHistory: DrawRecord[],
  recordId: string
): CausalEventChain {
  const byId = new Map<string, DrawRecord>()
  for (const r of drawHistory) {
    byId.set(r.id, r)
  }

  const current = byId.get(recordId)
  if (!current) {
    return { childEvents: [], chainDepth: 0 }
  }

  const parentEvent = current.causedByRecordId
    ? byId.get(current.causedByRecordId)
    : undefined

  const childEvents = drawHistory.filter(
    (r) => r.causedByRecordId === recordId && r.id !== recordId
  )

  // Walk upward with cycle protection to find root ancestor and chain depth
  let depth = 0
  let cursor = parentEvent
  let rootAncestor = parentEvent
  const visited = new Set<string>([recordId])

  while (cursor && !visited.has(cursor.id)) {
    visited.add(cursor.id)
    depth++
    rootAncestor = cursor
    cursor = cursor.causedByRecordId ? byId.get(cursor.causedByRecordId) : undefined
  }

  return {
    parentEvent,
    childEvents,
    rootAncestor,
    chainDepth: depth,
  }
}

/**
 * Automatically infers the most recent prior historical event on a tile
 * so stamping onto an established location or ruin naturally links causal history.
 */
export function inferCausalParentFromTile(
  tile: MapTile,
  drawHistory: DrawRecord[],
  currentRecordId: string
): string | undefined {
  const candidates = drawHistory.filter(
    (r) =>
      r.id !== currentRecordId &&
      ((r.linkedTileIds && r.linkedTileIds.includes(tile.id)) ||
        (tile.linkedEventIds && tile.linkedEventIds.includes(r.id)))
  )
  if (candidates.length === 0) return undefined
  return candidates[candidates.length - 1].id
}

/**
 * Creates a stashed brainstorm idea from the current TurnActionDraft.
 */
export function createBrainstormIdea(
  draft: TurnActionDraft,
  suggestedBy?: string
): BrainstormIdea {
  const id = `idea_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
  const title =
    draft.actionTitle.trim() ||
    (draft.source === 'preset' ? 'Stashed Preset Idea' : 'Stashed Custom Idea')
  const featureName = draft.featureName.trim() || 'World Feature'

  return {
    id,
    title,
    featureName,
    icon: draft.icon || '💡',
    slotCategory: draft.slotCategory,
    draft: {
      ...draft,
      placedTileIds: [...draft.placedTileIds],
    },
    suggestedBy: suggestedBy?.trim() || undefined,
    timestamp: Date.now(),
  }
}

/**
 * Applies a stashed BrainstormIdea into an active TurnActionDraft, preserving
 * the current draft's placed tile coordinates so the map placement is maintained.
 */
export function applyBrainstormIdea(
  currentDraft: TurnActionDraft,
  idea: BrainstormIdea
): TurnActionDraft {
  return {
    ...idea.draft,
    placedTileIds:
      currentDraft.placedTileIds.length > 0
        ? [...currentDraft.placedTileIds]
        : [...idea.draft.placedTileIds],
  }
}

/**
 * Appends a chime-in quote or table banter from a player into the draft note.
 */
export function appendChimeInQuote(
  existingNote: string,
  speakerName: string,
  quote: string
): string {
  const cleanQuote = quote.trim()
  if (!cleanQuote) return existingNote

  const attribution = speakerName.trim() || 'Table Conclave'
  const quoteBlock = `> *"${cleanQuote}"*\n> — **${attribution}**`

  const trimmed = existingNote.trim()
  if (!trimmed) {
    return quoteBlock
  }
  return `${trimmed}\n\n${quoteBlock}`
}

/**
 * Deep-clones a MapState (used as a clean pre-placement snapshot so dragging
 * or cancelling an interactive map placement leaves zero leftover artifacts).
 */
export function cloneMapState(map: MapState): MapState {
  const clonedTiles: MapState['tiles'] = {}
  for (const [id, tile] of Object.entries(map.tiles)) {
    clonedTiles[id] = {
      ...tile,
      slots: tile.slots ? tile.slots.map((s) => ({ ...s })) : [],
      tags: tile.tags ? [...tile.tags] : [],
      linkedEventIds: tile.linkedEventIds ? [...tile.linkedEventIds] : [],
      linkedEntityIds: tile.linkedEntityIds ? [...tile.linkedEntityIds] : [],
      customColors: tile.customColors ? { ...tile.customColors } : undefined,
    }
  }
  return {
    ...map,
    tiles: clonedTiles,
  }
}

/**
 * Infers whether a draft/preset is naturally a multi-tile feature (e.g. a river,
 * mountain range, forest, road, or desert) vs. a single-tile landmark.
 */
export function shouldDefaultToMultiTilePlacement(
  draft: TurnActionDraft,
  preset?: StageActionPreset | null
): boolean {
  if (draft.hasRiver || draft.hasRoad) return true
  if (draft.reliefChange === 'mountain-range') return true
  const combined = `${draft.featureName} ${draft.actionTitle} ${preset?.name || ''}`.toLowerCase()
  return /(river|stream|range|ridge|forest|jungle|woods|desert|road|highway|coast|reef|marsh|swamp)/.test(
    combined
  )
}

/**
 * Re-applies the active TurnActionDraft onto a clean pre-placement baseMap across
 * all targetTileIds. Moving a single item simply passes `[newTileId]`, cleanly
 * reverting the old tile; multi-tile painting passes all painted tile IDs.
 */
export function repositionDraftOnMap(
  baseMap: MapState,
  targetTileIds: string[],
  draft: TurnActionDraft,
  recordId: string,
  _preset?: StageActionPreset | null
): MapState {
  const workingMap = cloneMapState(baseMap)
  const uniqueIds = Array.from(new Set(targetTileIds))
  for (const tid of uniqueIds) {
    const [colStr, rowStr] = tid.split(',')
    const col = Number(colStr) || 0
    const row = Number(rowStr) || 0
    const baseTile = workingMap.tiles[tid] || createDefaultTile(col, row)
    const { updatedTile } = stampDraftOnMapTile(baseTile, draft, recordId, 1)
    workingMap.tiles[tid] = updatedTile
  }
  return workingMap
}


