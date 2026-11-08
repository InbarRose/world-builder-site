import React from 'react'
import { loadCatalogSymbols, resolveSymbolGraphicFallback } from './catalogLoader'

export type CartographicCategory = 'earth' | 'water' | 'plant' | 'feature' | 'settlement' | 'construction'

export interface CartographicSymbolMeta {
  id: string
  name: string
  concept: string
  conceptLabel: string
  variantName: string
  category: CartographicCategory
  icon: string
  description: string
  tags: string[]
  graphicFallback?: string
}

export const CARTOGRAPHIC_SYMBOLS: CartographicSymbolMeta[] = loadCatalogSymbols()
export function getSymbolsByCategory(category: CartographicCategory): CartographicSymbolMeta[] {
  return CARTOGRAPHIC_SYMBOLS.filter((s) => s.category === category)
}

export function getSymbolsByConcept(concept: string): CartographicSymbolMeta[] {
  return CARTOGRAPHIC_SYMBOLS.filter((s) => s.concept === concept)
}

export function getConceptsByCategory(
  category: CartographicCategory
): { id: string; label: string; count: number }[] {
  const symbols = getSymbolsByCategory(category)
  const map = new Map<string, { label: string; count: number }>()
  for (const s of symbols) {
    const existing = map.get(s.concept)
    if (existing) {
      existing.count++
    } else {
      map.set(s.concept, { label: s.conceptLabel, count: 1 })
    }
  }
  return Array.from(map.entries()).map(([id, { label, count }]) => ({
    id,
    label,
    count,
  }))
}

export function findSymbolById(id: string): CartographicSymbolMeta | undefined {
  return CARTOGRAPHIC_SYMBOLS.find((s) => s.id === id)
}

/**
 * Returns clean whiteboard / cartographic vector SVG elements
 * designed to look hand-sketched with ink/marker strokes on a 48x48 tile.
 */
