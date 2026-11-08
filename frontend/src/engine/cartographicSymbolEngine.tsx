import React from 'react'

export type CartographicCategory = 'earth' | 'water' | 'plant' | 'feature'

export interface CartographicSymbolMeta {
  id: string
  name: string
  concept: string
  conceptLabel: string
  variantName: string
  category: CartographicCategory
  icon: string
  description: string
  tags: string[]
}

export const CARTOGRAPHIC_SYMBOLS: CartographicSymbolMeta[] = [
  {
    id: 'mountain-peak',
    name: 'Mountain Peak',
    concept: 'mountain',
    conceptLabel: 'Mountains',
    variantName: 'Single Peak',
    category: 'earth',
    icon: '⛰️',
    description: "Classic solitary triangular peak with center ridge and shaded slope.",
    tags: ["mountain","peak","elevation","highland"],
  },
  {
    id: 'mountain-twin',
    name: 'Twin Horn Peaks',
    concept: 'mountain',
    conceptLabel: 'Mountains',
    variantName: 'Twin Horns',
    category: 'earth',
    icon: '🏔️',
    description: "Dual companion summits rising side-by-side with central col pass.",
    tags: ["mountain","twin","horns","pass"],
  },
  {
    id: 'mountain-spire',
    name: 'Jagged Needle Spires',
    concept: 'mountain',
    conceptLabel: 'Mountains',
    variantName: 'Needle Spires',
    category: 'earth',
    icon: '🗡️',
    description: "Sharp, sheer karst pinnacles and needle-like rocky crags.",
    tags: ["mountain","crag","spire","needle"],
  },
  {
    id: 'mountain-snow',
    name: 'Snow-Capped Massif',
    concept: 'mountain',
    conceptLabel: 'Mountains',
    variantName: 'Snow Massif',
    category: 'earth',
    icon: '❄️',
    description: "Glaciated alpine summit with perpetual snowfields.",
    tags: ["mountain","snow","glacier","alpine"],
  },
  {
    id: 'mountain-range',
    name: 'Mountain Range Spine',
    concept: 'mountain',
    conceptLabel: 'Mountains',
    variantName: 'Continuous Spine',
    category: 'earth',
    icon: '⛰️⛰️',
    description: "Continuous three-peak ridge forming a continental divide.",
    tags: ["mountain","range","spine","ridge"],
  },
  {
    id: 'hill-rolling',
    name: 'Rolling Low Hills',
    concept: 'hill',
    conceptLabel: 'Hills',
    variantName: 'Rolling Low Hills',
    category: 'earth',
    icon: '🌱',
    description: "Gentle, rounded low grassy mounds and undulating rises.",
    tags: ["hills","rolling","lowlands","mounds"],
  },
  {
    id: 'hill-knolls',
    name: 'Triple Rounded Knolls',
    concept: 'hill',
    conceptLabel: 'Hills',
    variantName: 'Triple Knolls',
    category: 'earth',
    icon: '🟢',
    description: "Cluster of three distinct rounded hillocks and knolls.",
    tags: ["hills","knolls","hillocks","rolling"],
  },
  {
    id: 'hill-rocky',
    name: 'Rocky Scree Hills',
    concept: 'hill',
    conceptLabel: 'Hills',
    variantName: 'Rocky Scree',
    category: 'earth',
    icon: '🪨',
    description: "Rugged hillocks with exposed boulder outcrops and scree slopes.",
    tags: ["hills","rocky","scree","boulder"],
  },
  {
    id: 'hill-low',
    name: 'Low Undulating Mounds',
    concept: 'hill',
    conceptLabel: 'Hills',
    variantName: 'Low Mounds',
    category: 'earth',
    icon: '〰️',
    description: "Subtle wave-like grassy crests rising above the plains.",
    tags: ["hills","low","undulating","plains"],
  },
  {
    id: 'canyon-gorge',
    name: 'Deep Canyon Gorge',
    concept: 'canyon',
    conceptLabel: 'Canyons & Cliffs',
    variantName: 'Canyon Gorge',
    category: 'earth',
    icon: '🏜️',
    description: "Sheer vertical rock rift sliced deep through the plateau.",
    tags: ["canyon","gorge","chasm","rift"],
  },
  {
    id: 'cliff-sheer',
    name: 'Sheer Escarpment Wall',
    concept: 'canyon',
    conceptLabel: 'Canyons & Cliffs',
    variantName: 'Sheer Escarpment',
    category: 'earth',
    icon: '🧗',
    description: "Imposing vertical cliff wall dropping off from high tableland.",
    tags: ["cliff","escarpment","bluff","drop"],
  },
  {
    id: 'cliff-coastal',
    name: 'Coastal Sea Cliffs',
    concept: 'canyon',
    conceptLabel: 'Canyons & Cliffs',
    variantName: 'Coastal Cliffs',
    category: 'earth',
    icon: '🌊🧗',
    description: "Craggy sea cliff bluff meeting coastal breaker waves below.",
    tags: ["cliff","coastal","sea","ocean"],
  },
  {
    id: 'mesa-plateau',
    name: 'Flat-Topped Mesa Bluff',
    concept: 'canyon',
    conceptLabel: 'Canyons & Cliffs',
    variantName: 'Flat Mesa Bluff',
    category: 'earth',
    icon: '🟫',
    description: "Elevated flat tableland flanked by steep, stepped rock slopes.",
    tags: ["mesa","plateau","tableland","bluff"],
  },
  {
    id: 'badland-buttes',
    name: 'Stepped Badland Buttes',
    concept: 'canyon',
    conceptLabel: 'Canyons & Cliffs',
    variantName: 'Badland Buttes',
    category: 'earth',
    icon: '🏜️',
    description: "Arid, wind-carved sedimentary towers, chimneys, and coulees.",
    tags: ["badlands","buttes","arid","erosion"],
  },
  {
    id: 'desert-dunes',
    name: 'Crescent Sand Dunes',
    concept: 'desert',
    conceptLabel: 'Deserts',
    variantName: 'Crescent Dunes',
    category: 'earth',
    icon: '🐪',
    description: "Sweeping barchan crescent dunes sculpted by desert trade winds.",
    tags: ["desert","dunes","sand","arid","barchan"],
  },
  {
    id: 'desert-erg',
    name: 'Rippling Sand Sea Erg',
    concept: 'desert',
    conceptLabel: 'Deserts',
    variantName: 'Sand Sea Erg',
    category: 'earth',
    icon: '⏳',
    description: "Endless horizon of overlapping wave-like sand ripple crests.",
    tags: ["desert","erg","sand","ripples"],
  },
  {
    id: 'desert-rocky',
    name: 'Rocky Reg Pavement',
    concept: 'desert',
    conceptLabel: 'Deserts',
    variantName: 'Rocky Reg Pavement',
    category: 'earth',
    icon: '🪨🏜️',
    description: "Stoney desert pavement studded with wind-polished ventifacts.",
    tags: ["desert","reg","stoney","pavement","gravel"],
  },
  {
    id: 'desert-cracked',
    name: 'Sun-Cracked Arid Flats',
    concept: 'desert',
    conceptLabel: 'Deserts',
    variantName: 'Sun-Cracked Flats',
    category: 'earth',
    icon: '☀️',
    description: "Parched, desiccated clay pan etched with polygonal fissure fractures.",
    tags: ["desert","cracked","arid","mud","parched"],
  },
  {
    id: 'cave-maw',
    name: 'Subterranean Cave Maw',
    concept: 'cave',
    conceptLabel: 'Caves',
    variantName: 'Cavern Maw',
    category: 'earth',
    icon: '🕳️',
    description: "Dark, yawning entrance leading into subterranean depths.",
    tags: ["cave","maw","subterranean","entrance","dungeon"],
  },
  {
    id: 'cave-cliff',
    name: 'Cliffside Grotto Mouth',
    concept: 'cave',
    conceptLabel: 'Caves',
    variantName: 'Cliff Grotto',
    category: 'earth',
    icon: '🧗🕳️',
    description: "Hidden cavern opening embedded into an impassable rock escarpment.",
    tags: ["cave","cliff","grotto","escarpment"],
  },
  {
    id: 'cave-sinkhole',
    name: 'Collapsed Pit Cenote',
    concept: 'cave',
    conceptLabel: 'Caves',
    variantName: 'Pit Cenote',
    category: 'earth',
    icon: '⭕',
    description: "Sudden vertical collapse opening downward into a subterranean chasm.",
    tags: ["cave","sinkhole","cenote","pit","chasm"],
  },
  {
    id: 'volcano-active',
    name: 'Active Erupting Volcano',
    concept: 'volcano',
    conceptLabel: 'Volcanoes',
    variantName: 'Active Erupting',
    category: 'earth',
    icon: '🌋',
    description: "Steep volcanic cone venting ash plumes and molten lava bombs.",
    tags: ["volcano","lava","magma","eruption","caldera"],
  },
  {
    id: 'volcano-caldera',
    name: 'Collapsed Volcanic Caldera',
    concept: 'volcano',
    conceptLabel: 'Volcanoes',
    variantName: 'Collapsed Caldera',
    category: 'earth',
    icon: '🌋⭕',
    description: "Ancient mega-caldera crater rim cradling a sunken steaming caldera floor.",
    tags: ["volcano","caldera","crater","basin"],
  },
  {
    id: 'river-meander',
    name: 'Meandering River Channel',
    concept: 'river',
    conceptLabel: 'Rivers',
    variantName: 'Meandering River',
    category: 'water',
    icon: '🌊',
    description: "Winding, natural S-curve river channel traversing lowlands.",
    tags: ["river","water","meander","flow"],
  },
  {
    id: 'river-braided',
    name: 'Braided Gravel River',
    concept: 'river',
    conceptLabel: 'Rivers',
    variantName: 'Braided River',
    category: 'water',
    icon: '🔀',
    description: "Network of interweaving alluvial river channels weaving between gravel bars.",
    tags: ["river","braided","gravel","alluvial"],
  },
  {
    id: 'river-delta',
    name: 'Braided River Delta',
    concept: 'river',
    conceptLabel: 'Rivers',
    variantName: 'River Delta',
    category: 'water',
    icon: '🔱',
    description: "Branching distributary fan depositing silt into the sea.",
    tags: ["river","delta","estuary","mouth"],
  },
  {
    id: 'river-rapids',
    name: 'Whitewater River Rapids',
    concept: 'river',
    conceptLabel: 'Rivers',
    variantName: 'River Rapids',
    category: 'water',
    icon: '⚡🌊',
    description: "Turbulent mountain torrent churning through boulder chutes.",
    tags: ["river","rapids","whitewater","torrent"],
  },
  {
    id: 'waterfall-cataract',
    name: 'Roaring Cataract Waterfall',
    concept: 'waterfall',
    conceptLabel: 'Waterfalls',
    variantName: 'High Cataract',
    category: 'water',
    icon: '💧',
    description: "Sheer cliff plunge where river cascades into a mist-shrouded gorge.",
    tags: ["waterfall","cataract","plunge","cliff"],
  },
  {
    id: 'waterfall-cascades',
    name: 'Stepped Tiered Cascades',
    concept: 'waterfall',
    conceptLabel: 'Waterfalls',
    variantName: 'Tiered Cascades',
    category: 'water',
    icon: '🪜💧',
    description: "Series of descending rock steps and natural stone shelves.",
    tags: ["waterfall","cascades","stepped","shelves"],
  },
  {
    id: 'waterfall-gorge',
    name: 'Canyon Plunge Waterfall',
    concept: 'waterfall',
    conceptLabel: 'Waterfalls',
    variantName: 'Canyon Plunge',
    category: 'water',
    icon: '🏞️💧',
    description: "Massive plume of water trapped between high rock canyon cliffs.",
    tags: ["waterfall","canyon","gorge","plunge"],
  },
  {
    id: 'lake-basin',
    name: 'Freshwater Lake Basin',
    concept: 'lake',
    conceptLabel: 'Lakes',
    variantName: 'Lake Basin',
    category: 'water',
    icon: '🏞️',
    description: "Broad inland freshwater body cradled by surrounding shores.",
    tags: ["lake","basin","freshwater","inland"],
  },
  {
    id: 'lake-tarn',
    name: 'Alpine Mountain Tarn',
    concept: 'lake',
    conceptLabel: 'Lakes',
    variantName: 'Alpine Tarn',
    category: 'water',
    icon: '🏔️💧',
    description: "High-altitude crystalline glacial tarn nested below mountain peaks.",
    tags: ["lake","tarn","alpine","glacial","mountain"],
  },
  {
    id: 'lake-oxbow',
    name: 'Crescent Oxbow Lake',
    concept: 'lake',
    conceptLabel: 'Lakes',
    variantName: 'Oxbow Lake',
    category: 'water',
    icon: '🌙',
    description: "Curving u-shaped lake formed when a river meander loop is cut off.",
    tags: ["lake","oxbow","crescent","river"],
  },
  {
    id: 'lake-crater',
    name: 'Volcanic Crater Lake',
    concept: 'lake',
    conceptLabel: 'Lakes',
    variantName: 'Crater Lake',
    category: 'water',
    icon: '🌋💧',
    description: "Round, fathomless deep sapphire lake resting inside an extinct caldera.",
    tags: ["lake","crater","caldera","deep"],
  },
  {
    id: 'swamp-mangrove',
    name: 'Mangrove Stilt Swamp',
    concept: 'swamp',
    conceptLabel: 'Swamps & Marshes',
    variantName: 'Mangrove Swamp',
    category: 'water',
    icon: '🌿',
    description: "Tangled network of aerial stilt roots rising from brackish coastal waters.",
    tags: ["swamp","mangrove","brackish","roots"],
  },
  {
    id: 'swamp-peat',
    name: 'Peat Moss Bog',
    concept: 'swamp',
    conceptLabel: 'Swamps & Marshes',
    variantName: 'Peat Bog',
    category: 'water',
    icon: '🪵',
    description: "Waterlogged, acidic wetland formed of decaying moss hummocks.",
    tags: ["bog","peat","wetland","mire","moss"],
  },
  {
    id: 'marsh-reeds',
    name: 'Reed & Cattail Marsh',
    concept: 'swamp',
    conceptLabel: 'Swamps & Marshes',
    variantName: 'Reed Marsh',
    category: 'water',
    icon: '🌾',
    description: "Flooded riparian marshland bristling with tall reed stalks and cattails.",
    tags: ["marsh","reeds","cattails","riparian"],
  },
  {
    id: 'marsh-fen',
    name: 'Flooded Grassy Fen',
    concept: 'swamp',
    conceptLabel: 'Swamps & Marshes',
    variantName: 'Grassy Fen',
    category: 'water',
    icon: '🌱💧',
    description: "Alkaline mineral-rich wetland covered in sedges, rushes, and slow streams.",
    tags: ["marsh","fen","sedges","wetland"],
  },
  {
    id: 'tidal-pools',
    name: 'Rocky Shore Tidal Pools',
    concept: 'tidal-pool',
    conceptLabel: 'Tidal Pools & Coast',
    variantName: 'Tidal Pools',
    category: 'water',
    icon: '🦀',
    description: "Intertidal marine basins carved into coastal granite rock ledges.",
    tags: ["tidal","pools","intertidal","coast","marine"],
  },
  {
    id: 'estuary-bay',
    name: 'Coastal Estuary Bay',
    concept: 'tidal-pool',
    conceptLabel: 'Tidal Pools & Coast',
    variantName: 'Estuary Bay',
    category: 'water',
    icon: '⚓',
    description: "Sheltered coastal bay where ocean tides merge with river outflows.",
    tags: ["estuary","bay","coast","harbor"],
  },
  {
    id: 'atoll-reef',
    name: 'Coral Reef Atoll',
    concept: 'tidal-pool',
    conceptLabel: 'Tidal Pools & Coast',
    variantName: 'Coral Atoll',
    category: 'water',
    icon: '🪸',
    description: "Circular ring of living coral surrounding a central turquoise lagoon.",
    tags: ["atoll","coral","reef","lagoon","island"],
  },
  {
    id: 'fjord-sheer',
    name: 'Glacial Sheer Fjord',
    concept: 'tidal-pool',
    conceptLabel: 'Tidal Pools & Coast',
    variantName: 'Glacial Fjord',
    category: 'water',
    icon: '🛶',
    description: "Narrow, fathomless sea inlet framed by immense vertical mountain cliffs.",
    tags: ["fjord","glacial","inlet","cliffs"],
  },
  {
    id: 'glacier-valley',
    name: 'Alpine Valley Glacier',
    concept: 'glacier',
    conceptLabel: 'Glaciers & Ice',
    variantName: 'Valley Glacier',
    category: 'water',
    icon: '🧊🏔️',
    description: "Massive frozen river of ice grinding downward through an alpine cirque.",
    tags: ["glacier","ice","valley","cirque","alpine"],
  },
  {
    id: 'glacier-crevasse',
    name: 'Crevassed Icefield',
    concept: 'glacier',
    conceptLabel: 'Glaciers & Ice',
    variantName: 'Crevassed Icefield',
    category: 'water',
    icon: '🧊',
    description: "Vast polar ice sheet split by treacherous deep crevasses.",
    tags: ["glacier","crevasse","ice","polar"],
  },
  {
    id: 'glacier-shelf',
    name: 'Coastal Ice Shelf',
    concept: 'glacier',
    conceptLabel: 'Glaciers & Ice',
    variantName: 'Ice Shelf',
    category: 'water',
    icon: '🧊🌊',
    description: "Floating permanent ice barrier calving icebergs into the sea.",
    tags: ["glacier","shelf","iceberg","polar","coast"],
  },
  {
    id: 'maelstrom-whirlpool',
    name: 'Oceanic Maelstrom Vortex',
    concept: 'maelstrom',
    conceptLabel: 'Maelstroms & Currents',
    variantName: 'Oceanic Maelstrom',
    category: 'water',
    icon: '🌀',
    description: "Terrifying oceanic whirlpool swallowing currents into the sea.",
    tags: ["maelstrom","whirlpool","vortex","ocean"],
  },
  {
    id: 'tidal-rip',
    name: 'Coastal Rip Tide & Breakers',
    concept: 'maelstrom',
    conceptLabel: 'Maelstroms & Currents',
    variantName: 'Rip Tide & Breakers',
    category: 'water',
    icon: '🌊🌀',
    description: "Treacherous offshore surge currents dragging waters outward.",
    tags: ["tide","rip","current","breakers"],
  },
  {
    id: 'spring-headwater',
    name: 'Natural Spring Headwaters',
    concept: 'river',
    conceptLabel: 'Rivers & Springs',
    variantName: 'Headwater Spring',
    category: 'water',
    icon: '⛲',
    description: "Pure subterranean aquifer bubbling to the surface at the foot of mountain slopes.",
    tags: ["spring","headwater","aquifer","pure"],
  },
  {
    id: 'hotspring-geothermal',
    name: 'Geothermal Mineral Hot Spring',
    concept: 'geyser',
    conceptLabel: 'Geysers & Thermal',
    variantName: 'Mineral Hot Spring',
    category: 'water',
    icon: '♨️',
    description: "Steaming mineral-rich volcanic pool heated by subterranean magma chambers.",
    tags: ["hotspring","geothermal","steam","volcanic"],
  },
  {
    id: 'trench-abyssal',
    name: 'Abyssal Sunken Trench',
    concept: 'tidal-pool',
    conceptLabel: 'Tidal Pools & Coast',
    variantName: 'Abyssal Trench',
    category: 'water',
    icon: '🕳️🌊',
    description: "Dark, fathomless underwater canyon plunging miles below the ocean floor.",
    tags: ["trench","abyss","deep","ocean","trench"],
  },
  {
    id: 'forest-deciduous',
    name: 'Broadleaf Deciduous Forest',
    concept: 'forest',
    conceptLabel: 'Forests',
    variantName: 'Broadleaf Deciduous',
    category: 'plant',
    icon: '🌳',
    description: "Lush woodland of ancient oak, beech, and maple canopies.",
    tags: ["forest","deciduous","trees","woods","oak"],
  },
  {
    id: 'forest-taiga',
    name: 'Pine & Fir Taiga',
    concept: 'forest',
    conceptLabel: 'Forests',
    variantName: 'Pine & Fir Taiga',
    category: 'plant',
    icon: '🌲',
    description: "Dense evergreen needle forest with conical spruce and fir trees.",
    tags: ["taiga","pine","fir","evergreen"],
  },
  {
    id: 'forest-redwood',
    name: 'Colossal Redwood Grove',
    concept: 'forest',
    conceptLabel: 'Forests',
    variantName: 'Colossal Redwoods',
    category: 'plant',
    icon: '🌲🌲',
    description: "Cathedral-like grove of ancient, sky-piercing colossal sequoias.",
    tags: ["redwood","sequoia","colossal","primeval"],
  },
  {
    id: 'forest-sparse',
    name: 'Open Scattered Woodland',
    concept: 'forest',
    conceptLabel: 'Forests',
    variantName: 'Scattered Woodland',
    category: 'plant',
    icon: '🌳🌾',
    description: "Sun-dappled open woodland with widely spaced mature trees.",
    tags: ["forest","sparse","woodland","trees","open"],
  },
  {
    id: 'forest-dead',
    name: 'Gnarled Dead Wood',
    concept: 'forest',
    conceptLabel: 'Forests',
    variantName: 'Gnarled Dead Wood',
    category: 'plant',
    icon: '🪵💀',
    description: "Bleached, leafless ghost forest of skeletal dead tree snags.",
    tags: ["forest","dead","ghost","skeletal","cursed"],
  },
  {
    id: 'jungle-dense',
    name: 'Dense Tropical Jungle Canopy',
    concept: 'jungle',
    conceptLabel: 'Jungles & Rainforests',
    variantName: 'Dense Jungle Canopy',
    category: 'plant',
    icon: '🌴',
    description: "Impenetrable tropical jungle thicket swollen with humidity and beasts.",
    tags: ["jungle","dense","tropical","canopy"],
  },
  {
    id: 'rainforest-canopy',
    name: 'Emergent Rainforest Canopy',
    concept: 'jungle',
    conceptLabel: 'Jungles & Rainforests',
    variantName: 'Emergent Rainforest',
    category: 'plant',
    icon: '🌧️🌳',
    description: "Giant umbrella-like emergent tree rising high above the rain clouds.",
    tags: ["rainforest","canopy","emergent","tropical"],
  },
  {
    id: 'jungle-palms',
    name: 'Tropical Palm Cluster',
    concept: 'jungle',
    conceptLabel: 'Jungles & Rainforests',
    variantName: 'Palm Cluster',
    category: 'plant',
    icon: '🏝️',
    description: "Slender curving palm trunks capped with radiant frond crowns.",
    tags: ["palms","tropical","oasis","island"],
  },
  {
    id: 'jungle-cloud',
    name: 'Misty Cloud Forest',
    concept: 'jungle',
    conceptLabel: 'Jungles & Rainforests',
    variantName: 'Cloud Forest',
    category: 'plant',
    icon: '☁️🌴',
    description: "High-elevation mountain forest drenched in perpetual mist and moss.",
    tags: ["cloud","forest","mist","moss","jungle"],
  },
  {
    id: 'rainforest-vines',
    name: 'Tangled Lianas & Vines',
    concept: 'jungle',
    conceptLabel: 'Jungles & Rainforests',
    variantName: 'Tangled Lianas',
    category: 'plant',
    icon: '🌿🧗',
    description: "Curtain of hanging woody liana vines looping through the understory.",
    tags: ["lianas","vines","rainforest","jungle"],
  },
  {
    id: 'grass-steppe',
    name: 'Open Steppe Grassland',
    concept: 'grassland',
    conceptLabel: 'Grasslands & Savannas',
    variantName: 'Open Steppe',
    category: 'plant',
    icon: '🌾',
    description: "Vast, windswept temperate prairie of hardy perennial grasses.",
    tags: ["steppe","grassland","prairie","plains"],
  },
  {
    id: 'grass-tall',
    name: 'Tall Wild Grass Tufts',
    concept: 'grassland',
    conceptLabel: 'Grasslands & Savannas',
    variantName: 'Tall Grass Tufts',
    category: 'plant',
    icon: '🌾🌾',
    description: "Chest-high wild grasses waving rhythmically in the breeze.",
    tags: ["grass","tall","savanna","tufts"],
  },
  {
    id: 'savanna-acacia',
    name: 'Acacia Thorn Savanna',
    concept: 'grassland',
    conceptLabel: 'Grasslands & Savannas',
    variantName: 'Acacia Savanna',
    category: 'plant',
    icon: '🦒',
    description: "Expansive tropical grassland dotted with flat-topped acacia umbrellas.",
    tags: ["savanna","acacia","grassland","tropical"],
  },
  {
    id: 'meadow-wildflower',
    name: 'Wildflower Bloom Meadow',
    concept: 'grassland',
    conceptLabel: 'Grasslands & Savannas',
    variantName: 'Wildflower Meadow',
    category: 'plant',
    icon: '🌸',
    description: "Vibrant carpet of flowering meadows humming with pollinators.",
    tags: ["meadow","flowers","wildflowers","bloom"],
  },
  {
    id: 'flora-wetland',
    name: 'Wetland Water Lily Marsh',
    concept: 'marsh',
    conceptLabel: 'Marshes & Specialized Flora',
    variantName: 'Lily Pad Wetland',
    category: 'plant',
    icon: '🪷',
    description: "Shallow aquatic wetland blanketed in floating lily pads and lotus blooms.",
    tags: ["wetland","lily","pads","marsh"],
  },
  {
    id: 'thicket-ironwood',
    name: 'Ironwood Briar Thicket',
    concept: 'marsh',
    conceptLabel: 'Marshes & Specialized Flora',
    variantName: 'Ironwood Briar Thicket',
    category: 'plant',
    icon: '🦔',
    description: "Barbed barrier of razor-sharp thorns and petrified ironwood brambles.",
    tags: ["briar","thicket","brambles","thorns","ironwood"],
  },
  {
    id: 'bamboo-grove',
    name: 'Whispering Bamboo Grove',
    concept: 'marsh',
    conceptLabel: 'Marshes & Specialized Flora',
    variantName: 'Whispering Bamboo',
    category: 'plant',
    icon: '🎋',
    description: "Dense vertical forest of segmented bamboo culms clicking in the wind.",
    tags: ["bamboo","grove","culms","canes"],
  },
  {
    id: 'fungal-mycelium',
    name: 'Giant Fungal Mycelium',
    concept: 'marsh',
    conceptLabel: 'Marshes & Specialized Flora',
    variantName: 'Giant Fungal Forest',
    category: 'plant',
    icon: '🍄',
    description: "Luminescent spore-choked realm of tower-sized fungal caps and toadstools.",
    tags: ["fungal","mushrooms","spores","mycelium"],
  },
  {
    id: 'geyser-basin',
    name: 'Steaming Geyser Basin',
    concept: 'geyser',
    conceptLabel: 'Geysers & Thermal',
    variantName: 'Steaming Basin',
    category: 'feature',
    icon: '💨',
    description: "Pressurized hydrothermal vents releasing periodic superheated water plumes.",
    tags: ["geyser","steam","vent","thermal"],
  },
  {
    id: 'geyser-eruption',
    name: 'Superheated Geyser Fountain',
    concept: 'geyser',
    conceptLabel: 'Geysers & Thermal',
    variantName: 'Geyser Fountain',
    category: 'feature',
    icon: '⛲💨',
    description: "High vertical steam and scalding water fountain blasting skyward.",
    tags: ["geyser","eruption","fountain","thermal"],
  },
  {
    id: 'thermal-mudpot',
    name: 'Boiling Mudpot Basin',
    concept: 'geyser',
    conceptLabel: 'Geysers & Thermal',
    variantName: 'Boiling Mudpot',
    category: 'feature',
    icon: '🫧🟤',
    description: "Viscous acidic mud bubbling and popping with sulfurous fumes.",
    tags: ["thermal","mudpot","sulfur","boiling"],
  },
  {
    id: 'crater-impact',
    name: 'Meteor Impact Crater',
    concept: 'crater',
    conceptLabel: 'Craters',
    variantName: 'Meteor Impact',
    category: 'feature',
    icon: '☄️',
    description: "Violent starfall depression surrounded by a raised shatter-rim.",
    tags: ["crater","meteor","impact","shatter"],
  },
  {
    id: 'crater-caldera',
    name: 'Sunken Caldera Crater',
    concept: 'crater',
    conceptLabel: 'Craters',
    variantName: 'Sunken Caldera',
    category: 'feature',
    icon: '⭕🪨',
    description: "Steep amphitheater depression left by a collapsed primordial summit.",
    tags: ["crater","caldera","sunken","rim"],
  },
  {
    id: 'crater-pit',
    name: 'Abyssal Chasm Pit',
    concept: 'crater',
    conceptLabel: 'Craters',
    variantName: 'Abyssal Pit',
    category: 'feature',
    icon: '🕳️⭐',
    description: "Bottomless sheer circular pit plunging into the molten mantle.",
    tags: ["crater","pit","abyss","chasm"],
  },
  {
    id: 'lava-fissure',
    name: 'Molten Magma Fissure',
    concept: 'lava-flow',
    conceptLabel: 'Lava Flows',
    variantName: 'Magma Fissure',
    category: 'feature',
    icon: '🌋🔥',
    description: "Tectonic fracture bleeding incandescent molten rock across the crust.",
    tags: ["lava","fissure","magma","volcanic"],
  },
  {
    id: 'lava-river',
    name: 'Winding Basalt Lava Stream',
    concept: 'lava-flow',
    conceptLabel: 'Lava Flows',
    variantName: 'Basalt Lava Stream',
    category: 'feature',
    icon: '🔥🌊',
    description: "Sluggish river of glowing molten basalt cutting through volcanic ash.",
    tags: ["lava","stream","river","basalt"],
  },
  {
    id: 'lava-field',
    name: 'Obsidian Crust Lava Field',
    concept: 'lava-flow',
    conceptLabel: 'Lava Flows',
    variantName: 'Obsidian Lava Field',
    category: 'feature',
    icon: '🖤🪨',
    description: "Twisted field of ropy pahoehoe lava cooled into black volcanic glass.",
    tags: ["lava","obsidian","pahoehoe","crust"],
  },
  {
    id: 'salt-hexagons',
    name: 'Hexagonal Salt Crust Lakebed',
    concept: 'salt-flat',
    conceptLabel: 'Salt Flats',
    variantName: 'Hexagonal Crust',
    category: 'feature',
    icon: '🧂',
    description: "Desiccated endorheic lakebed crystallized into geometric salt polygon ridges.",
    tags: ["salt","flats","hexagons","crust","alkali"],
  },
  {
    id: 'salt-pan',
    name: 'Reflective White Alkali Pan',
    concept: 'salt-flat',
    conceptLabel: 'Salt Flats',
    variantName: 'White Alkali Pan',
    category: 'feature',
    icon: '⬜',
    description: "Blinding white, glass-flat expanse of ancient evaporite mineral salts.",
    tags: ["salt","pan","alkali","evaporite","white"],
  },
  {
    id: 'salt-pillars',
    name: 'Evaporite Salt Spires',
    concept: 'salt-flat',
    conceptLabel: 'Salt Flats',
    variantName: 'Salt Spires',
    category: 'feature',
    icon: '🧂🗡️',
    description: "Ghostly towers and pinnacles of wind-sculpted rock salt.",
    tags: ["salt","spires","pillars","evaporite"],
  },
  {
    id: 'wind-gale',
    name: 'Prevailing Gale Wind Vectors',
    concept: 'wind',
    conceptLabel: 'Strong Winds & Weather',
    variantName: 'Gale Wind Vectors',
    category: 'feature',
    icon: '💨🌬️',
    description: "Fierce perpetual trade wind currents sweeping unimpeded across the realm.",
    tags: ["wind","gale","vectors","weather","storm"],
  },
  {
    id: 'wind-vortex',
    name: 'Cyclone / Dust Devil Vortex',
    concept: 'wind',
    conceptLabel: 'Strong Winds & Weather',
    variantName: 'Cyclone Vortex',
    category: 'feature',
    icon: '🌪️',
    description: "Violent rotating funnel of winds spiraling over land or sea.",
    tags: ["cyclone","vortex","tornado","dustdevil","wind"],
  },
  {
    id: 'wind-storm',
    name: 'Thunderstorm Cloud Front',
    concept: 'wind',
    conceptLabel: 'Strong Winds & Weather',
    variantName: 'Thunderstorm Cloud',
    category: 'feature',
    icon: '⛈️',
    description: "Towering cumulonimbus anvil discharging sheets of rain and lightning.",
    tags: ["storm","thunder","lightning","cloud","weather"],
  },
  {
    id: 'water-currents',
    name: 'Ocean Surface Currents',
    concept: 'current',
    conceptLabel: 'Currents & Tides',
    variantName: 'Surface Currents',
    category: 'feature',
    icon: '🌊➡️',
    description: "Major warm and cold oceanic conveyor rivers steering naval transit.",
    tags: ["currents","ocean","tides","drift"],
  },
  {
    id: 'current-gyre',
    name: 'Oceanic Circulating Gyre',
    concept: 'current',
    conceptLabel: 'Currents & Tides',
    variantName: 'Oceanic Gyre',
    category: 'feature',
    icon: '🔄🌊',
    description: "Massive circular ocean current system rotating around a calm central sea.",
    tags: ["gyre","currents","rotation","ocean"],
  },
  {
    id: 'resource-mineral',
    name: 'Rich Mineral & Ore Vein',
    concept: 'resource',
    conceptLabel: 'Natural Resources',
    variantName: 'Mineral Ore Vein',
    category: 'feature',
    icon: '⛏️',
    description: "Subterranean strike of precious iron, copper, or silver minerals.",
    tags: ["resource","ore","mineral","iron","mine"],
  },
  {
    id: 'resource-gem',
    name: 'Crystalline Gem Geode',
    concept: 'resource',
    conceptLabel: 'Natural Resources',
    variantName: 'Gemstone Geode',
    category: 'feature',
    icon: '💎',
    description: "Cluster of prism gemstones and arcane crystal clusters embedded in stone.",
    tags: ["resource","gem","crystal","geode","jewels"],
  },
  {
    id: 'crystal-cavern',
    name: 'Luminescent Crystal Cavern',
    concept: 'resource',
    conceptLabel: 'Natural Resources',
    variantName: 'Crystal Cavern',
    category: 'feature',
    icon: '🔮💎',
    description: "Subterranean geode chamber bristling with glowing resonance crystals.",
    tags: ["crystal","cavern","gem","geode","resonance"],
  },
  {
    id: 'resource-quarry',
    name: 'High-Grade Stone Quarry Strata',
    concept: 'resource',
    conceptLabel: 'Natural Resources',
    variantName: 'Stone Quarry Strata',
    category: 'feature',
    icon: '🧱',
    description: "Stepped layers of prime dimensional granite or marble building stone.",
    tags: ["resource","quarry","stone","marble","granite"],
  },
  {
    id: 'titan-bones',
    name: 'Colossal Titan Bones',
    concept: 'resource',
    conceptLabel: 'Natural Resources',
    variantName: 'Titan Bone Bed',
    category: 'feature',
    icon: '🦴',
    description: "Towering ribcage bones of an ancient pre-primordial titan fossil.",
    tags: ["bones","titan","fossil","colossal","remains"],
  },
  {
    id: 'megalith-ring',
    name: 'Megalith Stone Ring',
    concept: 'landmark',
    conceptLabel: 'Landmarks',
    variantName: 'Megalith Ring',
    category: 'feature',
    icon: '🗿',
    description: "Primordial stone trilithons aligned with solstices and celestial spheres.",
    tags: ["megalith","stonehenge","monolith","ancient"],
  },
  {
    id: 'obelisk-spires',
    name: 'Ancient Obelisk Spires',
    concept: 'landmark',
    conceptLabel: 'Landmarks',
    variantName: 'Obelisk Spires',
    category: 'feature',
    icon: '🗼',
    description: "Slender carved granite pillars etched with precursor inscriptions.",
    tags: ["obelisk","spire","pillar","precursor"],
  },
  {
    id: 'landmark-arch',
    name: 'Natural Weathered Stone Arch',
    concept: 'landmark',
    conceptLabel: 'Landmarks',
    variantName: 'Natural Stone Arch',
    category: 'feature',
    icon: '🪨🌉',
    description: "Monumental rock arch span carved through a plateau by centuries of wind.",
    tags: ["arch","natural","rock","landmark","monument"],
  },
  {
    id: 'ruins-temple',
    name: 'Forgotten Temple Ruins',
    concept: 'landmark',
    conceptLabel: 'Landmarks',
    variantName: 'Temple Ruins',
    category: 'feature',
    icon: '🏛️',
    description: "Crumbling classical colonnade and fractured pediment of a lost order.",
    tags: ["ruins","temple","columns","civilization"],
  },
  {
    id: 'petrified-wood',
    name: 'Petrified Ancient Wood',
    concept: 'landmark',
    conceptLabel: 'Landmarks',
    variantName: 'Petrified Wood',
    category: 'feature',
    icon: '🪵✨',
    description: "Silicified tree trunks turned to agate and jasper stone over aeons.",
    tags: ["petrified","wood","fossils","agate","stone"],
  },
  {
    id: 'sacred-grove',
    name: 'Whispering Sacred Grove',
    concept: 'landmark',
    conceptLabel: 'Landmarks',
    variantName: 'Sacred Grove',
    category: 'feature',
    icon: '✨🌳',
    description: "Locus of enchanted white trees where ley currents rise to the surface.",
    tags: ["grove","sacred","ley","enchanted","fairy"],
  },
  {
    id: 'ley-nexus',
    name: 'Ley Line Nexus Convergence',
    concept: 'landmark',
    conceptLabel: 'Landmarks',
    variantName: 'Ley Line Nexus',
    category: 'feature',
    icon: '🌀✨',
    description: "Intersection of planetary telluric energy channels radiating magic.",
    tags: ["ley","nexus","magic","energy","arcane"],
  },
]

