import React, { useState } from 'react'
import {
  Paintbrush,
  PaintBucket,
  MousePointer,
  Eraser,
  Download,
  RotateCcw,
  Tag,
  MapPin,
  Sparkles,
  Maximize2,
  Compass,
} from 'lucide-react'
import {
  DrawRecord,
  FloraType,
  GeographyPreset,
  MapState,
  ReliefType,
  TerrainType,
  TileOverlay,
  TilePattern,
  WorldEntity,
} from '../engine/types'
import {
  TERRAIN_PALETTE,
  OVERLAY_PALETTE,
  RELIEF_PALETTE,
  FLORA_PALETTE,
  getTileId,
  createDefaultTile,
  paintTile,
  bucketFillTerrain,
  createInitialMap,
  exportMapToSvgString,
  resizeMap,
} from '../engine/mapEngine'

export type MapTool = 'inspect' | 'brush' | 'fill' | 'erase'

interface MapCanvasProps {
  map: MapState
  worldName: string
  drawHistory?: DrawRecord[]
  entities?: WorldEntity[]
  onChange: (newMap: MapState) => void
}

const PATTERNS: { id: TilePattern; label: string }[] = [
  { id: 'solid', label: 'Solid' },
  { id: 'diagonal', label: 'Diagonal Split' },
  { id: 'horizontal', label: 'Horizontal Split' },
  { id: 'vertical', label: 'Vertical Split' },
  { id: 'checkered', label: 'Checkered' },
]

const GEOGRAPHY_PRESETS: { id: GeographyPreset; label: string }[] = [
  { id: 'continent', label: 'Central Continent' },
  { id: 'archipelago', label: 'Island Archipelago' },
  { id: 'twin-continents', label: 'Twin Continents' },
  { id: 'inland-sea', label: 'Inland Sea Basin' },
  { id: 'pangaea', label: 'Supercontinent (Pangaea)' },
]

