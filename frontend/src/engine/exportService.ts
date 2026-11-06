import { LayeredMapExport, SelectiveExportOptions, WorldState } from './types'
import { STAGES } from './deckEngine'
import { getEffectiveTileSlots, getTileDomain, exportMapToSvgString } from './mapEngine'

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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Compiles the entire world into a standalone, styled, publication-ready
 * fantasy RPG Campaign Sourcebook (.html) with embedded SVG cartography,
 * categorized codex dossiers, and print-to-PDF formatting.
 */
export function exportCampaignSourcebookHtml(
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
  const mapSvg = options.includeMapState !== false
    ? exportMapToSvgString(world.map, world.name, world.entities)
    : ''

  const currentStageName = STAGES.find((s) => s.id === world.currentStage)?.name || world.currentStage

  // Group events by stage
  const eventsByStage: Record<string, typeof world.drawHistory> = {}
  const filteredEvents = world.drawHistory.filter((rec) => {
    if (options.stageFilter && options.stageFilter !== 'all') {
      return rec.stage === options.stageFilter
    }
    return true
  })

  filteredEvents.forEach((rec) => {
    const stg = rec.stage || 'prologue'
    if (!eventsByStage[stg]) eventsByStage[stg] = []
    eventsByStage[stg].push(rec)
  })

  const speciesList = (world.entities || []).filter((e) => e.category === 'species')
  const societyList = (world.entities || []).filter((e) => e.category === 'society')
  const mythList = (world.entities || []).filter((e) => e.category === 'myth')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(world.name)} — Campaign Sourcebook</title>
  <style>
    :root {
      --bg-page: #fbf8f2;
      --bg-card: #f4eee1;
      --bg-card-alt: #ede4d1;
      --text-main: #2a241e;
      --text-muted: #6b5e51;
      --text-accent: #7c2d12;
      --border-color: #d8cbb8;
      --border-ornate: #b45309;
      --badge-bg: #e2d6c1;
      --shadow: rgba(0, 0, 0, 0.08);
    }

    body.theme-dark {
      --bg-page: #12141a;
      --bg-card: #1c1f28;
      --bg-card-alt: #242936;
      --text-main: #e2e8f0;
      --text-muted: #94a3b8;
      --text-accent: #60a5fa;
      --border-color: #334155;
      --border-ornate: #3b82f6;
      --badge-bg: #2d3748;
      --shadow: rgba(0, 0, 0, 0.4);
    }

    body.theme-print {
      --bg-page: #ffffff;
      --bg-card: #ffffff;
      --bg-card-alt: #f8f8f8;
      --text-main: #000000;
      --text-muted: #444444;
      --text-accent: #000000;
      --border-color: #999999;
      --border-ornate: #000000;
      --badge-bg: #eeeeee;
      --shadow: none;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif;
      background-color: var(--bg-page);
      color: var(--text-main);
      line-height: 1.6;
      font-size: 15px;
      transition: background-color 0.2s, color 0.2s;
    }

    /* Top Control Bar (Hidden on Print) */
    .action-bar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--bg-card);
      border-bottom: 2px solid var(--border-color);
      padding: 10px 24px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      box-shadow: 0 2px 8px var(--shadow);
    }
    .action-bar h1 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-accent);
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .btn-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn-book {
      background: var(--bg-page);
      color: var(--text-main);
      border: 1px solid var(--border-color);
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s;
    }
    .btn-book:hover {
      background: var(--border-color);
      color: var(--text-accent);
    }
    .btn-primary-book {
      background: var(--border-ornate);
      color: #ffffff;
      border-color: var(--border-ornate);
    }
    .btn-primary-book:hover {
      opacity: 0.9;
      color: #ffffff;
    }

    /* Book Container */
    .book-container {
      max-width: 1060px;
      margin: 32px auto;
      padding: 0 24px;
    }

    /* Cover / World Header */
    .book-cover {
      text-align: center;
      padding: 48px 24px 36px;
      border-bottom: 3px double var(--border-ornate);
      margin-bottom: 40px;
    }
    .book-cover h1 {
      font-size: 3.2rem;
      margin: 0 0 12px;
      font-weight: 900;
      letter-spacing: 0.02em;
      color: var(--text-accent);
      text-shadow: 1px 1px 0px rgba(0,0,0,0.1);
    }
    .book-cover p.tagline {
      font-size: 1.15rem;
      font-style: italic;
      color: var(--text-muted);
      margin: 0 0 20px;
    }
    .book-cover .meta-bar {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 16px;
      font-size: 0.85rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Chapter Titles */
    h2.chapter-title {
      font-size: 1.85rem;
      border-bottom: 2px solid var(--border-ornate);
      padding-bottom: 8px;
      margin: 48px 0 24px;
      color: var(--text-accent);
      letter-spacing: 0.04em;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    h3.section-title {
      font-size: 1.35rem;
      margin: 28px 0 14px;
      color: var(--text-main);
      border-left: 4px solid var(--border-ornate);
      padding-left: 10px;
    }

    /* Columns for Lore Reading */
    .columns-two {
      column-count: 2;
      column-gap: 32px;
    }
    @media (max-width: 768px) {
      .columns-two { column-count: 1; }
    }

    /* Drop Cap */
    .drop-cap::first-letter {
      font-size: 3.4rem;
      float: left;
      line-height: 0.75;
      margin: 4px 8px 0 0;
      font-weight: 800;
      color: var(--text-accent);
      font-family: inherit;
    }

    /* Cards & Stat Blocks */
    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 6px var(--shadow);
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .stat-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px dashed var(--border-color);
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .stat-card-title {
      font-size: 1.2rem;
      font-weight: 700;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .stat-card-badge {
      font-size: 0.75rem;
      background: var(--badge-bg);
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      font-weight: 600;
      color: var(--text-muted);
    }
    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 10px;
    }
    .tag-pill {
      font-size: 0.78rem;
      background: var(--bg-card-alt);
      border: 1px solid var(--border-color);
      padding: 2px 8px;
      border-radius: 4px;
    }

    /* Map Display Container */
    .map-frame {
      background: var(--bg-card);
      border: 3px double var(--border-ornate);
      border-radius: 8px;
      padding: 16px;
      margin: 24px 0 36px;
      text-align: center;
      box-shadow: 0 4px 12px var(--shadow);
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .map-frame svg {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    /* Chronicle Timeline Entry */
    .chronicle-entry {
      border-left: 3px solid var(--border-ornate);
      padding-left: 18px;
      margin-bottom: 22px;
      position: relative;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .chronicle-entry::before {
      content: '●';
      position: absolute;
      left: -7px;
      top: -2px;
      color: var(--border-ornate);
      font-size: 12px;
    }
    .chronicle-header {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 4px;
    }
    .chronicle-card {
      font-weight: 700;
      font-size: 0.85rem;
      color: var(--text-accent);
    }
    .chronicle-author {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-style: italic;
    }
    .chronicle-note {
      margin: 4px 0 0;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    /* Table Styles */
    table.roster-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0 28px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      overflow: hidden;
      font-size: 0.88rem;
    }
    table.roster-table th, table.roster-table td {
      padding: 10px 14px;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
    }
    table.roster-table th {
      background: var(--bg-card-alt);
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.78rem;
      letter-spacing: 0.05em;
    }

    /* Footer */
    .book-footer {
      text-align: center;
      padding: 40px 0 60px;
      color: var(--text-muted);
      font-size: 0.85rem;
      border-top: 1px solid var(--border-color);
      margin-top: 60px;
    }

    /* Print Formatting */
    @media print {
      .no-print, .action-bar { display: none !important; }
      body {
        background: #ffffff !important;
        color: #000000 !important;
        font-size: 10pt !important;
        line-height: 1.35 !important;
      }
      .book-container {
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .book-cover {
        padding: 24px 0 16px !important;
        margin-bottom: 24px !important;
      }
      .book-cover h1 { font-size: 2.2rem !important; }
      .columns-two { column-count: 2 !important; column-gap: 24px !important; }
      .stat-card, .chronicle-entry, .map-frame {
        box-shadow: none !important;
        border: 1px solid #777777 !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      @page {
        margin: 0.45in;
        size: letter;
      }
    }
  </style>
</head>
<body>
  <!-- Action Bar -->
  <div class="action-bar no-print">
    <div>
      <h1>${escapeHtml(world.name)} — Campaign Sourcebook</h1>
    </div>
    <div class="btn-group">
      <button class="btn-book" onclick="cycleTheme()" title="Switch View Mode">🌓 Theme</button>
      <button class="btn-book btn-primary-book" onclick="window.print()" title="Print Sourcebook or Save as PDF">🖨️ Print to PDF</button>
    </div>
  </div>

  <div class="book-container">
    <!-- Cover -->
    <header class="book-cover">
      <h1>${escapeHtml(world.name)}</h1>
      <p class="tagline">An Official World Chronicle & Living Campaign Sourcebook</p>
      <div class="meta-bar">
        <span><strong>Stage:</strong> ${escapeHtml(currentStageName)}</span>
        <span>•</span>
        <span><strong>Timeline:</strong> ${world.drawHistory.length} Moves</span>
        <span>•</span>
        <span><strong>Entities:</strong> ${(world.entities || []).length} Recorded</span>
        <span>•</span>
        <span><strong>Updated:</strong> ${new Date(world.updatedAt).toLocaleDateString()}</span>
      </div>
    </header>

    ${
      options.includeWorldMetadata !== false && world.generationSettings
        ? `
      <section id="genesis-rules">
        <h2 class="chapter-title">📜 Genesis & Tabletop Mechanics</h2>
        <div class="columns-two">
          <p class="drop-cap">
            The world of <strong>${escapeHtml(world.name)}</strong> was conceived under the fundamental laws of myth and nature.
            Seeded with formula <code>${escapeHtml(world.generationSettings.seed)}</code>, the geography follows the <strong>${escapeHtml(world.generationSettings.geographyPreset)}</strong> template with <strong>${escapeHtml(world.generationSettings.fantasyLevel)}</strong> fantasy phenomena and a <strong>${escapeHtml(world.generationSettings.disasterIntensity)}</strong> calamity coefficient.
          </p>
          <p>
            Across each epoch, card draws govern the creation of continents, sentient species, sovereign kingdoms, and mythic secrets. Every move recorded within these pages preserves the tabletop narrative constructed by its players.
          </p>
        </div>

        ${
          options.includePlayers !== false && world.players && world.players.length > 0
            ? `
          <h3 class="section-title">Tabletop Roster</h3>
          <table class="roster-table">
            <thead>
              <tr>
                <th>Seat</th>
                <th>Player</th>
                <th>Role</th>
                <th>Control</th>
                <th>Personality</th>
              </tr>
            </thead>
            <tbody>
              ${world.players
                .map(
                  (p, i) => `
                <tr>
                  <td>#${i + 1}</td>
                  <td><strong>${escapeHtml(p.name)}</strong></td>
                  <td>${escapeHtml(p.role)}</td>
                  <td>${p.isBot ? '🤖 Auto-Bot' : '👤 Human'}</td>
                  <td>${escapeHtml(p.personality)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          `
            : ''
        }
      </section>
      `
        : ''
    }

    ${
      mapSvg
        ? `
      <section id="cartography">
        <h2 class="chapter-title">🗺️ Cartography & Atlas of the Realm</h2>
        <div class="map-frame">
          ${mapSvg}
          <p style="font-size: 0.85rem; color: var(--text-muted); margin: 12px 0 0;">
            <strong>Figure 1.0:</strong> Official Cartographic Survey of ${escapeHtml(world.name)} (${world.map.width} × ${world.map.height} tiles).
          </p>
        </div>
      </section>
      `
        : ''
    }

    ${
      options.includeCodex !== false && (speciesList.length > 0 || societyList.length > 0 || mythList.length > 0)
        ? `
      <section id="codex">
        <h2 class="chapter-title">📖 The Living Codex</h2>

        ${
          speciesList.length > 0
            ? `
          <h3 class="section-title">Sentient Folk & Species (${speciesList.length})</h3>
          <div class="columns-two">
            ${speciesList
              .map(
                (sp) => `
              <div class="stat-card">
                <div class="stat-card-header">
                  <h4 class="stat-card-title">${escapeHtml(sp.icon || '🐾')} ${escapeHtml(sp.name)}</h4>
                  <span class="stat-card-badge">${escapeHtml(sp.status || 'Active')}</span>
                </div>
                ${sp.description ? `<p style="margin: 0 0 10px; font-size: 0.92rem;">${escapeHtml(sp.description)}</p>` : ''}
                <div class="tag-list">
                  ${(sp.traits || []).map((t) => `<span class="tag-pill">🌱 ${escapeHtml(t)}</span>`).join('')}
                  ${(sp.abilities || []).map((a) => `<span class="tag-pill">⚡ ${escapeHtml(a)}</span>`).join('')}
                  ${sp.originTileId ? `<span class="tag-pill">📍 Origin: (${escapeHtml(sp.originTileId)})</span>` : ''}
                </div>
              </div>
            `
              )
              .join('')}
          </div>
          `
            : ''
        }

        ${
          societyList.length > 0
            ? `
          <h3 class="section-title">Realms, Kingdoms & Factions (${societyList.length})</h3>
          <div class="columns-two">
            ${societyList
              .map(
                (soc) => `
              <div class="stat-card" style="border-left: 4px solid ${escapeHtml(soc.color || '#3b82f6')};">
                <div class="stat-card-header">
                  <h4 class="stat-card-title">${escapeHtml(soc.icon || '👑')} ${escapeHtml(soc.name)}</h4>
                  <span class="stat-card-badge">${escapeHtml(soc.archetype || 'Sovereign Realm')}</span>
                </div>
                ${soc.description ? `<p style="margin: 0 0 10px; font-size: 0.92rem;">${escapeHtml(soc.description)}</p>` : ''}
                <div class="tag-list">
                  ${(soc.traits || []).map((t) => `<span class="tag-pill">🏛️ ${escapeHtml(t)}</span>`).join('')}
                  ${(soc.abilities || []).map((a) => `<span class="tag-pill">⚔️ ${escapeHtml(a)}</span>`).join('')}
                  ${soc.originTileId ? `<span class="tag-pill">📍 Capital: (${escapeHtml(soc.originTileId)})</span>` : ''}
                  ${(soc.diplomaticLinks || []).map((dl) => `<span class="tag-pill">${escapeHtml(dl.icon || '🤝')} ${escapeHtml(dl.label)} with ${escapeHtml(dl.targetEntityName)}</span>`).join('')}
                </div>
              </div>
            `
              )
              .join('')}
          </div>
          `
            : ''
        }

        ${
          mythList.length > 0
            ? `
          <h3 class="section-title">Myths, Relics & Ancient Secrets (${mythList.length})</h3>
          <div class="columns-two">
            ${mythList
              .map(
                (m) => `
              <div class="stat-card" style="border-left: 4px solid #8b5cf6;">
                <div class="stat-card-header">
                  <h4 class="stat-card-title">${escapeHtml(m.icon || '🔮')} ${escapeHtml(m.name)}</h4>
                  <span class="stat-card-badge">${escapeHtml(m.status || 'Mythic')}</span>
                </div>
                ${m.description ? `<p style="margin: 0 0 10px; font-size: 0.92rem;">${escapeHtml(m.description)}</p>` : ''}
                <div class="tag-list">
                  ${(m.traits || []).map((t) => `<span class="tag-pill">✨ ${escapeHtml(t)}</span>`).join('')}
                  ${(m.abilities || []).map((a) => `<span class="tag-pill">🌌 ${escapeHtml(a)}</span>`).join('')}
                </div>
              </div>
            `
              )
              .join('')}
          </div>
          `
            : ''
        }
      </section>
      `
        : ''
    }

    ${
      options.includeTimeline !== false && filteredEvents.length > 0
        ? `
      <section id="chronicle">
        <h2 class="chapter-title">⏳ The Chronicle of Ages</h2>

        ${Object.entries(eventsByStage)
          .map(([stageKey, recs]) => {
            const stageName = STAGES.find((s) => s.id === stageKey)?.name || stageKey.toUpperCase()
            return `
            <h3 class="section-title">Age of ${escapeHtml(stageName)} (${recs.length} Turns)</h3>
            <div>
              ${recs
                .map(
                  (rec) => `
                <div class="chronicle-entry">
                  <div class="chronicle-header">
                    <span class="chronicle-card">[Turn #${rec.moveId}] ${escapeHtml(rec.card.value)} of ${escapeHtml(rec.card.suit)} — ${escapeHtml(rec.actionTitle || rec.power || 'World Action')}</span>
                    ${rec.playerName ? `<span class="chronicle-author">by ${escapeHtml(rec.playerName)}</span>` : ''}
                  </div>
                  <p class="chronicle-note">${escapeHtml(rec.note || 'The world shifted in response to the celestial powers.')}</p>
                </div>
              `
                )
                .join('')}
            </div>
          `
          })
          .join('')}
      </section>
      `
        : ''
    }

    <footer class="book-footer">
      <p>Forged via World Builder Studio • Schema v${world.schemaVersion} • Exported on ${new Date().toLocaleDateString()}</p>
    </footer>
  </div>

  <script>
    const themes = ['theme-parchment', 'theme-dark', 'theme-print'];
    let currentThemeIdx = 0;
    function cycleTheme() {
      document.body.classList.remove('theme-dark', 'theme-print');
      currentThemeIdx = (currentThemeIdx + 1) % 3;
      if (currentThemeIdx === 1) document.body.classList.add('theme-dark');
      if (currentThemeIdx === 2) document.body.classList.add('theme-print');
    }
  </script>
</body>
</html>`
}
