/**
 * compendiumEngine.ts
 * Unified Tabletop Presets & Tropes Compendium Engine.
 * Aggregates and indexes all canonical card powers, whiteboard tropes, stage action presets,
 * cultural traditions, modular traits, and species ancestries with rich descriptions,
 * tabletop storytelling prompts, and multi-faceted categorization.
 */

import { CARTOGRAPHIC_SYMBOLS } from './cartographicSymbolEngine'
import {
  MODULAR_ABILITY_BLOCKS,
  MODULAR_TRAIT_BLOCKS,
  MYTH_PRESETS,
  SOCIETY_PRESETS,
  SPECIES_PRESETS,
  STAGE_ACTION_PRESETS,
} from './presets'
import { StageId, Suit } from './types'

export type CompendiumCategory =
  | 'all'
  | 'powers'
  | 'tropes'
  | 'actions'
  | 'traditions'
  | 'abilities'
  | 'ancestries'
  | 'realms'
  | 'myths'

export interface CompendiumItem {
  id: string
  title: string
  subtitle?: string
  category: CompendiumCategory
  categoryLabel: string
  stage?: StageId
  suit?: Suit
  icon: string
  summary: string
  description: string
  tabletopPrompt?: string
  exampleNarrative?: string
  tags: string[]
  cartographicSymbol?: string
  isFantastical?: boolean
  isDisaster?: boolean
  traitGranted?: string
  abilityGranted?: string
}

export interface CompendiumFilterOptions {
  query?: string
  category?: CompendiumCategory
  stage?: StageId | 'all'
  suit?: Suit | 'all'
  onlyFantastical?: boolean
}

// ========================================================
// 1. CANONICAL CARD POWERS (RULEBOOK DESCRIPTIONS)
// ========================================================

