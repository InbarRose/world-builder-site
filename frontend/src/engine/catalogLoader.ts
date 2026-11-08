/**
 * catalogLoader.ts
 * SOLID Multi-Shard Catalog Loader, Graphic Sub-Leaf Hydrator & Asset Resolver (ADR-026).
 *
 * Architectural Principles:
 * 1. Open/Closed Principle (OCP) via Multi-Shard Manifests:
 *    Uses Vite eager glob imports across `src/data/catalog/` to resolve
 *    `shards: string[]` declared in each directory's `manifest.json`. Splitting a large JSON
 *    into `part1.json`, `part2.json`, or sub-category files requires ONLY editing `manifest.json`
 *    (zero TypeScript import changes).
 * 2. Dedicated `graphic` Sub-Leaf Schema (`GraphicSpec`):
 *    Catalog entities do not use primitive top-level `"icon"` properties in JSON; instead,
 *    every entity defines a structured `"graphic"` sub-JSON leaf referencing the Graphics Assets
 *    Manifest (`assetId`, `fallbackAssetId`), visual glyph, color parameters (`primaryColor`,
 *    `secondaryColor`), and SVG render parameters (`strokeWidth`, `fillOpacity`, `scale`).
 * 3. Externalized Weights & Heuristics:
 *    Bot personalities and affinity/anti-affinity scoring matrices are loaded from
 *    `src/data/catalog/weights/` shards.
 */

import {
  BotPersonalityId,
  CompanionSettlementIcons,
  EntityCategory,
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

// ========================================================
// 1. GRAPHIC SUB-LEAF SCHEMA & INTERFACES
// ========================================================

export interface GraphicRenderParams {
  strokeWidth?: number
  fillOpacity?: number
  opacity?: number
  scale?: number
  rotation?: number
  viewBox?: string
  variant?: string
}

/**
 * Structured Graphic Sub-JSON Leaf referencing the Graphics Assets Manifest (`assets/manifest.json`)
 * and encapsulating all visual rendering parameters.
 */
export interface GraphicSpec {
  /**
   * Direct link to a Graphics Assets Manifest ID (e.g. `"mountain-peak"`, `"crater-impact"`),
   * or `null` if no dedicated vector asset is assigned.
   */
  assetId: string | null
  /**
   * Optional fallback Graphics Assets Manifest ID to render when `assetId` is `null`
   * or has no dedicated vector path.
   */
  fallbackAssetId: string | null
  /**
   * Symbolic badge / glyph used in compact UI pills and timeline badges.
   */
  glyph: string
  /**
   * Primary hex color parameter for rendering the asset/entity.
   */
  primaryColor: string | null
  /**
   * Secondary/accent hex color parameter.
   */
  secondaryColor: string | null
  /**
   * Extensible rendering parameters passed to SVG/Canvas renderers.
   */
  params: GraphicRenderParams
  /**
   * Optional settlement tier visual glyphs for playable ancestries & civilizations.
   */
  settlementIcons?: CompanionSettlementIcons
}

export interface RawGraphicSpec {
  assetId?: string | null
  fallbackAssetId?: string | null
  glyph?: string
  primaryColor?: string | null
  secondaryColor?: string | null
  params?: GraphicRenderParams
  settlementIcons?: CompanionSettlementIcons
}

// ========================================================
// 2. DYNAMIC MULTI-SHARD GLOB REGISTRY (OPEN/CLOSED)
// ========================================================

const rawJsonModules = import.meta.glob('../data/catalog/**/*.json', {
  eager: true,
}) as Record<string, { default?: unknown }>

/**
 * Normalizes a relative path inside `src/data/catalog/` and retrieves the parsed JSON module.
 */
export function resolveCatalogJson<T = any>(relativePathFromCatalogRoot: string): T {
  const cleanRel = relativePathFromCatalogRoot
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/^\/+/, '')
  const key = `../data/catalog/${cleanRel}`
  const mod = rawJsonModules[key]
  if (!mod) {
    throw new Error(`Catalog JSON shard not found at "${key}" (from "${relativePathFromCatalogRoot}")`)
  }
  return (mod.default !== undefined ? mod.default : mod) as T
}

