import { describe, it, expect } from 'vitest'
import React from 'react'
import {
  CARTOGRAPHIC_SYMBOLS,
  getSymbolsByCategory,
  findSymbolById,
  renderCartographicMarkerSVG,
  resolveCartographicSymbol,
  CartographicCategory,
} from '../engine/cartographicSymbolEngine'
import { STAGE_ACTION_PRESETS } from '../engine/presets'
import { exportMapToSvgString, createDefaultTile } from '../engine/mapEngine'
import { MapState } from '../engine/types'

describe('cartographicSymbolEngine - Whiteboard Cartography Tropes', () => {
  it('defines at least 48 whiteboard marker tropes across 4 categories', () => {
    expect(CARTOGRAPHIC_SYMBOLS.length).toBeGreaterThanOrEqual(48)
  })

  it('contains exactly 12 whiteboard tropes for each Genesis category', () => {
    const categories: CartographicCategory[] = ['earth', 'water', 'plant', 'feature']
    for (const cat of categories) {
      const symbols = getSymbolsByCategory(cat)
      expect(symbols.length).toBe(12)
    }
  })

  it('ensures all 48 symbols have valid non-empty metadata fields', () => {
    for (const sym of CARTOGRAPHIC_SYMBOLS) {
      expect(sym.id).toBeTruthy()
      expect(sym.name).toBeTruthy()
      expect(sym.category).toBeTruthy()
      expect(sym.icon).toBeTruthy()
      expect(sym.description).toBeTruthy()
      expect(Array.isArray(sym.tags)).toBe(true)
      expect(sym.tags.length).toBeGreaterThan(0)
    }
  })

  it('looks up symbols accurately via findSymbolById', () => {
    const peak = findSymbolById('mountain-peak')
    expect(peak).toBeDefined()
    expect(peak?.name).toBe('Mountain Peak')
    expect(peak?.category).toBe('earth')

    const delta = findSymbolById('river-delta')
    expect(delta).toBeDefined()
    expect(delta?.category).toBe('water')

    const pine = findSymbolById('forest-taiga')
    expect(pine).toBeDefined()
    expect(pine?.category).toBe('plant')

    const cave = findSymbolById('cave-maw')
    expect(cave).toBeDefined()
    expect(cave?.category).toBe('feature')

    const invalid = findSymbolById('non-existent-symbol')
    expect(invalid).toBeUndefined()
  })

  it('renders valid SVG elements for every single whiteboard trope', () => {
    for (const sym of CARTOGRAPHIC_SYMBOLS) {
      const rendered = renderCartographicMarkerSVG(sym.id)
      expect(rendered).not.toBeNull()
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
      expect(resolveCartographicSymbol({ relief: 'hills' })).toBe('hills-rolling')
    })

    it('falls back to flora when relief is absent or none', () => {
      expect(resolveCartographicSymbol({ relief: 'none', flora: 'forest' })).toBe('forest-deciduous')
      expect(resolveCartographicSymbol({ flora: 'jungle' })).toBe('forest-jungle')
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
    it('has expanded genesis presets with all 48 tropes + fantastical options', () => {
      const genesisPresets = STAGE_ACTION_PRESETS.filter((p) => p.stage === 'genesis')
      expect(genesisPresets).toBeDefined()
      expect(genesisPresets.length).toBeGreaterThanOrEqual(48)

      // Verify each preset that specifies a cartographicSymbol references a valid symbol
      for (const preset of genesisPresets) {
        if (preset.cartographicSymbol) {
          const sym = findSymbolById(preset.cartographicSymbol)
          expect(sym).toBeDefined()
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
