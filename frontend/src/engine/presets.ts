import {
  BotPersonalityId,
  BotPersonalityWeights,
  CompanionSettlementIcons,
  EntityCategory,
  FloraType,
  PlayerSeat,
  RelationshipType,
  ReliefType,
  StageId,
  Suit,
  TerrainType,
  TileOverlay,
  TileSlotCategory,
} from './types'

export interface BotPersonalityMeta {
  id: BotPersonalityId
  name: string
  title: string
  icon: string
  description: string
  preferredTerrains: TerrainType[]
  defaultWeights: BotPersonalityWeights
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
    defaultWeights: {
      geography: 95,
      ecology: 40,
      civilization: 45,
      diplomacy: 30,
      conflict: 40,
      myth: 50,
    },
  },
  naturalist: {
    id: 'naturalist',
    name: 'Life-Weaver',
    title: 'The Verdant Guardian',
    icon: '🌿',
    description:
      'Cultivates lush forests, river basins, sacred groves, diverse species, and harmonious pacts.',
    preferredTerrains: ['forest', 'jungle', 'water', 'plains'],
    defaultWeights: {
      geography: 45,
      ecology: 95,
      civilization: 40,
      diplomacy: 75,
      conflict: 20,
      myth: 55,
    },
  },
  architect: {
    id: 'architect',
    name: 'Architect',
    title: 'The Master Builder',
    icon: '🏛️',
    description:
      'Establishes coastal ports, trade roads, fortresses, grand monuments, and sprawling empires.',
    preferredTerrains: ['plains', 'water', 'earth', 'desert'],
    defaultWeights: {
      geography: 50,
      ecology: 35,
      civilization: 95,
      diplomacy: 70,
      conflict: 35,
      myth: 30,
    },
  },
  chronicler: {
    id: 'chronicler',
    name: 'Lorekeeper',
    title: 'The Sage Diplomat',
    icon: '📜',
    description:
      'Fosters cultural traditions, philosophical enlightenment, libraries, treaties, and alliances.',
    preferredTerrains: ['plains', 'forest', 'water', 'tundra'],
    defaultWeights: {
      geography: 35,
      ecology: 55,
      civilization: 75,
      diplomacy: 95,
      conflict: 25,
      myth: 65,
    },
  },
  catalyst: {
    id: 'catalyst',
    name: 'Catalyst',
    title: 'The Shadow Schemer',
    icon: '🗡️',
    description:
      'Sparks border rivalries, secret cabals, dramatic upheavals, and high-stakes conflicts.',
    preferredTerrains: ['desert', 'swamp', 'canyon', 'volcano'],
    defaultWeights: {
      geography: 65,
      ecology: 25,
      civilization: 55,
      diplomacy: 25,
      conflict: 95,
      myth: 75,
    },
  },
  mythmaker: {
    id: 'mythmaker',
    name: 'Myth-Maker',
    title: 'The Wandering Bard',
    icon: '✨',
    description:
      'Weaves fantastical wonders, ancient ruins, slumbering dragons, prophecies, and lost relics.',
    preferredTerrains: ['mountain', 'forest', 'tundra', 'swamp'],
    defaultWeights: {
      geography: 55,
      ecology: 60,
      civilization: 40,
      diplomacy: 50,
      conflict: 45,
      myth: 95,
    },
  },
}

export interface EntityPreset {
  id: string
  name: string
  category: EntityCategory
  icon: string
  color: string
  secondaryColor: string
  archetype: string
  description: string
  traits: string[]
  abilities: string[]
  preferredTerrains: TerrainType[]
  settlementIcons: CompanionSettlementIcons
}

/**
 * Species presets start completely PLAIN and MODULAR (like Lego blocks):
 * No pre-baked descriptions, traits, or powers! Players and card draws snap
 * adaptations, traditions, and powers onto each species over the course of the game.
 */
export const SPECIES_PRESETS: EntityPreset[] = [
  {
    id: 'preset_sylvan_elves',
    name: 'Sylvan Star-Elves',
    category: 'species',
    icon: '🧝',
    color: '#10b981',
    secondaryColor: '#fef3c7',
    archetype: '',
    description: '',
    traits: [],
    abilities: [],
    preferredTerrains: ['forest', 'jungle'],
    settlementIcons: {
      camp: '🍃',
      village: '🌳',
      town: '🎋',
      city: '🗼',
      metropolis: '🌟',
      architectureStyle: 'Living Canopy Spires',
    },
  },
  {
    id: 'preset_iron_dwarves',
    name: 'Ironpeak Delvers',
    category: 'species',
    icon: '⛏️',
    color: '#f59e0b',
    secondaryColor: '#78350f',
    archetype: '',
    description: '',
    traits: [],
    abilities: [],
    preferredTerrains: ['mountain', 'earth', 'volcano'],
    settlementIcons: {
      camp: '⛺',
      village: '🪨',
      town: '⚒️',
      city: '🏰',
      metropolis: '🏔️',
      architectureStyle: 'Carved Granite Holds',
    },
  },
  {
    id: 'preset_dawnwatch_humans',
    name: 'Dawnwatch Humans',
    category: 'species',
    icon: '🛡️',
    color: '#2563eb',
    secondaryColor: '#dbeafe',
    archetype: '',
    description: '',
    traits: [],
    abilities: [],
    preferredTerrains: ['plains', 'earth', 'water'],
    settlementIcons: {
      camp: '⛺',
      village: '🏡',
      town: '🏘️',
      city: '🏰',
      metropolis: '👑',
      architectureStyle: 'Timber & Stone Walled Keeps',
    },
  },
  {
    id: 'preset_steppe_orcs',
    name: 'Thunder-Steppe Orcs',
    category: 'species',
    icon: '🐺',
    color: '#dc2626',
    secondaryColor: '#fde68a',
    archetype: '',
    description: '',
    traits: [],
    abilities: [],
    preferredTerrains: ['plains', 'earth', 'canyon'],
    settlementIcons: {
      camp: '⛺',
      village: '🔥',
      town: '🛡️',
      city: '⚔️',
      metropolis: '🚩',
      architectureStyle: 'Great Horned War-Camps & Citadels',
    },
  },
  {
    id: 'preset_meadow_halflings',
    name: 'Riverbend Halflings',
    category: 'species',
    icon: '🌾',
    color: '#84cc16',
    secondaryColor: '#fef9c3',
    archetype: '',
    description: '',
    traits: [],
    abilities: [],
    preferredTerrains: ['plains', 'water'],
    settlementIcons: {
      camp: '🏕️',
      village: '🌻',
      town: '🏡',
      city: '🏛️',
      metropolis: '🎡',
      architectureStyle: 'Hillside Burrows & Mill-Towns',
    },
  },
  {
    id: 'preset_sunscale_draconids',
    name: 'Sun-Scale Saurians',
    category: 'species',
    icon: '🦎',
    color: '#eab308',
    secondaryColor: '#991b1b',
    archetype: '',
    description: '',
    traits: [],
    abilities: [],
    preferredTerrains: ['desert', 'canyon', 'jungle'],
    settlementIcons: {
      camp: '☀️',
      village: '🏜️',
      town: '🛕',
      city: '🏛️',
      metropolis: '🌞',
      architectureStyle: 'Golden Stepped Ziggurats',
    },
  },
  {
    id: 'preset_tideborn',
    name: 'Tideborn Pelagians',
    category: 'species',
    icon: '🔱',
    color: '#06b6d4',
    secondaryColor: '#cffafe',
    archetype: '',
    description: '',
    traits: [],
    abilities: [],
    preferredTerrains: ['water', 'ocean'],
    settlementIcons: {
      camp: '🐚',
      village: '⚓',
      town: '⛵',
      city: '🔱',
      metropolis: '🌊',
      architectureStyle: 'Coral Spires & Floating Atolls',
    },
  },
  {
    id: 'preset_clockwork_automata',
    name: 'Aether-Forged Collective',
    category: 'species',
    icon: '⚙️',
    color: '#6366f1',
    secondaryColor: '#fcd34d',
    archetype: '',
    description: '',
    traits: [],
    abilities: [],
    preferredTerrains: ['earth', 'mountain', 'canyon'],
    settlementIcons: {
      camp: '🔩',
      village: '⚙️',
      town: '🏭',
      city: '⚡',
      metropolis: '🔮',
      architectureStyle: 'Clockwork Foundry-Towers',
    },
  },
  {
    id: 'preset_frost_giants',
    name: 'Rime-Kin Goliath Clans',
    category: 'species',
    icon: '❄️',
    color: '#38bdf8',
    secondaryColor: '#e0f2fe',
    archetype: '',
    description: '',
    traits: [],
    abilities: [],
    preferredTerrains: ['tundra', 'mountain'],
    settlementIcons: {
      camp: '❄️',
      village: '🧊',
      town: '🗿',
      city: '🏔️',
      metropolis: '👑',
      architectureStyle: 'Glacial Megalith Halls',
    },
  },
  {
    id: 'preset_fen_myconids',
    name: 'Gloom-Spore Myconids',
    category: 'species',
    icon: '🍄',
    color: '#a855f7',
    secondaryColor: '#86efac',
    archetype: '',
    description: '',
    traits: [],
    abilities: [],
    preferredTerrains: ['swamp', 'forest', 'jungle'],
    settlementIcons: {
      camp: '🍄',
      village: '🌿',
      town: '🔮',
      city: '🌺',
      metropolis: '✨',
      architectureStyle: 'Bioluminescent Fungal Domes',
    },
  },
  {
    id: 'preset_twilight_fae',
    name: 'Twilight Court Sidhe',
    category: 'species',
    icon: '🦋',
    color: '#ec4899',
    secondaryColor: '#f3e8ff',
    archetype: '',
    description: '',
    traits: [],
    abilities: [],
    preferredTerrains: ['forest', 'plains', 'swamp'],
    settlementIcons: {
      camp: '🦋',
      village: '🌸',
      town: '🌙',
      city: '🏰',
      metropolis: '✨',
      architectureStyle: 'Gossamer & Moonstone Pavilions',
    },
  },
  {
    id: 'preset_crystal_lithids',
    name: 'Prism-Core Lithids',
    category: 'species',
    icon: '💎',
    color: '#14b8a6',
    secondaryColor: '#f0fdfa',
    archetype: '',
    description: '',
    traits: [],
    abilities: [],
    preferredTerrains: ['canyon', 'mountain', 'desert'],
    settlementIcons: {
      camp: '🔹',
      village: '💎',
      town: '🔷',
      city: '🏛️',
      metropolis: '💠',
      architectureStyle: 'Refractive Crystal Spires',
    },
  },
]