/**
 * Resolves a path relative to a sub-directory inside `src/data/catalog/`.
 */
function joinCatalogPath(baseDir: string, relTarget: string): string {
  const cleanBase = baseDir.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '')
  const cleanTarget = relTarget.replace(/\\/g, '/').replace(/^\.\//, '')
  return cleanBase ? `${cleanBase}/${cleanTarget}` : cleanTarget
}

/**
 * Loads and concatenates an array of JSON shards (`part1.json`, `part2.json`, etc.)
 * declared in any manifest's `shards` array.
 */
export function resolveManifestShards<T = any>(
  baseDir: string,
  shardsOrFile: string[] | string
): T[] {
  const shardList = Array.isArray(shardsOrFile) ? shardsOrFile : [shardsOrFile]
  const combined: T[] = []
  for (const shardRel of shardList) {
    const fullRel = joinCatalogPath(baseDir, shardRel)
    const data = resolveCatalogJson<T[] | T>(fullRel)
    if (Array.isArray(data)) {
      combined.push(...data)
    } else {
      combined.push(data)
    }
  }
  return combined
}

// ========================================================
// 3. MANIFEST EXPORTS
// ========================================================

export const CATALOG_ROOT_MANIFEST = resolveCatalogJson<{
  schemaVersion: string
  title: string
  description: string
  manifests: {
    assets: string
    stages: string
    codex: string
    weights: string
  }
}>('manifest.json')

export const ASSETS_MANIFEST = resolveCatalogJson<{
  schemaVersion: string
  description: string
  categories: { category: CartographicCategory; shards: string[] }[]
  palettesShards: string[]
  conceptFallbacks: Record<string, string>
}>('assets/manifest.json')

// Backwards-compatible alias for `SYMBOLS_MANIFEST`
export const SYMBOLS_MANIFEST = ASSETS_MANIFEST

export const STAGES_MANIFEST = resolveCatalogJson<{
  schemaVersion: string
  description: string
  stages: { stage: StageId; manifest: string }[]
  disastersShards: string[]
}>('stages/manifest.json')

export interface StageSuitManifestEntry {
  suit: Suit
  name: string
  defaultSlotCategory: TileSlotCategory
  defaultPriority: number
  shards: string[]
}

export interface StageDirectoryManifest {
  stage: StageId
  title: string
  suits: StageSuitManifestEntry[]
}

export const STAGE_MANIFESTS: Record<StageId, StageDirectoryManifest> = {
  genesis: resolveCatalogJson<StageDirectoryManifest>('stages/genesis/manifest.json'),
  primal: resolveCatalogJson<StageDirectoryManifest>('stages/primal/manifest.json'),
  civilization: resolveCatalogJson<StageDirectoryManifest>('stages/civilization/manifest.json'),
  intrigue: resolveCatalogJson<StageDirectoryManifest>('stages/intrigue/manifest.json'),
}

export const CODEX_MANIFEST = resolveCatalogJson<{
  schemaVersion: string
  description: string
  speciesShards: string[]
  societiesShards: string[]
  mythsShards: string[]
  relationshipsShards: string[]
  traitsShards: string[]
  abilitiesShards: string[]
}>('codex/manifest.json')

export const WEIGHTS_MANIFEST = resolveCatalogJson<{
  schemaVersion: string
  description: string
  personalitiesShards: string[]
  affinityRulesShards: string[]
}>('weights/manifest.json')

// Backwards-compatible alias
export const BOTS_MANIFEST = WEIGHTS_MANIFEST

// ========================================================
// 4. SMART GRAPHIC NORMALIZATION & FALLBACK RESOLUTION
// ========================================================

export interface RawStageActionPreset {
  id: string
  name: string
  description: string
  graphic?: RawGraphicSpec
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
  hasRiver?: boolean
  hasRoad?: boolean
  traitGranted?: string
  abilityGranted?: string
  relationshipType?: RelationshipType
  creativePrompt?: string
  exampleNarrative?: string
  // Legacy optional fields supported for backwards-compatible programmatic calls:
  icon?: string
  cartographicSymbol?: string
  graphicFallback?: string
  primaryColor?: string
  secondaryColor?: string
}

