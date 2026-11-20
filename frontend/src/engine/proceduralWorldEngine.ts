/**
 * proceduralWorldEngine.ts
 * Phase 29: Natural Procedural World Generation & Civ-Style Tectonic Presets
 *
 * Replaces simplistic concentric radial islands with realistic, organic world generation:
 * - Multi-octave Simplex/Perlin noise with Domain Warping for natural coastlines, fiords, and peninsulas.
 * - Tectonic plate boundary simulation (orogeny) generating continuous mountain spines / cordilleras.
 * - Whittaker/Köppen-style climate matrix combining elevation, latitude, and moisture / rain-shadow.
 * - 6 Diverse AAA Civilization-style world presets:
 *     1. 'continent' (Fractal Continents & Straits)
 *     2. 'highlands' (Tectonic Highlands & Great River Valley)
 *     3. 'inland-sea' (Mediterranean Rim & Protected Gulf)
 *     4. 'archipelago' (Shattered Archipelagos & Coral Atolls)
 *     5. 'pangaea' (Pangaea Rift & Fractured Steppes)
 *     6. 'twin-continents' (Old World & New World Hemispheres)
 *     7. 'random' (Deterministically selects one of the 6)
 */

import {
  GeographyPreset,
  MapState,
  MapTile,
  TerrainType,
} from './types'
import { getTileId, DEFAULT_MAP_WIDTH, DEFAULT_MAP_HEIGHT } from './mapEngine'

// ============================================================================
// 1. DETERMINISTIC PRNG & HASH UTILITIES
// ============================================================================

/**
 * 32-bit Murmur-inspired string hasher for deterministic seeds.
 */
export function hashSeed(seedStr: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h
}

/**
 * Mulberry32 deterministic pseudo-random number generator.
 */
export function createMulberry32(seed: number): () => number {
  let s = seed >>> 0
  return function () {
    s = (s + 0x6d2b79f5) >>> 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ============================================================================
// 2. 2D SIMPLEX / GRADIENT NOISE GENERATOR
// ============================================================================

export class SimplexNoise2D {
  private perm: Uint8Array = new Uint8Array(512)

  constructor(rng: () => number) {
    const p = new Uint8Array(256)
    for (let i = 0; i < 256; i++) p[i] = i
    // Fisher-Yates shuffle
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      const tmp = p[i]
      p[i] = p[j]
      p[j] = tmp
    }
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255]
    }
  }

  // Quintic fade curve: 6t^5 - 15t^4 + 10t^3
  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a)
  }

  private grad(hash: number, x: number, y: number): number {
    const h = hash & 7
    const u = h < 4 ? x : y
    const v = h < 4 ? y : x
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
  }

  public noise(x: number, y: number): number {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255

    const xf = x - Math.floor(x)
    const yf = y - Math.floor(y)

    const u = this.fade(xf)
    const v = this.fade(yf)

    const aa = this.perm[this.perm[X] + Y]
    const ab = this.perm[this.perm[X] + Y + 1]
    const ba = this.perm[this.perm[X + 1] + Y]
    const bb = this.perm[this.perm[X + 1] + Y + 1]

    const x1 = this.lerp(this.grad(aa, xf, yf), this.grad(ba, xf - 1, yf), u)
    const x2 = this.lerp(this.grad(ab, xf, yf - 1), this.grad(bb, xf - 1, yf - 1), u)

    return (this.lerp(x1, x2, v) + 1) / 2 // Normalize to 0..1
  }

  /**
   * Fractal Brownian Motion (fBM) with octaves, persistence, and lacunarity.
   */
  public fbm(x: number, y: number, octaves = 4, persistence = 0.5, lacunarity = 2.0): number {
    let total = 0
    let frequency = 1
    let amplitude = 1
    let maxValue = 0

    for (let i = 0; i < octaves; i++) {
      total += this.noise(x * frequency, y * frequency) * amplitude
      maxValue += amplitude
      amplitude *= persistence
      frequency *= lacunarity
    }

    return total / maxValue
  }

  /**
   * Domain-warped fBM: offsets coordinates by sub-octave noise fields for organic shorelines.
   */
  public domainWarpFbm(x: number, y: number, warpIntensity = 1.5): number {
    const qx = this.fbm(x, y, 2)
    const qy = this.fbm(x + 5.2, y + 1.3, 2)
    return this.fbm(x + warpIntensity * qx, y + warpIntensity * qy, 4)
  }
}

// ============================================================================
// 3. TECTONIC PLATE & RIDGE SIMULATION
// ============================================================================

interface TectonicPlate {
  id: number
  cx: number
  cy: number
  vx: number
  vy: number
}

