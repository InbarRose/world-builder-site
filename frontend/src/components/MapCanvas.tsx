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
  Layers,
  Plus,
  Trash2,
  Eye,
  Sliders,
} from 'lucide-react'
import {
  DrawRecord,
  FloraType,
  GeographyPreset,
  MapState,
  ReliefType,
  TerrainType,
  TileColoringMode,
  TileOverlay,
  TilePattern,
  TileSlotCategory,
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
  getEffectiveTileSlots,
  getTileDomain,
  getTileVariantSeed,
  addSlotToTile,
  removeSlotFromTile,
} from '../engine/mapEngine'
import { SLOT_ICON_PALETTE } from '../engine/presets'

export type MapTool = 'inspect' | 'brush' | 'fill' | 'erase'
export type AtlasRenderStyle = 'tilt-25d' | 'flat-illustrated' | 'simple-schematic'

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

const COLORING_MODES: { id: TileColoringMode; label: string }[] = [
  { id: 'fill', label: 'Full Color Fill' },
  { id: 'outline', label: 'Parchment Outline' },
  { id: 'patterned', label: 'Dual-Tone Pattern' },
]

const GEOGRAPHY_PRESETS: { id: GeographyPreset; label: string }[] = [
  { id: 'continent', label: 'Central Continent' },
  { id: 'archipelago', label: 'Island Archipelago' },
  { id: 'twin-continents', label: 'Twin Continents' },
  { id: 'inland-sea', label: 'Inland Sea Basin' },
  { id: 'pangaea', label: 'Supercontinent (Pangaea)' },
]

/**
 * Renders hand-drawn SVG cartographic artwork with coordinate-seeded variance
 * so no two neighboring mountains, forests, or coastlines look identical.
 */
