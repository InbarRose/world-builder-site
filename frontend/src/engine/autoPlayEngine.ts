import {
  JOKER,
  STAGE_POWERS,
  buildShuffledDeck,
  calculateEpochYear,
  getNextStage,
  isFantasticalCard,
} from './deckEngine'
import { createInitialMap, paintTile } from './mapEngine'
import {
  BOT_PERSONALITIES,
  MYTH_PRESETS,
  SOCIETY_PRESETS,
  SPECIES_PRESETS,
} from './presets'
import { cloneMapState, recordTurnSnapshot } from './storageService'
import {
  BotPersonalityId,
  Card,
  DrawRecord,
  MapTile,
  StageId,
  TerrainType,
  WorldEntity,
  WorldState,
} from './types'

/**
 * Deterministic string hash + Mulberry32 PRNG
 */
export function createSeededRng(seed: string): () => number {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  let a = (h ^ (h >>> 16)) >>> 0
  if (a === 0) a = 0xdeadbeef

  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pickRandom<T>(items: T[], rng: () => number): T {
  const idx = Math.floor(rng() * items.length)
  return items[Math.min(idx, items.length - 1)]
}

const REGION_NAMES = [
  'Whispering',
  'Shattered',
  'Emerald',
  'Crimson',
  'Obsidian',
  'Sunlit',
  'Silver',
  'Mistveil',
  'Iron',
  'Starfall',
  'Amber',
  'Ashen',
  'Frostpeak',
  'Verdant',
  'Sapphire',
  'Golden',
]

const LANDMARK_NOUNS: Record<string, string[]> = {
  mountain: ['Peaks', 'Spire', 'Ridge', 'Crag', 'Crown'],
  canyon: ['Gorge', 'Rift', 'Chasm', 'Abyss', 'Ravine'],
  water: ['River', 'Falls', 'Bay', 'Fjord', 'Straits'],
  forest: ['Weald', 'Canopy', 'Woods', 'Grove', 'Timberlands'],
  settlement: ['Outpost', 'Crossing', 'Hearth', 'Haven', 'Camp'],
  city: ['Citadel', 'spire', 'Bastion', 'Harbor', 'Sanctuary'],
  monument: ['Obelisk', 'Colossus', 'Grand Archive', 'Sky-Bridge', 'Temple'],
}

function findBestLandTile(
  world: WorldState,
  personality: BotPersonalityId,
  rng: () => number,
  preferUnlabeled: boolean = true
): MapTile {
  const allTiles = Object.values(world.map.tiles)
  const landTiles = allTiles.filter((t) => t.terrain !== 'ocean')
  const pool = landTiles.length > 0 ? landTiles : allTiles
  const preferredTerrains = BOT_PERSONALITIES[personality]?.preferredTerrains || ['plains']

  const scored = pool.map((tile) => {
    let score = 1 + rng() * 2
    if (preferredTerrains.includes(tile.terrain)) score += 3
    if (preferUnlabeled && !tile.label) score += 1.5
    if (!preferUnlabeled && (tile.label || tile.overlay !== 'none')) score += 2
    return { tile, score }
  })

  scored.sort((a, b) => b.score - a.score)
  const topCandidates = scored.slice(0, Math.min(6, scored.length))
  return pickRandom(topCandidates, rng).tile
}

export function ensurePreStageEntities(
  world: WorldState,
  stage: StageId,
  rng: () => number
): WorldState {
  let updatedMap = cloneMapState(world.map)
  const updatedEntities = [...world.entities]

  if (stage === 'primal') {
    const existingSpecies = updatedEntities.filter((e) => e.category === 'species')
    const targetCount = Math.max(2, world.players.length)
    if (existingSpecies.length < targetCount) {
      const usedNames = new Set(existingSpecies.map((s) => s.name))
      const availablePresets = SPECIES_PRESETS.filter((p) => !usedNames.has(p.name))

      const needed = targetCount - existingSpecies.length
      for (let i = 0; i < needed && i < availablePresets.length; i++) {
        const player = world.players[i % world.players.length]
        const preset = availablePresets[i]
        const originTile = findBestLandTile(world, player.personality, rng, true)
        const entityId = `entity_sp_${world.drawHistory.length}_${i}_${Math.floor(rng() * 10000)}`

        const newSpecies: WorldEntity = {
          id: entityId,
          name: preset.name,
          category: 'species',
          stageCreated: 'primal',
          originTileId: originTile.id,
          description: preset.description,
          traits: [...preset.traits],
          abilities: [...preset.abilities],
          status: 'Flourishing',
          icon: preset.icon,
          color: preset.color,
          archetype: preset.archetype,
        }
        updatedEntities.push(newSpecies)

        updatedMap = paintTile(updatedMap, originTile.col, originTile.row, {
          overlay: originTile.overlay === 'none' ? 'settlement' : originTile.overlay,
          territoryId: entityId,
          label: originTile.label || `${preset.name.split(' ')[0]} Cradle`,
          linkedEntityIds: [...originTile.linkedEntityIds, entityId],
        })
      }
    }
  } else if (stage === 'civilization') {
    const existingSocieties = updatedEntities.filter((e) => e.category === 'society')
    const targetCount = Math.max(2, world.players.length)
    if (existingSocieties.length < targetCount) {
      const usedNames = new Set(existingSocieties.map((s) => s.name))
      const availablePresets = SOCIETY_PRESETS.filter((p) => !usedNames.has(p.name))

      const needed = targetCount - existingSocieties.length
      for (let i = 0; i < needed && i < availablePresets.length; i++) {
        const player = world.players[i % world.players.length]
        const preset = availablePresets[i]
        const capitalTile = findBestLandTile(world, player.personality, rng, false)
        const entityId = `entity_soc_${world.drawHistory.length}_${i}_${Math.floor(rng() * 10000)}`

        const newSociety: WorldEntity = {
          id: entityId,
          name: preset.name,
          category: 'society',
          stageCreated: 'civilization',
          originTileId: capitalTile.id,
          description: preset.description,
          traits: [...preset.traits],
          abilities: [...preset.abilities],
          status: 'Expanding',
          icon: preset.icon,
          color: preset.color,
          archetype: preset.archetype,
        }
        updatedEntities.push(newSociety)

        updatedMap = paintTile(updatedMap, capitalTile.col, capitalTile.row, {
          overlay: 'capital',
          territoryId: entityId,
          hasRoad: true,
          label: `${preset.name.split(' ')[0]} Capital`,
          linkedEntityIds: [...capitalTile.linkedEntityIds, entityId],
        })
      }
    }
  }

  return {
    ...world,
    map: updatedMap,
    entities: updatedEntities,
  }
}

export function executeAutomatedTurn(
  initialWorld: WorldState,
  card: Card,
  rng: () => number
): WorldState {
  const stage = initialWorld.currentStage
  const world = ensurePreStageEntities(initialWorld, stage, rng)

  const players = world.players.length > 0 ? world.players : []
  const activePlayer = players[world.currentPlayerIndex % Math.max(1, players.length)]
  const personality: BotPersonalityId = activePlayer?.personality || 'shaper'
  const personalityMeta = BOT_PERSONALITIES[personality]

  const isFantastical =
    isFantasticalCard(card) && world.generationSettings.fantasyLevel !== 'low'
  const isDisaster = card.value === 'A'
  const isJoker = card.value === JOKER

  // Determine effective suit for Joker based on personality preference
  const effectiveSuit = isJoker
    ? personality === 'shaper' || personality === 'architect' || personality === 'catalyst'
      ? '♠'
      : personality === 'naturalist' || personality === 'chronicler'
      ? '♥'
      : '♦'
    : card.suit || '♠'

  const powerName = isDisaster
    ? 'Natural Disaster'
    : STAGE_POWERS[stage]?.[effectiveSuit]?.name || 'World Power'

  const moveId = world.drawHistory.length + 1
  const eventId = `draw_${moveId}_${Math.floor(rng() * 100000)}`
  const adj = pickRandom(REGION_NAMES, rng)

  let updatedMap = cloneMapState(world.map)
  const updatedEntities: WorldEntity[] = world.entities.map((e) => ({
    ...e,
    traits: [...e.traits],
    abilities: e.abilities ? [...e.abilities] : [],
  }))
  const linkedTileIds: string[] = []
  const linkedEntityIds: string[] = []
  let note = ''

  if (isDisaster) {
    const targetTile = findBestLandTile(world, personality, rng, false)
    linkedTileIds.push(targetTile.id)
    if (stage === 'genesis') {
      updatedMap = paintTile(updatedMap, targetTile.col, targetTile.row, {
        terrain: 'volcano',
        relief: 'volcano',
        label: `Mount ${adj}`,
        linkedEventIds: [...targetTile.linkedEventIds, eventId],
      })
      note = `[Cataclysm] A primordial tectonic upheaval erupts at (${targetTile.id}), raising the volcanic cone of Mount ${adj} and reshaping the surrounding coastline.`
    } else if (stage === 'primal') {
      updatedMap = paintTile(updatedMap, targetTile.col, targetTile.row, {
        terrain: 'swamp',
        flora: 'marsh',
        overlay: 'ruins',
        linkedEventIds: [...targetTile.linkedEventIds, eventId],
      })
      note = `[Great Deluge] A世代-spanning flood inundates (${targetTile.id}), turning ancient hunting grounds into sunken marshlands and forcing early tribes to migrate.`
    } else if (stage === 'civilization') {
      updatedMap = paintTile(updatedMap, targetTile.col, targetTile.row, {
        overlay: 'ruins',
        relief: 'canyon',
        linkedEventIds: [...targetTile.linkedEventIds, eventId],
      })
      note = `[Imperial Calamity] An earthquake and arcane storm shatter the fortifications at (${targetTile.id}), leaving ancient ruins in their wake.`
    } else {
      updatedMap = paintTile(updatedMap, targetTile.col, targetTile.row, {
        overlay: 'historic_site',
        linkedEventIds: [...targetTile.linkedEventIds, eventId],
      })
      note = `[Ominous Cataclysm] The ${adj} Comet blazes across the sky above (${targetTile.id}), triggering upheaval and prophetic unrest across the realms.`
    }
  } else if (stage === 'genesis') {
    const targetTile = findBestLandTile(world, personality, rng, true)
    linkedTileIds.push(targetTile.id)

    if (effectiveSuit === '♠') {
      // Earth
      const isCanyon = rng() > 0.65
      const newTerrain: TerrainType = isCanyon ? 'canyon' : 'mountain'
      const noun = pickRandom(LANDMARK_NOUNS[isCanyon ? 'canyon' : 'mountain'], rng)
      const label = `${adj} ${noun}`
      updatedMap = paintTile(updatedMap, targetTile.col, targetTile.row, {
        terrain: newTerrain,
        relief: isCanyon ? 'canyon' : 'mountain',
        label,
        linkedEventIds: [...targetTile.linkedEventIds, eventId],
      })
      note = isFantastical
        ? `✨ [Fantastical Earth] Floating sky-crags and crystalline peaks rise at ${label} (${targetTile.id}), defying gravity.`
        : `Colossal ${isCanyon ? 'canyons' : 'mountain peaks'} are forged at ${label} (${targetTile.id}).`
    } else if (effectiveSuit === '♥') {
      // Water
      const noun = pickRandom(LANDMARK_NOUNS.water, rng)
      const label = `${adj} ${noun}`
      updatedMap = paintTile(updatedMap, targetTile.col, targetTile.row, {
        hasRiver: true,
        secondaryTerrain: 'water',
        pattern: 'diagonal',
        label,
        linkedEventIds: [...targetTile.linkedEventIds, eventId],
      })
      note = isFantastical
        ? `✨ [Fantastical Water] The luminous waters of ${label} (${targetTile.id}) flow with restorative, shimmering currents.`
        : `The ${label} carves a fertile river valley through (${targetTile.id}) toward the sea.`
    } else if (effectiveSuit === '♣') {
      // Plant
      const isJungle = rng() > 0.6
      const noun = pickRandom(LANDMARK_NOUNS.forest, rng)
      const label = `${adj} ${noun}`
      updatedMap = paintTile(updatedMap, targetTile.col, targetTile.row, {
        terrain: isJungle ? 'jungle' : 'forest',
        flora: isJungle ? 'jungle' : 'forest',
        // Keep relief if already hills/mountain so we get Mountain + Forest composite!
        relief: targetTile.relief !== 'none' ? targetTile.relief : 'hills',
        label,
        linkedEventIds: [...targetTile.linkedEventIds, eventId],
      })
      note = isFantastical
        ? `✨ [Fantastical Plant] Sentient, bioluminescent world-trees awaken in the ${label} (${targetTile.id}).`
        : `Dense ${isJungle ? 'tropical jungles' : 'ancient woodlands'} spread across the ${
            targetTile.relief === 'mountain' ? 'mountain slopes' : 'highlands'
          } of ${label} (${targetTile.id}).`
    } else {
      // Feature
      const label = `${adj} Cavern`
      updatedMap = paintTile(updatedMap, targetTile.col, targetTile.row, {
        overlay: isFantastical ? 'myth' : 'cave',
        label,
        linkedEventIds: [...targetTile.linkedEventIds, eventId],
      })
      note = isFantastical
        ? `✨ [Fantastical Feature] A ley-line nexus and singing crystal grotto form at ${label} (${targetTile.id}).`
        : `A natural wonder and deep geothermal cavern system is discovered at ${label} (${targetTile.id}).`
    }
  } else if (stage === 'primal') {
    const speciesList = updatedEntities.filter((e) => e.category === 'species')
    const chosenSpecies =
      speciesList.length > 0 ? pickRandom(speciesList, rng) : undefined
    const targetTile = findBestLandTile(world, personality, rng, false)
    linkedTileIds.push(targetTile.id)
    if (chosenSpecies) linkedEntityIds.push(chosenSpecies.id)
    const spName = chosenSpecies?.name || 'Early Tribes'

    if (effectiveSuit === '♠') {
      // Settlement
      const noun = pickRandom(LANDMARK_NOUNS.settlement, rng)
      const label = `${adj} ${noun}`
      updatedMap = paintTile(updatedMap, targetTile.col, targetTile.row, {
        overlay: 'settlement',
        territoryId: chosenSpecies?.id || targetTile.territoryId,
        label,
        linkedEventIds: [...targetTile.linkedEventIds, eventId],
        linkedEntityIds: chosenSpecies
          ? Array.from(new Set([...targetTile.linkedEntityIds, chosenSpecies.id]))
          : targetTile.linkedEntityIds,
      })
      note = isFantastical
        ? `✨ [Fantastical Settlement] ${spName} establish ${label} (${targetTile.id}), a sanctuary woven into living elemental stone.`
        : `${spName} found the thriving settlement of ${label} at (${targetTile.id}).`
    } else if (effectiveSuit === '♥') {
      // Tradition
      const tradition = isFantastical
        ? `${adj} Astral Communion`
        : `Rite of the ${adj} Harvest`
      if (chosenSpecies && !chosenSpecies.traits.includes(tradition)) {
        chosenSpecies.traits.push(tradition)
      }
      updatedMap = paintTile(updatedMap, targetTile.col, targetTile.row, {
        linkedEventIds: [...targetTile.linkedEventIds, eventId],
      })
      note = `${spName} adopt the cultural tradition of "${tradition}" near (${targetTile.id}), uniting their clans.`
    } else if (effectiveSuit === '♣') {
      // Resource
      const resourceName = isFantastical ? `${adj} Aether-Ore` : `${adj} Iron & Timber`
      updatedMap = paintTile(updatedMap, targetTile.col, targetTile.row, {
        overlay: targetTile.overlay === 'none' ? 'resource' : targetTile.overlay,
        tags: Array.from(new Set([...targetTile.tags, resourceName])),
        linkedEventIds: [...targetTile.linkedEventIds, eventId],
      })
      note = `${spName} harness rich deposits of ${resourceName} at (${targetTile.id}), fueling their early growth.`
    } else {
      // Skill
      const skillName = isFantastical ? `${adj} Rune-Shaping` : `${adj} Navigation & Smithing`
      if (chosenSpecies) {
        chosenSpecies.abilities = Array.from(
          new Set([...(chosenSpecies.abilities || []), skillName])
        )
      }
      updatedMap = paintTile(updatedMap, targetTile.col, targetTile.row, {
        linkedEventIds: [...targetTile.linkedEventIds, eventId],
      })
      note = `${spName} master the art of ${skillName} at (${targetTile.id}), setting them apart from neighboring peoples.`
    }
  } else if (stage === 'civilization') {
    const societyList = updatedEntities.filter((e) => e.category === 'society')
    const chosenSociety =
      societyList.length > 0 ? pickRandom(societyList, rng) : undefined
    const targetTile = findBestLandTile(world, personality, rng, false)
    linkedTileIds.push(targetTile.id)
    if (chosenSociety) linkedEntityIds.push(chosenSociety.id)
    const socName = chosenSociety?.name || 'The Realm'

    if (effectiveSuit === '♠') {
      // Construction
      const noun = pickRandom(LANDMARK_NOUNS.monument, rng)
      const label = `${adj} ${noun}`
      updatedMap = paintTile(updatedMap, targetTile.col, targetTile.row, {
        overlay: isFantastical ? 'monument' : 'castle',
        hasRoad: true,
        territoryId: chosenSociety?.id || targetTile.territoryId,
        label,
        linkedEventIds: [...targetTile.linkedEventIds, eventId],
      })
      note = isFantastical
        ? `✨ [Fantastical Construction] ${socName} erects the ${label} at (${targetTile.id}), an architectural wonder visible for leagues.`
        : `${socName} constructs the fortified ${label} and paved trade roads across (${targetTile.id}).`
    } else if (effectiveSuit === '♥') {
      // Enlightenment
      const idea = isFantastical ? `Arcane Philosophy of ${adj}` : `${adj} Code of Civic Law`
      if (chosenSociety && !chosenSociety.traits.includes(idea)) {
        chosenSociety.traits.push(idea)
      }
      updatedMap = paintTile(updatedMap, targetTile.col, targetTile.row, {
        linkedEventIds: [...targetTile.linkedEventIds, eventId],
      })
      note = `Scholars of ${socName} usher in a golden age of enlightenment with the "${idea}" at (${targetTile.id}).`
    } else if (effectiveSuit === '♣') {
      // Expansion
      updatedMap = paintTile(updatedMap, targetTile.col, targetTile.row, {
        overlay: targetTile.overlay === 'none' ? 'town' : 'city',
        hasRoad: true,
        territoryId: chosenSociety?.id || targetTile.territoryId,
        label: targetTile.label || `Port ${adj}`,
        linkedEventIds: [...targetTile.linkedEventIds, eventId],
      })
      note = `${socName} expands its borders into (${targetTile.id}), establishing ${
        targetTile.label || `Port ${adj}`
      } and connecting it by road.`
    } else {
      // Diplomacy
      const otherSociety = societyList.find((s) => s.id !== chosenSociety?.id)
      if (otherSociety) linkedEntityIds.push(otherSociety.id)
      const partnerName = otherSociety?.name || 'neighboring free cities'
      updatedMap = paintTile(updatedMap, targetTile.col, targetTile.row, {
        hasRoad: true,
        linkedEventIds: [...targetTile.linkedEventIds, eventId],
      })
      note = `${socName} and ${partnerName} sign the ${adj} Concord at (${targetTile.id}), opening shared trade routes and embassies.`
    }
  } else {
    // Intrigue stage
    const societyList = updatedEntities.filter((e) => e.category === 'society')
    const chosenSociety =
      societyList.length > 0 ? pickRandom(societyList, rng) : undefined
    const rivalSociety = societyList.find((s) => s.id !== chosenSociety?.id)
    const targetTile = findBestLandTile(world, personality, rng, false)
    linkedTileIds.push(targetTile.id)
    if (chosenSociety) linkedEntityIds.push(chosenSociety.id)

    if (effectiveSuit === '♠') {
      // Conflict
      if (rivalSociety) linkedEntityIds.push(rivalSociety.id)
      updatedMap = paintTile(updatedMap, targetTile.col, targetTile.row, {
        overlay: 'battle',
        linkedEventIds: [...targetTile.linkedEventIds, eventId],
      })
      note = `⚔️ [Conflict] Forces of ${chosenSociety?.name || 'the Crown'} and ${
        rivalSociety?.name || 'the Rebel Coalition'
      } clash at the Battle of ${targetTile.label || `(${targetTile.id})`}.`
    } else if (effectiveSuit === '♥') {
      // Cooperation
      if (rivalSociety) linkedEntityIds.push(rivalSociety.id)
      updatedMap = paintTile(updatedMap, targetTile.col, targetTile.row, {
        overlay: targetTile.overlay === 'battle' ? 'city' : targetTile.overlay,
        linkedEventIds: [...targetTile.linkedEventIds, eventId],
      })
      note = `🤝 [Cooperation] ${chosenSociety?.name || 'Allied Realms'} and ${
        rivalSociety?.name || 'Free Guilds'
      } forge a grand alliance at (${targetTile.id}) to safeguard the realm.`
    } else if (effectiveSuit === '♣') {
      // Scheme
      const schemeName = `The ${adj} Conspiracy`
      updatedMap = paintTile(updatedMap, targetTile.col, targetTile.row, {
        linkedEventIds: [...targetTile.linkedEventIds, eventId],
      })
      note = `🗡️ [Scheme] Agents within ${
        chosenSociety?.name || 'the Royal Court'
      } set "${schemeName}" into motion at (${targetTile.id}), shifting the balance of power in secret.`
    } else {
      // Myth
      const mythPreset = pickRandom(MYTH_PRESETS, rng)
      const mythId = `entity_myth_${moveId}_${Math.floor(rng() * 10000)}`
      const newMyth: WorldEntity = {
        id: mythId,
        name: `${mythPreset.name} (${adj})`,
        category: 'myth',
        stageCreated: 'intrigue',
        originTileId: targetTile.id,
        description: mythPreset.description,
        traits: [...mythPreset.traits],
        abilities: [...mythPreset.abilities],
        status: 'Active',
        icon: mythPreset.icon,
        color: mythPreset.color,
        archetype: mythPreset.archetype,
      }
      updatedEntities.push(newMyth)
      linkedEntityIds.push(mythId)

      updatedMap = paintTile(updatedMap, targetTile.col, targetTile.row, {
        overlay: 'myth',
        label: targetTile.label || adj + ' Lair',
        linkedEventIds: [...targetTile.linkedEventIds, eventId],
        linkedEntityIds: [...targetTile.linkedEntityIds, mythId],
      })
      note = `✨ [Myth] Legend awakens at (${targetTile.id}): ${newMyth.name} — ${mythPreset.description}`
    }
  }

  const record: DrawRecord = {
    id: eventId,
    moveId,
    card,
    timestamp: new Date().toISOString(),
    stage,
    power: powerName,
    note: `${activePlayer ? `[${activePlayer.name} · ${personalityMeta.name}] ` : ''}${note}`,
    linkedTileIds,
    linkedEntityIds,
    epochYear: calculateEpochYear(stage, moveId),
    playerId: activePlayer?.id,
    playerName: activePlayer?.name,
    playerColor: activePlayer?.color,
    isAutoPlayed: true,
  }

  const nextPlayerIndex =
    players.length > 0 ? (world.currentPlayerIndex + 1) % players.length : 0

  const nextWorldState: WorldState = {
    ...world,
    map: updatedMap,
    entities: updatedEntities,
    drawHistory: [...world.drawHistory, record],
    currentPlayerIndex: nextPlayerIndex,
    updatedAt: new Date().toISOString(),
  }

  const snapshot = recordTurnSnapshot(nextWorldState, moveId)
  const existingSnapshots = (nextWorldState.snapshots || []).filter(
    (s) => s.moveId !== moveId
  )
  nextWorldState.snapshots = [...existingSnapshots, snapshot]

  return nextWorldState
}

export function autoPlayStage(
  world: WorldState,
  deck: Card[],
  maxTurns: number = 12
): { world: WorldState; deck: Card[] } {
  const rng = createSeededRng(
    `${world.generationSettings.seed}-${world.currentStage}-${world.drawHistory.length}`
  )
  let currentWorld = { ...world }
  let currentDeck =
    deck.length > 0 ? [...deck] : buildShuffledDeck(world.deckConfig, rng)

  const turnsToRun = Math.min(maxTurns, currentDeck.length)
  for (let i = 0; i < turnsToRun; i++) {
    const card = currentDeck.pop()!
    currentWorld = executeAutomatedTurn(currentWorld, card, rng)
  }

  return { world: currentWorld, deck: currentDeck }
}

export function autoPlayFullWorld(
  initialWorld: WorldState,
  turnsPerStage: number = 8
): WorldState {
  const seed = initialWorld.generationSettings.seed || 'world-seed-1'
  const rng = createSeededRng(seed)

  // Start fresh map using the selected geographyPreset and seed
  let currentWorld: WorldState = {
    ...initialWorld,
    currentStage: 'genesis',
    deckConfig: {
      ...initialWorld.deckConfig,
      selectedStage: 'genesis',
    },
    drawHistory: [],
    entities: [],
    snapshots: [],
    currentPlayerIndex: 0,
    map: createInitialMap(
      initialWorld.map.width,
      initialWorld.map.height,
      initialWorld.generationSettings.geographyPreset,
      rng
    ),
  }

  const stagesOrder: StageId[] = ['genesis', 'primal', 'civilization', 'intrigue']
  for (const stage of stagesOrder) {
    currentWorld = {
      ...currentWorld,
      currentStage: stage,
      deckConfig: {
        ...currentWorld.deckConfig,
        selectedStage: stage,
      },
    }
    const stageDeck = buildShuffledDeck(currentWorld.deckConfig, rng)
    const count = Math.min(turnsPerStage, stageDeck.length)
    for (let i = 0; i < count; i++) {
      const card = stageDeck.pop()!
      currentWorld = executeAutomatedTurn(currentWorld, card, rng)
    }
  }

  const nextStage = getNextStage(currentWorld.currentStage)
  if (!nextStage) {
    currentWorld.currentStage = 'intrigue'
  }

  return currentWorld
}
