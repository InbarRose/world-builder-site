import { describe, it, expect } from 'vitest'
import React from 'react'
import {
  CARTOGRAPHIC_SYMBOLS,
  getSymbolsByCategory,
  getSymbolsByConcept,
  getConceptsByCategory,
  findSymbolById,
  renderCartographicMarkerSVG,
  resolveCartographicSymbol,
  CartographicCategory,
} from '../engine/cartographicSymbolEngine'
import { STAGE_ACTION_PRESETS } from '../engine/presets'
import { exportMapToSvgString, createDefaultTile } from '../engine/mapEngine'
import { MapState } from '../engine/types'

describe('cartographicSymbolEngine - Whiteboard Cartography Tropes & Tile Variants', () => {
  it('defines an expanded catalog with at least 80 whiteboard marker tropes across 4 categories', () => {
    expect(CARTOGRAPHIC_SYMBOLS.length).toBeGreaterThanOrEqual(80)
  })

  it('contains at least 15 whiteboard tropes for each Genesis category', () => {
    const categories: CartographicCategory[] = ['earth', 'water', 'plant', 'feature']
    for (const cat of categories) {
      const symbols = getSymbolsByCategory(cat)
      expect(symbols.length).toBeGreaterThanOrEqual(15)
    }
  })

  it('ensures all symbols have valid non-empty metadata fields including concept and variantName', () => {
    for (const sym of CARTOGRAPHIC_SYMBOLS) {
      expect(sym.id).toBeTruthy()
      expect(sym.name).toBeTruthy()
      expect(sym.concept).toBeTruthy()
      expect(sym.conceptLabel).toBeTruthy()
      expect(sym.variantName).toBeTruthy()
      expect(sym.category).toBeTruthy()
      expect(sym.icon).toBeTruthy()
      expect(sym.description).toBeTruthy()
      expect(Array.isArray(sym.tags)).toBe(true)
      expect(sym.tags.length).toBeGreaterThan(0)
    }
  })

  it('ensures every single requested basic concept exists with multiple tile options (variants)', () => {
    // Required concepts from original docs & user request
    const requiredConcepts = [
      // Earth: mountains, hills, canyons, deserts, cliffs, caves
      'mountain',
      'hill',
      'canyon',
      'desert',
      'cave',
      // Water: rivers, lakes, swamps, waterfalls, tidal pools, maelstroms, glaciers
      'river',
      'waterfall',
      'lake',
      'swamp',
      'tidal-pool',
      'glacier',
      'maelstrom',
      // Plant: forests, jungles, grasslands, marshes/wetlands
      'forest',
      'jungle',
      'grassland',
      'marsh',
      // Features: geysers, craters, strong winds, currents, salt flats, landmarks, lava flows, natural resources
      'geyser',
      'crater',
      'lava-flow',
      'salt-flat',
      'wind',
      'current',
      'resource',
      'landmark',
    ]

    for (const conceptId of requiredConcepts) {
      const variants = getSymbolsByConcept(conceptId)
      expect(
        variants.length,
        `Concept "${conceptId}" must have multiple tile variants, but found ${variants.length}`
      ).toBeGreaterThanOrEqual(2)
    }
  })

  it('retrieves concept groups by category with accurate counts', () => {
    const earthConcepts = getConceptsByCategory('earth')
    expect(earthConcepts.length).toBeGreaterThanOrEqual(5)
    expect(earthConcepts.some((c) => c.id === 'mountain' && c.count >= 5)).toBe(true)
    expect(earthConcepts.some((c) => c.id === 'hill' && c.count >= 4)).toBe(true)
    expect(earthConcepts.some((c) => c.id === 'canyon' && c.count >= 4)).toBe(true)
    expect(earthConcepts.some((c) => c.id === 'desert' && c.count >= 4)).toBe(true)
    expect(earthConcepts.some((c) => c.id === 'cave' && c.count >= 3)).toBe(true)

    const waterConcepts = getConceptsByCategory('water')
    expect(waterConcepts.some((c) => c.id === 'river' && c.count >= 4)).toBe(true)
    expect(waterConcepts.some((c) => c.id === 'lake' && c.count >= 4)).toBe(true)
    expect(waterConcepts.some((c) => c.id === 'waterfall' && c.count >= 3)).toBe(true)
    expect(waterConcepts.some((c) => c.id === 'glacier' && c.count >= 3)).toBe(true)

    const featureConcepts = getConceptsByCategory('feature')
    expect(featureConcepts.some((c) => c.id === 'geyser' && c.count >= 3)).toBe(true)
    expect(featureConcepts.some((c) => c.id === 'crater' && c.count >= 3)).toBe(true)
    expect(featureConcepts.some((c) => c.id === 'lava-flow' && c.count >= 3)).toBe(true)
    expect(featureConcepts.some((c) => c.id === 'salt-flat' && c.count >= 3)).toBe(true)
    expect(featureConcepts.some((c) => c.id === 'wind' && c.count >= 3)).toBe(true)
    expect(featureConcepts.some((c) => c.id === 'resource' && c.count >= 4)).toBe(true)
  })

  it('looks up symbols accurately via findSymbolById', () => {
    const peak = findSymbolById('mountain-peak')
    expect(peak).toBeDefined()
    expect(peak?.name).toBe('Mountain Peak')
    expect(peak?.concept).toBe('mountain')

    const delta = findSymbolById('river-delta')
    expect(delta).toBeDefined()
    expect(delta?.concept).toBe('river')

    const pine = findSymbolById('forest-taiga')
    expect(pine).toBeDefined()
    expect(pine?.concept).toBe('forest')

    const cave = findSymbolById('cave-maw')
    expect(cave).toBeDefined()
    expect(cave?.concept).toBe('cave')

    const invalid = findSymbolById('non-existent-symbol')
    expect(invalid).toBeUndefined()
  })

  it('renders valid SVG elements for every single whiteboard trope and variant', () => {
    for (const sym of CARTOGRAPHIC_SYMBOLS) {
      const rendered = renderCartographicMarkerSVG(sym.id)
      expect(rendered, `Symbol ${sym.id} should render valid SVG`).not.toBeNull()
      expect(React.isValidElement(rendered)).toBe(true)
    }

    // Invalid symbol should return null gracefully
    expect(renderCartographicMarkerSVG('not-a-real-id')).toBeNull()
  })

  describe('resolveCartographicSymbol fallback mapper', () => {
    it('prioritizes explicit cartographicSymbol if present and valid', () => {
      const tile = {
        cartographicSymbol: 'volcano-active',
        relief: 'mountain',
        flora: 'forest',
      }
      expect(resolveCartographicSymbol(tile)).toBe('volcano-active')
    })

    it('falls back to relief when no explicit cartographicSymbol is provided', () => {
      expect(resolveCartographicSymbol({ relief: 'mountain' })).toBe('mountain-peak')
      expect(resolveCartographicSymbol({ relief: 'mountain-snow' })).toBe('mountain-snow')
      expect(resolveCartographicSymbol({ relief: 'mountain-range' })).toBe('mountain-range')
      expect(resolveCartographicSymbol({ relief: 'mesa' })).toBe('mesa-plateau')
      expect(resolveCartographicSymbol({ relief: 'crag' })).toBe('mountain-spire')
      expect(resolveCartographicSymbol({ relief: 'canyon' })).toBe('canyon-gorge')
      expect(resolveCartographicSymbol({ relief: 'volcano' })).toBe('volcano-active')
      expect(resolveCartographicSymbol({ relief: 'hills' })).toBe('hill-rolling')
    })

    it('falls back to flora when relief is absent or none', () => {
      expect(resolveCartographicSymbol({ relief: 'none', flora: 'forest' })).toBe('forest-deciduous')
      expect(resolveCartographicSymbol({ flora: 'jungle' })).toBe('jungle-dense')
    })

    it('falls back to overlay when relief and flora are absent', () => {
      expect(resolveCartographicSymbol({ overlay: 'cave' })).toBe('cave-maw')
      expect(resolveCartographicSymbol({ overlay: 'ruins' })).toBe('megalith-ring')
      expect(resolveCartographicSymbol({ overlay: 'myth' })).toBe('sacred-grove')
    })

    it('returns null when tile is a plain featureless background tile', () => {
      expect(resolveCartographicSymbol({})).toBeNull()
      expect(resolveCartographicSymbol({ relief: 'none', flora: 'none', overlay: 'none' })).toBeNull()
    })
  })

  describe('Genesis Phase Preset Integration', () => {
    it('has expanded genesis presets covering all concepts and variants', () => {
      const genesisPresets = STAGE_ACTION_PRESETS.filter((p) => p.stage === 'genesis')
      expect(genesisPresets).toBeDefined()
      expect(genesisPresets.length).toBeGreaterThanOrEqual(80)

      // Verify each preset that specifies a cartographicSymbol references a valid symbol
      for (const preset of genesisPresets) {
        if (preset.cartographicSymbol) {
          const sym = findSymbolById(preset.cartographicSymbol)
          expect(sym, `Preset ${preset.id} references invalid symbol ${preset.cartographicSymbol}`).toBeDefined()
        }
      }
    })
  })

  describe('SVG Map Export Integration', () => {
    it('renders the trope glyph when tile has cartographicSymbol in exportMapToSvgString', () => {
      const mockMap: MapState = {
        width: 3,
        height: 3,
        tiles: {
          '1,1': {
            ...createDefaultTile(1, 1),
            cartographicSymbol: 'volcano-active',
          },
        },
        gridTopology: 'square',
      }
      const svg = exportMapToSvgString(mockMap, 'Test World', [])
      expect(svg).toContain('🌋')
    })
  })
})
