import { DEFAULT_DECK_CONFIG, STAGES, calculateEpochYear, getCardDisplay } from './deckEngine'
import { createInitialMap } from './mapEngine'
import { DrawRecord, StageId, WorldState } from './types'

const STORAGE_WORLDS_KEY = 'wb_saved_worlds_v1'
const STORAGE_ACTIVE_ID_KEY = 'wb_active_world_id_v1'

export function createNewWorld(name: string = 'Untitled Realm'): WorldState {
  const now = new Date().toISOString()
  return {
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
  }
}

export function listSavedWorlds(): WorldState[] {
  try {
    const raw = localStorage.getItem(STORAGE_WORLDS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch (error) {
    console.error('Failed to read saved worlds from localStorage:', error)
    return []
  }
}

export function saveWorld(world: WorldState): WorldState {
  const updated: WorldState = {
    ...world,
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
  return JSON.stringify(world, null, 2)
}

export function parseImportedWorld(jsonText: string): WorldState {
  const data = JSON.parse(jsonText)
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid world JSON payload')
  }

  const base = createNewWorld(data.name || 'Imported World')
  const stage: StageId = data.currentStage || data.deckConfig?.selectedStage || 'genesis'

  const rawHistory: unknown[] = Array.isArray(data.drawHistory) ? data.drawHistory : []
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
    }
  })

  return {
    id: data.id || base.id,
    name: data.name || 'Imported World',
    createdAt: data.createdAt || data.timestamp || base.createdAt,
    updatedAt: new Date().toISOString(),
    deckConfig: {
      numberRange: data.deckConfig?.numberRange || base.deckConfig.numberRange,
      faceCards: data.deckConfig?.faceCards || base.deckConfig.faceCards,
      aceCount:
        typeof data.deckConfig?.aceCount === 'number'
          ? data.deckConfig.aceCount
          : base.deckConfig.aceCount,
      jokerCount:
        typeof data.deckConfig?.jokerCount === 'number'
          ? data.deckConfig.jokerCount
          : base.deckConfig.jokerCount,
      stagesEnabled:
        typeof data.deckConfig?.stagesEnabled === 'boolean'
          ? data.deckConfig.stagesEnabled
          : base.deckConfig.stagesEnabled,
      selectedStage: stage,
    },
    currentStage: stage,
    stageNotes: data.stageNotes || {},
    drawHistory: normalizedHistory,
    map: data.map && data.map.tiles ? data.map : base.map,
    entities: Array.isArray(data.entities) ? data.entities : [],
  }
}

export function exportWorldChronicleMarkdown(world: WorldState): string {
  const lines: string[] = []
  lines.push(`# Chronicle of ${world.name}`)
  lines.push(`*Exported on ${new Date(world.updatedAt).toLocaleDateString()}*`)
  lines.push('')

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
    lines.push('## World Registry (Species, Civilizations & Myths)')
    for (const entity of world.entities) {
      const origin = entity.originTileId ? ` (Tile ${entity.originTileId})` : ''
      lines.push(
        `- **${entity.name}** [${entity.category.toUpperCase()} · ${entity.status}]${origin}: ${entity.description}`
      )
      if (entity.traits.length > 0) {
        lines.push(`  - *Traits*: ${entity.traits.join(', ')}`)
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
      lines.push(`### Turn #${rec.moveId}: [${display}] ${stageName}${powerText}${epoch}`)
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
