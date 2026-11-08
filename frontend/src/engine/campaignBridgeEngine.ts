/**
 * Campaign Bridge Engine
 *
 * Translates co-created world maps, historical chronicles, and faction codices
 * into actionable TTRPG (D&D 5e, Pathfinder, OSR) tabletop campaign artifacts:
 * - Playable Adventure Hooks & Rumor Tables
 * - Starting Adventure Locations & Region Environs
 * - Session Zero Campaign Primer (1-page player handout)
 * - Creative Sparks & Provocative Story Questions
 */

import { MapState, WorldEntity, DrawRecord, TerrainType } from './types'

export type QuestCategory =
  | 'dungeon_crawl'
  | 'political_intrigue'
  | 'wilderness_expedition'
  | 'mythic_investigation'

export interface CampaignQuestHook {
  id: string
  title: string
  category: QuestCategory
  location: string
  coord?: { col: number; row: number }
  premise: string
  tavernRumor: string
  complication: string
  suggestedTier: 'Tier 1 (Levels 1-4)' | 'Tier 2 (Levels 5-10)' | 'Tier 3 (Levels 11-16)'
  involvedEntityIds: string[]
}

export interface SessionZeroPrimer {
  worldName: string
  pitch: string
  startingHub: {
    name: string
    coord?: { col: number; row: number }
    description: string
    localRumors: string[]
  }
  knownRegions: {
    name: string
    terrain: string
    vibe: string
  }[]
  factionsInPlay: {
    name: string
    category: string
    agenda: string
    stance: string
  }[]
  dungeonSites: {
    name: string
    origin: string
    peril: string
  }[]
}

export interface CreativeSpark {
  category: string
  question: string
  exampleIdea: string
}

export const CREATIVE_SPARKS: Record<string, CreativeSpark[]> = {
  geography: [
    {
      category: 'Geography & Landforms',
      question: 'What ancient cataclysm or sleeping titan formed this mountain spine?',
      exampleIdea: 'The peaks are the petrified ribcage of a primordial earth serpent slain in the Dawn Era.',
    },
    {
      category: 'Geography & Landforms',
      question: 'Why do seasonal storms always gather around this solitary canyon or lake?',
      exampleIdea: 'The water sits over a submerged planar rift that inhales thunderclouds each autumn equinox.',
    },
    {
      category: 'Geography & Landforms',
      question: 'What mineral or magical treasure makes this desolate wilderness fiercely contested?',
      exampleIdea: 'Veins of singing glass that ring with prophetic harmonies whenever moons align.',
    },
  ],
  ecology: [
    {
      category: 'Ecology & Strange Flora',
      question: 'What unexpected adaptation allows plant life to thrive in this harsh terrain?',
      exampleIdea: 'Bioluminescent moss that feeds on residual arcane radiation left by an ancient wizard tower.',
    },
    {
      category: 'Ecology & Strange Flora',
      question: 'What beast or guardian was driven out of this forest when civilization encroached?',
      exampleIdea: 'A solitary white stag whose hooves sprouted springs of sweet water wherever it rested.',
    },
  ],
  civilization: [
    {
      category: 'Civilization & Factions',
      question: 'What secret oath or treaty bound these two rival settlements together centuries ago?',
      exampleIdea: 'An annual exchange of noble heirs to serve as wardens of an ancient seal beneath the border river.',
    },
    {
      category: 'Civilization & Factions',
      question: 'What taboo or sacred law do all guilds and commoners strictly observe here?',
      exampleIdea: 'No iron weapons may be unsheathed inside the city walls after sundown on pain of blinding.',
    },
    {
      category: 'Civilization & Factions',
      question: 'Who really rules this capital behind the figurehead monarch or elder council?',
      exampleIdea: 'The Scribe Guild, who secretly edit the royal annals to erase bloodlines at will.',
    },
  ],
  myth: [
    {
      category: 'Myths, Relics & Ruins',
      question: 'What legendary hero or disaster broke the power of the first dynasty here?',
      exampleIdea: 'A peasant rebel who stole the sun-mirror from the high spire and shattered it into twelve shards.',
    },
    {
      category: 'Myths, Relics & Ruins',
      question: 'What relic still hums inside the sealed vaults beneath this crumbling ruin?',
      exampleIdea: 'An obsidian chalice that never empties of bitter black wine that grants visions of dead gods.',
    },
  ],
}