export function renderCartographicMarkerSVG(
  symbolId: string,
  options: {
    color?: string
    strokeWidth?: number
    fillOpacity?: number
    opacity?: number
  } = {}
): React.ReactElement | null {
  const stroke = options.color || '#262626'
  const strokeWidth = options.strokeWidth || 1.3
  const fillOpacity = options.fillOpacity ?? 0.15
  const opacity = options.opacity ?? 0.85

  switch (symbolId) {
    case 'mountain-peak':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="24,8 8,40 40,40" fill={stroke} fillOpacity={fillOpacity} /><path d="M 24 8 Q 22 24, 25 40" strokeWidth={strokeWidth * 1.1} /><line x1="26" y1="20" x2="33" y2="26" strokeWidth={strokeWidth * 0.8} /><line x1="27" y1="26" x2="36" y2="33" strokeWidth={strokeWidth * 0.8} /><line x1="28" y1="32" x2="38" y2="39" strokeWidth={strokeWidth * 0.8} />
        </g>
      )

    case 'mountain-twin':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="17,14 4,39 30,39" fill={stroke} fillOpacity={fillOpacity} /><path d="M 17 14 L 18 39" /><polygon points="32,8 18,39 44,39" fill={stroke} fillOpacity={fillOpacity * 1.2} /><path d="M 32 8 L 30 39" /><line x1="32" y1="22" x2="40" y2="29" strokeWidth={strokeWidth * 0.8} />
        </g>
      )

    case 'mountain-spire':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12,12 7,40 17,40" fill={stroke} fillOpacity={fillOpacity} /><polygon points="24,6 18,40 30,40" fill={stroke} fillOpacity={fillOpacity * 1.2} /><line x1="24" y1="6" x2="25" y2="40" /><polygon points="36,15 31,40 41,40" fill={stroke} fillOpacity={fillOpacity} />
        </g>
      )

    case 'mountain-snow':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="24,8 8,40 40,40" fill={stroke} fillOpacity={fillOpacity} /><path d="M 24 8 L 23 40" /><polygon points="24,8 19,18 24,16 28,19" fill={stroke} fillOpacity={fillOpacity * 2.2} /><line x1="24" y1="8" x2="24" y2="16" />
        </g>
      )

    case 'mountain-range':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12,16 2,40 22,40" fill={stroke} fillOpacity={fillOpacity} /><polygon points="26,8 14,40 38,40" fill={stroke} fillOpacity={fillOpacity * 1.2} /><polygon points="38,18 28,40 46,40" fill={stroke} fillOpacity={fillOpacity * 0.9} /><path d="M 12 16 L 14 40" /><path d="M 26 8 L 26 40" /><path d="M 38 18 L 36 40" />
        </g>
      )

    case 'hill-rolling':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 36 Q 16 22, 28 36 Z" fill={stroke} fillOpacity={fillOpacity} /><path d="M 20 38 Q 32 20, 44 38 Z" fill={stroke} fillOpacity={fillOpacity * 1.1} />
        </g>
      )

    case 'hill-knolls':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 4 38 Q 12 24, 20 38 Z" fill={stroke} fillOpacity={fillOpacity} /><path d="M 16 36 Q 24 18, 34 36 Z" fill={stroke} fillOpacity={fillOpacity * 1.2} /><path d="M 28 39 Q 37 25, 45 39 Z" fill={stroke} fillOpacity={fillOpacity * 0.9} />
        </g>
      )

    case 'hill-rocky':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 38 Q 18 20, 30 38 Z" fill={stroke} fillOpacity={fillOpacity} /><path d="M 22 39 Q 34 22, 44 39 Z" fill={stroke} fillOpacity={fillOpacity * 1.1} /><line x1="14" y1="28" x2="16" y2="34" strokeWidth={strokeWidth * 0.8} /><line x1="28" y1="29" x2="30" y2="35" strokeWidth={strokeWidth * 0.8} /><circle cx="20" cy="35" r="1.2" fill={stroke} />
        </g>
      )

    case 'hill-low':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 4 36 Q 16 28, 28 36" strokeWidth={strokeWidth * 1.2} /><path d="M 18 32 Q 31 22, 44 32" strokeWidth={strokeWidth * 1.2} /><path d="M 8 40 Q 22 34, 38 40" strokeWidth={strokeWidth * 0.9} />
        </g>
      )

    case 'canyon-gorge':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 14 6 Q 22 24, 18 36 L 24 44" strokeWidth={strokeWidth * 1.4} /><path d="M 34 6 Q 26 24, 30 36 L 24 44" strokeWidth={strokeWidth * 1.4} /><line x1="14" y1="12" x2="10" y2="12" /><line x1="17" y1="22" x2="11" y2="22" /><line x1="33" y1="14" x2="37" y2="14" /><line x1="29" y1="26" x2="35" y2="26" /><polygon points="14,6 22,24 18,36 24,44 30,36 26,24 34,6" fill={stroke} fillOpacity={fillOpacity * 1.5} />
        </g>
      )

    case 'cliff-sheer':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 16 L 42 16" strokeWidth={strokeWidth * 1.3} /><line x1="10" y1="16" x2="10" y2="40" strokeWidth={strokeWidth * 1.2} /><line x1="18" y1="16" x2="18" y2="38" strokeWidth={strokeWidth * 1.1} /><line x1="26" y1="16" x2="26" y2="42" strokeWidth={strokeWidth * 1.3} /><line x1="34" y1="16" x2="34" y2="39" strokeWidth={strokeWidth * 1.1} /><line x1="40" y1="16" x2="40" y2="37" strokeWidth={strokeWidth * 1.0} /><polygon points="6,16 42,16 42,40 6,40" fill={stroke} fillOpacity={fillOpacity * 0.8} />
        </g>
      )

    case 'cliff-coastal':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 8 14 L 32 14 Q 30 28, 28 42" strokeWidth={strokeWidth * 1.3} /><polygon points="8,14 32,14 28,42 8,42" fill={stroke} fillOpacity={fillOpacity} /><path d="M 30 38 Q 37 36, 44 38" strokeWidth={strokeWidth * 1.1} /><path d="M 33 42 Q 39 40, 46 42" strokeWidth={strokeWidth * 0.9} />
        </g>
      )

    case 'mesa-plateau':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12,18 36,18 42,38 6,38" fill={stroke} fillOpacity={fillOpacity} /><line x1="12" y1="18" x2="36" y2="18" strokeWidth={strokeWidth * 1.3} /><line x1="16" y1="26" x2="32" y2="26" strokeWidth={strokeWidth * 0.8} strokeDasharray="2 2" /><line x1="9" y1="38" x2="39" y2="38" strokeWidth={strokeWidth * 1.2} />
        </g>
      )

    case 'badland-buttes':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="10,24 18,24 20,40 8,40" fill={stroke} fillOpacity={fillOpacity} /><polygon points="26,14 36,14 39,40 23,40" fill={stroke} fillOpacity={fillOpacity * 1.2} /><line x1="26" y1="14" x2="36" y2="14" strokeWidth={strokeWidth * 1.2} /><line x1="25" y1="24" x2="37" y2="24" strokeWidth={strokeWidth * 0.8} />
        </g>
      )

    case 'desert-dunes':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 22 Q 18 14, 30 24 Q 22 28, 6 22 Z" fill={stroke} fillOpacity={fillOpacity} /><path d="M 18 34 Q 30 26, 42 36 Q 34 40, 18 34 Z" fill={stroke} fillOpacity={fillOpacity * 1.2} /><path d="M 4 36 Q 12 32, 16 38" strokeWidth={strokeWidth * 0.8} />
        </g>
      )

    case 'desert-erg':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 4 18 Q 14 12, 24 18 Q 34 12, 44 18" strokeWidth={strokeWidth * 1.1} /><path d="M 6 26 Q 16 20, 26 26 Q 36 20, 46 26" strokeWidth={strokeWidth * 1.1} /><path d="M 4 34 Q 14 28, 24 34 Q 34 28, 44 34" strokeWidth={strokeWidth * 1.1} /><path d="M 8 42 Q 18 36, 28 42 Q 38 36, 46 42" strokeWidth={strokeWidth * 0.9} />
        </g>
      )

    case 'desert-rocky':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="24" r="3" fill={stroke} fillOpacity={fillOpacity * 1.4} /><circle cx="28" cy="18" r="4" fill={stroke} fillOpacity={fillOpacity * 1.4} /><circle cx="38" cy="30" r="2.5" fill={stroke} fillOpacity={fillOpacity * 1.4} /><circle cx="20" cy="36" r="3.5" fill={stroke} fillOpacity={fillOpacity * 1.4} /><path d="M 6 42 L 44 42" strokeWidth={strokeWidth * 0.8} strokeDasharray="3 3" />
        </g>
      )

    case 'desert-cracked':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 24 8 L 24 24 L 12 34 L 14 44" strokeWidth={strokeWidth * 1.2} /><path d="M 24 24 L 36 32 L 34 44" strokeWidth={strokeWidth * 1.2} /><path d="M 24 16 L 36 12 L 44 18" strokeWidth={strokeWidth * 1.0} /><path d="M 24 18 L 10 14 L 4 20" strokeWidth={strokeWidth * 1.0} /><path d="M 36 32 L 44 34" strokeWidth={strokeWidth * 0.9} /><path d="M 12 34 L 4 36" strokeWidth={strokeWidth * 0.9} />
        </g>
      )

    case 'cave-maw':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="6,40 18,12 30,12 42,40" fill={stroke} fillOpacity={fillOpacity} /><path d="M 16 40 Q 24 20, 32 40 Z" fill={stroke} fillOpacity={fillOpacity * 2.5} /><line x1="24" y1="20" x2="24" y2="40" strokeWidth={strokeWidth * 0.6} />
        </g>
      )

    case 'cave-cliff':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 4 10 L 44 10" strokeWidth={strokeWidth * 1.3} /><line x1="8" y1="10" x2="8" y2="40" strokeWidth={strokeWidth * 1.2} /><line x1="40" y1="10" x2="40" y2="40" strokeWidth={strokeWidth * 1.2} /><path d="M 16 40 Q 24 22, 32 40 Z" fill={stroke} fillOpacity={fillOpacity * 3} /><line x1="20" y1="20" x2="28" y2="20" strokeWidth={strokeWidth * 0.8} />
        </g>
      )

    case 'cave-sinkhole':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="24" cy="24" rx="16" ry="10" fill={stroke} fillOpacity={fillOpacity * 2.5} strokeWidth={strokeWidth * 1.3} /><ellipse cx="24" cy="24" rx="11" ry="6" fill={stroke} fillOpacity={fillOpacity * 3.5} /><line x1="14" y1="24" x2="18" y2="24" strokeWidth={strokeWidth * 0.8} /><line x1="30" y1="24" x2="34" y2="24" strokeWidth={strokeWidth * 0.8} />
        </g>
      )

    case 'volcano-active':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="6,40 18,18 30,18 42,40" fill={stroke} fillOpacity={fillOpacity} /><path d="M 18 18 Q 24 24, 30 18" strokeWidth={strokeWidth * 1.2} /><path d="M 21 16 Q 16 8, 20 4" strokeWidth={strokeWidth * 1.1} /><path d="M 24 16 Q 25 8, 28 4" strokeWidth={strokeWidth * 1.1} /><path d="M 27 16 Q 32 8, 29 4" strokeWidth={strokeWidth * 1.1} />
        </g>
      )

    case 'volcano-caldera':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="4,38 14,20 34,20 44,38" fill={stroke} fillOpacity={fillOpacity} /><ellipse cx="24" cy="24" rx="10" ry="5" fill={stroke} fillOpacity={fillOpacity * 2} /><path d="M 14 20 Q 24 28, 34 20" strokeWidth={strokeWidth * 1.2} />
        </g>
      )

    case 'river-meander':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 24 4 C 10 14, 38 22, 22 34 C 14 40, 20 44, 24 46" strokeWidth={strokeWidth * 1.5} fill="none" /><path d="M 28 6 C 16 15, 42 23, 26 35 C 18 41, 24 44, 28 46" strokeWidth={strokeWidth * 0.8} strokeDasharray="3 2" fill="none" />
        </g>
      )

    case 'river-braided':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 16 4 Q 28 16, 18 30 Q 12 40, 20 44" strokeWidth={strokeWidth * 1.2} fill="none" /><path d="M 28 4 Q 18 20, 30 32 Q 36 40, 28 44" strokeWidth={strokeWidth * 1.2} fill="none" /><path d="M 22 16 Q 24 24, 22 32" strokeWidth={strokeWidth * 1.0} fill="none" />
        </g>
      )

    case 'river-delta':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 24 6 L 24 18 L 10 42" strokeWidth={strokeWidth * 1.3} fill="none" /><path d="M 24 18 L 24 42" strokeWidth={strokeWidth * 1.3} fill="none" /><path d="M 24 18 L 38 42" strokeWidth={strokeWidth * 1.3} fill="none" /><path d="M 18 28 L 20 42" strokeWidth={strokeWidth * 0.9} fill="none" /><path d="M 30 28 L 28 42" strokeWidth={strokeWidth * 0.9} fill="none" />
        </g>
      )

    case 'river-rapids':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 16 6 L 24 18 L 18 30 L 26 42" strokeWidth={strokeWidth * 1.4} fill="none" /><path d="M 28 8 L 32 18 L 26 30 L 34 42" strokeWidth={strokeWidth * 1.1} fill="none" /><circle cx="21" cy="18" r="1.5" fill={stroke} /><circle cx="23" cy="30" r="1.5" fill={stroke} />
        </g>
      )

    case 'waterfall-cataract':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 8 12 L 40 12" strokeWidth={strokeWidth * 1.4} /><line x1="14" y1="12" x2="14" y2="38" strokeWidth={strokeWidth * 1.2} /><line x1="20" y1="12" x2="20" y2="40" strokeWidth={strokeWidth * 1.4} /><line x1="26" y1="12" x2="26" y2="39" strokeWidth={strokeWidth * 1.3} /><line x1="32" y1="12" x2="32" y2="38" strokeWidth={strokeWidth * 1.1} /><path d="M 10 40 Q 24 36, 38 40" strokeWidth={strokeWidth * 1.2} />
        </g>
      )

    case 'waterfall-cascades':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <line x1="10" y1="10" x2="38" y2="10" strokeWidth={strokeWidth * 1.3} /><line x1="14" y1="10" x2="14" y2="20" strokeWidth={strokeWidth * 1.1} /><line x1="30" y1="10" x2="30" y2="20" strokeWidth={strokeWidth * 1.1} /><line x1="8" y1="20" x2="36" y2="20" strokeWidth={strokeWidth * 1.3} /><line x1="18" y1="20" x2="18" y2="32" strokeWidth={strokeWidth * 1.1} /><line x1="28" y1="20" x2="28" y2="32" strokeWidth={strokeWidth * 1.1} /><line x1="12" y1="32" x2="40" y2="32" strokeWidth={strokeWidth * 1.3} /><path d="M 14 42 Q 24 38, 36 42" strokeWidth={strokeWidth * 1.1} />
        </g>
      )

    case 'waterfall-gorge':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="6,6 16,6 14,42 6,42" fill={stroke} fillOpacity={fillOpacity} /><polygon points="32,6 42,6 42,42 34,42" fill={stroke} fillOpacity={fillOpacity} /><line x1="21" y1="8" x2="21" y2="40" strokeWidth={strokeWidth * 1.3} /><line x1="27" y1="8" x2="27" y2="40" strokeWidth={strokeWidth * 1.3} /><ellipse cx="24" cy="40" rx="8" ry="3" fill={stroke} fillOpacity={fillOpacity * 2} />
        </g>
      )

    case 'lake-basin':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 10 24 C 8 14, 24 8, 36 14 C 44 20, 42 34, 30 38 C 18 42, 12 34, 10 24 Z" fill={stroke} fillOpacity={fillOpacity} strokeWidth={strokeWidth * 1.3} /><path d="M 18 22 Q 26 18, 34 22" strokeWidth={strokeWidth * 0.9} fill="none" /><path d="M 16 28 Q 24 24, 30 28" strokeWidth={strokeWidth * 0.9} fill="none" />
        </g>
      )

    case 'lake-tarn':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12,18 20,4 28,18" fill={stroke} fillOpacity={fillOpacity * 0.6} /><polygon points="26,16 34,6 42,16" fill={stroke} fillOpacity={fillOpacity * 0.6} /><ellipse cx="24" cy="30" rx="14" ry="7" fill={stroke} fillOpacity={fillOpacity * 1.5} strokeWidth={strokeWidth * 1.2} /><path d="M 16 30 Q 24 26, 32 30" strokeWidth={strokeWidth * 0.8} fill="none" />
        </g>
      )

    case 'lake-oxbow':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 12 18 C 10 8, 38 8, 36 18 C 34 28, 22 28, 22 22 C 22 16, 26 16, 26 18" strokeWidth={strokeWidth * 1.4} fill={stroke} fillOpacity={fillOpacity} /><path d="M 6 38 C 16 32, 32 32, 42 38" strokeWidth={strokeWidth * 1.1} strokeDasharray="3 2" fill="none" />
        </g>
      )

    case 'lake-crater':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="24" cy="24" rx="18" ry="12" strokeWidth={strokeWidth * 1.4} fill={stroke} fillOpacity={fillOpacity * 0.7} /><ellipse cx="24" cy="24" rx="11" ry="6" strokeWidth={strokeWidth * 1.0} fill={stroke} fillOpacity={fillOpacity * 2.5} /><circle cx="24" cy="24" r="2.5" fill={stroke} />
        </g>
      )

    case 'swamp-mangrove':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 14 18 Q 24 10, 34 18" strokeWidth={strokeWidth * 1.3} /><path d="M 14 18 L 8 40" strokeWidth={strokeWidth * 1.2} /><path d="M 18 18 L 16 40" strokeWidth={strokeWidth * 1.2} /><path d="M 24 18 L 24 40" strokeWidth={strokeWidth * 1.2} /><path d="M 30 18 L 32 40" strokeWidth={strokeWidth * 1.2} /><path d="M 34 18 L 40 40" strokeWidth={strokeWidth * 1.2} /><ellipse cx="24" cy="14" rx="14" ry="6" fill={stroke} fillOpacity={fillOpacity} />
        </g>
      )

    case 'swamp-peat':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="14" cy="26" rx="8" ry="4" fill={stroke} fillOpacity={fillOpacity * 1.5} /><ellipse cx="32" cy="22" rx="10" ry="5" fill={stroke} fillOpacity={fillOpacity * 1.5} /><path d="M 6 36 Q 24 30, 42 36" strokeWidth={strokeWidth * 1.2} /><line x1="12" y1="16" x2="14" y2="24" strokeWidth={strokeWidth * 0.9} /><line x1="30" y1="12" x2="31" y2="20" strokeWidth={strokeWidth * 0.9} />
        </g>
      )

    case 'marsh-reeds':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <line x1="14" y1="36" x2="14" y2="12" strokeWidth={strokeWidth * 1.2} /><rect x="12.5" y="14" width="3" height="10" rx="1.5" fill={stroke} /><line x1="24" y1="38" x2="24" y2="8" strokeWidth={strokeWidth * 1.3} /><rect x="22.5" y="10" width="3" height="12" rx="1.5" fill={stroke} /><line x1="34" y1="36" x2="34" y2="14" strokeWidth={strokeWidth * 1.2} /><rect x="32.5" y="16" width="3" height="10" rx="1.5" fill={stroke} /><path d="M 6 38 Q 24 34, 42 38" strokeWidth={strokeWidth * 1.1} />
        </g>
      )

    case 'marsh-fen':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 22 Q 18 18, 30 22" strokeWidth={strokeWidth * 1.1} /><path d="M 16 34 Q 30 30, 44 34" strokeWidth={strokeWidth * 1.1} /><path d="M 10 20 L 8 10" strokeWidth={strokeWidth * 1.1} /><path d="M 14 20 L 16 8" strokeWidth={strokeWidth * 1.1} /><path d="M 28 32 L 26 22" strokeWidth={strokeWidth * 1.1} /><path d="M 32 32 L 35 20" strokeWidth={strokeWidth * 1.1} />
        </g>
      )

    case 'tidal-pools':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 16 C 14 12, 28 12, 42 16" strokeWidth={strokeWidth * 1.3} /><ellipse cx="14" cy="28" rx="6" ry="4" fill={stroke} fillOpacity={fillOpacity * 2} /><ellipse cx="32" cy="30" rx="8" ry="5" fill={stroke} fillOpacity={fillOpacity * 2} /><circle cx="22" cy="22" r="3" fill={stroke} fillOpacity={fillOpacity * 2} /><path d="M 8 42 Q 24 38, 40 42" strokeWidth={strokeWidth * 0.9} />
        </g>
      )

    case 'estuary-bay':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 10 C 18 10, 18 36, 6 42" strokeWidth={strokeWidth * 1.4} /><path d="M 42 10 C 30 10, 30 36, 42 42" strokeWidth={strokeWidth * 1.4} /><path d="M 24 6 L 24 22" strokeWidth={strokeWidth * 1.2} /><ellipse cx="24" cy="30" rx="8" ry="4" fill={stroke} fillOpacity={fillOpacity} />
        </g>
      )

    case 'atoll-reef':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="24" cy="24" rx="18" ry="12" strokeWidth={strokeWidth * 1.4} strokeDasharray="6 3" fill="none" /><ellipse cx="24" cy="24" rx="9" ry="6" fill={stroke} fillOpacity={fillOpacity * 1.5} />
        </g>
      )

    case 'fjord-sheer':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="4,6 16,6 14,42 4,42" fill={stroke} fillOpacity={fillOpacity} /><polygon points="32,6 44,6 44,42 34,42" fill={stroke} fillOpacity={fillOpacity} /><path d="M 24 6 L 24 42" strokeWidth={strokeWidth * 1.6} /><path d="M 18 30 L 24 34 L 30 30" strokeWidth={strokeWidth * 0.8} />
        </g>
      )

    case 'glacier-valley':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="6,12 18,38 22,38 14,12" fill={stroke} fillOpacity={fillOpacity * 1.5} /><polygon points="42,12 30,38 26,38 34,12" fill={stroke} fillOpacity={fillOpacity * 1.5} /><path d="M 24 8 L 24 40" strokeWidth={strokeWidth * 1.3} strokeDasharray="3 3" /><line x1="18" y1="20" x2="30" y2="20" strokeWidth={strokeWidth * 0.8} />
        </g>
      )

    case 'glacier-crevasse':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="6,36 14,16 26,22 22,38" fill={stroke} fillOpacity={fillOpacity} /><polygon points="26,38 26,14 42,20 38,38" fill={stroke} fillOpacity={fillOpacity * 1.2} /><path d="M 24 10 L 26 38" strokeWidth={strokeWidth * 1.4} />
        </g>
      )

    case 'glacier-shelf':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="14" width="26" height="24" fill={stroke} fillOpacity={fillOpacity * 1.4} strokeWidth={strokeWidth * 1.2} /><polygon points="36,24 44,24 41,36 34,36" fill={stroke} fillOpacity={fillOpacity * 1.2} /><path d="M 4 40 L 44 40" strokeWidth={strokeWidth * 1.1} />
        </g>
      )

    case 'maelstrom-whirlpool':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 24 24 A 4 4 0 0 1 20 20 A 8 8 0 0 1 28 16 A 12 12 0 0 1 36 28 A 16 16 0 0 1 12 36 A 20 20 0 0 1 4 20" strokeWidth={strokeWidth * 1.2} fill="none" />
        </g>
      )

    case 'tidal-rip':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 18 Q 16 12, 26 18 Q 36 12, 44 18" strokeWidth={strokeWidth * 1.1} /><path d="M 4 28 Q 14 22, 24 28 Q 34 22, 44 28" strokeWidth={strokeWidth * 1.1} /><path d="M 24 10 L 24 38 L 20 32 M 24 38 L 28 32" strokeWidth={strokeWidth * 1.3} />
        </g>
      )

    case 'spring-headwater':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="24" cy="34" rx="14" ry="7" fill={stroke} fillOpacity={fillOpacity * 1.5} /><path d="M 24 34 Q 24 12, 18 8 M 24 34 Q 24 12, 30 8" strokeWidth={strokeWidth * 1.3} fill="none" /><circle cx="24" cy="34" r="2.5" fill={stroke} />
        </g>
      )

    case 'hotspring-geothermal':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="24" cy="30" rx="16" ry="8" fill={stroke} fillOpacity={fillOpacity * 1.8} /><path d="M 18 24 Q 16 14, 20 10 M 24 24 Q 22 12, 26 8 M 30 24 Q 28 14, 32 10" strokeWidth={strokeWidth * 1.1} fill="none" />
        </g>
      )

    case 'trench-abyssal':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 12 L 20 40 L 28 40 L 42 12" strokeWidth={strokeWidth * 1.4} fill={stroke} fillOpacity={fillOpacity * 2.5} /><line x1="24" y1="12" x2="24" y2="40" strokeWidth={strokeWidth * 0.9} strokeDasharray="2 2" />
        </g>
      )

    case 'forest-deciduous':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="16" cy="20" r="9" fill={stroke} fillOpacity={fillOpacity} /><line x1="16" y1="29" x2="16" y2="40" strokeWidth={strokeWidth * 1.2} /><circle cx="32" cy="18" r="10" fill={stroke} fillOpacity={fillOpacity * 1.2} /><line x1="32" y1="28" x2="32" y2="40" strokeWidth={strokeWidth * 1.2} /><circle cx="24" cy="26" r="8" fill={stroke} fillOpacity={fillOpacity} /><line x1="24" y1="34" x2="24" y2="41" strokeWidth={strokeWidth * 1.2} />
        </g>
      )

    case 'forest-taiga':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="14,14 6,38 22,38" fill={stroke} fillOpacity={fillOpacity} /><line x1="14" y1="14" x2="14" y2="42" /><polygon points="26,8 16,36 36,36" fill={stroke} fillOpacity={fillOpacity * 1.2} /><line x1="26" y1="8" x2="26" y2="42" /><polygon points="36,18 28,40 44,40" fill={stroke} fillOpacity={fillOpacity} /><line x1="36" y1="18" x2="36" y2="42" />
        </g>
      )

    case 'forest-redwood':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="24,4 12,38 36,38" fill={stroke} fillOpacity={fillOpacity * 1.3} /><rect x="21" y="38" width="6" height="6" fill={stroke} fillOpacity={fillOpacity * 2} /><polygon points="12,14 4,38 20,38" fill={stroke} fillOpacity={fillOpacity * 0.9} /><polygon points="36,14 28,38 44,38" fill={stroke} fillOpacity={fillOpacity * 0.9} />
        </g>
      )

    case 'forest-sparse':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="14" cy="22" r="7" fill={stroke} fillOpacity={fillOpacity} /><line x1="14" y1="29" x2="14" y2="40" strokeWidth={strokeWidth * 1.1} /><circle cx="34" cy="24" r="8" fill={stroke} fillOpacity={fillOpacity} /><line x1="34" y1="32" x2="34" y2="41" strokeWidth={strokeWidth * 1.1} /><path d="M 22 36 L 24 30 L 26 36" strokeWidth={strokeWidth * 0.8} />
        </g>
      )

    case 'forest-dead':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 16 42 L 16 16 L 10 10 M 16 22 L 22 14" strokeWidth={strokeWidth * 1.3} /><path d="M 32 42 L 32 12 L 26 6 M 32 18 L 38 12 M 32 26 L 26 22" strokeWidth={strokeWidth * 1.3} />
        </g>
      )

    case 'jungle-dense':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="14" cy="20" r="8" fill={stroke} fillOpacity={fillOpacity * 1.5} /><circle cx="28" cy="16" r="10" fill={stroke} fillOpacity={fillOpacity * 1.5} /><circle cx="38" cy="22" r="7" fill={stroke} fillOpacity={fillOpacity * 1.5} /><path d="M 14 28 Q 12 36, 8 42" strokeWidth={strokeWidth * 1.2} /><path d="M 28 26 L 28 42" strokeWidth={strokeWidth * 1.4} /><path d="M 38 29 Q 40 36, 44 42" strokeWidth={strokeWidth * 1.2} /><path d="M 18 24 Q 24 32, 22 42" strokeWidth={strokeWidth * 0.8} strokeDasharray="2 2" />
        </g>
      )

    case 'rainforest-canopy':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="24" cy="14" rx="16" ry="8" fill={stroke} fillOpacity={fillOpacity * 1.6} strokeWidth={strokeWidth * 1.3} /><path d="M 24 22 L 24 42" strokeWidth={strokeWidth * 1.6} /><path d="M 20 22 Q 16 32, 14 42" strokeWidth={strokeWidth * 1.0} /><path d="M 28 22 Q 32 32, 34 42" strokeWidth={strokeWidth * 1.0} /><line x1="8" y1="42" x2="40" y2="42" strokeWidth={strokeWidth * 1.0} />
        </g>
      )

    case 'jungle-palms':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 20 40 Q 24 24, 20 14" strokeWidth={strokeWidth * 1.4} /><path d="M 20 14 Q 10 12, 6 18" strokeWidth={strokeWidth * 1.1} /><path d="M 20 14 Q 14 6, 16 2" strokeWidth={strokeWidth * 1.1} /><path d="M 20 14 Q 26 6, 24 2" strokeWidth={strokeWidth * 1.1} /><path d="M 20 14 Q 30 10, 32 16" strokeWidth={strokeWidth * 1.1} /><path d="M 20 14 Q 28 18, 30 24" strokeWidth={strokeWidth * 1.1} />
        </g>
      )

    case 'jungle-cloud':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 10 20 Q 24 14, 38 20" strokeWidth={strokeWidth * 1.2} /><circle cx="16" cy="22" r="7" fill={stroke} fillOpacity={fillOpacity} /><circle cx="32" cy="22" r="8" fill={stroke} fillOpacity={fillOpacity} /><line x1="16" y1="29" x2="16" y2="40" strokeWidth={strokeWidth * 1.2} /><line x1="32" y1="30" x2="32" y2="40" strokeWidth={strokeWidth * 1.2} /><path d="M 4 14 Q 14 8, 24 14 Q 34 8, 44 14" strokeWidth={strokeWidth * 0.9} strokeDasharray="3 2" />
        </g>
      )

    case 'rainforest-vines':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 8 8 Q 14 24, 10 42" strokeWidth={strokeWidth * 1.2} /><path d="M 20 6 Q 26 22, 22 42" strokeWidth={strokeWidth * 1.2} /><path d="M 32 8 Q 38 26, 34 42" strokeWidth={strokeWidth * 1.2} /><path d="M 40 6 Q 46 24, 42 42" strokeWidth={strokeWidth * 1.2} /><line x1="4" y1="10" x2="44" y2="10" strokeWidth={strokeWidth * 1.4} />
        </g>
      )

    case 'grass-steppe':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 8 38 L 12 20 L 16 38" strokeWidth={strokeWidth * 1.2} /><path d="M 12 20 L 14 38" strokeWidth={strokeWidth * 0.9} /><path d="M 26 38 L 30 16 L 34 38" strokeWidth={strokeWidth * 1.3} /><path d="M 30 16 L 28 38" strokeWidth={strokeWidth * 0.9} /><path d="M 38 40 L 41 26 L 44 40" strokeWidth={strokeWidth * 1.1} />
        </g>
      )

    case 'grass-tall':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 16 42 Q 10 24, 8 12" strokeWidth={strokeWidth * 1.2} /><path d="M 16 42 Q 16 22, 18 8" strokeWidth={strokeWidth * 1.3} /><path d="M 16 42 Q 22 24, 26 14" strokeWidth={strokeWidth * 1.2} /><path d="M 34 42 Q 30 26, 28 16" strokeWidth={strokeWidth * 1.1} /><path d="M 34 42 Q 36 22, 38 10" strokeWidth={strokeWidth * 1.2} /><path d="M 34 42 Q 40 26, 44 18" strokeWidth={strokeWidth * 1.1} />
        </g>
      )

    case 'savanna-acacia':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="24" cy="14" rx="15" ry="5" fill={stroke} fillOpacity={fillOpacity * 1.4} /><path d="M 24 19 L 24 38" strokeWidth={strokeWidth * 1.4} /><path d="M 24 26 L 16 18" strokeWidth={strokeWidth * 1.1} /><path d="M 24 24 L 32 18" strokeWidth={strokeWidth * 1.1} /><line x1="8" y1="40" x2="40" y2="40" strokeWidth={strokeWidth * 0.8} />
        </g>
      )

    case 'meadow-wildflower':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="14" cy="24" r="4" fill={stroke} fillOpacity={fillOpacity * 2} /><line x1="14" y1="28" x2="14" y2="40" strokeWidth={strokeWidth * 1.1} /><circle cx="32" cy="18" r="5" fill={stroke} fillOpacity={fillOpacity * 2} /><line x1="32" y1="23" x2="32" y2="40" strokeWidth={strokeWidth * 1.2} /><circle cx="24" cy="30" r="3" fill={stroke} fillOpacity={fillOpacity * 2} /><line x1="24" y1="33" x2="24" y2="41" strokeWidth={strokeWidth * 1.0} />
        </g>
      )

    case 'flora-wetland':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="14" cy="30" rx="7" ry="3" fill={stroke} fillOpacity={fillOpacity * 1.8} /><ellipse cx="32" cy="32" rx="9" ry="4" fill={stroke} fillOpacity={fillOpacity * 1.8} /><circle cx="24" cy="18" r="3.5" fill={stroke} fillOpacity={fillOpacity * 2.5} /><line x1="24" y1="21.5" x2="24" y2="34" strokeWidth={strokeWidth * 1.1} />
        </g>
      )

    case 'thicket-ironwood':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 36 Q 16 18, 26 36" strokeWidth={strokeWidth * 1.3} /><path d="M 20 36 Q 30 14, 40 36" strokeWidth={strokeWidth * 1.3} /><line x1="12" y1="24" x2="8" y2="20" strokeWidth={strokeWidth * 1.1} /><line x1="18" y1="20" x2="22" y2="14" strokeWidth={strokeWidth * 1.1} /><line x1="32" y1="20" x2="36" y2="16" strokeWidth={strokeWidth * 1.1} />
        </g>
      )

    case 'bamboo-grove':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="42" x2="12" y2="8" strokeWidth={strokeWidth * 1.4} /><line x1="10" y1="20" x2="14" y2="20" strokeWidth={strokeWidth * 1.5} /><line x1="10" y1="32" x2="14" y2="32" strokeWidth={strokeWidth * 1.5} /><line x1="24" y1="42" x2="24" y2="4" strokeWidth={strokeWidth * 1.5} /><line x1="22" y1="16" x2="26" y2="16" strokeWidth={strokeWidth * 1.6} /><line x1="22" y1="28" x2="26" y2="28" strokeWidth={strokeWidth * 1.6} /><line x1="36" y1="42" x2="36" y2="10" strokeWidth={strokeWidth * 1.3} /><line x1="34" y1="22" x2="38" y2="22" strokeWidth={strokeWidth * 1.4} />
        </g>
      )

    case 'fungal-mycelium':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 10 24 Q 20 10, 30 24 Z" fill={stroke} fillOpacity={fillOpacity * 1.5} /><path d="M 18 24 L 18 42 L 22 42 L 22 24" fill={stroke} fillOpacity={fillOpacity} /><circle cx="20" cy="18" r="1.5" fill="#fafaf9" /><path d="M 28 30 Q 36 18, 44 30 Z" fill={stroke} fillOpacity={fillOpacity * 1.3} /><path d="M 35 30 L 35 42 L 38 42 L 38 30" fill={stroke} fillOpacity={fillOpacity} />
        </g>
      )

    case 'geyser-basin':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="24" cy="36" rx="14" ry="5" fill={stroke} fillOpacity={fillOpacity * 1.5} /><path d="M 24 36 L 24 6 M 21 34 Q 16 18, 18 10 M 27 34 Q 32 18, 30 10" strokeWidth={strokeWidth * 1.3} strokeDasharray="4 2" />
        </g>
      )

    case 'geyser-eruption':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 14 42 Q 24 38, 34 42" strokeWidth={strokeWidth * 1.3} /><path d="M 24 40 L 24 4" strokeWidth={strokeWidth * 1.8} /><path d="M 24 4 Q 14 14, 10 26" strokeWidth={strokeWidth * 1.1} fill="none" /><path d="M 24 4 Q 34 14, 38 26" strokeWidth={strokeWidth * 1.1} fill="none" />
        </g>
      )

    case 'thermal-mudpot':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="24" cy="30" rx="16" ry="8" fill={stroke} fillOpacity={fillOpacity * 2} /><circle cx="18" cy="24" r="3" fill="none" strokeWidth={strokeWidth * 1.2} /><circle cx="28" cy="20" r="4" fill="none" strokeWidth={strokeWidth * 1.2} /><circle cx="22" cy="14" r="2.5" fill="none" strokeWidth={strokeWidth * 1.0} />
        </g>
      )

    case 'crater-impact':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="24" cy="26" rx="16" ry="9" strokeWidth={strokeWidth * 1.4} fill={stroke} fillOpacity={fillOpacity} /><ellipse cx="24" cy="26" rx="9" ry="5" fill={stroke} fillOpacity={fillOpacity * 2.2} /><line x1="8" y1="26" x2="2" y2="26" /><line x1="40" y1="26" x2="46" y2="26" /><line x1="16" y1="18" x2="10" y2="12" /><line x1="32" y1="18" x2="38" y2="12" />
        </g>
      )

    case 'crater-caldera':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="6,38 14,18 34,18 42,38" fill={stroke} fillOpacity={fillOpacity} /><ellipse cx="24" cy="26" rx="11" ry="6" fill={stroke} fillOpacity={fillOpacity * 2} /><line x1="14" y1="18" x2="34" y2="18" strokeWidth={strokeWidth * 1.3} />
        </g>
      )

    case 'crater-pit':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="24" cy="24" rx="16" ry="14" strokeWidth={strokeWidth * 1.4} fill={stroke} fillOpacity={fillOpacity * 3} /><ellipse cx="24" cy="24" rx="10" ry="8" fill="#000" /><line x1="24" y1="6" x2="24" y2="10" /><line x1="24" y1="38" x2="24" y2="42" />
        </g>
      )

    case 'lava-fissure':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 8 10 L 22 22 L 18 32 L 36 42" strokeWidth={strokeWidth * 1.8} fill="none" /><line x1="22" y1="22" x2="38" y2="16" strokeWidth={strokeWidth * 1.3} /><line x1="18" y1="32" x2="8" y2="38" strokeWidth={strokeWidth * 1.3} /><circle cx="22" cy="22" r="2" fill={stroke} />
        </g>
      )

    case 'lava-river':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 20 4 C 10 16, 36 24, 24 44" strokeWidth={strokeWidth * 2.2} fill="none" /><path d="M 24 6 C 14 18, 40 26, 28 44" strokeWidth={strokeWidth * 1.0} fill="none" strokeDasharray="2 2" />
        </g>
      )

    case 'lava-field':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 18 Q 16 12, 26 20 T 44 18" strokeWidth={strokeWidth * 1.3} /><path d="M 4 28 Q 16 22, 28 30 T 44 26" strokeWidth={strokeWidth * 1.3} /><path d="M 8 38 Q 20 32, 32 38 T 46 36" strokeWidth={strokeWidth * 1.3} />
        </g>
      )

    case 'salt-hexagons':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="16,14 24,10 32,14 32,22 24,26 16,22" strokeWidth={strokeWidth * 1.2} fill="none" /><polygon points="24,26 32,22 40,26 40,34 32,38 24,34" strokeWidth={strokeWidth * 1.2} fill="none" /><polygon points="8,26 16,22 24,26 24,34 16,38 8,34" strokeWidth={strokeWidth * 1.2} fill="none" />
        </g>
      )

    case 'salt-pan':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <line x1="6" y1="18" x2="42" y2="18" strokeWidth={strokeWidth * 1.2} /><line x1="4" y1="26" x2="44" y2="26" strokeWidth={strokeWidth * 1.2} /><line x1="8" y1="34" x2="40" y2="34" strokeWidth={strokeWidth * 1.2} /><circle cx="20" cy="14" r="1.5" fill={stroke} /><circle cx="34" cy="22" r="1.5" fill={stroke} />
        </g>
      )

    case 'salt-pillars':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12,14 8,40 16,40" fill={stroke} fillOpacity={fillOpacity * 1.5} /><polygon points="24,8 19,40 29,40" fill={stroke} fillOpacity={fillOpacity * 2} /><polygon points="36,16 32,40 40,40" fill={stroke} fillOpacity={fillOpacity * 1.5} />
        </g>
      )

    case 'wind-gale':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 14 Q 24 10, 36 14 Q 42 16, 40 20 Q 36 22, 34 18" strokeWidth={strokeWidth * 1.3} fill="none" /><path d="M 10 24 Q 28 20, 38 24 Q 44 26, 42 30 Q 38 32, 36 28" strokeWidth={strokeWidth * 1.3} fill="none" /><path d="M 4 34 Q 18 30, 28 34" strokeWidth={strokeWidth * 1.1} fill="none" />
        </g>
      )

    case 'wind-vortex':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="24" cy="10" rx="16" ry="4" strokeWidth={strokeWidth * 1.2} fill="none" /><ellipse cx="24" cy="18" rx="12" ry="3.5" strokeWidth={strokeWidth * 1.2} fill="none" /><ellipse cx="24" cy="26" rx="8" ry="3" strokeWidth={strokeWidth * 1.2} fill="none" /><ellipse cx="24" cy="34" rx="4" ry="2" strokeWidth={strokeWidth * 1.2} fill="none" /><line x1="24" y1="36" x2="24" y2="42" strokeWidth={strokeWidth * 1.4} />
        </g>
      )

    case 'wind-storm':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 12 24 C 8 24, 6 18, 12 16 C 12 10, 22 8, 26 12 C 32 8, 42 12, 38 20 C 44 22, 42 26, 36 26 Z" fill={stroke} fillOpacity={fillOpacity * 1.5} /><polygon points="22,26 18,34 24,34 20,44 28,32 23,32 26,26" fill={stroke} />
        </g>
      )

    case 'water-currents':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 16 C 18 8, 30 24, 42 16" strokeWidth={strokeWidth * 1.3} fill="none" /><path d="M 38 12 L 42 16 L 36 20" strokeWidth={strokeWidth * 1.3} fill="none" /><path d="M 6 32 C 18 24, 30 40, 42 32" strokeWidth={strokeWidth * 1.3} fill="none" /><path d="M 38 28 L 42 32 L 36 36" strokeWidth={strokeWidth * 1.3} fill="none" />
        </g>
      )

    case 'current-gyre':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="24" cy="24" rx="16" ry="12" strokeWidth={strokeWidth * 1.3} strokeDasharray="8 4" fill="none" /><path d="M 36 14 L 40 18 L 34 20" strokeWidth={strokeWidth * 1.2} fill="none" /><path d="M 12 34 L 8 30 L 14 28" strokeWidth={strokeWidth * 1.2} fill="none" />
        </g>
      )

    case 'resource-mineral':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="6,38 20,12 36,12 42,38" fill={stroke} fillOpacity={fillOpacity} /><path d="M 16 38 L 22 20 L 32 20 L 28 38" strokeWidth={strokeWidth * 1.2} fill={stroke} fillOpacity={fillOpacity * 2.5} /><circle cx="24" cy="26" r="2" fill="#fafaf9" />
        </g>
      )

    case 'resource-gem':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="24,6 14,18 20,40 28,40 34,18" fill={stroke} fillOpacity={fillOpacity * 1.8} strokeWidth={strokeWidth * 1.3} /><polygon points="12,18 6,24 12,38" fill={stroke} fillOpacity={fillOpacity} /><polygon points="36,18 42,24 36,38" fill={stroke} fillOpacity={fillOpacity} /><line x1="24" y1="6" x2="24" y2="40" strokeWidth={strokeWidth * 0.9} />
        </g>
      )

    case 'crystal-cavern':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="6,40 18,10 32,10 42,40" fill={stroke} fillOpacity={fillOpacity} /><polygon points="18,40 22,22 26,40" fill={stroke} fillOpacity={fillOpacity * 2.2} /><polygon points="26,40 30,16 34,40" fill={stroke} fillOpacity={fillOpacity * 2.2} /><polygon points="12,40 16,28 18,40" fill={stroke} fillOpacity={fillOpacity * 2.2} />
        </g>
      )

    case 'resource-quarry':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="28" width="32" height="12" fill={stroke} fillOpacity={fillOpacity} strokeWidth={strokeWidth * 1.2} /><rect x="14" y="18" width="20" height="10" fill={stroke} fillOpacity={fillOpacity * 1.4} strokeWidth={strokeWidth * 1.2} /><rect x="18" y="10" width="12" height="8" fill={stroke} fillOpacity={fillOpacity * 1.8} strokeWidth={strokeWidth * 1.2} />
        </g>
      )

    case 'titan-bones':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 8 38 C 12 18, 18 10, 24 10 C 30 10, 36 18, 40 38" strokeWidth={strokeWidth * 1.4} fill="none" /><path d="M 12 38 C 16 22, 20 16, 24 16 C 28 16, 32 22, 36 38" strokeWidth={strokeWidth * 1.1} fill="none" /><line x1="24" y1="8" x2="24" y2="40" strokeWidth={strokeWidth * 1.3} />
        </g>
      )

    case 'megalith-ring':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <rect x="10" y="16" width="6" height="24" fill={stroke} fillOpacity={fillOpacity * 1.5} /><rect x="32" y="16" width="6" height="24" fill={stroke} fillOpacity={fillOpacity * 1.5} /><rect x="8" y="12" width="32" height="6" rx="1" fill={stroke} fillOpacity={fillOpacity * 2} /><rect x="22" y="20" width="4" height="20" fill={stroke} fillOpacity={fillOpacity} />
        </g>
      )

    case 'obelisk-spires':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="24,4 20,10 21,40 27,40 28,10" fill={stroke} fillOpacity={fillOpacity * 1.8} strokeWidth={strokeWidth * 1.2} /><polygon points="24,4 20,10 28,10" fill={stroke} /><polygon points="12,18 10,22 11,40 15,40 16,22" fill={stroke} fillOpacity={fillOpacity} strokeWidth={strokeWidth} />
        </g>
      )

    case 'landmark-arch':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 40 L 10 16 C 14 8, 34 8, 38 16 L 42 40 L 32 40 L 30 22 C 28 16, 20 16, 18 22 L 16 40 Z" fill={stroke} fillOpacity={fillOpacity * 1.6} strokeWidth={strokeWidth * 1.3} />
        </g>
      )

    case 'ruins-temple':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="6,16 24,6 42,16" fill={stroke} fillOpacity={fillOpacity} strokeWidth={strokeWidth * 1.2} /><rect x="10" y="16" width="4" height="24" fill={stroke} /><rect x="22" y="16" width="4" height="24" fill={stroke} /><rect x="34" y="24" width="4" height="16" fill={stroke} /><line x1="4" y1="40" x2="44" y2="40" strokeWidth={strokeWidth * 1.4} />
        </g>
      )

    case 'petrified-wood':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="16" cy="24" rx="8" ry="5" fill={stroke} fillOpacity={fillOpacity * 1.5} /><ellipse cx="16" cy="24" rx="4" ry="2.5" fill="none" strokeWidth={strokeWidth * 0.9} /><line x1="8" y1="24" x2="8" y2="40" /><line x1="24" y1="24" x2="24" y2="40" /><ellipse cx="34" cy="28" rx="7" ry="4" fill={stroke} fillOpacity={fillOpacity * 1.5} /><line x1="27" y1="28" x2="27" y2="42" /><line x1="41" y1="28" x2="41" y2="42" />
        </g>
      )

    case 'sacred-grove':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="24" cy="18" r="10" fill={stroke} fillOpacity={fillOpacity * 1.5} /><line x1="24" y1="28" x2="24" y2="42" strokeWidth={strokeWidth * 1.4} /><circle cx="24" cy="18" r="3" fill="#fafaf9" /><circle cx="16" cy="16" r="1.5" fill="#fafaf9" /><circle cx="32" cy="16" r="1.5" fill="#fafaf9" /><circle cx="24" cy="11" r="1.5" fill="#fafaf9" />
        </g>
      )

    case 'ley-nexus':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="24" cy="24" r="6" fill={stroke} fillOpacity={fillOpacity * 2} /><line x1="6" y1="6" x2="42" y2="42" strokeWidth={strokeWidth * 1.3} strokeDasharray="3 2" /><line x1="42" y1="6" x2="6" y2="42" strokeWidth={strokeWidth * 1.3} strokeDasharray="3 2" /><circle cx="24" cy="24" r="14" strokeWidth={strokeWidth * 1.1} strokeDasharray="4 2" fill="none" />
        </g>
      )

    case 'settle-hamlet':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="14,14 8,24 20,24" fill={stroke} fillOpacity={fillOpacity * 1.8} /><rect x="10" y="24" width="8" height="12" fill={stroke} fillOpacity={fillOpacity} /><polygon points="30,12 22,22 38,22" fill={stroke} fillOpacity={fillOpacity * 1.8} /><rect x="25" y="22" width="10" height="14" fill={stroke} fillOpacity={fillOpacity} /><path d="M 14 12 Q 12 6, 16 2" strokeWidth={strokeWidth * 0.8} fill="none" /><line x1="6" y1="38" x2="42" y2="38" strokeWidth={strokeWidth * 1.1} />
        </g>
      )

    case 'settle-village':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <rect x="10" y="20" width="28" height="18" fill={stroke} fillOpacity={fillOpacity} strokeWidth={strokeWidth * 1.3} /><polygon points="12,20 18,12 24,20" fill={stroke} /><polygon points="24,20 30,12 36,20" fill={stroke} /><rect x="22" y="28" width="4" height="10" fill={stroke} /><line x1="6" y1="38" x2="42" y2="38" strokeWidth={strokeWidth * 1.2} />
        </g>
      )

    case 'settle-town':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="22" width="14" height="16" fill={stroke} fillOpacity={fillOpacity} /><polygon points="8,22 15,14 22,22" fill={stroke} fillOpacity={fillOpacity * 1.5} /><rect x="24" y="16" width="16" height="22" fill={stroke} fillOpacity={fillOpacity} /><polygon points="24,16 32,8 40,16" fill={stroke} fillOpacity={fillOpacity * 1.5} /><rect x="26" y="8" width="12" height="4" fill={stroke} /><line x1="4" y1="40" x2="44" y2="40" strokeWidth={strokeWidth * 1.3} />
        </g>
      )

    case 'settle-nomad':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 8 36 L 16 20 L 24 36 Z" fill={stroke} fillOpacity={fillOpacity * 1.5} /><line x1="16" y1="20" x2="16" y2="36" strokeWidth={strokeWidth * 0.8} /><path d="M 24 36 L 32 18 L 40 36 Z" fill={stroke} fillOpacity={fillOpacity * 1.5} /><line x1="32" y1="18" x2="32" y2="36" strokeWidth={strokeWidth * 0.8} /><circle cx="24" cy="38" r="1.5" fill={stroke} />
        </g>
      )

    case 'settle-cliff':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 4 8 L 40 8 L 44 42" strokeWidth={strokeWidth * 1.3} /><rect x="10" y="28" width="14" height="12" fill={stroke} fillOpacity={fillOpacity * 1.6} /><rect x="16" y="18" width="14" height="10" fill={stroke} fillOpacity={fillOpacity * 1.8} /><rect x="22" y="10" width="12" height="8" fill={stroke} fillOpacity={fillOpacity * 2.0} /><line x1="18" y1="18" x2="18" y2="28" strokeWidth={strokeWidth * 0.9} />
        </g>
      )

    case 'settle-stilt':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="10,18 20,10 30,18" fill={stroke} fillOpacity={fillOpacity * 1.6} /><rect x="12" y="18" width="16" height="10" fill={stroke} fillOpacity={fillOpacity} /><line x1="14" y1="28" x2="14" y2="42" strokeWidth={strokeWidth * 1.4} /><line x1="26" y1="28" x2="26" y2="42" strokeWidth={strokeWidth * 1.4} /><path d="M 6 36 Q 24 32, 42 36" strokeWidth={strokeWidth * 1.1} /><path d="M 4 42 Q 24 38, 44 42" strokeWidth={strokeWidth * 1.1} />
        </g>
      )

    case 'settle-outpost':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <rect x="14" y="18" width="20" height="20" fill={stroke} fillOpacity={fillOpacity * 1.3} strokeWidth={strokeWidth * 1.3} /><line x1="24" y1="18" x2="24" y2="6" strokeWidth={strokeWidth * 1.3} /><polygon points="24,6 32,9 24,12" fill={stroke} /><line x1="8" y1="38" x2="40" y2="38" strokeWidth={strokeWidth * 1.3} />
        </g>
      )

    case 'const-castle':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <rect x="10" y="16" width="8" height="24" fill={stroke} fillOpacity={fillOpacity * 1.5} /><polygon points="9,16 14,10 19,16" fill={stroke} /><rect x="30" y="16" width="8" height="24" fill={stroke} fillOpacity={fillOpacity * 1.5} /><polygon points="29,16 34,10 39,16" fill={stroke} /><rect x="16" y="22" width="16" height="18" fill={stroke} fillOpacity={fillOpacity} /><path d="M 21 40 L 21 32 Q 24 28, 27 32 L 27 40" fill="#000" /><line x1="6" y1="40" x2="42" y2="40" strokeWidth={strokeWidth * 1.3} />
        </g>
      )

    case 'const-citadel':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="6,42 24,16 42,42" fill={stroke} fillOpacity={fillOpacity} /><rect x="20" y="10" width="8" height="10" fill={stroke} fillOpacity={fillOpacity * 2} /><polygon points="19,10 24,4 29,10" fill={stroke} /><line x1="20" y1="10" x2="28" y2="10" strokeWidth={strokeWidth * 1.2} />
        </g>
      )

    case 'const-port':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="26" width="22" height="14" fill={stroke} fillOpacity={fillOpacity} strokeWidth={strokeWidth * 1.2} /><path d="M 30 28 L 44 28 L 41 38 L 33 38 Z" fill={stroke} fillOpacity={fillOpacity * 1.8} /><line x1="37" y1="28" x2="37" y2="14" strokeWidth={strokeWidth * 1.2} /><polygon points="37,14 43,18 37,22" fill={stroke} fillOpacity={fillOpacity} /><path d="M 4 42 Q 24 38, 44 42" strokeWidth={strokeWidth * 1.1} />
        </g>
      )

    case 'const-bridge':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="22" x2="44" y2="22" strokeWidth={strokeWidth * 1.6} /><path d="M 8 40 L 8 22 M 24 40 L 24 22 M 40 40 L 40 22" strokeWidth={strokeWidth * 1.4} /><path d="M 8 26 Q 16 26, 16 38" strokeWidth={strokeWidth * 1.1} fill="none" /><path d="M 24 26 Q 32 26, 32 38" strokeWidth={strokeWidth * 1.1} fill="none" /><path d="M 4 40 Q 24 36, 44 40" strokeWidth={strokeWidth * 0.9} strokeDasharray="3 2" />
        </g>
      )

    case 'const-wall':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="20" x2="44" y2="20" strokeWidth={strokeWidth * 1.6} /><rect x="6" y="14" width="6" height="12" fill={stroke} fillOpacity={fillOpacity * 1.5} /><rect x="21" y="14" width="6" height="12" fill={stroke} fillOpacity={fillOpacity * 1.5} /><rect x="36" y="14" width="6" height="12" fill={stroke} fillOpacity={fillOpacity * 1.5} /><line x1="4" y1="36" x2="44" y2="36" strokeWidth={strokeWidth * 1.3} /><rect x="4" y="20" width="40" height="16" fill={stroke} fillOpacity={fillOpacity * 0.8} />
        </g>
      )

    case 'const-monument':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="24,6 4,40 44,40" fill={stroke} fillOpacity={fillOpacity * 1.4} strokeWidth={strokeWidth * 1.3} /><path d="M 24 6 L 24 40" strokeWidth={strokeWidth * 1.2} /><line x1="16" y1="20" x2="32" y2="20" strokeWidth={strokeWidth * 0.8} /><line x1="10" y1="30" x2="38" y2="30" strokeWidth={strokeWidth * 0.8} />
        </g>
      )

    case 'const-university':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 12 18 Q 24 6, 36 18 Z" fill={stroke} fillOpacity={fillOpacity * 1.6} /><rect x="10" y="18" width="28" height="20" fill={stroke} fillOpacity={fillOpacity} strokeWidth={strokeWidth * 1.3} /><line x1="16" y1="18" x2="16" y2="38" strokeWidth={strokeWidth * 1.1} /><line x1="24" y1="18" x2="24" y2="38" strokeWidth={strokeWidth * 1.1} /><line x1="32" y1="18" x2="32" y2="38" strokeWidth={strokeWidth * 1.1} /><line x1="6" y1="40" x2="42" y2="40" strokeWidth={strokeWidth * 1.4} />
        </g>
      )

    case 'const-aqueduct':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="16" x2="44" y2="16" strokeWidth={strokeWidth * 1.6} /><path d="M 8 16 Q 14 16, 14 30 L 14 42" strokeWidth={strokeWidth * 1.2} fill="none" /><path d="M 20 16 Q 26 16, 26 30 L 26 42" strokeWidth={strokeWidth * 1.2} fill="none" /><path d="M 32 16 Q 38 16, 38 30 L 38 42" strokeWidth={strokeWidth * 1.2} fill="none" /><line x1="4" y1="42" x2="44" y2="42" strokeWidth={strokeWidth * 1.2} />
        </g>
      )

    case 'const-lighthouse':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="20,14 16,40 32,40 28,14" fill={stroke} fillOpacity={fillOpacity * 1.5} strokeWidth={strokeWidth * 1.3} /><rect x="18" y="8" width="12" height="6" fill={stroke} /><polygon points="18,8 24,2 30,8" fill={stroke} /><line x1="16" y1="10" x2="6" y2="6" strokeWidth={strokeWidth * 1.2} strokeDasharray="3 2" /><line x1="32" y1="10" x2="42" y2="6" strokeWidth={strokeWidth * 1.2} strokeDasharray="3 2" /><line x1="10" y1="40" x2="38" y2="40" strokeWidth={strokeWidth * 1.4} />
        </g>
      )

    default: {
      const fallbackGraphicId = resolveSymbolGraphicFallback(symbolId, CARTOGRAPHIC_SYMBOLS)
      if (fallbackGraphicId && fallbackGraphicId !== symbolId) {
        return renderCartographicMarkerSVG(fallbackGraphicId, options)
      }
      return null
    }
  }
}