const CANONICAL_POWERS: CompendiumItem[] = [
  // Genesis
  {
    id: 'power_gen_earth',
    title: 'Earth (♠ Spades)',
    subtitle: 'Genesis Stage · Continental Foundation',
    category: 'powers',
    categoryLabel: 'Stage Powers',
    stage: 'genesis',
    suit: '♠',
    icon: '🏔️',
    summary: 'Raise mountain ranges, excavate colossal canyons, or carve sheer coastal cliffs.',
    description: 'The earth trembles as tectonic pillars emerge from the primordial ocean. Creators sculpt elevation, continental spines, mineral crags, arid plateaus, or cavernous chasms.',
    tabletopPrompt: 'What primordial forces raised this mountain peak or rent open this canyon? Are there rich mineral veins within?',
    exampleNarrative: 'Colossal granite massifs rose above the sea, their snowcapped spines dividing the northern and southern basins.',
    tags: ['genesis', 'earth', 'mountains', 'canyons', 'topography'],
  },
  {
    id: 'power_gen_water',
    title: 'Water (♥ Hearts)',
    subtitle: 'Genesis Stage · Hydrological Lifelines',
    category: 'powers',
    categoryLabel: 'Stage Powers',
    stage: 'genesis',
    suit: '♥',
    icon: '🌊',
    summary: 'Channel roaring river systems, highland tarns, misty fjords, and ocean currents.',
    description: 'Waters flow from highland glaciers and headwater springs to carve deep river basins, delta marshes, and sparkling inland seas that sustain future civilizations.',
    tabletopPrompt: 'Where do these waters originate? Does this river meander peacefully or surge with lethal rapids and waterfalls?',
    exampleNarrative: 'A roaring glacier melted into a winding river that cut through the valley, depositing rich silt along its broad banks.',
    tags: ['genesis', 'water', 'rivers', 'lakes', 'currents'],
  },
  {
    id: 'power_gen_plant',
    title: 'Plant (♣ Clubs)',
    subtitle: 'Genesis Stage · Biome & Flora Emergence',
    category: 'powers',
    categoryLabel: 'Stage Powers',
    stage: 'genesis',
    suit: '♣',
    icon: '🌲',
    summary: 'Blanket landscapes in ancient forests, impenetrable jungles, steppes, or fens.',
    description: 'Vegetation takes root across the cooled soil. Towering redwood canopies, dense jungle lianas, whispering savannas, and wild flowering meadows carpet the land.',
    tabletopPrompt: 'What colossal flora dominates this wild biome? Are the ancient trees watchful or hospitable?',
    exampleNarrative: 'Vast evergreen taigas stretched across the northern foothills, cloaked in morning frost and silent stillness.',
    tags: ['genesis', 'plant', 'forest', 'jungle', 'grassland'],
  },
  {
    id: 'power_gen_feature',
    title: 'Feature & Wonder (♦ Diamonds)',
    subtitle: 'Genesis Stage · Geological Curiosities',
    category: 'powers',
    categoryLabel: 'Stage Powers',
    stage: 'genesis',
    suit: '♦',
    icon: '🌋',
    summary: 'Unearth geysers, crystal geodes, meteor impact craters, salt flats, or ley nexus.',
    description: 'Unique geological landmarks and mysterious natural phenomena arise, serving as sacred gathering places, navigation waypoints, or reservoirs of dormant primal power.',
    tabletopPrompt: 'What miraculous or eerie property makes this natural landmark unique? How do local winds or thermals behave around it?',
    exampleNarrative: 'A cluster of boiling mineral geysers burst through the crust, painting the surrounding terrace with vivid turquoise and amber rings.',
    tags: ['genesis', 'feature', 'geysers', 'craters', 'resources', 'landmarks'],
  },

  // Primal
  {
    id: 'power_pri_settlement',
    title: 'Settlement (♠ Spades)',
    subtitle: 'Primal Stage · First Hearths & Villages',
    category: 'powers',
    categoryLabel: 'Stage Powers',
    stage: 'primal',
    suit: '♠',
    icon: '🏕️',
    summary: 'Establish permanent hearth hamlets, cliff pueblos, timber palisades, or stilt camps.',
    description: 'Nomadic bands gather around reliable fire, fresh water, and shelter to found their earliest permanent settlements, staking claim to their ancestral homeland.',
    tabletopPrompt: 'What prompted this clan to settle here permanently? What protects their homes from wild beasts and flash floods?',
    exampleNarrative: 'Circular thatched hearths were raised along the riverbank, their perimeter ringed with sharpened timber stakes against forest prowlers.',
    tags: ['primal', 'settlement', 'hamlet', 'village', 'habitation'],
  },
  {
    id: 'power_pri_tradition',
    title: 'Tradition & Faith (♥ Hearts)',
    subtitle: 'Primal Stage · Cultural Identity & Rituals',
    category: 'powers',
    categoryLabel: 'Stage Powers',
    stage: 'primal',
    suit: '♥',
    icon: '🕯️',
    summary: 'Codify ancestor veneration, solar cults, sacred hospitality, or skaldic oral sagas.',
    description: 'Shared rituals, spiritual beliefs, burial customs, and taboos solidify a people’s shared identity, connecting generations through unbroken oral lore.',
    tabletopPrompt: 'What sacred ceremony unites this people across disparate clans? What taboo must never be broken?',
    exampleNarrative: 'Under the solstice moon, the elders lit the sacred hill braziers, singing the lineage of the First Matron into the dawn.',
    tags: ['primal', 'tradition', 'culture', 'faith', 'rituals'],
  },
  {
    id: 'power_pri_resource',
    title: 'Domesticated Resource (♣ Clubs)',
    subtitle: 'Primal Stage · Flora, Fauna & Minerals',
    category: 'powers',
    categoryLabel: 'Stage Powers',
    stage: 'primal',
    suit: '♣',
    icon: '⛏️',
    summary: 'Domesticate warhorses, heavy draft oxen, terraced grains, bog iron, or timber.',
    description: 'Discovering valuable natural bounties or selectively breeding flora and fauna elevates a species above mere subsistence survival, sparking demographic booms.',
    tabletopPrompt: 'How did this species domesticate or extract this vital resource? How did it alter their daily survival?',
    exampleNarrative: 'Wild horned steppes-beasts were brought into corrals, providing heavy traction that cleared boulder-fields into fertile farmland.',
    tags: ['primal', 'resource', 'agriculture', 'fauna', 'mining'],
  },
  {
    id: 'power_pri_skill',
    title: 'Evolutionary Skill (♦ Diamonds)',
    subtitle: 'Primal Stage · Masteries & Adaptations',
    category: 'powers',
    categoryLabel: 'Stage Powers',
    stage: 'primal',
    suit: '♦',
    icon: '🏹',
    summary: 'Develop composite archery, ocean seafaring, damask metallurgy, or herbal medicine.',
    description: 'Generational ingenuity and physical adaptations give rise to specialized skills that distinguish a culture from neighboring rivals and shape their future prowess.',
    tabletopPrompt: 'How is this skill passed down between master and apprentice? What trial proves mastery?',
    exampleNarrative: 'Apprentices learned to split sinew and horn into recurved bows, darkening target fields at two hundred paces with effortless precision.',
    tags: ['primal', 'skill', 'mastery', 'craft', 'combat'],
  },

  // Civilization
  {
    id: 'power_civ_construction',
    title: 'Construction (♠ Spades)',
    subtitle: 'Civilization Stage · Architecture & Monuments',
    category: 'powers',
    categoryLabel: 'Stage Powers',
    stage: 'civilization',
    suit: '♠',
    icon: '🏰',
    summary: 'Erect stone castle keeps, mountain citadels, deepwater ports, or arched aqueducts.',
    description: 'Master architects organize monumental public works that endure for centuries: defensive stone keeps, deep harbors, wonder pyramids, and university academies.',
    tabletopPrompt: 'Who funded or labored on this magnificent structure? What architectural marvel makes it withstand sieges and storms?',
    exampleNarrative: 'White marble towers climbed the seaward cliffs, linked by arched bridges that echoed with the clatter of armored guards.',
    tags: ['civilization', 'construction', 'castle', 'monument', 'fortress'],
  },
  {
    id: 'power_civ_enlightenment',
    title: 'Enlightenment (♥ Hearts)',
    subtitle: 'Civilization Stage · Philosophy, Law & Tech',
    category: 'powers',
    categoryLabel: 'Stage Powers',
    stage: 'civilization',
    suit: '♥',
    icon: '📜',
    summary: 'Inaugurate parliamentary republics, written legal codes, merchant guilds, or astrolabes.',
    description: 'Scholars, jurists, and philosophers elevate society through systematic inquiry, civic institutions, nautical navigation, and written legal codices.',
    tabletopPrompt: 'Which great debate gave birth to this law or philosophical school? Who benefits most from its adoption?',
    exampleNarrative: 'In the great council hall, delegates from twelve free cities signed the first charter of civic liberties, carving the law into public bronze tablets.',
    tags: ['civilization', 'enlightenment', 'laws', 'republic', 'science'],
  },
  {
    id: 'power_civ_expansion',
    title: 'Expansion (♣ Clubs)',
    subtitle: 'Civilization Stage · Colonization & Roads',
    category: 'powers',
    categoryLabel: 'Stage Powers',
    stage: 'civilization',
    suit: '♣',
    icon: '🏘️',
    summary: 'Plant frontier colonies, build imperial armadas, annex valleys, or establish trading posts.',
    description: 'Nations expand their frontiers through planned colonization, military outposts, trade networks, and paved military highways that knit disparate provinces together.',
    tabletopPrompt: 'What motivated this expansion into unknown territory? How were indigenous communities integrated or affected?',
    exampleNarrative: 'Paved stone highways cut through the misty mountain passes, linking the bustling coastal capital to inland mining colonies.',
    tags: ['civilization', 'expansion', 'colonies', 'navy', 'roads'],
  },
  {
    id: 'power_civ_diplomacy',
    title: 'Diplomacy (♦ Diamonds)',
    subtitle: 'Civilization Stage · Statecraft & Accords',
    category: 'powers',
    categoryLabel: 'Stage Powers',
    stage: 'civilization',
    suit: '♦',
    icon: '🕊️',
    summary: 'Forge dynastic marriages, mutual defense leagues, free trade pacts, or embassies.',
    description: 'Ambassadors negotiate treaties, reciprocal trade pacts, royal marriages, and border demarcations that foster eras of peace and cultural exchange.',
    tabletopPrompt: 'What historical rivalry was set aside to achieve this concord? What symbolic gift sealed the accord?',
    exampleNarrative: 'Royal heralds exchanged ceremonial swords and silk banners, binding the mountain kingdom and the sea realm in mutual defense for three generations.',
    tags: ['civilization', 'diplomacy', 'treaties', 'marriage', 'peace'],
  },

  // Intrigue
  {
    id: 'power_int_conflict',
    title: 'Conflict & War (♠ Spades)',
    subtitle: 'Intrigue Stage · Clashes of Arms',
    category: 'powers',
    categoryLabel: 'Stage Powers',
    stage: 'intrigue',
    suit: '♠',
    icon: '⚔️',
    summary: 'Wage continental wars, protracted citadel sieges, peasant rebellions, or civil wars.',
    description: 'Simmering grievances, border disputes, or ideological divides ignite into open warfare, testing the resilience of castles and the resolve of dynasties.',
    tabletopPrompt: 'What spark ignited this bitter war? Which decisive battle will be remembered in song and sorrow?',
    exampleNarrative: 'Trebuchets pounded the citadel gatehouse day and night, turning the proud capital into a desperate besieged redoubt.',
    tags: ['intrigue', 'conflict', 'war', 'siege', 'rebellion'],
  },
  {
    id: 'power_int_cooperation',
    title: 'Cooperation & Coalitions (♥ Hearts)',
    subtitle: 'Intrigue Stage · Unified Fronts',
    category: 'powers',
    categoryLabel: 'Stage Powers',
    stage: 'intrigue',
    suit: '♥',
    icon: '🤝',
    summary: 'Assemble grand defensive coalitions, joint famine relief convoys, or reconstruction pacts.',
    description: 'Facing existential perils, rival realms put aside ancient grudges to pool armies, food supplies, and arcane wisdom to defend the civilization.',
    tabletopPrompt: 'What common catastrophe compelled bitter rivals to join hands? Who serves as Supreme Commander of the united force?',
    exampleNarrative: 'The Grand Coalition raised their mixed banners along the frontier river, standing shoulder to shoulder against the gathering darkness.',
    tags: ['intrigue', 'cooperation', 'coalition', 'alliances', 'relief'],
  },
  {
    id: 'power_int_scheme',
    title: 'Scheme & Espionage (♣ Clubs)',
    subtitle: 'Intrigue Stage · Shadows in the Court',
    category: 'powers',
    categoryLabel: 'Stage Powers',
    stage: 'intrigue',
    suit: '♣',
    icon: '🎭',
    summary: 'Execute royal heir assassinations, smuggler networks, forged successions, or coups.',
    description: 'In dimly lit corridors, spies, poisoned daggers, forged documents, and clandestine cabals alter the fate of nations without a single battlefield horn sounding.',
    tabletopPrompt: 'Who commissioned this covert scheme from the shadows? Whose silence was bought with coin or poison?',
    exampleNarrative: 'A masked courier slipped through the palace catacombs, bearing a forged treaty bearing the stolen wax seal of the dying monarch.',
    tags: ['intrigue', 'scheme', 'assassination', 'spy', 'conspiracy'],
  },
  {
    id: 'power_int_myth',
    title: 'Myth & Legend (♦ Diamonds)',
    subtitle: 'Intrigue Stage · Ancient Awakenings',
    category: 'powers',
    categoryLabel: 'Stage Powers',
    stage: 'intrigue',
    suit: '♦',
    icon: '🐉',
    summary: 'Awaken slumbering dragons, unearth sovereign holy blades, or unseal abyssal rifts.',
    description: 'Legends thought to be mere fireside tales prove terrifyingly real as ancient monsters, cursed relics, and planar forces awaken to challenge mortal reign.',
    tabletopPrompt: 'What prophecy foretold the awakening of this ancient entity? What champion must rise to confront it?',
    exampleNarrative: 'With an earth-shattering roar, the slumbering cinder-wyrm burst from Mount Ash, its wings blotting out the sunset in smoke and flame.',
    tags: ['intrigue', 'myth', 'dragon', 'relic', 'adventure_hook'],
  },
]