/**
 * Returns a random creative spark question to break player hesitation during turn rituals.
 */
export function getRandomCreativeSpark(domain?: string): CreativeSpark {
  const keys = Object.keys(CREATIVE_SPARKS)
  const selectedDomain = domain && CREATIVE_SPARKS[domain] ? domain : keys[Math.floor(Math.random() * keys.length)]
  const sparks = CREATIVE_SPARKS[selectedDomain]
  return sparks[Math.floor(Math.random() * sparks.length)]
}

/**
 * Synthesizes dynamic, ready-to-run TTRPG adventure hooks based directly
 * on the actual tiles, settlements, ruins, and factions co-created on the board.
 */
export function generateCampaignAdventureHooks(
  map: MapState,
  entities: WorldEntity[] = [],
  _history: DrawRecord[] = []
): CampaignQuestHook[] {
  const hooks: CampaignQuestHook[] = []

  // 1. Find all settlement and city hubs
  const settlementTiles: { col: number; row: number; label?: string; terrain: TerrainType }[] = []
  const ruinTiles: { col: number; row: number; label?: string; terrain: TerrainType }[] = []
  const anomalyTiles: { col: number; row: number; label?: string; terrain: TerrainType }[] = []

  for (let r = 0; r < map.height; r++) {
    for (let c = 0; c < map.width; c++) {
      const tile = map.tiles[`${c},${r}`]
      if (!tile) continue

      const hasSettlement =
        tile.overlay === 'settlement' ||
        tile.overlay === 'town' ||
        tile.overlay === 'city' ||
        tile.overlay === 'capital' ||
        (tile.slots || []).some((s) => s.category === 'settlement')

      const hasRuin =
        tile.overlay === 'ruins' ||
        tile.overlay === 'monument' ||
        (tile.slots || []).some((s) => s.category === 'structure')

      const hasAnomaly =
        tile.overlay === 'myth' ||
        tile.overlay === 'cave' ||
        (tile.slots || []).some((s) => s.category === 'myth')

      if (hasSettlement) settlementTiles.push({ col: c, row: r, label: tile.label, terrain: tile.terrain })
      if (hasRuin) ruinTiles.push({ col: c, row: r, label: tile.label, terrain: tile.terrain })
      if (hasAnomaly) anomalyTiles.push({ col: c, row: r, label: tile.label, terrain: tile.terrain })
    }
  }

  // Hook 1: Dungeon Crawl in Co-Created Ruins
  if (ruinTiles.length > 0) {
    const ruin = ruinTiles[0]
    const siteName = ruin.label || `The Lost Vaults of (${ruin.col}, ${ruin.row})`
    hooks.push({
      id: 'hook-dungeon-1',
      title: `The Sinking Tombs of ${siteName}`,
      category: 'dungeon_crawl',
      location: siteName,
      coord: { col: ruin.col, row: ruin.row },
      premise: `Carved during the earliest epoch amidst the ${ruin.terrain}, this subterranean complex was consecrated before ancient wars sealed its bronze gates.`,
      tavernRumor: `"The tremors last week opened a fissure near ${siteName}. You can hear temple bells ringing from deep underground at midnight."`,
      complication: `A rival mercenary company has already entered the upper level and is setting traps for unwary explorers.`,
      suggestedTier: 'Tier 1 (Levels 1-4)',
      involvedEntityIds: entities.slice(0, 1).map((e) => e.id),
    })
  } else {
    // Fallback dungeon hook
    hooks.push({
      id: 'hook-dungeon-fallback',
      title: 'The Sunken Barrow of the First King',
      category: 'dungeon_crawl',
      location: 'The Eastern Badlands',
      premise: 'A forgotten tomb dating back to the Dawn Era has begun weeping silver ichor, corrupting the local watershed.',
      tavernRumor: '"Grave-robbers returned from the eastern hills with silver coins that melt in daylight."',
      complication: 'The guardian wraith cannot be destroyed until the treaty etched upon its breastplate is read aloud.',
      suggestedTier: 'Tier 1 (Levels 1-4)',
      involvedEntityIds: [],
    })
  }

  // Hook 2: Political Intrigue between Factions
  const societies = entities.filter((e) => e.category === 'society')
  if (societies.length >= 2) {
    const factionA = societies[0]
    const factionB = societies[1]
    hooks.push({
      id: 'hook-politics-1',
      title: `The Shadow Treaty: ${factionA.name} vs. ${factionB.name}`,
      category: 'political_intrigue',
      location: settlementTiles[0]?.label || 'The Border March',
      coord: settlementTiles[0] ? { col: settlementTiles[0].col, row: settlementTiles[0].row } : undefined,
      premise: `Tensions between ${factionA.name} and ${factionB.name} have reached a boiling point after an emissary was poisoned with wyrmbane orchid.`,
      tavernRumor: `"Both factions are secretly hiring adventurers to steal the ancestral census ledger before the autumn equinox."`,
      complication: `The assassin was actually paid by a third shadowy cult seeking to provoke open war.`,
      suggestedTier: 'Tier 2 (Levels 5-10)',
      involvedEntityIds: [factionA.id, factionB.id],
    })
  } else if (entities.length > 0) {
    const entity = entities[0]
    hooks.push({
      id: 'hook-politics-fallback',
      title: `The Disputed Succession of ${entity.name}`,
      category: 'political_intrigue',
      location: entity.name,
      premise: `Following an era of expansion, two rival bloodlines within ${entity.name} claim the high throne.`,
      tavernRumor: '"The royal guards are quietly arresting scholars who remember the true genealogies."',
      complication: 'An impostor holds the sovereign seal, backed by foreign coin.',
      suggestedTier: 'Tier 2 (Levels 5-10)',
      involvedEntityIds: [entity.id],
    })
  }

  // Hook 3: Wilderness Expedition & Mythic Anomaly
  if (anomalyTiles.length > 0) {
    const anomaly = anomalyTiles[0]
    const siteName = anomaly.label || `The Astral Nexus of (${anomaly.col}, ${anomaly.row})`
    hooks.push({
      id: 'hook-wilderness-1',
      title: `Expedition to ${siteName}`,
      category: 'wilderness_expedition',
      location: siteName,
      coord: { col: anomaly.col, row: anomaly.row },
      premise: `Peculiar weather distortions and aurora flares radiate from ${siteName}, drawing wandering pilgrims and territorial beasts.`,
      tavernRumor: `"Any bird that flies over that region loses its feathers and sings in archaic High Elvish."`,
      complication: `The anomaly is expanding by one league each new moon, threatening the nearest trade road.`,
      suggestedTier: 'Tier 2 (Levels 5-10)',
      involvedEntityIds: [],
    })
  } else {
    hooks.push({
      id: 'hook-wilderness-fallback',
      title: 'The Bleeding Monolith of the Wilds',
      category: 'wilderness_expedition',
      location: 'The Frontier Reaches',
      premise: 'A standing stone etched with pre-creation runes has begun weeping warm blood into the mountain stream.',
      tavernRumor: '"Hunters report beasts gathering around the stone as if listening to a sermon."',
      complication: 'Touching the monolith grants supernatural strength for one day, but robs the user of the ability to sleep.',
      suggestedTier: 'Tier 1 (Levels 1-4)',
      involvedEntityIds: [],
    })
  }

  // Hook 4: Cataclysm / Mythic Investigation
  const mythicEntities = entities.filter((e) => e.category === 'myth' || e.category === 'species')
  if (mythicEntities.length > 0) {
    const myth = mythicEntities[0]
    hooks.push({
      id: 'hook-mythic-1',
      title: `The Awakening of ${myth.name}`,
      category: 'mythic_investigation',
      location: 'The Deep Wilds',
      premise: `Chronicles foretold that when three epochs ended, the dormant power of ${myth.name} would shake the pillars of the continent.`,
      tavernRumor: `"Old seers in the hills claim their dreams have gone black with the silhouette of ${myth.name}."`,
      complication: `The relics required to placate ${myth.name} are scattered across three hostile factions' vaults.`,
      suggestedTier: 'Tier 3 (Levels 11-16)',
      involvedEntityIds: [myth.id],
    })
  }

  return hooks
}

