/**
 * cartoucheExportEngine.ts
 * Phase 26: High-DPI Cartography Cartouche & Legend Exporter (ADR-032).
 *
 * Provides publication-grade cartographic rendering with:
 * - 4 Thematic Styles: 'parchment' | 'grimdark' | 'royal-gold' | 'atlas'
 * - Multi-tiered ornate border margins with corner filigrees
 * - Decorative Title Cartouche with World Name, Era subtitle & Stability crest
 * - True 8-Point Cartographic Compass Rose
 * - Comprehensive Map Legend with Biomes, Hydrology, Roads, Settlements & Sites
 * - Segmented Distance Scale Bar (Leagues / Miles / Days March)
 * - High-DPI (300 DPI / 4x) raster PNG generator & vector SVG exporter
 */

import { WorldState } from './types'
import { STAGES } from './deckEngine'
import { TERRAIN_PALETTE, getTileId } from './mapEngine'
import { computeBiomeBreakdown } from './twoPageOverviewEngine'
import { computeWorldStabilityIndex } from './narrativeEngine'

export type CartoucheTheme = 'parchment' | 'grimdark' | 'royal-gold' | 'atlas'

export interface CartoucheOptions {
  theme?: CartoucheTheme
  showBorder?: boolean
  showCartouche?: boolean
  showLegend?: boolean
  showCompass?: boolean
  showScaleBar?: boolean
  dpiScale?: number // default 3 (approx 300 DPI on standard screen)
  customTitle?: string
  customSubtitle?: string
}

export interface CartoucheThemeColors {
  frameBg: string
  borderOuter: string
  borderInner: string
  accentColor: string
  textColor: string
  textMuted: string
  cartoucheBg: string
  cartoucheBorder: string
  legendBg: string
  compassPrimary: string
  compassSecondary: string
}