export const SOCIETY_PRESETS: EntityPreset[] = [
  {
    id: 'preset_maritime_republic',
    name: 'Thalassian League',
    category: 'society',
    icon: '⛵',
    color: '#0284c7',
    secondaryColor: '#bae6fd',
    archetype: 'Merchant Maritime Republic',
    description:
      'A confederation of free port cities ruled by elected admirals and trade syndicates.',
    traits: ['Free Harbor Charter', 'Cartographers Guild', 'Gold Standard Coinage'],
    abilities: ['Grand Armada', 'Trade Monopoly', 'Diplomatic Envoys'],
    preferredTerrains: ['water', 'plains'],
    settlementIcons: {
      camp: '⚓',
      village: '⛵',
      town: '🏘️',
      city: '🏛️',
      metropolis: '👑',
      architectureStyle: 'Harbor Fortresses & Canals',
    },
  },
  {
    id: 'preset_imperial_dynasty',
    name: 'Solaris Hegemony',
    category: 'society',
    icon: '👑',
    color: '#dc2626',
    secondaryColor: '#fef08a',
    archetype: 'Expansionist Imperial Dynasty',
    description:
      'A centralized empire famed for stone highways, disciplined legions, and monumental aqueducts.',
    traits: ['Imperial Highway Network', 'Codified Law', 'Tribute Provinces'],
    abilities: ['Siege Craft', 'Provincial Fortification', 'Civic Engineering'],
    preferredTerrains: ['plains', 'earth', 'mountain'],
    settlementIcons: {
      camp: '⛺',
      village: '🛡️',
      town: '🏛️',
      city: '🏰',
      metropolis: '👑',
      architectureStyle: 'Marble Domes & Triumphal Bastions',
    },
  },
  {
    id: 'preset_arcane_conclave',
    name: 'Conclave of the Silver Spire',
    category: 'society',
    icon: '🔮',
    color: '#7c3aed',
    secondaryColor: '#ddd6fe',
    archetype: 'Magocratic Scholarly Order',
    description:
      'A realm governed by arch-scholars and astronomers from floating and terraced citadels.',
    traits: ['Great Library', 'Ley-Line Observatories', 'Arcane Apprenticeships'],
    abilities: ['Spell-Warded Borders', 'Enlightenment Research', 'Scrying Network'],
    preferredTerrains: ['mountain', 'forest', 'earth'],
    settlementIcons: {
      camp: '✨',
      village: '🔮',
      town: '🗼',
      city: '🏛️',
      metropolis: '🌟',
      architectureStyle: 'Arcane Observatories & Spires',
    },
  },
  {
    id: 'preset_sacred_covenant',
    name: 'Verdant Covenant',
    category: 'society',
    icon: '🌳',
    color: '#16a34a',
    secondaryColor: '#bbf7d0',
    archetype: 'Druidic Theocracy & Sanctuary',
    description:
      'A peaceful commonwealth dedicated to preserving ancient groves and mediating disputes.',
    traits: ['Sacred Truce Grounds', 'World-Tree Shrines', 'Healers Hospitality'],
    abilities: ['Sanctuary Diplomacy', 'Bountiful Harvests', 'Forest Guardians'],
    preferredTerrains: ['forest', 'jungle', 'plains'],
    settlementIcons: {
      camp: '🌿',
      village: '🌳',
      town: '🏡',
      city: '🏛️',
      metropolis: '🌺',
      architectureStyle: 'Living Stone & Sanctuary Groves',
    },
  },
  {
    id: 'preset_iron_syndicate',
    name: 'Deep-Forge Commonwealth',
    category: 'society',
    icon: '⚒️',
    color: '#d97706',
    secondaryColor: '#fed7aa',
    archetype: 'Industrial Guild Confederation',
    description:
      'An alliance of mountain holds and foundry cities bound by subterranean rail-tunnels and trade.',
    traits: ['Sovereign Foundry Charter', 'Subterranean Causeways', 'Master Artificers'],
    abilities: ['Steam & Gear Fortifications', 'Heavy Metallurgy', 'Vault Treasury'],
    preferredTerrains: ['mountain', 'earth', 'canyon'],
    settlementIcons: {
      camp: '⛏️',
      village: '🪨',
      town: '⚒️',
      city: '🏰',
      metropolis: '🏔️',
      architectureStyle: 'Iron-Bound Mountain Citadels',
    },
  },
  {
    id: 'preset_crimson_khanate',
    name: 'Golden Winds Khaganate',
    category: 'society',
    icon: '🐎',
    color: '#b91c1c',
    secondaryColor: '#fde047',
    archetype: 'Nomadic Steppe Confederation',
    description:
      'Unrivaled riders who unite dozen of clans under the Eternal Sky banner and guard silk caravan routes.',
    traits: ['Sky-Steppe Law', 'Caravan Safe-Conduct', 'Grand Kurultai Council'],
    abilities: ['Swift Outriders', 'Steppe Logistics', 'Composite Bow Mastery'],
    preferredTerrains: ['plains', 'desert', 'earth'],
    settlementIcons: {
      camp: '⛺',
      village: '🔥',
      town: '🚩',
      city: '🏰',
      metropolis: '👑',
      architectureStyle: 'Pavilion Cities & Caravan Caravanserais',
    },
  },
]