/**
 * Generates an executive 1-page Session Zero Campaign Primer
 * that the Game Master can export or print out for players before Session 1.
 */
export function generateSessionZeroPrimer(
  worldName: string,
  map: MapState,
  entities: WorldEntity[] = [],
  history: DrawRecord[] = []
): SessionZeroPrimer {
  // Determine starting hub
  let hubName = `${worldName} Crossroads`
  let hubCoord: { col: number; row: number } | undefined

  for (let r = 0; r < map.height; r++) {
    for (let c = 0; c < map.width; c++) {
      const tile = map.tiles[`${c},${r}`]
      if (tile && (tile.overlay === 'capital' || tile.overlay === 'city' || tile.overlay === 'town')) {
        hubName = tile.label || `${worldName} Settlement`
        hubCoord = { col: c, row: r }
        break
      }
    }
    if (hubCoord) break
  }

  // Prominent regions
  const knownRegions: { name: string; terrain: string; vibe: string }[] = []
  const terrainCounts: Record<string, number> = {}
  for (const t of Object.values(map.tiles)) {
    terrainCounts[t.terrain] = (terrainCounts[t.terrain] || 0) + 1
  }

  const dominantTerrain = Object.entries(terrainCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'plains'

  knownRegions.push({
    name: 'The Central Heartland',
    terrain: dominantTerrain,
    vibe: 'Cradle of the primary settlements, crisscrossed by trade roads and seasonal caravans.',
  })

  // Factions in play
  const factionsInPlay = entities.map((ent) => ({
    name: ent.name,
    category: ent.category.toUpperCase(),
    agenda: ent.traits?.[0] || 'Preservation of sovereign autonomy and border defense.',
    stance: ent.status === 'extinct' ? 'Fallen / Mythic Memory' : 'Active Power',
  }))

  // Dungeon Sites
  const dungeonSites: { name: string; origin: string; peril: string }[] = []
  for (const t of Object.values(map.tiles)) {
    if (t.overlay === 'ruins' || (t.slots || []).some((s) => s.category === 'structure')) {
      dungeonSites.push({
        name: t.label || `The Ruin of (${t.col}, ${t.row})`,
        origin: 'Built in a bygone age before the turning of the realm.',
        peril: 'Haunted by ancestral shades and unexploded arcane wards.',
      })
    }
  }

  if (dungeonSites.length === 0) {
    dungeonSites.push({
      name: 'The Whispering Caverns',
      origin: 'Natural subterranean labyrinth expanded during the wars of antiquity.',
      peril: 'Submerged passageways and territorial subterranean apex predators.',
    })
  }

  const pitch = `A living setting forged across ${history.length} consecrated historical turns. Once shaped by primal cataclysms, ${worldName} now teeters between the ambitions of sovereign factions and the forgotten perils sleeping beneath its ancient soil.`

  return {
    worldName,
    pitch,
    startingHub: {
      name: hubName,
      coord: hubCoord,
      description: `A bustling nexus situated along the frontier, where caravan masters, sellswords, and scholars gather to trade news of the untamed wilderness.`,
      localRumors: [
        `"Outlying farmsteads report finding archaic coin stamped with gods no living priest worships."`,
        `"The road north is closed after sunset; merchants whisper of standing stones that change positions in the fog."`,
        `"The guildmaster is paying three purses of gold for anyone who can map the eastern waterway."`,
      ],
    },
    knownRegions,
    factionsInPlay,
    dungeonSites: dungeonSites.slice(0, 4),
  }
}
