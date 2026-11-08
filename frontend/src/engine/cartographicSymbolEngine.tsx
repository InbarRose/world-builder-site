import React from 'react'

export type CartographicCategory = 'earth' | 'water' | 'plant' | 'feature'

export interface CartographicSymbolMeta {
  id: string
  name: string
  category: CartographicCategory
  icon: string
  description: string
  tags: string[]
}

export const CARTOGRAPHIC_SYMBOLS: CartographicSymbolMeta[] = [
  // ==========================================
  // 1. EARTH TROPES (12 whiteboard standards)
  // ==========================================
  {
    id: 'mountain-peak',
    name: 'Mountain Peak',
    category: 'earth',
    icon: '⛰️',
    description: 'Classic single triangular peak with center ridge and shaded slope.',
    tags: ['mountain', 'peak', 'elevation', 'highland'],
  },
  {
    id: 'mountain-twin',
    name: 'Twin Horn Peaks',
    category: 'earth',
    icon: '🏔️',
    description: 'Dual companion summits rising side-by-side.',
    tags: ['mountain', 'twin', 'horns', 'pass'],
  },
  {
    id: 'mountain-spire',
    name: 'Jagged Needle Spires',
    category: 'earth',
    icon: '🗡️',
    description: 'Sharp, sheer karst pinnacles and needle-like rocky crags.',
    tags: ['mountain', 'crag', 'spire', 'needle'],
  },
  {
    id: 'mountain-snow',
    name: 'Snow-Capped Massif',
    category: 'earth',
    icon: '❄️',
    description: 'Glaciated alpine summit with perpetual snowfields.',
    tags: ['mountain', 'snow', 'glacier', 'alpine'],
  },
  {
    id: 'mountain-range',
    name: 'Mountain Range Spine',
    category: 'earth',
    icon: '🏔️',
    description: 'Continuous three-peak ridge forming a continental divide.',
    tags: ['mountain', 'range', 'spine', 'ridge'],
  },
  {
    id: 'hills-rolling',
    name: 'Rolling Low Hills',
    category: 'earth',
    icon: '🟢',
    description: 'Gentle rounded knolls and soft pastoral undulations.',
    tags: ['hills', 'lowlands', 'pasture', 'mounds'],
  },
  {
    id: 'hills-rugged',
    name: 'Rugged Highlands & Knolls',
    category: 'earth',
    icon: '🪨',
    description: 'Rocky hummocks with exposed stone ledges and scrub.',
    tags: ['hills', 'rugged', 'upland', 'rocky'],
  },
  {
    id: 'mesa-plateau',
    name: 'Flat-Topped Mesa & Butte',
    category: 'earth',
    icon: '🧱',
    description: 'Stepped table mountain with sheer cliff borders.',
    tags: ['mesa', 'plateau', 'tableland', 'butte'],
  },
  {
    id: 'canyon-gorge',
    name: 'Deep Canyon & Gorge',
    category: 'earth',
    icon: '🏜️',
    description: 'Winding chasm carved deep into the earth crust.',
    tags: ['canyon', 'gorge', 'ravine', 'rift'],
  },
  {
    id: 'cliffs-escarpment',
    name: 'Sheer Cliffs & Escarpment',
    category: 'earth',
    icon: '🧗',
    description: 'Steep precipice with vertical drop and scree slopes.',
    tags: ['cliffs', 'escarpment', 'precipice', 'bluff'],
  },
  {
    id: 'badlands',
    name: 'Eroded Badlands',
    category: 'earth',
    icon: '🦴',
    description: 'Intricately gullied clay canyons and barren ravines.',
    tags: ['badlands', 'gullies', 'clay', 'ravines'],
  },
  {
    id: 'solitary-sentinel',
    name: 'Solitary Lone Mountain',
    category: 'earth',
    icon: '🗼',
    description: 'Massive isolated volcanic neck or monolithic sentinel.',
    tags: ['solitary', 'sentinel', 'lone-peak', 'monolith'],
  },

  // ==========================================
  // 2. WATER TROPES (12 whiteboard standards)
  // ==========================================
  {
    id: 'river-winding',
    name: 'Winding River',
    category: 'water',
    icon: '〰️',
    description: 'Meandering river channel flowing through the lowlands.',
    tags: ['river', 'waterway', 'stream', 'meander'],
  },
  {
    id: 'river-fork',
    name: 'Tributary Confluence (Fork)',
    category: 'water',
    icon: '🔱',
    description: 'Two watercourses merging into a single powerful flow.',
    tags: ['river', 'confluence', 'fork', 'tributary'],
  },
  {
    id: 'river-delta',
    name: 'Braided River Delta',
    category: 'water',
    icon: '🌿',
    description: 'Fan of branching channels depositing silt into the sea.',
    tags: ['delta', 'estuary', 'marsh', 'river-mouth'],
  },
  {
    id: 'lake-serene',
    name: 'Serene Inland Lake',
    category: 'water',
    icon: '💧',
    description: 'Natural freshwater lake with gentle shoreline ripples.',
    tags: ['lake', 'basin', 'freshwater', 'tarn'],
  },
  {
    id: 'lake-crater',
    name: 'Caldera Crater Lake',
    category: 'water',
    icon: '🧿',
    description: 'Deep circular body of water filling an extinct crater.',
    tags: ['lake', 'crater', 'caldera', 'deep'],
  },
  {
    id: 'sea-bay',
    name: 'Crescent Sea Bay & Harbor',
    category: 'water',
    icon: '⚓',
    description: 'Sheltered coastal cove offering anchorage for vessels.',
    tags: ['bay', 'harbor', 'cove', 'coast'],
  },
  {
    id: 'fjord-inlet',
    name: 'Steep Fjord & Inlet',
    category: 'water',
    icon: '🌊',
    description: 'Glacial sea-canyon flanked by soaring cliffs.',
    tags: ['fjord', 'inlet', 'sea-loch', 'sound'],
  },
  {
    id: 'waterfall-cataract',
    name: 'Roaring Waterfall & Cataract',
    category: 'water',
    icon: '⛲',
    description: 'Plunging waterfall dropping over a rocky ledge.',
    tags: ['waterfall', 'cataract', 'cascade', 'spray'],
  },
  {
    id: 'swamp-marsh',
    name: 'Murky Swamp & Reed Marsh',
    category: 'water',
    icon: '🌾',
    description: 'Waterlogged wetlands with reeds and still dark pools.',
    tags: ['swamp', 'marsh', 'wetland', 'fen'],
  },
  {
    id: 'hot-springs',
    name: 'Steaming Geothermal Springs',
    category: 'water',
    icon: '♨️',
    description: 'Warm mineral-rich pools emitting wisps of steam.',
    tags: ['hot-springs', 'geothermal', 'steam', 'mineral'],
  },
  {
    id: 'barrier-reef',
    name: 'Coral Barrier Reef & Atoll',
    category: 'water',
    icon: '🪸',
    description: 'Ring of coral shoals and turquoise lagoon shallows.',
    tags: ['reef', 'atoll', 'lagoon', 'coral'],
  },
  {
    id: 'oasis-spring',
    name: 'Desert Oasis Spring',
    category: 'water',
    icon: '🌴',
    description: 'Life-giving pool of groundwater surrounded by palms.',
    tags: ['oasis', 'spring', 'desert', 'palms'],
  },

  // ==========================================
  // 3. PLANT / FLORA TROPES (12 whiteboard standards)
  // ==========================================
  {
    id: 'forest-deciduous',
    name: 'Broadleaf Canopy Forest',
    category: 'plant',
    icon: '🌳',
    description: 'Classic leafy woodland with rounded billowy canopies.',
    tags: ['forest', 'deciduous', 'woods', 'oak'],
  },
  {
    id: 'forest-taiga',
    name: 'Pine & Fir Taiga',
    category: 'plant',
    icon: '🌲',
    description: 'Dense evergreen needle forest with conical trees.',
    tags: ['taiga', 'pine', 'fir', 'evergreen'],
  },
  {
    id: 'forest-redwood',
    name: 'Colossal Redwood Grove',
    category: 'plant',
    icon: '🪵',
    description: 'Towering primordial trees with trunks as wide as houses.',
    tags: ['redwood', 'sequoia', 'colossal', 'ancient'],
  },
  {
    id: 'forest-jungle',
    name: 'Tangled Rainforest Canopy',
    category: 'plant',
    icon: '🌴',
    description: 'Multi-tiered tropical jungle with dense undergrowth.',
    tags: ['jungle', 'rainforest', 'tropical', 'vines'],
  },
  {
    id: 'forest-deadwood',
    name: 'Haunted Deadwood & Stumps',
    category: 'plant',
    icon: '🍂',
    description: 'Desolate woodland of petrified snags and twisted boughs.',
    tags: ['deadwood', 'petrified', 'haunted', 'stumps'],
  },
  {
    id: 'forest-birch',
    name: 'Slender Birch & Aspen Wood',
    category: 'plant',
    icon: '🌾',
    description: 'Pale, slender trunks with shimmering high foliage.',
    tags: ['birch', 'aspen', 'pale', 'woodland'],
  },
  {
    id: 'forest-bayou',
    name: 'Weeping Willow Bayou',
    category: 'plant',
    icon: '🌿',
    description: 'Hanging moss curtains trailing from ancient willow limbs.',
    tags: ['bayou', 'willow', 'moss', 'wet-forest'],
  },
  {
    id: 'forest-fungal',
    name: 'Giant Fungal Spore Wood',
    category: 'plant',
    icon: '🍄',
    description: 'Forest of colossal mushrooms and bioluminescent caps.',
    tags: ['fungal', 'mushrooms', 'spores', 'subterranean'],
  },
  {
    id: 'briar-thorns',
    name: 'Thorny Briar Labyrinth',
    category: 'plant',
    icon: '🥀',
    description: 'Impenetrable thicket of sharp iron-hard brambles.',
    tags: ['briars', 'thorns', 'brambles', 'tangle'],
  },
  {
    id: 'sacred-grove',
    name: 'Elder World-Tree Grove',
    category: 'plant',
    icon: '✨',
    description: 'Mythic ancestral tree radiating gentle spiritual power.',
    tags: ['world-tree', 'elder', 'sacred', 'grove'],
  },
  {
    id: 'scrubland',
    name: 'Arid Scrub & Chapparal',
    category: 'plant',
    icon: '🌵',
    description: 'Sparse drought-tolerant brush clumps across dry earth.',
    tags: ['scrub', 'chapparal', 'brush', 'dry'],
  },
  {
    id: 'grass-savanna',
    name: 'Golden Wind-Swept Savanna',
    category: 'plant',
    icon: '🌾',
    description: 'Endless plains of tall waving golden grasses.',
    tags: ['savanna', 'steppe', 'grassland', 'prairie'],
  },

  // ==========================================
  // 4. FEATURE / LANDFORM TROPES (12 whiteboard standards)
  // ==========================================
  {
    id: 'volcano-active',
    name: 'Active Smoking Volcano',
    category: 'feature',
    icon: '🌋',
    description: 'Smoking caldera cone venting steam and subterranean fire.',
    tags: ['volcano', 'caldera', 'lava', 'fire'],
  },
  {
    id: 'chasm-abyss',
    name: 'Bottomless Abyss Fissure',
    category: 'feature',
    icon: '🕳️',
    description: 'Jagged tear in the crust plunging into black depths.',
    tags: ['chasm', 'abyss', 'fissure', 'trench'],
  },
  {
    id: 'dunes-desert',
    name: 'Wind-Swept Sand Dunes',
    category: 'feature',
    icon: '🏜️',
    description: 'Parallel rippling crests of drifting desert sands.',
    tags: ['dunes', 'desert', 'sand', 'drifts'],
  },
  {
    id: 'cave-maw',
    name: 'Cavern Maw Entrance',
    category: 'feature',
    icon: '🪨',
    description: 'Arched subterranean mouth leading beneath the earth.',
    tags: ['cave', 'cavern', 'underdark', 'grotto'],
  },
  {
    id: 'crater-impact',
    name: 'Meteor Impact Crater',
    category: 'feature',
    icon: '☄️',
    description: 'Circular celestial impact basin with a raised ring lip.',
    tags: ['crater', 'meteor', 'impact', 'basin'],
  },
  {
    id: 'geyser-field',
    name: 'Geyser Spout Basin',
    category: 'feature',
    icon: '💨',
    description: 'Violently erupting boiling water plumes and sulfur pools.',
    tags: ['geyser', 'fumarole', 'steam', 'spout'],
  },
  {
    id: 'megalith-ring',
    name: 'Standing Stone Megalith Ring',
    category: 'feature',
    icon: '🗿',
    description: 'Ancient circle of unworked megaliths and trilithon dolmens.',
    tags: ['megalith', 'stonehenge', 'monolith', 'ruins'],
  },
  {
    id: 'titan-ribs',
    name: 'Petrified Titan Ribcage',
    category: 'feature',
    icon: '☠️',
    description: 'Massive fossilized skeletal arches of a primordial behemoth.',
    tags: ['titan', 'bones', 'skeleton', 'fossil'],
  },
  {
    id: 'salt-flats',
    name: 'Cracked White Salt Flats',
    category: 'feature',
    icon: '🧂',
    description: 'Hexagonal cracked crust over a desiccated prehistoric seabed.',
    tags: ['salt', 'flats', 'cracked', 'pan'],
  },
  {
    id: 'arch-rock',
    name: 'Natural Stone Bridge Arch',
    category: 'feature',
    icon: '🌉',
    description: 'Magnificent sandstone arch bridging a chasm.',
    tags: ['arch', 'bridge', 'natural-arch', 'window'],
  },
  {
    id: 'glacier-crevasse',
    name: 'Glacial Icefield & Crevasses',
    category: 'feature',
    icon: '🧊',
    description: 'Crevasse-riddled ice sheet creeping across the plateau.',
    tags: ['glacier', 'ice', 'crevasse', 'frozen'],
  },
  {
    id: 'maelstrom-whirlpool',
    name: 'Oceanic Maelstrom Vortex',
    category: 'feature',
    icon: '🌀',
    description: 'Terrifying oceanic whirlpool swallowing currents into the sea.',
    tags: ['maelstrom', 'whirlpool', 'vortex', 'ocean'],
  },
]

