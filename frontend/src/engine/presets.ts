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
  cartographicSymbol?: string
  hasRiver?: boolean
  hasRoad?: boolean
  primaryColor?: string
  secondaryColor?: string
  traitGranted?: string
  abilityGranted?: string
  relationshipType?: RelationshipType
  creativePrompt?: string
  exampleNarrative?: string
}

export const STAGE_ACTION_PRESETS: StageActionPreset[] = [
  // ==========================================
  // 1. GENESIS PRESETS (Expanded Whiteboard Tropes & Multiple Variants)
  // ==========================================
  {
    id: "gen_earth_mountain_peak",
    stage: 'genesis',
    suit: "♠",
    isFantastical: false,
    isDisaster: false,
    name: "Mountain Peak (Single Peak)",
    icon: "⛰️",
    description: "Classic solitary triangular peak with center ridge and shaded slope.",
    slotCategory: "elevation",
    slotPriority: 70,
    terrainChange: "mountain",
    reliefChange: "mountain",
    
    
    cartographicSymbol: "mountain-peak",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this mountain peak shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The mountain peak was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_earth_mountain_twin",
    stage: 'genesis',
    suit: "♠",
    isFantastical: false,
    isDisaster: false,
    name: "Twin Horn Peaks (Twin Horns)",
    icon: "🏔️",
    description: "Dual companion summits rising side-by-side with central col pass.",
    slotCategory: "elevation",
    slotPriority: 70,
    terrainChange: "mountain",
    reliefChange: "mountain",
    
    
    cartographicSymbol: "mountain-twin",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this twin horn peaks shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The twin horn peaks was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_earth_mountain_spire",
    stage: 'genesis',
    suit: "♠",
    isFantastical: false,
    isDisaster: false,
    name: "Jagged Needle Spires (Needle Spires)",
    icon: "🗡️",
    description: "Sharp, sheer karst pinnacles and needle-like rocky crags.",
    slotCategory: "elevation",
    slotPriority: 70,
    terrainChange: "mountain",
    reliefChange: "crag",
    
    
    cartographicSymbol: "mountain-spire",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this jagged needle spires shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The jagged needle spires was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_earth_mountain_snow",
    stage: 'genesis',
    suit: "♠",
    isFantastical: false,
    isDisaster: false,
    name: "Snow-Capped Massif (Snow Massif)",
    icon: "❄️",
    description: "Glaciated alpine summit with perpetual snowfields.",
    slotCategory: "elevation",
    slotPriority: 70,
    terrainChange: "mountain",
    reliefChange: "mountain-snow",
    
    
    cartographicSymbol: "mountain-snow",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this snow-capped massif shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The snow-capped massif was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_earth_mountain_range",
    stage: 'genesis',
    suit: "♠",
    isFantastical: false,
    isDisaster: false,
    name: "Mountain Range Spine (Continuous Spine)",
    icon: "⛰️⛰️",
    description: "Continuous three-peak ridge forming a continental divide.",
    slotCategory: "elevation",
    slotPriority: 70,
    terrainChange: "mountain",
    reliefChange: "mountain-range",
    
    
    cartographicSymbol: "mountain-range",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this mountain range spine shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The mountain range spine was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_earth_hill_rolling",
    stage: 'genesis',
    suit: "♠",
    isFantastical: false,
    isDisaster: false,
    name: "Rolling Low Hills (Rolling Low Hills)",
    icon: "🌱",
    description: "Gentle, rounded low grassy mounds and undulating rises.",
    slotCategory: "elevation",
    slotPriority: 70,
    terrainChange: "plains",
    reliefChange: "hills",
    
    
    cartographicSymbol: "hill-rolling",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this rolling low hills shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The rolling low hills was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_earth_hill_knolls",
    stage: 'genesis',
    suit: "♠",
    isFantastical: false,
    isDisaster: false,
    name: "Triple Rounded Knolls (Triple Knolls)",
    icon: "🟢",
    description: "Cluster of three distinct rounded hillocks and knolls.",
    slotCategory: "elevation",
    slotPriority: 70,
    terrainChange: "plains",
    reliefChange: "hills",
    
    
    cartographicSymbol: "hill-knolls",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this triple rounded knolls shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The triple rounded knolls was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_earth_hill_rocky",
    stage: 'genesis',
    suit: "♠",
    isFantastical: false,
    isDisaster: false,
    name: "Rocky Scree Hills (Rocky Scree)",
    icon: "🪨",
    description: "Rugged hillocks with exposed boulder outcrops and scree slopes.",
    slotCategory: "elevation",
    slotPriority: 70,
    terrainChange: "plains",
    reliefChange: "hills",
    
    
    cartographicSymbol: "hill-rocky",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this rocky scree hills shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The rocky scree hills was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_earth_hill_low",
    stage: 'genesis',
    suit: "♠",
    isFantastical: false,
    isDisaster: false,
    name: "Low Undulating Mounds (Low Mounds)",
    icon: "〰️",
    description: "Subtle wave-like grassy crests rising above the plains.",
    slotCategory: "elevation",
    slotPriority: 70,
    terrainChange: "plains",
    reliefChange: "hills",
    
    
    cartographicSymbol: "hill-low",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this low undulating mounds shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The low undulating mounds was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_earth_canyon_gorge",
    stage: 'genesis',
    suit: "♠",
    isFantastical: false,
    isDisaster: false,
    name: "Deep Canyon Gorge (Canyon Gorge)",
    icon: "🏜️",
    description: "Sheer vertical rock rift sliced deep through the plateau.",
    slotCategory: "elevation",
    slotPriority: 70,
    terrainChange: "plains",
    reliefChange: "canyon",
    
    
    cartographicSymbol: "canyon-gorge",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this deep canyon gorge shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The deep canyon gorge was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_earth_cliff_sheer",
    stage: 'genesis',
    suit: "♠",
    isFantastical: false,
    isDisaster: false,
    name: "Sheer Escarpment Wall (Sheer Escarpment)",
    icon: "🧗",
    description: "Imposing vertical cliff wall dropping off from high tableland.",
    slotCategory: "elevation",
    slotPriority: 70,
    terrainChange: "plains",
    reliefChange: "canyon",
    
    
    cartographicSymbol: "cliff-sheer",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this sheer escarpment wall shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The sheer escarpment wall was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_earth_cliff_coastal",
    stage: 'genesis',
    suit: "♠",
    isFantastical: false,
    isDisaster: false,
    name: "Coastal Sea Cliffs (Coastal Cliffs)",
    icon: "🌊🧗",
    description: "Craggy sea cliff bluff meeting coastal breaker waves below.",
    slotCategory: "elevation",
    slotPriority: 70,
    terrainChange: "plains",
    reliefChange: "canyon",
    
    
    cartographicSymbol: "cliff-coastal",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this coastal sea cliffs shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The coastal sea cliffs was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_earth_mesa_plateau",
    stage: 'genesis',
    suit: "♠",
    isFantastical: false,
    isDisaster: false,
    name: "Flat-Topped Mesa Bluff (Flat Mesa Bluff)",
    icon: "🟫",
    description: "Elevated flat tableland flanked by steep, stepped rock slopes.",
    slotCategory: "elevation",
    slotPriority: 70,
    terrainChange: "plains",
    reliefChange: "mesa",
    
    
    cartographicSymbol: "mesa-plateau",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this flat-topped mesa bluff shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The flat-topped mesa bluff was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_earth_badland_buttes",
    stage: 'genesis',
    suit: "♠",
    isFantastical: false,
    isDisaster: false,
    name: "Stepped Badland Buttes (Badland Buttes)",
    icon: "🏜️",
    description: "Arid, wind-carved sedimentary towers, chimneys, and coulees.",
    slotCategory: "elevation",
    slotPriority: 70,
    terrainChange: "plains",
    reliefChange: "canyon",
    
    
    cartographicSymbol: "badland-buttes",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this stepped badland buttes shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The stepped badland buttes was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_earth_desert_dunes",
    stage: 'genesis',
    suit: "♠",
    isFantastical: false,
    isDisaster: false,
    name: "Crescent Sand Dunes (Crescent Dunes)",
    icon: "🐪",
    description: "Sweeping barchan crescent dunes sculpted by desert trade winds.",
    slotCategory: "elevation",
    slotPriority: 70,
    terrainChange: "desert",
    reliefChange: "none",
    
    
    cartographicSymbol: "desert-dunes",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this crescent sand dunes shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The crescent sand dunes was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_earth_desert_erg",
    stage: 'genesis',
    suit: "♠",
    isFantastical: false,
    isDisaster: false,
    name: "Rippling Sand Sea Erg (Sand Sea Erg)",
    icon: "⏳",
    description: "Endless horizon of overlapping wave-like sand ripple crests.",
    slotCategory: "elevation",
    slotPriority: 70,
    terrainChange: "desert",
    reliefChange: "none",
    
    
    cartographicSymbol: "desert-erg",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this rippling sand sea erg shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The rippling sand sea erg was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_earth_desert_rocky",
    stage: 'genesis',
    suit: "♠",
    isFantastical: false,
    isDisaster: false,
    name: "Rocky Reg Pavement (Rocky Reg Pavement)",
    icon: "🪨🏜️",
    description: "Stoney desert pavement studded with wind-polished ventifacts.",
    slotCategory: "elevation",
    slotPriority: 70,
    terrainChange: "desert",
    reliefChange: "none",
    
    
    cartographicSymbol: "desert-rocky",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this rocky reg pavement shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The rocky reg pavement was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_earth_desert_cracked",
    stage: 'genesis',
    suit: "♠",
    isFantastical: false,
    isDisaster: false,
    name: "Sun-Cracked Arid Flats (Sun-Cracked Flats)",
    icon: "☀️",
    description: "Parched, desiccated clay pan etched with polygonal fissure fractures.",
    slotCategory: "elevation",
    slotPriority: 70,
    terrainChange: "desert",
    reliefChange: "none",
    
    
    cartographicSymbol: "desert-cracked",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this sun-cracked arid flats shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The sun-cracked arid flats was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_earth_cave_maw",
    stage: 'genesis',
    suit: "♠",
    isFantastical: false,
    isDisaster: false,
    name: "Subterranean Cave Maw (Cavern Maw)",
    icon: "🕳️",
    description: "Dark, yawning entrance leading into subterranean depths.",
    slotCategory: "elevation",
    slotPriority: 70,
    terrainChange: "mountain",
    reliefChange: "mountain",
    
    
    cartographicSymbol: "cave-maw",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this subterranean cave maw shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The subterranean cave maw was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_earth_cave_cliff",
    stage: 'genesis',
    suit: "♠",
    isFantastical: false,
    isDisaster: false,
    name: "Cliffside Grotto Mouth (Cliff Grotto)",
    icon: "🧗🕳️",
    description: "Hidden cavern opening embedded into an impassable rock escarpment.",
    slotCategory: "elevation",
    slotPriority: 70,
    terrainChange: "mountain",
    reliefChange: "mountain",
    
    
    cartographicSymbol: "cave-cliff",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this cliffside grotto mouth shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The cliffside grotto mouth was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_earth_cave_sinkhole",
    stage: 'genesis',
    suit: "♠",
    isFantastical: false,
    isDisaster: false,
    name: "Collapsed Pit Cenote (Pit Cenote)",
    icon: "⭕",
    description: "Sudden vertical collapse opening downward into a subterranean chasm.",
    slotCategory: "elevation",
    slotPriority: 70,
    terrainChange: "mountain",
    reliefChange: "mountain",
    
    
    cartographicSymbol: "cave-sinkhole",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this collapsed pit cenote shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The collapsed pit cenote was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_earth_volcano_active",
    stage: 'genesis',
    suit: "♠",
    isFantastical: false,
    isDisaster: false,
    name: "Active Erupting Volcano (Active Erupting)",
    icon: "🌋",
    description: "Steep volcanic cone venting ash plumes and molten lava bombs.",
    slotCategory: "elevation",
    slotPriority: 70,
    terrainChange: "mountain",
    reliefChange: "volcano",
    
    
    cartographicSymbol: "volcano-active",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this active erupting volcano shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The active erupting volcano was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_earth_volcano_caldera",
    stage: 'genesis',
    suit: "♠",
    isFantastical: false,
    isDisaster: false,
    name: "Collapsed Volcanic Caldera (Collapsed Caldera)",
    icon: "🌋⭕",
    description: "Ancient mega-caldera crater rim cradling a sunken steaming caldera floor.",
    slotCategory: "elevation",
    slotPriority: 70,
    terrainChange: "mountain",
    reliefChange: "volcano",
    
    
    cartographicSymbol: "volcano-caldera",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this collapsed volcanic caldera shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The collapsed volcanic caldera was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_water_river_meander",
    stage: 'genesis',
    suit: "♥",
    isFantastical: false,
    isDisaster: false,
    name: "Meandering River Channel (Meandering River)",
    icon: "🌊",
    description: "Winding, natural S-curve river channel traversing lowlands.",
    slotCategory: "hydrology",
    slotPriority: 70,
    terrainChange: "ocean",
    reliefChange: "none",
    
    
    cartographicSymbol: "river-meander",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this meandering river channel shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The meandering river channel was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_water_river_braided",
    stage: 'genesis',
    suit: "♥",
    isFantastical: false,
    isDisaster: false,
    name: "Braided Gravel River (Braided River)",
    icon: "🔀",
    description: "Network of interweaving alluvial river channels weaving between gravel bars.",
    slotCategory: "hydrology",
    slotPriority: 70,
    terrainChange: "ocean",
    reliefChange: "none",
    
    
    cartographicSymbol: "river-braided",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this braided gravel river shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The braided gravel river was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_water_river_delta",
    stage: 'genesis',
    suit: "♥",
    isFantastical: false,
    isDisaster: false,
    name: "Braided River Delta (River Delta)",
    icon: "🔱",
    description: "Branching distributary fan depositing silt into the sea.",
    slotCategory: "hydrology",
    slotPriority: 70,
    terrainChange: "ocean",
    reliefChange: "none",
    
    
    cartographicSymbol: "river-delta",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this braided river delta shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The braided river delta was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_water_river_rapids",
    stage: 'genesis',
    suit: "♥",
    isFantastical: false,
    isDisaster: false,
    name: "Whitewater River Rapids (River Rapids)",
    icon: "⚡🌊",
    description: "Turbulent mountain torrent churning through boulder chutes.",
    slotCategory: "hydrology",
    slotPriority: 70,
    terrainChange: "ocean",
    reliefChange: "none",
    
    
    cartographicSymbol: "river-rapids",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this whitewater river rapids shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The whitewater river rapids was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_water_waterfall_cataract",
    stage: 'genesis',
    suit: "♥",
    isFantastical: false,
    isDisaster: false,
    name: "Roaring Cataract Waterfall (High Cataract)",
    icon: "💧",
    description: "Sheer cliff plunge where river cascades into a mist-shrouded gorge.",
    slotCategory: "hydrology",
    slotPriority: 70,
    terrainChange: "ocean",
    reliefChange: "none",
    
    
    cartographicSymbol: "waterfall-cataract",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this roaring cataract waterfall shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The roaring cataract waterfall was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_water_waterfall_cascades",
    stage: 'genesis',
    suit: "♥",
    isFantastical: false,
    isDisaster: false,
    name: "Stepped Tiered Cascades (Tiered Cascades)",
    icon: "🪜💧",
    description: "Series of descending rock steps and natural stone shelves.",
    slotCategory: "hydrology",
    slotPriority: 70,
    terrainChange: "ocean",
    reliefChange: "none",
    
    
    cartographicSymbol: "waterfall-cascades",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this stepped tiered cascades shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The stepped tiered cascades was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_water_waterfall_gorge",
    stage: 'genesis',
    suit: "♥",
    isFantastical: false,
    isDisaster: false,
    name: "Canyon Plunge Waterfall (Canyon Plunge)",
    icon: "🏞️💧",
    description: "Massive plume of water trapped between high rock canyon cliffs.",
    slotCategory: "hydrology",
    slotPriority: 70,
    terrainChange: "ocean",
    reliefChange: "none",
    
    
    cartographicSymbol: "waterfall-gorge",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this canyon plunge waterfall shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The canyon plunge waterfall was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_water_lake_basin",
    stage: 'genesis',
    suit: "♥",
    isFantastical: false,
    isDisaster: false,
    name: "Freshwater Lake Basin (Lake Basin)",
    icon: "🏞️",
    description: "Broad inland freshwater body cradled by surrounding shores.",
    slotCategory: "hydrology",
    slotPriority: 70,
    terrainChange: "ocean",
    reliefChange: "none",
    
    
    cartographicSymbol: "lake-basin",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this freshwater lake basin shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The freshwater lake basin was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_water_lake_tarn",
    stage: 'genesis',
    suit: "♥",
    isFantastical: false,
    isDisaster: false,
    name: "Alpine Mountain Tarn (Alpine Tarn)",
    icon: "🏔️💧",
    description: "High-altitude crystalline glacial tarn nested below mountain peaks.",
    slotCategory: "hydrology",
    slotPriority: 70,
    terrainChange: "ocean",
    reliefChange: "none",
    
    
    cartographicSymbol: "lake-tarn",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this alpine mountain tarn shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The alpine mountain tarn was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_water_lake_oxbow",
    stage: 'genesis',
    suit: "♥",
    isFantastical: false,
    isDisaster: false,
    name: "Crescent Oxbow Lake (Oxbow Lake)",
    icon: "🌙",
    description: "Curving u-shaped lake formed when a river meander loop is cut off.",
    slotCategory: "hydrology",
    slotPriority: 70,
    terrainChange: "ocean",
    reliefChange: "none",
    
    
    cartographicSymbol: "lake-oxbow",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this crescent oxbow lake shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The crescent oxbow lake was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_water_lake_crater",
    stage: 'genesis',
    suit: "♥",
    isFantastical: false,
    isDisaster: false,
    name: "Volcanic Crater Lake (Crater Lake)",
    icon: "🌋💧",
    description: "Round, fathomless deep sapphire lake resting inside an extinct caldera.",
    slotCategory: "hydrology",
    slotPriority: 70,
    terrainChange: "ocean",
    reliefChange: "none",
    
    
    cartographicSymbol: "lake-crater",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this volcanic crater lake shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The volcanic crater lake was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_water_swamp_mangrove",
    stage: 'genesis',
    suit: "♥",
    isFantastical: false,
    isDisaster: false,
    name: "Mangrove Stilt Swamp (Mangrove Swamp)",
    icon: "🌿",
    description: "Tangled network of aerial stilt roots rising from brackish coastal waters.",
    slotCategory: "hydrology",
    slotPriority: 70,
    terrainChange: "swamp",
    reliefChange: "none",
    
    
    cartographicSymbol: "swamp-mangrove",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this mangrove stilt swamp shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The mangrove stilt swamp was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_water_swamp_peat",
    stage: 'genesis',
    suit: "♥",
    isFantastical: false,
    isDisaster: false,
    name: "Peat Moss Bog (Peat Bog)",
    icon: "🪵",
    description: "Waterlogged, acidic wetland formed of decaying moss hummocks.",
    slotCategory: "hydrology",
    slotPriority: 70,
    terrainChange: "swamp",
    reliefChange: "none",
    
    
    cartographicSymbol: "swamp-peat",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this peat moss bog shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The peat moss bog was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_water_marsh_reeds",
    stage: 'genesis',
    suit: "♥",
    isFantastical: false,
    isDisaster: false,
    name: "Reed & Cattail Marsh (Reed Marsh)",
    icon: "🌾",
    description: "Flooded riparian marshland bristling with tall reed stalks and cattails.",
    slotCategory: "hydrology",
    slotPriority: 70,
    terrainChange: "swamp",
    reliefChange: "none",
    
    
    cartographicSymbol: "marsh-reeds",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this reed & cattail marsh shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The reed & cattail marsh was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_water_marsh_fen",
    stage: 'genesis',
    suit: "♥",
    isFantastical: false,
    isDisaster: false,
    name: "Flooded Grassy Fen (Grassy Fen)",
    icon: "🌱💧",
    description: "Alkaline mineral-rich wetland covered in sedges, rushes, and slow streams.",
    slotCategory: "hydrology",
    slotPriority: 70,
    terrainChange: "swamp",
    reliefChange: "none",
    
    
    cartographicSymbol: "marsh-fen",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this flooded grassy fen shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The flooded grassy fen was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_water_tidal_pools",
    stage: 'genesis',
    suit: "♥",
    isFantastical: false,
    isDisaster: false,
    name: "Rocky Shore Tidal Pools (Tidal Pools)",
    icon: "🦀",
    description: "Intertidal marine basins carved into coastal granite rock ledges.",
    slotCategory: "hydrology",
    slotPriority: 70,
    terrainChange: "ocean",
    reliefChange: "none",
    
    
    cartographicSymbol: "tidal-pools",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this rocky shore tidal pools shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The rocky shore tidal pools was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_water_estuary_bay",
    stage: 'genesis',
    suit: "♥",
    isFantastical: false,
    isDisaster: false,
    name: "Coastal Estuary Bay (Estuary Bay)",
    icon: "⚓",
    description: "Sheltered coastal bay where ocean tides merge with river outflows.",
    slotCategory: "hydrology",
    slotPriority: 70,
    terrainChange: "ocean",
    reliefChange: "none",
    
    
    cartographicSymbol: "estuary-bay",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this coastal estuary bay shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The coastal estuary bay was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_water_atoll_reef",
    stage: 'genesis',
    suit: "♥",
    isFantastical: false,
    isDisaster: false,
    name: "Coral Reef Atoll (Coral Atoll)",
    icon: "🪸",
    description: "Circular ring of living coral surrounding a central turquoise lagoon.",
    slotCategory: "hydrology",
    slotPriority: 70,
    terrainChange: "ocean",
    reliefChange: "none",
    
    
    cartographicSymbol: "atoll-reef",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this coral reef atoll shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The coral reef atoll was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_water_fjord_sheer",
    stage: 'genesis',
    suit: "♥",
    isFantastical: false,
    isDisaster: false,
    name: "Glacial Sheer Fjord (Glacial Fjord)",
    icon: "🛶",
    description: "Narrow, fathomless sea inlet framed by immense vertical mountain cliffs.",
    slotCategory: "hydrology",
    slotPriority: 70,
    terrainChange: "ocean",
    reliefChange: "none",
    
    
    cartographicSymbol: "fjord-sheer",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this glacial sheer fjord shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The glacial sheer fjord was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_water_glacier_valley",
    stage: 'genesis',
    suit: "♥",
    isFantastical: false,
    isDisaster: false,
    name: "Alpine Valley Glacier (Valley Glacier)",
    icon: "🧊🏔️",
    description: "Massive frozen river of ice grinding downward through an alpine cirque.",
    slotCategory: "hydrology",
    slotPriority: 70,
    terrainChange: "ocean",
    reliefChange: "none",
    
    
    cartographicSymbol: "glacier-valley",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this alpine valley glacier shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The alpine valley glacier was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_water_glacier_crevasse",
    stage: 'genesis',
    suit: "♥",
    isFantastical: false,
    isDisaster: false,
    name: "Crevassed Icefield (Crevassed Icefield)",
    icon: "🧊",
    description: "Vast polar ice sheet split by treacherous deep crevasses.",
    slotCategory: "hydrology",
    slotPriority: 70,
    terrainChange: "ocean",
    reliefChange: "none",
    
    
    cartographicSymbol: "glacier-crevasse",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this crevassed icefield shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The crevassed icefield was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_water_glacier_shelf",
    stage: 'genesis',
    suit: "♥",
    isFantastical: false,
    isDisaster: false,
    name: "Coastal Ice Shelf (Ice Shelf)",
    icon: "🧊🌊",
    description: "Floating permanent ice barrier calving icebergs into the sea.",
    slotCategory: "hydrology",
    slotPriority: 70,
    terrainChange: "ocean",
    reliefChange: "none",
    
    
    cartographicSymbol: "glacier-shelf",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this coastal ice shelf shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The coastal ice shelf was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_water_maelstrom_whirlpool",
    stage: 'genesis',
    suit: "♥",
    isFantastical: false,
    isDisaster: false,
    name: "Oceanic Maelstrom Vortex (Oceanic Maelstrom)",
    icon: "🌀",
    description: "Terrifying oceanic whirlpool swallowing currents into the sea.",
    slotCategory: "hydrology",
    slotPriority: 70,
    terrainChange: "ocean",
    reliefChange: "none",
    
    
    cartographicSymbol: "maelstrom-whirlpool",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this oceanic maelstrom vortex shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The oceanic maelstrom vortex was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_water_tidal_rip",
    stage: 'genesis',
    suit: "♥",
    isFantastical: false,
    isDisaster: false,
    name: "Coastal Rip Tide & Breakers (Rip Tide & Breakers)",
    icon: "🌊🌀",
    description: "Treacherous offshore surge currents dragging waters outward.",
    slotCategory: "hydrology",
    slotPriority: 70,
    terrainChange: "ocean",
    reliefChange: "none",
    
    
    cartographicSymbol: "tidal-rip",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this coastal rip tide & breakers shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The coastal rip tide & breakers was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_water_spring_headwater",
    stage: 'genesis',
    suit: "♥",
    isFantastical: false,
    isDisaster: false,
    name: "Natural Spring Headwaters (Headwater Spring)",
    icon: "⛲",
    description: "Pure subterranean aquifer bubbling to the surface at the foot of mountain slopes.",
    slotCategory: "hydrology",
    slotPriority: 70,
    terrainChange: "ocean",
    reliefChange: "none",
    
    
    cartographicSymbol: "spring-headwater",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this natural spring headwaters shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The natural spring headwaters was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_water_hotspring_geothermal",
    stage: 'genesis',
    suit: "♥",
    isFantastical: false,
    isDisaster: false,
    name: "Geothermal Mineral Hot Spring (Mineral Hot Spring)",
    icon: "♨️",
    description: "Steaming mineral-rich volcanic pool heated by subterranean magma chambers.",
    slotCategory: "hydrology",
    slotPriority: 70,
    terrainChange: "ocean",
    reliefChange: "none",
    
    
    cartographicSymbol: "hotspring-geothermal",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this geothermal mineral hot spring shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The geothermal mineral hot spring was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_water_trench_abyssal",
    stage: 'genesis',
    suit: "♥",
    isFantastical: false,
    isDisaster: false,
    name: "Abyssal Sunken Trench (Abyssal Trench)",
    icon: "🕳️🌊",
    description: "Dark, fathomless underwater canyon plunging miles below the ocean floor.",
    slotCategory: "hydrology",
    slotPriority: 70,
    terrainChange: "ocean",
    reliefChange: "none",
    
    
    cartographicSymbol: "trench-abyssal",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this abyssal sunken trench shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The abyssal sunken trench was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_plant_forest_deciduous",
    stage: 'genesis',
    suit: "♣",
    isFantastical: false,
    isDisaster: false,
    name: "Broadleaf Deciduous Forest (Broadleaf Deciduous)",
    icon: "🌳",
    description: "Lush woodland of ancient oak, beech, and maple canopies.",
    slotCategory: "vegetation",
    slotPriority: 70,
    terrainChange: "forest",
    reliefChange: "none",
    floraChange: "forest",
    
    cartographicSymbol: "forest-deciduous",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this broadleaf deciduous forest shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The broadleaf deciduous forest was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_plant_forest_taiga",
    stage: 'genesis',
    suit: "♣",
    isFantastical: false,
    isDisaster: false,
    name: "Pine & Fir Taiga (Pine & Fir Taiga)",
    icon: "🌲",
    description: "Dense evergreen needle forest with conical spruce and fir trees.",
    slotCategory: "vegetation",
    slotPriority: 70,
    terrainChange: "forest",
    reliefChange: "none",
    floraChange: "forest",
    
    cartographicSymbol: "forest-taiga",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this pine & fir taiga shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The pine & fir taiga was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_plant_forest_redwood",
    stage: 'genesis',
    suit: "♣",
    isFantastical: false,
    isDisaster: false,
    name: "Colossal Redwood Grove (Colossal Redwoods)",
    icon: "🌲🌲",
    description: "Cathedral-like grove of ancient, sky-piercing colossal sequoias.",
    slotCategory: "vegetation",
    slotPriority: 70,
    terrainChange: "forest",
    reliefChange: "none",
    floraChange: "forest",
    
    cartographicSymbol: "forest-redwood",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this colossal redwood grove shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The colossal redwood grove was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_plant_forest_sparse",
    stage: 'genesis',
    suit: "♣",
    isFantastical: false,
    isDisaster: false,
    name: "Open Scattered Woodland (Scattered Woodland)",
    icon: "🌳🌾",
    description: "Sun-dappled open woodland with widely spaced mature trees.",
    slotCategory: "vegetation",
    slotPriority: 70,
    terrainChange: "forest",
    reliefChange: "none",
    floraChange: "forest",
    
    cartographicSymbol: "forest-sparse",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this open scattered woodland shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The open scattered woodland was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_plant_forest_dead",
    stage: 'genesis',
    suit: "♣",
    isFantastical: false,
    isDisaster: false,
    name: "Gnarled Dead Wood (Gnarled Dead Wood)",
    icon: "🪵💀",
    description: "Bleached, leafless ghost forest of skeletal dead tree snags.",
    slotCategory: "vegetation",
    slotPriority: 70,
    terrainChange: "forest",
    reliefChange: "none",
    floraChange: "forest",
    
    cartographicSymbol: "forest-dead",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this gnarled dead wood shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The gnarled dead wood was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_plant_jungle_dense",
    stage: 'genesis',
    suit: "♣",
    isFantastical: false,
    isDisaster: false,
    name: "Dense Tropical Jungle Canopy (Dense Jungle Canopy)",
    icon: "🌴",
    description: "Impenetrable tropical jungle thicket swollen with humidity and beasts.",
    slotCategory: "vegetation",
    slotPriority: 70,
    terrainChange: "jungle",
    reliefChange: "none",
    floraChange: "jungle",
    
    cartographicSymbol: "jungle-dense",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this dense tropical jungle canopy shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The dense tropical jungle canopy was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_plant_rainforest_canopy",
    stage: 'genesis',
    suit: "♣",
    isFantastical: false,
    isDisaster: false,
    name: "Emergent Rainforest Canopy (Emergent Rainforest)",
    icon: "🌧️🌳",
    description: "Giant umbrella-like emergent tree rising high above the rain clouds.",
    slotCategory: "vegetation",
    slotPriority: 70,
    terrainChange: "jungle",
    reliefChange: "none",
    floraChange: "jungle",
    
    cartographicSymbol: "rainforest-canopy",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this emergent rainforest canopy shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The emergent rainforest canopy was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_plant_jungle_palms",
    stage: 'genesis',
    suit: "♣",
    isFantastical: false,
    isDisaster: false,
    name: "Tropical Palm Cluster (Palm Cluster)",
    icon: "🏝️",
    description: "Slender curving palm trunks capped with radiant frond crowns.",
    slotCategory: "vegetation",
    slotPriority: 70,
    terrainChange: "jungle",
    reliefChange: "none",
    floraChange: "jungle",
    
    cartographicSymbol: "jungle-palms",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this tropical palm cluster shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The tropical palm cluster was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_plant_jungle_cloud",
    stage: 'genesis',
    suit: "♣",
    isFantastical: false,
    isDisaster: false,
    name: "Misty Cloud Forest (Cloud Forest)",
    icon: "☁️🌴",
    description: "High-elevation mountain forest drenched in perpetual mist and moss.",
    slotCategory: "vegetation",
    slotPriority: 70,
    terrainChange: "jungle",
    reliefChange: "none",
    floraChange: "jungle",
    
    cartographicSymbol: "jungle-cloud",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this misty cloud forest shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The misty cloud forest was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_plant_rainforest_vines",
    stage: 'genesis',
    suit: "♣",
    isFantastical: false,
    isDisaster: false,
    name: "Tangled Lianas & Vines (Tangled Lianas)",
    icon: "🌿🧗",
    description: "Curtain of hanging woody liana vines looping through the understory.",
    slotCategory: "vegetation",
    slotPriority: 70,
    terrainChange: "jungle",
    reliefChange: "none",
    floraChange: "jungle",
    
    cartographicSymbol: "rainforest-vines",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this tangled lianas & vines shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The tangled lianas & vines was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_plant_grass_steppe",
    stage: 'genesis',
    suit: "♣",
    isFantastical: false,
    isDisaster: false,
    name: "Open Steppe Grassland (Open Steppe)",
    icon: "🌾",
    description: "Vast, windswept temperate prairie of hardy perennial grasses.",
    slotCategory: "vegetation",
    slotPriority: 70,
    terrainChange: "plains",
    reliefChange: "none",
    
    
    cartographicSymbol: "grass-steppe",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this open steppe grassland shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The open steppe grassland was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_plant_grass_tall",
    stage: 'genesis',
    suit: "♣",
    isFantastical: false,
    isDisaster: false,
    name: "Tall Wild Grass Tufts (Tall Grass Tufts)",
    icon: "🌾🌾",
    description: "Chest-high wild grasses waving rhythmically in the breeze.",
    slotCategory: "vegetation",
    slotPriority: 70,
    terrainChange: "plains",
    reliefChange: "none",
    
    
    cartographicSymbol: "grass-tall",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this tall wild grass tufts shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The tall wild grass tufts was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_plant_savanna_acacia",
    stage: 'genesis',
    suit: "♣",
    isFantastical: false,
    isDisaster: false,
    name: "Acacia Thorn Savanna (Acacia Savanna)",
    icon: "🦒",
    description: "Expansive tropical grassland dotted with flat-topped acacia umbrellas.",
    slotCategory: "vegetation",
    slotPriority: 70,
    terrainChange: "plains",
    reliefChange: "none",
    
    
    cartographicSymbol: "savanna-acacia",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this acacia thorn savanna shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The acacia thorn savanna was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_plant_meadow_wildflower",
    stage: 'genesis',
    suit: "♣",
    isFantastical: false,
    isDisaster: false,
    name: "Wildflower Bloom Meadow (Wildflower Meadow)",
    icon: "🌸",
    description: "Vibrant carpet of flowering meadows humming with pollinators.",
    slotCategory: "vegetation",
    slotPriority: 70,
    terrainChange: "plains",
    reliefChange: "none",
    
    
    cartographicSymbol: "meadow-wildflower",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this wildflower bloom meadow shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The wildflower bloom meadow was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_plant_flora_wetland",
    stage: 'genesis',
    suit: "♣",
    isFantastical: false,
    isDisaster: false,
    name: "Wetland Water Lily Marsh (Lily Pad Wetland)",
    icon: "🪷",
    description: "Shallow aquatic wetland blanketed in floating lily pads and lotus blooms.",
    slotCategory: "vegetation",
    slotPriority: 70,
    terrainChange: "forest",
    reliefChange: "none",
    floraChange: "forest",
    
    cartographicSymbol: "flora-wetland",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this wetland water lily marsh shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The wetland water lily marsh was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_plant_thicket_ironwood",
    stage: 'genesis',
    suit: "♣",
    isFantastical: false,
    isDisaster: false,
    name: "Ironwood Briar Thicket (Ironwood Briar Thicket)",
    icon: "🦔",
    description: "Barbed barrier of razor-sharp thorns and petrified ironwood brambles.",
    slotCategory: "vegetation",
    slotPriority: 70,
    terrainChange: "forest",
    reliefChange: "none",
    floraChange: "forest",
    
    cartographicSymbol: "thicket-ironwood",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this ironwood briar thicket shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The ironwood briar thicket was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_plant_bamboo_grove",
    stage: 'genesis',
    suit: "♣",
    isFantastical: false,
    isDisaster: false,
    name: "Whispering Bamboo Grove (Whispering Bamboo)",
    icon: "🎋",
    description: "Dense vertical forest of segmented bamboo culms clicking in the wind.",
    slotCategory: "vegetation",
    slotPriority: 70,
    terrainChange: "forest",
    reliefChange: "none",
    floraChange: "forest",
    
    cartographicSymbol: "bamboo-grove",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this whispering bamboo grove shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The whispering bamboo grove was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_plant_fungal_mycelium",
    stage: 'genesis',
    suit: "♣",
    isFantastical: false,
    isDisaster: false,
    name: "Giant Fungal Mycelium (Giant Fungal Forest)",
    icon: "🍄",
    description: "Luminescent spore-choked realm of tower-sized fungal caps and toadstools.",
    slotCategory: "vegetation",
    slotPriority: 70,
    terrainChange: "forest",
    reliefChange: "none",
    floraChange: "forest",
    
    cartographicSymbol: "fungal-mycelium",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this giant fungal mycelium shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The giant fungal mycelium was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_geyser_basin",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "Steaming Geyser Basin (Steaming Basin)",
    icon: "💨",
    description: "Pressurized hydrothermal vents releasing periodic superheated water plumes.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "myth",
    cartographicSymbol: "geyser-basin",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this steaming geyser basin shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The steaming geyser basin was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_geyser_eruption",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "Superheated Geyser Fountain (Geyser Fountain)",
    icon: "⛲💨",
    description: "High vertical steam and scalding water fountain blasting skyward.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "myth",
    cartographicSymbol: "geyser-eruption",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this superheated geyser fountain shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The superheated geyser fountain was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_thermal_mudpot",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "Boiling Mudpot Basin (Boiling Mudpot)",
    icon: "🫧🟤",
    description: "Viscous acidic mud bubbling and popping with sulfurous fumes.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "myth",
    cartographicSymbol: "thermal-mudpot",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this boiling mudpot basin shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The boiling mudpot basin was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_crater_impact",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "Meteor Impact Crater (Meteor Impact)",
    icon: "☄️",
    description: "Violent starfall depression surrounded by a raised shatter-rim.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "myth",
    cartographicSymbol: "crater-impact",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this meteor impact crater shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The meteor impact crater was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_crater_caldera",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "Sunken Caldera Crater (Sunken Caldera)",
    icon: "⭕🪨",
    description: "Steep amphitheater depression left by a collapsed primordial summit.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "myth",
    cartographicSymbol: "crater-caldera",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this sunken caldera crater shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The sunken caldera crater was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_crater_pit",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "Abyssal Chasm Pit (Abyssal Pit)",
    icon: "🕳️⭐",
    description: "Bottomless sheer circular pit plunging into the molten mantle.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "myth",
    cartographicSymbol: "crater-pit",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this abyssal chasm pit shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The abyssal chasm pit was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_lava_fissure",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "Molten Magma Fissure (Magma Fissure)",
    icon: "🌋🔥",
    description: "Tectonic fracture bleeding incandescent molten rock across the crust.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "myth",
    cartographicSymbol: "lava-fissure",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this molten magma fissure shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The molten magma fissure was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_lava_river",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "Winding Basalt Lava Stream (Basalt Lava Stream)",
    icon: "🔥🌊",
    description: "Sluggish river of glowing molten basalt cutting through volcanic ash.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "myth",
    cartographicSymbol: "lava-river",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this winding basalt lava stream shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The winding basalt lava stream was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_lava_field",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "Obsidian Crust Lava Field (Obsidian Lava Field)",
    icon: "🖤🪨",
    description: "Twisted field of ropy pahoehoe lava cooled into black volcanic glass.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "myth",
    cartographicSymbol: "lava-field",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this obsidian crust lava field shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The obsidian crust lava field was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_salt_hexagons",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "Hexagonal Salt Crust Lakebed (Hexagonal Crust)",
    icon: "🧂",
    description: "Desiccated endorheic lakebed crystallized into geometric salt polygon ridges.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "myth",
    cartographicSymbol: "salt-hexagons",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this hexagonal salt crust lakebed shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The hexagonal salt crust lakebed was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_salt_pan",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "Reflective White Alkali Pan (White Alkali Pan)",
    icon: "⬜",
    description: "Blinding white, glass-flat expanse of ancient evaporite mineral salts.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "myth",
    cartographicSymbol: "salt-pan",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this reflective white alkali pan shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The reflective white alkali pan was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_salt_pillars",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "Evaporite Salt Spires (Salt Spires)",
    icon: "🧂🗡️",
    description: "Ghostly towers and pinnacles of wind-sculpted rock salt.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "myth",
    cartographicSymbol: "salt-pillars",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this evaporite salt spires shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The evaporite salt spires was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_wind_gale",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "Prevailing Gale Wind Vectors (Gale Wind Vectors)",
    icon: "💨🌬️",
    description: "Fierce perpetual trade wind currents sweeping unimpeded across the realm.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "myth",
    cartographicSymbol: "wind-gale",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this prevailing gale wind vectors shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The prevailing gale wind vectors was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_wind_vortex",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "Cyclone / Dust Devil Vortex (Cyclone Vortex)",
    icon: "🌪️",
    description: "Violent rotating funnel of winds spiraling over land or sea.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "myth",
    cartographicSymbol: "wind-vortex",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this cyclone / dust devil vortex shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The cyclone / dust devil vortex was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_wind_storm",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "Thunderstorm Cloud Front (Thunderstorm Cloud)",
    icon: "⛈️",
    description: "Towering cumulonimbus anvil discharging sheets of rain and lightning.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "myth",
    cartographicSymbol: "wind-storm",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this thunderstorm cloud front shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The thunderstorm cloud front was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_water_currents",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "Ocean Surface Currents (Surface Currents)",
    icon: "🌊➡️",
    description: "Major warm and cold oceanic conveyor rivers steering naval transit.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "myth",
    cartographicSymbol: "water-currents",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this ocean surface currents shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The ocean surface currents was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_current_gyre",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "Oceanic Circulating Gyre (Oceanic Gyre)",
    icon: "🔄🌊",
    description: "Massive circular ocean current system rotating around a calm central sea.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "myth",
    cartographicSymbol: "current-gyre",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this oceanic circulating gyre shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The oceanic circulating gyre was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_resource_mineral",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "Rich Mineral & Ore Vein (Mineral Ore Vein)",
    icon: "⛏️",
    description: "Subterranean strike of precious iron, copper, or silver minerals.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "myth",
    cartographicSymbol: "resource-mineral",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this rich mineral & ore vein shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The rich mineral & ore vein was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_resource_gem",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "Crystalline Gem Geode (Gemstone Geode)",
    icon: "💎",
    description: "Cluster of prism gemstones and arcane crystal clusters embedded in stone.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "myth",
    cartographicSymbol: "resource-gem",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this crystalline gem geode shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The crystalline gem geode was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_crystal_cavern",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "Luminescent Crystal Cavern (Crystal Cavern)",
    icon: "🔮💎",
    description: "Subterranean geode chamber bristling with glowing resonance crystals.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "myth",
    cartographicSymbol: "crystal-cavern",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this luminescent crystal cavern shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The luminescent crystal cavern was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_resource_quarry",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "High-Grade Stone Quarry Strata (Stone Quarry Strata)",
    icon: "🧱",
    description: "Stepped layers of prime dimensional granite or marble building stone.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "myth",
    cartographicSymbol: "resource-quarry",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this high-grade stone quarry strata shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The high-grade stone quarry strata was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_titan_bones",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "Colossal Titan Bones (Titan Bone Bed)",
    icon: "🦴",
    description: "Towering ribcage bones of an ancient pre-primordial titan fossil.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "myth",
    cartographicSymbol: "titan-bones",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this colossal titan bones shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The colossal titan bones was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_megalith_ring",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "Megalith Stone Ring (Megalith Ring)",
    icon: "🗿",
    description: "Primordial stone trilithons aligned with solstices and celestial spheres.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "ruins",
    cartographicSymbol: "megalith-ring",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this megalith stone ring shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The megalith stone ring was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_obelisk_spires",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "Ancient Obelisk Spires (Obelisk Spires)",
    icon: "🗼",
    description: "Slender carved granite pillars etched with precursor inscriptions.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "ruins",
    cartographicSymbol: "obelisk-spires",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this ancient obelisk spires shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The ancient obelisk spires was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_landmark_arch",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "Natural Weathered Stone Arch (Natural Stone Arch)",
    icon: "🪨🌉",
    description: "Monumental rock arch span carved through a plateau by centuries of wind.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "ruins",
    cartographicSymbol: "landmark-arch",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this natural weathered stone arch shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The natural weathered stone arch was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_ruins_temple",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "Forgotten Temple Ruins (Temple Ruins)",
    icon: "🏛️",
    description: "Crumbling classical colonnade and fractured pediment of a lost order.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "ruins",
    cartographicSymbol: "ruins-temple",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this forgotten temple ruins shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The forgotten temple ruins was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_petrified_wood",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "Petrified Ancient Wood (Petrified Wood)",
    icon: "🪵✨",
    description: "Silicified tree trunks turned to agate and jasper stone over aeons.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "ruins",
    cartographicSymbol: "petrified-wood",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this petrified ancient wood shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The petrified ancient wood was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_sacred_grove",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "Whispering Sacred Grove (Sacred Grove)",
    icon: "✨🌳",
    description: "Locus of enchanted white trees where ley currents rise to the surface.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "ruins",
    cartographicSymbol: "sacred-grove",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this whispering sacred grove shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The whispering sacred grove was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  {
    id: "gen_feature_ley_nexus",
    stage: 'genesis',
    suit: "♦",
    isFantastical: false,
    isDisaster: false,
    name: "Ley Line Nexus Convergence (Ley Line Nexus)",
    icon: "🌀✨",
    description: "Intersection of planetary telluric energy channels radiating magic.",
    slotCategory: "myth",
    slotPriority: 70,
    terrainChange: "plains",
    
    
    overlayChange: "ruins",
    cartographicSymbol: "ley-nexus",
    primaryColor: '#78716c',
    secondaryColor: '#f5f5f4',
    creativePrompt: "How does this ley line nexus convergence shape the surrounding land? What myths or weather patterns are tied to this place?",
    exampleNarrative: "The ley line nexus convergence was etched onto the primordial canvas, casting long shadows across the nascent realm."
  },
  // Fantastical Genesis Jokers
  {
    id: 'gen_earth_titan_spine',
    stage: 'genesis',
    suit: '♠',
    isFantastical: true,
    isDisaster: false,
    name: 'Petrified Titan Spine Massif',
    icon: '✨⛰️',
    description: 'Thrust up a continental mountain divide formed from the petrified vertebrae of a sleeping cosmic earth-titan.',
    slotCategory: 'elevation',
    slotPriority: 85,
    terrainChange: 'mountain',
    reliefChange: 'mountain-range',
    cartographicSymbol: 'mountain-range',
    primaryColor: '#451a03',
    secondaryColor: '#fef08a',
    creativePrompt: 'Which slumbering titan formed this range? What happens if they ever awaken from their millennial slumber?',
    exampleNarrative: 'The mountains shuddered into being, their ridge forming the unmistakable calcified spine of a slumbering cosmic colossus.'
  },
  {
    id: 'gen_water_starlight_spring',
    stage: 'genesis',
    suit: '♥',
    isFantastical: true,
    isDisaster: false,
    name: 'Crystalline Starlight Font & River of Moons',
    icon: '✨🌊',
    description: 'Summon a subterranean starlight headwater spring flowing with luminescent moon-liquid that heals mortals and blesses waters.',
    slotCategory: 'hydrology',
    slotPriority: 85,
    terrainChange: 'ocean',
    cartographicSymbol: 'spring-headwater',
    primaryColor: '#0284c7',
    secondaryColor: '#e0f2fe',
    creativePrompt: 'What blessing or prophecy is bestowed upon mortals who drink from these celestial waters?',
    exampleNarrative: 'Luminescent liquid starlight welled up from deep beneath the crust, feeding a shimmering river that gleamed beneath starry skies.'
  },
  {
    id: 'gen_plant_world_tree',
    stage: 'genesis',
    suit: '♣',
    isFantastical: true,
    isDisaster: false,
    name: 'Root of the Primeval World-Tree',
    icon: '✨🌳',
    description: 'Sprout a colossal primordial tree whose roots penetrate the mantle and whose highest boughs hold up the celestial vault.',
    slotCategory: 'vegetation',
    slotPriority: 88,
    terrainChange: 'forest',
    floraChange: 'forest',
    cartographicSymbol: 'forest-redwood',
    primaryColor: '#14532d',
    secondaryColor: '#bbf7d0',
    creativePrompt: 'What spirits and celestial beings nest among the boughs of the World-Tree? What anchors its deepest roots?',
    exampleNarrative: 'A single emerald sprout broke the crust and swelled into a titanic world-tree whose vast emerald canopy touched the clouds.'
  },
  {
    id: 'gen_feature_ley_nexus_core',
    stage: 'genesis',
    suit: '♦',
    isFantastical: true,
    isDisaster: false,
    name: 'Planetary Ley Nexus & Astral Rift',
    icon: '✨🌀',
    description: 'Anchor a blinding celestial convergence where horizontal and vertical telluric energy streams intersect.',
    slotCategory: 'myth',
    slotPriority: 90,
    terrainChange: 'plains',
    overlayChange: 'myth',
    cartographicSymbol: 'ley-nexus',
    primaryColor: '#7c3aed',
    secondaryColor: '#ede9fe',
    creativePrompt: 'What wild arcane energies bleed into the atmosphere at this planar nexus? How do beasts behave near it?',
    exampleNarrative: 'The air hummed with ozone and starlight as planetary ley currents collided in a blinding spiral of wild cosmic power.'
  },
  // ==========================================
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

