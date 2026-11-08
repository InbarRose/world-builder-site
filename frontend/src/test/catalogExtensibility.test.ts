import { describe, it, expect } from 'vitest'
import {
  CATALOG_ROOT_MANIFEST,
  ASSETS_MANIFEST,
  STAGES_MANIFEST,
  STAGE_MANIFESTS,
  CODEX_MANIFEST,
  WEIGHTS_MANIFEST,
  resolveCatalogJson,
  resolveManifestShards,
  normalizeStagePreset,
  normalizeCartographicSymbol,
  inferDefaultGraphicForPreset,
  resolveSymbolGraphicFallback,
} from '../engine/catalogLoader'
import {
  getActionPresetsForDraw,
  STAGE_ACTION_PRESETS,
  SPECIES_PRESETS,
  SOCIETY_PRESETS,
  MYTH_PRESETS,
  BOT_PERSONALITIES,
} from '../engine/presets'
import {
  CARTOGRAPHIC_SYMBOLS,
  findSymbolById,
  renderCartographicMarkerSVG,
} from '../engine/cartographicSymbolEngine'
import { searchCompendium } from '../engine/compendiumEngine'
import { CATALOG_AFFINITY_RULES } from '../engine/affinityEngine'

describe('SOLID Multi-Shard Catalog, Graphic Sub-Leaf Schema & Asset Registry (ADR-026)', () => {
  it('loads v2.0.0 multi-shard catalog manifests and externalized weights', () => {
    expect(CATALOG_ROOT_MANIFEST.schemaVersion).toBe('2.0.0')
    expect(CATALOG_ROOT_MANIFEST.manifests.assets).toBe('./assets/manifest.json')
    expect(CATALOG_ROOT_MANIFEST.manifests.stages).toBe('./stages/manifest.json')
    expect(CATALOG_ROOT_MANIFEST.manifests.codex).toBe('./codex/manifest.json')
    expect(CATALOG_ROOT_MANIFEST.manifests.weights).toBe('./weights/manifest.json')

    expect(ASSETS_MANIFEST.categories.length).toBe(6)
    expect(STAGES_MANIFEST.stages.length).toBe(4)

    // Verify Genesis suits use multi-shard partitioning (part1, part2, part3)
    const genEarthEntry = STAGE_MANIFESTS.genesis.suits.find((s) => s.suit === '♠')
    expect(genEarthEntry?.shards).toEqual([
      './earth/part1-mountains-and-hills.json',
      './earth/part2-canyons-cliffs-and-craters.json',
      './earth/part3-deserts-mesas-and-volcanoes.json',
    ])

    // Verify Codex species use multi-shard partitioning
    expect(CODEX_MANIFEST.speciesShards).toEqual([
      './species/part1-core-ancestries.json',
      './species/part2-elemental-and-fey.json',
    ])
    expect(SPECIES_PRESETS.length).toBe(12)

    // Verify externalized affinity rules in weights/
    expect(WEIGHTS_MANIFEST.affinityRulesShards.length).toBeGreaterThanOrEqual(1)
    expect(CATALOG_AFFINITY_RULES.historicalSynergies.length).toBeGreaterThanOrEqual(5)
    expect(CATALOG_AFFINITY_RULES.antiAffinities.length).toBeGreaterThanOrEqual(3)
  })

  it('enforces the Graphic Sub-Leaf schema (zero top-level "icon" fields in raw JSON shards)', () => {
    // Check raw Genesis Earth shard 2
    const rawEarthPart2 = resolveCatalogJson<Record<string, any>[]>(
      'stages/genesis/earth/part2-canyons-cliffs-and-craters.json'
    )
    expect(rawEarthPart2.length).toBeGreaterThan(0)
    for (const rawItem of rawEarthPart2) {
      expect(rawItem.icon).toBeUndefined()
      expect(rawItem.graphic).toBeDefined()
      expect(typeof rawItem.graphic.glyph).toBe('string')
      expect('assetId' in rawItem.graphic).toBe(true)
      expect('fallbackAssetId' in rawItem.graphic).toBe(true)
      expect('params' in rawItem.graphic).toBe(true)
    }

    // Check raw Codex Species shards
    const rawSpecies = resolveManifestShards<Record<string, any>>(
      'codex',
      CODEX_MANIFEST.speciesShards
    )
    for (const rawSp of rawSpecies) {
      expect(rawSp.icon).toBeUndefined()
      expect(rawSp.graphic).toBeDefined()
      expect(rawSp.graphic.glyph).toBeTruthy()
      expect(rawSp.graphic.primaryColor).toMatch(/^#/)
      expect(rawSp.graphic.settlementIcons).toBeDefined()
    }

    // Check hydrated runtime objects carry the full `graphic: GraphicSpec` sub-object
    expect(SOCIETY_PRESETS[0].graphic?.assetId).toBe('const-castle')
    expect(MYTH_PRESETS[0].graphic?.glyph).toBeTruthy()
    expect(BOT_PERSONALITIES.shaper.graphic?.assetId).toBe('mountain-peak')
  })

  it('hydrates the surgical "Meteor Crater" preset from part2-canyons-cliffs-and-craters.json using its graphic sub-leaf', () => {
    const meteorPreset = STAGE_ACTION_PRESETS.find((p) => p.id === 'gen_earth_meteor_crater')
    expect(meteorPreset).toBeDefined()
    expect(meteorPreset?.name).toBe('Meteor Crater')

    // Inherited automatically from stages/genesis/manifest.json + earth suit context:
    expect(meteorPreset?.stage).toBe('genesis')
    expect(meteorPreset?.suit).toBe('♠')
    expect(meteorPreset?.slotCategory).toBe('elevation')
    expect(meteorPreset?.slotPriority).toBe(70)

    // Structured graphic sub-leaf hydrated with asset fallback & visual parameters:
    expect(meteorPreset?.graphic).toEqual({
      assetId: null,
      fallbackAssetId: 'crater-impact',
      glyph: '☄️',
      primaryColor: '#78716c',
      secondaryColor: '#fef08a',
      params: {
        strokeWidth: 1.3,
        fillOpacity: 0.15,
        opacity: 0.85,
        scale: 1,
      },
    })
    expect(meteorPreset?.cartographicSymbol).toBe('crater-impact')
    expect(meteorPreset?.primaryColor).toBe('#78716c')
    expect(meteorPreset?.secondaryColor).toBe('#fef08a')
    expect(findSymbolById(meteorPreset!.cartographicSymbol!)).toBeDefined()

    // Picked up automatically by turn draw preset selector & Compendium:
    const genesisEarthPresets = getActionPresetsForDraw('genesis', '♠', false, false)
    expect(genesisEarthPresets.some((p) => p.id === 'gen_earth_meteor_crater')).toBe(true)

    const compendiumMatches = searchCompendium({ query: 'Meteor Crater', category: 'actions' })
    expect(compendiumMatches.some((item) => item.id === 'action_gen_earth_meteor_crater')).toBe(
      true
    )

    // Renders valid vector SVG using the resolved fallback asset:
    const svgEl = renderCartographicMarkerSVG(meteorPreset!.cartographicSymbol!)
    expect(svgEl).not.toBeNull()
  })

  it('normalizes presets and symbols with graphic.fallbackAssetId or automatic concept/terrain inference', () => {
    const withGraphicLeafFallback = normalizeStagePreset(
      {
        id: 'test_obsidian_basin',
        name: 'Obsidian Impact Basin',
        description: 'Vitrified crater rim.',
        graphic: {
          assetId: null,
          fallbackAssetId: 'volcano-caldera',
          glyph: '🪨',
          primaryColor: '#44403c',
          secondaryColor: '#f59e0b',
          params: { strokeWidth: 1.5, fillOpacity: 0.25 },
        },
      },
      { stage: 'genesis', suit: '♠', slotCategory: 'elevation', slotPriority: 70 }
    )
    expect(withGraphicLeafFallback.cartographicSymbol).toBe('volcano-caldera')
    expect(withGraphicLeafFallback.graphic?.params.strokeWidth).toBe(1.5)
    expect(withGraphicLeafFallback.primaryColor).toBe('#44403c')

    const customAsset = normalizeCartographicSymbol(
      {
        id: 'custom-starfall-crater-symbol',
        name: 'Starfall Crater Symbol',
        concept: 'crater',
        description: 'Uses existing crater-impact graphic via graphic.fallbackAssetId.',
        graphic: {
          assetId: 'custom-starfall-crater-symbol',
          fallbackAssetId: 'crater-impact',
          glyph: '☄️',
        },
      },
      'earth'
    )
    expect(
      resolveSymbolGraphicFallback('custom-starfall-crater-symbol', [
        ...CARTOGRAPHIC_SYMBOLS,
        customAsset,
      ])
    ).toBe('crater-impact')

    expect(
      inferDefaultGraphicForPreset({
        id: 'x',
        name: 'Deciduous Forest',
        description: '',
        floraChange: 'forest',
      })
    ).toBe('forest-deciduous')
  })
})
