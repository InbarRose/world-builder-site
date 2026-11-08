/**
 * catalogLoader.ts
 * Data-Driven Content Taxonomy & Surgical Authoring Loader (ADR-025).
 *
 * Loads the hierarchical JSON catalog from `src/data/catalog/` and provides:
 * 1. Smart schema normalization so human authors can add new presets or symbols
 *    in JSON with minimal boilerplate (inheriting stage, suit, slotCategory, and priority
 *    automatically from the directory/file context).
 * 2. Automatic graphic fallback resolution (`graphicFallback` / concept fallback /
 *    terrain-relief inference) so authors never need to draw a new SVG graphic when
 *    adding a new preset or symbol—they can simply reference any existing graphic ID
 *    or let the engine infer one automatically.
 */

import rootManifest from '../data/catalog/manifest.json'
import stagesManifest from '../data/catalog/stages/manifest.json'
import genesisManifest from '../data/catalog/stages/genesis/manifest.json'
import primalManifest from '../data/catalog/stages/primal/manifest.json'
import civilizationManifest from '../data/catalog/stages/civilization/manifest.json'
import intrigueManifest from '../data/catalog/stages/intrigue/manifest.json'

import genesisEarth from '../data/catalog/stages/genesis/earth.json'
import genesisWater from '../data/catalog/stages/genesis/water.json'
import genesisPlant from '../data/catalog/stages/genesis/plant.json'
import genesisFeature from '../data/catalog/stages/genesis/feature.json'

import primalSettlements from '../data/catalog/stages/primal/settlements.json'
import primalTraditions from '../data/catalog/stages/primal/traditions.json'
import primalResources from '../data/catalog/stages/primal/resources.json'
import primalSkills from '../data/catalog/stages/primal/skills.json'

import civConstructions from '../data/catalog/stages/civilization/constructions.json'
import civEnlightenment from '../data/catalog/stages/civilization/enlightenment.json'
import civExpansion from '../data/catalog/stages/civilization/expansion.json'
import civDiplomacy from '../data/catalog/stages/civilization/diplomacy.json'

import intrigueConflict from '../data/catalog/stages/intrigue/conflict.json'
import intrigueCooperation from '../data/catalog/stages/intrigue/cooperation.json'
import intrigueScheme from '../data/catalog/stages/intrigue/scheme.json'
import intrigueMyth from '../data/catalog/stages/intrigue/myth.json'

import stageDisasters from '../data/catalog/stages/disasters.json'

import codexManifest from '../data/catalog/codex/manifest.json'
import speciesCatalog from '../data/catalog/codex/species.json'
import societiesCatalog from '../data/catalog/codex/societies.json'
import mythsCatalog from '../data/catalog/codex/myths.json'
import relationshipsCatalog from '../data/catalog/codex/relationships.json'
import traitsCatalog from '../data/catalog/codex/traits.json'
import abilitiesCatalog from '../data/catalog/codex/abilities.json'
import palettesCatalog from '../data/catalog/codex/palettes.json'

import symbolsManifest from '../data/catalog/symbols/manifest.json'
import symbolsEarth from '../data/catalog/symbols/earth.json'
import symbolsWater from '../data/catalog/symbols/water.json'
import symbolsPlant from '../data/catalog/symbols/plant.json'
import symbolsFeature from '../data/catalog/symbols/feature.json'
import symbolsSettlement from '../data/catalog/symbols/settlement.json'
import symbolsConstruction from '../data/catalog/symbols/construction.json'

import botsManifest from '../data/catalog/bots/manifest.json'
import botPersonalitiesCatalog from '../data/catalog/bots/personalities.json'

import {
  BotPersonalityId,
  FloraType,
  RelationshipType,
  ReliefType,
  StageId,
  Suit,
  TerrainType,
  TileOverlay,
  TileSlotCategory,
} from './types'
import type {
  BotPersonalityMeta,
  ColorSwatchPalette,
  EntityPreset,
  IconGalleryGroup,
  ModularBlockGroup,
  RelationshipPreset,
  SettlementIconSetPreset,
  StageActionPreset,
} from './presets'
import type { CartographicCategory, CartographicSymbolMeta } from './cartographicSymbolEngine'

export const CATALOG_ROOT_MANIFEST = rootManifest
export const STAGES_MANIFEST = stagesManifest
export const STAGE_MANIFESTS = {
  genesis: genesisManifest,
  primal: primalManifest,
  civilization: civilizationManifest,
  intrigue: intrigueManifest,
}
export const CODEX_MANIFEST = codexManifest
export const SYMBOLS_MANIFEST = symbolsManifest
export const BOTS_MANIFEST = botsManifest

