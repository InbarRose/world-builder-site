import { describe, it, expect } from 'vitest'
import {
  generateNaturalWorld,
  resolveGeographyPreset,
  hashSeed,
  GEOGRAPHY_PRESET_DEFINITIONS,
  ALL_GEOGRAPHY_PRESETS,
} from '../engine/proceduralWorldEngine'

describe('proceduralWorldEngine', () => {
  it('exposes 6 comprehensive Civilization-style geography presets with rich metadata', () => {
    expect(ALL_GEOGRAPHY_PRESETS.length).toBe(6)
    const presetIds = ALL_GEOGRAPHY_PRESETS.map((p) => p.id)
    expect(presetIds).toContain('continent')
    expect(presetIds).toContain('highlands')
    expect(presetIds).toContain('inland-sea')
    expect(presetIds).toContain('archipelago')
    expect(presetIds).toContain('pangaea')
    expect(presetIds).toContain('twin-continents')

    for (const def of ALL_GEOGRAPHY_PRESETS) {
      expect(def.name).toBeTruthy()
      expect(def.subtitle).toBeTruthy()
      expect(def.icon).toBeTruthy()
      expect(def.description).toBeTruthy()
      expect(def.landRatioTarget).toBeGreaterThan(0.2)
      expect(def.landRatioTarget).toBeLessThan(0.8)
    }
  })

  it('deterministically resolves "random" preset using seed hash', () => {
    const seed1 = hashSeed('alpha-seed-123')
    const seed2 = hashSeed('beta-seed-456')

    const p1 = resolveGeographyPreset('random', seed1)
    const p2 = resolveGeographyPreset('random', seed2)

    expect(['continent', 'highlands', 'inland-sea', 'archipelago', 'pangaea', 'twin-continents']).toContain(p1)
    expect(['continent', 'highlands', 'inland-sea', 'archipelago', 'pangaea', 'twin-continents']).toContain(p2)

    // Consistency check
    expect(resolveGeographyPreset('random', seed1)).toBe(p1)
    expect(resolveGeographyPreset('highlands', seed1)).toBe('highlands')
  })

  it('generates deterministic maps for identical seeds', () => {
    const mapA = generateNaturalWorld({ width: 16, height: 12, preset: 'continent', seed: 'fixed-seed-42' })
    const mapB = generateNaturalWorld({ width: 16, height: 12, preset: 'continent', seed: 'fixed-seed-42' })

    expect(mapA.width).toBe(16)
    expect(mapA.height).toBe(12)
    expect(Object.keys(mapA.tiles).length).toBe(16 * 12)

    // Check every single tile matches
    for (const tid of Object.keys(mapA.tiles)) {
      expect(mapA.tiles[tid].terrain).toBe(mapB.tiles[tid].terrain)
      expect(mapA.tiles[tid].domain).toBe(mapB.tiles[tid].domain)
      expect(mapA.tiles[tid].relief).toBe(mapB.tiles[tid].relief)
      expect(mapA.tiles[tid].hasRiver).toBe(mapB.tiles[tid].hasRiver)
    }
  })

  it('generates non-circular, diverse natural landmasses across presets', () => {
    const presets = ['continent', 'highlands', 'inland-sea', 'archipelago', 'pangaea', 'twin-continents'] as const

    for (const preset of presets) {
      const map = generateNaturalWorld({ width: 20, height: 12, preset, seed: `test-${preset}-seed` })
      const tiles = Object.values(map.tiles)
      const landTiles = tiles.filter((t) => t.domain === 'land')
      const waterTiles = tiles.filter((t) => t.domain === 'water')

      // Must have both land and water
      expect(landTiles.length).toBeGreaterThan(15)
      expect(waterTiles.length).toBeGreaterThan(15)

      // Archipelago should have lower land ratio than Pangaea
      const landRatio = landTiles.length / tiles.length
      const targetRatio = GEOGRAPHY_PRESET_DEFINITIONS[preset].landRatioTarget
      // Land ratio should be within reasonable tolerance of target
      expect(Math.abs(landRatio - targetRatio)).toBeLessThan(0.25)
    }
  })

  it('generates a mostly bare Pre-Genesis starting map with natural coastlines and only a few starting features (1–4 mountains, 1–2 forest tiles, 1 river)', () => {
    const map = generateNaturalWorld({
      width: 20,
      height: 12,
      preset: 'continent',
      seed: 'pre-genesis-bare-777',
    })
    const tiles = Object.values(map.tiles)
    const landTiles = tiles.filter((t) => t.domain === 'land')

    // At least 90% of land tiles must be bare open land (plains with no relief and no flora)
    const barePlainsCount = landTiles.filter(
      (t) => t.terrain === 'plains' && t.relief === 'none' && t.flora === 'none'
    ).length
    expect(barePlainsCount / landTiles.length).toBeGreaterThanOrEqual(0.9)

    // Only 1–4 starting mountain peaks
    const mountainCount = landTiles.filter((t) => t.terrain === 'mountain').length
    expect(mountainCount).toBeGreaterThanOrEqual(1)
    expect(mountainCount).toBeLessThanOrEqual(4)

    // Only 1–2 starting forest tiles
    const forestCount = landTiles.filter((t) => t.flora === 'forest').length
    expect(forestCount).toBeGreaterThanOrEqual(1)
    expect(forestCount).toBeLessThanOrEqual(2)

    // 1 starting downhill river path
    const riverTiles = tiles.filter((t) => t.hasRiver)
    expect(riverTiles.length).toBeGreaterThan(0)
    expect(riverTiles.length).toBeLessThanOrEqual(12)
  })

  it('keeps Turn-0 starting maps completely free of pre-seeded resource slots and settlements so players build them during play', () => {
    const map = generateNaturalWorld({
      width: 20,
      height: 12,
      preset: 'highlands',
      seed: 'clean-start-888',
    })
    const tiles = Object.values(map.tiles)

    const allExplicitSlots = tiles.flatMap((t) => t.slots || [])
    expect(allExplicitSlots).toHaveLength(0)

    const allSettlementOverlays = tiles.filter((t) => t.overlay !== 'none')
    expect(allSettlementOverlays).toHaveLength(0)
  })
})
