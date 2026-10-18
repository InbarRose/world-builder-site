import { DEFAULT_DECK_CONFIG, STAGES, calculateEpochYear, getCardDisplay } from './deckEngine'
import { createDefaultTile, createInitialMap } from './mapEngine'
import { DEFAULT_PLAYERS } from './presets'
import {
  CURRENT_SCHEMA_VERSION,
  DrawRecord,
  StageId,
  TurnSnapshot,
  WorldState,
} from './types'

const STORAGE_WORLDS_KEY = 'wb_saved_worlds_v1'
const STORAGE_ACTIVE_ID_KEY = 'wb_active_world_id_v1'

export function createNewWorld(name: string = 'Untitled Realm', seed?: string): WorldState {
  const now = new Date().toISOString()
  const resolvedSeed =
    seed || `${name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'realm'}-${Math.floor(100 + Math.random() * 900)}`
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: `world_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || 'Untitled Realm',
    createdAt: now,
    updatedAt: now,
    deckConfig: { ...DEFAULT_DECK_CONFIG },
    currentStage: 'genesis',
    stageNotes: {},
    drawHistory: [],
    map: createInitialMap(),
    entities: [],
    players: DEFAULT_PLAYERS.map((p) => ({ ...p })),
    currentPlayerIndex: 0,
    companionMode: 'full-studio',
    generationSettings: {
      seed: resolvedSeed,
      geographyPreset: 'continent',
      fantasyLevel: 'medium',
      disasterIntensity: 'standard',
    },
    snapshots: [],
  }
}

export function migrateWorldState(raw: any): WorldState {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid world state object')
  }

  const base = createNewWorld(raw.name || 'Imported World')
  const stage: StageId = raw.currentStage || raw.deckConfig?.selectedStage || 'genesis'

  const rawHistory: unknown[] = Array.isArray(raw.drawHistory) ? raw.drawHistory : []
  const normalizedHistory: DrawRecord[] = rawHistory.map((item: any, idx: number) => {
    const moveId = typeof item.moveId === 'number' ? item.moveId : idx + 1
    const itemStage: StageId | undefined = item.stage || stage
    return {
      id: item.id || `draw_${Date.now()}_${idx}`,
      moveId,
      card: {
        suit: item.card?.suit || '',
        value: item.card?.value || '2',
        id: item.card?.id || `${item.card?.suit || ''}-${item.card?.value || '2'}`,
      },
      timestamp:
        typeof item.timestamp === 'string'
          ? item.timestamp
          : new Date(item.timestamp || Date.now()).toISOString(),
      stage: itemStage,
      power: item.power,
      note: item.note || '',
      linkedTileIds: Array.isArray(item.linkedTileIds) ? item.linkedTileIds : [],
      linkedEntityIds: Array.isArray(item.linkedEntityIds) ? item.linkedEntityIds : [],
      epochYear: item.epochYear || calculateEpochYear(itemStage, moveId),
      playerId: item.playerId,
      playerName: item.playerName,
      playerColor: item.playerColor,
      isAutoPlayed: Boolean(item.isAutoPlayed),
    }
  })

  let migratedMap = base.map
  if (raw.map && raw.map.tiles && typeof raw.map.tiles === 'object') {
    const width = Number(raw.map.width) || 20
    const height = Number(raw.map.height) || 12
    const normalizedTiles: Record<string, any> = {}
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        const key = `${c},${r}`
        const t = raw.map.tiles[key]
        if (t) {
          normalizedTiles[key] = {
            ...createDefaultTile(c, r, t.terrain || 'ocean'),
            ...t,
            id: key,
            col: c,
            row: r,
            tags: Array.isArray(t.tags) ? t.tags : [],
            linkedEventIds: Array.isArray(t.linkedEventIds) ? t.linkedEventIds : [],
            linkedEntityIds: Array.isArray(t.linkedEntityIds) ? t.linkedEntityIds : [],
          }
        } else {
          normalizedTiles[key] = createDefaultTile(c, r, 'ocean')
        }
      }
    }
    migratedMap = { width, height, tiles: normalizedTiles }
  }

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: raw.id || base.id,
    name: raw.name || 'Imported World',
    createdAt: raw.createdAt || raw.timestamp || base.createdAt,
    updatedAt: raw.updatedAt || new Date().toISOString(),
    deckConfig: {
      numberRange: raw.deckConfig?.numberRange || base.deckConfig.numberRange,
      faceCards: raw.deckConfig?.faceCards || base.deckConfig.faceCards,
      aceCount:
        typeof raw.deckConfig?.aceCount === 'number'
          ? raw.deckConfig.aceCount
          : base.deckConfig.aceCount,
      jokerCount:
        typeof raw.deckConfig?.jokerCount === 'number'
          ? raw.deckConfig.jokerCount
          : base.deckConfig.jokerCount,
      stagesEnabled:
        typeof raw.deckConfig?.stagesEnabled === 'boolean'
          ? raw.deckConfig.stagesEnabled
          : base.deckConfig.stagesEnabled,
      selectedStage: stage,
    },
    currentStage: stage,
    stageNotes: raw.stageNotes || {},
    drawHistory: normalizedHistory,
    map: migratedMap,
    entities: Array.isArray(raw.entities) ? raw.entities : [],
    players:
      Array.isArray(raw.players) && raw.players.length > 0
        ? raw.players
        : base.players,
    currentPlayerIndex:
      typeof raw.currentPlayerIndex === 'number' ? raw.currentPlayerIndex : 0,
    companionMode: raw.companionMode || 'full-studio',
    generationSettings: {
      ...base.generationSettings,
      ...(raw.generationSettings || {}),
    },
    snapshots: Array.isArray(raw.snapshots) ? raw.snapshots : [],
  }
}

export function cloneMapState(map: WorldState['map']): WorldState['map'] {
  const clonedTiles: WorldState['map']['tiles'] = {}
  for (const [k, v] of Object.entries(map.tiles)) {
    clonedTiles[k] = {
      ...v,
      tags: [...v.tags],
      linkedEventIds: [...v.linkedEventIds],
      linkedEntityIds: [...v.linkedEntityIds],
    }
  }
  return {
    width: map.width,
    height: map.height,
    tiles: clonedTiles,
  }
}

export function recordTurnSnapshot(world: WorldState, moveId: number): TurnSnapshot {
  return {
    moveId,
    currentStage: world.currentStage,
    currentPlayerIndex: world.currentPlayerIndex,
    map: cloneMapState(world.map),
    entities: world.entities.map((e) => ({
      ...e,
      traits: [...e.traits],
      abilities: e.abilities ? [...e.abilities] : [],
    })),
  }
}

export function rewindWorldToMove(world: WorldState, targetMoveId: number): WorldState {
  const keptHistory = world.drawHistory.filter((rec) => rec.moveId <= targetMoveId)
  const snapshots = world.snapshots || []
  const snapshot = snapshots.find((s) => s.moveId === targetMoveId)

  if (snapshot) {
    return {
      ...world,
      currentStage: snapshot.currentStage,
      deckConfig: {
        ...world.deckConfig,
        selectedStage: snapshot.currentStage,
      },
      currentPlayerIndex: snapshot.currentPlayerIndex,
      drawHistory: keptHistory,
      map: cloneMapState(snapshot.map),
      entities: snapshot.entities.map((e) => ({ ...e })),
      snapshots: snapshots.filter((s) => s.moveId <= targetMoveId),
      updatedAt: new Date().toISOString(),
    }
  }

  // Fallback if no snapshot was stored (e.g., manual turn without snapshot):
  // prune history and unlink any future events from tiles
  const validEventIds = new Set(keptHistory.map((r) => r.id))
  const cleanedTiles = cloneMapState(world.map)
  for (const tile of Object.values(cleanedTiles.tiles)) {
    tile.linkedEventIds = tile.linkedEventIds.filter((id) => validEventIds.has(id))
  }

  const lastTurn = keptHistory[keptHistory.length - 1]
  const restoredStage = lastTurn?.stage || 'genesis'

  return {
    ...world,
    currentStage: restoredStage,
    deckConfig: {
      ...world.deckConfig,
      selectedStage: restoredStage,
    },
    drawHistory: keptHistory,
    map: cleanedTiles,
    snapshots: snapshots.filter((s) => s.moveId <= targetMoveId),
    updatedAt: new Date().toISOString(),
  }
}

export function listSavedWorlds(): WorldState[] {
  try {
    const raw = localStorage.getItem(STORAGE_WORLDS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((item) => migrateWorldState(item))
  } catch (error) {
    console.error('Failed to read saved worlds from localStorage:', error)
    return []
  }
}

export function saveWorld(world: WorldState): WorldState {
  const updated: WorldState = {
    ...world,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
  }
  try {
    const worlds = listSavedWorlds()
    const index = worlds.findIndex((w) => w.id === updated.id)
    if (index >= 0) {
      worlds[index] = updated
    } else {
      worlds.unshift(updated)
    }
    localStorage.setItem(STORAGE_WORLDS_KEY, JSON.stringify(worlds))
    localStorage.setItem(STORAGE_ACTIVE_ID_KEY, updated.id)
  } catch (error) {
    console.error('Failed to save world to localStorage:', error)
  }
  return updated
}

export function deleteWorld(worldId: string): WorldState[] {
  try {
    const worlds = listSavedWorlds().filter((w) => w.id !== worldId)
    localStorage.setItem(STORAGE_WORLDS_KEY, JSON.stringify(worlds))
    const activeId = localStorage.getItem(STORAGE_ACTIVE_ID_KEY)
    if (activeId === worldId) {
      if (worlds.length > 0) {
        localStorage.setItem(STORAGE_ACTIVE_ID_KEY, worlds[0].id)
      } else {
        localStorage.removeItem(STORAGE_ACTIVE_ID_KEY)
      }
    }
    return worlds
  } catch (error) {
    console.error('Failed to delete world from localStorage:', error)
    return []
  }
}

export function getActiveWorld(): WorldState {
  const worlds = listSavedWorlds()
  const activeId = localStorage.getItem(STORAGE_ACTIVE_ID_KEY)
  if (activeId) {
    const match = worlds.find((w) => w.id === activeId)
    if (match) return match
  }
  if (worlds.length > 0) {
    localStorage.setItem(STORAGE_ACTIVE_ID_KEY, worlds[0].id)
    return worlds[0]
  }
  const initial = createNewWorld('Emerald Vale')
  saveWorld(initial)
  return initial
}

export function setActiveWorldId(worldId: string): void {
  localStorage.setItem(STORAGE_ACTIVE_ID_KEY, worldId)
}

export function serializeWorld(world: WorldState): string {
  return JSON.stringify(
    {
      ...world,
      schemaVersion: CURRENT_SCHEMA_VERSION,
    },
    null,
    2
  )
}

export function parseImportedWorld(jsonText: string): WorldState {
  const data = JSON.parse(jsonText)
  return migrateWorldState(data)
}

export function exportWorldChronicleMarkdown(world: WorldState): string {
  const lines: string[] = []
  lines.push(`# Chronicle of ${world.name}`)
  lines.push(
    `*Exported on ${new Date(world.updatedAt).toLocaleDateString()} · Schema v${world.schemaVersion || CURRENT_SCHEMA_VERSION} · Seed: \`${world.generationSettings?.seed || 'custom'}\`*`
  )
  lines.push('')

  if (world.players && world.players.length > 0) {
    lines.push('## World Architects & Chroniclers (Players)')
    for (const p of world.players) {
      const seatLabel = p.isBot ? `Auto-Bot (${p.personality})` : 'Human Player'
      lines.push(`- **${p.name}** — *${p.role}* [${seatLabel}]`)
    }
    lines.push('')
  }

  if (Object.keys(world.stageNotes).length > 0) {
    lines.push('## Stage Foundations & Notes')
    for (const s of STAGES) {
      const note = world.stageNotes[s.id]
      if (note && note.trim()) {
        lines.push(`### ${s.number}. ${s.name}`)
        lines.push(note.trim())
        lines.push('')
      }
    }
  }

  if (world.entities.length > 0) {
    lines.push('## World Codex (Species, Civilizations & Myths)')
    for (const entity of world.entities) {
      const origin = entity.originTileId ? ` (Origin Tile ${entity.originTileId})` : ''
      const icon = entity.icon ? `${entity.icon} ` : ''
      const arch = entity.archetype ? ` — *${entity.archetype}*` : ''
      lines.push(
        `- ${icon}**${entity.name}** [${entity.category.toUpperCase()} · ${entity.status}]${arch}${origin}: ${entity.description}`
      )
      if (entity.traits.length > 0) {
        lines.push(`  - *Traits*: ${entity.traits.join(', ')}`)
      }
      if (entity.abilities && entity.abilities.length > 0) {
        lines.push(`  - *Abilities & Powers*: ${entity.abilities.join(', ')}`)
      }
    }
    lines.push('')
  }

  lines.push('## Historical Timeline')
  if (world.drawHistory.length === 0) {
    lines.push('*No historical events recorded yet.*')
  } else {
    for (const rec of world.drawHistory) {
      const { display } = getCardDisplay(rec.card)
      const stageName = STAGES.find((s) => s.id === rec.stage)?.name || 'Custom'
      const epoch = rec.epochYear ? ` (${rec.epochYear})` : ''
      const powerText = rec.power ? ` — **${rec.power}**` : ''
      const playerText = rec.playerName ? ` · *by ${rec.playerName}*` : ''
      lines.push(
        `### Turn #${rec.moveId}: [${display}] ${stageName}${powerText}${epoch}${playerText}`
      )
      if (rec.note && rec.note.trim()) {
        lines.push(rec.note.trim())
      } else {
        lines.push('*No chronicle note recorded.*')
      }
      if (rec.linkedTileIds && rec.linkedTileIds.length > 0) {
        lines.push(`- *Map Coordinates*: ${rec.linkedTileIds.join('; ')}`)
      }
      lines.push('')
    }
  }

  return lines.join('\n')
}
