import { describe, it, expect } from 'vitest'
import {
  generateCartoucheMapSvg,
  generateCompassRoseSvg,
  generateDistanceScaleBar,
  CARTOUCHE_THEMES,
} from '../engine/cartoucheExportEngine'
import { createNewWorld } from '../engine/storageService'
import { autoPlayFullWorld } from '../engine/autoPlayEngine'

describe('Phase 26: High-DPI Cartography Cartouche & Legend Exporter (cartoucheExportEngine)', () => {
  it('generates an authentic 8-point compass rose with cardinal and ordinal points', () => {
    const svg = generateCompassRoseSvg(100, 100, 40, CARTOUCHE_THEMES.parchment)
    expect(svg).toContain('class="compass-rose"')
    expect(svg).toContain('>N<')
    expect(svg).toContain('>E<')
    expect(svg).toContain('>S<')
    expect(svg).toContain('>W<')
    expect(svg).toContain('polygon')
  })

  it('generates a segmented distance scale bar with leagues and hash marks', () => {
    const scaleBar = generateDistanceScaleBar(50, 50, 160, CARTOUCHE_THEMES['royal-gold'])
    expect(scaleBar).toContain('class="scale-bar"')
    expect(scaleBar).toContain('SCALE OF LEAGUES')
    expect(scaleBar).toContain('100 Leagues')
  })

  it('generates a complete Cartographic Map SVG with title cartouche, legend, border margins, and compass for all 4 themes', () => {
    const world = autoPlayFullWorld(createNewWorld('Aethelgard High Atlas'), 2)

    for (const theme of ['parchment', 'grimdark', 'royal-gold', 'atlas'] as const) {
      const svg = generateCartoucheMapSvg(world, {
        theme,
        showBorder: true,
        showCartouche: true,
        showLegend: true,
        showCompass: true,
        showScaleBar: true,
      })

      expect(svg).toContain('<svg')
      expect(svg).toContain('class="title-cartouche"')
      expect(svg).toContain('class="compass-rose"')
      expect(svg).toContain('class="map-legend"')
      expect(svg).toContain('class="scale-bar"')
      expect(svg).toContain(CARTOUCHE_THEMES[theme].borderOuter)
      expect(svg).toContain('AETHELGARD HIGH ATLAS')
      expect(svg).toContain('MAP LEGEND')
    }
  })

  it('allows customizing cartouche title and subtitle or hiding specific elements', () => {
    const world = createNewWorld('Frontier Province')
    const svg = generateCartoucheMapSvg(world, {
      customTitle: 'Custom Realm Cartouche',
      customSubtitle: 'Special Campaign Edition',
      showLegend: false,
      showScaleBar: false,
    })

    expect(svg).toContain('CUSTOM REALM CARTOUCHE')
    expect(svg).toContain('Special Campaign Edition')
    expect(svg).not.toContain('class="map-legend"')
    expect(svg).not.toContain('class="scale-bar"')
  })
})
