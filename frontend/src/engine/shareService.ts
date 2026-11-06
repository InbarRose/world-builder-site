import QRCode from 'qrcode'
import LZString from 'lz-string'
import { CURRENT_SCHEMA_VERSION, GeographyPreset, WorldState } from './types'
import { createNewWorld, migrateWorldState } from './storageService'

export interface SeedShareData {
  seed: string
  name: string
  geographyPreset?: string
  fantasyLevel?: string
  disasterIntensity?: string
  turnsPerStage?: number
}

/**
 * Compresses an arbitrary string into URL-safe encoded string using LZ-String.
 * Extremely efficient for JSON payloads in URL fragments.
 */
export function compressStringToBase64Url(str: string): string {
  return LZString.compressToEncodedURIComponent(str)
}

/**
 * Decompresses a URL-safe encoded string produced by compressStringToBase64Url.
 */
export function decompressBase64UrlToString(encoded: string): string {
  const result = LZString.decompressFromEncodedURIComponent(encoded)
  return result || ''
}

/**
 * Builds a compact, human-readable Seed Share URL for quick table onboarding.
 * e.g., https://world-building.inbarrose.com/play?shareType=seed&seed=whispering-vales-492&name=Whispering+Vales&preset=continent
 */
export function generateSeedShareUrl(world: WorldState, origin?: string): string {
  const base =
    origin || (typeof window !== 'undefined' ? `${window.location.origin}/play` : 'https://world-building.inbarrose.com/play')
  const params = new URLSearchParams()
  params.set('shareType', 'seed')
  params.set('name', world.name)
  params.set('seed', world.generationSettings?.seed || world.name.toLowerCase().replace(/[^a-z0-9]/g, ''))
  if (world.generationSettings?.geographyPreset) {
    params.set('preset', world.generationSettings.geographyPreset)
  }
  if (world.generationSettings?.fantasyLevel) {
    params.set('fantasy', world.generationSettings.fantasyLevel)
  }
  if (world.generationSettings?.disasterIntensity) {
    params.set('disaster', world.generationSettings.disasterIntensity)
  }
  if (world.generationSettings?.turnsPerStage) {
    params.set('turns', world.generationSettings.turnsPerStage.toString())
  }
  return `${base}?${params.toString()}`
}

/**
 * Parses seed parameters from a URL search string and creates a freshly seeded WorldState.
 */
export function parseSeedShareUrl(search: string): WorldState | null {
  try {
    const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`)
    const seed = params.get('seed')
    if (!seed) return null

    const name = params.get('name') || 'Shared Seed Realm'
    const newWorld = createNewWorld(name, seed)

    const preset = params.get('preset')
    if (preset) {
      newWorld.generationSettings.geographyPreset = preset as GeographyPreset
    }
    const fantasy = params.get('fantasy')
    if (fantasy === 'low' || fantasy === 'medium' || fantasy === 'high') {
      newWorld.generationSettings.fantasyLevel = fantasy
    }
    const disaster = params.get('disaster')
    if (disaster === 'mild' || disaster === 'standard' || disaster === 'cataclysmic') {
      newWorld.generationSettings.disasterIntensity = disaster
    }
    const turns = params.get('turns')
    if (turns && !isNaN(parseInt(turns, 10))) {
      newWorld.generationSettings.turnsPerStage = parseInt(turns, 10)
    }

    return newWorld
  } catch (err) {
    console.error('Failed to parse seed share URL', err)
    return null
  }
}

/**
 * Serializes and compresses the entire WorldState into a URL hash string.
 * Format: #state=<compressedUrlComponent>
 */
export function encodeWorldToCompressedHash(world: WorldState): string {
  const jsonStr = JSON.stringify({
    ...world,
    schemaVersion: CURRENT_SCHEMA_VERSION,
  })
  const compressed = compressStringToBase64Url(jsonStr)
  return `#state=${compressed}`
}

/**
 * Encodes the entire WorldState into a full shareable URL with hash fragment.
 */
export function generateFullStateShareUrl(world: WorldState, origin?: string): string {
  const base =
    origin || (typeof window !== 'undefined' ? `${window.location.origin}/play` : 'https://world-building.inbarrose.com/play')
  const hash = encodeWorldToCompressedHash(world)
  return `${base}${hash}`
}

/**
 * Decompresses and migrates a WorldState from a URL hash string or parameter.
 */
export function decodeWorldFromCompressedHash(hashOrParam: string): WorldState | null {
  try {
    let clean = hashOrParam.trim()
    if (clean.startsWith('#')) clean = clean.substring(1)
    if (clean.startsWith('state=')) clean = clean.substring('state='.length)
    if (!clean) return null

    const jsonStr = decompressBase64UrlToString(clean)
    if (!jsonStr) return null
    const raw = JSON.parse(jsonStr)
    return migrateWorldState(raw)
  } catch (err) {
    console.error('Failed to decode world from compressed hash', err)
    return null
  }
}

/**
 * Generates an SVG string representation of a QR Code.
 */
export async function generateQrCodeSvg(text: string, isDark = true): Promise<string> {
  return QRCode.toString(text, {
    type: 'svg',
    margin: 1,
    color: {
      dark: isDark ? '#e2e8f0' : '#0f172a',
      light: '#00000000', // transparent background
    },
  })
}

/**
 * Generates a PNG Data URL of a QR Code for direct rendering in an <img> tag or download.
 */
export async function generateQrCodeDataUrl(
  text: string,
  width = 280,
  isDark = true
): Promise<string> {
  return QRCode.toDataURL(text, {
    width,
    margin: 1,
    color: {
      dark: isDark ? '#e2e8f0' : '#0f172a',
      light: '#00000000',
    },
  })
}