// ========================================================
// 2. COMPENDIUM REGISTRY BUILDER
// ========================================================

let cachedInventory: CompendiumItem[] | null = null

export function getAllCompendiumItems(): CompendiumItem[] {
  if (cachedInventory) return cachedInventory

  const items: CompendiumItem[] = []

  // 1. Canonical Stage Powers (16 items)
  items.push(...CANONICAL_POWERS)

  // 2. Cartographic Whiteboard Marker Tropes (113 items)
  for (const sym of CARTOGRAPHIC_SYMBOLS) {
    items.push({
      id: `trope_${sym.id}`,
      title: `${sym.name} (${sym.variantName})`,
      subtitle: `Cartographic Symbol · ${sym.conceptLabel}`,
      category: 'tropes',
      categoryLabel: 'Cartographic Tropes',
      stage: sym.category === 'settlement' ? 'primal' : sym.category === 'construction' ? 'civilization' : 'genesis',
      icon: sym.icon,
      summary: sym.description,
      description: `Hand-drawn whiteboard vector marker symbol for ${sym.conceptLabel}. Renders dynamically on map tiles, export vector sheets, and campaign sourcebooks.`,
      tags: [...sym.tags, sym.concept, sym.category],
      cartographicSymbol: sym.id,
    })
  }

  // 3. Stage Action Presets (198+ items)
  for (const p of STAGE_ACTION_PRESETS) {
    items.push({
      id: `action_${p.id}`,
      title: p.name,
      subtitle: `Stage Preset · ${p.stage.toUpperCase()} (${p.suit})`,
      category: 'actions',
      categoryLabel: 'Action Presets',
      stage: p.stage,
      suit: p.suit,
      icon: p.icon,
      summary: p.description,
      description: `${p.description} Modifies map terrain, adds slot layers, or grants societal traits.`,
      tabletopPrompt: p.creativePrompt,
      exampleNarrative: p.exampleNarrative,
      tags: [p.stage, p.slotCategory, ...(p.isFantastical ? ['fantastical'] : []), ...(p.isDisaster ? ['cataclysm'] : [])],
      cartographicSymbol: p.cartographicSymbol,
      isFantastical: p.isFantastical,
      isDisaster: p.isDisaster,
      traitGranted: p.traitGranted,
      abilityGranted: p.abilityGranted,
    })
  }

  // 4. Cultural Traditions & Modular Traits (26+ items)
  for (const group of MODULAR_TRAIT_BLOCKS) {
    for (const trait of group.items) {
      items.push({
        id: `trad_${trait.label.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
        title: trait.label,
        subtitle: `Cultural Tradition · ${group.category}`,
        category: 'traditions',
        categoryLabel: 'Traditions & Culture',
        stage: 'primal',
        suit: group.suitHint,
        icon: trait.icon,
        summary: trait.description || `A foundational cultural trait practiced by civilized folk.`,
        description: trait.description || `${trait.label} shapes religious worship, burial customs, legal codes, and everyday communal life.`,
        tags: ['tradition', 'culture', ...(trait.tags || [])],
        traitGranted: trait.label,
      })
    }
  }

  // 5. Evolutionary Abilities & Adaptations (20+ items)
  for (const group of MODULAR_ABILITY_BLOCKS) {
    for (const ab of group.items) {
      items.push({
        id: `ability_${ab.label.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
        title: ab.label,
        subtitle: `Physiology & Skill · ${group.category}`,
        category: 'abilities',
        categoryLabel: 'Skills & Adaptations',
        stage: 'primal',
        suit: group.suitHint,
        icon: ab.icon,
        summary: ab.description || `An evolutionary prowess mastered through generational practice.`,
        description: ab.description || `${ab.label} grants unique martial, physiological, or arcane capabilities.`,
        tags: ['ability', 'skill', 'adaptation', ...(ab.tags || [])],
        abilityGranted: ab.label,
      })
    }
  }

  // 6. Ancestries & Races (12+ items)
  for (const sp of SPECIES_PRESETS) {
    items.push({
      id: `ancestry_${sp.id}`,
      title: sp.name,
      subtitle: `Ancestry Archetype · Preferred: ${sp.preferredTerrains.join(', ')}`,
      category: 'ancestries',
      categoryLabel: 'Races & Ancestries',
      stage: 'primal',
      suit: '♠',
      icon: sp.icon || '🧝',
      summary: sp.settlementIcons?.architectureStyle
        ? `Architectural tradition: ${sp.settlementIcons.architectureStyle}`
        : 'A distinct species awakening during the Primal Stage.',
      description: `A unique tabletop folk with distinct settlement styles (${sp.settlementIcons?.village || '🏡'} village, ${sp.settlementIcons?.city || '🏰'} city) and affinity for ${sp.preferredTerrains.join(', ')} biomes.`,
      tags: ['species', 'ancestry', ...sp.preferredTerrains],
    })
  }

  // 7. Civilizations & Societies (6+ items)
  for (const soc of SOCIETY_PRESETS) {
    items.push({
      id: `realm_${soc.id}`,
      title: soc.name,
      subtitle: `Civilization Realm · Preferred: ${soc.preferredTerrains.join(', ')}`,
      category: 'realms',
      categoryLabel: 'Civilizations & Realms',
      stage: 'civilization',
      suit: '♠',
      icon: soc.icon || '👑',
      summary: `Pre-configured civil realm archetype with custom settlement architecture.`,
      description: `A prominent realm capable of monumental construction, diplomacy, and provincial expansion.`,
      tags: ['society', 'realm', 'civilization', ...soc.preferredTerrains],
    })
  }

  // 8. Myths & Ancient Legends (6+ items)
  for (const myth of MYTH_PRESETS) {
    items.push({
      id: `legend_${myth.id}`,
      title: myth.name,
      subtitle: `Mythic Legend · Archetype: ${myth.archetype || 'Ancient Calamity'}`,
      category: 'myths',
      categoryLabel: 'Myths & Calamities',
      stage: 'intrigue',
      suit: '♦',
      icon: myth.icon,
      summary: myth.description,
      description: `${myth.description} Traits: ${myth.traits.join(', ')}. Abilities: ${myth.abilities.join(', ')}.`,
      tags: ['myth', 'legend', 'boss', 'dungeon_hook', ...(myth.traits || [])],
      isFantastical: true,
    })
  }

  cachedInventory = items
  return items
}

// ========================================================
// 3. SEARCH & FILTERING UTILITIES
// ========================================================

export function searchCompendium(options: CompendiumFilterOptions = {}): CompendiumItem[] {
  const all = getAllCompendiumItems()
  const q = options.query?.toLowerCase().trim() || ''

  return all.filter((item) => {
    // Category Filter
    if (options.category && options.category !== 'all' && item.category !== options.category) {
      return false
    }

    // Stage Filter
    if (options.stage && options.stage !== 'all' && item.stage !== options.stage) {
      return false
    }

    // Suit Filter
    if (options.suit && options.suit !== 'all' && item.suit !== options.suit) {
      return false
    }

    // Fantastical Filter
    if (options.onlyFantastical && !item.isFantastical) {
      return false
    }

    // Query Match
    if (q) {
      const text = `${item.title} ${item.subtitle || ''} ${item.summary} ${item.description} ${item.tags.join(' ')} ${item.tabletopPrompt || ''}`.toLowerCase()
      if (!text.includes(q)) return false
    }

    return true
  })
}

export function getCompendiumCategories(): { id: CompendiumCategory; label: string; icon: string; count: number }[] {
  const all = getAllCompendiumItems()
  const counts: Record<string, number> = {}

  for (const item of all) {
    counts[item.category] = (counts[item.category] || 0) + 1
  }

  return [
    { id: 'all', label: 'All Items', icon: '🌐', count: all.length },
    { id: 'powers', label: 'Stage Powers', icon: '⚡', count: counts['powers'] || 0 },
    { id: 'tropes', label: 'Whiteboard Tropes', icon: '🖌️', count: counts['tropes'] || 0 },
    { id: 'actions', label: 'Action Presets', icon: '🎲', count: counts['actions'] || 0 },
    { id: 'traditions', label: 'Traditions & Lore', icon: '📜', count: counts['traditions'] || 0 },
    { id: 'abilities', label: 'Skills & Mastery', icon: '🏹', count: counts['abilities'] || 0 },
    { id: 'ancestries', label: 'Races & Folk', icon: '🧝', count: counts['ancestries'] || 0 },
    { id: 'realms', label: 'Civilizations', icon: '👑', count: counts['realms'] || 0 },
    { id: 'myths', label: 'Myths & Calamities', icon: '🐉', count: counts['myths'] || 0 },
  ]
}

export function findCompendiumTrait(traitOrAbilityLabel: string): CompendiumItem | undefined {
  const all = getAllCompendiumItems()
  const q = traitOrAbilityLabel.toLowerCase().trim()
  return all.find(
    (item) =>
      (item.category === 'traditions' || item.category === 'abilities') &&
      item.title.toLowerCase() === q
  )
}