export function getSymbolsByCategory(category: CartographicCategory): CartographicSymbolMeta[] {
  return CARTOGRAPHIC_SYMBOLS.filter((s) => s.category === category)
}

export function findSymbolById(id: string): CartographicSymbolMeta | undefined {
  return CARTOGRAPHIC_SYMBOLS.find((s) => s.id === id)
}

/**
 * Returns clean whiteboard / cartographic vector SVG elements
 * designed to look hand-sketched with ink/marker strokes on a 48x48 tile.
 */
export function renderCartographicMarkerSVG(
  symbolId: string,
  options: {
    color?: string
    strokeWidth?: number
    fillOpacity?: number
    opacity?: number
  } = {}
): React.ReactElement | null {
  const stroke = options.color || '#262626'
  const strokeWidth = options.strokeWidth || 1.3
  const fillOpacity = options.fillOpacity ?? 0.15
  const opacity = options.opacity ?? 0.85

  switch (symbolId) {
    // ==========================================
    // 1. EARTH
    // ==========================================
    case 'mountain-peak':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          {/* Main Peak Body */}
          <polygon points="24,8 8,40 40,40" fill={stroke} fillOpacity={fillOpacity} />
          {/* Center Ridgeline */}
          <path d="M 24 8 Q 22 24, 25 40" strokeWidth={strokeWidth * 1.1} />
          {/* Shading Hatch Strokes on East Slope */}
          <line x1="26" y1="20" x2="33" y2="26" strokeWidth={strokeWidth * 0.8} />
          <line x1="27" y1="26" x2="36" y2="33" strokeWidth={strokeWidth * 0.8} />
          <line x1="28" y1="32" x2="38" y2="39" strokeWidth={strokeWidth * 0.8} />
        </g>
      )

    case 'mountain-twin':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          {/* Western Peak */}
          <polygon points="17,14 4,39 30,39" fill={stroke} fillOpacity={fillOpacity} />
          <path d="M 17 14 L 18 39" />
          {/* Eastern Peak (Taller) */}
          <polygon points="32,8 18,39 44,39" fill={stroke} fillOpacity={fillOpacity * 1.2} />
          <path d="M 32 8 L 30 39" />
          <line x1="32" y1="22" x2="40" y2="29" strokeWidth={strokeWidth * 0.8} />
        </g>
      )

    case 'mountain-spire':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          {/* Left Needle */}
          <polygon points="12,12 7,40 17,40" fill={stroke} fillOpacity={fillOpacity} />
          {/* Center Pinnacle */}
          <polygon points="24,6 18,40 30,40" fill={stroke} fillOpacity={fillOpacity * 1.2} />
          <line x1="24" y1="6" x2="25" y2="40" />
          {/* Right Needle */}
          <polygon points="36,15 31,40 41,40" fill={stroke} fillOpacity={fillOpacity} />
        </g>
      )

    case 'mountain-snow':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="24,8 8,40 40,40" fill={stroke} fillOpacity={fillOpacity} />
          <path d="M 24 8 L 23 40" />
          {/* Snow Cap Polygon */}
          <polygon points="24,8 19,18 22,17 25,19 28,16 29,18" fill="#ffffff" fillOpacity="0.8" stroke={stroke} strokeWidth={strokeWidth * 0.8} />
        </g>
      )

    case 'mountain-range':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          {/* Left Peak */}
          <polygon points="12,18 2,40 22,40" fill={stroke} fillOpacity={fillOpacity} />
          {/* Center High Peak */}
          <polygon points="24,10 14,40 34,40" fill={stroke} fillOpacity={fillOpacity * 1.2} />
          {/* Right Peak */}
          <polygon points="36,16 26,40 46,40" fill={stroke} fillOpacity={fillOpacity} />
          <path d="M 24 10 L 25 40" />
        </g>
      )

    case 'hills-rolling':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth * 1.2} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Front Ridge */}
          <path d="M 6 36 Q 16 22, 26 36 Q 36 24, 44 36" fill={stroke} fillOpacity={fillOpacity * 0.7} />
          {/* Rear Mound */}
          <path d="M 18 24 Q 28 14, 38 24" />
        </g>
      )

    case 'hills-rugged':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          <path d="M 6 38 C 12 26, 20 26, 26 38" fill={stroke} fillOpacity={fillOpacity} />
          <path d="M 22 38 C 28 20, 38 20, 44 38" fill={stroke} fillOpacity={fillOpacity} />
          {/* Little rock tick marks */}
          <line x1="14" y1="30" x2="16" y2="33" />
          <line x1="32" y1="26" x2="35" y2="29" />
        </g>
      )

    case 'mesa-plateau':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          {/* Flat Top Surface */}
          <polygon points="12,18 36,18 42,38 6,38" fill={stroke} fillOpacity={fillOpacity} />
          <line x1="12" y1="18" x2="36" y2="18" strokeWidth={strokeWidth * 1.4} />
          {/* Stepped Strata Horizontal Lines */}
          <line x1="10" y1="25" x2="38" y2="25" strokeDasharray="3 2" />
          <line x1="8" y1="32" x2="40" y2="32" strokeDasharray="4 2" />
        </g>
      )

    case 'canyon-gorge':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Left Rim */}
          <path d="M 10 4 L 16 20 L 12 34 L 18 44" strokeWidth={strokeWidth * 1.3} />
          {/* Right Rim */}
          <path d="M 38 4 L 32 18 L 36 32 L 30 44" strokeWidth={strokeWidth * 1.3} />
          {/* Ravine Fissure Hatching */}
          <line x1="16" y1="20" x2="32" y2="18" opacity="0.4" />
          <line x1="12" y1="34" x2="36" y2="32" opacity="0.4" />
        </g>
      )

    case 'cliffs-escarpment':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Cliff Top Line */}
          <path d="M 4 20 Q 24 16, 44 20" strokeWidth={strokeWidth * 1.5} />
          {/* Vertical Drop Hatchings */}
          <line x1="8" y1="20" x2="8" y2="34" />
          <line x1="14" y1="19" x2="14" y2="37" />
          <line x1="20" y1="18" x2="20" y2="38" />
          <line x1="26" y1="18" x2="26" y2="35" />
          <line x1="32" y1="19" x2="32" y2="38" />
          <line x1="38" y1="20" x2="38" y2="33" />
        </g>
      )

    case 'badlands':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          <path d="M 6 36 L 12 28 L 18 36 L 24 24 L 30 36 L 36 26 L 42 36" />
          <path d="M 12 28 L 14 36 M 24 24 L 23 36 M 36 26 L 35 36" opacity="0.6" />
        </g>
      )

    case 'solitary-sentinel':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="24,6 10,40 38,40" fill={stroke} fillOpacity={fillOpacity * 1.3} strokeWidth={strokeWidth * 1.3} />
          <path d="M 24 6 L 22 40" strokeWidth={strokeWidth * 1.2} />
          {/* Horizontal Rock Bands */}
          <line x1="16" y1="24" x2="32" y2="24" strokeWidth={strokeWidth * 0.9} />
          <line x1="13" y1="32" x2="35" y2="32" strokeWidth={strokeWidth * 0.9} />
        </g>
      )

    // ==========================================
    // 2. WATER
    // ==========================================
    case 'river-winding':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth * 1.4} fill="none" opacity={opacity} strokeLinecap="round">
          <path d="M 24 2 Q 12 14, 32 26 T 18 46" />
          <path d="M 28 2 Q 16 14, 36 26 T 22 46" strokeWidth={strokeWidth * 0.8} opacity="0.5" />
        </g>
      )

    case 'river-fork':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth * 1.4} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Western Branch */}
          <path d="M 8 4 Q 16 18, 24 26" />
          {/* Eastern Branch */}
          <path d="M 40 4 Q 32 18, 24 26" />
          {/* Merged Trunk */}
          <path d="M 24 26 L 24 46" strokeWidth={strokeWidth * 1.8} />
        </g>
      )

    case 'river-delta':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Main inflow */}
          <line x1="24" y1="4" x2="24" y2="18" strokeWidth={strokeWidth * 1.6} />
          {/* Braided branches */}
          <path d="M 24 18 Q 14 30, 8 44" />
          <path d="M 24 18 Q 20 32, 18 44" />
          <path d="M 24 18 Q 28 32, 30 44" />
          <path d="M 24 18 Q 34 30, 40 44" />
        </g>
      )

    case 'lake-serene':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          <ellipse cx="24" cy="24" rx="16" ry="10" fill={stroke} fillOpacity={fillOpacity * 0.8} />
          {/* Ripples */}
          <path d="M 16 22 Q 20 20, 24 22 Q 28 24, 32 22" strokeWidth={strokeWidth * 0.8} />
          <path d="M 18 26 Q 22 28, 26 26" strokeWidth={strokeWidth * 0.8} />
        </g>
      )

    case 'lake-crater':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Outer Crater Rim */}
          <circle cx="24" cy="24" r="16" strokeDasharray="3 2" />
          {/* Water Surface */}
          <circle cx="24" cy="24" r="10" fill={stroke} fillOpacity={fillOpacity * 1.2} />
        </g>
      )

    case 'sea-bay':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Curved Coastal Embrace */}
          <path d="M 6 10 C 22 8, 38 18, 38 34 C 38 42, 28 44, 20 44" strokeWidth={strokeWidth * 1.5} />
          {/* Water Ripples */}
          <path d="M 14 26 Q 20 24, 26 26" />
          <path d="M 16 32 Q 22 30, 28 32" />
        </g>
      )

    case 'fjord-inlet':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Left Cliff Rim */}
          <path d="M 12 4 L 16 24 L 12 44" strokeWidth={strokeWidth * 1.4} />
          {/* Right Cliff Rim */}
          <path d="M 36 4 L 32 24 L 36 44" strokeWidth={strokeWidth * 1.4} />
          {/* Water Channel between */}
          <path d="M 24 4 L 24 44" strokeWidth={strokeWidth * 1.2} fill="none" opacity="0.6" strokeDasharray="4 2" />
        </g>
      )

    case 'waterfall-cataract':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Top Ledge */}
          <line x1="8" y1="12" x2="40" y2="12" strokeWidth={strokeWidth * 1.5} />
          {/* Falling Water Streaks */}
          <line x1="14" y1="12" x2="14" y2="34" />
          <line x1="20" y1="12" x2="20" y2="36" />
          <line x1="24" y1="12" x2="24" y2="36" />
          <line x1="28" y1="12" x2="28" y2="36" />
          <line x1="34" y1="12" x2="34" y2="34" />
          {/* Bottom Spray Waves */}
          <path d="M 10 38 Q 16 34, 24 38 Q 32 42, 38 38" />
        </g>
      )

    case 'swamp-marsh':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Horizontal Water Lines */}
          <line x1="6" y1="34" x2="22" y2="34" />
          <line x1="26" y1="38" x2="42" y2="38" />
          {/* Reeds */}
          <path d="M 12 34 L 11 18 M 14 34 L 16 16 M 17 34 L 20 20" />
          <path d="M 30 38 L 29 22 M 32 38 L 34 20" />
        </g>
      )

    case 'hot-springs':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Mineral Basin */}
          <ellipse cx="24" cy="30" rx="14" ry="7" fill={stroke} fillOpacity={fillOpacity} />
          {/* Rising Steam Wisps */}
          <path d="M 18 24 Q 16 16, 20 10" />
          <path d="M 24 23 Q 26 15, 23 8" />
          <path d="M 30 24 Q 32 16, 28 10" />
        </g>
      )

    case 'barrier-reef':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Arc of coral dots */}
          <path d="M 6 36 Q 24 16, 42 36" strokeDasharray="2 3" strokeWidth={strokeWidth * 1.5} />
          <path d="M 12 32 Q 24 20, 36 32" opacity="0.4" />
        </g>
      )

    case 'oasis-spring':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Water Basin */}
          <ellipse cx="20" cy="34" rx="12" ry="6" fill={stroke} fillOpacity={fillOpacity * 1.2} />
          {/* Palm Trunk */}
          <path d="M 30 36 Q 34 24, 28 14" strokeWidth={strokeWidth * 1.2} />
          {/* Palm Fronds */}
          <path d="M 28 14 Q 20 10, 18 16" />
          <path d="M 28 14 Q 26 6, 30 6" />
          <path d="M 28 14 Q 36 10, 38 18" />
        </g>
      )

    // ==========================================
    // 3. PLANT / FLORA
    // ==========================================
    case 'forest-deciduous':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          {/* Left Tree */}
          <path d="M 14 38 L 14 30" />
          <path d="M 8 30 C 6 24, 12 18, 16 20 C 18 16, 24 18, 22 24 C 24 28, 18 32, 14 30 Z" fill={stroke} fillOpacity={fillOpacity} />
          {/* Right Tree */}
          <path d="M 32 38 L 32 26" />
          <path d="M 24 26 C 22 18, 30 12, 36 16 C 40 12, 46 18, 42 24 C 44 28, 38 30, 32 26 Z" fill={stroke} fillOpacity={fillOpacity} />
        </g>
      )

    case 'forest-taiga':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          {/* Left Pine */}
          <polygon points="14,14 6,38 22,38" fill={stroke} fillOpacity={fillOpacity} />
          <line x1="14" y1="14" x2="14" y2="42" />
          {/* Center Pine (Tall) */}
          <polygon points="26,8 16,36 36,36" fill={stroke} fillOpacity={fillOpacity * 1.2} />
          <line x1="26" y1="8" x2="26" y2="42" />
          {/* Right Pine */}
          <polygon points="36,18 28,40 44,40" fill={stroke} fillOpacity={fillOpacity} />
          <line x1="36" y1="18" x2="36" y2="42" />
        </g>
      )

    case 'forest-redwood':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Huge Trunks */}
          <rect x="12" y="16" width="6" height="24" fill={stroke} fillOpacity={fillOpacity} />
          <rect x="28" y="10" width="8" height="30" fill={stroke} fillOpacity={fillOpacity * 1.2} />
          {/* High Top Tuft */}
          <polygon points="15,8 8,16 22,16" fill={stroke} fillOpacity={fillOpacity} />
          <polygon points="32,4 22,12 42,12" fill={stroke} fillOpacity={fillOpacity} />
        </g>
      )

    case 'forest-jungle':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Overlapping Multi-Canopy */}
          <circle cx="18" cy="22" r="10" fill={stroke} fillOpacity={fillOpacity} />
          <circle cx="30" cy="18" r="12" fill={stroke} fillOpacity={fillOpacity * 1.2} />
          <circle cx="34" cy="28" r="8" fill={stroke} fillOpacity={fillOpacity} />
          {/* Vines */}
          <path d="M 14 32 Q 20 38, 26 34 Q 32 38, 38 32" strokeWidth={strokeWidth * 0.8} />
        </g>
      )

    case 'forest-deadwood':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Main Gnarled Trunk */}
          <path d="M 22 40 L 22 22 L 14 12" />
          <path d="M 22 22 L 32 14" />
          <path d="M 22 28 L 30 26 L 36 20" />
          <path d="M 18 17 L 12 20" />
        </g>
      )

    case 'forest-birch':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Slender Trunks */}
          <line x1="16" y1="14" x2="16" y2="40" strokeWidth={strokeWidth * 1.2} />
          <line x1="28" y1="10" x2="28" y2="40" strokeWidth={strokeWidth * 1.2} />
          <line x1="36" y1="16" x2="36" y2="40" strokeWidth={strokeWidth * 1.2} />
          {/* Bark Notches */}
          <line x1="14" y1="24" x2="18" y2="24" strokeWidth={strokeWidth * 0.8} />
          <line x1="26" y1="20" x2="30" y2="20" strokeWidth={strokeWidth * 0.8} />
          <line x1="26" y1="30" x2="30" y2="30" strokeWidth={strokeWidth * 0.8} />
          {/* Sparse Leaves */}
          <ellipse cx="28" cy="8" rx="7" ry="4" fill={stroke} fillOpacity={fillOpacity} />
        </g>
      )

    case 'forest-bayou':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Willow Trunk */}
          <path d="M 24 40 L 24 20 Q 14 14, 10 24" />
          <path d="M 24 20 Q 34 14, 38 24" />
          {/* Drooping Moss Tendrils */}
          <path d="M 10 24 L 10 36 M 14 20 L 14 34 M 34 20 L 34 34 M 38 24 L 38 36" strokeDasharray="2 2" />
        </g>
      )

    case 'forest-fungal':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Large Mushroom */}
          <path d="M 20 40 L 20 24" strokeWidth={strokeWidth * 1.4} />
          <path d="M 8 24 C 8 10, 32 10, 32 24 Z" fill={stroke} fillOpacity={fillOpacity} />
          {/* Small Mushroom */}
          <path d="M 34 40 L 34 28" strokeWidth={strokeWidth * 1.2} />
          <path d="M 26 28 C 26 18, 42 18, 42 28 Z" fill={stroke} fillOpacity={fillOpacity} />
        </g>
      )

    case 'briar-thorns':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Tangled Briar Loops */}
          <path d="M 8 36 Q 18 16, 28 32 Q 38 18, 42 34" strokeWidth={strokeWidth * 1.2} />
          {/* Thorns */}
          <line x1="14" y1="24" x2="11" y2="20" />
          <line x1="22" y1="25" x2="25" y2="20" />
          <line x1="34" y1="24" x2="36" y2="19" />
        </g>
      )

    case 'sacred-grove':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Massive Trunk */}
          <path d="M 18 40 L 22 24 L 14 16" strokeWidth={strokeWidth * 1.4} />
          <path d="M 22 24 L 32 16" strokeWidth={strokeWidth * 1.4} />
          <path d="M 26 40 L 22 24" strokeWidth={strokeWidth * 1.4} />
          {/* Spiral Sacred Canopy */}
          <circle cx="23" cy="14" r="11" strokeDasharray="3 2" fill={stroke} fillOpacity={fillOpacity * 0.7} />
          <circle cx="23" cy="14" r="5" strokeWidth={strokeWidth * 0.8} />
        </g>
      )

    case 'scrubland':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Clump 1 */}
          <path d="M 8 38 L 12 30 L 16 38 M 12 30 L 12 38" />
          {/* Clump 2 */}
          <path d="M 26 36 L 30 26 L 34 36 M 30 26 L 30 36" />
        </g>
      )

    case 'grass-savanna':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          <path d="M 10 38 Q 8 26, 6 22 M 12 38 Q 12 24, 14 18 M 14 38 Q 16 26, 20 22" />
          <path d="M 28 38 Q 26 26, 24 20 M 30 38 Q 30 22, 32 16 M 32 38 Q 34 26, 38 22" />
        </g>
      )

    // ==========================================
    // 4. FEATURE / LANDFORM
    // ==========================================
    case 'volcano-active':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          {/* Cone with Crater */}
          <polygon points="20,18 6,40 42,40 28,18" fill={stroke} fillOpacity={fillOpacity} />
          {/* Crater rim */}
          <line x1="20" y1="18" x2="28" y2="18" strokeWidth={strokeWidth * 1.5} />
          {/* Smoke Cloud */}
          <path d="M 22 16 Q 16 10, 24 6 Q 32 8, 26 16" strokeDasharray="2 2" fill="#ef4444" fillOpacity="0.3" />
        </g>
      )

    case 'chasm-abyss':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Black Fissure Polygon */}
          <polygon points="8,4 20,24 16,44 28,44 26,24 40,4" fill={stroke} fillOpacity={fillOpacity * 2} />
          <path d="M 8 4 L 20 24 L 16 44" strokeWidth={strokeWidth * 1.5} />
          <path d="M 40 4 L 26 24 L 28 44" strokeWidth={strokeWidth * 1.5} />
        </g>
      )

    case 'dunes-desert':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth * 1.2} fill="none" opacity={opacity} strokeLinecap="round">
          <path d="M 6 18 Q 18 10, 30 18 Q 38 22, 44 18" />
          <path d="M 4 30 Q 16 22, 28 30 Q 36 34, 42 30" />
        </g>
      )

    case 'cave-maw':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Rocky Outcrop */}
          <path d="M 8 38 C 8 18, 40 18, 40 38" strokeWidth={strokeWidth * 1.4} />
          {/* Dark Entrance Cave */}
          <path d="M 16 38 C 16 26, 32 26, 32 38 Z" fill={stroke} fillOpacity={fillOpacity * 2.5} />
        </g>
      )

    case 'crater-impact':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Rim */}
          <circle cx="24" cy="24" r="14" strokeWidth={strokeWidth * 1.3} fill={stroke} fillOpacity={fillOpacity * 0.6} />
          {/* Center Peak */}
          <circle cx="24" cy="24" r="3" fill={stroke} />
          {/* Radial Rays */}
          <line x1="10" y1="24" x2="4" y2="24" strokeDasharray="2 2" />
          <line x1="38" y1="24" x2="44" y2="24" strokeDasharray="2 2" />
          <line x1="24" y1="10" x2="24" y2="4" strokeDasharray="2 2" />
          <line x1="24" y1="38" x2="24" y2="44" strokeDasharray="2 2" />
        </g>
      )

    case 'geyser-field':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Base Pool */}
          <ellipse cx="24" cy="38" rx="14" ry="4" fill={stroke} fillOpacity={fillOpacity} />
          {/* Erupting Jet */}
          <path d="M 22 38 L 22 12 Q 24 6, 26 12 L 26 38" strokeWidth={strokeWidth * 1.2} />
          {/* Spray Droplets */}
          <path d="M 16 14 Q 24 8, 32 14" strokeDasharray="2 2" />
        </g>
      )

    case 'megalith-ring':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          {/* Central Dolmen (Trilithon) */}
          <rect x="18" y="18" width="4" height="18" fill={stroke} />
          <rect x="26" y="18" width="4" height="18" fill={stroke} />
          <rect x="16" y="14" width="16" height="4" fill={stroke} />
          {/* Outer Standing Stones */}
          <rect x="8" y="24" width="3" height="12" fill={stroke} />
          <rect x="37" y="24" width="3" height="12" fill={stroke} />
        </g>
      )

    case 'titan-ribs':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth * 1.3} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Arching Ribs */}
          <path d="M 8 38 C 10 16, 22 16, 24 38" />
          <path d="M 18 38 C 20 12, 32 12, 34 38" />
          <path d="M 28 38 C 30 18, 40 18, 42 38" />
        </g>
      )

    case 'salt-flats':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth * 0.9} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Cracked Hexagons */}
          <polygon points="16,14 24,10 32,14 32,22 24,26 16,22" />
          <polygon points="24,26 32,22 40,26 40,34 32,38 24,34" />
          <polygon points="8,26 16,22 24,26 24,34 16,38 8,34" />
        </g>
      )

    case 'arch-rock':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Outer Rock Bridge */}
          <path d="M 8 38 L 8 20 C 8 8, 40 8, 40 20 L 40 38" strokeWidth={strokeWidth * 1.5} />
          {/* Inner Arch Cutout */}
          <path d="M 16 38 L 16 24 C 16 16, 32 16, 32 24 L 32 38 Z" fill={stroke} fillOpacity={fillOpacity} />
        </g>
      )

    case 'glacier-crevasse':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          {/* Ice Blocks */}
          <polygon points="6,36 14,16 26,22 22,38" fill={stroke} fillOpacity={fillOpacity} />
          <polygon points="26,38 26,14 42,20 38,38" fill={stroke} fillOpacity={fillOpacity * 1.2} />
          {/* Deep Crevasse Line */}
          <path d="M 24 10 L 26 38" strokeWidth={strokeWidth * 1.4} stroke="#0284c7" />
        </g>
      )

    case 'maelstrom-whirlpool':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth * 1.2} fill="none" opacity={opacity} strokeLinecap="round">
          {/* Inward Swirling Spiral */}
          <path d="M 24 24 A 4 4 0 0 1 20 20 A 8 8 0 0 1 28 16 A 12 12 0 0 1 36 28 A 16 16 0 0 1 12 36 A 20 20 0 0 1 4 20" />
        </g>
      )

    default:
      return null
  }
}