/**
 * Minimal, surgical authoring interface for Stage Action Presets in JSON files.
 * Only `id`, `name`, `icon`, and `description` are strictly required when adding
 * an entry inside `src/data/catalog/stages/<stage>/<suit>.json`.
 * All contextual fields (`stage`, `suit`, `slotCategory`, `slotPriority`, `isFantastical`, `isDisaster`)
 * and graphic fallbacks (`cartographicSymbol` / `graphicFallback`) are automatically resolved.
 */
export interface RawStageActionPreset {
  id: string
  name: string
  icon: string
  description: string
  stage?: StageId
  suit?: Suit
  isFantastical?: boolean
  isDisaster?: boolean
  slotCategory?: TileSlotCategory
  slotPriority?: number
  terrainChange?: TerrainType
  reliefChange?: ReliefType
  floraChange?: FloraType
  overlayChange?: TileOverlay
  cartographicSymbol?: string
  /**
   * Optional ID of an existing cartographic symbol graphic to reuse when no dedicated
   * graphic exists for this preset (e.g. `"crater-impact"` or `"mountain-peak"`).
   */
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

/**
 * Minimal authoring interface for Cartographic Symbols in `src/data/catalog/symbols/<category>.json`.
 * Authors can specify `graphicFallback` to reuse any existing vector graphic template.
 */
export interface RawCartographicSymbol {
  id: string
  name: string
  concept: string
  conceptLabel?: string
  variantName?: string
  category?: CartographicCategory
  icon: string
  description: string
  tags?: string[]
  /**
   * Optional ID of an existing vector SVG graphic to render if this symbol does not
   * have a custom hand-coded SVG path.
   */
  graphicFallback?: string
}

export interface PresetContextDefaults {
  stage: StageId
  suit: Suit
  slotCategory: TileSlotCategory
  slotPriority: number
}

const CATEGORY_GRAPHIC_FALLBACKS: Record<CartographicCategory, string> = {
  earth: 'mountain-peak',
  water: 'river-meander',
  plant: 'forest-deciduous',
  feature: 'crater-impact',
  settlement: 'settle-hamlet',
  construction: 'const-castle',
}

/**
 * Infers an existing cartographic symbol ID from a preset's terrain, relief, flora,
 * overlay, or name keywords when neither `cartographicSymbol` nor `graphicFallback` is provided.
 */
export function inferDefaultGraphicForPreset(raw: RawStageActionPreset): string | undefined {
  if (raw.cartographicSymbol) return raw.cartographicSymbol
  if (raw.graphicFallback) return raw.graphicFallback

  const text = `${raw.id} ${raw.name}`.toLowerCase()
  if (text.includes('crater') || text.includes('meteor')) return 'crater-impact'
  if (text.includes('caldera') || raw.reliefChange === 'volcano' || raw.terrainChange === 'volcano') {
    return 'volcano-active'
  }
  if (raw.reliefChange === 'mountain-snow') return 'mountain-snow'
  if (raw.reliefChange === 'mountain-range') return 'mountain-range'
  if (raw.reliefChange === 'mesa') return 'mesa-plateau'
  if (raw.reliefChange === 'crag') return 'mountain-spire'
  if (raw.reliefChange === 'canyon' || raw.terrainChange === 'canyon') return 'canyon-gorge'
  if (raw.reliefChange === 'hills') return 'hill-rolling'
  if (raw.reliefChange === 'mountain' || raw.terrainChange === 'mountain') return 'mountain-peak'
  if (raw.floraChange === 'forest' || raw.terrainChange === 'forest') return 'forest-deciduous'
  if (raw.floraChange === 'jungle' || raw.terrainChange === 'jungle') return 'jungle-dense'
  if (raw.terrainChange === 'swamp') return 'swamp-mangrove'
  if (raw.terrainChange === 'desert') return 'desert-dunes'
  if (raw.hasRiver) return 'river-meander'
  if (raw.overlayChange === 'cave') return 'cave-maw'
  if (raw.overlayChange === 'settlement') return 'settle-hamlet'
  if (raw.overlayChange === 'town' || raw.overlayChange === 'city') return 'settle-town'
  if (raw.overlayChange === 'castle' || raw.overlayChange === 'capital') return 'const-castle'
  if (raw.overlayChange === 'monument') return 'const-monument'
  return undefined
}

/**
 * Normalizes a raw JSON preset object into a full `StageActionPreset`, filling in
 * omitted contextual properties and resolving `graphicFallback` / `cartographicSymbol`.
 */
export function normalizeStagePreset(
  raw: RawStageActionPreset,
  defaults: PresetContextDefaults
): StageActionPreset {
  const effectiveSymbol = inferDefaultGraphicForPreset(raw)

  return {
    id: raw.id,
    stage: raw.stage ?? defaults.stage,
    suit: raw.suit ?? defaults.suit,
    isFantastical: raw.isFantastical ?? false,
    isDisaster: raw.isDisaster ?? false,
    name: raw.name,
    icon: raw.icon,
    description: raw.description,
    slotCategory: raw.slotCategory ?? defaults.slotCategory,
    slotPriority: raw.slotPriority ?? defaults.slotPriority,
    ...(raw.terrainChange !== undefined ? { terrainChange: raw.terrainChange } : {}),
    ...(raw.reliefChange !== undefined ? { reliefChange: raw.reliefChange } : {}),
    ...(raw.floraChange !== undefined ? { floraChange: raw.floraChange } : {}),
    ...(raw.overlayChange !== undefined ? { overlayChange: raw.overlayChange } : {}),
    ...(effectiveSymbol !== undefined ? { cartographicSymbol: effectiveSymbol } : {}),
    ...(raw.graphicFallback !== undefined ? { graphicFallback: raw.graphicFallback } : {}),
    ...(raw.hasRiver !== undefined ? { hasRiver: raw.hasRiver } : {}),
    ...(raw.hasRoad !== undefined ? { hasRoad: raw.hasRoad } : {}),
    ...(raw.primaryColor !== undefined ? { primaryColor: raw.primaryColor } : {}),
    ...(raw.secondaryColor !== undefined ? { secondaryColor: raw.secondaryColor } : {}),
    ...(raw.traitGranted !== undefined ? { traitGranted: raw.traitGranted } : {}),
    ...(raw.abilityGranted !== undefined ? { abilityGranted: raw.abilityGranted } : {}),
    ...(raw.relationshipType !== undefined ? { relationshipType: raw.relationshipType } : {}),
    ...(raw.creativePrompt !== undefined ? { creativePrompt: raw.creativePrompt } : {}),
    ...(raw.exampleNarrative !== undefined ? { exampleNarrative: raw.exampleNarrative } : {}),
  }
}

/**
 * Normalizes a raw JSON symbol entry into a full `CartographicSymbolMeta`.
 */
export function normalizeCartographicSymbol(
  raw: RawCartographicSymbol,
  defaultCategory: CartographicCategory
): CartographicSymbolMeta {
  const category = raw.category ?? defaultCategory
  const conceptLabel =
    raw.conceptLabel ?? raw.concept.charAt(0).toUpperCase() + raw.concept.slice(1)
  const variantName = raw.variantName ?? raw.name

  return {
    id: raw.id,
    name: raw.name,
    concept: raw.concept,
    conceptLabel,
    variantName,
    category,
    icon: raw.icon,
    description: raw.description,
    tags: raw.tags && raw.tags.length > 0 ? raw.tags : [raw.concept, category],
    ...(raw.graphicFallback ? { graphicFallback: raw.graphicFallback } : {}),
  }
}

/**
 * Loads and normalizes all cartographic symbols from `src/data/catalog/symbols/*.json`.
 */
export function loadCatalogSymbols(): CartographicSymbolMeta[] {
  const groups: { category: CartographicCategory; list: RawCartographicSymbol[] }[] = [
    { category: 'earth', list: symbolsEarth as RawCartographicSymbol[] },
    { category: 'water', list: symbolsWater as RawCartographicSymbol[] },
    { category: 'plant', list: symbolsPlant as RawCartographicSymbol[] },
    { category: 'feature', list: symbolsFeature as RawCartographicSymbol[] },
    { category: 'settlement', list: symbolsSettlement as RawCartographicSymbol[] },
    { category: 'construction', list: symbolsConstruction as RawCartographicSymbol[] },
  ]

  const all: CartographicSymbolMeta[] = []
  for (const grp of groups) {
    for (const raw of grp.list) {
      all.push(normalizeCartographicSymbol(raw, grp.category))
    }
  }
  return all
}

/**
 * Resolves the fallback graphic ID for a symbol when no custom SVG path exists for `symbolId`.
 * Checks:
 * 1. `symbolMeta.graphicFallback`
 * 2. `symbolsManifest.conceptFallbacks[symbolMeta.concept]`
 * 3. `CATEGORY_GRAPHIC_FALLBACKS[symbolMeta.category]`
 */
export function resolveSymbolGraphicFallback(
  symbolId: string,
  allSymbols: CartographicSymbolMeta[]
): string | null {
  const meta = allSymbols.find((s) => s.id === symbolId)
  if (!meta) return null

  if (meta.graphicFallback && meta.graphicFallback !== symbolId) {
    return meta.graphicFallback
  }

  const conceptFallbacks = (symbolsManifest.conceptFallbacks || {}) as Record<string, string>
  const byConcept = conceptFallbacks[meta.concept]
  if (byConcept && byConcept !== symbolId) {
    return byConcept
  }

  const byCategory = CATEGORY_GRAPHIC_FALLBACKS[meta.category]
  if (byCategory && byCategory !== symbolId) {
    return byCategory
  }

  return null
}

/**
 * Loads and normalizes all stage action presets from `src/data/catalog/stages/**`.
 */
export function loadCatalogStagePresets(): StageActionPreset[] {
  const suitFiles: {
    list: RawStageActionPreset[]
    defaults: PresetContextDefaults
  }[] = [
    // 1. Genesis
    {
      list: genesisEarth as RawStageActionPreset[],
      defaults: { stage: 'genesis', suit: '♠', slotCategory: 'elevation', slotPriority: 70 },
    },
    {
      list: genesisWater as RawStageActionPreset[],
      defaults: { stage: 'genesis', suit: '♥', slotCategory: 'hydrology', slotPriority: 66 },
    },
    {
      list: genesisPlant as RawStageActionPreset[],
      defaults: { stage: 'genesis', suit: '♣', slotCategory: 'vegetation', slotPriority: 64 },
    },
    {
      list: genesisFeature as RawStageActionPreset[],
      defaults: { stage: 'genesis', suit: '♦', slotCategory: 'resource', slotPriority: 68 },
    },
    // 2. Primal
    {
      list: primalSettlements as RawStageActionPreset[],
      defaults: { stage: 'primal', suit: '♠', slotCategory: 'settlement', slotPriority: 92 },
    },
    {
      list: primalTraditions as RawStageActionPreset[],
      defaults: { stage: 'primal', suit: '♥', slotCategory: 'myth', slotPriority: 60 },
    },
    {
      list: primalResources as RawStageActionPreset[],
      defaults: { stage: 'primal', suit: '♣', slotCategory: 'resource', slotPriority: 58 },
    },
    {
      list: primalSkills as RawStageActionPreset[],
      defaults: { stage: 'primal', suit: '♦', slotCategory: 'structure', slotPriority: 62 },
    },
    // 3. Civilization
    {
      list: civConstructions as RawStageActionPreset[],
      defaults: { stage: 'civilization', suit: '♠', slotCategory: 'structure', slotPriority: 84 },
    },
    {
      list: civEnlightenment as RawStageActionPreset[],
      defaults: { stage: 'civilization', suit: '♥', slotCategory: 'structure', slotPriority: 75 },
    },
    {
      list: civExpansion as RawStageActionPreset[],
      defaults: { stage: 'civilization', suit: '♣', slotCategory: 'settlement', slotPriority: 88 },
    },
    {
      list: civDiplomacy as RawStageActionPreset[],
      defaults: { stage: 'civilization', suit: '♦', slotCategory: 'structure', slotPriority: 76 },
    },
    // 4. Intrigue
    {
      list: intrigueConflict as RawStageActionPreset[],
      defaults: { stage: 'intrigue', suit: '♠', slotCategory: 'myth', slotPriority: 88 },
    },
    {
      list: intrigueCooperation as RawStageActionPreset[],
      defaults: { stage: 'intrigue', suit: '♥', slotCategory: 'structure', slotPriority: 80 },
    },
    {
      list: intrigueScheme as RawStageActionPreset[],
      defaults: { stage: 'intrigue', suit: '♣', slotCategory: 'myth', slotPriority: 86 },
    },
    {
      list: intrigueMyth as RawStageActionPreset[],
      defaults: { stage: 'intrigue', suit: '♦', slotCategory: 'myth', slotPriority: 95 },
    },
    // Disasters
    {
      list: stageDisasters as RawStageActionPreset[],
      defaults: { stage: 'genesis', suit: '♠', slotCategory: 'elevation', slotPriority: 90 },
    },
  ]

  const all: StageActionPreset[] = []
  for (const entry of suitFiles) {
    for (const raw of entry.list) {
      all.push(normalizeStagePreset(raw, entry.defaults))
    }
  }
  return all
}

export function loadCatalogCodex() {
  return {
    species: speciesCatalog as EntityPreset[],
    societies: societiesCatalog as EntityPreset[],
    myths: mythsCatalog as EntityPreset[],
    relationships: relationshipsCatalog as RelationshipPreset[],
    traits: traitsCatalog as ModularBlockGroup[],
    abilities: abilitiesCatalog as ModularBlockGroup[],
    slotIconPalette: palettesCatalog.slotIconPalette as {
      category: TileSlotCategory
      label: string
      defaultPriority: number
      icons: { icon: string; name: string }[]
    }[],
    colorSwatchPalettes: palettesCatalog.colorSwatchPalettes as ColorSwatchPalette[],
    entityIconGallery: palettesCatalog.entityIconGallery as IconGalleryGroup[],
    settlementIconSets: palettesCatalog.settlementIconSets as SettlementIconSetPreset[],
  }
}

export function loadCatalogBots(): Record<BotPersonalityId, BotPersonalityMeta> {
  return botPersonalitiesCatalog as Record<BotPersonalityId, BotPersonalityMeta>
}
