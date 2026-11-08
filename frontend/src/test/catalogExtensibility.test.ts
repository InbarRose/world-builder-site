import { describe, it, expect } from 'vitest'
import {
  CATALOG_ROOT_MANIFEST,
  STAGES_MANIFEST,
  STAGE_MANIFESTS,
  CODEX_MANIFEST,
  SYMBOLS_MANIFEST,
  BOTS_MANIFEST,
  normalizeStagePreset,
  normalizeCartographicSymbol,
  inferDefaultGraphicForPreset,
  resolveSymbolGraphicFallback,
} from '../engine/catalogLoader'
import { getActionPresetsForDraw, STAGE_ACTION_PRESETS } from '../engine/presets'
import {
  CARTOGRAPHIC_SYMBOLS,
  findSymbolById,
  renderCartographicMarkerSVG,
} from '../engine/cartographicSymbolEngine'
import { searchCompendium } from '../engine/compendiumEngine'

describe('Modular JSON Content Catalog & Surgical Extensibility (ADR-025)', () => {
  it('loads all catalog manifests and directory indexes', () => {
    expect(CATALOG_ROOT_MANIFEST.schemaVersion).toBe('1.0.0')
    expect(CATALOG_ROOT_MANIFEST.directories.stages).toBe('./stages/manifest.json')
    expect(STAGES_MANIFEST.stages.length).toBe(4)
    expect(STAGE_MANIFESTS.genesis.suits.length).toBe(4)
    expect(STAGE_MANIFESTS.primal.suits.length).toBe(4)
    expect(STAGE_MANIFESTS.civilization.suits.length).toBe(4)
    expect(STAGE_MANIFESTS.intrigue.suits.length).toBe(4)
    expect(CODEX_MANIFEST.files.species).toBe('./species.json')
    expect(SYMBOLS_MANIFEST.categories.length).toBe(6)
    expect(BOTS_MANIFEST.files.personalities).toBe('./personalities.json')
  })

  it('hydrates the surgical "Meteor Crater" preset in genesis/earth.json with context defaults and graphicFallback', () => {
    const meteorPreset = STAGE_ACTION_PRESETS.find((p) => p.id === 'gen_earth_meteor_crater')
    expect(meteorPreset).toBeDefined()
    expect(meteorPreset?.name).toBe('Meteor Crater')
    // Inherited automatically from stages/genesis/earth.json context:
    expect(meteorPreset?.stage).toBe('genesis')
    expect(meteorPreset?.suit).toBe('♠')
    expect(meteorPreset?.isFantastical).toBe(false)
    expect(meteorPreset?.isDisaster).toBe(false)
    expect(meteorPreset?.slotCategory).toBe('elevation')
    expect(meteorPreset?.slotPriority).toBe(70)
    // Graphic fallback resolved to existing 'crater-impact' graphic:
    expect(meteorPreset?.graphicFallback).toBe('crater-impact')
    expect(meteorPreset?.cartographicSymbol).toBe('crater-impact')
    expect(findSymbolById(meteorPreset!.cartographicSymbol!)).toBeDefined()

    // Picked up automatically by turn draw preset selector:
    const genesisEarthPresets = getActionPresetsForDraw('genesis', '♠', false, false)
    expect(genesisEarthPresets.some((p) => p.id === 'gen_earth_meteor_crater')).toBe(true)

    // Picked up automatically by the Tabletop Compendium search:
    const compendiumMatches = searchCompendium({ query: 'Meteor Crater', category: 'actions' })
    expect(compendiumMatches.some((item) => item.id === 'action_gen_earth_meteor_crater')).toBe(
      true
    )

    // Renders valid vector SVG using the selected existing graphic:
    const svgEl = renderCartographicMarkerSVG(meteorPreset!.cartographicSymbol!)
    expect(svgEl).not.toBeNull()
  })

  it('normalizes minimal 4-field presets with explicit graphicFallback or automatic terrain/keyword graphic inference', () => {
    const withExplicitFallback = normalizeStagePreset(
      {
        id: 'test_obsidian_basin',
        name: 'Obsidian Impact Basin',
        icon: '🪨',
        description: 'Vitrified crater rim.',
        graphicFallback: 'volcano-caldera',
      },
      { stage: 'genesis', suit: '♠', slotCategory: 'elevation', slotPriority: 70 }
    )
    expect(withExplicitFallback.stage).toBe('genesis')
    expect(withExplicitFallback.suit).toBe('♠')
    expect(withExplicitFallback.cartographicSymbol).toBe('volcano-caldera')

    const withAutoInferredGraphic = normalizeStagePreset(
      {
        id: 'test_starfall_crater',
        name: 'Starfall Crater',
        icon: '☄️',
        description: 'Impact crater.',
        terrainChange: 'canyon',
      },
      { stage: 'genesis', suit: '♠', slotCategory: 'elevation', slotPriority: 70 }
    )
    expect(withAutoInferredGraphic.cartographicSymbol).toBe('crater-impact')
    expect(inferDefaultGraphicForPreset({ id: 'x', name: 'Deciduous Forest', icon: '🌲', description: '', floraChange: 'forest' })).toBe('forest-deciduous')
  })

  it('resolves symbol graphic fallbacks when a custom symbol has no dedicated SVG switch case', () => {
    const customSymbol = normalizeCartographicSymbol(
      {
        id: 'custom-starfall-crater-symbol',
        name: 'Starfall Crater Symbol',
        concept: 'crater',
        icon: '☄️',
        description: 'Uses existing crater-impact graphic via graphicFallback.',
        graphicFallback: 'crater-impact',
      },
      'earth'
    )

    const extendedSymbols = [...CARTOGRAPHIC_SYMBOLS, customSymbol]
    const resolvedId = resolveSymbolGraphicFallback(
      'custom-starfall-crater-symbol',
      extendedSymbols
    )
    expect(resolvedId).toBe('crater-impact')

    // Also resolves by concept ('crater' -> 'crater-impact') when graphicFallback is omitted:
    const conceptOnlySymbol = normalizeCartographicSymbol(
      {
        id: 'custom-concept-only-crater',
        name: 'Concept Crater',
        concept: 'crater',
        icon: '🕳️',
        description: 'Resolves graphic via symbols/manifest.json conceptFallbacks.',
      },
      'earth'
    )
    const resolvedByConcept = resolveSymbolGraphicFallback('custom-concept-only-crater', [
      ...CARTOGRAPHIC_SYMBOLS,
      conceptOnlySymbol,
    ])
    expect(resolvedByConcept).toBe('crater-impact')
  })
})
