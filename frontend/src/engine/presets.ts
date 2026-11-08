/**
 * presets.ts
 * TypeScript interfaces and query helpers for Stage Action Presets, Codex Entities,
 * Modular Trait/Ability Blocks, and Bot Personalities.
 *
 * All content data is stored in multi-shard JSON catalogs under `src/data/catalog/`
 * with structured `graphic` sub-JSON leaves (`GraphicSpec`) referencing the Graphics
 * Assets Manifest (`src/data/catalog/assets/manifest.json`) (ADR-026).
 */

import {
  BotPersonalityId,
  BotPersonalityWeights,
  CompanionSettlementIcons,
  EntityCategory,
  FloraType,
  PlayerSeat,
  RelationshipType,
  ReliefType,
  StageId,
  Suit,
  TerrainType,
  TileOverlay,
  TileSlotCategory,
} from './types'
import {
  GraphicSpec,
  loadCatalogBots,
  loadCatalogCodex,
  loadCatalogStagePresets,
} from './catalogLoader'

export type { GraphicSpec }

export interface BotPersonalityMeta {
  id: BotPersonalityId
  name: string
  title: string
  icon: string
  description: string
  preferredTerrains: TerrainType[]
  defaultWeights: BotPersonalityWeights
  graphic?: GraphicSpec
}

export interface EntityPreset {
  id: string
  name: string
  category: EntityCategory
  icon: string
  color: string
  secondaryColor: string
  archetype: string
  description: string
  traits: string[]
  abilities: string[]
  preferredTerrains: TerrainType[]
  settlementIcons: CompanionSettlementIcons
  graphic?: GraphicSpec
}

export interface RelationshipPreset {
  type: RelationshipType
  label: string
  icon: string
  description: string
  graphic?: GraphicSpec
}

export interface StageActionPreset {
  id: string
  stage: StageId
  suit: Suit
  isFantastical: boolean
  isDisaster: boolean
  name: string
  icon: string
  description: string
  slotCategory: TileSlotCategory
  slotPriority: number
  graphic?: GraphicSpec
  terrainChange?: TerrainType
  reliefChange?: ReliefType
  floraChange?: FloraType
  overlayChange?: TileOverlay
  cartographicSymbol?: string
  graphicFallback?: string
  hasRiver?: boolean
  hasRoad?: boolean
  primaryColor?: string
  secondaryColor?: string
  traitGranted?: string
  abilityGranted?: string
  relationshipType?: RelationshipType
  creativePrompt?: string
  exampleNarrative?: string
}

export interface ColorSwatchPalette {
  id: string
  name: string
  primary: string
  secondary: string
}

export interface IconGalleryGroup {
  category: string
  icons: { icon: string; label: string }[]
}

export interface SettlementIconSetPreset {
  id: string
  name: string
  icons: CompanionSettlementIcons
  graphic?: GraphicSpec
}

export interface ModularBlockItem {
  label: string
  icon: string
  description?: string
  tags?: string[]
  graphic?: GraphicSpec
}

export interface ModularBlockGroup {
  category: string
  suitHint: Suit
  items: ModularBlockItem[]
}

// ========================================================
// HYDRATED CATALOG EXPORTS (FROM src/data/catalog/**)
// ========================================================

const codexData = loadCatalogCodex()

export const BOT_PERSONALITIES: Record<BotPersonalityId, BotPersonalityMeta> =
  loadCatalogBots()

export const SPECIES_PRESETS: EntityPreset[] = codexData.species
export const SOCIETY_PRESETS: EntityPreset[] = codexData.societies
export const MYTH_PRESETS: EntityPreset[] = codexData.myths
export const RELATIONSHIP_PRESETS: RelationshipPreset[] = codexData.relationships

export const STAGE_ACTION_PRESETS: StageActionPreset[] = loadCatalogStagePresets()

export const SLOT_ICON_PALETTE = codexData.slotIconPalette
export const COLOR_SWATCH_PALETTES: ColorSwatchPalette[] = codexData.colorSwatchPalettes
export const ENTITY_ICON_GALLERY: IconGalleryGroup[] = codexData.entityIconGallery
export const SETTLEMENT_ICON_SETS: SettlementIconSetPreset[] = codexData.settlementIconSets

export const MODULAR_TRAIT_BLOCKS: ModularBlockGroup[] = codexData.traits
export const MODULAR_ABILITY_BLOCKS: ModularBlockGroup[] = codexData.abilities

export const PLAYER_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#ef4444', // Red
]

export const DEFAULT_PLAYERS: PlayerSeat[] = [
  {
    id: 'player_1',
    name: 'Player 1',
    color: PLAYER_COLORS[0],
    role: 'Artist',
    isBot: false,
    personality: 'shaper',
  },
]

export function getEffectiveBotWeights(seat?: PlayerSeat): BotPersonalityWeights {
  if (!seat) return { ...BOT_PERSONALITIES.shaper.defaultWeights }
  if (seat.customWeights) return { ...seat.customWeights }
  return {
    ...(BOT_PERSONALITIES[seat.personality]?.defaultWeights ||
      BOT_PERSONALITIES.shaper.defaultWeights),
  }
}

export function getActionPresetsForDraw(
  stage: StageId,
  suit: Suit,
  isFantastical: boolean,
  isDisaster: boolean
): StageActionPreset[] {
  if (isDisaster) {
    const stageDisasters = STAGE_ACTION_PRESETS.filter(
      (p) => p.isDisaster && p.stage === stage
    )
    return stageDisasters.length > 0
      ? stageDisasters
      : STAGE_ACTION_PRESETS.filter((p) => p.isDisaster)
  }

  const effectiveSuit: Suit = suit || '♠'
  const exact = STAGE_ACTION_PRESETS.filter(
    (p) =>
      p.stage === stage &&
      p.suit === effectiveSuit &&
      !p.isDisaster &&
      (isFantastical ? true : !p.isFantastical)
  )

  if (exact.length > 0) {
    // Put fantastical presets first when drawing J/Q/K/Joker
    return isFantastical
      ? [...exact].sort((a, b) => Number(b.isFantastical) - Number(a.isFantastical))
      : exact
  }

  return STAGE_ACTION_PRESETS.filter(
    (p) => p.stage === stage && p.suit === effectiveSuit && !p.isDisaster
  )
}