export const MYTH_PRESETS: EntityPreset[] = [
  {
    id: 'preset_slumbering_dragon',
    name: 'Cinder-Wyrm of Mount Ash',
    category: 'myth',
    icon: '🐉',
    color: '#ea580c',
    secondaryColor: '#fed7aa',
    archetype: 'Ancient Calamity Beast',
    description:
      'An elder dragon whose restless dreams cause tremors and ash-fall across neighboring realms.',
    traits: ['Hoard of First-Age Relics', 'Volcanic Lair', 'Prophesied Awakening'],
    abilities: ['Dragonfire Cataclysm', 'Aura of Dread'],
    preferredTerrains: ['volcano', 'mountain', 'canyon'],
    settlementIcons: {
      camp: '🔥',
      village: '🐉',
      town: '🌋',
      city: '🐉',
      metropolis: '🐉',
    },
  },
  {
    id: 'preset_sunken_citadel',
    name: 'The Sunken Star-Citadel',
    category: 'myth',
    icon: '🏛️',
    color: '#0891b2',
    secondaryColor: '#a5f3fc',
    archetype: 'Lost Precursor Ruin',
    description:
      'A pre-history spire submerged beneath the waves whose bells still toll before great storms.',
    traits: ['Precursor Glyphs', 'Abyssal Guardians', 'Tidal Anomaly'],
    abilities: ['Ancient Knowledge', 'Cursed Treasure'],
    preferredTerrains: ['ocean', 'water', 'swamp'],
    settlementIcons: {
      camp: '🏛️',
      village: '🏛️',
      town: '🏛️',
      city: '🏛️',
      metropolis: '🏛️',
    },
  },
  {
    id: 'preset_whispering_cabal',
    name: 'Order of the Veiled Eclipse',
    category: 'myth',
    icon: '🎭',
    color: '#4f46e5',
    secondaryColor: '#c7d2fe',
    archetype: 'Secret Political Conspiracy',
    description:
      'A clandestine network of spymasters and merchants pulling strings across royal courts.',
    traits: ['Ciphered Coins', 'Shadow Informants', 'Infiltrated Councils'],
    abilities: ['Silent Coup', 'Black Market Trade'],
    preferredTerrains: ['plains', 'desert', 'earth'],
    settlementIcons: {
      camp: '🎭',
      village: '🎭',
      town: '🎭',
      city: '🎭',
      metropolis: '🎭',
    },
  },
  {
    id: 'preset_lich_necropolis',
    name: 'Ashen Crown Necropolis',
    category: 'myth',
    icon: '💀',
    color: '#6b21a8',
    secondaryColor: '#e9d5ff',
    archetype: 'Undying Sorcerer-King Domain',
    description:
      'A haunted mausoleum-city where an immortal arch-mage guards forbidden scrolls of the First Age.',
    traits: ['Eternal Watchguard', 'Soul-Gem Vaults', 'Whispering Catacombs'],
    abilities: ['Necromantic Mist', 'Ancient Grimoires'],
    preferredTerrains: ['swamp', 'desert', 'mountain'],
    settlementIcons: {
      camp: '💀',
      village: '💀',
      town: '💀',
      city: '💀',
      metropolis: '💀',
    },
  },
  {
    id: 'preset_world_tree_heart',
    name: 'Yggdrasil’s Wounded Root',
    category: 'myth',
    icon: '🌳',
    color: '#059669',
    secondaryColor: '#a7f3d0',
    archetype: 'Sacred Cosmic Landmark',
    description:
      'A colossal primordial tree whose sap grants visions of the past and draws pilgrims from every kingdom.',
    traits: ['Luminous Sap-Springs', 'Pilgrimage Sanctuary', 'Planar Roots'],
    abilities: ['Miraculous Healing', 'Prophetic Dreams'],
    preferredTerrains: ['forest', 'jungle', 'plains'],
    settlementIcons: {
      camp: '🌳',
      village: '🌳',
      town: '🌳',
      city: '🌳',
      metropolis: '🌳',
    },
  },
]

export interface RelationshipPreset {
  type: RelationshipType
  label: string
  icon: string
  description: string
}

export const RELATIONSHIP_PRESETS: RelationshipPreset[] = [
  {
    type: 'alliance',
    label: 'Mutual Defense Alliance',
    icon: '🤝',
    description: 'Sworn military and civic allies who stand together in times of crisis.',
  },
  {
    type: 'royal_marriage',
    label: 'Dynastic Royal Marriage',
    icon: '💍',
    description: 'Two noble houses or realms united by bloodline and shared succession.',
  },
  {
    type: 'trade_pact',
    label: 'Chartered Trade League',
    icon: '⚖️',
    description: 'Open caravan roads, shared coinage, and flourishing merchant ports.',
  },
  {
    type: 'cultural_exchange',
    label: 'Scholarly & Cultural Concord',
    icon: '📜',
    description: 'Shared academies, festivals, and traveling artisans between peoples.',
  },
  {
    type: 'shared_faith',
    label: 'Sacred Covenant',
    icon: '🕯️',
    description: 'Bound by a common pantheon, pilgrimage route, or spiritual philosophy.',
  },
  {
    type: 'vassalage',
    label: 'Tributary & Protectorate',
    icon: '👑',
    description: 'One realm pays tribute in exchange for imperial protection and autonomy.',
  },
  {
    type: 'rivalry',
    label: 'Bitter Border Rivalry',
    icon: '⚡',
    description: 'Competing claims over resources, prestige, and frontier fortresses.',
  },
  {
    type: 'war',
    label: 'Open Conflict & Siege',
    icon: '⚔️',
    description: 'Active hostilities, contested territories, and marshaled armies.',
  },
]

export interface StageActionPreset {
  id: string
  stage: StageId
  suit: Suit
  isFantastical: boolean
  isDisaster: boolean
  name: string
  icon: string
  description: string
  slotCategory: TileSlotCategory
  slotPriority: number
  terrainChange?: TerrainType
  reliefChange?: ReliefType
  floraChange?: FloraType
  overlayChange?: TileOverlay
  hasRiver?: boolean
  hasRoad?: boolean
  primaryColor?: string
  secondaryColor?: string
  traitGranted?: string
  abilityGranted?: string
  relationshipType?: RelationshipType
}