function simulateTectonicConvergence(
  col: number,
  row: number,
  width: number,
  height: number,
  plates: TectonicPlate[]
): { nearestPlate: number; convergenceScore: number } {
  let d1 = Infinity
  let d2 = Infinity
  let p1: TectonicPlate = plates[0]
  let p2: TectonicPlate = plates[0]

  const nx = col / width
  const ny = row / height

  for (const plate of plates) {
    const distSq = (nx - plate.cx) ** 2 + (ny - plate.cy) ** 2
    if (distSq < d1) {
      d2 = d1
      p2 = p1
      d1 = distSq
      p1 = plate
    } else if (distSq < d2) {
      d2 = distSq
      p2 = plate
    }
  }

  // Edge proximity to plate boundary
  const boundaryDist = Math.abs(Math.sqrt(d2) - Math.sqrt(d1))
  const isNearBoundary = boundaryDist < 0.12

  if (!isNearBoundary) {
    return { nearestPlate: p1.id, convergenceScore: 0 }
  }

  // Relative velocity dot product (convergence)
  const relVx = p1.vx - p2.vx
  const relVy = p1.vy - p2.vy
  const normX = p2.cx - p1.cx
  const normY = p2.cy - p1.cy
  const normLen = Math.hypot(normX, normY) || 1

  // Positive dot product means plates are pushing into each other (convergent fold mountains)
  const dot = (relVx * (normX / normLen) + relVy * (normY / normLen))
  const factor = 1 - boundaryDist / 0.12
  const convergenceScore = Math.max(0, dot * factor)

  return { nearestPlate: p1.id, convergenceScore }
}

// ============================================================================
// 4. GEOGRAPHY PRESET DEFINITIONS & METADATA
// ============================================================================

export interface GeographyPresetDefinition {
  id: GeographyPreset
  name: string
  subtitle: string
  icon: string
  description: string
  idealSetting: string
  landRatioTarget: number // Approx. fraction of map that should be land (0.35 - 0.75)
}

export const GEOGRAPHY_PRESET_DEFINITIONS: Record<
  Exclude<GeographyPreset, 'random'>,
  GeographyPresetDefinition
> = {
  continent: {
    id: 'continent',
    name: 'Fractal Continents & Straits',
    subtitle: 'Classic D&D / High Fantasy Continents',
    icon: '🌍',
    description:
      'Two to three irregular organic continental landmasses separated by navigable oceanic straits, sheltered bays, and coastal rias.',
    idealSetting: 'High fantasy campaigns with competing kingdoms, naval trade routes, and distinct geopolitical theaters.',
    landRatioTarget: 0.52,
  },
  highlands: {
    id: 'highlands',
    name: 'Tectonic Highlands & River Basin',
    subtitle: 'Great Alpine Spines & Dendritic Valleys',
    icon: '🏔️',
    description:
      'Imposing tectonic mountain cordilleras embracing a fertile interior river basin flowing outward into coastal sea deltas.',
    idealSetting: 'Feudal realms, dwarven mountain holds, frontier passes, and fertile riverbaron river valleys.',
    landRatioTarget: 0.58,
  },
  'inland-sea': {
    id: 'inland-sea',
    name: 'Inland Sea & Mediterranean Rim',
    subtitle: 'Cradle of Antiquity & Maritime Trade',
    icon: '🌊',
    description:
      'A sprawling enclosed central sea ringed by jagged peninsulas, rocky olive coasts, and high outer barrier peaks.',
    idealSetting: 'Classical antiquity, merchant navies, piracy, coastal city-states, and island sanctuaries.',
    landRatioTarget: 0.6,
  },
  archipelago: {
    id: 'archipelago',
    name: 'Shattered Archipelagos & Atolls',
    subtitle: 'Island Chains, Lagoons & Coral Reefs',
    icon: '🏝️',
    description:
      'Clusters of scattered island chains, volcanic caldera atolls, barrier reefs, and shallow aquamarine sea channels.',
    idealSetting: 'Swashbuckling voyages, mysterious uncharted island tombs, kraken-haunted depths, and tribal sailors.',
    landRatioTarget: 0.36,
  },
  pangaea: {
    id: 'pangaea',
    name: 'Pangaea Rift & Grand Steppe',
    subtitle: 'Supercontinent & Primeval Interior',
    icon: '🌋',
    description:
      'A colossal unified supercontinent fractured by a deep volcanic rift chasm, surrounded by endless plains, steppes, and deserts.',
    idealSetting: 'Nomadic horse lords, primordial beast migrations, massive continental empires, and planar rifts.',
    landRatioTarget: 0.68,
  },
  'twin-continents': {
    id: 'twin-continents',
    name: 'Twin Hemispheres (Old & New World)',
    subtitle: 'Two Balanced Realms Divided by Sea',
    icon: '🌐',
    description:
      'Two major continental landmasses in the East and West, divided by a perilous ocean highway punctuated by stepping-stone islands.',
    idealSetting: 'Age of Discovery, ancestral homelands vs. wild untamed frontiers, trans-oceanic expeditions.',
    landRatioTarget: 0.54,
  },
}

