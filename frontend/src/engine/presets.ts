import { BotPersonalityId, EntityCategory, PlayerSeat, TerrainType } from './types'

export interface BotPersonalityMeta {
  id: BotPersonalityId
  name: string
  title: string
  icon: string
  description: string
  preferredTerrains: TerrainType[]
}

export const BOT_PERSONALITIES: Record<BotPersonalityId, BotPersonalityMeta> = {
  shaper: {
    id: 'shaper',
    name: 'Geomancer',
    title: 'The Earth-Shaper',
    icon: '🏔️',
    description:
      'Shapes dramatic mountain ranges, canyons, volcanic islands, and mineral-rich highlands.',
    preferredTerrains: ['mountain', 'earth', 'canyon', 'volcano'],
  },
  naturalist: {
    id: 'naturalist',
    name: 'Life-Weaver',
    title: 'The Verdant Guardian',
    icon: '🌿',
    description:
      'Cultivates lush forests, river basins, sacred groves, diverse species, and harmonious pacts.',
    preferredTerrains: ['forest', 'jungle', 'water', 'plains'],
  },
  architect: {
    id: 'architect',
    name: 'Architect',
    title: 'The Master Builder',
    icon: '🏛️',
    description:
      'Establishes coastal ports, trade roads, fortresses, grand monuments, and sprawling empires.',
    preferredTerrains: ['plains', 'water', 'earth', 'desert'],
  },
  chronicler: {
    id: 'chronicler',
    name: 'Lorekeeper',
    title: 'The Sage Diplomat',
    icon: '📜',
    description:
      'Fosters cultural traditions, philosophical enlightenment, libraries, treaties, and alliances.',
    preferredTerrains: ['plains', 'forest', 'water', 'tundra'],
  },
  catalyst: {
    id: 'catalyst',
    name: 'Catalyst',
    title: 'The Shadow Schemer',
    icon: '🗡️',
    description:
      'Sparks border rivalries, secret cabals, dramatic upheavals, and high-stakes conflicts.',
    preferredTerrains: ['desert', 'swamp', 'canyon', 'volcano'],
  },
  mythmaker: {
    id: 'mythmaker',
    name: 'Myth-Maker',
    title: 'The Wandering Bard',
    icon: '✨',
    description:
      'Weaves fantastical wonders, ancient ruins, slumbering dragons, prophecies, and lost relics.',
    preferredTerrains: ['mountain', 'forest', 'tundra', 'swamp'],
  },
}

export interface EntityPreset {
  id: string
  name: string
  category: EntityCategory
  icon: string
  color: string
  archetype: string
  description: string
  traits: string[]
  abilities: string[]
  preferredTerrains: TerrainType[]
}