export interface RawCartographicSymbol {
  id: string
  name: string
  concept: string
  conceptLabel?: string
  variantName?: string
  category?: CartographicCategory
  description: string
  tags?: string[]
  graphic?: RawGraphicSpec
  // Legacy optional fields supported for programmatic calls:
  icon?: string
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
 * Infers an existing Graphics Assets Manifest ID from a preset's `graphic` sub-leaf,
 * terrain/relief changes, or name keywords when `graphic.assetId` is `null` or omitted.
 */
export function inferDefaultGraphicForPreset(raw: RawStageActionPreset): string | undefined {
  const g = raw.graphic
  if (g?.assetId) return g.assetId
  if (g?.fallbackAssetId) return g.fallbackAssetId
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
 * Normalizes a raw `graphic` sub-JSON leaf into a complete `GraphicSpec`.
 */
export function normalizeGraphicSpec(
  rawGraphic?: RawGraphicSpec,
  fallbacks?: {
    assetId?: string | null
    fallbackAssetId?: string | null
    glyph?: string
    primaryColor?: string | null
    secondaryColor?: string | null
  }
): GraphicSpec {
  return {
    assetId: rawGraphic?.assetId ?? fallbacks?.assetId ?? null,
    fallbackAssetId: rawGraphic?.fallbackAssetId ?? fallbacks?.fallbackAssetId ?? null,
    glyph: rawGraphic?.glyph ?? fallbacks?.glyph ?? '✨',
    primaryColor: rawGraphic?.primaryColor ?? fallbacks?.primaryColor ?? null,
    secondaryColor: rawGraphic?.secondaryColor ?? fallbacks?.secondaryColor ?? null,
    params: {
      strokeWidth: rawGraphic?.params?.strokeWidth ?? 1.3,
      fillOpacity: rawGraphic?.params?.fillOpacity ?? 0.15,
      opacity: rawGraphic?.params?.opacity ?? 0.85,
      scale: rawGraphic?.params?.scale ?? 1.0,
      ...(rawGraphic?.params?.rotation !== undefined ? { rotation: rawGraphic.params.rotation } : {}),
      ...(rawGraphic?.params?.viewBox !== undefined ? { viewBox: rawGraphic.params.viewBox } : {}),
      ...(rawGraphic?.params?.variant !== undefined ? { variant: rawGraphic.params.variant } : {}),
    },
    ...(rawGraphic?.settlementIcons ? { settlementIcons: rawGraphic.settlementIcons } : {}),
  }
}

/**
 * Normalizes a raw JSON preset object into a full `StageActionPreset`, hydrating its
 * `graphic` sub-leaf and resolving `assetId` / `fallbackAssetId`.
 */
export function normalizeStagePreset(
  raw: RawStageActionPreset,
  defaults: PresetContextDefaults
): StageActionPreset {
  const effectiveAssetId = inferDefaultGraphicForPreset(raw)
  const graphic = normalizeGraphicSpec(raw.graphic, {
    assetId: raw.cartographicSymbol ?? null,
    fallbackAssetId: raw.graphicFallback ?? (effectiveAssetId ?? null),
    glyph: raw.icon ?? '✨',
    primaryColor: raw.primaryColor ?? null,
    secondaryColor: raw.secondaryColor ?? null,
  })

  const resolvedSymbol = graphic.assetId || graphic.fallbackAssetId || effectiveAssetId

  return {
    id: raw.id,
    stage: raw.stage ?? defaults.stage,
    suit: raw.suit ?? defaults.suit,
    isFantastical: raw.isFantastical ?? false,
    isDisaster: raw.isDisaster ?? false,
    name: raw.name,
    icon: graphic.glyph,
    description: raw.description,
    slotCategory: raw.slotCategory ?? defaults.slotCategory,
    slotPriority: raw.slotPriority ?? defaults.slotPriority,
    graphic,
    ...(raw.terrainChange !== undefined ? { terrainChange: raw.terrainChange } : {}),
    ...(raw.reliefChange !== undefined ? { reliefChange: raw.reliefChange } : {}),
    ...(raw.floraChange !== undefined ? { floraChange: raw.floraChange } : {}),
    ...(raw.overlayChange !== undefined ? { overlayChange: raw.overlayChange } : {}),
    ...(resolvedSymbol !== undefined ? { cartographicSymbol: resolvedSymbol } : {}),
    ...(graphic.fallbackAssetId ? { graphicFallback: graphic.fallbackAssetId } : {}),
    ...(raw.hasRiver !== undefined ? { hasRiver: raw.hasRiver } : {}),
    ...(raw.hasRoad !== undefined ? { hasRoad: raw.hasRoad } : {}),
    ...(graphic.primaryColor ? { primaryColor: graphic.primaryColor } : {}),
    ...(graphic.secondaryColor ? { secondaryColor: graphic.secondaryColor } : {}),
    ...(raw.traitGranted !== undefined ? { traitGranted: raw.traitGranted } : {}),
    ...(raw.abilityGranted !== undefined ? { abilityGranted: raw.abilityGranted } : {}),
    ...(raw.relationshipType !== undefined ? { relationshipType: raw.relationshipType } : {}),
    ...(raw.creativePrompt !== undefined ? { creativePrompt: raw.creativePrompt } : {}),
    ...(raw.exampleNarrative !== undefined ? { exampleNarrative: raw.exampleNarrative } : {}),
  }
}

/**
 * Normalizes a raw JSON graphic asset entry into a full `CartographicSymbolMeta` with `graphic: GraphicSpec`.
 */
export function normalizeCartographicSymbol(
  raw: RawCartographicSymbol,
  defaultCategory: CartographicCategory
): CartographicSymbolMeta {
  const category = raw.category ?? defaultCategory
  const conceptLabel =
    raw.conceptLabel ?? raw.concept.charAt(0).toUpperCase() + raw.concept.slice(1)
  const variantName = raw.variantName ?? raw.name
  const graphic = normalizeGraphicSpec(raw.graphic, {
    assetId: raw.id,
    fallbackAssetId: raw.graphicFallback ?? null,
    glyph: raw.icon ?? '📍',
    primaryColor: '#262626',
  })

  return {
    id: raw.id,
    name: raw.name,
    concept: raw.concept,
    conceptLabel,
    variantName,
    category,
    icon: graphic.glyph,
    description: raw.description,
    tags: raw.tags && raw.tags.length > 0 ? raw.tags : [raw.concept, category],
    graphic,
    ...(graphic.fallbackAssetId ? { graphicFallback: graphic.fallbackAssetId } : {}),
  }
}

// ========================================================
// 5. MULTI-SHARD CATALOG LOADERS
// ========================================================

/**
 * Loads all graphic assets across all category shards defined in `assets/manifest.json`.
 */
export function loadCatalogSymbols(): CartographicSymbolMeta[] {
  const all: CartographicSymbolMeta[] = []
  for (const catEntry of ASSETS_MANIFEST.categories) {
    const rawList = resolveManifestShards<RawCartographicSymbol>('assets', catEntry.shards)
    for (const raw of rawList) {
      all.push(normalizeCartographicSymbol(raw, catEntry.category))
    }
  }
  return all
}

/**
 * Resolves the fallback graphic asset ID when a symbol has no custom SVG switch case.
 * Priority:
 * 1. `symbolMeta.graphic.fallbackAssetId` (or `symbolMeta.graphicFallback`)
 * 2. `ASSETS_MANIFEST.conceptFallbacks[symbolMeta.concept]`
 * 3. `CATEGORY_GRAPHIC_FALLBACKS[symbolMeta.category]`
 */
export function resolveSymbolGraphicFallback(
  symbolId: string,
  allSymbols: CartographicSymbolMeta[]
): string | null {
  const meta = allSymbols.find((s) => s.id === symbolId)
  if (!meta) return null

  const explicitFallback = meta.graphic?.fallbackAssetId ?? meta.graphicFallback
  if (explicitFallback && explicitFallback !== symbolId) {
    return explicitFallback
  }

  const conceptFallbacks = ASSETS_MANIFEST.conceptFallbacks || {}
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
 * Dynamically loads and normalizes all stage action presets from the multi-shard arrays
 * declared in `stages/<stage>/manifest.json` and `stages/manifest.json`.
 */
export function loadCatalogStagePresets(): StageActionPreset[] {
  const all: StageActionPreset[] = []

  for (const stageRef of STAGES_MANIFEST.stages) {
    const stageDir = `stages/${stageRef.stage}`
    const stageManifest = STAGE_MANIFESTS[stageRef.stage]
    for (const suitEntry of stageManifest.suits) {
      const shardItems = resolveManifestShards<RawStageActionPreset>(stageDir, suitEntry.shards)
      const defaults: PresetContextDefaults = {
        stage: stageManifest.stage,
        suit: suitEntry.suit,
        slotCategory: suitEntry.defaultSlotCategory,
        slotPriority: suitEntry.defaultPriority,
      }
      for (const raw of shardItems) {
        all.push(normalizeStagePreset(raw, defaults))
      }
    }
  }

  // Load Disaster shards
  const disasterItems = resolveManifestShards<RawStageActionPreset>(
    'stages',
    STAGES_MANIFEST.disastersShards
  )
  for (const raw of disasterItems) {
    all.push(
      normalizeStagePreset(raw, {
        stage: raw.stage ?? 'genesis',
        suit: raw.suit ?? '♠',
        slotCategory: raw.slotCategory ?? 'elevation',
        slotPriority: raw.slotPriority ?? 90,
      })
    )
  }

  return all
}

interface RawCodexEntity {
  id: string
  name: string
  category: EntityCategory
  archetype: string
  description: string
  traits: string[]
  abilities: string[]
  preferredTerrains: TerrainType[]
  graphic: RawGraphicSpec
}

function hydrateCodexEntity(raw: RawCodexEntity): EntityPreset {
  const graphic = normalizeGraphicSpec(raw.graphic, {
    assetId: 'settle-hamlet',
    glyph: '🧝',
    primaryColor: '#3b82f6',
    secondaryColor: '#dbeafe',
  })
  return {
    id: raw.id,
    name: raw.name,
    category: raw.category,
    icon: graphic.glyph,
    color: graphic.primaryColor || '#3b82f6',
    secondaryColor: graphic.secondaryColor || '#dbeafe',
    archetype: raw.archetype,
    description: raw.description,
    traits: raw.traits,
    abilities: raw.abilities,
    preferredTerrains: raw.preferredTerrains,
    settlementIcons: graphic.settlementIcons || {
      camp: '⛺',
      village: '🏡',
      town: '🏘️',
      city: '🏰',
      metropolis: '👑',
      architectureStyle: 'Stone & Timber Keeps',
    },
    graphic,
  }
}

export function loadCatalogCodex() {
  const rawSpecies = resolveManifestShards<RawCodexEntity>('codex', CODEX_MANIFEST.speciesShards)
  const rawSocieties = resolveManifestShards<RawCodexEntity>('codex', CODEX_MANIFEST.societiesShards)
  const rawMyths = resolveManifestShards<RawCodexEntity>('codex', CODEX_MANIFEST.mythsShards)

  const rawRelationships = resolveManifestShards<{
    type: RelationshipType
    label: string
    description: string
    graphic: RawGraphicSpec
  }>('codex', CODEX_MANIFEST.relationshipsShards)

  const rawTraits = resolveManifestShards<{
    category: string
    suitHint: Suit
    items: { label: string; description?: string; tags?: string[]; graphic: RawGraphicSpec }[]
  }>('codex', CODEX_MANIFEST.traitsShards)

  const rawAbilities = resolveManifestShards<{
    category: string
    suitHint: Suit
    items: { label: string; description?: string; tags?: string[]; graphic: RawGraphicSpec }[]
  }>('codex', CODEX_MANIFEST.abilitiesShards)

  const palettesList = resolveManifestShards<{
    slotIconPalette: {
      category: TileSlotCategory
      label: string
      defaultPriority: number
      items: { name: string; graphic: RawGraphicSpec }[]
    }[]
    colorSwatchPalettes: ColorSwatchPalette[]
    entityIconGallery: {
      category: string
      items: { label: string; graphic: RawGraphicSpec }[]
    }[]
    settlementIconSets: {
      id: string
      name: string
      graphic: RawGraphicSpec
    }[]
  }>('assets', ASSETS_MANIFEST.palettesShards)

  const palettesObj = palettesList[0]

  return {
    species: rawSpecies.map(hydrateCodexEntity),
    societies: rawSocieties.map(hydrateCodexEntity),
    myths: rawMyths.map(hydrateCodexEntity),
    relationships: rawRelationships.map((r) => {
      const graphic = normalizeGraphicSpec(r.graphic, { glyph: '🤝' })
      return {
        type: r.type,
        label: r.label,
        icon: graphic.glyph,
        description: r.description,
        graphic,
      } satisfies RelationshipPreset
    }),
    traits: rawTraits.map(
      (grp): ModularBlockGroup => ({
        category: grp.category,
        suitHint: grp.suitHint,
        items: grp.items.map((it) => {
          const graphic = normalizeGraphicSpec(it.graphic, { glyph: '📜' })
          return {
            label: it.label,
            icon: graphic.glyph,
            description: it.description,
            tags: it.tags,
            graphic,
          }
        }),
      })
    ),
    abilities: rawAbilities.map(
      (grp): ModularBlockGroup => ({
        category: grp.category,
        suitHint: grp.suitHint,
        items: grp.items.map((it) => {
          const graphic = normalizeGraphicSpec(it.graphic, { glyph: '⚡' })
          return {
            label: it.label,
            icon: graphic.glyph,
            description: it.description,
            tags: it.tags,
            graphic,
          }
        }),
      })
    ),
    slotIconPalette: palettesObj.slotIconPalette.map((grp) => ({
      category: grp.category,
      label: grp.label,
      defaultPriority: grp.defaultPriority,
      icons: grp.items.map((it) => ({
        name: it.name,
        icon: it.graphic.glyph || '📍',
        graphic: normalizeGraphicSpec(it.graphic),
      })),
    })),
    colorSwatchPalettes: palettesObj.colorSwatchPalettes,
    entityIconGallery: palettesObj.entityIconGallery.map((grp): IconGalleryGroup => ({
      category: grp.category,
      icons: grp.items.map((it) => ({
        label: it.label,
        icon: it.graphic.glyph || '✨',
      })),
    })),
    settlementIconSets: palettesObj.settlementIconSets.map((set): SettlementIconSetPreset => ({
      id: set.id,
      name: set.name,
      icons: set.graphic.settlementIcons!,
      graphic: normalizeGraphicSpec(set.graphic),
    })),
  }
}

export function loadCatalogBots(): Record<BotPersonalityId, BotPersonalityMeta> {
  const shards = resolveManifestShards<Record<string, any>>(
    'weights',
    WEIGHTS_MANIFEST.personalitiesShards
  )
  const merged: Record<string, BotPersonalityMeta> = {}
  for (const shard of shards) {
    for (const [key, raw] of Object.entries(shard)) {
      const graphic = normalizeGraphicSpec(raw.graphic, { glyph: '🤖' })
      merged[key] = {
        id: raw.id,
        name: raw.name,
        title: raw.title,
        icon: graphic.glyph,
        description: raw.description,
        preferredTerrains: raw.preferredTerrains,
        defaultWeights: raw.defaultWeights,
        graphic,
      }
    }
  }
  return merged as Record<BotPersonalityId, BotPersonalityMeta>
}

export interface CatalogAffinityRules {
  baseScore: number
  historicalSynergies: {
    tag: string
    matchTags: string[]
    bonus: number
    label: string
  }[]
  antiAffinities: {
    candidateTag: string
    forbiddenTerrains: TerrainType[]
    penalty: number
    label: string
  }[]
}

export function loadCatalogAffinityRules(): CatalogAffinityRules {
  const shards = resolveManifestShards<CatalogAffinityRules>(
    'weights',
    WEIGHTS_MANIFEST.affinityRulesShards
  )
  return shards[0]
}