/**
 * Resolves the effective whiteboard / cartographic symbol for a tile.
 * Prioritizes explicit `cartographicSymbol`, then maps relief, flora, and overlay fallbacks.
 */
export function resolveCartographicSymbol(tile: {
  cartographicSymbol?: string
  relief?: string
  flora?: string
  terrain?: string
  overlay?: string
}): string | null {
  if (tile.cartographicSymbol && findSymbolById(tile.cartographicSymbol)) {
    return tile.cartographicSymbol
  }
  if (tile.relief === 'mountain') return 'mountain-peak'
  if (tile.relief === 'mountain-snow') return 'mountain-snow'
  if (tile.relief === 'mountain-range') return 'mountain-range'
  if (tile.relief === 'mesa') return 'mesa-plateau'
  if (tile.relief === 'crag') return 'mountain-spire'
  if (tile.relief === 'canyon') return 'canyon-gorge'
  if (tile.relief === 'volcano') return 'volcano-active'
  if (tile.relief === 'hills') return 'hills-rolling'
  if (tile.flora === 'forest') return 'forest-deciduous'
  if (tile.flora === 'jungle') return 'forest-jungle'
  if (tile.overlay === 'cave') return 'cave-maw'
  if (tile.overlay === 'ruins') return 'megalith-ring'
  if (tile.overlay === 'myth') return 'sacred-grove'
  if (tile.terrain === 'mountain') return 'mountain-peak'
  return null
}