export const SPECIES_PRESETS: EntityPreset[] = [
  {
    id: 'preset_sylvan_elves',
    name: 'Sylvan Star-Elves',
    category: 'species',
    icon: '🧝',
    color: '#10b981',
    archetype: 'Immortal Forest Guardians',
    description:
      'Graceful, long-lived beings attuned to ancient canopies and starlight magic.',
    traits: ['Starlight Navigation', 'Canopy Architecture', 'Oral Song-Lore'],
    abilities: ['Whispering Woods Empathy', 'Master Archery', 'Astral Weaving'],
    preferredTerrains: ['forest', 'jungle'],
  },
  {
    id: 'preset_iron_dwarves',
    name: 'Ironpeak Delvers',
    category: 'species',
    icon: '⛏️',
    color: '#f59e0b',
    archetype: 'Subterranean Master Smiths',
    description:
      'Stout artisans who carve subterranean halls into living granite and forge runic alloys.',
    traits: ['Clan Ancestor Veneration', 'Runic Metallurgy', 'Guild Oaths'],
    abilities: ['Deep-Stone Sense', 'Geothermal Engineering', 'Unbreakable Phalanx'],
    preferredTerrains: ['mountain', 'earth', 'volcano'],
  },
  {
    id: 'preset_meadow_halflings',
    name: 'Riverbend Halflings',
    category: 'species',
    icon: '🌾',
    color: '#84cc16',
    archetype: 'Pastoral River Folk',
    description:
      'Hospitality-loving communities of fertile valleys, famous for river barges and festivals.',
    traits: ['Harvest Festivals', 'Hearth-Hospitality', 'River Barge Trade'],
    abilities: ['Bountiful Agronomy', 'Swift Messenger Network', 'Luck of the Small'],
    preferredTerrains: ['plains', 'water'],
  },
  {
    id: 'preset_tideborn',
    name: 'Tideborn Pelagians',
    category: 'species',
    icon: '🔱',
    color: '#06b6d4',
    archetype: 'Amphibious Reef Navigators',
    description:
      'Coral-shaping mariners who dwell between sunken atolls and coastal cliffs.',
    traits: ['Tidal Reckoning', 'PearlScript Archives', 'Leviathan Respect'],
    abilities: ['Current Shaping', 'Deep-Diving Physiology', 'Storm-Calling'],
    preferredTerrains: ['water', 'ocean'],
  },
  {
    id: 'preset_sunscale_draconids',
    name: 'Sun-Scale Saurians',
    category: 'species',
    icon: '🦎',
    color: '#eab308',
    archetype: 'Desert & Mesa Astronomers',
    description:
      'Reptilian philosopher-warriors who build stepped ziggurats across sun-baked canyons.',
    traits: ['Solar Calendar', 'Ziggurat Observatories', 'Obsidian Craft'],
    abilities: ['Heat Resilience', 'Monolith Masonry', 'Mirage Lore'],
    preferredTerrains: ['desert', 'canyon', 'jungle'],
  },
  {
    id: 'preset_clockwork_automata',
    name: 'Aether-Forged Collective',
    category: 'species',
    icon: '⚙️',
    color: '#6366f1',
    archetype: 'Sentient Brass & Crystal Constructs',
    description:
      'Awakened constructs powered by resonant crystals and intricate clockwork cores.',
    traits: ['Harmonic Resonance', 'Memory Crystals', 'Precision Guilds'],
    abilities: ['Tireless Labor', 'Arcane Conduit', 'Modular Adaptation'],
    preferredTerrains: ['earth', 'mountain', 'canyon'],
  },
  {
    id: 'preset_frost_giants',
    name: 'Rime-Kin Goliath Clans',
    category: 'species',
    icon: '❄️',
    color: '#38bdf8',
    archetype: 'Nomadic Tundra Wayfarers',
    description:
      'Towering wanderers of the frozen north who carve sagas into glacial monoliths.',
    traits: ['Sky-Burial Rites', 'Mammoth Herding', 'Aurora Augury'],
    abilities: ['Frost Endurance', 'Megalithic Strength', 'Blizzard Stride'],
    preferredTerrains: ['tundra', 'mountain'],
  },
  {
    id: 'preset_fen_myconids',
    name: 'Gloom-Spore Myconids',
    category: 'species',
    icon: '🍄',
    color: '#a855f7',
    archetype: 'Symbiotic Marsh Collective',
    description:
      'Bioluminescent fungal beings connected by a shared subterranean root-consciousness.',
    traits: ['Spore Telepathy', 'Bioluminescent Groves', 'Alchemical Renewal'],
    abilities: ['Mycelial Network', 'Herbal Transmutation', 'Mist Camouflage'],
    preferredTerrains: ['swamp', 'forest', 'jungle'],
  },
]