export function getSymbolsByCategory(category: CartographicCategory): CartographicSymbolMeta[] {
  return CARTOGRAPHIC_SYMBOLS.filter((s) => s.category === category)
}

export function getSymbolsByConcept(concept: string): CartographicSymbolMeta[] {
  return CARTOGRAPHIC_SYMBOLS.filter((s) => s.concept === concept)
}

export function getConceptsByCategory(
  category: CartographicCategory
): { id: string; label: string; count: number }[] {
  const symbols = getSymbolsByCategory(category)
  const map = new Map<string, { label: string; count: number }>()
  for (const s of symbols) {
    const existing = map.get(s.concept)
    if (existing) {
      existing.count++
    } else {
      map.set(s.concept, { label: s.conceptLabel, count: 1 })
    }
  }
  return Array.from(map.entries()).map(([id, { label, count }]) => ({
    id,
    label,
    count,
  }))
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
    case 'mountain-peak':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="24,8 8,40 40,40" fill={stroke} fillOpacity={fillOpacity} /><path d="M 24 8 Q 22 24, 25 40" strokeWidth={strokeWidth * 1.1} /><line x1="26" y1="20" x2="33" y2="26" strokeWidth={strokeWidth * 0.8} /><line x1="27" y1="26" x2="36" y2="33" strokeWidth={strokeWidth * 0.8} /><line x1="28" y1="32" x2="38" y2="39" strokeWidth={strokeWidth * 0.8} />
        </g>
      )

    case 'mountain-twin':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="17,14 4,39 30,39" fill={stroke} fillOpacity={fillOpacity} /><path d="M 17 14 L 18 39" /><polygon points="32,8 18,39 44,39" fill={stroke} fillOpacity={fillOpacity * 1.2} /><path d="M 32 8 L 30 39" /><line x1="32" y1="22" x2="40" y2="29" strokeWidth={strokeWidth * 0.8} />
        </g>
      )

    case 'mountain-spire':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12,12 7,40 17,40" fill={stroke} fillOpacity={fillOpacity} /><polygon points="24,6 18,40 30,40" fill={stroke} fillOpacity={fillOpacity * 1.2} /><line x1="24" y1="6" x2="25" y2="40" /><polygon points="36,15 31,40 41,40" fill={stroke} fillOpacity={fillOpacity} />
        </g>
      )

    case 'mountain-snow':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="24,8 8,40 40,40" fill={stroke} fillOpacity={fillOpacity} /><path d="M 24 8 L 23 40" /><polygon points="24,8 19,18 24,16 28,19" fill={stroke} fillOpacity={fillOpacity * 2.2} /><line x1="24" y1="8" x2="24" y2="16" />
        </g>
      )

    case 'mountain-range':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12,16 2,40 22,40" fill={stroke} fillOpacity={fillOpacity} /><polygon points="26,8 14,40 38,40" fill={stroke} fillOpacity={fillOpacity * 1.2} /><polygon points="38,18 28,40 46,40" fill={stroke} fillOpacity={fillOpacity * 0.9} /><path d="M 12 16 L 14 40" /><path d="M 26 8 L 26 40" /><path d="M 38 18 L 36 40" />
        </g>
      )

    case 'hill-rolling':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 36 Q 16 22, 28 36 Z" fill={stroke} fillOpacity={fillOpacity} /><path d="M 20 38 Q 32 20, 44 38 Z" fill={stroke} fillOpacity={fillOpacity * 1.1} />
        </g>
      )

    case 'hill-knolls':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 4 38 Q 12 24, 20 38 Z" fill={stroke} fillOpacity={fillOpacity} /><path d="M 16 36 Q 24 18, 34 36 Z" fill={stroke} fillOpacity={fillOpacity * 1.2} /><path d="M 28 39 Q 37 25, 45 39 Z" fill={stroke} fillOpacity={fillOpacity * 0.9} />
        </g>
      )

    case 'hill-rocky':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 38 Q 18 20, 30 38 Z" fill={stroke} fillOpacity={fillOpacity} /><path d="M 22 39 Q 34 22, 44 39 Z" fill={stroke} fillOpacity={fillOpacity * 1.1} /><line x1="14" y1="28" x2="16" y2="34" strokeWidth={strokeWidth * 0.8} /><line x1="28" y1="29" x2="30" y2="35" strokeWidth={strokeWidth * 0.8} /><circle cx="20" cy="35" r="1.2" fill={stroke} />
        </g>
      )

    case 'hill-low':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 4 36 Q 16 28, 28 36" strokeWidth={strokeWidth * 1.2} /><path d="M 18 32 Q 31 22, 44 32" strokeWidth={strokeWidth * 1.2} /><path d="M 8 40 Q 22 34, 38 40" strokeWidth={strokeWidth * 0.9} />
        </g>
      )

    case 'canyon-gorge':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 14 6 Q 22 24, 18 36 L 24 44" strokeWidth={strokeWidth * 1.4} /><path d="M 34 6 Q 26 24, 30 36 L 24 44" strokeWidth={strokeWidth * 1.4} /><line x1="14" y1="12" x2="10" y2="12" /><line x1="17" y1="22" x2="11" y2="22" /><line x1="33" y1="14" x2="37" y2="14" /><line x1="29" y1="26" x2="35" y2="26" /><polygon points="14,6 22,24 18,36 24,44 30,36 26,24 34,6" fill={stroke} fillOpacity={fillOpacity * 1.5} />
        </g>
      )

    case 'cliff-sheer':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 16 L 42 16" strokeWidth={strokeWidth * 1.3} /><line x1="10" y1="16" x2="10" y2="40" strokeWidth={strokeWidth * 1.2} /><line x1="18" y1="16" x2="18" y2="38" strokeWidth={strokeWidth * 1.1} /><line x1="26" y1="16" x2="26" y2="42" strokeWidth={strokeWidth * 1.3} /><line x1="34" y1="16" x2="34" y2="39" strokeWidth={strokeWidth * 1.1} /><line x1="40" y1="16" x2="40" y2="37" strokeWidth={strokeWidth * 1.0} /><polygon points="6,16 42,16 42,40 6,40" fill={stroke} fillOpacity={fillOpacity * 0.8} />
        </g>
      )

    case 'cliff-coastal':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 8 14 L 32 14 Q 30 28, 28 42" strokeWidth={strokeWidth * 1.3} /><polygon points="8,14 32,14 28,42 8,42" fill={stroke} fillOpacity={fillOpacity} /><path d="M 30 38 Q 37 36, 44 38" strokeWidth={strokeWidth * 1.1} /><path d="M 33 42 Q 39 40, 46 42" strokeWidth={strokeWidth * 0.9} />
        </g>
      )

    case 'mesa-plateau':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12,18 36,18 42,38 6,38" fill={stroke} fillOpacity={fillOpacity} /><line x1="12" y1="18" x2="36" y2="18" strokeWidth={strokeWidth * 1.3} /><line x1="16" y1="26" x2="32" y2="26" strokeWidth={strokeWidth * 0.8} strokeDasharray="2 2" /><line x1="9" y1="38" x2="39" y2="38" strokeWidth={strokeWidth * 1.2} />
        </g>
      )

    case 'badland-buttes':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="10,24 18,24 20,40 8,40" fill={stroke} fillOpacity={fillOpacity} /><polygon points="26,14 36,14 39,40 23,40" fill={stroke} fillOpacity={fillOpacity * 1.2} /><line x1="26" y1="14" x2="36" y2="14" strokeWidth={strokeWidth * 1.2} /><line x1="25" y1="24" x2="37" y2="24" strokeWidth={strokeWidth * 0.8} />
        </g>
      )

    case 'desert-dunes':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 22 Q 18 14, 30 24 Q 22 28, 6 22 Z" fill={stroke} fillOpacity={fillOpacity} /><path d="M 18 34 Q 30 26, 42 36 Q 34 40, 18 34 Z" fill={stroke} fillOpacity={fillOpacity * 1.2} /><path d="M 4 36 Q 12 32, 16 38" strokeWidth={strokeWidth * 0.8} />
        </g>
      )

    case 'desert-erg':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 4 18 Q 14 12, 24 18 Q 34 12, 44 18" strokeWidth={strokeWidth * 1.1} /><path d="M 6 26 Q 16 20, 26 26 Q 36 20, 46 26" strokeWidth={strokeWidth * 1.1} /><path d="M 4 34 Q 14 28, 24 34 Q 34 28, 44 34" strokeWidth={strokeWidth * 1.1} /><path d="M 8 42 Q 18 36, 28 42 Q 38 36, 46 42" strokeWidth={strokeWidth * 0.9} />
        </g>
      )

    case 'desert-rocky':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="24" r="3" fill={stroke} fillOpacity={fillOpacity * 1.4} /><circle cx="28" cy="18" r="4" fill={stroke} fillOpacity={fillOpacity * 1.4} /><circle cx="38" cy="30" r="2.5" fill={stroke} fillOpacity={fillOpacity * 1.4} /><circle cx="20" cy="36" r="3.5" fill={stroke} fillOpacity={fillOpacity * 1.4} /><path d="M 6 42 L 44 42" strokeWidth={strokeWidth * 0.8} strokeDasharray="3 3" />
        </g>
      )

    case 'desert-cracked':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 24 8 L 24 24 L 12 34 L 14 44" strokeWidth={strokeWidth * 1.2} /><path d="M 24 24 L 36 32 L 34 44" strokeWidth={strokeWidth * 1.2} /><path d="M 24 16 L 36 12 L 44 18" strokeWidth={strokeWidth * 1.0} /><path d="M 24 18 L 10 14 L 4 20" strokeWidth={strokeWidth * 1.0} /><path d="M 36 32 L 44 34" strokeWidth={strokeWidth * 0.9} /><path d="M 12 34 L 4 36" strokeWidth={strokeWidth * 0.9} />
        </g>
      )

    case 'cave-maw':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="6,40 18,12 30,12 42,40" fill={stroke} fillOpacity={fillOpacity} /><path d="M 16 40 Q 24 20, 32 40 Z" fill={stroke} fillOpacity={fillOpacity * 2.5} /><line x1="24" y1="20" x2="24" y2="40" strokeWidth={strokeWidth * 0.6} />
        </g>
      )

    case 'cave-cliff':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 4 10 L 44 10" strokeWidth={strokeWidth * 1.3} /><line x1="8" y1="10" x2="8" y2="40" strokeWidth={strokeWidth * 1.2} /><line x1="40" y1="10" x2="40" y2="40" strokeWidth={strokeWidth * 1.2} /><path d="M 16 40 Q 24 22, 32 40 Z" fill={stroke} fillOpacity={fillOpacity * 3} /><line x1="20" y1="20" x2="28" y2="20" strokeWidth={strokeWidth * 0.8} />
        </g>
      )

    case 'cave-sinkhole':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="24" cy="24" rx="16" ry="10" fill={stroke} fillOpacity={fillOpacity * 2.5} strokeWidth={strokeWidth * 1.3} /><ellipse cx="24" cy="24" rx="11" ry="6" fill={stroke} fillOpacity={fillOpacity * 3.5} /><line x1="14" y1="24" x2="18" y2="24" strokeWidth={strokeWidth * 0.8} /><line x1="30" y1="24" x2="34" y2="24" strokeWidth={strokeWidth * 0.8} />
        </g>
      )

    case 'volcano-active':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="6,40 18,18 30,18 42,40" fill={stroke} fillOpacity={fillOpacity} /><path d="M 18 18 Q 24 24, 30 18" strokeWidth={strokeWidth * 1.2} /><path d="M 21 16 Q 16 8, 20 4" strokeWidth={strokeWidth * 1.1} /><path d="M 24 16 Q 25 8, 28 4" strokeWidth={strokeWidth * 1.1} /><path d="M 27 16 Q 32 8, 29 4" strokeWidth={strokeWidth * 1.1} />
        </g>
      )

    case 'volcano-caldera':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="4,38 14,20 34,20 44,38" fill={stroke} fillOpacity={fillOpacity} /><ellipse cx="24" cy="24" rx="10" ry="5" fill={stroke} fillOpacity={fillOpacity * 2} /><path d="M 14 20 Q 24 28, 34 20" strokeWidth={strokeWidth * 1.2} />
        </g>
      )

    case 'river-meander':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 24 4 C 10 14, 38 22, 22 34 C 14 40, 20 44, 24 46" strokeWidth={strokeWidth * 1.5} fill="none" /><path d="M 28 6 C 16 15, 42 23, 26 35 C 18 41, 24 44, 28 46" strokeWidth={strokeWidth * 0.8} strokeDasharray="3 2" fill="none" />
        </g>
      )

    case 'river-braided':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 16 4 Q 28 16, 18 30 Q 12 40, 20 44" strokeWidth={strokeWidth * 1.2} fill="none" /><path d="M 28 4 Q 18 20, 30 32 Q 36 40, 28 44" strokeWidth={strokeWidth * 1.2} fill="none" /><path d="M 22 16 Q 24 24, 22 32" strokeWidth={strokeWidth * 1.0} fill="none" />
        </g>
      )

    case 'river-delta':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 24 6 L 24 18 L 10 42" strokeWidth={strokeWidth * 1.3} fill="none" /><path d="M 24 18 L 24 42" strokeWidth={strokeWidth * 1.3} fill="none" /><path d="M 24 18 L 38 42" strokeWidth={strokeWidth * 1.3} fill="none" /><path d="M 18 28 L 20 42" strokeWidth={strokeWidth * 0.9} fill="none" /><path d="M 30 28 L 28 42" strokeWidth={strokeWidth * 0.9} fill="none" />
        </g>
      )

    case 'river-rapids':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 16 6 L 24 18 L 18 30 L 26 42" strokeWidth={strokeWidth * 1.4} fill="none" /><path d="M 28 8 L 32 18 L 26 30 L 34 42" strokeWidth={strokeWidth * 1.1} fill="none" /><circle cx="21" cy="18" r="1.5" fill={stroke} /><circle cx="23" cy="30" r="1.5" fill={stroke} />
        </g>
      )

    case 'waterfall-cataract':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 8 12 L 40 12" strokeWidth={strokeWidth * 1.4} /><line x1="14" y1="12" x2="14" y2="38" strokeWidth={strokeWidth * 1.2} /><line x1="20" y1="12" x2="20" y2="40" strokeWidth={strokeWidth * 1.4} /><line x1="26" y1="12" x2="26" y2="39" strokeWidth={strokeWidth * 1.3} /><line x1="32" y1="12" x2="32" y2="38" strokeWidth={strokeWidth * 1.1} /><path d="M 10 40 Q 24 36, 38 40" strokeWidth={strokeWidth * 1.2} />
        </g>
      )

    case 'waterfall-cascades':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <line x1="10" y1="10" x2="38" y2="10" strokeWidth={strokeWidth * 1.3} /><line x1="14" y1="10" x2="14" y2="20" strokeWidth={strokeWidth * 1.1} /><line x1="30" y1="10" x2="30" y2="20" strokeWidth={strokeWidth * 1.1} /><line x1="8" y1="20" x2="36" y2="20" strokeWidth={strokeWidth * 1.3} /><line x1="18" y1="20" x2="18" y2="32" strokeWidth={strokeWidth * 1.1} /><line x1="28" y1="20" x2="28" y2="32" strokeWidth={strokeWidth * 1.1} /><line x1="12" y1="32" x2="40" y2="32" strokeWidth={strokeWidth * 1.3} /><path d="M 14 42 Q 24 38, 36 42" strokeWidth={strokeWidth * 1.1} />
        </g>
      )

    case 'waterfall-gorge':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="6,6 16,6 14,42 6,42" fill={stroke} fillOpacity={fillOpacity} /><polygon points="32,6 42,6 42,42 34,42" fill={stroke} fillOpacity={fillOpacity} /><line x1="21" y1="8" x2="21" y2="40" strokeWidth={strokeWidth * 1.3} /><line x1="27" y1="8" x2="27" y2="40" strokeWidth={strokeWidth * 1.3} /><ellipse cx="24" cy="40" rx="8" ry="3" fill={stroke} fillOpacity={fillOpacity * 2} />
        </g>
      )

    case 'lake-basin':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 10 24 C 8 14, 24 8, 36 14 C 44 20, 42 34, 30 38 C 18 42, 12 34, 10 24 Z" fill={stroke} fillOpacity={fillOpacity} strokeWidth={strokeWidth * 1.3} /><path d="M 18 22 Q 26 18, 34 22" strokeWidth={strokeWidth * 0.9} fill="none" /><path d="M 16 28 Q 24 24, 30 28" strokeWidth={strokeWidth * 0.9} fill="none" />
        </g>
      )

    case 'lake-tarn':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12,18 20,4 28,18" fill={stroke} fillOpacity={fillOpacity * 0.6} /><polygon points="26,16 34,6 42,16" fill={stroke} fillOpacity={fillOpacity * 0.6} /><ellipse cx="24" cy="30" rx="14" ry="7" fill={stroke} fillOpacity={fillOpacity * 1.5} strokeWidth={strokeWidth * 1.2} /><path d="M 16 30 Q 24 26, 32 30" strokeWidth={strokeWidth * 0.8} fill="none" />
        </g>
      )

    case 'lake-oxbow':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 12 18 C 10 8, 38 8, 36 18 C 34 28, 22 28, 22 22 C 22 16, 26 16, 26 18" strokeWidth={strokeWidth * 1.4} fill={stroke} fillOpacity={fillOpacity} /><path d="M 6 38 C 16 32, 32 32, 42 38" strokeWidth={strokeWidth * 1.1} strokeDasharray="3 2" fill="none" />
        </g>
      )

    case 'lake-crater':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="24" cy="24" rx="18" ry="12" strokeWidth={strokeWidth * 1.4} fill={stroke} fillOpacity={fillOpacity * 0.7} /><ellipse cx="24" cy="24" rx="11" ry="6" strokeWidth={strokeWidth * 1.0} fill={stroke} fillOpacity={fillOpacity * 2.5} /><circle cx="24" cy="24" r="2.5" fill={stroke} />
        </g>
      )

    case 'swamp-mangrove':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 14 18 Q 24 10, 34 18" strokeWidth={strokeWidth * 1.3} /><path d="M 14 18 L 8 40" strokeWidth={strokeWidth * 1.2} /><path d="M 18 18 L 16 40" strokeWidth={strokeWidth * 1.2} /><path d="M 24 18 L 24 40" strokeWidth={strokeWidth * 1.2} /><path d="M 30 18 L 32 40" strokeWidth={strokeWidth * 1.2} /><path d="M 34 18 L 40 40" strokeWidth={strokeWidth * 1.2} /><ellipse cx="24" cy="14" rx="14" ry="6" fill={stroke} fillOpacity={fillOpacity} />
        </g>
      )

    case 'swamp-peat':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="14" cy="26" rx="8" ry="4" fill={stroke} fillOpacity={fillOpacity * 1.5} /><ellipse cx="32" cy="22" rx="10" ry="5" fill={stroke} fillOpacity={fillOpacity * 1.5} /><path d="M 6 36 Q 24 30, 42 36" strokeWidth={strokeWidth * 1.2} /><line x1="12" y1="16" x2="14" y2="24" strokeWidth={strokeWidth * 0.9} /><line x1="30" y1="12" x2="31" y2="20" strokeWidth={strokeWidth * 0.9} />
        </g>
      )

    case 'marsh-reeds':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <line x1="14" y1="36" x2="14" y2="12" strokeWidth={strokeWidth * 1.2} /><rect x="12.5" y="14" width="3" height="10" rx="1.5" fill={stroke} /><line x1="24" y1="38" x2="24" y2="8" strokeWidth={strokeWidth * 1.3} /><rect x="22.5" y="10" width="3" height="12" rx="1.5" fill={stroke} /><line x1="34" y1="36" x2="34" y2="14" strokeWidth={strokeWidth * 1.2} /><rect x="32.5" y="16" width="3" height="10" rx="1.5" fill={stroke} /><path d="M 6 38 Q 24 34, 42 38" strokeWidth={strokeWidth * 1.1} />
        </g>
      )

    case 'marsh-fen':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 22 Q 18 18, 30 22" strokeWidth={strokeWidth * 1.1} /><path d="M 16 34 Q 30 30, 44 34" strokeWidth={strokeWidth * 1.1} /><path d="M 10 20 L 8 10" strokeWidth={strokeWidth * 1.1} /><path d="M 14 20 L 16 8" strokeWidth={strokeWidth * 1.1} /><path d="M 28 32 L 26 22" strokeWidth={strokeWidth * 1.1} /><path d="M 32 32 L 35 20" strokeWidth={strokeWidth * 1.1} />
        </g>
      )

    case 'tidal-pools':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 16 C 14 12, 28 12, 42 16" strokeWidth={strokeWidth * 1.3} /><ellipse cx="14" cy="28" rx="6" ry="4" fill={stroke} fillOpacity={fillOpacity * 2} /><ellipse cx="32" cy="30" rx="8" ry="5" fill={stroke} fillOpacity={fillOpacity * 2} /><circle cx="22" cy="22" r="3" fill={stroke} fillOpacity={fillOpacity * 2} /><path d="M 8 42 Q 24 38, 40 42" strokeWidth={strokeWidth * 0.9} />
        </g>
      )

    case 'estuary-bay':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 10 C 18 10, 18 36, 6 42" strokeWidth={strokeWidth * 1.4} /><path d="M 42 10 C 30 10, 30 36, 42 42" strokeWidth={strokeWidth * 1.4} /><path d="M 24 6 L 24 22" strokeWidth={strokeWidth * 1.2} /><ellipse cx="24" cy="30" rx="8" ry="4" fill={stroke} fillOpacity={fillOpacity} />
        </g>
      )

    case 'atoll-reef':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="24" cy="24" rx="18" ry="12" strokeWidth={strokeWidth * 1.4} strokeDasharray="6 3" fill="none" /><ellipse cx="24" cy="24" rx="9" ry="6" fill={stroke} fillOpacity={fillOpacity * 1.5} />
        </g>
      )

    case 'fjord-sheer':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="4,6 16,6 14,42 4,42" fill={stroke} fillOpacity={fillOpacity} /><polygon points="32,6 44,6 44,42 34,42" fill={stroke} fillOpacity={fillOpacity} /><path d="M 24 6 L 24 42" strokeWidth={strokeWidth * 1.6} /><path d="M 18 30 L 24 34 L 30 30" strokeWidth={strokeWidth * 0.8} />
        </g>
      )

    case 'glacier-valley':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="6,12 18,38 22,38 14,12" fill={stroke} fillOpacity={fillOpacity * 1.5} /><polygon points="42,12 30,38 26,38 34,12" fill={stroke} fillOpacity={fillOpacity * 1.5} /><path d="M 24 8 L 24 40" strokeWidth={strokeWidth * 1.3} strokeDasharray="3 3" /><line x1="18" y1="20" x2="30" y2="20" strokeWidth={strokeWidth * 0.8} />
        </g>
      )

    case 'glacier-crevasse':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="6,36 14,16 26,22 22,38" fill={stroke} fillOpacity={fillOpacity} /><polygon points="26,38 26,14 42,20 38,38" fill={stroke} fillOpacity={fillOpacity * 1.2} /><path d="M 24 10 L 26 38" strokeWidth={strokeWidth * 1.4} />
        </g>
      )

    case 'glacier-shelf':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="14" width="26" height="24" fill={stroke} fillOpacity={fillOpacity * 1.4} strokeWidth={strokeWidth * 1.2} /><polygon points="36,24 44,24 41,36 34,36" fill={stroke} fillOpacity={fillOpacity * 1.2} /><path d="M 4 40 L 44 40" strokeWidth={strokeWidth * 1.1} />
        </g>
      )

    case 'maelstrom-whirlpool':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 24 24 A 4 4 0 0 1 20 20 A 8 8 0 0 1 28 16 A 12 12 0 0 1 36 28 A 16 16 0 0 1 12 36 A 20 20 0 0 1 4 20" strokeWidth={strokeWidth * 1.2} fill="none" />
        </g>
      )

    case 'tidal-rip':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 18 Q 16 12, 26 18 Q 36 12, 44 18" strokeWidth={strokeWidth * 1.1} /><path d="M 4 28 Q 14 22, 24 28 Q 34 22, 44 28" strokeWidth={strokeWidth * 1.1} /><path d="M 24 10 L 24 38 L 20 32 M 24 38 L 28 32" strokeWidth={strokeWidth * 1.3} />
        </g>
      )

    case 'spring-headwater':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="24" cy="34" rx="14" ry="7" fill={stroke} fillOpacity={fillOpacity * 1.5} /><path d="M 24 34 Q 24 12, 18 8 M 24 34 Q 24 12, 30 8" strokeWidth={strokeWidth * 1.3} fill="none" /><circle cx="24" cy="34" r="2.5" fill={stroke} />
        </g>
      )

    case 'hotspring-geothermal':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="24" cy="30" rx="16" ry="8" fill={stroke} fillOpacity={fillOpacity * 1.8} /><path d="M 18 24 Q 16 14, 20 10 M 24 24 Q 22 12, 26 8 M 30 24 Q 28 14, 32 10" strokeWidth={strokeWidth * 1.1} fill="none" />
        </g>
      )

    case 'trench-abyssal':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 12 L 20 40 L 28 40 L 42 12" strokeWidth={strokeWidth * 1.4} fill={stroke} fillOpacity={fillOpacity * 2.5} /><line x1="24" y1="12" x2="24" y2="40" strokeWidth={strokeWidth * 0.9} strokeDasharray="2 2" />
        </g>
      )

    case 'forest-deciduous':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="16" cy="20" r="9" fill={stroke} fillOpacity={fillOpacity} /><line x1="16" y1="29" x2="16" y2="40" strokeWidth={strokeWidth * 1.2} /><circle cx="32" cy="18" r="10" fill={stroke} fillOpacity={fillOpacity * 1.2} /><line x1="32" y1="28" x2="32" y2="40" strokeWidth={strokeWidth * 1.2} /><circle cx="24" cy="26" r="8" fill={stroke} fillOpacity={fillOpacity} /><line x1="24" y1="34" x2="24" y2="41" strokeWidth={strokeWidth * 1.2} />
        </g>
      )

    case 'forest-taiga':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="14,14 6,38 22,38" fill={stroke} fillOpacity={fillOpacity} /><line x1="14" y1="14" x2="14" y2="42" /><polygon points="26,8 16,36 36,36" fill={stroke} fillOpacity={fillOpacity * 1.2} /><line x1="26" y1="8" x2="26" y2="42" /><polygon points="36,18 28,40 44,40" fill={stroke} fillOpacity={fillOpacity} /><line x1="36" y1="18" x2="36" y2="42" />
        </g>
      )

    case 'forest-redwood':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="24,4 12,38 36,38" fill={stroke} fillOpacity={fillOpacity * 1.3} /><rect x="21" y="38" width="6" height="6" fill={stroke} fillOpacity={fillOpacity * 2} /><polygon points="12,14 4,38 20,38" fill={stroke} fillOpacity={fillOpacity * 0.9} /><polygon points="36,14 28,38 44,38" fill={stroke} fillOpacity={fillOpacity * 0.9} />
        </g>
      )

    case 'forest-sparse':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="14" cy="22" r="7" fill={stroke} fillOpacity={fillOpacity} /><line x1="14" y1="29" x2="14" y2="40" strokeWidth={strokeWidth * 1.1} /><circle cx="34" cy="24" r="8" fill={stroke} fillOpacity={fillOpacity} /><line x1="34" y1="32" x2="34" y2="41" strokeWidth={strokeWidth * 1.1} /><path d="M 22 36 L 24 30 L 26 36" strokeWidth={strokeWidth * 0.8} />
        </g>
      )

    case 'forest-dead':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 16 42 L 16 16 L 10 10 M 16 22 L 22 14" strokeWidth={strokeWidth * 1.3} /><path d="M 32 42 L 32 12 L 26 6 M 32 18 L 38 12 M 32 26 L 26 22" strokeWidth={strokeWidth * 1.3} />
        </g>
      )

    case 'jungle-dense':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="14" cy="20" r="8" fill={stroke} fillOpacity={fillOpacity * 1.5} /><circle cx="28" cy="16" r="10" fill={stroke} fillOpacity={fillOpacity * 1.5} /><circle cx="38" cy="22" r="7" fill={stroke} fillOpacity={fillOpacity * 1.5} /><path d="M 14 28 Q 12 36, 8 42" strokeWidth={strokeWidth * 1.2} /><path d="M 28 26 L 28 42" strokeWidth={strokeWidth * 1.4} /><path d="M 38 29 Q 40 36, 44 42" strokeWidth={strokeWidth * 1.2} /><path d="M 18 24 Q 24 32, 22 42" strokeWidth={strokeWidth * 0.8} strokeDasharray="2 2" />
        </g>
      )

    case 'rainforest-canopy':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="24" cy="14" rx="16" ry="8" fill={stroke} fillOpacity={fillOpacity * 1.6} strokeWidth={strokeWidth * 1.3} /><path d="M 24 22 L 24 42" strokeWidth={strokeWidth * 1.6} /><path d="M 20 22 Q 16 32, 14 42" strokeWidth={strokeWidth * 1.0} /><path d="M 28 22 Q 32 32, 34 42" strokeWidth={strokeWidth * 1.0} /><line x1="8" y1="42" x2="40" y2="42" strokeWidth={strokeWidth * 1.0} />
        </g>
      )

    case 'jungle-palms':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 20 40 Q 24 24, 20 14" strokeWidth={strokeWidth * 1.4} /><path d="M 20 14 Q 10 12, 6 18" strokeWidth={strokeWidth * 1.1} /><path d="M 20 14 Q 14 6, 16 2" strokeWidth={strokeWidth * 1.1} /><path d="M 20 14 Q 26 6, 24 2" strokeWidth={strokeWidth * 1.1} /><path d="M 20 14 Q 30 10, 32 16" strokeWidth={strokeWidth * 1.1} /><path d="M 20 14 Q 28 18, 30 24" strokeWidth={strokeWidth * 1.1} />
        </g>
      )

    case 'jungle-cloud':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 10 20 Q 24 14, 38 20" strokeWidth={strokeWidth * 1.2} /><circle cx="16" cy="22" r="7" fill={stroke} fillOpacity={fillOpacity} /><circle cx="32" cy="22" r="8" fill={stroke} fillOpacity={fillOpacity} /><line x1="16" y1="29" x2="16" y2="40" strokeWidth={strokeWidth * 1.2} /><line x1="32" y1="30" x2="32" y2="40" strokeWidth={strokeWidth * 1.2} /><path d="M 4 14 Q 14 8, 24 14 Q 34 8, 44 14" strokeWidth={strokeWidth * 0.9} strokeDasharray="3 2" />
        </g>
      )

    case 'rainforest-vines':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 8 8 Q 14 24, 10 42" strokeWidth={strokeWidth * 1.2} /><path d="M 20 6 Q 26 22, 22 42" strokeWidth={strokeWidth * 1.2} /><path d="M 32 8 Q 38 26, 34 42" strokeWidth={strokeWidth * 1.2} /><path d="M 40 6 Q 46 24, 42 42" strokeWidth={strokeWidth * 1.2} /><line x1="4" y1="10" x2="44" y2="10" strokeWidth={strokeWidth * 1.4} />
        </g>
      )

    case 'grass-steppe':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 8 38 L 12 20 L 16 38" strokeWidth={strokeWidth * 1.2} /><path d="M 12 20 L 14 38" strokeWidth={strokeWidth * 0.9} /><path d="M 26 38 L 30 16 L 34 38" strokeWidth={strokeWidth * 1.3} /><path d="M 30 16 L 28 38" strokeWidth={strokeWidth * 0.9} /><path d="M 38 40 L 41 26 L 44 40" strokeWidth={strokeWidth * 1.1} />
        </g>
      )

    case 'grass-tall':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 16 42 Q 10 24, 8 12" strokeWidth={strokeWidth * 1.2} /><path d="M 16 42 Q 16 22, 18 8" strokeWidth={strokeWidth * 1.3} /><path d="M 16 42 Q 22 24, 26 14" strokeWidth={strokeWidth * 1.2} /><path d="M 34 42 Q 30 26, 28 16" strokeWidth={strokeWidth * 1.1} /><path d="M 34 42 Q 36 22, 38 10" strokeWidth={strokeWidth * 1.2} /><path d="M 34 42 Q 40 26, 44 18" strokeWidth={strokeWidth * 1.1} />
        </g>
      )

    case 'savanna-acacia':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="24" cy="14" rx="15" ry="5" fill={stroke} fillOpacity={fillOpacity * 1.4} /><path d="M 24 19 L 24 38" strokeWidth={strokeWidth * 1.4} /><path d="M 24 26 L 16 18" strokeWidth={strokeWidth * 1.1} /><path d="M 24 24 L 32 18" strokeWidth={strokeWidth * 1.1} /><line x1="8" y1="40" x2="40" y2="40" strokeWidth={strokeWidth * 0.8} />
        </g>
      )

    case 'meadow-wildflower':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="14" cy="24" r="4" fill={stroke} fillOpacity={fillOpacity * 2} /><line x1="14" y1="28" x2="14" y2="40" strokeWidth={strokeWidth * 1.1} /><circle cx="32" cy="18" r="5" fill={stroke} fillOpacity={fillOpacity * 2} /><line x1="32" y1="23" x2="32" y2="40" strokeWidth={strokeWidth * 1.2} /><circle cx="24" cy="30" r="3" fill={stroke} fillOpacity={fillOpacity * 2} /><line x1="24" y1="33" x2="24" y2="41" strokeWidth={strokeWidth * 1.0} />
        </g>
      )

    case 'flora-wetland':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="14" cy="30" rx="7" ry="3" fill={stroke} fillOpacity={fillOpacity * 1.8} /><ellipse cx="32" cy="32" rx="9" ry="4" fill={stroke} fillOpacity={fillOpacity * 1.8} /><circle cx="24" cy="18" r="3.5" fill={stroke} fillOpacity={fillOpacity * 2.5} /><line x1="24" y1="21.5" x2="24" y2="34" strokeWidth={strokeWidth * 1.1} />
        </g>
      )

    case 'thicket-ironwood':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 36 Q 16 18, 26 36" strokeWidth={strokeWidth * 1.3} /><path d="M 20 36 Q 30 14, 40 36" strokeWidth={strokeWidth * 1.3} /><line x1="12" y1="24" x2="8" y2="20" strokeWidth={strokeWidth * 1.1} /><line x1="18" y1="20" x2="22" y2="14" strokeWidth={strokeWidth * 1.1} /><line x1="32" y1="20" x2="36" y2="16" strokeWidth={strokeWidth * 1.1} />
        </g>
      )

    case 'bamboo-grove':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="42" x2="12" y2="8" strokeWidth={strokeWidth * 1.4} /><line x1="10" y1="20" x2="14" y2="20" strokeWidth={strokeWidth * 1.5} /><line x1="10" y1="32" x2="14" y2="32" strokeWidth={strokeWidth * 1.5} /><line x1="24" y1="42" x2="24" y2="4" strokeWidth={strokeWidth * 1.5} /><line x1="22" y1="16" x2="26" y2="16" strokeWidth={strokeWidth * 1.6} /><line x1="22" y1="28" x2="26" y2="28" strokeWidth={strokeWidth * 1.6} /><line x1="36" y1="42" x2="36" y2="10" strokeWidth={strokeWidth * 1.3} /><line x1="34" y1="22" x2="38" y2="22" strokeWidth={strokeWidth * 1.4} />
        </g>
      )

    case 'fungal-mycelium':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 10 24 Q 20 10, 30 24 Z" fill={stroke} fillOpacity={fillOpacity * 1.5} /><path d="M 18 24 L 18 42 L 22 42 L 22 24" fill={stroke} fillOpacity={fillOpacity} /><circle cx="20" cy="18" r="1.5" fill="#fafaf9" /><path d="M 28 30 Q 36 18, 44 30 Z" fill={stroke} fillOpacity={fillOpacity * 1.3} /><path d="M 35 30 L 35 42 L 38 42 L 38 30" fill={stroke} fillOpacity={fillOpacity} />
        </g>
      )

    case 'geyser-basin':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="24" cy="36" rx="14" ry="5" fill={stroke} fillOpacity={fillOpacity * 1.5} /><path d="M 24 36 L 24 6 M 21 34 Q 16 18, 18 10 M 27 34 Q 32 18, 30 10" strokeWidth={strokeWidth * 1.3} strokeDasharray="4 2" />
        </g>
      )

    case 'geyser-eruption':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 14 42 Q 24 38, 34 42" strokeWidth={strokeWidth * 1.3} /><path d="M 24 40 L 24 4" strokeWidth={strokeWidth * 1.8} /><path d="M 24 4 Q 14 14, 10 26" strokeWidth={strokeWidth * 1.1} fill="none" /><path d="M 24 4 Q 34 14, 38 26" strokeWidth={strokeWidth * 1.1} fill="none" />
        </g>
      )

    case 'thermal-mudpot':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="24" cy="30" rx="16" ry="8" fill={stroke} fillOpacity={fillOpacity * 2} /><circle cx="18" cy="24" r="3" fill="none" strokeWidth={strokeWidth * 1.2} /><circle cx="28" cy="20" r="4" fill="none" strokeWidth={strokeWidth * 1.2} /><circle cx="22" cy="14" r="2.5" fill="none" strokeWidth={strokeWidth * 1.0} />
        </g>
      )

    case 'crater-impact':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="24" cy="26" rx="16" ry="9" strokeWidth={strokeWidth * 1.4} fill={stroke} fillOpacity={fillOpacity} /><ellipse cx="24" cy="26" rx="9" ry="5" fill={stroke} fillOpacity={fillOpacity * 2.2} /><line x1="8" y1="26" x2="2" y2="26" /><line x1="40" y1="26" x2="46" y2="26" /><line x1="16" y1="18" x2="10" y2="12" /><line x1="32" y1="18" x2="38" y2="12" />
        </g>
      )

    case 'crater-caldera':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="6,38 14,18 34,18 42,38" fill={stroke} fillOpacity={fillOpacity} /><ellipse cx="24" cy="26" rx="11" ry="6" fill={stroke} fillOpacity={fillOpacity * 2} /><line x1="14" y1="18" x2="34" y2="18" strokeWidth={strokeWidth * 1.3} />
        </g>
      )

    case 'crater-pit':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="24" cy="24" rx="16" ry="14" strokeWidth={strokeWidth * 1.4} fill={stroke} fillOpacity={fillOpacity * 3} /><ellipse cx="24" cy="24" rx="10" ry="8" fill="#000" /><line x1="24" y1="6" x2="24" y2="10" /><line x1="24" y1="38" x2="24" y2="42" />
        </g>
      )

    case 'lava-fissure':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 8 10 L 22 22 L 18 32 L 36 42" strokeWidth={strokeWidth * 1.8} fill="none" /><line x1="22" y1="22" x2="38" y2="16" strokeWidth={strokeWidth * 1.3} /><line x1="18" y1="32" x2="8" y2="38" strokeWidth={strokeWidth * 1.3} /><circle cx="22" cy="22" r="2" fill={stroke} />
        </g>
      )

    case 'lava-river':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 20 4 C 10 16, 36 24, 24 44" strokeWidth={strokeWidth * 2.2} fill="none" /><path d="M 24 6 C 14 18, 40 26, 28 44" strokeWidth={strokeWidth * 1.0} fill="none" strokeDasharray="2 2" />
        </g>
      )

    case 'lava-field':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 18 Q 16 12, 26 20 T 44 18" strokeWidth={strokeWidth * 1.3} /><path d="M 4 28 Q 16 22, 28 30 T 44 26" strokeWidth={strokeWidth * 1.3} /><path d="M 8 38 Q 20 32, 32 38 T 46 36" strokeWidth={strokeWidth * 1.3} />
        </g>
      )

    case 'salt-hexagons':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="16,14 24,10 32,14 32,22 24,26 16,22" strokeWidth={strokeWidth * 1.2} fill="none" /><polygon points="24,26 32,22 40,26 40,34 32,38 24,34" strokeWidth={strokeWidth * 1.2} fill="none" /><polygon points="8,26 16,22 24,26 24,34 16,38 8,34" strokeWidth={strokeWidth * 1.2} fill="none" />
        </g>
      )

    case 'salt-pan':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <line x1="6" y1="18" x2="42" y2="18" strokeWidth={strokeWidth * 1.2} /><line x1="4" y1="26" x2="44" y2="26" strokeWidth={strokeWidth * 1.2} /><line x1="8" y1="34" x2="40" y2="34" strokeWidth={strokeWidth * 1.2} /><circle cx="20" cy="14" r="1.5" fill={stroke} /><circle cx="34" cy="22" r="1.5" fill={stroke} />
        </g>
      )

    case 'salt-pillars':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12,14 8,40 16,40" fill={stroke} fillOpacity={fillOpacity * 1.5} /><polygon points="24,8 19,40 29,40" fill={stroke} fillOpacity={fillOpacity * 2} /><polygon points="36,16 32,40 40,40" fill={stroke} fillOpacity={fillOpacity * 1.5} />
        </g>
      )

    case 'wind-gale':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 14 Q 24 10, 36 14 Q 42 16, 40 20 Q 36 22, 34 18" strokeWidth={strokeWidth * 1.3} fill="none" /><path d="M 10 24 Q 28 20, 38 24 Q 44 26, 42 30 Q 38 32, 36 28" strokeWidth={strokeWidth * 1.3} fill="none" /><path d="M 4 34 Q 18 30, 28 34" strokeWidth={strokeWidth * 1.1} fill="none" />
        </g>
      )

    case 'wind-vortex':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="24" cy="10" rx="16" ry="4" strokeWidth={strokeWidth * 1.2} fill="none" /><ellipse cx="24" cy="18" rx="12" ry="3.5" strokeWidth={strokeWidth * 1.2} fill="none" /><ellipse cx="24" cy="26" rx="8" ry="3" strokeWidth={strokeWidth * 1.2} fill="none" /><ellipse cx="24" cy="34" rx="4" ry="2" strokeWidth={strokeWidth * 1.2} fill="none" /><line x1="24" y1="36" x2="24" y2="42" strokeWidth={strokeWidth * 1.4} />
        </g>
      )

    case 'wind-storm':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 12 24 C 8 24, 6 18, 12 16 C 12 10, 22 8, 26 12 C 32 8, 42 12, 38 20 C 44 22, 42 26, 36 26 Z" fill={stroke} fillOpacity={fillOpacity * 1.5} /><polygon points="22,26 18,34 24,34 20,44 28,32 23,32 26,26" fill={stroke} />
        </g>
      )

    case 'water-currents':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 16 C 18 8, 30 24, 42 16" strokeWidth={strokeWidth * 1.3} fill="none" /><path d="M 38 12 L 42 16 L 36 20" strokeWidth={strokeWidth * 1.3} fill="none" /><path d="M 6 32 C 18 24, 30 40, 42 32" strokeWidth={strokeWidth * 1.3} fill="none" /><path d="M 38 28 L 42 32 L 36 36" strokeWidth={strokeWidth * 1.3} fill="none" />
        </g>
      )

    case 'current-gyre':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="24" cy="24" rx="16" ry="12" strokeWidth={strokeWidth * 1.3} strokeDasharray="8 4" fill="none" /><path d="M 36 14 L 40 18 L 34 20" strokeWidth={strokeWidth * 1.2} fill="none" /><path d="M 12 34 L 8 30 L 14 28" strokeWidth={strokeWidth * 1.2} fill="none" />
        </g>
      )

    case 'resource-mineral':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="6,38 20,12 36,12 42,38" fill={stroke} fillOpacity={fillOpacity} /><path d="M 16 38 L 22 20 L 32 20 L 28 38" strokeWidth={strokeWidth * 1.2} fill={stroke} fillOpacity={fillOpacity * 2.5} /><circle cx="24" cy="26" r="2" fill="#fafaf9" />
        </g>
      )

    case 'resource-gem':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="24,6 14,18 20,40 28,40 34,18" fill={stroke} fillOpacity={fillOpacity * 1.8} strokeWidth={strokeWidth * 1.3} /><polygon points="12,18 6,24 12,38" fill={stroke} fillOpacity={fillOpacity} /><polygon points="36,18 42,24 36,38" fill={stroke} fillOpacity={fillOpacity} /><line x1="24" y1="6" x2="24" y2="40" strokeWidth={strokeWidth * 0.9} />
        </g>
      )

    case 'crystal-cavern':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="6,40 18,10 32,10 42,40" fill={stroke} fillOpacity={fillOpacity} /><polygon points="18,40 22,22 26,40" fill={stroke} fillOpacity={fillOpacity * 2.2} /><polygon points="26,40 30,16 34,40" fill={stroke} fillOpacity={fillOpacity * 2.2} /><polygon points="12,40 16,28 18,40" fill={stroke} fillOpacity={fillOpacity * 2.2} />
        </g>
      )

    case 'resource-quarry':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="28" width="32" height="12" fill={stroke} fillOpacity={fillOpacity} strokeWidth={strokeWidth * 1.2} /><rect x="14" y="18" width="20" height="10" fill={stroke} fillOpacity={fillOpacity * 1.4} strokeWidth={strokeWidth * 1.2} /><rect x="18" y="10" width="12" height="8" fill={stroke} fillOpacity={fillOpacity * 1.8} strokeWidth={strokeWidth * 1.2} />
        </g>
      )

    case 'titan-bones':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 8 38 C 12 18, 18 10, 24 10 C 30 10, 36 18, 40 38" strokeWidth={strokeWidth * 1.4} fill="none" /><path d="M 12 38 C 16 22, 20 16, 24 16 C 28 16, 32 22, 36 38" strokeWidth={strokeWidth * 1.1} fill="none" /><line x1="24" y1="8" x2="24" y2="40" strokeWidth={strokeWidth * 1.3} />
        </g>
      )

    case 'megalith-ring':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <rect x="10" y="16" width="6" height="24" fill={stroke} fillOpacity={fillOpacity * 1.5} /><rect x="32" y="16" width="6" height="24" fill={stroke} fillOpacity={fillOpacity * 1.5} /><rect x="8" y="12" width="32" height="6" rx="1" fill={stroke} fillOpacity={fillOpacity * 2} /><rect x="22" y="20" width="4" height="20" fill={stroke} fillOpacity={fillOpacity} />
        </g>
      )

    case 'obelisk-spires':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="24,4 20,10 21,40 27,40 28,10" fill={stroke} fillOpacity={fillOpacity * 1.8} strokeWidth={strokeWidth * 1.2} /><polygon points="24,4 20,10 28,10" fill={stroke} /><polygon points="12,18 10,22 11,40 15,40 16,22" fill={stroke} fillOpacity={fillOpacity} strokeWidth={strokeWidth} />
        </g>
      )

    case 'landmark-arch':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 40 L 10 16 C 14 8, 34 8, 38 16 L 42 40 L 32 40 L 30 22 C 28 16, 20 16, 18 22 L 16 40 Z" fill={stroke} fillOpacity={fillOpacity * 1.6} strokeWidth={strokeWidth * 1.3} />
        </g>
      )

    case 'ruins-temple':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="6,16 24,6 42,16" fill={stroke} fillOpacity={fillOpacity} strokeWidth={strokeWidth * 1.2} /><rect x="10" y="16" width="4" height="24" fill={stroke} /><rect x="22" y="16" width="4" height="24" fill={stroke} /><rect x="34" y="24" width="4" height="16" fill={stroke} /><line x1="4" y1="40" x2="44" y2="40" strokeWidth={strokeWidth * 1.4} />
        </g>
      )

    case 'petrified-wood':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="16" cy="24" rx="8" ry="5" fill={stroke} fillOpacity={fillOpacity * 1.5} /><ellipse cx="16" cy="24" rx="4" ry="2.5" fill="none" strokeWidth={strokeWidth * 0.9} /><line x1="8" y1="24" x2="8" y2="40" /><line x1="24" y1="24" x2="24" y2="40" /><ellipse cx="34" cy="28" rx="7" ry="4" fill={stroke} fillOpacity={fillOpacity * 1.5} /><line x1="27" y1="28" x2="27" y2="42" /><line x1="41" y1="28" x2="41" y2="42" />
        </g>
      )

    case 'sacred-grove':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="24" cy="18" r="10" fill={stroke} fillOpacity={fillOpacity * 1.5} /><line x1="24" y1="28" x2="24" y2="42" strokeWidth={strokeWidth * 1.4} /><circle cx="24" cy="18" r="3" fill="#fafaf9" /><circle cx="16" cy="16" r="1.5" fill="#fafaf9" /><circle cx="32" cy="16" r="1.5" fill="#fafaf9" /><circle cx="24" cy="11" r="1.5" fill="#fafaf9" />
        </g>
      )

    case 'ley-nexus':
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="24" cy="24" r="6" fill={stroke} fillOpacity={fillOpacity * 2} /><line x1="6" y1="6" x2="42" y2="42" strokeWidth={strokeWidth * 1.3} strokeDasharray="3 2" /><line x1="42" y1="6" x2="6" y2="42" strokeWidth={strokeWidth * 1.3} strokeDasharray="3 2" /><circle cx="24" cy="24" r="14" strokeWidth={strokeWidth * 1.1} strokeDasharray="4 2" fill="none" />
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
  if (tile.relief === 'hills') return 'hill-rolling'
  if (tile.flora === 'forest') return 'forest-deciduous'
  if (tile.flora === 'jungle') return 'jungle-dense'
  if (tile.overlay === 'cave') return 'cave-maw'
  if (tile.overlay === 'ruins') return 'megalith-ring'
  if (tile.overlay === 'myth') return 'sacred-grove'
  if (tile.terrain === 'mountain') return 'mountain-peak'
  if (tile.terrain === 'desert') return 'desert-dunes'
  if (tile.terrain === 'swamp') return 'swamp-mangrove'
  return null
}