export const STAGE_ACTION_PRESETS: StageActionPreset[] = [
  // ========================
  // 1. GENESIS — SPADES (EARTH)
  // ========================
  {
    id: 'gen_earth_peaks',
    stage: 'genesis',
    suit: '♠',
    isFantastical: false,
    isDisaster: false,
    name: 'Granite Mountain Range',
    icon: '🏔️',
    description: 'Raise towering snow-capped peaks that divide climates and shelter valleys.',
    slotCategory: 'elevation',
    slotPriority: 75,
    terrainChange: 'mountain',
    reliefChange: 'mountain',
    primaryColor: '#78716c',
    secondaryColor: '#e7e5e4',
  },
  {
    id: 'gen_earth_canyon',
    stage: 'genesis',
    suit: '♠',
    isFantastical: false,
    isDisaster: false,
    name: 'Redstone Rift Canyon',
    icon: '🏜️',
    description: 'Carve a deep, stratified gorge with towering cliffs and echoed mesas.',
    slotCategory: 'elevation',
    slotPriority: 72,
    terrainChange: 'canyon',
    reliefChange: 'canyon',
    primaryColor: '#b45309',
    secondaryColor: '#fde68a',
  },
  {
    id: 'gen_earth_hills',
    stage: 'genesis',
    suit: '♠',
    isFantastical: false,
    isDisaster: false,
    name: 'Rolling Highlands & Downs',
    icon: '⛰️',
    description: 'Sculpt windswept hills, chalk cliffs, and mineral-rich ridges.',
    slotCategory: 'elevation',
    slotPriority: 62,
    terrainChange: 'earth',
    reliefChange: 'hills',
    primaryColor: '#a16207',
    secondaryColor: '#fef08a',
  },
  {
    id: 'gen_earth_fantastical',
    stage: 'genesis',
    suit: '♠',
    isFantastical: true,
    isDisaster: false,
    name: 'Floating Sky-Mesa & Lodestone Peaks',
    icon: '✨',
    description: 'Levitate magnetic spires and inverted sky-islands above the clouds.',
    slotCategory: 'myth',
    slotPriority: 88,
    terrainChange: 'mountain',
    reliefChange: 'mountain',
    overlayChange: 'monument',
    primaryColor: '#7c3aed',
    secondaryColor: '#ddd6fe',
  },

  // ========================
  // 1. GENESIS — HEARTS (WATER)
  // ========================
  {
    id: 'gen_water_river',
    stage: 'genesis',
    suit: '♥',
    isFantastical: false,
    isDisaster: false,
    name: 'Great Winding River Basin',
    icon: '🌊',
    description: 'Carve a life-giving river delta feeding fertile floodplains toward the sea.',
    slotCategory: 'hydrology',
    slotPriority: 65,
    hasRiver: true,
    primaryColor: '#0284c7',
    secondaryColor: '#bae6fd',
  },
  {
    id: 'gen_water_lake',
    stage: 'genesis',
    suit: '♥',
    isFantastical: false,
    isDisaster: false,
    name: 'Mirror-Crater Inland Lake',
    icon: '💧',
    description: 'Form a deep freshwater highland lake without turning the region into open sea.',
    slotCategory: 'hydrology',
    slotPriority: 68,
    hasRiver: true,
    primaryColor: '#0ea5e9',
    secondaryColor: '#e0f2fe',
  },
  {
    id: 'gen_water_wetlands',
    stage: 'genesis',
    suit: '♥',
    isFantastical: false,
    isDisaster: false,
    name: 'Misty Fenlands & Bayou',
    icon: '芦',
    description: 'Flood low-lying basins with reed marshes, tidal pools, and willow bogs.',
    slotCategory: 'hydrology',
    slotPriority: 60,
    terrainChange: 'swamp',
    floraChange: 'marsh',
    primaryColor: '#0f766e',
    secondaryColor: '#99f6e4',
  },
  {
    id: 'gen_water_fantastical',
    stage: 'genesis',
    suit: '♥',
    isFantastical: true,
    isDisaster: false,
    name: 'Eternal Maelstrom & Sky-Falls',
    icon: '🌀',
    description: 'Unleash a glowing abyssal whirlpool or cascading waterfalls that fall from the clouds.',
    slotCategory: 'myth',
    slotPriority: 86,
    hasRiver: true,
    overlayChange: 'myth',
    primaryColor: '#06b6d4',
    secondaryColor: '#a5f3fc',
  },

  // ========================
  // 1. GENESIS — CLUBS (PLANT)
  // ========================
  {
    id: 'gen_plant_forest',
    stage: 'genesis',
    suit: '♣',
    isFantastical: false,
    isDisaster: false,
    name: 'Primeval Old-Growth Timberland',
    icon: '🌲',
    description: 'Blanket the land in towering pines, oaks, and moss-draped woodland.',
    slotCategory: 'vegetation',
    slotPriority: 64,
    terrainChange: 'forest',
    floraChange: 'forest',
    primaryColor: '#15803d',
    secondaryColor: '#bbf7d0',
  },
  {
    id: 'gen_plant_jungle',
    stage: 'genesis',
    suit: '♣',
    isFantastical: false,
    isDisaster: false,
    name: 'Emerald Canopy Rainforest',
    icon: '🌴',
    description: 'Grow a dense tropical jungle teeming with vibrant orchids and tangled vines.',
    slotCategory: 'vegetation',
    slotPriority: 66,
    terrainChange: 'jungle',
    floraChange: 'jungle',
    primaryColor: '#047857',
    secondaryColor: '#6ee7b7',
  },
  {
    id: 'gen_plant_oasis',
    stage: 'genesis',
    suit: '♣',
    isFantastical: false,
    isDisaster: false,
    name: 'Golden Steppe & Palm Oasis',
    icon: '🌾',
    description: 'Spread waving amber grasslands and sheltered desert palm oases.',
    slotCategory: 'vegetation',
    slotPriority: 55,
    terrainChange: 'plains',
    floraChange: 'oasis',
    primaryColor: '#65a30d',
    secondaryColor: '#ecfccb',
  },
  {
    id: 'gen_plant_fantastical',
    stage: 'genesis',
    suit: '♣',
    isFantastical: true,
    isDisaster: false,
    name: 'Colossal World-Tree & Starlight Grove',
    icon: '🌳',
    description: 'Sprout a luminous cosmic canopy whose roots bridge the entire continent.',
    slotCategory: 'myth',
    slotPriority: 90,
    terrainChange: 'forest',
    floraChange: 'forest',
    overlayChange: 'monument',
    primaryColor: '#10b981',
    secondaryColor: '#fef08a',
  },

  // ========================
  // 1. GENESIS — DIAMONDS (FEATURE)
  // ========================
  {
    id: 'gen_feature_geysers',
    stage: 'genesis',
    suit: '♦',
    isFantastical: false,
    isDisaster: false,
    name: 'Geothermal Geysers & Hot Springs',
    icon: '♨️',
    description: 'Dot the region with steaming mineral terraces, salt flats, and crystal caverns.',
    slotCategory: 'resource',
    slotPriority: 68,
    overlayChange: 'cave',
    primaryColor: '#0d9488',
    secondaryColor: '#ccfbf1',
  },
  {
    id: 'gen_feature_monolith',
    stage: 'genesis',
    suit: '♦',
    isFantastical: false,
    isDisaster: false,
    name: 'Basalt Pillars & Natural Arch',
    icon: '🗿',
    description: 'Weather-sculpted stone arches, meteor craters, and hexagonal basalt columns.',
    slotCategory: 'structure',
    slotPriority: 70,
    overlayChange: 'monument',
    primaryColor: '#57534e',
    secondaryColor: '#d6d3d1',
  },
  {
    id: 'gen_feature_fantastical',
    stage: 'genesis',
    suit: '♦',
    isFantastical: true,
    isDisaster: false,
    name: 'Ley-Line Nexus & Singing Crystal Caverns',
    icon: '💎',
    description: 'Create an arcane convergence where aurora-light pulses from living quartz.',
    slotCategory: 'myth',
    slotPriority: 88,
    overlayChange: 'myth',
    primaryColor: '#8b5cf6',
    secondaryColor: '#ede9fe',
  },

  // ========================
  // 2. PRIMAL — SPADES (SETTLEMENT)
  // ========================
  {
    id: 'pri_settle_village',
    stage: 'primal',
    suit: '♠',
    isFantastical: false,
    isDisaster: false,
    name: 'Found Hearth-Village',
    icon: '🏡',
    description: 'Establish a permanent ancestral village with palisades and communal hearths.',
    slotCategory: 'settlement',
    slotPriority: 92,
    overlayChange: 'settlement',
    traitGranted: 'Ancestral Hearth-Hold',
  },
  {
    id: 'pri_settle_town',
    stage: 'primal',
    suit: '♠',
    isFantastical: false,
    isDisaster: false,
    name: 'Crossroads Market Town',
    icon: '🏘️',
    description: 'Grow a bustling river or coastal town where neighboring clans gather to barter.',
    slotCategory: 'settlement',
    slotPriority: 94,
    overlayChange: 'town',
    hasRoad: true,
    traitGranted: 'Barter & River-Trade',
  },
  {
    id: 'pri_settle_fantastical',
    stage: 'primal',
    suit: '♠',
    isFantastical: true,
    isDisaster: false,
    name: 'Sanctuary of the First Dawn',
    icon: '🏯',
    description: 'Build a wondrous hidden sanctuary carved into giant trees, cliffs, or coral reefs.',
    slotCategory: 'settlement',
    slotPriority: 96,
    overlayChange: 'town',
    traitGranted: 'Hidden Mythic Sanctuary',
  },

  // ========================
  // 2. PRIMAL — HEARTS (TRADITION)
  // ========================
  {
    id: 'pri_trad_festival',
    stage: 'primal',
    suit: '♥',
    isFantastical: false,
    isDisaster: false,
    name: 'Solstice & Harvest Rites',
    icon: '🕯️',
    description: 'Institute sacred seasonal festivals, ancestor veneration, and oral storytelling.',
    slotCategory: 'structure',
    slotPriority: 72,
    overlayChange: 'monument',
    traitGranted: 'Sacred Solstice Rites',
  },
  {
    id: 'pri_trad_code',
    stage: 'primal',
    suit: '♥',
    isFantastical: false,
    isDisaster: false,
    name: 'Code of Hospitality & Honor',
    icon: '🛡️',
    description: 'Bind the species with a cultural taboo against breaking guest-right or clan oaths.',
    slotCategory: 'structure',
    slotPriority: 65,
    traitGranted: 'Sacred Guest-Right',
  },
  {
    id: 'pri_trad_fantastical',
    stage: 'primal',
    suit: '♥',
    isFantastical: true,
    isDisaster: false,
    name: 'Communion of the Star-Spirits',
    icon: '🌟',
    description: 'Rites allowing elders to speak directly with ancestral constellations and nature spirits.',
    slotCategory: 'myth',
    slotPriority: 85,
    overlayChange: 'monument',
    traitGranted: 'Star-Spirit Communion',
  },

  // ========================
  // 2. PRIMAL — CLUBS (RESOURCE)
  // ========================
  {
    id: 'pri_res_ore',
    stage: 'primal',
    suit: '♣',
    isFantastical: false,
    isDisaster: false,
    name: 'Rich Iron & Copper Veins',
    icon: '⛏️',
    description: 'Discover surface metal lodes and quarry stone for durable tools and weapons.',
    slotCategory: 'resource',
    slotPriority: 65,
    overlayChange: 'resource',
    traitGranted: 'Master Quarry & Ore Lodes',
  },
  {
    id: 'pri_res_beasts',
    stage: 'primal',
    suit: '♣',
    isFantastical: false,
    isDisaster: false,
    name: 'Domesticated Mounts & Flocks',
    icon: '🐎',
    description: 'Tame swift steeds, hardy oxen, or giant pack-beasts to carry goods across the land.',
    slotCategory: 'resource',
    slotPriority: 64,
    overlayChange: 'resource',
    traitGranted: 'Domesticated Herd-Beasts',
  },
  {
    id: 'pri_res_fantastical',
    stage: 'primal',
    suit: '♣',
    isFantastical: true,
    isDisaster: false,
    name: 'Sun-Mithril & Sky-Beasts',
    icon: '💎',
    description: 'Harvest weightless star-metal or tame winged griffons and leviathans.',
    slotCategory: 'resource',
    slotPriority: 84,
    overlayChange: 'resource',
    traitGranted: 'Star-Metal & Mythic Mounts',
  },

  // ========================
  // 2. PRIMAL — DIAMONDS (SKILL)
  // ========================
  {
    id: 'pri_skill_seafaring',
    stage: 'primal',
    suit: '♦',
    isFantastical: false,
    isDisaster: false,
    name: 'Wayfinder Navigation & Shipbuilding',
    icon: '⛵',
    description: 'Master outrigger canoes, celestial navigation, and deep-sea fishing.',
    slotCategory: 'structure',
    slotPriority: 66,
    abilityGranted: 'Celestial Wayfinding',
  },
  {
    id: 'pri_skill_smithing',
    stage: 'primal',
    suit: '♦',
    isFantastical: false,
    isDisaster: false,
    name: 'Bronze & Crucible Steelcraft',
    icon: '⚒️',
    description: 'Develop high-heat bloomeries, stone masonry, and composite bowyers.',
    slotCategory: 'structure',
    slotPriority: 66,
    abilityGranted: 'Crucible Metallurgy',
  },
  {
    id: 'pri_skill_fantastical',
    stage: 'primal',
    suit: '♦',
    isFantastical: true,
    isDisaster: false,
    name: 'Runic Shaping & Elemental Singing',
    icon: '🔮',
    description: 'Awaken the power to weave protective runes and shape wind, flame, or stone.',
    slotCategory: 'myth',
    slotPriority: 85,
    abilityGranted: 'Runic Elemental Lore',
  },

  // ========================
  // 3. CIVILIZATION — SPADES (CONSTRUCTION)
  // ========================
  {
    id: 'civ_const_city',
    stage: 'civilization',
    suit: '♠',
    isFantastical: false,
    isDisaster: false,
    name: 'Raise Walled Capital & Highways',
    icon: '🏰',
    description: 'Build a fortified stone metropolis connected by paved imperial roads and aqueducts.',
    slotCategory: 'settlement',
    slotPriority: 98,
    overlayChange: 'capital',
    hasRoad: true,
    traitGranted: 'Walled Capital & Paved Roads',
  },
  {
    id: 'civ_const_fortress',
    stage: 'civilization',
    suit: '♠',
    isFantastical: false,
    isDisaster: false,
    name: 'Border Citadel & Watchtowers',
    icon: '🛡️',
    description: 'Erect a strategic mountain pass fortress or harbor sea-wall.',
    slotCategory: 'structure',
    slotPriority: 88,
    overlayChange: 'castle',
    hasRoad: true,
    traitGranted: 'Border Bastions',
  },
  {
    id: 'civ_const_fantastical',
    stage: 'civilization',
    suit: '♠',
    isFantastical: true,
    isDisaster: false,
    name: 'Sky-Citadel & Grand Colossus',
    icon: '🏛️',
    description: 'Construct an architectural wonder of the world that defies gravity and time.',
    slotCategory: 'settlement',
    slotPriority: 99,
    overlayChange: 'capital',
    hasRoad: true,
    traitGranted: 'World-Wonder Architecture',
  },

  // ========================
  // 3. CIVILIZATION — HEARTS (ENLIGHTENMENT)
  // ========================
  {
    id: 'civ_enl_academy',
    stage: 'civilization',
    suit: '♥',
    isFantastical: false,
    isDisaster: false,
    name: 'Grand University & Great Library',
    icon: '📜',
    description: 'Found a center of astronomy, medicine, codified law, and natural philosophy.',
    slotCategory: 'structure',
    slotPriority: 82,
    overlayChange: 'monument',
    abilityGranted: 'Great Library & Codified Law',
  },
  {
    id: 'civ_enl_renaissance',
    stage: 'civilization',
    suit: '♥',
    isFantastical: false,
    isDisaster: false,
    name: 'Golden Age of Arts & Republic',
    icon: '🎭',
    description: 'Reform governance into a senate or council and patronize monumental arts.',
    slotCategory: 'structure',
    slotPriority: 80,
    overlayChange: 'historic_site',
    traitGranted: 'Civic Senate & Golden Arts',
  },
  {
    id: 'civ_enl_fantastical',
    stage: 'civilization',
    suit: '♥',
    isFantastical: true,
    isDisaster: false,
    name: 'Astral Observatory & Arcane Synthesis',
    icon: '🔮',
    description: 'Unite science and high magic to chart the cosmos and heal blighted lands.',
    slotCategory: 'myth',
    slotPriority: 89,
    overlayChange: 'monument',
    abilityGranted: 'Arcane-Scientific Enlightenment',
  },

  // ========================
  // 3. CIVILIZATION — CLUBS (EXPANSION)
  // ========================
  {
    id: 'civ_exp_colony',
    stage: 'civilization',
    suit: '♣',
    isFantastical: false,
    isDisaster: false,
    name: 'Charter Frontier City & Borders',
    icon: '🚩',
    description: 'Extend territorial borders into neighboring regions and found a thriving port or colony.',
    slotCategory: 'settlement',
    slotPriority: 95,
    overlayChange: 'city',
    hasRoad: true,
    traitGranted: 'Chartered Frontier Colonies',
  },
  {
    id: 'civ_exp_fantastical',
    stage: 'civilization',
    suit: '♣',
    isFantastical: true,
    isDisaster: false,
    name: 'Planar Gateways & Sky-Armada',
    icon: '⛵',
    description: 'Connect distant territories instantaneously via teleportation circles or airships.',
    slotCategory: 'settlement',
    slotPriority: 96,
    overlayChange: 'city',
    hasRoad: true,
    abilityGranted: 'Sky-Armada & Portal Network',
  },

  // ========================
  // 3. CIVILIZATION — DIAMONDS (DIPLOMACY)
  // ========================
  {
    id: 'civ_dip_treaty',
    stage: 'civilization',
    suit: '♦',
    isFantastical: false,
    isDisaster: false,
    name: 'Grand Trade Concord & Embassy',
    icon: '🤝',
    description: 'Forge a permanent merchant league and diplomatic embassy between two societies.',
    slotCategory: 'structure',
    slotPriority: 78,
    hasRoad: true,
    relationshipType: 'trade_pact',
  },
  {
    id: 'civ_dip_marriage',
    stage: 'civilization',
    suit: '♦',
    isFantastical: false,
    isDisaster: false,
    name: 'Dynastic Royal Marriage',
    icon: '💍',
    description: 'Unite two royal houses in marriage, securing peace and shared heritage.',
    slotCategory: 'structure',
    slotPriority: 80,
    relationshipType: 'royal_marriage',
  },
  {
    id: 'civ_dip_fantastical',
    stage: 'civilization',
    suit: '♦',
    isFantastical: true,
    isDisaster: false,
    name: 'Oath of the Eternal Concord',
    icon: '🌟',
    description: 'Swear an unbreakable magical covenant uniting multiple species and kingdoms.',
    slotCategory: 'myth',
    slotPriority: 88,
    overlayChange: 'monument',
    relationshipType: 'alliance',
  },

  // ========================
  // 4. INTRIGUE — SPADES (CONFLICT)
  // ========================
  {
    id: 'int_conf_war',
    stage: 'intrigue',
    suit: '♠',
    isFantastical: false,
    isDisaster: false,
    name: 'Siege & Historic Battleground',
    icon: '⚔️',
    description: 'Rival armies clash over a strategic border city or mountain pass.',
    slotCategory: 'structure',
    slotPriority: 87,
    overlayChange: 'battle',
    relationshipType: 'war',
  },
  {
    id: 'int_conf_rebellion',
    stage: 'intrigue',
    suit: '♠',
    isFantastical: false,
    isDisaster: false,
    name: 'Civil Uprising & Shattered Keep',
    icon: '🔥',
    description: 'A province rebels against its rulers, leaving a scarred fortress and new faction.',
    slotCategory: 'structure',
    slotPriority: 86,
    overlayChange: 'ruins',
    relationshipType: 'rivalry',
  },
  {
    id: 'int_conf_fantastical',
    stage: 'intrigue',
    suit: '♠',
    isFantastical: true,
    isDisaster: false,
    name: 'War of the Awakening Titans',
    icon: '⚡',
    description: 'Arcane superweapons or summoned colossi clash, reshaping the battlefield forever.',
    slotCategory: 'myth',
    slotPriority: 92,
    overlayChange: 'battle',
    relationshipType: 'war',
  },

  // ========================
  // 4. INTRIGUE — HEARTS (COOPERATION)
  // ========================
  {
    id: 'int_coop_coalition',
    stage: 'intrigue',
    suit: '♥',
    isFantastical: false,
    isDisaster: false,
    name: 'Grand Coalition & Peace Summit',
    icon: '🕊️',
    description: 'Former rivals sign a historic accord to defend the realm and rebuild trade.',
    slotCategory: 'structure',
    slotPriority: 82,
    overlayChange: 'historic_site',
    relationshipType: 'alliance',
  },
  {
    id: 'int_coop_fantastical',
    stage: 'intrigue',
    suit: '♥',
    isFantastical: true,
    isDisaster: false,
    name: 'Fellowship of the World-Beacon',
    icon: '🌟',
    description: 'Champions from every species unite to relight an ancient ward against the darkness.',
    slotCategory: 'myth',
    slotPriority: 90,
    overlayChange: 'monument',
    relationshipType: 'alliance',
  },

  // ========================
  // 4. INTRIGUE — CLUBS (SCHEME)
  // ========================
  {
    id: 'int_sch_cabal',
    stage: 'intrigue',
    suit: '♣',
    isFantastical: false,
    isDisaster: false,
    name: 'Shadow Syndicate & Royal Coup',
    icon: '🎭',
    description: 'Whispers in the throne room topple a regent and install a secretive cabal.',
    slotCategory: 'myth',
    slotPriority: 84,
    overlayChange: 'historic_site',
    relationshipType: 'rivalry',
  },
  {
    id: 'int_sch_fantastical',
    stage: 'intrigue',
    suit: '♣',
    isFantastical: true,
    isDisaster: false,
    name: 'Ritual of the Veiled Eclipse',
    icon: '🌑',
    description: 'A clandestine order sets a century-old prophecy in motion beneath the capital.',
    slotCategory: 'myth',
    slotPriority: 89,
    overlayChange: 'myth',
    relationshipType: 'rivalry',
  },

  // ========================
  // 4. INTRIGUE — DIAMONDS (MYTH)
  // ========================
  {
    id: 'int_myth_dragon',
    stage: 'intrigue',
    suit: '♦',
    isFantastical: false,
    isDisaster: false,
    name: 'Awakening of the Elder Wyrm',
    icon: '🐉',
    description: 'A legendary dragon or leviathan claims a mountain peak or sunken ruin as its lair.',
    slotCategory: 'myth',
    slotPriority: 93,
    overlayChange: 'myth',
  },
  {
    id: 'int_myth_relic',
    stage: 'intrigue',
    suit: '♦',
    isFantastical: true,
    isDisaster: false,
    name: 'Vault of the Crown of Stars',
    icon: '👑',
    description: 'An ancient precursor artifact is unearthed, drawing seekers and armies from afar.',
    slotCategory: 'myth',
    slotPriority: 91,
    overlayChange: 'myth',
  },

  // ========================
  // ACES — NATURAL DISASTERS (ALL STAGES)
  // ========================
  {
    id: 'dis_genesis_volcano',
    stage: 'genesis',
    suit: '',
    isFantastical: false,
    isDisaster: true,
    name: 'Cataclysmic Volcanic Eruption',
    icon: '🌋',
    description: 'Tectonic fury raises a smoking caldera and blankets surrounding valleys in ash.',
    slotCategory: 'elevation',
    slotPriority: 90,
    terrainChange: 'volcano',
    reliefChange: 'volcano',
    primaryColor: '#b91c1c',
    secondaryColor: '#fca5a5',
  },
  {
    id: 'dis_primal_deluge',
    stage: 'primal',
    suit: '',
    isFantastical: false,
    isDisaster: true,
    name: 'The Great Deluge & Sundering',
    icon: '🌊',
    description: 'A generational flood or meteor strike forces early species to migrate and adapt.',
    slotCategory: 'hydrology',
    slotPriority: 88,
    terrainChange: 'swamp',
    floraChange: 'marsh',
    overlayChange: 'ruins',
  },
  {
    id: 'dis_civ_fall',
    stage: 'civilization',
    suit: '',
    isFantastical: false,
    isDisaster: true,
    name: 'Earthquake & Doom of the Old Capital',
    icon: '☄️',
    description: 'A great tremor or plague shatters a proud city, leaving storied ruins in its wake.',
    slotCategory: 'structure',
    slotPriority: 90,
    overlayChange: 'ruins',
  },
  {
    id: 'dis_int_cataclysm',
    stage: 'intrigue',
    suit: '',
    isFantastical: false,
    isDisaster: true,
    name: 'The Red Comet & Arcane Reckoning',
    icon: '☄️',
    description: 'A prophetic omen splits the sky, triggering upheaval across every kingdom.',
    slotCategory: 'myth',
    slotPriority: 94,
    overlayChange: 'ruins',
  },
]