function TileCartographySvg({
  col,
  row,
  terrain,
  relief,
  flora,
  hasRiver,
  hasRoad,
  isCoastalLand,
  simpleMode,
}: {
  col: number
  row: number
  terrain: TerrainType
  relief?: ReliefType
  flora?: FloraType
  hasRiver?: boolean
  hasRoad?: boolean
  isCoastalLand: boolean
  simpleMode: boolean
}) {
  const v = getTileVariantSeed(col, row)
  const effectiveRelief =
    relief && relief !== 'none'
      ? relief
      : terrain === 'mountain'
      ? 'mountain'
      : terrain === 'volcano'
      ? 'volcano'
      : terrain === 'canyon'
      ? 'canyon'
      : 'none'

  const effectiveFlora =
    flora && flora !== 'none'
      ? flora
      : terrain === 'forest'
      ? 'forest'
      : terrain === 'jungle'
      ? 'jungle'
      : terrain === 'swamp'
      ? 'marsh'
      : 'none'

  return (
    <svg
      viewBox="0 0 48 48"
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    >
      {/* Subtle Coastal Double-Hatching when Land borders Water */}
      {!simpleMode && isCoastalLand && (
        <rect
          x="1.5"
          y="1.5"
          width="45"
          height="45"
          rx="3"
          fill="none"
          stroke="#fef3c7"
          strokeWidth="1.4"
          opacity="0.55"
        />
      )}

      {/* Subtle Ocean / Water Wave Variance (Background only, non-noisy) */}
      {!simpleMode && (terrain === 'ocean' || terrain === 'water') && (
        <g stroke="#bae6fd" strokeWidth="1" fill="none" opacity="0.28">
          {v === 0 && <path d="M 8 16 Q 14 13, 20 16 T 32 16" />}
          {v === 1 && <path d="M 14 30 Q 20 27, 26 30 T 38 30" />}
          {v === 2 && (
            <>
              <path d="M 6 22 Q 12 19, 18 22" />
              <path d="M 26 14 Q 32 11, 38 14" />
            </>
          )}
          {v === 3 && <path d="M 10 34 Q 18 31, 26 34" />}
        </g>
      )}

      {/* Subtle Grassland / Dune Micro-Texture (Varied by seed, zero icon noise) */}
      {!simpleMode && terrain === 'plains' && effectiveRelief === 'none' && effectiveFlora === 'none' && (
        <g stroke="#3f6212" strokeWidth="0.9" fill="none" opacity="0.22">
          {v === 0 && <path d="M 12 32 L 10 28 M 14 32 L 14 27 M 16 32 L 18 28" />}
          {v === 1 && <path d="M 30 18 L 28 14 M 32 18 L 32 13 M 34 18 L 36 14" />}
          {v === 2 && <path d="M 20 36 L 19 32 M 22 36 L 23 32" />}
        </g>
      )}

      {!simpleMode && terrain === 'desert' && effectiveRelief === 'none' && (
        <g stroke="#92400e" strokeWidth="1" fill="none" opacity="0.25">
          {v % 2 === 0 ? (
            <path d="M 6 30 Q 18 23, 30 30 T 42 28" />
          ) : (
            <path d="M 8 18 Q 22 12, 36 19" />
          )}
        </g>
      )}

      {/* Hand-Drawn Engraved Mountain / Hill / Volcano Silhouettes (4 Distinct Variants) */}
      {!simpleMode && effectiveRelief === 'mountain' && (
        <g opacity="0.48">
          {v === 0 && (
            <>
              <polygon points="6,38 18,12 30,38" fill="#44403c" />
              <polygon points="18,12 24,25 18,38 6,38" fill="#78716c" />
              <polygon points="20,38 32,15 43,38" fill="#292524" />
              <polygon points="18,12 14,20 22,20" fill="#f5f5f4" />
              <polygon points="32,15 28,22 36,22" fill="#f5f5f4" />
            </>
          )}
          {v === 1 && (
            <>
              <polygon points="8,39 24,10 40,39" fill="#44403c" />
              <polygon points="24,10 24,39 8,39" fill="#78716c" />
              <polygon points="24,10 19,19 29,19" fill="#fafaf9" />
            </>
          )}
          {v === 2 && (
            <>
              <polygon points="4,38 15,16 26,38" fill="#57534e" />
              <polygon points="22,38 35,11 45,38" fill="#44403c" />
              <polygon points="35,11 30,19 40,19" fill="#fafaf9" />
            </>
          )}
          {v === 3 && (
            <>
              <polygon points="12,39 26,11 41,39" fill="#44403c" />
              <polygon points="5,39 15,20 25,39" fill="#57534e" />
              <polygon points="26,11 21,19 31,19" fill="#fafaf9" />
            </>
          )}
        </g>
      )}

      {!simpleMode && effectiveRelief === 'hills' && (
        <g stroke="#57534e" strokeWidth="1.4" fill="#a8a29e" fillOpacity="0.32">
          {v % 2 === 0 ? (
            <>
              <path d="M 6 34 Q 16 22, 26 34 Z" />
              <path d="M 20 36 Q 31 24, 42 36 Z" />
            </>
          ) : (
            <path d="M 10 35 Q 24 20, 38 35 Z" />
          )}
        </g>
      )}

      {!simpleMode && effectiveRelief === 'volcano' && (
        <g opacity="0.58">
          <polygon points="8,39 20,14 28,14 40,39" fill="#451a03" />
          <polygon points="20,14 28,14 25,22 22,20" fill="#ef4444" />
        </g>
      )}

      {/* Varied Organic Forest / Canopy Silhouette Clusters */}
      {!simpleMode && (effectiveFlora === 'forest' || effectiveFlora === 'jungle') && (
        <g fill={effectiveFlora === 'jungle' ? '#14532d' : '#166534'} opacity="0.38">
          {v === 0 && (
            <>
              <circle cx="14" cy="18" r="6" />
              <circle cx="34" cy="20" r="6.5" />
              <circle cx="24" cy="32" r="7" />
            </>
          )}
          {v === 1 && (
            <>
              <polygon points="14,10 8,24 20,24" />
              <polygon points="34,12 28,26 40,26" />
              <polygon points="24,22 17,37 31,37" />
            </>
          )}
          {v === 2 && (
            <>
              <circle cx="16" cy="28" r="7" />
              <circle cx="31" cy="18" r="7.5" />
            </>
          )}
          {v === 3 && (
            <>
              <polygon points="18,12 11,27 25,27" />
              <polygon points="31,20 24,35 38,35" />
            </>
          )}
        </g>
      )}

      {/* Rivers & Trade Roads */}
      {hasRiver && (
        <path
          d={
            v % 2 === 0
              ? 'M 0 14 Q 24 32, 48 18'
              : 'M 14 0 Q 28 24, 34 48'
          }
          stroke="#0284c7"
          strokeWidth="4.2"
          fill="none"
          strokeLinecap="round"
          opacity="0.9"
        />
      )}

      {hasRoad && (
        <path
          d={
            v % 2 === 0
              ? 'M 0 26 Q 24 22, 48 26'
              : 'M 24 0 L 24 48'
          }
          stroke="#573619"
          strokeWidth="2.2"
          strokeDasharray="4 2.5"
          fill="none"
        />
      )}
    </svg>
  )
}