/**
 * Resolves the effective whiteboard / cartographic symbol for a tile.
 * Prioritizes explicit `cartographicSymbol`, then maps relief, flora, and overlay fallbacks.
 */
export function resolveCartographicSymbol(tile: {
  cartographicSymbol?: string
  relief?: string
  flora?: string
  terrain?: string
  overlay?: string
}): string | null {
  if (tile.cartographicSymbol && findSymbolById(tile.cartographicSymbol)) {
    return tile.cartographicSymbol
  }
  if (tile.relief === 'mountain') return 'mountain-peak'
  if (tile.relief === 'mountain-snow') return 'mountain-snow'
  if (tile.relief === 'mountain-range') return 'mountain-range'
  if (tile.relief === 'mesa') return 'mesa-plateau'
  if (tile.relief === 'crag') return 'mountain-spire'
  if (tile.relief === 'canyon') return 'canyon-gorge'
  if (tile.relief === 'volcano') return 'volcano-active'
  if (tile.relief === 'hills') return 'hill-rolling'
  if (tile.flora === 'forest') return 'forest-deciduous'
  if (tile.flora === 'jungle') return 'jungle-dense'
  if (tile.overlay === 'cave') return 'cave-maw'
  if (tile.overlay === 'ruins') return 'megalith-ring'
  if (tile.overlay === 'myth') return 'sacred-grove'
  if (tile.overlay === 'settlement') return 'settle-village'
  if (tile.overlay === 'town') return 'settle-town'
  if (tile.overlay === 'city') return 'settle-town'
  if (tile.overlay === 'capital') return 'const-castle'
  if (tile.overlay === 'castle') return 'const-castle'
  if (tile.overlay === 'monument') return 'const-monument'
  if (tile.terrain === 'mountain') return 'mountain-peak'
  if (tile.terrain === 'desert') return 'desert-dunes'
  if (tile.terrain === 'swamp') return 'swamp-mangrove'
  return null
}
