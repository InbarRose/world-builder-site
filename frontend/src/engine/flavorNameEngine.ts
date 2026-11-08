/**
 * flavorNameEngine.ts
 * Procedural combinatorial fantasy name and ledger narrative generator.
 * Generates evocative names for geographic features, settlements, empires,
 * species, characters, and chronicles for tabletop worldbuilding.
 */

import { StageActionPreset } from './presets'

// ========================================================
// 1. LEXICAL CORPORA & COMBINATORIAL MORPHEMES
// ========================================================

const ADJECTIVES = [
  'Whispering', 'Shattered', 'Emerald', 'Crimson', 'Obsidian',
  'Sunlit', 'Silver', 'Mistveil', 'Ironclad', 'Starfall',
  'Amber', 'Ashen', 'Frostpeak', 'Verdant', 'Sapphire',
  'Golden', 'Thunderous', 'Ancient', 'Silent', 'Moonlit',
  'Gilded', 'Storm-Forged', 'Hollow', 'Serpentine', 'Radiant',
  'Shadowed', 'Crystalline', 'Timeless', 'Bloodstone', 'Ebon'
]

const TITLES = [
  'the Undying', 'the Stalwart', 'the Visionary', 'the Sun-Seeker',
  'the Deep-Warden', 'the Sky-Singer', 'the Shield-Breaker', 'the Law-Giver',
  'the Cartographer', 'the Weaver', 'the Pale Blade', 'the Tide-Caller',
  'the Ashen Hand', 'the Hearth-Keeper', 'the Peacemaker', 'the Sovereign'
]

const MOUNTAIN_SUFFIXES = ['Peaks', 'Spire', 'Crag', 'Crown', 'Needle', 'Ridge', 'Massif', 'Pinnacle', 'Horns', 'Wall']
const MOUNTAIN_SEEDS = ['Sun', 'Eagle', 'Titan', 'Iron', 'Frost', 'Thunder', 'Dragon', 'Cloud', 'Ancestor', 'Storm']

const CANYON_SUFFIXES = ['Gorge', 'Chasm', 'Rift', 'Abyss', 'Ravine', 'Sunder', 'Cenote', 'Cleft', 'Flume', 'Pass']
const CANYON_SEEDS = ['Redrock', 'Serpent', 'Echoing', 'Shadow', 'Shattered', 'Bleeding', 'Obsidian', 'Wind-Carved', 'Sunken']

const FOREST_SUFFIXES = ['Weald', 'Canopy', 'Bramble', 'Grove', 'Woods', 'Timberlands', 'Holt', 'Taiga', 'Redwoods', 'Gloaming']
const FOREST_SEEDS = ['Emerald', 'Whispering', 'Ironwood', 'Silverleaf', 'Bramble', 'Mistveil', 'Verdant', 'Gnarled', 'Ancient']

const WATER_SUFFIXES = ['River', 'Falls', 'Basin', 'Delta', 'Cataract', 'Rapids', 'Bay', 'Reach', 'Current', 'Depths']
const WATER_SEEDS = ['Silverwash', 'Azure', 'Roaring', 'Mirror', 'Tide', 'Crystal', 'Serpent', 'Moonlight', 'Abyssal']

const SETTLEMENT_SUFFIXES = ['Haven', 'Crossing', 'Hearth', 'Hold', 'Quay', 'Pueblo', 'Camp', 'Stockade', 'Watch', 'Hamlet']
const SETTLEMENT_SEEDS = ['Oak', 'Redfall', 'Stone', 'River', 'High', 'Pine', 'Sun', 'Falcon', 'Timber', 'Deep']

const CITADEL_SUFFIXES = ['Citadel', 'Keep', 'Bastion', 'Fortress', 'Sanctuary', 'Spire', 'Bulwark', 'Garrison', 'Redoubt']
const CITADEL_SEEDS = ['Iron', 'High-Tower', 'Aegis', 'Sovereign', 'Dread', 'Alabaster', 'Stone-Crest', 'Storm-Shield']

const EMPIRE_PREFIXES = ['The High', 'The Sovereign', 'The Holy', 'The Grand', 'The United', 'The Dynastic', 'The Serene']
const EMPIRE_FORMS = ['Empire', 'Hegemony', 'League', 'Dominion', 'Concordat', 'Sultanate', 'Commonwealth', 'Republic', 'Dynasty']
const EMPIRE_ROOTS = ['Valoria', 'Sol-Dravia', 'Aethelgard', 'Gondoril', 'Vael-Shara', 'Khel-Torum', 'Thalassia', 'Oakhaven', 'Eldergard']

const SPECIES_ROOTS = ['Elv', 'Dwarf', 'Vael', 'Khor', 'Sylv', 'Drak', 'Thal', 'Urk', 'Fen', 'Astr']
const SPECIES_SUFFIXES = ['ar', 'en', 'kin', 'ari', 'folk', 'born', 'dwellers', 'striders', 'shapers']

const GIVEN_NAMES = [
  'Theron', 'Vael', 'Selene', 'Moros', 'Kaelen', 'Bran', 'Thyra', 'Krag',
  'Orin', 'Yvaine', 'Doran', 'Lyanna', 'Gideon', 'Mirei', 'Torvald', 'Zephyr'
]

// ========================================================
// 2. DETERMINISTIC PSEUDO-RANDOM PICKER
// ========================================================

function stringHash(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i)
  }
  return Math.abs(hash)
}