export function MapCanvas({
  map,
  worldName,
  drawHistory = [],
  entities = [],
  onChange,
}: MapCanvasProps) {
  const [activeTool, setActiveTool] = useState<MapTool>('brush')
  const [renderStyle, setRenderStyle] = useState<AtlasRenderStyle>('tilt-25d')
  const [showPaletteDrawer, setShowPaletteDrawer] = useState(true)
  const [showGridDrawer, setShowGridDrawer] = useState(false)

  const [selectedTerrain, setSelectedTerrain] = useState<TerrainType>('forest')
  const [selectedRelief, setSelectedRelief] = useState<ReliefType>('none')
  const [selectedFlora, setSelectedFlora] = useState<FloraType>('none')
  const [secondaryTerrain, setSecondaryTerrain] = useState<TerrainType>('plains')
  const [selectedPattern, setSelectedPattern] = useState<TilePattern>('solid')
  const [selectedColoringMode, setSelectedColoringMode] =
    useState<TileColoringMode>('fill')
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

  // Custom Slot Builder inside Tile Inspector
  const [newSlotCategory, setNewSlotCategory] = useState<TileSlotCategory>('settlement')
  const [newSlotName, setNewSlotName] = useState('')
  const [newSlotIcon, setNewSlotIcon] = useState('🏡')

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

  const inspectedDomain = getTileDomain(inspectedTile)
  const inspectedSlots = getEffectiveTileSlots(inspectedTile, entities)

  const applyToolToTile = (col: number, row: number) => {
    const id = getTileId(col, row)
    setSelectedTileId(id)

    if (activeTool === 'inspect') {
      return
    }

    if (activeTool === 'erase') {
      onChange(
        paintTile(map, col, row, {
          domain: 'water',
          terrain: 'ocean',
          relief: 'none',
          flora: 'none',
          secondaryTerrain: undefined,
          pattern: 'solid',
          coloringMode: 'fill',
          customColors: undefined,
          slots: [],
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
          selectedPattern,
          selectedColoringMode
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
          coloringMode: selectedColoringMode,
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
    updates: Partial<Omit<typeof inspectedTile, 'id' | 'col' | 'row'>>
  ) => {
    onChange(paintTile(map, inspectedTile.col, inspectedTile.row, updates))
  }

  const handleAddCustomSlotToInspected = (
    category: TileSlotCategory,
    name: string,
    icon: string,
    priority: number
  ) => {
    const trimmedName = name.trim() || icon
    const updatedTile = addSlotToTile(inspectedTile, {
      category,
      type: trimmedName.toLowerCase().replace(/\s+/g, '_'),
      name: trimmedName,
      icon,
      priority,
    })
    // Notice: adding a Lake slot to a land tile keeps it a land tile!
    handleUpdateInspectedTile({
      slots: updatedTile.slots,
    })
    setNewSlotName('')
  }

  const handleRemoveSlotFromInspected = (slotId: string) => {
    if (slotId.startsWith('derived_overlay_')) {
      handleUpdateInspectedTile({ overlay: 'none' })
      return
    }
    if (slotId.startsWith('derived_relief_')) {
      handleUpdateInspectedTile({ relief: 'none' })
      return
    }
    if (slotId.startsWith('derived_flora_')) {
      handleUpdateInspectedTile({ flora: 'none' })
      return
    }
    const updatedTile = removeSlotFromTile(inspectedTile, slotId)
    handleUpdateInspectedTile({ slots: updatedTile.slots })
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
    const meta = TERRAIN_PALETTE[tile.terrain] || TERRAIN_PALETTE.ocean
    const primaryColor = tile.customColors?.primary || meta.color
    const secColor =
      tile.customColors?.secondary ||
      (tile.secondaryTerrain
        ? TERRAIN_PALETTE[tile.secondaryTerrain]?.color
        : undefined) ||
      meta.secondaryColor

    const style: React.CSSProperties = {}

    if (tile.coloringMode === 'outline') {
      style.backgroundColor = '#f5eedc'
      style.boxShadow = `inset 0 0 0 3px ${primaryColor}`
    } else if (
      tile.coloringMode === 'patterned' ||
      (tile.pattern && tile.pattern !== 'solid')
    ) {
      const pat = tile.pattern === 'solid' ? 'diagonal' : tile.pattern || 'diagonal'
      if (pat === 'diagonal') {
        style.background = `linear-gradient(135deg, ${primaryColor} 50%, ${secColor} 50%)`
      } else if (pat === 'horizontal') {
        style.background = `linear-gradient(180deg, ${primaryColor} 50%, ${secColor} 50%)`
      } else if (pat === 'vertical') {
        style.background = `linear-gradient(90deg, ${primaryColor} 50%, ${secColor} 50%)`
      } else if (pat === 'checkered') {
        style.background = `repeating-conic-gradient(${primaryColor} 0% 25%, ${secColor} 0% 50%) 50% / 16px 16px`
      }
    } else {
      style.backgroundColor = primaryColor
    }

    if (tile.territoryId && entityColorMap[tile.territoryId]) {
      style.boxShadow = `inset 0 0 0 2.5px ${entityColorMap[tile.territoryId].color}`
    }

    return style
  }

  const isCoastalLandTile = (col: number, row: number, tile: typeof inspectedTile) => {
    if (getTileDomain(tile) !== 'land') return false
    const neighbors = [
      [col + 1, row],
      [col - 1, row],
      [col, row + 1],
      [col, row - 1],
    ]
    return neighbors.some(([nc, nr]) => {
      const nt = map.tiles[getTileId(nc, nr)]
      return nt && getTileDomain(nt) === 'water'
    })
  }

  const linkedEvents = drawHistory.filter(
    (rec) =>
      inspectedTile.linkedEventIds.includes(rec.id) ||
      (rec.linkedTileIds && rec.linkedTileIds.includes(inspectedTile.id))
  )

  const linkedEntities = entities.filter(
    (ent) =>
      inspectedTile.linkedEntityIds.includes(ent.id) ||
      ent.originTileId === inspectedTile.id ||
      inspectedTile.territoryId === ent.id
  )

  return (
    <div
      className="space-y-4 select-none"
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    >
      {/* Sleek Top Cartography Bar */}
      <div className="no-print card p-3 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Primary Interaction Tools */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTool('brush')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                activeTool === 'brush'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <Paintbrush className="h-3.5 w-3.5" />
              <span>Paint Brush</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTool('fill')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                activeTool === 'fill'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <PaintBucket className="h-3.5 w-3.5" />
              <span>Bucket Fill</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTool('inspect')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                activeTool === 'inspect'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <MousePointer className="h-3.5 w-3.5" />
              <span>Inspect Tile</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTool('erase')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                activeTool === 'erase'
                  ? 'bg-destructive text-destructive-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <Eraser className="h-3.5 w-3.5" />
              <span>Erase</span>
            </button>

            <div className="h-5 w-px bg-border mx-1 hidden sm:block" />

            {/* Drawer Toggles to Prevent Clutter */}
            <button
              type="button"
              onClick={() => setShowPaletteDrawer((v) => !v)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 border transition-colors ${
                showPaletteDrawer
                  ? 'bg-accent border-primary/40 text-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Palette & Overlays</span>
            </button>
            <button
              type="button"
              onClick={() => setShowGridDrawer((v) => !v)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 border transition-colors ${
                showGridDrawer
                  ? 'bg-accent border-primary/40 text-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Dimensions & Templates</span>
            </button>
          </div>

          {/* Right: Perspective Mode Switcher & Exports */}
          <div className="flex flex-wrap items-center gap-1.5">
            <div
              className="inline-flex rounded-md border border-border p-0.5 bg-muted/40"
              role="group"
              aria-label="Atlas Visual Perspective"
            >
              <button
                type="button"
                onClick={() => setRenderStyle('tilt-25d')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  renderStyle === 'tilt-25d'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="2.5D Angled Fantasy Atlas Table View"
              >
                2.5D Atlas
              </button>
              <button
                type="button"
                onClick={() => setRenderStyle('flat-illustrated')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  renderStyle === 'flat-illustrated'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Top-Down Illustrated Cartography"
              >
                Flat Illustrated
              </button>
              <button
                type="button"
                onClick={() => setRenderStyle('simple-schematic')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  renderStyle === 'simple-schematic'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Clean Schematic Print View"
              >
                Simple View
              </button>
            </div>

            {/* Quick Dimension Presets */}
            <div className="flex items-center gap-1">
              {[
                { label: '14×9', w: 14, h: 9 },
                { label: '20×12', w: 20, h: 12 },
                { label: '26×15', w: 26, h: 15 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleResizeGrid(preset.w, preset.h)}
                  className={`px-2 py-1 rounded border text-[11px] font-medium ${
                    map.width === preset.w && map.height === preset.h
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:bg-accent'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleExportPng}
              className="btn-outline px-2.5 py-1.5 text-xs flex items-center gap-1"
            >
              <Download className="h-3.5 w-3.5" />
              <span>PNG</span>
            </button>
            <button
              type="button"
              onClick={handleExportSvg}
              className="btn-outline px-2.5 py-1.5 text-xs flex items-center gap-1"
            >
              <Download className="h-3.5 w-3.5" />
              <span>SVG</span>
            </button>
          </div>
        </div>

        {/* Collapsible Dimensions & Geography Template Drawer */}
        {showGridDrawer && (
          <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-muted-foreground">Custom Grid:</span>
              <input
                type="number"
                aria-label="Custom Map Width"
                min={6}
                max={40}
                value={customWidth}
                onChange={(e) => setCustomWidth(Number(e.target.value))}
                className="input h-7 w-14 text-xs px-1.5 text-center"
              />
              <span>×</span>
              <input
                type="number"
                aria-label="Custom Map Height"
                min={6}
                max={30}
                value={customHeight}
                onChange={(e) => setCustomHeight(Number(e.target.value))}
                className="input h-7 w-14 text-xs px-1.5 text-center"
              />
              <button
                type="button"
                onClick={() => handleResizeGrid(customWidth, customHeight)}
                className="btn-outline h-7 px-2.5 text-xs"
              >
                Apply Size
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-muted-foreground">Geography Template:</span>
              <select
                aria-label="Geography Template"
                value={geoPreset}
                onChange={(e) => setGeoPreset(e.target.value as GeographyPreset)}
                className="input h-7 text-xs py-0 px-2 w-auto"
              >
                {GEOGRAPHY_PRESETS.map((gp) => (
                  <option key={gp.id} value={gp.id}>
                    {gp.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() =>
                  onChange(createInitialMap(map.width, map.height, geoPreset))
                }
                className="btn-outline px-2.5 py-1 text-xs flex items-center gap-1 text-destructive"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Generate New Template</span>
              </button>
            </div>
          </div>
        )}

        {/* Collapsible Brush Palette & Multi-Layer Overlay Drawer */}
        {showPaletteDrawer && (activeTool === 'brush' || activeTool === 'fill') && (
          <div className="pt-2 border-t border-border space-y-3">
            {/* Base Terrain Row */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  1. Base Biome & Domain (Empty grass/ocean tiles stay clean without icon noise)
                </label>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Tile Style:</span>
                  <select
                    value={selectedColoringMode}
                    onChange={(e) =>
                      setSelectedColoringMode(e.target.value as TileColoringMode)
                    }
                    className="input h-6 text-xs py-0 px-2 w-auto"
                  >
                    {COLORING_MODES.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-1.5">
                {Object.values(TERRAIN_PALETTE).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTerrain(t.id)}
                    className={`p-1.5 rounded border text-xs flex flex-col items-center gap-0.5 transition-all ${
                      selectedTerrain === t.id
                        ? 'ring-2 ring-primary border-primary font-bold scale-105'
                        : 'border-border opacity-85 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: t.color, color: '#fff' }}
                  >
                    <span className="text-sm drop-shadow">{t.symbol}</span>
                    <span className="text-[9px] leading-tight drop-shadow truncate max-w-full">
                      {t.label.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Composite Layers: Relief + Flora + Linear Networks + Landmarks */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  2. Elevation Slot
                </label>
                <select
                  value={selectedRelief}
                  onChange={(e) => setSelectedRelief(e.target.value as ReliefType)}
                  className="input h-8 text-xs py-1 w-full"
                >
                  {Object.values(RELIEF_PALETTE).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.symbol ? `${r.symbol} ${r.label}` : 'Flat / None'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  3. Vegetation Slot
                </label>
                <select
                  value={selectedFlora}
                  onChange={(e) => setSelectedFlora(e.target.value as FloraType)}
                  className="input h-8 text-xs py-1 w-full"
                >
                  {Object.values(FLORA_PALETTE).map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.symbol ? `${f.symbol} ${f.label}` : 'No Flora Overlay'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  4. Primary Settlement / Marker
                </label>
                <select
                  value={selectedOverlay}
                  onChange={(e) => setSelectedOverlay(e.target.value as TileOverlay)}
                  className="input h-8 text-xs py-1 w-full"
                >
                  {Object.values(OVERLAY_PALETTE).map((ov) => (
                    <option key={ov.id} value={ov.id}>
                      {ov.symbol ? `${ov.symbol} ${ov.label}` : 'None'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  5. Rivers, Roads & Borders
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPaintRiver(!paintRiver)}
                    className={`px-2 py-1 rounded border text-xs flex-1 ${
                      paintRiver
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                        : 'bg-background border-border'
                    }`}
                  >
                    💧 River
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaintRoad(!paintRoad)}
                    className={`px-2 py-1 rounded border text-xs flex-1 ${
                      paintRoad
                        ? 'bg-amber-800 text-white border-amber-800 font-semibold'
                        : 'bg-background border-border'
                    }`}
                  >
                    🛤️ Road
                  </button>
                </div>
              </div>
            </div>

            {selectedPattern !== 'solid' || selectedColoringMode === 'patterned' ? (
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                <span className="font-semibold text-muted-foreground">Pattern Style:</span>
                <select
                  value={selectedPattern}
                  onChange={(e) => setSelectedPattern(e.target.value as TilePattern)}
                  className="input h-7 text-xs py-0 px-2 w-auto"
                >
                  {PATTERNS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <span className="font-semibold text-muted-foreground">Secondary Color:</span>
                <select
                  value={secondaryTerrain}
                  onChange={(e) => setSecondaryTerrain(e.target.value as TerrainType)}
                  className="input h-7 text-xs py-0 px-2 w-auto"
                >
                  {Object.values(TERRAIN_PALETTE).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.symbol} {t.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {entities.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="font-semibold text-muted-foreground">
                  Faction Territory Border:
                </span>
                <select
                  value={selectedTerritoryId}
                  onChange={(e) => setSelectedTerritoryId(e.target.value)}
                  className="input h-7 text-xs py-0 px-2 w-auto"
                >
                  <option value="">No Faction Border</option>
                  {entities.map((ent) => (
                    <option key={ent.id} value={ent.id}>
                      {ent.icon || '🚩'} {ent.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Grid & Tile Slot Inspector Split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Interactive Fantasy Cartography Canvas (8 cols) */}
        <div className="xl:col-span-8 card p-4 sm:p-5 overflow-x-auto bg-gradient-to-b from-amber-50/40 to-stone-100/50 dark:from-slate-900 dark:to-slate-950">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold tracking-tight">
                {worldName} Atlas ({map.width} × {map.height})
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {renderStyle === 'tilt-25d'
                  ? '2.5D Tabletop Perspective'
                  : renderStyle === 'flat-illustrated'
                  ? 'Illustrated Plan'
                  : 'Print Schematic'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block ring-1 ring-black/40" />
                Event Lineage
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="px-1 rounded bg-slate-800 text-white text-[9px] font-bold">
                  +N
                </span>
                Multi-Slot Tile
              </span>
              {entities.slice(0, 3).map((ent) => (
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

          {/* 2.5D Perspective Stage Wrapper */}
          <div className="atlas-perspective-stage py-2 flex justify-center">
            <div
              className={`inline-grid border-4 border-amber-950/60 dark:border-slate-700 rounded-lg overflow-hidden ${
                renderStyle === 'tilt-25d'
                  ? 'atlas-perspective-plane'
                  : 'atlas-flat-plane'
              }`}
              style={{
                gridTemplateColumns: `repeat(${map.width}, minmax(42px, 1fr))`,
              }}
              role="grid"
              aria-label="World Map Grid"
            >
              {Array.from({ length: map.height }).map((_, row) =>
                Array.from({ length: map.width }).map((__, col) => {
                  const id = getTileId(col, row)
                  const tile = map.tiles[id] || createDefaultTile(col, row)
                  const terrainMeta =
                    TERRAIN_PALETTE[tile.terrain] || TERRAIN_PALETTE.ocean
                  const isSelected = selectedTileId === id
                  const effectiveSlots = getEffectiveTileSlots(tile, entities)
                  const primarySlot = effectiveSlots[0]
                  const secondarySlot = effectiveSlots[1]
                  const extraSlotCount = Math.max(0, effectiveSlots.length - 2)

                  const hasEvents =
                    tile.linkedEventIds.length > 0 ||
                    Boolean(tile.notes) ||
                    tile.tags.length > 0

                  const hasLakeOrSpringSlot = (tile.slots || []).some(
                    (s) => s.category === 'hydrology'
                  )
                  const isCoastal = isCoastalLandTile(col, row, tile)

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
                      title={`(${col}, ${row}) [${getTileDomain(tile).toUpperCase()}] ${
                        terrainMeta.label
                      }${
                        effectiveSlots.length > 0
                          ? ` · Slots: ${effectiveSlots.map((s) => s.name).join(', ')}`
                          : ''
                      }${tile.label ? ` — ${tile.label}` : ''}`}
                      className={`relative aspect-square w-11 sm:w-12 border border-black/15 flex flex-col items-center justify-center transition-transform overflow-hidden ${
                        isSelected
                          ? 'ring-2 ring-white z-20 scale-110 shadow-xl'
                          : 'hover:brightness-105'
                      }`}
                    >
                      {/* Procedural Illustrated SVG Cartography Underlay */}
                      <TileCartographySvg
                        col={col}
                        row={row}
                        terrain={tile.terrain}
                        relief={tile.relief}
                        flora={tile.flora}
                        hasRiver={tile.hasRiver}
                        hasRoad={tile.hasRoad}
                        isCoastalLand={isCoastal}
                        simpleMode={renderStyle === 'simple-schematic'}
                      />

                      {/* Corner Micro-Indicators (Top-Left: Extra Slots or Lake/Island indicator) */}
                      {extraSlotCount > 0 ? (
                        <span
                          className="absolute top-0.5 left-0.5 px-1 rounded bg-slate-900/85 text-white text-[8px] font-bold leading-tight z-20"
                          title={`${extraSlotCount} additional slot(s) on this tile`}
                        >
                          +{extraSlotCount}
                        </span>
                      ) : hasLakeOrSpringSlot && effectiveSlots.length > 1 ? (
                        <span
                          className="absolute top-0.5 left-0.5 text-[9px] leading-none z-20"
                          title="Contains hydrology feature (Lake / Spring)"
                        >
                          💧
                        </span>
                      ) : null}

                      {/* Top-Right Corner Micro-Indicator: Historic Event Star / Faction Crest */}
                      {hasEvents && (
                        <span
                          className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-amber-400 ring-1 ring-black/70 z-20"
                          title="Has linked historical events or lore notes"
                        />
                      )}

                      {/* Center Priority Slot Display (Zero icon clutter on empty background tiles!) */}
                      {primarySlot && (
                        <div
                          className={`relative z-10 flex items-center justify-center leading-none ${
                            renderStyle === 'tilt-25d' ? '-translate-y-0.5' : ''
                          }`}
                        >
                          <span
                            className={`${
                              primarySlot.category === 'settlement' ||
                              primarySlot.category === 'myth'
                                ? 'text-base sm:text-lg filter drop-shadow-md'
                                : 'text-sm filter drop-shadow'
                            }`}
                          >
                            {primarySlot.icon}
                          </span>
                          {secondarySlot && (
                            <span className="text-[11px] -ml-0.5 translate-y-1 filter drop-shadow">
                              {secondarySlot.icon}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Map Label Banner */}
                      {tile.label && (
                        <span className="relative z-10 text-[8px] font-serif font-bold text-amber-50 bg-stone-950/75 px-1 rounded truncate max-w-[94%] mt-0.5 shadow-sm">
                          {tile.label}
                        </span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Tile Slot & Lineage Inspector (4 cols) */}
        <div className="xl:col-span-4 card p-5 space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <h3 className="text-base font-bold">
                  Tile ({inspectedTile.col}, {inspectedTile.row})
                </h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    inspectedDomain === 'land'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                  }`}
                >
                  {inspectedDomain} Domain
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {TERRAIN_PALETTE[inspectedTile.terrain]?.label} · {inspectedSlots.length}{' '}
                active slot(s)
              </p>
            </div>
            <span className="text-2xl">
              {inspectedSlots[0]?.icon ||
                TERRAIN_PALETTE[inspectedTile.terrain]?.symbol}
            </span>
          </div>

          <div className="space-y-3.5">
            {/* Location Name */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Location Name / Label
              </label>
              <input
                type="text"
                value={inspectedTile.label || ''}
                onChange={(e) => handleUpdateInspectedTile({ label: e.target.value })}
                placeholder="e.g., Mount Doom, Silverwood..."
                className="input w-full text-sm h-8"
              />
            </div>

            {/* Active Tile Slots & Priority Queue */}
            <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5 text-primary">
                  <Layers className="h-3.5 w-3.5" />
                  <span>Tile Slots (Priority Order)</span>
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Top 1–2 show on map
                </span>
              </div>

              {inspectedSlots.length === 0 ? (
                <p className="text-[11px] text-muted-foreground italic">
                  Calm background {inspectedDomain} tile (no extra icons shown). Add a feature, lake, forest, or settlement slot below!
                </p>
              ) : (
                <div className="space-y-1.5">
                  {inspectedSlots.map((slot, idx) => (
                    <div
                      key={slot.id}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded border text-xs ${
                        idx < 2
                          ? 'bg-background border-primary/40 font-medium'
                          : 'bg-muted/60 border-border opacity-85'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">{slot.icon}</span>
                        <div className="truncate">
                          <div className="truncate">{slot.name}</div>
                          <div className="text-[10px] text-muted-foreground uppercase">
                            {slot.category} · Priority {slot.priority}
                            {idx === 0
                              ? ' ★ Primary'
                              : idx === 1
                              ? ' · Secondary'
                              : ' · Corner (+)'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlotFromInspected(slot.id)}
                        className="text-muted-foreground hover:text-destructive p-1"
                        title="Remove slot from tile"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Add Slot to Tile */}
              <div className="pt-2 border-t border-border/60 space-y-2">
                <div className="text-[11px] font-semibold text-muted-foreground">
                  + Add Feature / Slot to Tile
                </div>
                <div className="flex flex-wrap gap-1">
                  {SLOT_ICON_PALETTE.map((group) => (
                    <button
                      key={group.category}
                      type="button"
                      onClick={() => {
                        setNewSlotCategory(group.category)
                        setNewSlotIcon(group.icons[0].icon)
                        setNewSlotName(group.icons[0].name)
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] border ${
                        newSlotCategory === group.category
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border'
                      }`}
                    >
                      {group.category}
                    </button>
                  ))}
                </div>

                {/* Preset Icons for Selected Slot Category */}
                <div className="flex flex-wrap gap-1">
                  {SLOT_ICON_PALETTE.find((g) => g.category === newSlotCategory)?.icons.map(
                    (item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => {
                          const group = SLOT_ICON_PALETTE.find(
                            (g) => g.category === newSlotCategory
                          )!
                          handleAddCustomSlotToInspected(
                            newSlotCategory,
                            item.name,
                            item.icon,
                            group.defaultPriority
                          )
                        }}
                        className="px-2 py-1 rounded border border-border bg-background hover:bg-accent text-[11px] flex items-center gap-1"
                        title={`Add ${item.name} slot to tile`}
                      >
                        <span>{item.icon}</span>
                        <span>{item.name}</span>
                      </button>
                    )
                  )}
                </div>

                {/* Custom Slot Name + Icon Input */}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newSlotIcon}
                    onChange={(e) => setNewSlotIcon(e.target.value)}
                    className="input w-11 h-7 text-center text-xs px-1"
                    maxLength={4}
                    title="Custom Slot Icon"
                  />
                  <input
                    type="text"
                    value={newSlotName}
                    onChange={(e) => setNewSlotName(e.target.value)}
                    placeholder="Custom slot name (e.g. Crater Lake)..."
                    className="input flex-1 h-7 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const group = SLOT_ICON_PALETTE.find(
                        (g) => g.category === newSlotCategory
                      )
                      handleAddCustomSlotToInspected(
                        newSlotCategory,
                        newSlotName || 'Feature',
                        newSlotIcon || '✨',
                        group?.defaultPriority || 70
                      )
                    }}
                    className="btn-primary px-2.5 h-7 text-xs flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Base Terrain, Coloring Style & Custom Colors */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Base Biome
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
                  Coloring Mode
                </label>
                <select
                  value={inspectedTile.coloringMode || 'fill'}
                  onChange={(e) =>
                    handleUpdateInspectedTile({
                      coloringMode: e.target.value as TileColoringMode,
                    })
                  }
                  className="input w-full text-xs py-1 h-8"
                >
                  {COLORING_MODES.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Primary & Secondary Tile Palette Overrides */}
            <div className="flex items-center justify-between gap-2 text-xs bg-muted/30 p-2 rounded border border-border">
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Primary:
                </label>
                <input
                  type="color"
                  aria-label="Tile Primary Color"
                  value={
                    inspectedTile.customColors?.primary ||
                    TERRAIN_PALETTE[inspectedTile.terrain]?.color ||
                    '#86efac'
                  }
                  onChange={(e) =>
                    handleUpdateInspectedTile({
                      customColors: {
                        ...inspectedTile.customColors,
                        primary: e.target.value,
                      },
                    })
                  }
                  className="h-6 w-8 rounded border border-border cursor-pointer"
                />
                <label className="text-[11px] font-medium text-muted-foreground">
                  Secondary:
                </label>
                <input
                  type="color"
                  aria-label="Tile Secondary Color"
                  value={
                    inspectedTile.customColors?.secondary ||
                    TERRAIN_PALETTE[inspectedTile.terrain]?.secondaryColor ||
                    '#4ade80'
                  }
                  onChange={(e) =>
                    handleUpdateInspectedTile({
                      customColors: {
                        ...inspectedTile.customColors,
                        secondary: e.target.value,
                      },
                    })
                  }
                  className="h-6 w-8 rounded border border-border cursor-pointer"
                />
              </div>
              {inspectedTile.customColors && (
                <button
                  type="button"
                  onClick={() => handleUpdateInspectedTile({ customColors: undefined })}
                  className="text-[10px] text-muted-foreground hover:text-foreground underline"
                >
                  Reset Colors
                </button>
              )}
            </div>

            {/* River, Road & Territory Inspector Controls */}
            <div className="flex flex-wrap items-center gap-3">
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

            {/* Tags */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                <Tag className="h-3 w-3" />
                <span>Tags (Resources, Features, Factions)</span>
              </label>
              <div className="flex gap-1.5 mb-1.5">
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
                  className="input flex-1 text-xs h-7"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="btn-outline px-2.5 text-xs h-7"
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

            {/* Full Traceable Event & Entity Lineage for this Tile */}
            <div className="border-t border-border pt-3 space-y-2">
              <div className="text-xs font-bold text-primary flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>
                  Traceable Tile Lineage ({linkedEvents.length} Events · {linkedEntities.length} Entities)
                </span>
              </div>

              {linkedEntities.length > 0 && (
                <div className="space-y-1">
                  {linkedEntities.map((ent) => (
                    <div
                      key={ent.id}
                      className="text-xs p-1.5 rounded bg-muted/60 flex items-center justify-between border border-border/60"
                    >
                      <span className="font-semibold flex items-center gap-1.5">
                        <span>{ent.icon}</span>
                        <span>{ent.name}</span>
                      </span>
                      <span className="text-[10px] uppercase text-muted-foreground">
                        {ent.category}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {linkedEvents.length > 0 ? (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {linkedEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="text-xs p-2 rounded bg-muted/50 border border-border/60 space-y-0.5"
                    >
                      <div className="font-semibold flex justify-between text-[11px]">
                        <span className="text-primary">
                          Turn #{ev.moveId} ({ev.card.value}
                          {ev.card.suit}) · {ev.actionTitle || ev.power}
                        </span>
                        <span className="text-muted-foreground uppercase text-[10px]">
                          {ev.stage}
                        </span>
                      </div>
                      {ev.note && (
                        <p className="text-[11px] text-muted-foreground leading-snug">
                          {ev.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No card draws or historical events have modified this tile yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