export const ALL_GEOGRAPHY_PRESETS: GeographyPresetDefinition[] = Object.values(
  GEOGRAPHY_PRESET_DEFINITIONS
)

// ============================================================================
// 5. NATURAL PROCEDURAL MAP GENERATOR
// ============================================================================

export interface ProceduralGenerationOptions {
  width?: number
  height?: number
  preset?: GeographyPreset
  seed?: string
}

/**
 * Resolves the active preset, handling 'random' by deterministic hash selection.
 */
export function resolveGeographyPreset(
  preset: GeographyPreset | undefined,
  seedNum: number
): Exclude<GeographyPreset, 'random'> {
  if (!preset || preset === 'random') {
    const presetKeys: Exclude<GeographyPreset, 'random'>[] = [
      'continent',
      'highlands',
      'inland-sea',
      'archipelago',
      'pangaea',
      'twin-continents',
    ]
    const idx = Math.abs(seedNum) % presetKeys.length
    return presetKeys[idx]
  }
  return preset as Exclude<GeographyPreset, 'random'>
}

/**
 * Procedurally generates a naturalistic, diverse world map using multi-octave domain-warped noise,
 * tectonic ridge convergence, and Whittaker-style climate distribution.
 */
export function generateNaturalWorld(options: ProceduralGenerationOptions = {}): MapState {
  const width = options.width || DEFAULT_MAP_WIDTH
  const height = options.height || DEFAULT_MAP_HEIGHT
  const rawSeed = options.seed || `world-${Date.now()}`
  const seedNum = hashSeed(rawSeed)
  const rng = createMulberry32(seedNum)

  const activePreset = resolveGeographyPreset(options.preset, seedNum)
  const presetDef = GEOGRAPHY_PRESET_DEFINITIONS[activePreset]

  const noiseGen = new SimplexNoise2D(rng)
  const moistureGen = new SimplexNoise2D(rng)

  // Seed 5–7 Tectonic plates
  const plateCount = 6
  const plates: TectonicPlate[] = []
  for (let i = 0; i < plateCount; i++) {
    plates.push({
      id: i,
      cx: rng() * 0.8 + 0.1,
      cy: rng() * 0.8 + 0.1,
      vx: (rng() - 0.5) * 2,
      vy: (rng() - 0.5) * 2,
    })
  }

  const tiles: Record<string, MapTile> = {}

  // Pass 1: Raw Elevation Field (0..1) with Preset Macro-Masking & Domain Warping
  const elevationGrid: number[][] = []
  const moistureGrid: number[][] = []
  const convergenceGrid: number[][] = []

  for (let r = 0; r < height; r++) {
    elevationGrid[r] = []
    moistureGrid[r] = []
    convergenceGrid[r] = []

    const ny = r / (height - 1 || 1) // 0 (North Pole) .. 1 (South Pole)

    for (let c = 0; c < width; c++) {
      const nx = c / (width - 1 || 1) // 0 (West) .. 1 (East)

      // Base domain-warped fractal elevation
      let elev = noiseGen.domainWarpFbm(nx * 2.8, ny * 2.8, 1.4)

      // Tectonic Ridge Simulation
      const { convergenceScore } = simulateTectonicConvergence(c, r, width, height, plates)
      convergenceGrid[r][c] = convergenceScore
      const conv = convergenceScore

      // Preset Macro-Geographic Biasing
      if (activePreset === 'continent') {
        // Two to three organic land masses: dampen ocean edges
        const edgeDist = Math.min(nx, 1 - nx, ny, 1 - ny)
        const edgeMask = Math.min(1, edgeDist * 3.5)
        elev *= edgeMask
      } else if (activePreset === 'inland-sea') {
        // Center basin depression for central sea
        const centerDist = Math.hypot(nx - 0.5, (ny - 0.5) * 1.2)
        const seaHole = Math.min(1.2, centerDist * 2.2)
        elev = elev * 0.7 + (seaHole - 0.3) * 0.5
      } else if (activePreset === 'archipelago') {
        // Scattered high peaks rising above a shallow sea
        elev = Math.pow(elev, 1.6) * 1.15
      } else if (activePreset === 'highlands') {
        // Dramatic tectonic mountain cordilleras embracing river valleys
        const edgeDist = Math.min(nx, 1 - nx, ny, 1 - ny)
        elev = elev * 0.85 + edgeDist * 0.35 + 0.1
        if (conv > 0.2) elev += 0.2
      } else if (activePreset === 'pangaea') {
        // High central continental mass with a diagonal rift chasm
        const centerDist = 1 - Math.hypot((nx - 0.5) * 1.4, (ny - 0.5) * 1.1)
        const riftChasm = Math.abs(nx - ny - 0.05) < 0.08 ? -0.35 : 0
        elev = elev * 0.65 + centerDist * 0.5 + riftChasm
      } else if (activePreset === 'twin-continents') {
        // Center oceanic meridian dividing East and West
        const centerOceanChannel = Math.abs(nx - 0.5) < 0.12 ? -0.4 : 0
        const edgeDist = Math.min(nx, 1 - nx, ny, 1 - ny)
        elev = elev * 0.75 + edgeDist * 0.25 + centerOceanChannel
      }

      // Convergent plate boundaries boost elevation into mountain cordilleras
      elev += convergenceScore * 0.35

      // Natural Moisture Field
      let moist = moistureGen.fbm(nx * 2.2, ny * 2.2, 3)
      moistureGrid[r][c] = moist
      elevationGrid[r][c] = Math.max(0, Math.min(1, elev))
    }
  }

  // Pass 2: Calibrate Sea Level to match preset's target land ratio
  const allElevations: number[] = []
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      allElevations.push(elevationGrid[r][c])
    }
  }
  allElevations.sort((a, b) => a - b)
  const targetWaterPercent = 1 - presetDef.landRatioTarget
  const waterCutoffIndex = Math.floor(allElevations.length * targetWaterPercent)
  const seaLevelThreshold = allElevations[waterCutoffIndex] || 0.45

  // Pass 3: Synthesize Clean Pre-Genesis Coastline & Bare Landmass
  // Per original World Building rules (Pre-Genesis):
  // "draw a basic outline of a coastline, and maybe a few features as a starting map...
  //  a single main landmass, a few features, and maybe some islands... coastlines for your
  //  continent(s) and maybe a river, or a mountain or two."
  const landCandidates: {
    id: string
    c: number
    r: number
    elevScore: number
    moistScore: number
  }[] = []

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const id = getTileId(c, r)
      const elev = elevationGrid[r][c]
      const moist = moistureGrid[r][c]
      const conv = convergenceGrid[r][c]

      const isWater = elev <= seaLevelThreshold
      const domain: 'land' | 'water' = isWater ? 'water' : 'land'
      const terrain: TerrainType = isWater
        ? elev < seaLevelThreshold - 0.18
          ? 'ocean'
          : 'water'
        : 'plains'

      tiles[id] = {
        id,
        col: c,
        row: r,
        domain,
        terrain,
        relief: 'none',
        flora: 'none',
        slots: [],
        overlay: 'none',
        hasRiver: false,
        hasRoad: false,
        tags: [],
        linkedEventIds: [],
        linkedEntityIds: [],
      }

      if (!isWater) {
        const isInterior = c > 0 && c < width - 1 && r > 0 && r < height - 1
        landCandidates.push({
          id,
          c,
          r,
          elevScore: elev + conv * 0.4 + (isInterior ? 0.1 : 0),
          moistScore: moist + (isInterior ? 0.05 : 0),
        })
      }
    }
  }

  // Pass 4: Seed Just a Few Starting Features (1–2 Mountains & 1–2 Forest tiles — nothing more)
  if (landCandidates.length > 0) {
    const byElevation = [...landCandidates].sort((a, b) => b.elevScore - a.elevScore)
    const mountainCount = Math.min(
      2,
      Math.max(1, Math.floor(landCandidates.length * 0.02))
    )

    const mountainIds = new Set<string>()
    for (let i = 0; i < mountainCount && i < byElevation.length; i++) {
      const target = byElevation[i]
      const tile = tiles[target.id]
      if (tile) {
        tile.terrain = 'mountain'
        tile.relief = 'mountain'
        mountainIds.add(target.id)
      }
    }

    // Seed 1–2 small forest tiles away from the mountain peaks
    const byMoisture = landCandidates
      .filter((cand) => !mountainIds.has(cand.id))
      .sort((a, b) => b.moistScore - a.moistScore)
    const forestCount = Math.min(2, Math.max(1, Math.floor(landCandidates.length * 0.02)))

    for (let i = 0; i < forestCount && i < byMoisture.length; i++) {
      const target = byMoisture[i]
      const tile = tiles[target.id]
      if (tile) {
        tile.terrain = 'plains'
        tile.flora = 'forest'
      }
    }
  }

  return {
    width,
    height,
    gridTopology: 'square',
    tiles,
  }
}