export const CARTOUCHE_THEMES: Record<CartoucheTheme, CartoucheThemeColors> = {
  parchment: {
    frameBg: '#f6efe1',
    borderOuter: '#451a03',
    borderInner: '#78350f',
    accentColor: '#b45309',
    textColor: '#291404',
    textMuted: '#78350f',
    cartoucheBg: '#faf5eb',
    cartoucheBorder: '#92400e',
    legendBg: '#faf5eb',
    compassPrimary: '#78350f',
    compassSecondary: '#d97706',
  },
  grimdark: {
    frameBg: '#090d14',
    borderOuter: '#450a0a',
    borderInner: '#991b1b',
    accentColor: '#dc2626',
    textColor: '#f1f5f9',
    textMuted: '#94a3b8',
    cartoucheBg: '#131b28',
    cartoucheBorder: '#7f1d1d',
    legendBg: '#131b28',
    compassPrimary: '#ef4444',
    compassSecondary: '#64748b',
  },
  'royal-gold': {
    frameBg: '#071120',
    borderOuter: '#d97706',
    borderInner: '#f59e0b',
    accentColor: '#fbbf24',
    textColor: '#fef3c7',
    textMuted: '#cbd5e1',
    cartoucheBg: '#0e1f38',
    cartoucheBorder: '#f59e0b',
    legendBg: '#0e1f38',
    compassPrimary: '#f59e0b',
    compassSecondary: '#38bdf8',
  },
  atlas: {
    frameBg: '#f8fafc',
    borderOuter: '#0f172a',
    borderInner: '#334155',
    accentColor: '#0284c7',
    textColor: '#0f172a',
    textMuted: '#475569',
    cartoucheBg: '#ffffff',
    cartoucheBorder: '#0284c7',
    legendBg: '#ffffff',
    compassPrimary: '#0284c7',
    compassSecondary: '#0f172a',
  },
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Builds an 8-point SVG compass rose centered at (cx, cy) with radius r.
 */
export function generateCompassRoseSvg(
  cx: number,
  cy: number,
  r: number,
  themeColors: CartoucheThemeColors
): string {
  const p = themeColors.compassPrimary
  const s = themeColors.compassSecondary
  const ringR = r * 0.85
  const innerR = r * 0.28

  return `
    <g class="compass-rose" transform="translate(${cx}, ${cy})">
      <!-- Outer Dial Rings -->
      <circle r="${r * 1.1}" fill="none" stroke="${themeColors.borderInner}" stroke-width="1" stroke-dasharray="2 3" opacity="0.65" />
      <circle r="${ringR}" fill="none" stroke="${themeColors.borderOuter}" stroke-width="2" />
      <circle r="${innerR}" fill="${themeColors.cartoucheBg}" stroke="${themeColors.borderInner}" stroke-width="1.5" />

      <!-- Ordinal Points (NE, SE, SW, NW) -->
      <polygon points="0,0 ${r * 0.55 * 0.707},${-r * 0.55 * 0.707} 0,${-innerR}" fill="${s}" opacity="0.75" />
      <polygon points="0,0 ${r * 0.55 * 0.707},${-r * 0.55 * 0.707} ${innerR},0" fill="${p}" opacity="0.55" />

      <polygon points="0,0 ${r * 0.55 * 0.707},${r * 0.55 * 0.707} ${innerR},0" fill="${s}" opacity="0.75" />
      <polygon points="0,0 ${r * 0.55 * 0.707},${r * 0.55 * 0.707} 0,${innerR}" fill="${p}" opacity="0.55" />

      <polygon points="0,0 ${-r * 0.55 * 0.707},${r * 0.55 * 0.707} 0,${innerR}" fill="${s}" opacity="0.75" />
      <polygon points="0,0 ${-r * 0.55 * 0.707},${r * 0.55 * 0.707} ${-innerR},0" fill="${p}" opacity="0.55" />

      <polygon points="0,0 ${-r * 0.55 * 0.707},${-r * 0.55 * 0.707} ${-innerR},0" fill="${s}" opacity="0.75" />
      <polygon points="0,0 ${-r * 0.55 * 0.707},${-r * 0.55 * 0.707} 0,${-innerR}" fill="${p}" opacity="0.55" />

      <!-- Cardinal Points (N, E, S, W) -->
      <!-- North -->
      <polygon points="0,${-r} 0,0 ${innerR * 0.8},${-innerR * 0.4}" fill="${p}" />
      <polygon points="0,${-r} 0,0 ${-innerR * 0.8},${-innerR * 0.4}" fill="${s}" />
      <!-- South -->
      <polygon points="0,${r} 0,0 ${-innerR * 0.8},${innerR * 0.4}" fill="${p}" />
      <polygon points="0,${r} 0,0 ${innerR * 0.8},${innerR * 0.4}" fill="${s}" />
      <!-- East -->
      <polygon points="${r},0 0,0 ${innerR * 0.4},${innerR * 0.8}" fill="${p}" />
      <polygon points="${r},0 0,0 ${innerR * 0.4},${-innerR * 0.8}" fill="${s}" />
      <!-- West -->
      <polygon points="${-r},0 0,0 ${-innerR * 0.4},${-innerR * 0.8}" fill="${p}" />
      <polygon points="${-r},0 0,0 ${-innerR * 0.4},${innerR * 0.8}" fill="${s}" />

      <!-- Center Gem -->
      <circle r="${innerR * 0.4}" fill="${themeColors.accentColor}" stroke="${themeColors.borderOuter}" stroke-width="1.5" />

      <!-- Cardinal Labels -->
      <text x="0" y="${-r - 7}" font-family="'Cinzel', 'Palatino', Georgia, serif" font-size="13" font-weight="900" fill="${themeColors.textColor}" text-anchor="middle">N</text>
      <text x="${r + 11}" y="4" font-family="'Cinzel', 'Palatino', Georgia, serif" font-size="11" font-weight="bold" fill="${themeColors.textColor}" text-anchor="middle">E</text>
      <text x="0" y="${r + 15}" font-family="'Cinzel', 'Palatino', Georgia, serif" font-size="11" font-weight="bold" fill="${themeColors.textColor}" text-anchor="middle">S</text>
      <text x="${-r - 11}" y="4" font-family="'Cinzel', 'Palatino', Georgia, serif" font-size="11" font-weight="bold" fill="${themeColors.textColor}" text-anchor="middle">W</text>
    </g>
  `
}

/**
 * Builds an authentic cartographic corner filigree decoration.
 */
function generateCornerFiligree(x: number, y: number, rotationDeg: number, color: string): string {
  return `
    <g transform="translate(${x}, ${y}) rotate(${rotationDeg})">
      <path d="M 0 0 L 28 0 C 18 4, 14 14, 14 28 L 0 28 Z" fill="${color}" opacity="0.15" />
      <path d="M 2 2 L 26 2 L 26 6 L 6 6 L 6 26 L 2 26 Z" fill="${color}" />
      <circle cx="12" cy="12" r="3" fill="${color}" />
      <path d="M 26 6 C 20 6, 6 20, 6 26" stroke="${color}" stroke-width="1.5" fill="none" />
    </g>
  `
}

/**
 * Builds a segmented distance scale bar.
 */
export function generateDistanceScaleBar(
  x: number,
  y: number,
  totalWidth: number,
  themeColors: CartoucheThemeColors
): string {
  const h = 10
  const segW = totalWidth / 4

  return `
    <g class="scale-bar" transform="translate(${x}, ${y})">
      <!-- Background & Border -->
      <rect x="-4" y="-16" width="${totalWidth + 8}" height="${h + 24}" fill="${themeColors.cartoucheBg}" stroke="${themeColors.borderInner}" stroke-width="1" rx="4" opacity="0.92" />
      <text x="${totalWidth / 2}" y="-4" font-family="'Cinzel', 'Palatino', Georgia, serif" font-size="9" font-weight="bold" fill="${themeColors.textMuted}" text-anchor="middle" letter-spacing="1">SCALE OF LEAGUES</text>

      <!-- Alternating segments -->
      <rect x="0" y="0" width="${segW}" height="${h}" fill="${themeColors.borderOuter}" stroke="${themeColors.borderOuter}" stroke-width="1" />
      <rect x="${segW}" y="0" width="${segW}" height="${h}" fill="${themeColors.cartoucheBg}" stroke="${themeColors.borderOuter}" stroke-width="1" />
      <rect x="${segW * 2}" y="0" width="${segW}" height="${h}" fill="${themeColors.borderOuter}" stroke="${themeColors.borderOuter}" stroke-width="1" />
      <rect x="${segW * 3}" y="0" width="${segW}" height="${h}" fill="${themeColors.cartoucheBg}" stroke="${themeColors.borderOuter}" stroke-width="1" />

      <!-- Hash marks and numbers -->
      <text x="0" y="${h + 10}" font-family="monospace" font-size="8.5" font-weight="bold" fill="${themeColors.textColor}" text-anchor="middle">0</text>
      <text x="${segW}" y="${h + 10}" font-family="monospace" font-size="8.5" font-weight="bold" fill="${themeColors.textColor}" text-anchor="middle">25</text>
      <text x="${segW * 2}" y="${h + 10}" font-family="monospace" font-size="8.5" font-weight="bold" fill="${themeColors.textColor}" text-anchor="middle">50</text>
      <text x="${segW * 4}" y="${h + 10}" font-family="monospace" font-size="8.5" font-weight="bold" fill="${themeColors.textColor}" text-anchor="middle">100 Leagues</text>
    </g>
  `
}

/**
 * Compiles a full high-resolution Cartographic Map with decorative margins,
 * title cartouche, legend box, compass rose, and scale bar.
 */
export function generateCartoucheMapSvg(
  world: WorldState,
  options: CartoucheOptions = {}
): string {
  const themeKey = options.theme || 'parchment'
  const theme = CARTOUCHE_THEMES[themeKey] || CARTOUCHE_THEMES.parchment
  const map = world.map

  const tileSize = 52
  const mapWidthPx = map.width * tileSize
  const mapHeightPx = map.height * tileSize

  // Margins for the ornate border frame
  const marginX = 80
  const marginTop = 120
  const marginBottom = 100

  const totalWidth = mapWidthPx + marginX * 2
  const totalHeight = mapHeightPx + marginTop + marginBottom

  const stability = computeWorldStabilityIndex(world)
  const biomes = computeBiomeBreakdown(world)
  const stageMeta = STAGES.find((s) => s.id === world.currentStage) || STAGES[0]

  const title = options.customTitle?.trim() || world.name
  const subtitle =
    options.customSubtitle?.trim() ||
    `Age ${stageMeta.number}: ${stageMeta.name} · ${world.drawHistory.length} Recorded Epochs`

  // 1. Outer & Inner Frame
  const borderOuterInset = 16
  const borderInnerInset = 28
  const mapFrameX = marginX - 4
  const mapFrameY = marginTop - 4
  const mapFrameW = mapWidthPx + 8
  const mapFrameH = mapHeightPx + 8

  let svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}">
  <defs>
    <filter id="cartouche-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="2" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Canvas Background -->
  <rect width="${totalWidth}" height="${totalHeight}" fill="${theme.frameBg}" />

  <!-- Outer Double Borders -->
  <rect x="${borderOuterInset}" y="${borderOuterInset}" width="${totalWidth - borderOuterInset * 2}" height="${totalHeight - borderOuterInset * 2}" fill="none" stroke="${theme.borderOuter}" stroke-width="4" />
  <rect x="${borderInnerInset}" y="${borderInnerInset}" width="${totalWidth - borderInnerInset * 2}" height="${totalHeight - borderInnerInset * 2}" fill="none" stroke="${theme.borderInner}" stroke-width="1.5" stroke-dasharray="6 3" />

  <!-- Corner Filigrees -->
  ${generateCornerFiligree(borderInnerInset + 2, borderInnerInset + 2, 0, theme.borderOuter)}
  ${generateCornerFiligree(totalWidth - borderInnerInset - 2, borderInnerInset + 2, 90, theme.borderOuter)}
  ${generateCornerFiligree(totalWidth - borderInnerInset - 2, totalHeight - borderInnerInset - 2, 180, theme.borderOuter)}
  ${generateCornerFiligree(borderInnerInset + 2, totalHeight - borderInnerInset - 2, 270, theme.borderOuter)}

  <!-- Map Frame Border -->
  <rect x="${mapFrameX}" y="${mapFrameY}" width="${mapFrameW}" height="${mapFrameH}" fill="none" stroke="${theme.borderOuter}" stroke-width="2.5" filter="url(#cartouche-shadow)" />

  <!-- Embedded Map Area -->
  <g transform="translate(${marginX}, ${marginTop})">
  `

  // Render map tiles
  for (let r = 0; r < map.height; r++) {
    for (let c = 0; c < map.width; c++) {
      const tid = getTileId(c, r)
      const tile = map.tiles[tid] || {
        id: tid,
        col: c,
        row: r,
        terrain: 'ocean',
        domain: 'water',
        overlay: 'none',
        tags: [],
        linkedEventIds: [],
        linkedEntityIds: [],
      }

      const x = c * tileSize
      const y = r * tileSize
      const palette = TERRAIN_PALETTE[tile.terrain] || TERRAIN_PALETTE.ocean
      const fillColor = tile.customColors?.primary || palette.color

      svg += `<rect x="${x}" y="${y}" width="${tileSize}" height="${tileSize}" fill="${fillColor}" stroke="#1c1917" stroke-width="0.35" opacity="0.95" />`

      if (tile.hasRiver) {
        svg += `<path d="M ${x + tileSize / 2} ${y} Q ${x + tileSize * 0.4} ${y + tileSize / 2} ${x + tileSize / 2} ${y + tileSize}" stroke="#2563eb" stroke-width="3" fill="none" stroke-linecap="round" />`
      }
      if (tile.hasRoad) {
        svg += `<path d="M ${x} ${y + tileSize / 2} L ${x + tileSize} ${y + tileSize / 2}" stroke="#78350f" stroke-width="2" stroke-dasharray="3 2" fill="none" />`
      }

      const slots = tile.slots || []
      if (slots.length > 0) {
        svg += `<text x="${x + tileSize / 2}" y="${y + tileSize / 2 + 6}" font-size="16" text-anchor="middle">${slots[0].icon}</text>`
      }

      if (tile.label) {
        svg += `<text x="${x + tileSize / 2}" y="${y + tileSize - 4}" font-family="'Palatino', Georgia, serif" font-size="8.5" font-weight="bold" fill="#ffffff" stroke="#000000" stroke-width="0.3" text-anchor="middle">${escapeXml(tile.label)}</text>`
      }

      if (tile.isUnexplored) {
        svg += `<rect x="${x}" y="${y}" width="${tileSize}" height="${tileSize}" fill="#0f172a" opacity="0.88" />`
        svg += `<text x="${x + tileSize / 2}" y="${y + tileSize / 2 + 5}" font-size="12" fill="#94a3b8" text-anchor="middle">🌫️</text>`
      }
    }
  }

  svg += `
  </g>
  `

  // 2. Ornate Title Cartouche
  if (options.showCartouche !== false) {
    const cartoucheW = Math.min(460, totalWidth - 80)
    const cartoucheH = 76
    const cartoucheX = (totalWidth - cartoucheW) / 2
    const cartoucheY = 32

    svg += `
    <!-- Title Cartouche -->
    <g class="title-cartouche" transform="translate(${cartoucheX}, ${cartoucheY})" filter="url(#cartouche-shadow)">
      <rect width="${cartoucheW}" height="${cartoucheH}" fill="${theme.cartoucheBg}" stroke="${theme.cartoucheBorder}" stroke-width="2.5" rx="8" />
      <rect x="4" y="4" width="${cartoucheW - 8}" height="${cartoucheH - 8}" fill="none" stroke="${theme.borderInner}" stroke-width="1" stroke-dasharray="4 2" rx="6" />

      <!-- Cartouche Filigree Nodes -->
      <circle cx="12" cy="12" r="3" fill="${theme.accentColor}" />
      <circle cx="${cartoucheW - 12}" cy="12" r="3" fill="${theme.accentColor}" />
      <circle cx="12" cy="${cartoucheH - 12}" r="3" fill="${theme.accentColor}" />
      <circle cx="${cartoucheW - 12}" cy="${cartoucheH - 12}" r="3" fill="${theme.accentColor}" />

      <!-- Title & Subtitle -->
      <text x="${cartoucheW / 2}" y="32" font-family="'Cinzel', 'Palatino', Georgia, serif" font-size="20" font-weight="900" fill="${theme.textColor}" text-anchor="middle" letter-spacing="1.5">
        ${escapeXml(title.toUpperCase())}
      </text>
      <text x="${cartoucheW / 2}" y="50" font-family="'Palatino', Georgia, serif" font-size="11" font-weight="bold" fill="${theme.accentColor}" text-anchor="middle">
        ✦ ${escapeXml(subtitle)} ✦
      </text>
      <text x="${cartoucheW / 2}" y="65" font-family="'Palatino', Georgia, serif" font-size="9.5" fill="${theme.textMuted}" text-anchor="middle">
        ${stability.icon} ${stability.status} (${stability.score}/100) · Seed: ${escapeXml(world.generationSettings.seed)}
      </text>
    </g>
    `
  }

  // 3. Compass Rose
  if (options.showCompass !== false) {
    const compassR = 38
    const compassX = totalWidth - marginX - compassR - 10
    const compassY = marginTop + compassR + 14
    svg += generateCompassRoseSvg(compassX, compassY, compassR, theme)
  }

  // 4. Distance Scale Bar
  if (options.showScaleBar !== false) {
    const scaleBarW = 160
    const scaleBarX = marginX + 16
    const scaleBarY = totalHeight - marginBottom + 36
    svg += generateDistanceScaleBar(scaleBarX, scaleBarY, scaleBarW, theme)
  }

  // 5. Cartographic Legend Box
  if (options.showLegend !== false) {
    const legendW = Math.min(520, totalWidth - marginX * 2 - 200)
    const legendH = 54
    const legendX = totalWidth - marginX - legendW
    const legendY = totalHeight - marginBottom + 20

    svg += `
    <!-- Cartographic Legend Box -->
    <g class="map-legend" transform="translate(${legendX}, ${legendY})">
      <rect width="${legendW}" height="${legendH}" fill="${theme.legendBg}" stroke="${theme.borderInner}" stroke-width="1.5" rx="6" opacity="0.95" />
      <text x="14" y="16" font-family="'Cinzel', 'Palatino', Georgia, serif" font-size="9" font-weight="bold" fill="${theme.accentColor}" letter-spacing="1">MAP LEGEND</text>

      <!-- Key Icons & Swatches -->
      <g transform="translate(14, 24)" font-family="'Palatino', Georgia, serif" font-size="9" fill="${theme.textColor}">
        <!-- Top Biomes -->
        ${biomes.topBiomes
          .slice(0, 3)
          .map((b, idx) => {
            const bx = idx * 95
            const p = TERRAIN_PALETTE[b.terrain as keyof typeof TERRAIN_PALETTE]
            return `
            <g transform="translate(${bx}, 0)">
              <rect x="0" y="0" width="12" height="12" fill="${p?.color || '#3b82f6'}" stroke="#1c1917" stroke-width="0.5" rx="1" />
              <text x="16" y="10">${escapeXml(b.label)}</text>
            </g>
            `
          })
          .join('')}

        <!-- Roads & Rivers -->
        <g transform="translate(${3 * 95}, 0)">
          <line x1="0" y1="6" x2="16" y2="6" stroke="#2563eb" stroke-width="2.5" />
          <text x="20" y="10">River</text>
        </g>
        <g transform="translate(${3 * 95 + 60}, 0)">
          <line x1="0" y1="6" x2="16" y2="6" stroke="#78350f" stroke-width="1.5" stroke-dasharray="3 2" />
          <text x="20" y="10">Road</text>
        </g>
      </g>
      <text x="14" y="47" font-family="'Palatino', Georgia, serif" font-size="8.5" fill="${theme.textMuted}">
        ${biomes.settlementCount} Settlement(s) · ${biomes.landmarkCount} Site(s) · ${biomes.landPercent}% Land / ${biomes.waterPercent}% Sea
      </text>
    </g>
    `
  }

  svg += `
</svg>
  `
  return svg.trim()
}

/**
 * Renders an SVG string to a high-DPI PNG Blob using an in-memory Canvas element.
 * Compatible with modern browser DOM environments.
 */
export async function renderCartoucheSvgToPngBlob(
  svgString: string,
  dpiScale = 3
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth * dpiScale
        canvas.height = img.naturalHeight * dpiScale
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          URL.revokeObjectURL(url)
          reject(new Error('Failed to acquire 2D canvas context'))
          return
        }

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        URL.revokeObjectURL(url)

        canvas.toBlob(
          (pngBlob) => {
            if (pngBlob) {
              resolve(pngBlob)
            } else {
              reject(new Error('Canvas toBlob conversion failed'))
            }
          },
          'image/png',
          1.0
        )
      }

      img.onerror = (err) => {
        URL.revokeObjectURL(url)
        reject(err)
      }

      img.src = url
    } catch (e) {
      reject(e)
    }
  })
}
