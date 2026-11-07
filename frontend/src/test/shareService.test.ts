import { describe, expect, it } from 'vitest'
import { createNewWorld, serializeWorld, parseImportedWorld } from '../engine/storageService'
import {
  compressStringToBase64Url,
  decodeWorldFromCompressedHash,
  decompressBase64UrlToString,
  encodeWorldToCompressedHash,
  generateFullStateShareUrl,
  generateSeedShareUrl,
  parseSeedShareUrl,
} from '../engine/shareService'

describe('shareService', () => {
  it('correctly compresses and decompresses string data', () => {
    // Repeated structured world lore text where LZ dictionary shines
    const original = JSON.stringify({
      name: 'Eldoria',
      realmId: 104,
      lore: 'In the twilight of the first age, the world shattered into fragments of stone and memory. '.repeat(10),
      tags: ['fantasy', 'high-magic', 'archipelago', 'ancient-ruins', 'celestial-beings'],
      chronicle: Array.from({ length: 5 }, (_, i) => ({
        chapter: i + 1,
        title: `The Age of Radiance part ${i + 1}`,
        description: 'The ancient kingdom expanded across the western sea, building great stone spires.'
      }))
    })

    const compressed = compressStringToBase64Url(original)
    expect(typeof compressed).toBe('string')
    expect(compressed.length).toBeGreaterThan(0)
    // Compressed version should achieve compression on structured text
    expect(compressed.length).toBeLessThan(original.length)

    const decompressed = decompressBase64UrlToString(compressed)
    expect(decompressed).toBe(original)
  })

  it('generates and parses seed share URLs cleanly', () => {
    const world = createNewWorld('Whispering Vales', 'vales-99')
    world.generationSettings.geographyPreset = 'archipelago'
    world.generationSettings.fantasyLevel = 'high'
    world.generationSettings.disasterIntensity = 'cataclysmic'
    world.generationSettings.turnsPerStage = 10

    const url = generateSeedShareUrl(world, 'https://world-building.inbarrose.com/play')
    expect(url).toContain('seed=vales-99')
    expect(url).toContain('preset=archipelago')
    expect(url).toContain('fantasy=high')
    expect(url).toContain('disaster=cataclysmic')
    expect(url).toContain('turns=10')

    const search = url.split('?')[1]
    const parsedWorld = parseSeedShareUrl(search)
    expect(parsedWorld).not.toBeNull()
    expect(parsedWorld?.name).toBe('Whispering Vales')
    expect(parsedWorld?.generationSettings.seed).toBe('vales-99')
    expect(parsedWorld?.generationSettings.geographyPreset).toBe('archipelago')
    expect(parsedWorld?.generationSettings.fantasyLevel).toBe('high')
    expect(parsedWorld?.generationSettings.disasterIntensity).toBe('cataclysmic')
    expect(parsedWorld?.generationSettings.turnsPerStage).toBe(10)
  })

  it('encodes and decodes complete WorldState to/from hash fragment', () => {
    const world = createNewWorld('Chronicle of Solitude', 'sol-42')
    world.currentStage = 'civilization'
    world.drawHistory.push({
      id: 'draw_test_1',
      moveId: 1,
      card: { suit: '♠', value: 'A', id: '♠-A' },
      timestamp: new Date().toISOString(),
      stage: 'genesis',
      power: 'Cataclysmic Rift',
      note: 'The earth tore open at the dawn of time.',
      linkedTileIds: ['3,4'],
      linkedEntityIds: [],
    })
    world.entities.push({
      id: 'ent_1',
      name: 'Sun Guardians',
      category: 'species',
      description: 'Ancient solar beings.',
      originTileId: '3,4',
      status: 'active',
      stageCreated: 'genesis',
      traits: ['Luminous', 'Immortal'],
    })

    const hash = encodeWorldToCompressedHash(world)
    expect(hash.startsWith('#state=')).toBe(true)

    const fullUrl = generateFullStateShareUrl(world, 'https://world-building.inbarrose.com/play')
    expect(fullUrl.startsWith('https://world-building.inbarrose.com/play#state=')).toBe(true)

    const decoded = decodeWorldFromCompressedHash(hash)
    expect(decoded).not.toBeNull()
    expect(decoded?.name).toBe('Chronicle of Solitude')
    expect(decoded?.currentStage).toBe('civilization')
    expect(decoded?.drawHistory.length).toBe(1)
    expect(decoded?.drawHistory[0].power).toBe('Cataclysmic Rift')
    expect(decoded?.entities.length).toBe(1)
    expect(decoded?.entities[0].name).toBe('Sun Guardians')
    expect(decoded?.entities[0].traits).toContain('Luminous')
  })

  it('serializes and parses portable JSON world files with schema migration integrity', () => {
    const world = createNewWorld('Aethelgard High Kingdom', 'aethel-99')
    world.drawHistory.push({
      id: 'move_1',
      moveId: 1,
      card: { suit: '♥', value: 'K', id: '♥-K' },
      timestamp: new Date().toISOString(),
      stage: 'genesis',
      power: 'Crown of Peaks',
      note: 'The high peaks were forged.',
      linkedTileIds: ['1,2'],
      linkedEntityIds: [],
    })

    const json = serializeWorld(world)
    expect(typeof json).toBe('string')
    expect(json).toContain('Aethelgard High Kingdom')
    expect(json).toContain('Crown of Peaks')

    const imported = parseImportedWorld(json)
    expect(imported.name).toBe('Aethelgard High Kingdom')
    expect(imported.drawHistory.length).toBe(1)
    expect(imported.drawHistory[0].power).toBe('Crown of Peaks')
    expect(imported.schemaVersion).toBeGreaterThanOrEqual(1)
  })
})