export function getActionPresetsForDraw(
  stage: StageId,
  suit: Suit,
  isFantastical: boolean,
  isDisaster: boolean
): StageActionPreset[] {
  if (isDisaster) {
    const stageDisasters = STAGE_ACTION_PRESETS.filter(
      (p) => p.isDisaster && p.stage === stage
    )
    return stageDisasters.length > 0
      ? stageDisasters
      : STAGE_ACTION_PRESETS.filter((p) => p.isDisaster)
  }

  const effectiveSuit: Suit = suit || '♠'
  const exact = STAGE_ACTION_PRESETS.filter(
    (p) =>
      p.stage === stage &&
      p.suit === effectiveSuit &&
      !p.isDisaster &&
      (isFantastical ? true : !p.isFantastical)
  )

  if (exact.length > 0) {
    // Put fantastical presets first when drawing J/Q/K/Joker
    return isFantastical
      ? [...exact].sort((a, b) => Number(b.isFantastical) - Number(a.isFantastical))
      : exact
  }

  return STAGE_ACTION_PRESETS.filter(
    (p) => p.stage === stage && p.suit === effectiveSuit && !p.isDisaster
  )
}

export const SLOT_ICON_PALETTE: {
  category: TileSlotCategory
  label: string
  defaultPriority: number
  icons: { icon: string; name: string }[]
}[] = [
  {
    category: 'settlement',
    label: 'Settlements & Habitations',
    defaultPriority: 95,
    icons: [
      { icon: '⛺', name: 'Nomad Camp' },
      { icon: '🏡', name: 'Hearth Village' },
      { icon: '🏘️', name: 'Market Town' },
      { icon: '🏰', name: 'Walled City' },
      { icon: '👑', name: 'Royal Metropolis' },
      { icon: '🏯', name: 'Citadel Hold' },
    ],
  },
  {
    category: 'structure',
    label: 'Landmarks & Fortifications',
    defaultPriority: 82,
    icons: [
      { icon: '🛡️', name: 'Border Keep' },
      { icon: '🏛️', name: 'Grand Monument' },
      { icon: '🗼', name: 'Watchtower / Spire' },
      { icon: '⚓', name: 'Sea Harbor' },
      { icon: '⚔️', name: 'Battleground' },
      { icon: '🏚️', name: 'Ancient Ruins' },
    ],
  },
  {
    category: 'myth',
    label: 'Myths, Relics & Anomalies',
    defaultPriority: 90,
    icons: [
      { icon: '🐉', name: 'Dragon Lair' },
      { icon: '✨', name: 'Ley-Line Nexus' },
      { icon: '🔮', name: 'Arcane Sanctum' },
      { icon: '💀', name: 'Necropolis' },
      { icon: '🌀', name: 'Maelstrom / Portal' },
    ],
  },
  {
    category: 'elevation',
    label: 'Elevation & Landforms',
    defaultPriority: 74,
    icons: [
      { icon: '🏔️', name: 'High Peaks' },
      { icon: '🌋', name: 'Active Volcano' },
      { icon: '⛰️', name: 'Highland Hills' },
      { icon: '🏜️', name: 'Deep Canyon' },
      { icon: '🗿', name: 'Monolith Cliffs' },
    ],
  },
  {
    category: 'vegetation',
    label: 'Flora & Groves',
    defaultPriority: 64,
    icons: [
      { icon: '🌲', name: 'Pine Timberland' },
      { icon: '🌳', name: 'Ancient Woods' },
      { icon: '🌴', name: 'Tropical Jungle' },
      { icon: '🍄', name: 'Bioluminescent Grove' },
      { icon: '🌾', name: 'Golden Fields' },
    ],
  },
  {
    category: 'hydrology',
    label: 'Lakes, Islands & Springs',
    defaultPriority: 66,
    icons: [
      { icon: '💧', name: 'Inland Lake' },
      { icon: '🏝️', name: 'Sea Island / Atoll' },
      { icon: '🌊', name: 'Great Cataract' },
      { icon: '♨️', name: 'Thermal Springs' },
    ],
  },
  {
    category: 'resource',
    label: 'Natural Resources',
    defaultPriority: 58,
    icons: [
      { icon: '⛏️', name: 'Iron & Silver Mine' },
      { icon: '💎', name: 'Gemstone Cavern' },
      { icon: '🐎', name: 'Steppe Pastures' },
      { icon: '🌿', name: 'Rare Herb Grotto' },
    ],
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

export function getEffectiveBotWeights(seat?: PlayerSeat): BotPersonalityWeights {
  if (!seat) return { ...BOT_PERSONALITIES.shaper.defaultWeights }
  if (seat.customWeights) return { ...seat.customWeights }
  return {
    ...(BOT_PERSONALITIES[seat.personality]?.defaultWeights ||
      BOT_PERSONALITIES.shaper.defaultWeights),
  }
}

export interface ColorSwatchPalette {
  id: string
  name: string
  primary: string
  secondary: string
}

export const COLOR_SWATCH_PALETTES: ColorSwatchPalette[] = [
  { id: 'emerald-star', name: 'Emerald & Starlight', primary: '#10b981', secondary: '#fef3c7' },
  { id: 'amber-iron', name: 'Amber & Deep Bronze', primary: '#f59e0b', secondary: '#78350f' },
  { id: 'azure-dawn', name: 'Royal Azure & Sky', primary: '#2563eb', secondary: '#dbeafe' },
  { id: 'crimson-gold', name: 'Crimson & Imperial Gold', primary: '#dc2626', secondary: '#fde047' },
  { id: 'meadow-sun', name: 'Meadow & Harvest', primary: '#84cc16', secondary: '#fef9c3' },
  { id: 'solar-terracotta', name: 'Solar Gold & Terracotta', primary: '#eab308', secondary: '#991b1b' },
  { id: 'tidal-pearl', name: 'Tidal Cyan & Pearl', primary: '#06b6d4', secondary: '#cffafe' },
  { id: 'aether-brass', name: 'Aether Indigo & Brass', primary: '#6366f1', secondary: '#fcd34d' },
  { id: 'frost-aurora', name: 'Glacial Frost & Ice', primary: '#38bdf8', secondary: '#e0f2fe' },
  { id: 'spore-jade', name: 'Amethyst & Biolume Jade', primary: '#a855f7', secondary: '#86efac' },
  { id: 'twilight-rose', name: 'Twilight Rose & Moon', primary: '#ec4899', secondary: '#f3e8ff' },
  { id: 'prism-teal', name: 'Prism Teal & Quartz', primary: '#14b8a6', secondary: '#f0fdfa' },
]

export interface IconGalleryGroup {
  category: string
  icons: { icon: string; label: string }[]
}

export const ENTITY_ICON_GALLERY: IconGalleryGroup[] = [
  {
    category: 'Ancestries & Folk',
    icons: [
      { icon: '🧝', label: 'Elven / Sylvan' },
      { icon: '⛏️', label: 'Delver / Dwarf' },
      { icon: '🛡️', label: 'Warden / Human' },
      { icon: '🐺', label: 'Wolf-Clan / Steppe' },
      { icon: '🌾', label: 'Halfling / Agrarian' },
      { icon: '🦎', label: 'Saurian / Scaled' },
      { icon: '🔱', label: 'Tideborn / Aquatic' },
      { icon: '⚙️', label: 'Automata / Clockwork' },
      { icon: '❄️', label: 'Frost-Kin / Giant' },
      { icon: '🍄', label: 'Myconid / Spore' },
      { icon: '🦋', label: 'Fae / Sidhe' },
      { icon: '💎', label: 'Lithid / Crystal' },
      { icon: '🦅', label: 'Avian / Sky-Folk' },
      { icon: '🦊', label: 'Kitsune / Fox-Folk' },
      { icon: '🦁', label: 'Leonin / Pride' },
      { icon: '🐢', label: 'Tortle / Shell-Kin' },
    ],
  },
  {
    category: 'Kingdoms & Banners',
    icons: [
      { icon: '👑', label: 'Royal Crown' },
      { icon: '🏰', label: 'Grand Citadel' },
      { icon: '🏛️', label: 'Senate / Republic' },
      { icon: '⛵', label: 'Maritime League' },
      { icon: '⚔️', label: 'Martial Order' },
      { icon: '⚖️', label: 'Merchant Syndicate' },
      { icon: '📜', label: 'Scholar Conclave' },
      { icon: '🚩', label: 'Khaganate Banner' },
      { icon: '🗼', label: 'High Spire' },
      { icon: '⚒️', label: 'Forge Guild' },
      { icon: '🕯️', label: 'Sacred Covenant' },
      { icon: '🎭', label: 'Shadow Court' },
    ],
  },
  {
    category: 'Myths, Beasts & Relics',
    icons: [
      { icon: '🐉', label: 'Elder Dragon' },
      { icon: '💀', label: 'Necropolis / Lich' },
      { icon: '🔮', label: 'Arcane Orb' },
      { icon: '✨', label: 'Astral Wonder' },
      { icon: '🌋', label: 'Primordial Titan' },
      { icon: '🌊', label: 'Abyssal Leviathan' },
      { icon: '🌳', label: 'World-Tree' },
      { icon: '☄️', label: 'Fallen Star' },
      { icon: '👁️', label: 'All-Seeing Cabal' },
      { icon: '🗡️', label: 'Cursed Blade' },
      { icon: '🏺', label: 'First-Age Relic' },
      { icon: '🌀', label: 'Planar Rift' },
    ],
  },
]

export interface SettlementIconSetPreset {
  id: string
  name: string
  icons: CompanionSettlementIcons
}

export const SETTLEMENT_ICON_SETS: SettlementIconSetPreset[] = [
  {
    id: 'set_canopy',
    name: 'Canopy Spires',
    icons: {
      camp: '🍃',
      village: '🌳',
      town: '🎋',
      city: '🗼',
      metropolis: '🌟',
      architectureStyle: 'Living Canopy Spires',
    },
  },
  {
    id: 'set_granite',
    name: 'Mountain Holds',
    icons: {
      camp: '⛺',
      village: '🪨',
      town: '⚒️',
      city: '🏰',
      metropolis: '🏔️',
      architectureStyle: 'Carved Granite Holds',
    },
  },
  {
    id: 'set_feudal',
    name: 'Walled Keeps',
    icons: {
      camp: '⛺',
      village: '🏡',
      town: '🏘️',
      city: '🏰',
      metropolis: '👑',
      architectureStyle: 'Timber & Stone Walled Keeps',
    },
  },
  {
    id: 'set_steppe',
    name: 'Steppe War-Camps',
    icons: {
      camp: '⛺',
      village: '🔥',
      town: '🛡️',
      city: '⚔️',
      metropolis: '🚩',
      architectureStyle: 'Great Horned War-Camps',
    },
  },
  {
    id: 'set_ziggurat',
    name: 'Sun Ziggurats',
    icons: {
      camp: '☀️',
      village: '🏜️',
      town: '🛕',
      city: '🏛️',
      metropolis: '🌞',
      architectureStyle: 'Golden Stepped Ziggurats',
    },
  },
  {
    id: 'set_atoll',
    name: 'Coral Atolls',
    icons: {
      camp: '🐚',
      village: '⚓',
      town: '⛵',
      city: '🔱',
      metropolis: '🌊',
      architectureStyle: 'Coral Spires & Floating Atolls',
    },
  },
  {
    id: 'set_clockwork',
    name: 'Clockwork Towers',
    icons: {
      camp: '🔩',
      village: '⚙️',
      town: '🏭',
      city: '⚡',
      metropolis: '🔮',
      architectureStyle: 'Clockwork Foundry-Towers',
    },
  },
  {
    id: 'set_biolume',
    name: 'Fungal & Fey Domes',
    icons: {
      camp: '🍄',
      village: '🌿',
      town: '🌙',
      city: '🌺',
      metropolis: '✨',
      architectureStyle: 'Bioluminescent Domes & Glades',
    },
  },
]

export interface ModularBlockGroup {
  category: string
  suitHint: Suit
  items: { label: string; icon: string }[]
}

export const MODULAR_TRAIT_BLOCKS: ModularBlockGroup[] = [
  {
    category: 'Traditions & Culture',
    suitHint: '♦',
    items: [
      { label: 'Oral Song-Lore', icon: '🎵' },
      { label: 'Ancestor Veneration', icon: '🕯️' },
      { label: 'Starlight Navigation', icon: '✨' },
      { label: 'Harvest Festivals', icon: '🌾' },
      { label: 'Solar Calendar', icon: '☀️' },
      { label: 'Unbreakable Oaths', icon: '🤝' },
    ],
  },
  {
    category: 'Ecology & Habitat',
    suitHint: '♣',
    items: [
      { label: 'Canopy Dwellers', icon: '🌳' },
      { label: 'Subterranean Delvers', icon: '⛏️' },
      { label: 'Nomadic Herders', icon: '🐎' },
      { label: 'Reef & Atoll Mariners', icon: '🐚' },
      { label: 'Glacial Wayfarers', icon: '❄️' },
      { label: 'Symbiotic Grove-Kin', icon: '🍄' },
    ],
  },
  {
    category: 'Craft & Governance',
    suitHint: '♥',
    items: [
      { label: 'Runic Metallurgy', icon: '⚒️' },
      { label: 'Chartered Guilds', icon: '⚖️' },
      { label: 'Ziggurat Masonry', icon: '🛕' },
      { label: 'Clockwork Artifice', icon: '⚙️' },
      { label: 'Council of Elders', icon: '🏛️' },
      { label: 'Caravan Safe-Conduct', icon: '🐪' },
    ],
  },
]

export const MODULAR_ABILITY_BLOCKS: ModularBlockGroup[] = [
  {
    category: 'Adaptations & Physiology',
    suitHint: '♥',
    items: [
      { label: 'Deep-Stone Sense', icon: '🪨' },
      { label: 'Amphibious Respiration', icon: '🌊' },
      { label: 'Thermal & Fire Resilience', icon: '🔥' },
      { label: 'Frost Endurance', icon: '❄️' },
      { label: 'Night-Sight & Camouflage', icon: '🌙' },
      { label: 'Crystalline Carapace', icon: '💎' },
    ],
  },
  {
    category: 'Skills & Mastery',
    suitHint: '♠',
    items: [
      { label: 'Master Archery', icon: '🏹' },
      { label: 'Unbreakable Phalanx', icon: '🛡️' },
      { label: 'Thunder Cavalry', icon: '🐎' },
      { label: 'Grand Armada Navigation', icon: '⛵' },
      { label: 'Siege Engineering', icon: '🏰' },
      { label: 'Beast Taming', icon: '🐺' },
    ],
  },
  {
    category: 'Arcane & Wonder',
    suitHint: '♦',
    items: [
      { label: 'Astral Weaving', icon: '✨' },
      { label: 'Storm-Calling', icon: '⚡' },
      { label: 'Mycelial Telepathy', icon: '🍄' },
      { label: 'Glamour & Illusion', icon: '🦋' },
      { label: 'Harmonic Resonance', icon: '🔮' },
      { label: 'Geomantic Shaping', icon: '🏔️' },
    ],
  },
]