function pickBySeed<T>(items: T[], seedValue: number | string): T {
  const num = typeof seedValue === 'number' ? Math.floor(Math.abs(seedValue)) : stringHash(seedValue)
  return items[num % items.length]
}

// ========================================================
// 3. CORE GENERATOR METHODS
// ========================================================

/**
 * Generates an evocative name for a map feature based on its concept and optional seed
 */
export function generateFeatureName(
  conceptOrCategory: string,
  _variantOrBiome = 'general',
  seed: string | number = Math.random()
): string {
  const s1 = typeof seed === 'number' ? seed : stringHash(seed)
  const s2 = s1 * 31 + 17
  const s3 = s2 * 13 + 7

  const c = conceptOrCategory.toLowerCase()

  if (c.includes('mountain') || c.includes('peak') || c.includes('hill')) {
    const p = pickBySeed(MOUNTAIN_SEEDS, s1)
    const suf = pickBySeed(MOUNTAIN_SUFFIXES, s2)
    return s3 % 3 === 0
      ? `The ${pickBySeed(ADJECTIVES, s3)} ${p} ${suf}`
      : `${p} ${suf}`
  }

  if (c.includes('canyon') || c.includes('gorge') || c.includes('cliff') || c.includes('rift') || c.includes('cave')) {
    const p = pickBySeed(CANYON_SEEDS, s1)
    const suf = pickBySeed(CANYON_SUFFIXES, s2)
    return `The ${p} ${suf}`
  }

  if (c.includes('forest') || c.includes('jungle') || c.includes('wood') || c.includes('tree') || c.includes('grass')) {
    const p = pickBySeed(FOREST_SEEDS, s1)
    const suf = pickBySeed(FOREST_SUFFIXES, s2)
    return s3 % 2 === 0
      ? `The ${pickBySeed(ADJECTIVES, s3)} ${suf}`
      : `${p} ${suf}`
  }

  if (c.includes('river') || c.includes('lake') || c.includes('water') || c.includes('ocean') || c.includes('swamp')) {
    const p = pickBySeed(WATER_SEEDS, s1)
    const suf = pickBySeed(WATER_SUFFIXES, s2)
    return `${p} ${suf}`
  }

  if (c.includes('castle') || c.includes('citadel') || c.includes('wall') || c.includes('fort') || c.includes('monument')) {
    const p = pickBySeed(CITADEL_SEEDS, s1)
    const suf = pickBySeed(CITADEL_SUFFIXES, s2)
    return `${p} ${suf}`
  }

  if (c.includes('settle') || c.includes('town') || c.includes('village') || c.includes('camp') || c.includes('outpost')) {
    const p = pickBySeed(SETTLEMENT_SEEDS, s1)
    const suf = pickBySeed(SETTLEMENT_SUFFIXES, s2)
    return `${p}${suf}`
  }

  // Fallback
  return `${pickBySeed(ADJECTIVES, s1)} ${pickBySeed(MOUNTAIN_SUFFIXES, s2)}`
}

/**
 * Generates an evocative name for an entity (species, society/empire, character, myth)
 */
export function generateEntityName(
  category: 'species' | 'society' | 'character' | 'myth' | 'general',
  _archetype = 'balanced',
  seed: string | number = Math.random()
): string {
  const s1 = typeof seed === 'number' ? seed : stringHash(seed)
  const s2 = s1 * 37 + 19
  const s3 = s2 * 17 + 11

  switch (category) {
    case 'species': {
      const root = pickBySeed(SPECIES_ROOTS, s1)
      const suf = pickBySeed(SPECIES_SUFFIXES, s2)
      const adj = pickBySeed(ADJECTIVES, s3)
      return s3 % 2 === 0 ? `${root}${suf}` : `${adj} ${root}${suf}`
    }

    case 'society': {
      const pref = pickBySeed(EMPIRE_PREFIXES, s1)
      const form = pickBySeed(EMPIRE_FORMS, s2)
      const root = pickBySeed(EMPIRE_ROOTS, s3)
      return `${pref} ${form} of ${root}`
    }

    case 'character': {
      const given = pickBySeed(GIVEN_NAMES, s1)
      const title = pickBySeed(TITLES, s2)
      return `${given} ${title}`
    }

    case 'myth': {
      const adj = pickBySeed(ADJECTIVES, s1)
      const nouns = ['Dragon', 'Archlich', 'Sunken Scepter', 'First Flame', 'Star-Forge', 'Abyssal Bell', 'Primordial Titan', 'Crimson Comet']
      const noun = pickBySeed(nouns, s2)
      return `The Legend of the ${adj} ${noun}`
    }

    default:
      return `${pickBySeed(ADJECTIVES, s1)} Concord`
  }
}

/**
 * Formulates a rich, complete narrative sentence for the world ledger chronicle
 */
export function generateLedgerProse(
  preset: StageActionPreset,
  featureName: string,
  entityName?: string,
  tileCoord?: string
): string {
  const locText = tileCoord ? ` at coordinates (${tileCoord})` : ''
  const entityText = entityName ? ` under the aegis of the ${entityName}` : ''

  if (preset.exampleNarrative) {
    // Weave the evocative feature name smoothly into the example narrative
    return `[${featureName}${locText}] ${preset.exampleNarrative}${entityText}`
  }

  return `[${featureName}${locText}] Established ${preset.name.toLowerCase()}${entityText}. ${preset.description}`
}
