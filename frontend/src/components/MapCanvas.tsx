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
} from 'lucide-react'
import {
  DrawRecord,
  MapState,
  TerrainType,
  TileOverlay,
  TilePattern,
  WorldEntity,
} from '../engine/types'
import {
  TERRAIN_PALETTE,
  OVERLAY_PALETTE,
  getTileId,
  createDefaultTile,
  paintTile,
  bucketFillTerrain,
  createInitialMap,
  exportMapToSvgString,
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

export function MapCanvas({
  map,
  worldName,
  drawHistory = [],
  entities = [],
  onChange,
}: MapCanvasProps) {
  const [activeTool, setActiveTool] = useState<MapTool>('brush')
  const [selectedTerrain, setSelectedTerrain] = useState<TerrainType>('forest')
  const [secondaryTerrain, setSecondaryTerrain] = useState<TerrainType>('plains')
  const [selectedPattern, setSelectedPattern] = useState<TilePattern>('solid')
  const [selectedOverlay, setSelectedOverlay] = useState<TileOverlay>('none')
  const [selectedTileId, setSelectedTileId] = useState<string>('10,6')
  const [isDragging, setIsDragging] = useState(false)
  const [tagInput, setTagInput] = useState('')

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
          secondaryTerrain: undefined,
          pattern: 'solid',
          overlay: 'none',
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
      onChange(
        paintTile(map, col, row, {
          terrain: selectedTerrain,
          secondaryTerrain: selectedPattern === 'solid' ? undefined : secondaryTerrain,
          pattern: selectedPattern,
          overlay: selectedOverlay,
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
        | 'overlay'
        | 'linkedEventIds'
        | 'linkedEntityIds'
      >
    >
  ) => {
    onChange(paintTile(map, inspectedTile.col, inspectedTile.row, updates))
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
    const svgString = exportMapToSvgString(map, worldName)
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
    const svgString = exportMapToSvgString(map, worldName)
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

    if (!tile.secondaryTerrain || !tile.pattern || tile.pattern === 'solid') {
      return { backgroundColor: primaryColor }
    }
    if (tile.pattern === 'diagonal') {
      return {
        background: `linear-gradient(135deg, ${primaryColor} 50%, ${secColor} 50%)`,
      }
    }
    if (tile.pattern === 'horizontal') {
      return {
        background: `linear-gradient(to bottom, ${primaryColor} 50%, ${secColor} 50%)`,
      }
    }
    if (tile.pattern === 'vertical') {
      return {
        background: `linear-gradient(to right, ${primaryColor} 50%, ${secColor} 50%)`,
      }
    }
    if (tile.pattern === 'checkered') {
      return {
        background: `repeating-conic-gradient(${primaryColor} 0% 25%, ${secColor} 0% 50%) 50% / 16px 16px`,
      }
    }
    return { backgroundColor: primaryColor }
  }

  const linkedEvents = drawHistory.filter(
    (ev) =>
      inspectedTile.linkedEventIds.includes(ev.id) ||
      ev.linkedTileIds?.includes(inspectedTile.id)
  )

  const linkedEntities = entities.filter(
    (ent) =>
      inspectedTile.linkedEntityIds.includes(ent.id) ||
      ent.originTileId === inspectedTile.id
  )

  return (
    <div
      className="space-y-6 select-none"
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    >
      {/* Toolbar */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Map Tools">
          <button
            type="button"
            onClick={() => setActiveTool('brush')}
            className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
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
            className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
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
            className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
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
            className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
              activeTool === 'erase'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent text-foreground'
            }`}
          >
            <Eraser className="h-4 w-4" />
            <span>Erase</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportSvg}
            className="btn-outline px-3 py-2 text-sm flex items-center gap-2"
            title="Download scalable vector SVG map"
          >
            <Download className="h-4 w-4" />
            <span>Export SVG</span>
          </button>
          <button
            type="button"
            onClick={handleExportPng}
            className="btn-outline px-3 py-2 text-sm flex items-center gap-2"
            title="Download PNG snapshot of map"
          >
            <Download className="h-4 w-4" />
            <span>Export PNG</span>
          </button>
          <button
            type="button"
            onClick={() => onChange(createInitialMap(map.width, map.height))}
            className="btn-outline px-3 py-2 text-sm flex items-center gap-2"
            title="Reset map to default continent outline"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Continent</span>
          </button>
        </div>
      </div>

      {/* Palette Bar (Visible when Brush or Fill is active) */}
      {(activeTool === 'brush' || activeTool === 'fill') && (
        <div className="card p-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Primary Terrain */}
            <div className="lg:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                Terrain Palette
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {Object.values(TERRAIN_PALETTE).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTerrain(t.id)}
                    className={`p-2 rounded border text-xs flex flex-col items-center gap-1 transition-all ${
                      selectedTerrain === t.id
                        ? 'ring-2 ring-primary border-primary font-semibold bg-accent'
                        : 'border-border hover:bg-muted/60'
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-inner"
                      style={{ backgroundColor: t.color }}
                    >
                      {t.symbol}
                    </span>
                    <span className="truncate w-full text-center">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Overlays & Pattern Mixing */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                  Landmark / Overlay Stamp
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {Object.values(OVERLAY_PALETTE).map((ov) => (
                    <button
                      key={ov.id}
                      type="button"
                      onClick={() => setSelectedOverlay(ov.id)}
                      title={ov.label}
                      className={`p-1.5 rounded border text-xs flex flex-col items-center justify-center h-12 ${
                        selectedOverlay === ov.id
                          ? 'ring-2 ring-primary border-primary bg-accent font-semibold'
                          : 'border-border hover:bg-muted/60'
                      }`}
                    >
                      <span className="text-base">{ov.symbol || '∅'}</span>
                      <span className="text-[10px] truncate max-w-full">
                        {ov.id === 'none' ? 'None' : ov.label.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    2-Color Pattern
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
                {selectedPattern !== 'solid' && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      2nd Terrain
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
            </div>
          </div>
        </div>
      )}

      {/* Main Grid & Tile Inspector Split */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Interactive 20x12 Grid */}
        <div className="xl:col-span-3 card p-4 overflow-x-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">
                {worldName} Grid ({map.width} × {map.height})
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              Click or drag to paint · Select tile to inspect history & settlements
            </span>
          </div>

          <div
            className="inline-grid border-2 border-border rounded-lg overflow-hidden shadow-md"
            style={{
              gridTemplateColumns: `repeat(${map.width}, minmax(38px, 1fr))`,
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
                const isSelected = selectedTileId === id
                const hasLinks =
                  tile.linkedEventIds.length > 0 ||
                  tile.linkedEntityIds.length > 0 ||
                  Boolean(tile.notes) ||
                  tile.tags.length > 0

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
                      overlayMeta.id !== 'none' ? ` · ${overlayMeta.label}` : ''
                    }${tile.label ? ` — ${tile.label}` : ''}`}
                    className={`relative aspect-square w-10 sm:w-11 border border-black/15 flex flex-col items-center justify-center transition-transform ${
                      isSelected ? 'ring-2 ring-white z-10 scale-105 shadow-lg' : 'hover:brightness-110'
                    }`}
                  >
                    <span className="text-sm leading-none drop-shadow">
                      {overlayMeta.symbol || terrainMeta.symbol}
                    </span>
                    {tile.label && (
                      <span className="text-[8px] font-bold text-white bg-black/60 px-1 rounded truncate max-w-[95%] mt-0.5">
                        {tile.label}
                      </span>
                    )}
                    {hasLinks && (
                      <span
                        className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-amber-400 ring-1 ring-black"
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
                <span>Tile ({inspectedTile.col}, {inspectedTile.row})</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                {TERRAIN_PALETTE[inspectedTile.terrain]?.label}
                {inspectedTile.overlay !== 'none'
                  ? ` · ${OVERLAY_PALETTE[inspectedTile.overlay]?.label}`
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
                className="input w-full text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Terrain
                </label>
                <select
                  value={inspectedTile.terrain}
                  onChange={(e) =>
                    handleUpdateInspectedTile({ terrain: e.target.value as TerrainType })
                  }
                  className="input w-full text-xs py-1 h-9"
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
                  Overlay
                </label>
                <select
                  value={inspectedTile.overlay}
                  onChange={(e) =>
                    handleUpdateInspectedTile({ overlay: e.target.value as TileOverlay })
                  }
                  className="input w-full text-xs py-1 h-9"
                >
                  {Object.values(OVERLAY_PALETTE).map((ov) => (
                    <option key={ov.id} value={ov.id}>
                      {ov.symbol} {ov.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Lore & Geographic Notes
              </label>
              <textarea
                value={inspectedTile.notes || ''}
                onChange={(e) => handleUpdateInspectedTile({ notes: e.target.value })}
                placeholder="Record landmarks, resources, or events here..."
                className="input w-full text-sm min-h-[75px]"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                <Tag className="h-3 w-3" />
                <span>Tags (Species, Factions, Events)</span>
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
                <span>Associated History ({linkedEvents.length}) & Entities ({linkedEntities.length})</span>
              </div>

              {linkedEntities.length > 0 && (
                <div className="space-y-1">
                  {linkedEntities.map((ent) => (
                    <div
                      key={ent.id}
                      className="text-xs p-1.5 rounded bg-muted/60 flex items-center justify-between"
                    >
                      <span className="font-medium">{ent.name}</span>
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
