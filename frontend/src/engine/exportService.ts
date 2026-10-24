import { LayeredMapExport, SelectiveExportOptions, WorldState } from './types'
import { STAGES } from './deckEngine'
import { getEffectiveTileSlots, getTileDomain } from './mapEngine'

/**
 * Generates a clean, comprehensive, book-ready Markdown chronicle and codex wiki.
 */
export function exportWorldMarkdown(
  world: WorldState,
  options: SelectiveExportOptions = {
    includeWorldMetadata: true,
    includeTimeline: true,
    includeCodex: true,
    includeMapState: true,
    includeGenerationSettings: true,
    includePlayers: true,
    stageFilter: 'all',
  }
): string {
  const lines: string[] = []

  // Header & Metadata
  if (options.includeWorldMetadata !== false) {
    lines.push(`# Chronicle & Codex of ${world.name}`)
    lines.push('')
    lines.push(`> *A world forged across the ages — Schema v${world.schemaVersion}*`)
    lines.push(`> **Created:** ${new Date(world.createdAt).toLocaleDateString()} | **Updated:** ${new Date(world.updatedAt).toLocaleDateString()}`)
    lines.push(`> **Current Stage:** ${STAGES.find((s) => s.id === world.currentStage)?.name || world.currentStage}`)
    if (world.gameMode) {
      lines.push(`> **Game Mode:** ${world.gameMode.toUpperCase()}`)
    }
    lines.push('')
  }

  // Generation Settings & World Seeds
  if (options.includeGenerationSettings !== false && world.generationSettings) {
    lines.push(`## World Genesis & Rules`)
    lines.push('')
    lines.push(`- **Random Seed:** \`${world.generationSettings.seed}\``)
    lines.push(`- **Geography Template:** ${world.generationSettings.geographyPreset}`)
    lines.push(`- **Fantasy Level:** ${world.generationSettings.fantasyLevel}`)
    lines.push(`- **Disaster Level:** ${world.generationSettings.disasterIntensity}`)
    lines.push(`- **Turns Per Age:** ${world.generationSettings.turnsPerStage ?? 8}`)
    lines.push(`- **Deck Pacing:** ${world.deckConfig?.faceCards ? 'Standard / Configured Deck' : 'Default'}`)
    lines.push('')
  }

  // Players & Hotseat Roster
  if (options.includePlayers !== false && world.players && world.players.length > 0) {
    lines.push(`## Tabletop Roster`)
    lines.push('')
    lines.push(`| Seat | Name | Role | Control | Personality |`)
    lines.push(`| :--- | :--- | :--- | :--- | :--- |`)
    world.players.forEach((p, idx) => {
      lines.push(`| ${idx + 1} | ${p.name} | ${p.role} | ${p.isBot ? '🤖 Auto-Bot' : '👤 Human'} | ${p.personality} |`)
    })
    lines.push('')
  }

  // Codex Entities (Species, Kingdoms, Myths, Lineage)
  if (options.includeCodex !== false && world.entities && world.entities.length > 0) {
    lines.push(`## The Living Codex`)
    lines.push('')

    const species = world.entities.filter((e) => e.category === 'species')
    const societies = world.entities.filter((e) => e.category === 'society')
    const myths = world.entities.filter((e) => e.category === 'myth')

    if (species.length > 0) {
      lines.push(`### Species & Folk (${species.length})`)
      lines.push('')
      species.forEach((sp) => {
        lines.push(`#### ${sp.icon || '🐾'} ${sp.name}`)
        if (sp.status) lines.push(`*Status: ${sp.status}* | *Stage Created: ${sp.stageCreated}*`)
        if (sp.description) lines.push(`\n${sp.description}\n`)
        if (sp.traits && sp.traits.length > 0) {
          lines.push(`- **Traits & Adaptations:** ${sp.traits.join(', ')}`)
        }
        if (sp.abilities && sp.abilities.length > 0) {
          lines.push(`- **Powers & Abilities:** ${sp.abilities.join(', ')}`)
        }
        if (sp.settlementIcons) {
          lines.push(`- **Architecture:** Camp (${sp.settlementIcons.camp}) → Town (${sp.settlementIcons.town}) → Metropolis (${sp.settlementIcons.metropolis})`)
        }
        lines.push('')
      })
    }

    if (societies.length > 0) {
      lines.push(`### Realms, Kingdoms & Factions (${societies.length})`)
      lines.push('')
      societies.forEach((soc) => {
        lines.push(`#### ${soc.icon || '👑'} ${soc.name}`)
        if (soc.status) lines.push(`*Status: ${soc.status}* | *Archetype: ${soc.archetype || 'Sovereign Realm'}*`)
        if (soc.description) lines.push(`\n${soc.description}\n`)
        if (soc.traits && soc.traits.length > 0) {
          lines.push(`- **Cultural Traditions:** ${soc.traits.join(', ')}`)
        }
        if (soc.abilities && soc.abilities.length > 0) {
          lines.push(`- **Dominion Powers:** ${soc.abilities.join(', ')}`)
        }
        if (soc.diplomaticLinks && soc.diplomaticLinks.length > 0) {
          lines.push(`- **Diplomatic Treaties & Lineage:**`)
          soc.diplomaticLinks.forEach((link) => {
            lines.push(`  - ${link.icon || '📜'} **${link.label}** with *${link.targetEntityName}* (${link.type})`)
          })
        }
        lines.push('')
      })
    }

    if (myths.length > 0) {
      lines.push(`### Mythic Horrors & Ancient Wonders (${myths.length})`)
      lines.push('')
      myths.forEach((myth) => {
        lines.push(`#### ${myth.icon || '✨'} ${myth.name}`)
        if (myth.description) lines.push(`\n${myth.description}\n`)
        if (myth.traits && myth.traits.length > 0) {
          lines.push(`- **Mythic Attributes:** ${myth.traits.join(', ')}`)
        }
        lines.push('')
      })
    }
  }

  // Historian Chronicle & Timeline
  if (options.includeTimeline !== false && world.drawHistory && world.drawHistory.length > 0) {
    lines.push(`## Historian's Chronicle of Eras`)
    lines.push('')

    const history =
      options.stageFilter && options.stageFilter !== 'all'
        ? world.drawHistory.filter((r) => r.stage === options.stageFilter)
        : world.drawHistory

    let currentEra: string | undefined = undefined

    history.forEach((rec) => {
      const stageInfo = STAGES.find((s) => s.id === rec.stage)
      const stageHeading = stageInfo ? `Age ${stageInfo.number}: ${stageInfo.name} (${stageInfo.eraLabel})` : 'Undated Era'

      if (stageHeading !== currentEra) {
        currentEra = stageHeading
        lines.push(`### ${currentEra}`)
        lines.push('')
      }

      const cardLabel = rec.card.value === 'Joker' ? '🃏 Joker' : `${rec.card.value}${rec.card.suit}`
      lines.push(`- **Turn #${rec.moveId} [${cardLabel}] — ${rec.power || 'Action'}**`)
      if (rec.epochYear) lines.push(`  *${rec.epochYear}*`)
      if (rec.playerName) lines.push(`  *Chronicler: ${rec.playerName}*`)
      if (rec.note) lines.push(`  > ${rec.note}`)
      if (rec.linkedTileIds && rec.linkedTileIds.length > 0) {
        lines.push(`  *Geographic Loci: ${rec.linkedTileIds.map((t) => `(${t})`).join(', ')}*`)
      }
      lines.push('')
    })
  }

  // Map Overview Summary
  if (options.includeMapState !== false && world.map) {
    lines.push(`## Atlas & Geographic Grid`)
    lines.push('')
    lines.push(`- **Dimensions:** ${world.map.width} columns × ${world.map.height} rows (${world.map.width * world.map.height} total tiles)`)

    let landCount = 0
    let waterCount = 0
    const landmarkLabels: string[] = []

    Object.values(world.map.tiles).forEach((t) => {
      if (getTileDomain(t) === 'land') landCount++
      else waterCount++
      if (t.label) landmarkLabels.push(`${t.label} (${t.col},${t.row})`)
    })

    lines.push(`- **Geography Balance:** ${landCount} Land tiles / ${waterCount} Water tiles`)
    if (landmarkLabels.length > 0) {
      lines.push(`- **Notable Landmarks & Named Regions:**`)
      landmarkLabels.slice(0, 20).forEach((l) => lines.push(`  - ${l}`))
      if (landmarkLabels.length > 20) {
        lines.push(`  - *...and ${landmarkLabels.length - 20} more named locations*`)
      }
    }
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Generates a clean human-readable YAML document for the world state.
 */
export function exportWorldYaml(
  world: WorldState,
  options: SelectiveExportOptions = {
    includeWorldMetadata: true,
    includeTimeline: true,
    includeCodex: true,
    includeMapState: true,
    includeGenerationSettings: true,
    includePlayers: true,
    stageFilter: 'all',
  }
): string {
  const doc: any = {}

  if (options.includeWorldMetadata !== false) {
    doc.world = {
      schemaVersion: world.schemaVersion,
      id: world.id,
      name: world.name,
      createdAt: world.createdAt,
      updatedAt: world.updatedAt,
      currentStage: world.currentStage,
      gameMode: world.gameMode || 'studio',
      isLocked: !!world.isLocked,
    }
  }

  if (options.includeGenerationSettings !== false) {
    doc.generationSettings = world.generationSettings
  }

  if (options.includePlayers !== false) {
    doc.players = world.players
  }

  if (options.includeCodex !== false) {
    doc.entities = world.entities
  }

  if (options.includeTimeline !== false) {
    doc.timeline =
      options.stageFilter && options.stageFilter !== 'all'
        ? world.drawHistory.filter((r) => r.stage === options.stageFilter)
        : world.drawHistory
  }

  if (options.includeMapState !== false && world.map) {
    doc.map = {
      width: world.map.width,
      height: world.map.height,
      activeTerritories: world.entities
        .filter((e) => e.category === 'society')
        .map((e) => ({ id: e.id, name: e.name, color: e.color })),
    }
  }

  // Serialize to simple, valid YAML without heavy external dependencies
  return toSimpleYaml(doc)
}

/**
 * Helper to convert clean JSON objects into YAML format.
 */
function toSimpleYaml(obj: any, indent = 0): string {
  const pad = '  '.repeat(indent)
  const lines: string[] = []

  if (obj === null || obj === undefined) {
    return 'null'
  }

  if (typeof obj !== 'object') {
    if (typeof obj === 'string') {
      if (obj.includes('\n') || obj.includes(':') || obj.includes('#') || obj.includes('"')) {
        return JSON.stringify(obj)
      }
      return obj || '""'
    }
    return String(obj)
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]'
    obj.forEach((item) => {
      if (typeof item === 'object' && item !== null) {
        const itemYaml = toSimpleYaml(item, indent + 1).trimStart()
        lines.push(`${pad}- ${itemYaml}`)
      } else {
        lines.push(`${pad}- ${toSimpleYaml(item, 0)}`)
      }
    })
    return lines.join('\n')
  }

  // Object keys
  const entries = Object.entries(obj)
  if (entries.length === 0) return '{}'

  entries.forEach(([key, val]) => {
    if (val === undefined) return
    if (typeof val === 'object' && val !== null) {
      if (Array.isArray(val) && val.length === 0) {
        lines.push(`${pad}${key}: []`)
      } else if (!Array.isArray(val) && Object.keys(val).length === 0) {
        lines.push(`${pad}${key}: {}`)
      } else {
        lines.push(`${pad}${key}:`)
        lines.push(toSimpleYaml(val, indent + 1))
      }
    } else {
      lines.push(`${pad}${key}: ${toSimpleYaml(val, 0)}`)
    }
  })

  return lines.join('\n')
}

/**
 * Exports the map into a structured multi-layer JSON document.
 * Separates terrain base, elevation relief, hydrology, flora, slots, overlays, and territory claims.
 */
export function exportMapLayeredJson(world: WorldState): LayeredMapExport {
  const map = world.map
  const terrainGrid: LayeredMapExport['terrainGrid'] = []
  const reliefObjects: LayeredMapExport['reliefObjects'] = []
  const floraObjects: LayeredMapExport['floraObjects'] = []
  const hydrologyObjects: LayeredMapExport['hydrologyObjects'] = []
  const transportObjects: LayeredMapExport['transportObjects'] = []
  const slotObjects: LayeredMapExport['slotObjects'] = []
  const overlayObjects: LayeredMapExport['overlayObjects'] = []

  const territoryMap: Record<string, { entityId: string; name: string; color: string; claimedTileIds: string[] }> = {}

  world.entities
    .filter((e) => e.category === 'society')
    .forEach((s) => {
      territoryMap[s.id] = {
        entityId: s.id,
        name: s.name,
        color: s.color || '#3b82f6',
        claimedTileIds: [],
      }
    })

  for (let r = 0; r < map.height; r++) {
    for (let c = 0; c < map.width; c++) {
      const tileId = `${c},${r}`
      const tile = map.tiles[tileId]
      if (!tile) continue

      terrainGrid.push({
        tileId,
        col: c,
        row: r,
        terrain: tile.terrain,
        domain: getTileDomain(tile),
        label: tile.label,
      })

      if (tile.relief && tile.relief !== 'none') {
        reliefObjects.push({ tileId, relief: tile.relief })
      }

      if (tile.flora && tile.flora !== 'none') {
        floraObjects.push({ tileId, flora: tile.flora })
      }

      if (tile.hasRiver || tile.terrain === 'water') {
        hydrologyObjects.push({ tileId, hasRiver: !!tile.hasRiver, hasLake: tile.terrain === 'water' })
      }

      if (tile.hasRoad) {
        transportObjects.push({ tileId, hasRoad: true })
      }

      const effectiveSlots = getEffectiveTileSlots(tile)
      effectiveSlots.forEach((slot) => {
        slotObjects.push({ tileId, slot })
      })

      if (tile.overlay && tile.overlay !== 'none') {
        overlayObjects.push({
          tileId,
          overlay: tile.overlay,
          territoryId: tile.territoryId,
          coloringMode: tile.coloringMode,
        })
      }

      if (tile.territoryId && territoryMap[tile.territoryId]) {
        territoryMap[tile.territoryId].claimedTileIds.push(tileId)
      }
    }
  }

  return {
    schemaVersion: world.schemaVersion,
    worldName: world.name,
    dimensions: { width: map.width, height: map.height },
    exportedAt: new Date().toISOString(),
    terrainGrid,
    reliefObjects,
    floraObjects,
    hydrologyObjects,
    transportObjects,
    slotObjects,
    overlayObjects,
    territories: Object.values(territoryMap),
  }
}

/**
 * Triggers an immediate browser file download.
 */
export function downloadExportFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