export const SOCIETY_PRESETS: EntityPreset[] = [
  {
    id: 'preset_maritime_republic',
    name: 'Thalassian League',
    category: 'society',
    icon: '⛵',
    color: '#0284c7',
    archetype: 'Merchant Maritime Republic',
    description:
      'A confederation of free port cities ruled by elected admirals and trade syndicates.',
    traits: ['Free Harbor Charter', 'Cartographers Guild', 'Gold Standard Coinage'],
    abilities: ['Grand Armada', 'Trade Monopoly', 'Diplomatic Envoys'],
    preferredTerrains: ['water', 'plains'],
  },
  {
    id: 'preset_imperial_dynasty',
    name: 'Solaris Hegemony',
    category: 'society',
    icon: '👑',
    color: '#dc2626',
    archetype: 'Expansionist Imperial Dynasty',
    description:
      'A centralized empire famed for stone highways, disciplined legions, and monumental aqueducts.',
    traits: ['Imperial Highway Network', 'Codified Law', 'Tribute Provinces'],
    abilities: ['Siege Craft', 'Provincial Fortification', 'Civic Engineering'],
    preferredTerrains: ['plains', 'earth', 'mountain'],
  },
  {
    id: 'preset_arcane_conclave',
    name: 'Conclave of the Silver Spire',
    category: 'society',
    icon: '🔮',
    color: '#7c3aed',
    archetype: 'Magocratic Scholarly Order',
    description:
      'A realm governed by arch-scholars and astronomers from floating and terraced citadels.',
    traits: ['Great Library', 'Ley-Line Observatories', 'Arcane Apprenticeships'],
    abilities: ['Spell-Warded Borders', 'Enlightenment Research', 'Scrying Network'],
    preferredTerrains: ['mountain', 'forest', 'earth'],
  },
  {
    id: 'preset_sacred_covenant',
    name: 'Verdant Covenant',
    category: 'society',
    icon: '🌳',
    color: '#16a34a',
    archetype: 'Druidic Theocracy & Sanctuary',
    description:
      'A peaceful commonwealth dedicated to preserving ancient groves and mediating disputes.',
    traits: ['Sacred Truce Grounds', 'World-Tree Shrines', 'Healers Hospitality'],
    abilities: ['Sanctuary Diplomacy', 'Bountiful Harvests', 'Forest Guardians'],
    preferredTerrains: ['forest', 'jungle', 'plains'],
  },
]

export const MYTH_PRESETS: EntityPreset[] = [
  {
    id: 'preset_slumbering_dragon',
    name: 'Cinder-Wyrm of Mount Ash',
    category: 'myth',
    icon: '🐉',
    color: '#ea580c',
    archetype: 'Ancient Calamity Beast',
    description:
      'An elder dragon whose restless dreams cause tremors and ash-fall across neighboring realms.',
    traits: ['Hoard of First-Age Relics', 'Volcanic Lair', 'Prophesied Awakening'],
    abilities: ['Dragonfire Cataclysm', 'Aura of Dread'],
    preferredTerrains: ['volcano', 'mountain', 'canyon'],
  },
  {
    id: 'preset_sunken_citadel',
    name: 'The Sunken Star-Citadel',
    category: 'myth',
    icon: '🏛️',
    color: '#0891b2',
    archetype: 'Lost Precursor Ruin',
    description:
      'A pre-history spire submerged beneath the waves whose bells still toll before great storms.',
    traits: ['Precursor Glyphs', 'Abyssal Guardians', 'Tidal Anomaly'],
    abilities: ['Ancient Knowledge', 'Cursed Treasure'],
    preferredTerrains: ['ocean', 'water', 'swamp'],
  },
  {
    id: 'preset_whispering_cabal',
    name: 'Order of the Veiled Eclipse',
    category: 'myth',
    icon: '🎭',
    color: '#4f46e5',
    archetype: 'Secret Political Conspiracy',
    description:
      'A clandestine network of spymasters and merchants pulling strings across royal courts.',
    traits: ['Ciphered Coins', 'Shadow Informants', 'Infiltrated Councils'],
    abilities: ['Silent Coup', 'Black Market Trade'],
    preferredTerrains: ['plains', 'desert', 'earth'],
  },
]

export const PLAYER_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#ef4444', // Red
]

export const DEFAULT_PLAYERS: PlayerSeat[] = [
  {
    id: 'player_1',
    name: 'Player 1',
    color: PLAYER_COLORS[0],
    role: 'Artist',
    isBot: false,
    personality: 'shaper',
  },
]