export function MapCanvas({
  map,
  worldName,
  drawHistory = [],
  entities = [],
  onChange,
}: MapCanvasProps) {
  const [activeTool, setActiveTool] = useState<MapTool>('brush')
  const [selectedTerrain, setSelectedTerrain] = useState<TerrainType>('forest')
  const [selectedRelief, setSelectedRelief] = useState<ReliefType>('none')
  const [selectedFlora, setSelectedFlora] = useState<FloraType>('none')
  const [secondaryTerrain, setSecondaryTerrain] = useState<TerrainType>('plains')
  const [selectedPattern, setSelectedPattern] = useState<TilePattern>('solid')
  const [selectedOverlay, setSelectedOverlay] = useState<TileOverlay>('none')
  const [paintRiver, setPaintRiver] = useState(false)
  const [paintRoad, setPaintRoad] = useState(false)
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string>('')
  const [geoPreset, setGeoPreset] = useState<GeographyPreset>('continent')

  const [selectedTileId, setSelectedTileId] = useState<string>('10,6')
  const [isDragging, setIsDragging] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [customWidth, setCustomWidth] = useState<number>(map.width)
  const [customHeight, setCustomHeight] = useState<number>(map.height)

  const entityColorMap: Record<string, { name: string; color: string; icon?: string }> = {}
  for (const ent of entities) {
    entityColorMap[ent.id] = {
      name: ent.name,
      color: ent.color || '#6366f1',
      icon: ent.icon,
    }
  }

  const inspectedTile =
    map.tiles[selectedTileId] ||
    (() => {
      const [c, r] = selectedTileId.split(',').map(Number)
      return createDefaultTile(c || 0, r || 0)
    })()

  const applyToolToTile = (col: number, row: number) => {
    const id = getTileId(col, row)
    setSelectedTileId(id)

    if (activeTool === 'inspect') {
      return
    }

    if (activeTool === 'erase') {
      onChange(
        paintTile(map, col, row, {
          terrain: 'ocean',
          relief: 'none',
          flora: 'none',
          secondaryTerrain: undefined,
          pattern: 'solid',
          overlay: 'none',
          hasRiver: false,
          hasRoad: false,
          territoryId: undefined,
          label: undefined,
        })
      )
      return
    }

    if (activeTool === 'fill') {
      onChange(
        bucketFillTerrain(
          map,
          col,
          row,
          selectedTerrain,
          selectedPattern === 'solid' ? undefined : secondaryTerrain,
          selectedPattern
        )
      )
      return
    }

    if (activeTool === 'brush') {
      const existing = map.tiles[id] || createDefaultTile(col, row)
      onChange(
        paintTile(map, col, row, {
          terrain: selectedTerrain,
          relief: selectedRelief !== 'none' ? selectedRelief : existing.relief,
          flora: selectedFlora !== 'none' ? selectedFlora : existing.flora,
          secondaryTerrain: selectedPattern === 'solid' ? undefined : secondaryTerrain,
          pattern: selectedPattern,
          overlay: selectedOverlay !== 'none' ? selectedOverlay : existing.overlay,
          hasRiver: paintRiver ? true : existing.hasRiver,
          hasRoad: paintRoad ? true : existing.hasRoad,
          territoryId: selectedTerritoryId || existing.territoryId,
        })
      )
    }
  }

  const handleTileMouseEnter = (col: number, row: number) => {
    if (isDragging && (activeTool === 'brush' || activeTool === 'erase')) {
      applyToolToTile(col, row)
    }
  }

  const handleUpdateInspectedTile = (
    updates: Partial<
      Pick<
        typeof inspectedTile,
        | 'label'
        | 'notes'
        | 'tags'
        | 'terrain'
        | 'relief'
        | 'flora'
        | 'overlay'
        | 'hasRiver'
        | 'hasRoad'
        | 'territoryId'
        | 'linkedEventIds'
        | 'linkedEntityIds'
      >
    >
  ) => {
    onChange(paintTile(map, inspectedTile.col, inspectedTile.row, updates))
  }

  const handleResizeGrid = (w: number, h: number) => {
    setCustomWidth(w)
    setCustomHeight(h)
    onChange(resizeMap(map, w, h))
  }

  const handleAddTag = () => {
    const trimmed = tagInput.trim()
    if (!trimmed) return
    if (!inspectedTile.tags.includes(trimmed)) {
      handleUpdateInspectedTile({ tags: [...inspectedTile.tags, trimmed] })
    }
    setTagInput('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    handleUpdateInspectedTile({
      tags: inspectedTile.tags.filter((t) => t !== tagToRemove),
    })
  }

  const handleExportSvg = () => {
    const svgString = exportMapToSvgString(map, worldName, entities)
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${worldName.toLowerCase().replace(/\s+/g, '-')}-map.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExportPng = () => {
    const svgString = exportMapToSvgString(map, worldName, entities)
    const img = new Image()
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = map.width * 48
      canvas.height = map.height * 48
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        canvas.toBlob((pngBlob) => {
          if (pngBlob) {
            const pngUrl = URL.createObjectURL(pngBlob)
            const a = document.createElement('a')
            a.href = pngUrl
            a.download = `${worldName.toLowerCase().replace(/\s+/g, '-')}-map.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(pngUrl)
          }
        }, 'image/png')
      }
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  const getTileBackgroundStyle = (tile: typeof inspectedTile): React.CSSProperties => {
    const primaryColor = TERRAIN_PALETTE[tile.terrain]?.color || '#1e3a8a'
    const secColor = tile.secondaryTerrain
      ? TERRAIN_PALETTE[tile.secondaryTerrain]?.color || primaryColor
      : primaryColor

    const territoryInfo = tile.territoryId ? entityColorMap[tile.territoryId] : undefined
    const borderStyle = territoryInfo
      ? { boxShadow: `inset 0 0 0 2.5px ${territoryInfo.color}` }
      : {}

    if (!tile.secondaryTerrain || !tile.pattern || tile.pattern === 'solid') {
      return { backgroundColor: primaryColor, ...borderStyle }
    }
    if (tile.pattern === 'diagonal') {
      return {
        background: `linear-gradient(135deg, ${primaryColor} 50%, ${secColor} 50%)`,
        ...borderStyle,
      }
    }
    if (tile.pattern === 'horizontal') {
      return {
        background: `linear-gradient(to bottom, ${primaryColor} 50%, ${secColor} 50%)`,
        ...borderStyle,
      }
    }
    if (tile.pattern === 'vertical') {
      return {
        background: `linear-gradient(to right, ${primaryColor} 50%, ${secColor} 50%)`,
        ...borderStyle,
      }
    }
    if (tile.pattern === 'checkered') {
      return {
        background: `repeating-conic-gradient(${primaryColor} 0% 25%, ${secColor} 0% 50%) 50% / 16px 16px`,
        ...borderStyle,
      }
    }
    return { backgroundColor: primaryColor, ...borderStyle }
  }

  const linkedEvents = drawHistory.filter(
    (ev) =>
      inspectedTile.linkedEventIds.includes(ev.id) ||
      ev.linkedTileIds?.includes(inspectedTile.id)
  )

  const linkedEntities = entities.filter(
    (ent) =>
      inspectedTile.linkedEntityIds.includes(ent.id) ||
      ent.originTileId === inspectedTile.id ||
      inspectedTile.territoryId === ent.id
  )

  return (
    <div
      className="space-y-5 select-none"
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    >
      {/* Top Toolbar: Tools, Geography Generator, Dimensions & Export */}
      <div className="no-print card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Map Tools">
          <button
            type="button"
            onClick={() => setActiveTool('brush')}
            className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors ${
              activeTool === 'brush'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent text-foreground'
            }`}
          >
            <Paintbrush className="h-4 w-4" />
            <span>Paint Brush</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('fill')}
            className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors ${
              activeTool === 'fill'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent text-foreground'
            }`}
          >
            <PaintBucket className="h-4 w-4" />
            <span>Bucket Fill</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('inspect')}
            className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors ${
              activeTool === 'inspect'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent text-foreground'
            }`}
          >
            <MousePointer className="h-4 w-4" />
            <span>Inspect Tile</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('erase')}
            className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors ${
              activeTool === 'erase'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent text-foreground'
            }`}
          >
            <Eraser className="h-4 w-4" />
            <span>Erase</span>
          </button>
        </div>

        {/* Dimensions & Geography Template Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-muted/50 px-2.5 py-1 rounded-md border border-border text-xs">
            <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">Grid:</span>
            <button
              type="button"
              onClick={() => handleResizeGrid(14, 9)}
              className={`px-1.5 py-0.5 rounded ${
                map.width === 14 && map.height === 9 ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
              }`}
            >
              14×9
            </button>
            <button
              type="button"
              onClick={() => handleResizeGrid(20, 12)}
              className={`px-1.5 py-0.5 rounded ${
                map.width === 20 && map.height === 12 ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
              }`}
            >
              20×12
            </button>
            <button
              type="button"
              onClick={() => handleResizeGrid(26, 15)}
              className={`px-1.5 py-0.5 rounded ${
                map.width === 26 && map.height === 15 ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
              }`}
            >
              26×15
            </button>
            <input
              type="number"
              aria-label="Custom Grid Width"
              min={6}
              max={40}
              value={customWidth}
              onChange={(e) => setCustomWidth(Number(e.target.value))}
              className="w-11 h-6 px-1 text-center rounded border border-border bg-background"
            />
            <span>×</span>
            <input
              type="number"
              aria-label="Custom Grid Height"
              min={6}
              max={30}
              value={customHeight}
              onChange={(e) => setCustomHeight(Number(e.target.value))}
              className="w-11 h-6 px-1 text-center rounded border border-border bg-background"
            />
            <button
              type="button"
              onClick={() => handleResizeGrid(customWidth, customHeight)}
              className="btn-outline px-2 py-0.5 text-[11px]"
            >
              Apply
            </button>
          </div>

          <div className="flex items-center gap-1">
            <select
              aria-label="Geography Template"
              value={geoPreset}
              onChange={(e) => setGeoPreset(e.target.value as GeographyPreset)}
              className="input h-9 text-xs py-1 pr-6 w-auto"
            >
              {GEOGRAPHY_PRESETS.map((gp) => (
                <option key={gp.id} value={gp.id}>
                  {gp.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onChange(createInitialMap(map.width, map.height, geoPreset))}
              className="btn-outline px-3 py-2 text-xs flex items-center gap-1.5"
              title="Generate landmass template"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Generate Land</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportSvg}
            className="btn-outline px-3 py-2 text-xs flex items-center gap-1.5"
            title="Download scalable vector SVG map"
          >
            <Download className="h-3.5 w-3.5" />
            <span>SVG</span>
          </button>
          <button
            type="button"
            onClick={handleExportPng}
            className="btn-outline px-3 py-2 text-xs flex items-center gap-1.5"
            title="Download PNG snapshot of map"
          >
            <Download className="h-3.5 w-3.5" />
            <span>PNG</span>
          </button>
        </div>
      </div>

      {/* Multi-Layer Palette Bar (Visible when Brush or Fill is active) */}
      {(activeTool === 'brush' || activeTool === 'fill') && (
        <div className="no-print card p-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Base Biome Palette (5 cols) */}
            <div className="lg:col-span-5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                1. Base Terrain & Biome
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {Object.values(TERRAIN_PALETTE).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTerrain(t.id)}
                    className={`p-1.5 rounded border text-xs flex items-center gap-1.5 transition-all ${
                      selectedTerrain === t.id
                        ? 'ring-2 ring-primary border-primary font-semibold bg-accent'
                        : 'border-border hover:bg-muted/60'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs shadow-inner shrink-0"
                      style={{ backgroundColor: t.color }}
                    >
                      {t.symbol}
                    </span>
                    <span className="truncate text-[11px]">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Composite Relief + Flora + Roads/Rivers + Territory (4 cols) */}
            <div className="lg:col-span-4 space-y-3 border-t lg:border-t-0 lg:border-l border-border pt-3 lg:pt-0 lg:pl-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                2. Multi-Layer Overlays (Mountain + Forest, Roads, Rivers)
              </label>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                    Elevation / Relief
                  </label>
                  <select
                    aria-label="Relief Overlay"
                    value={selectedRelief}
                    onChange={(e) => setSelectedRelief(e.target.value as ReliefType)}
                    className="input w-full text-xs py-1 h-8"
                  >
                    {Object.values(RELIEF_PALETTE).map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.symbol} {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                    Vegetation / Flora
                  </label>
                  <select
                    aria-label="Flora Overlay"
                    value={selectedFlora}
                    onChange={(e) => setSelectedFlora(e.target.value as FloraType)}
                    className="input w-full text-xs py-1 h-8"
                  >
                    {Object.values(FLORA_PALETTE).map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.symbol} {f.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <label className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border border-border bg-muted/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paintRiver}
                    onChange={(e) => setPaintRiver(e.target.checked)}
                    className="rounded"
                  />
                  <span>💧 Paint River</span>
                </label>
                <label className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border border-border bg-muted/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paintRoad}
                    onChange={(e) => setPaintRoad(e.target.checked)}
                    className="rounded"
                  />
                  <span>🛤️ Paint Road</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                    Faction Territory
                  </label>
                  <select
                    aria-label="Territory Assignment"
                    value={selectedTerritoryId}
                    onChange={(e) => setSelectedTerritoryId(e.target.value)}
                    className="input w-full text-xs py-1 h-8"
                  >
                    <option value="">No Territory Border</option>
                    {entities.map((ent) => (
                      <option key={ent.id} value={ent.id}>
                        {ent.icon || '🚩'} {ent.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                    2-Color Blend
                  </label>
                  <select
                    aria-label="Tile Pattern"
                    value={selectedPattern}
                    onChange={(e) => setSelectedPattern(e.target.value as TilePattern)}
                    className="input w-full text-xs py-1 h-8"
                  >
                    {PATTERNS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedPattern !== 'solid' && (
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                    Secondary Terrain for Split Pattern
                  </label>
                  <select
                    aria-label="Secondary Terrain"
                    value={secondaryTerrain}
                    onChange={(e) => setSecondaryTerrain(e.target.value as TerrainType)}
                    className="input w-full text-xs py-1 h-8"
                  >
                    {Object.values(TERRAIN_PALETTE).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Landmark & Settlement Stamps (3 cols) */}
            <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-border pt-3 lg:pt-0 lg:pl-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                3. Cities, Monuments & Markers
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {Object.values(OVERLAY_PALETTE).map((ov) => (
                  <button
                    key={ov.id}
                    type="button"
                    onClick={() => setSelectedOverlay(ov.id)}
                    title={ov.label}
                    className={`p-1 rounded border text-xs flex flex-col items-center justify-center h-12 ${
                      selectedOverlay === ov.id
                        ? 'ring-2 ring-primary border-primary bg-accent font-semibold'
                        : 'border-border hover:bg-muted/60'
                    }`}
                  >
                    <span className="text-sm">{ov.symbol || '∅'}</span>
                    <span className="text-[9px] truncate max-w-full">
                      {ov.id === 'none' ? 'None' : ov.label.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid & Tile Inspector Split */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Interactive Grid */}
        <div className="xl:col-span-3 card p-4 overflow-x-auto">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold">
                {worldName} Atlas ({map.width} × {map.height})
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block ring-1 ring-black/40" />
                Historic Event / Note
              </span>
              {entities.slice(0, 4).map((ent) => (
                <span key={ent.id} className="inline-flex items-center gap-1">
                  <span
                    className="w-2.5 h-2.5 rounded-sm inline-block"
                    style={{ backgroundColor: ent.color || '#6366f1' }}
                  />
                  {ent.name}
                </span>
              ))}
            </div>
          </div>

          <div
            className="inline-grid border-2 border-border rounded-lg overflow-hidden shadow-md"
            style={{
              gridTemplateColumns: `repeat(${map.width}, minmax(40px, 1fr))`,
            }}
            role="grid"
            aria-label="World Map Grid"
          >
            {Array.from({ length: map.height }).map((_, row) =>
              Array.from({ length: map.width }).map((__, col) => {
                const id = getTileId(col, row)
                const tile = map.tiles[id] || createDefaultTile(col, row)
                const terrainMeta = TERRAIN_PALETTE[tile.terrain] || TERRAIN_PALETTE.ocean
                const overlayMeta = OVERLAY_PALETTE[tile.overlay] || OVERLAY_PALETTE.none
                const reliefSym =
                  tile.relief && tile.relief !== 'none'
                    ? RELIEF_PALETTE[tile.relief]?.symbol
                    : ''
                const floraSym =
                  tile.flora && tile.flora !== 'none'
                    ? FLORA_PALETTE[tile.flora]?.symbol
                    : ''
                const isSelected = selectedTileId === id
                const hasLinks =
                  tile.linkedEventIds.length > 0 ||
                  tile.linkedEntityIds.length > 0 ||
                  Boolean(tile.notes) ||
                  tile.tags.length > 0

                const isCompositeBiome =
                  Boolean(reliefSym) && Boolean(floraSym) && overlayMeta.id === 'none'

                return (
                  <button
                    key={id}
                    type="button"
                    data-testid={`map-tile-${col}-${row}`}
                    onMouseDown={() => {
                      setIsDragging(true)
                      applyToolToTile(col, row)
                    }}
                    onMouseEnter={() => handleTileMouseEnter(col, row)}
                    style={getTileBackgroundStyle(tile)}
                    title={`(${col}, ${row}) ${terrainMeta.label}${
                      reliefSym ? ` + ${tile.relief}` : ''
                    }${floraSym ? ` + ${tile.flora}` : ''}${
                      overlayMeta.id !== 'none' ? ` · ${overlayMeta.label}` : ''
                    }${tile.label ? ` — ${tile.label}` : ''}`}
                    className={`relative aspect-square w-11 sm:w-12 border border-black/15 flex flex-col items-center justify-center transition-transform overflow-hidden ${
                      isSelected
                        ? 'ring-2 ring-white z-10 scale-105 shadow-lg'
                        : 'hover:brightness-105'
                    }`}
                  >
                    {/* SVG River & Road Underlays */}
                    {(tile.hasRiver || tile.hasRoad) && (
                      <svg
                        viewBox="0 0 40 40"
                        className="absolute inset-0 w-full h-full pointer-events-none"
                      >
                        {tile.hasRiver && (
                          <path
                            d="M 0 12 Q 20 28, 40 16"
                            stroke="#2563eb"
                            strokeWidth="4"
                            fill="none"
                             opacity="0.85"
                          />
                        )}
                        {tile.hasRoad && (
                          <line
                            x1="0"
                            y1="22"
                            x2="40"
                            y2="22"
                            stroke="#78350f"
                            strokeWidth="2.5"
                            strokeDasharray="4 2"
                          />
                        )}
                      </svg>
                    )}

                    {/* Symbol Layer (Composite or Single) */}
                    {isCompositeBiome ? (
                      <div className="relative z-10 flex items-center justify-center -space-x-1 leading-none drop-shadow">
                        <span className="text-xs">{reliefSym}</span>
                        <span className="text-xs">{floraSym}</span>
                      </div>
                    ) : (
                      <span className="relative z-10 text-sm leading-none drop-shadow">
                        {overlayMeta.symbol || floraSym || reliefSym || terrainMeta.symbol}
                      </span>
                    )}

                    {tile.label && (
                      <span className="relative z-10 text-[8px] font-bold text-white bg-black/65 px-1 rounded truncate max-w-[95%] mt-0.5">
                        {tile.label}
                      </span>
                    )}

                    {hasLinks && (
                      <span
                        className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-amber-400 ring-1 ring-black z-20"
                        title="Contains lore notes or linked events"
                      />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Tile Inspector Panel */}
        <div className="card p-5 space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Tile ({inspectedTile.col}, {inspectedTile.row})</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                {TERRAIN_PALETTE[inspectedTile.terrain]?.label}
                {inspectedTile.relief && inspectedTile.relief !== 'none'
                  ? ` · ${RELIEF_PALETTE[inspectedTile.relief]?.label}`
                  : ''}
                {inspectedTile.flora && inspectedTile.flora !== 'none'
                  ? ` · ${FLORA_PALETTE[inspectedTile.flora]?.label}`
                  : ''}
              </p>
            </div>
            <span className="text-2xl">
              {OVERLAY_PALETTE[inspectedTile.overlay]?.symbol ||
                TERRAIN_PALETTE[inspectedTile.terrain]?.symbol}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Location Name / Label
              </label>
              <input
                type="text"
                value={inspectedTile.label || ''}
                onChange={(e) => handleUpdateInspectedTile({ label: e.target.value })}
                placeholder="e.g., Mount Doom, Silverwood..."
                className="input w-full text-sm h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Base Terrain
                </label>
                <select
                  value={inspectedTile.terrain}
                  onChange={(e) =>
                    handleUpdateInspectedTile({ terrain: e.target.value as TerrainType })
                  }
                  className="input w-full text-xs py-1 h-8"
                >
                  {Object.values(TERRAIN_PALETTE).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.symbol} {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Landmark Marker
                </label>
                <select
                  value={inspectedTile.overlay}
                  onChange={(e) =>
                    handleUpdateInspectedTile({ overlay: e.target.value as TileOverlay })
                  }
                  className="input w-full text-xs py-1 h-8"
                >
                  {Object.values(OVERLAY_PALETTE).map((ov) => (
                    <option key={ov.id} value={ov.id}>
                      {ov.symbol} {ov.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Relief & Flora Inspector Controls */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Relief Layer
                </label>
                <select
                  value={inspectedTile.relief || 'none'}
                  onChange={(e) =>
                    handleUpdateInspectedTile({ relief: e.target.value as ReliefType })
                  }
                  className="input w-full text-xs py-1 h-8"
                >
                  {Object.values(RELIEF_PALETTE).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.symbol} {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Flora Layer
                </label>
                <select
                  value={inspectedTile.flora || 'none'}
                  onChange={(e) =>
                    handleUpdateInspectedTile({ flora: e.target.value as FloraType })
                  }
                  className="input w-full text-xs py-1 h-8"
                >
                  {Object.values(FLORA_PALETTE).map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.symbol} {f.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* River, Road & Territory Inspector Controls */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(inspectedTile.hasRiver)}
                  onChange={(e) => handleUpdateInspectedTile({ hasRiver: e.target.checked })}
                  className="rounded"
                />
                <span>💧 River</span>
              </label>
              <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(inspectedTile.hasRoad)}
                  onChange={(e) => handleUpdateInspectedTile({ hasRoad: e.target.checked })}
                  className="rounded"
                />
                <span>🛤️ Trade Road</span>
              </label>
            </div>

            {entities.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Controlling Faction / Territory
                </label>
                <select
                  value={inspectedTile.territoryId || ''}
                  onChange={(e) =>
                    handleUpdateInspectedTile({
                      territoryId: e.target.value || undefined,
                    })
                  }
                  className="input w-full text-xs py-1 h-8"
                >
                  <option value="">Unclaimed / Neutral</option>
                  {entities.map((ent) => (
                    <option key={ent.id} value={ent.id}>
                      {ent.icon || '🚩'} {ent.name} ({ent.category})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Lore & Geographic Notes
              </label>
              <textarea
                value={inspectedTile.notes || ''}
                onChange={(e) => handleUpdateInspectedTile({ notes: e.target.value })}
                placeholder="Record landmarks, resources, or events here..."
                className="input w-full text-sm min-h-[65px]"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                <Tag className="h-3 w-3" />
                <span>Tags (Resources, Features, Factions)</span>
              </label>
              <div className="flex gap-1.5 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  placeholder="Add tag..."
                  className="input flex-1 text-xs h-8"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="btn-outline px-2.5 text-xs h-8"
                >
                  Add
                </button>
              </div>
              {inspectedTile.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {inspectedTile.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-destructive"
                        aria-label={`Remove tag ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Linked Entities & Events Summary */}
            <div className="border-t border-border pt-3 space-y-2">
              <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                <span>
                  History ({linkedEvents.length}) & Factions ({linkedEntities.length})
                </span>
              </div>

              {linkedEntities.length > 0 && (
                <div className="space-y-1">
                  {linkedEntities.map((ent) => (
                    <div
                      key={ent.id}
                      className="text-xs p-1.5 rounded bg-muted/60 flex items-center justify-between"
                    >
                      <span className="font-medium">
                        {ent.icon} {ent.name}
                      </span>
                      <span className="text-[10px] uppercase text-muted-foreground">
                        {ent.category}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {linkedEvents.length > 0 ? (
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {linkedEvents.map((ev) => (
                    <div key={ev.id} className="text-xs p-2 rounded bg-muted/50 space-y-0.5">
                      <div className="font-semibold flex justify-between">
                        <span>
                          Turn #{ev.moveId} · {ev.power || ev.card.value}
                        </span>
                        <span className="text-muted-foreground">{ev.stage}</span>
                      </div>
                      {ev.note && <p className="text-muted-foreground">{ev.note}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No timeline moves linked to this tile yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
