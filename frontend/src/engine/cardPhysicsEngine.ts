/**
 * cardPhysicsEngine.ts
 * Phase 22: Single-PC Tabletop Driver UX, 3D Kinetic Card Tactility,
 * Smart Target Coordinate Picker & Quick-Forge Codex Helper (ADR-028).
 */

import {
  EntityCategory,
  MapState,
  StageId,
  WorldEntity,
} from './types'
import { StageActionPreset } from './presets'
import { createDefaultTile, getTileDomain, getTileId } from './mapEngine'

export interface CardTiltState {
  rotateX: number
  rotateY: number
  glareX: number
  glareY: number
  transformStyle: string
}

export interface BoundingBoxRect {
  left: number
  top: number
  width: number
  height: number
}

/**
 * Computes 3D perspective tilt angles (`rotateX`, `rotateY`) and specular glare
 * coordinates from cursor position relative to the card bounding box.
 */
export function computeCardTiltTransform(
  clientX: number,
  clientY: number,
  rect: BoundingBoxRect,
  maxTiltDeg = 12
): CardTiltState {
  if (rect.width <= 0 || rect.height <= 0) {
    return {
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      transformStyle: 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    }
  }

  const relX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  const relY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))

  // Center is (0.5, 0.5)
  const normX = (relX - 0.5) * 2 // -1 to +1
  const normY = (relY - 0.5) * 2 // -1 to +1

  const rotateY = Math.round(normX * maxTiltDeg * 100) / 100 || 0
  const rotateX = Math.round(-normY * maxTiltDeg * 100) / 100 || 0
  const glareX = Math.round(relX * 100)
  const glareY = Math.round(relY * 100)

  return {
    rotateX,
    rotateY,
    glareX,
    glareY,
    transformStyle: `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`,
  }
}

export interface DeckStackVisualMetrics {
  visibleLayers: number
  stackDepthPx: number
  progressPercent: number
}

/**
 * Computes visual deck thickness metrics from remaining card count.
 */
export function computeDeckStackLayers(
  remainingCards: number,
  maxCards = 54
): DeckStackVisualMetrics {
  const clampedRemaining = Math.max(0, Math.min(maxCards, remainingCards))
  const ratio = maxCards > 0 ? clampedRemaining / maxCards : 0
  const visibleLayers = clampedRemaining === 0 ? 0 : Math.max(1, Math.ceil(ratio * 6))
  const stackDepthPx = visibleLayers * 2
  const progressPercent = Math.round(ratio * 100)

  return {
    visibleLayers,
    stackDepthPx,
    progressPercent,
  }
}

/**
 * Smart Coordinate Picker for the Single-PC Laptop Driver:
 * Finds an ideal map tile coordinate for a given preset (matching water vs land,
 * mountain/forest/settlement affinity, and avoiding overcrowded tiles).
 */
export function pickSmartTargetTileForPreset(
  map: MapState,
  preset: StageActionPreset | null,
  currentTileId?: string
): string {
  const candidates: { id: string; score: number }[] = []

  const wantsWater =
    preset?.terrainChange === 'water' ||
    (preset?.suit === '♥' &&
      preset?.stage === 'genesis' &&
      /sea|ocean|reef|trench|maelstrom|archipelago|current|ice|glacier|fjord/i.test(
        `${preset.name} ${preset.description}`
      ))

  const wantsMountain =
    preset?.terrainChange === 'mountain' ||
    preset?.reliefChange === 'mountain' ||
    preset?.reliefChange === 'mountain-snow' ||
    preset?.reliefChange === 'volcano'

  const wantsForest =
    preset?.terrainChange === 'forest' ||
    preset?.terrainChange === 'jungle' ||
    preset?.floraChange === 'forest' ||
    preset?.floraChange === 'jungle'

  for (let row = 0; row < map.height; row++) {
    for (let col = 0; col < map.width; col++) {
      const id = getTileId(col, row)
      if (id === currentTileId) continue
      const tile = map.tiles[id] || createDefaultTile(col, row)
      const domain = getTileDomain(tile)
      let score = 10

      if (wantsWater) {
        score += domain === 'water' ? 35 : -25
      } else {
        score += domain === 'land' ? 35 : -30
      }

      if (wantsMountain && (tile.terrain === 'mountain' || tile.relief === 'mountain')) {
        score += 20
      }
      if (wantsForest && (tile.terrain === 'forest' || tile.flora === 'forest')) {
        score += 20
      }

      // Prefer tiles with fewer existing slots so the map spreads out naturally
      const slotCount = tile.slots?.length ?? 0
      score -= slotCount * 8

      // Slight preference toward interior coordinates over extreme borders
      const distFromCenter =
        Math.abs(col - map.width / 2) + Math.abs(row - map.height / 2)
      score -= Math.round(distFromCenter * 1.2)

      candidates.push({ id, score })
    }
  }

  if (candidates.length === 0) return currentTileId || '0,0'
  candidates.sort((a, b) => b.score - a.score)

  // Pick among top 5 candidates deterministically or varied by currentTileId
  const topSlice = candidates.slice(0, Math.min(5, candidates.length))
  const pickIdx = currentTileId
    ? (currentTileId.charCodeAt(0) + currentTileId.length) % topSlice.length
    : 0
  return topSlice[pickIdx].id
}

const DEFAULT_ENTITY_ICONS: Record<EntityCategory, string> = {
  species: '🧬',
  society: '🏛️',
  myth: '🗿',
}

const DEFAULT_ENTITY_COLORS: Record<EntityCategory, string> = {
  species: '#10b981',
  society: '#6366f1',
  myth: '#a855f7',
}

/**
 * Builds a complete WorldEntity from the Turn Workshop's Inline Quick-Forge bar.
 */
export function buildQuickCodexEntity(params: {
  name: string
  category: EntityCategory
  stage: StageId
  tileId: string
  preset?: StageActionPreset | null
  customDescription?: string
}): WorldEntity {
  const trimmedName = params.name.trim() || 'Unnamed Lore Entry'
  const icon =
    params.preset?.icon || DEFAULT_ENTITY_ICONS[params.category] || '🏛️'
  const color =
    params.preset?.graphic?.primaryColor ||
    DEFAULT_ENTITY_COLORS[params.category] ||
    '#6366f1'

  const description =
    params.customDescription?.trim() ||
    params.preset?.exampleNarrative ||
    params.preset?.description ||
    `Forged during the ${params.stage} era at (${params.tileId}).`

  return {
    id: `ent_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: trimmedName,
    category: params.category,
    stageCreated: params.stage,
    originTileId: params.tileId,
    description,
    status: 'Flourishing',
    icon,
    color,
    secondaryColor:
      params.preset?.graphic?.secondaryColor ??
      params.preset?.secondaryColor ??
      undefined,
    traits: params.preset?.traitGranted ? [params.preset.traitGranted] : [],
    abilities: params.preset?.abilityGranted ? [params.preset.abilityGranted] : [],
    diplomaticLinks: [],
  }
}
