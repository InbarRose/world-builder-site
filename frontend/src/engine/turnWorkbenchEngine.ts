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
  MapTile,
  ReliefType,
  StageId,
  TerrainType,
  TileOverlay,
  TileSlotCategory,
} from './types'
import { StageActionPreset } from './presets'
import { addSlotToTile } from './mapEngine'
import { generateFeatureName, generateLedgerProse } from './flavorNameEngine'

export interface TurnActionDraft {
  source: 'preset' | 'custom'
  presetId?: string
  actionTitle: string
  featureName: string
  icon: string
  slotCategory: TileSlotCategory
  slotPriority: number
  terrainChange?: TerrainType
  reliefChange?: ReliefType
  floraChange?: FloraType
  overlayChange?: TileOverlay
  cartographicSymbol?: string
  hasRiver?: boolean
  hasRoad?: boolean
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
  }

  if (draft.terrainChange) {
    updated.terrain = draft.terrainChange
    updated.domain =
      draft.terrainChange === 'ocean' || draft.terrainChange === 'water'
        ? 'water'
        : 'land'
  }
  if (draft.reliefChange) updated.relief = draft.reliefChange
  if (draft.floraChange) updated.flora = draft.floraChange
  if (draft.overlayChange) updated.overlay = draft.overlayChange
  if (draft.cartographicSymbol) updated.cartographicSymbol = draft.cartographicSymbol
  if (draft.hasRiver) updated.hasRiver = true
  if (draft.hasRoad) updated.hasRoad = true

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
    linkedTileIds: mergedTiles,
    linkedEntityIds: mergedEntities,
    slotChanges: updatedSlotChanges,
  }
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

