import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Paintbrush,
  PaintBucket,
  MousePointer,
  Eraser,
  Undo2,
  Redo2,
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
  Sliders,
  Hand,
  CloudFog,
  ShieldCheck,
  Unlock,
  Ruler,
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
import {
  computeTileNeighborContext,
  TileNeighborContext,
} from '../engine/cartographyShadingEngine'
import {
  hexToPixel,
  getHexPolygonPoints,
  getHexRange,
  measureTabletopDistance,
  getGridPixelDimensions,
  MeasurementResult,
  OffsetCoord,
} from '../engine/hexTopologyEngine'
import {
  MapLayerId,
  MAP_LAYERS,
  DEFAULT_MAP_LAYERS,
  generateWorldWatersheds,
  findOptimalRoadPath,
  getConnectedRoadAdjacencies,
  getConnectedRiverAdjacencies,
  generateConnectedPathD,
} from '../engine/watershedPathEngine'
import { SLOT_ICON_PALETTE } from '../engine/presets'
import {
  renderCartographicMarkerSVG,
  resolveCartographicSymbol,
  getSymbolsByCategory,
  getSymbolsByConcept,
  getConceptsByCategory,
  CartographicCategory,
} from '../engine/cartographicSymbolEngine'
import { playUndoSound, playCardFlipSound } from '../engine/soundEngine'

export type MapTool = 'inspect' | 'brush' | 'fill' | 'erase' | 'pan' | 'fog' | 'ruler'
export type AtlasRenderStyle = 'tilt-25d' | 'flat-illustrated' | 'simple-schematic'

interface MapCanvasProps {
  map: MapState
  worldName: string
  drawHistory?: DrawRecord[]
  entities?: WorldEntity[]
  initialViewOnly?: boolean
  selectedTileId?: string
  onSelectTile?: (tileId: string) => void
  onSelectEntity?: (entityId: string) => void
  onSelectEvent?: (moveId: number) => void
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
  neighborContext,
  enableOrganicShading = true,
  showRelief = true,
  showWatershed = true,
  showRoads = true,
  riverAdjacencies = [],
  roadAdjacencies = [],
  cartographicSymbol,
  overlay,
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
  neighborContext?: TileNeighborContext
  enableOrganicShading?: boolean
  showRelief?: boolean
  showWatershed?: boolean
  showRoads?: boolean
  riverAdjacencies?: OffsetCoord[]
  roadAdjacencies?: OffsetCoord[]
  cartographicSymbol?: string
  overlay?: TileOverlay
}) {
  const v = getTileVariantSeed(col, row)
  const effectiveRelief = !showRelief
    ? 'none'
    : relief && relief !== 'none'
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

  const showOrganic = !simpleMode && enableOrganicShading

  const effectiveCartoSymbol =
    showRelief && !simpleMode
      ? cartographicSymbol ||
        resolveCartographicSymbol({
          cartographicSymbol,
          relief: effectiveRelief,
          flora: effectiveFlora,
          terrain,
          overlay,
        })
      : null

  return (
    <svg
      viewBox="0 0 48 48"
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    >
      {/* Dynamic Coastlines & Shallows Blend */}
      {showOrganic && neighborContext && neighborContext.isLand && (
        <g opacity="0.6">
          {neighborContext.waterBorders.north && (
            <rect x="0" y="0" width="48" height="3.5" fill="#fef08a" />
          )}
          {neighborContext.waterBorders.south && (
            <rect x="0" y="44.5" width="48" height="3.5" fill="#fef08a" />
          )}
          {neighborContext.waterBorders.west && (
            <rect x="0" y="0" width="3.5" height="48" fill="#fef08a" />
          )}
          {neighborContext.waterBorders.east && (
            <rect x="44.5" y="0" width="3.5" height="48" fill="#fef08a" />
          )}
        </g>
      )}

      {showOrganic && neighborContext && neighborContext.isWater && (
        <g opacity="0.45">
          {neighborContext.landBorders.north && (
            <rect x="0" y="0" width="48" height="4.5" fill="#38bdf8" />
          )}
          {neighborContext.landBorders.south && (
            <rect x="0" y="43.5" width="48" height="4.5" fill="#38bdf8" />
          )}
          {neighborContext.landBorders.west && (
            <rect x="0" y="0" width="4.5" height="48" fill="#38bdf8" />
          )}
          {neighborContext.landBorders.east && (
            <rect x="43.5" y="0" width="4.5" height="48" fill="#38bdf8" />
          )}
        </g>
      )}

      {/* Multi-Octave Hillshading (NW Sunlit Crest, SE Slope Shading) */}
      {showOrganic &&
        (effectiveRelief === 'mountain' ||
          effectiveRelief === 'mountain-snow' ||
          effectiveRelief === 'mountain-range' ||
          effectiveRelief === 'mesa' ||
          effectiveRelief === 'crag' ||
          effectiveRelief === 'volcano' ||
          effectiveRelief === 'hills') && (
        <g>
          {/* North-West Sunlit Crest Highlight */}
          <polygon points="0,0 48,0 0,48" fill="#ffffff" opacity="0.18" />
          {/* South-East Shaded Slope */}
          <polygon points="48,0 48,48 0,48" fill="#0f172a" opacity="0.22" />
        </g>
      )}

      {/* Cast Shadow onto Adjacent Lowlands from NW High Relief */}
      {showOrganic && neighborContext && neighborContext.hasNorthWestSunlightShadow && effectiveRelief === 'none' && (
        <polygon points="0,0 24,0 0,24" fill="#0f172a" opacity="0.16" />
      )}

      {/* Subtle Coastal Double-Hatching when Land borders Water (Classic fallback) */}
      {!simpleMode && isCoastalLand && !showOrganic && (
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

      {/* Animated Ocean / Water Wave Shimmer */}
      {!simpleMode && (terrain === 'ocean' || terrain === 'water') && (
        <g
          stroke="#bae6fd"
          strokeWidth="1"
          fill="none"
          opacity="0.32"
          className={showOrganic ? 'animate-water-shimmer' : ''}
        >
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

      {/* Hand-Drawn Whiteboard Cartographic Marker Symbol */}
      {effectiveCartoSymbol && (
        <g className="cartographic-marker-symbol">
          {renderCartographicMarkerSVG(effectiveCartoSymbol)}
        </g>
      )}

      {/* Hand-Drawn Engraved Mountain / Hill / Volcano Silhouettes (Legacy Fallbacks) */}
      {!simpleMode && !effectiveCartoSymbol && effectiveRelief === 'mountain' && (
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

      {!simpleMode && !effectiveCartoSymbol && effectiveRelief === 'hills' && (
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

      {!simpleMode && !effectiveCartoSymbol && effectiveRelief === 'volcano' && (
        <g opacity="0.58">
          <polygon points="8,39 20,14 28,14 40,39" fill="#451a03" />
          <polygon points="20,14 28,14 25,22 22,20" fill="#ef4444" />
        </g>
      )}

      {/* Glacial Horns & Ice Massif Relief Silhouette */}
      {!simpleMode && !effectiveCartoSymbol && effectiveRelief === 'mountain-snow' && (
        <g opacity="0.55">
          <polygon points="8,39 24,9 40,39" fill="#0f172a" />
          <polygon points="24,9 24,39 8,39" fill="#334155" />
          <polygon points="24,9 18,22 30,22" fill="#f8fafc" />
          <polygon points="24,9 21,25 24,22" fill="#7dd3fc" />
          <line x1="24" y1="9" x2="24" y2="39" stroke="#94a3b8" strokeWidth="0.8" />
        </g>
      )}

      {/* Continuous Triple-Peak Mountain Range Spine */}
      {!simpleMode && !effectiveCartoSymbol && effectiveRelief === 'mountain-range' && (
        <g opacity="0.52">
          <polygon points="2,39 14,14 26,39" fill="#44403c" />
          <polygon points="18,39 30,10 42,39" fill="#292524" />
          <polygon points="32,39 40,18 48,39" fill="#57534e" />
          <polygon points="14,14 11,21 17,21" fill="#f5f5f4" />
          <polygon points="30,10 26,17 34,17" fill="#f5f5f4" />
          <polygon points="40,18 37,24 43,24" fill="#f5f5f4" />
        </g>
      )}

      {/* Stepped Flat-Topped Mesa & Tableland */}
      {!simpleMode && !effectiveCartoSymbol && effectiveRelief === 'mesa' && (
        <g opacity="0.6">
          <polygon points="6,39 12,18 36,18 42,39" fill="#78350f" />
          <polygon points="12,18 36,18 34,22 14,22" fill="#d97706" />
          <line x1="8" y1="28" x2="40" y2="28" stroke="#fef3c7" strokeWidth="1" opacity="0.4" />
          <line x1="7" y1="34" x2="41" y2="34" stroke="#451a03" strokeWidth="1" opacity="0.6" />
        </g>
      )}

      {/* Obsidian Crags & Needle Spires */}
      {!simpleMode && !effectiveCartoSymbol && effectiveRelief === 'crag' && (
        <g opacity="0.55">
          <polygon points="6,39 12,12 16,39" fill="#1c1917" />
          <polygon points="18,39 25,8 29,39" fill="#292524" />
          <polygon points="32,39 38,15 42,39" fill="#1c1917" />
          <polygon points="25,8 22,18 25,39" fill="#78716c" opacity="0.6" />
        </g>
      )}

      {/* Deep Canyon Rift Silhouette */}
      {!simpleMode && !effectiveCartoSymbol && effectiveRelief === 'canyon' && (
        <g opacity="0.55">
          <path d="M 14 0 Q 22 18, 18 30 T 28 48 L 34 48 Q 24 30, 28 18 T 20 0 Z" fill="#451a03" />
          <path d="M 16 0 Q 24 18, 20 30 T 30 48" stroke="#f59e0b" strokeWidth="0.8" fill="none" opacity="0.6" />
        </g>
      )}

      {/* Varied Organic Forest / Canopy Silhouette Clusters */}
      {!simpleMode && !effectiveCartoSymbol && (effectiveFlora === 'forest' || effectiveFlora === 'jungle') && (
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
      {showWatershed && hasRiver && (
        <path
          d={generateConnectedPathD(24, 24, 48, riverAdjacencies, { col, row })}
          stroke="#0284c7"
          strokeWidth="3.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />
      )}

      {showRoads && hasRoad && (
        <path
          d={generateConnectedPathD(24, 24, 48, roadAdjacencies, { col, row })}
          stroke="#573619"
          strokeWidth="2.4"
          strokeDasharray="4 2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
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
  initialViewOnly = false,
  selectedTileId: controlledSelectedTileId,
  onSelectTile,
  onSelectEntity,
  onSelectEvent,
  onChange,
}: MapCanvasProps) {
  const [isViewOnly, setIsViewOnly] = useState<boolean>(initialViewOnly)
  const tileSizePx = 42
  const [activeTool, setActiveTool] = useState<MapTool>('brush')
  const [renderStyle, setRenderStyle] = useState<AtlasRenderStyle>('tilt-25d')
  const [shadingMode, setShadingMode] = useState<'organic' | 'crisp'>('organic')
  const [showPaletteDrawer, setShowPaletteDrawer] = useState(false)
  const [showGridDrawer, setShowGridDrawer] = useState(false)
  const [showLayersDrawer, setShowLayersDrawer] = useState(false)
  const [visibleLayers, setVisibleLayers] =
    useState<Record<MapLayerId, boolean>>(DEFAULT_MAP_LAYERS)

  const handleToggleLayer = (layerId: MapLayerId) => {
    setVisibleLayers((prev) => ({ ...prev, [layerId]: !prev[layerId] }))
  }

  const handleSetAllLayers = (visible: boolean) => {
    setVisibleLayers({
      terrain: visible,
      relief: visible,
      watershed: visible,
      roads: visible,
      territories: visible,
      slots: visible,
      labels: visible,
      fog: visible,
    })
  }

  const handleSimulateWatersheds = () => {
    const watershed = generateWorldWatersheds(map)
    const nextTiles = { ...map.tiles }
    let riverCount = 0

    for (const key of Object.keys(watershed)) {
      const existing =
        nextTiles[key] ||
        createDefaultTile(watershed[key].coord.col, watershed[key].coord.row)
      nextTiles[key] = {
        ...existing,
        hasRiver: true,
      }
      riverCount++
    }

    if (riverCount > 0) {
      pushToUndo(map)
      onChange({ ...map, tiles: nextTiles })
    }
  }

  const handleAutoConnectRoads = () => {
    const settlements: OffsetCoord[] = []
    for (let r = 0; r < map.height; r++) {
      for (let c = 0; c < map.width; c++) {
        const tile = map.tiles[`${c},${r}`]
        if (!tile) continue
        const isSettlement =
          tile.overlay === 'settlement' ||
          tile.overlay === 'town' ||
          tile.overlay === 'city' ||
          tile.overlay === 'capital' ||
          (tile.slots || []).some((s) => s.category === 'settlement')
        if (isSettlement) {
          settlements.push({ col: c, row: r })
        }
      }
    }

    if (settlements.length < 2) return

    pushToUndo(map)
    const nextTiles = { ...map.tiles }

    for (let i = 0; i < settlements.length - 1; i++) {
      const roadPath = findOptimalRoadPath(map, settlements[i], settlements[i + 1])
      if (roadPath) {
        for (const coord of roadPath) {
          const key = `${coord.col},${coord.row}`
          const existing = nextTiles[key] || createDefaultTile(coord.col, coord.row)
          nextTiles[key] = {
            ...existing,
            hasRoad: true,
          }
        }
      }
    }

    onChange({ ...map, tiles: nextTiles })
  }

  const [selectedTerrain, setSelectedTerrain] = useState<TerrainType>('forest')
  const [selectedRelief, setSelectedRelief] = useState<ReliefType>('none')
  const [selectedFlora, setSelectedFlora] = useState<FloraType>('none')
  const [secondaryTerrain, setSecondaryTerrain] = useState<TerrainType>('plains')
  const [selectedPattern, setSelectedPattern] = useState<TilePattern>('solid')
  const [selectedColoringMode, setSelectedColoringMode] =
    useState<TileColoringMode>('fill')
  const [selectedOverlay, setSelectedOverlay] = useState<TileOverlay>('none')
  const [selectedCartographicSymbol, setSelectedCartographicSymbol] = useState<string | null>(null)
  const [activeMarkerCategory, setActiveMarkerCategory] = useState<CartographicCategory>('earth')
  const [activeMarkerConcept, setActiveMarkerConcept] = useState<string>('all')
  const [paintRiver, setPaintRiver] = useState(false)
  const [paintRoad, setPaintRoad] = useState(false)
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string>('')
  const [geoPreset, setGeoPreset] = useState<GeographyPreset>('continent')
  const [rulerStart, setRulerStart] = useState<OffsetCoord | null>(null)
  const [rulerHover, setRulerHover] = useState<OffsetCoord | null>(null)
  const [brushRadius, setBrushRadius] = useState<number>(0) // 0: 1x1, 1: 3x3, 2: 5x5

  const rulerMeasurement: MeasurementResult | null =
    activeTool === 'ruler' && rulerStart && rulerHover
      ? measureTabletopDistance(rulerStart, rulerHover, map.gridTopology || 'square')
      : null

  const [internalSelectedTileId, setInternalSelectedTileId] = useState<string>('10,6')
  const selectedTileId = controlledSelectedTileId || internalSelectedTileId
  const setSelectedTileId = (id: string) => {
    setInternalSelectedTileId(id)
    onSelectTile?.(id)
  }
  const [isDragging, setIsDragging] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [customWidth, setCustomWidth] = useState<number>(map.width)
  const [customHeight, setCustomHeight] = useState<number>(map.height)

  // 60fps Smooth Pan/Zoom Cartography Camera
  const [camera, setCamera] = useState<{ x: number; y: number; zoom: number }>({
    x: 0,
    y: 0,
    zoom: 1,
  })
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [showMinimap, setShowMinimap] = useState(true)
  const panStartRef = useRef<{ startX: number; startY: number; camX: number; camY: number } | null>(null)
  const viewportContainerRef = useRef<HTMLDivElement>(null)

  const handleResetCamera = useCallback(() => {
    setCamera({ x: 0, y: 0, zoom: 1 })
  }, [])

  const handleZoomIn = useCallback(() => {
    setCamera((prev) => ({
      ...prev,
      zoom: Math.min(2.5, Number((prev.zoom * 1.25).toFixed(2))),
    }))
  }, [])

  const handleZoomOut = useCallback(() => {
    setCamera((prev) => ({
      ...prev,
      zoom: Math.max(0.4, Number((prev.zoom / 1.25).toFixed(2))),
    }))
  }, [])

  const handleFitCamera = useCallback(() => {
    if (!viewportContainerRef.current) {
      setCamera({ x: 0, y: 0, zoom: 1 })
      return
    }
    const rect = viewportContainerRef.current.getBoundingClientRect()
    const mapPxWidth = map.width * tileSizePx + 32
    const mapPxHeight = map.height * tileSizePx + 32
    const fitZoom = Math.min(
      2.0,
      Math.max(
        0.4,
        Number(Math.min((rect.width - 32) / mapPxWidth, (rect.height - 32) / mapPxHeight).toFixed(2))
      )
    )
    setCamera({ x: 0, y: 0, zoom: fitZoom })
  }, [map.width, map.height, tileSizePx])

  const handleViewportMouseDown = (e: React.MouseEvent) => {
    const isMiddleClick = e.button === 1
    const isPan = activeTool === 'pan' || isSpacePressed || isMiddleClick

    if (isPan) {
      e.preventDefault()
      setIsPanning(true)
      panStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        camX: camera.x,
        camY: camera.y,
      }
    }
  }

  const handleViewportMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !panStartRef.current) return
    const dx = e.clientX - panStartRef.current.startX
    const dy = e.clientY - panStartRef.current.startY
    setCamera((prev) => ({
      ...prev,
      x: panStartRef.current!.camX + dx,
      y: panStartRef.current!.camY + dy,
    }))
  }

  const handleViewportMouseUp = () => {
    if (isPanning) {
      setIsPanning(false)
      panStartRef.current = null
    }
  }

  // Mouse wheel zoom on viewport container with non-passive listener
  useEffect(() => {
    const container = viewportContainerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const factor = e.deltaY < 0 ? 1.15 : 0.87
      setCamera((prev) => ({
        ...prev,
        zoom: Math.min(2.5, Math.max(0.4, Number((prev.zoom * factor).toFixed(2)))),
      }))
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [])

  // Spacebar pan toggle listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.getAttribute('contenteditable') === 'true')
      ) {
        return
      }

      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault()
        setIsSpacePressed(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false)
        setIsPanning(false)
        panStartRef.current = null
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Canvas Undo & Redo History Buffers (bounded to 25 states)
  const [undoStack, setUndoStack] = useState<MapState[]>([])
  const [redoStack, setRedoStack] = useState<MapState[]>([])
  const dragStartMapRef = useRef<MapState | null>(null)
  const hasStrokeMutatedRef = useRef<boolean>(false)

  const pushToUndo = useCallback((snapshot: MapState) => {
    setUndoStack((prev) => [...prev, snapshot].slice(-25))
    setRedoStack([])
  }, [])

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return
    const previousMap = undoStack[undoStack.length - 1]
    setUndoStack((prev) => prev.slice(0, -1))
    setRedoStack((prev) => [...prev, map].slice(-25))
    playUndoSound()
    onChange(previousMap)
  }, [undoStack, map, onChange])

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return
    const nextMap = redoStack[redoStack.length - 1]
    setRedoStack((prev) => prev.slice(0, -1))
    setUndoStack((prev) => [...prev, map].slice(-25))
    playCardFlipSound()
    onChange(nextMap)
  }, [redoStack, map, onChange])

  // End continuous stroke and push drag-start snapshot to undo stack
  const handleMouseUpGlobal = useCallback(() => {
    if (isDragging) {
      if (hasStrokeMutatedRef.current && dragStartMapRef.current) {
        const snapshot = dragStartMapRef.current
        setUndoStack((prev) => [...prev, snapshot].slice(-25))
        setRedoStack([])
        dragStartMapRef.current = null
        hasStrokeMutatedRef.current = false
      }
      setIsDragging(false)
    }
  }, [isDragging])

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUpGlobal)
    return () => {
      window.removeEventListener('mouseup', handleMouseUpGlobal)
    }
  }, [handleMouseUpGlobal])

  // Keyboard Shortcuts: Ctrl+Z (Undo) and Ctrl+Y / Ctrl+Shift+Z (Redo)
  useEffect(() => {
    if (isViewOnly) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.getAttribute('contenteditable') === 'true')
      ) {
        return
      }

      const isCtrlOrMeta = e.ctrlKey || e.metaKey
      if (!isCtrlOrMeta) return

      if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      } else if (
        e.key.toLowerCase() === 'y' ||
        (e.key.toLowerCase() === 'z' && e.shiftKey)
      ) {
        e.preventDefault()
        handleRedo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isViewOnly, handleUndo, handleRedo])

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

    if (activeTool === 'ruler') {
      if (!rulerStart) {
        setRulerStart({ col, row })
        setRulerHover({ col, row })
      } else if (rulerStart.col === col && rulerStart.row === row) {
        setRulerStart(null)
        setRulerHover(null)
      } else {
        setRulerHover({ col, row })
      }
      return
    }

    if (isViewOnly || activeTool === 'inspect') {
      return
    }

    const affectedCoords =
      brushRadius > 0
        ? getHexRange({ col, row }, brushRadius, map.gridTopology || 'square', {
            width: map.width,
            height: map.height,
          })
        : [{ col, row }]

    if (activeTool === 'erase') {
      hasStrokeMutatedRef.current = true
      const nextTiles = { ...map.tiles }
      for (const coord of affectedCoords) {
        const tid = getTileId(coord.col, coord.row)
        nextTiles[tid] = {
          ...createDefaultTile(coord.col, coord.row),
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
          cartographicSymbol: undefined,
        }
      }
      onChange({ ...map, tiles: nextTiles })
      return
    }

    if (activeTool === 'fog') {
      hasStrokeMutatedRef.current = true
      const existing = map.tiles[id] || createDefaultTile(col, row)
      const nextUnexplored = !existing.isUnexplored
      const nextTiles = { ...map.tiles }
      for (const coord of affectedCoords) {
        const tid = getTileId(coord.col, coord.row)
        const t = nextTiles[tid] || createDefaultTile(coord.col, coord.row)
        nextTiles[tid] = { ...t, isUnexplored: nextUnexplored }
      }
      onChange({ ...map, tiles: nextTiles })
      return
    }

    if (activeTool === 'fill') {
      pushToUndo(map)
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
      hasStrokeMutatedRef.current = true
      const nextTiles = { ...map.tiles }
      for (const coord of affectedCoords) {
        const tid = getTileId(coord.col, coord.row)
        const existing = nextTiles[tid] || createDefaultTile(coord.col, coord.row)
        nextTiles[tid] = {
          ...existing,
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
          cartographicSymbol:
            selectedCartographicSymbol !== null
              ? selectedCartographicSymbol || undefined
              : existing.cartographicSymbol,
        }
      }
      onChange({ ...map, tiles: nextTiles })
    }
  }

  const handleTileMouseEnter = (col: number, row: number) => {
    if (activeTool === 'ruler' && rulerStart) {
      setRulerHover({ col, row })
    }
    if (isDragging && (activeTool === 'brush' || activeTool === 'erase' || activeTool === 'fog')) {
      applyToolToTile(col, row)
    }
  }

  const handleUpdateInspectedTile = (
    updates: Partial<Omit<typeof inspectedTile, 'id' | 'col' | 'row'>>
  ) => {
    pushToUndo(map)
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
    pushToUndo(map)
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
      onMouseUp={handleMouseUpGlobal}
      onMouseLeave={handleMouseUpGlobal}
    >
      {/* Sleek Top Cartography Bar */}
      <div className="no-print card p-3 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left: View Only vs Edit Map Toggle + Painting Tools */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* View Atlas vs Edit Map Switcher */}
            <div
              className="inline-flex rounded-md border border-border p-0.5 bg-muted/50"
              role="group"
              aria-label="Atlas Mode"
            >
              <button
                type="button"
                onClick={() => setIsViewOnly(true)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  isViewOnly
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Clutter-free Map Viewer (Tap any tile to inspect lore & slots)"
              >
                👁️ View Atlas
              </button>
              <button
                type="button"
                onClick={() => setIsViewOnly(false)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  !isViewOnly
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Full Map Creation & Painting Studio"
              >
                🖌️ Edit Map
              </button>
            </div>

            {/* Clear Mode Separation Badge */}
            {isViewOnly ? (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                <span className="hidden sm:inline">Safe Inspect Mode</span>
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                <Unlock className="h-3 w-3" />
                <span className="hidden sm:inline">Drafting Workshop (Active)</span>
              </span>
            )}

            {!isViewOnly && (
              <>
                <div className="h-5 w-px bg-border mx-0.5 hidden sm:block" />
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
                <button
                  type="button"
                  onClick={() => setActiveTool('pan')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    activeTool === 'pan'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                  title="Pan Map Camera (or hold Spacebar + Drag)"
                >
                  <Hand className="h-3.5 w-3.5" />
                  <span>Pan Map</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTool('fog')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    activeTool === 'fog'
                      ? 'bg-stone-800 text-stone-100 dark:bg-stone-700 shadow-sm'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                  title="Fog of War: Shroud or Reveal Unexplored Wilderness"
                  aria-label="Fog of War Tool"
                >
                  <CloudFog className="h-3.5 w-3.5" />
                  <span>Fog / Reveal</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTool('ruler')
                    setRulerStart(null)
                    setRulerHover(null)
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    activeTool === 'ruler'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                  title="Distance Ruler: Measure distances in leagues, miles, and march days"
                  aria-label="Distance Ruler Tool"
                >
                  <Ruler className="h-3.5 w-3.5" />
                  <span>Ruler</span>
                </button>

                <div className="h-5 w-px bg-border mx-0.5 hidden sm:block" />

                {/* Undo / Redo History Controls */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={undoStack.length === 0}
                    className="px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 border border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title={
                      undoStack.length > 0
                        ? `Undo (${undoStack.length} step${undoStack.length > 1 ? 's' : ''}) — Ctrl+Z`
                        : 'Undo (Ctrl+Z)'
                    }
                    aria-label="Undo Map Action"
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">Undo</span>
                    {undoStack.length > 0 && (
                      <span className="text-[10px] px-1 py-0.2 rounded bg-muted-foreground/15 text-muted-foreground font-mono">
                        {undoStack.length}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleRedo}
                    disabled={redoStack.length === 0}
                    className="px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 border border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title={
                      redoStack.length > 0
                        ? `Redo (${redoStack.length} step${redoStack.length > 1 ? 's' : ''}) — Ctrl+Y`
                        : 'Redo (Ctrl+Y)'
                    }
                    aria-label="Redo Map Action"
                  >
                    <Redo2 className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">Redo</span>
                    {redoStack.length > 0 && (
                      <span className="text-[10px] px-1 py-0.2 rounded bg-muted-foreground/15 text-muted-foreground font-mono">
                        {redoStack.length}
                      </span>
                    )}
                  </button>
                </div>

                <div className="h-5 w-px bg-border mx-0.5 hidden sm:block" />

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
                <button
                  type="button"
                  onClick={() => setShowLayersDrawer((v) => !v)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 border transition-colors ${
                    showLayersDrawer
                      ? 'bg-accent border-primary/40 text-foreground'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                  title="Layer Stacking & Procedural Cartography"
                  aria-label="Layer Stacking Drawer"
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Layers</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-muted-foreground/15 text-muted-foreground font-mono">
                    {Object.values(visibleLayers).filter(Boolean).length}/8
                  </span>
                </button>
              </>
            )}
          </div>

          {/* Right: Zoom, Perspective Mode Switcher & Exports */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* 60fps Smooth Zoom & Camera Controls */}
            <div className="inline-flex items-center rounded-md border border-border bg-muted/40 p-0.5 text-xs">
              <button
                type="button"
                onClick={handleZoomOut}
                className="px-2 py-0.5 hover:bg-accent rounded font-bold"
                title="Zoom Out Map (or Mouse Wheel)"
                aria-label="Zoom Out Map"
              >
                −
              </button>
              <button
                type="button"
                onClick={handleResetCamera}
                className="px-1.5 text-[10px] font-mono hover:text-primary transition-colors cursor-pointer"
                title="Reset Camera to 100%"
                aria-label="Reset Camera (100%)"
              >
                {Math.round(camera.zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                className="px-2 py-0.5 hover:bg-accent rounded font-bold"
                title="Zoom In Map (or Mouse Wheel)"
                aria-label="Zoom In Map"
              >
                +
              </button>
              <button
                type="button"
                onClick={handleFitCamera}
                className="px-1.5 py-0.5 hover:bg-accent rounded text-[10px] font-medium border-l border-border/50 text-muted-foreground hover:text-foreground"
                title="Fit Map to Viewport"
                aria-label="Fit Map to Viewport"
              >
                <Maximize2 className="h-3 w-3" />
              </button>
            </div>

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

            {/* Grid Topology Switcher: Square vs Pointy Hex vs Flat Hex */}
            <div
              className="inline-flex rounded-md border border-border p-0.5 bg-muted/40"
              role="group"
              aria-label="Grid Topology Mode"
            >
              <button
                type="button"
                onClick={() => onChange({ ...map, gridTopology: 'square' })}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  !map.gridTopology || map.gridTopology === 'square'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Orthogonal Square Grid (Classic)"
                aria-label="Square Grid Mode"
              >
                Square
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...map, gridTopology: 'hex-pointy' })}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  map.gridTopology === 'hex-pointy'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Pointy-Topped Hexagonal Grid (Tactical VTT)"
                aria-label="Pointy Hex Mode"
              >
                ⬡ Pointy Hex
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...map, gridTopology: 'hex-flat' })}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  map.gridTopology === 'hex-flat'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Flat-Topped Hexagonal Grid (Atlas Wargame)"
                aria-label="Flat Hex Mode"
              >
                ⬢ Flat Hex
              </button>
            </div>

            {/* Organic Shading & Biome Blending Mode Toggle */}
            <div
              className="inline-flex rounded-md border border-border p-0.5 bg-muted/40"
              role="group"
              aria-label="Cartographic Shading Mode"
            >
              <button
                type="button"
                onClick={() => setShadingMode('organic')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  shadingMode === 'organic'
                    ? 'bg-amber-600 text-white dark:bg-amber-700'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Organic Biome Blending, Coastal Shallows & Multi-Octave Hillshading"
              >
                Organic Shading 🌄
              </button>
              <button
                type="button"
                onClick={() => setShadingMode('crisp')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  shadingMode === 'crisp'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Crisp Grid & Direct Tile Borders"
              >
                Crisp Grid 📐
              </button>
            </div>

            {/* Quick Dimension Presets (Visible in Edit Mode) */}
            {!isViewOnly && (
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
            )}

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
        {!isViewOnly && showGridDrawer && (
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
                onClick={() => {
                  pushToUndo(map)
                  onChange(createInitialMap(map.width, map.height, geoPreset))
                }}
                className="btn-outline px-2.5 py-1 text-xs flex items-center gap-1 text-destructive"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Generate New Template</span>
              </button>
            </div>
          </div>
        )}

        {/* Layer Stacking & Procedural Cartography Drawer */}
        {!isViewOnly && showLayersDrawer && (
          <div
            data-testid="layer-stacking-drawer"
            className="pt-2 border-t border-border space-y-3 animate-in fade-in slide-in-from-top-1 duration-150"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  Map Layers ({Object.values(visibleLayers).filter(Boolean).length} Active):
                </span>
                <button
                  type="button"
                  onClick={() => handleSetAllLayers(true)}
                  className="text-[10px] text-primary hover:underline font-medium"
                >
                  Show All
                </button>
                <span className="text-muted-foreground text-xs">·</span>
                <button
                  type="button"
                  onClick={() => handleSetAllLayers(false)}
                  className="text-[10px] text-muted-foreground hover:underline"
                >
                  Hide All
                </button>
              </div>

              {/* Procedural Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSimulateWatersheds}
                  className="btn-outline px-2.5 py-1 text-xs flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 border-blue-500/30"
                  title="Trace natural rivers downhill from peaks to oceans"
                >
                  <span>🌊 Simulate Watersheds</span>
                </button>
                <button
                  type="button"
                  onClick={handleAutoConnectRoads}
                  className="btn-outline px-2.5 py-1 text-xs flex items-center gap-1.5 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 border-amber-500/30"
                  title="Route A* trade roads connecting all settlements along terrain contours"
                >
                  <span>🛣️ Auto-Connect Roads</span>
                </button>
              </div>
            </div>

            {/* Layer Checkbox Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1.5">
              {MAP_LAYERS.map((layer) => {
                const isActive = visibleLayers[layer.id]
                return (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={() => handleToggleLayer(layer.id)}
                    className={`px-2 py-1.5 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-colors text-left ${
                      isActive
                        ? 'bg-accent border-primary/50 text-foreground font-semibold shadow-sm'
                        : 'border-border/60 text-muted-foreground/60 hover:text-muted-foreground bg-muted/20 opacity-60'
                    }`}
                    title={layer.description}
                  >
                    <span>{layer.icon}</span>
                    <span className="truncate">{layer.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Collapsible Brush Palette & Multi-Layer Overlay Drawer */}
        {!isViewOnly && showPaletteDrawer && (activeTool === 'brush' || activeTool === 'fill') && (
          <div className="pt-2 border-t border-border space-y-3">
            {/* Base Terrain Row */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  1. Base Biome & Domain (Empty grass/ocean tiles stay clean without icon noise)
                </label>
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded border border-border">
                    <span className="text-[10px] text-muted-foreground px-1 font-medium">Brush:</span>
                    <button
                      type="button"
                      onClick={() => setBrushRadius(0)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        brushRadius === 0
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="Single Tile (1x1)"
                    >
                      1×1
                    </button>
                    <button
                      type="button"
                      onClick={() => setBrushRadius(1)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        brushRadius === 1
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="Radius 1 (3x3 or 7 hexes)"
                    >
                      3×3
                    </button>
                    <button
                      type="button"
                      onClick={() => setBrushRadius(2)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        brushRadius === 2
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="Radius 2 (5x5 or 19 hexes)"
                    >
                      5×5
                    </button>
                  </div>
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

            {/* Whiteboard Marker Tropes (48 Tabletop Cartography Symbols) */}
            <div className="pt-2.5 border-t border-border/70 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span>🖌️</span>
                    <span>Whiteboard Marker Tropes (48 Genesis Symbols)</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Tabletop hand-drawn cartography silhouettes
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCartographicSymbol(null)}
                  className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                    selectedCartographicSymbol === null
                      ? 'bg-primary text-primary-foreground border-primary font-medium'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                  title="Revert to automatic relief & flora silhouettes"
                >
                  Auto / None
                </button>
              </div>

              {/* Category Filter Pills: Earth, Water, Plant, Feature, Settlement, Construction */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: 'earth' as CartographicCategory, label: `♠ Earth (${getSymbolsByCategory('earth').length})` },
                    { id: 'water' as CartographicCategory, label: `♥ Water (${getSymbolsByCategory('water').length})` },
                    { id: 'plant' as CartographicCategory, label: `♣ Flora (${getSymbolsByCategory('plant').length})` },
                    { id: 'feature' as CartographicCategory, label: `♦ Feature (${getSymbolsByCategory('feature').length})` },
                    { id: 'settlement' as CartographicCategory, label: `🏘️ Towns (${getSymbolsByCategory('settlement').length})` },
                    { id: 'construction' as CartographicCategory, label: `🏰 Monuments (${getSymbolsByCategory('construction').length})` },
                  ]
                ).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveMarkerCategory(cat.id)
                      setActiveMarkerConcept('all')
                    }}
                    className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-all ${
                      activeMarkerCategory === cat.id
                        ? 'bg-primary/20 border-primary text-primary font-semibold'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Concept Sub-Filter Pills (e.g. Mountains, Hills, Canyons & Cliffs, Deserts, Caves) */}
              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                <button
                  type="button"
                  onClick={() => setActiveMarkerConcept('all')}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    activeMarkerConcept === 'all'
                      ? 'bg-secondary text-secondary-foreground font-semibold border-secondary'
                      : 'border-border/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All ({getSymbolsByCategory(activeMarkerCategory).length})
                </button>
                {getConceptsByCategory(activeMarkerCategory).map((concept) => (
                  <button
                    key={concept.id}
                    type="button"
                    onClick={() => setActiveMarkerConcept(concept.id)}
                    className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                      activeMarkerConcept === concept.id
                        ? 'bg-secondary text-secondary-foreground font-semibold border-secondary'
                        : 'border-border/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {concept.label} ({concept.count})
                  </button>
                ))}
              </div>

              {/* Tropes for Active Category & Concept */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5 max-h-56 overflow-y-auto p-1 bg-muted/20 rounded border border-border/50">
                {(activeMarkerConcept === 'all'
                  ? getSymbolsByCategory(activeMarkerCategory)
                  : getSymbolsByConcept(activeMarkerConcept)
                ).map((sym) => {
                  const isSelected = selectedCartographicSymbol === sym.id
                  return (
                    <button
                      key={sym.id}
                      type="button"
                      onClick={() =>
                        setSelectedCartographicSymbol(isSelected ? null : sym.id)
                      }
                      className={`p-1.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/20 ring-2 ring-primary text-foreground font-semibold shadow-sm'
                          : 'border-border/80 bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                      title={`${sym.name} [${sym.variantName}] (${sym.icon}): ${sym.description}`}
                    >
                      <svg
                        viewBox="0 0 48 48"
                        className="w-7 h-7 shrink-0 rounded bg-muted/50 p-0.5 border border-border/40"
                      >
                        {renderCartographicMarkerSVG(sym.id)}
                      </svg>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] truncate leading-tight font-medium">
                          {sym.name}
                        </div>
                        <div className="text-[9px] text-muted-foreground truncate flex items-center gap-1">
                          <span>{sym.icon}</span>
                          <span className="opacity-80">· {sym.variantName}</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid & Tile Slot Inspector Split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Interactive Fantasy Cartography Canvas (8 cols) */}
        <div className="xl:col-span-8 card p-3 sm:p-5 overflow-x-auto bg-gradient-to-b from-amber-50/40 to-stone-100/50 dark:from-slate-900 dark:to-slate-950">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold tracking-tight">
                {worldName} Atlas ({map.width} × {map.height})
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {isViewOnly
                  ? 'Tap Tile to Inspect'
                  : renderStyle === 'tilt-25d'
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

          {/* 60fps Smooth Camera Viewport Container */}
          <div
            ref={viewportContainerRef}
            className="relative overflow-hidden rounded-xl border border-border/80 bg-stone-900/5 dark:bg-black/30 select-none min-h-[460px] flex items-center justify-center p-4"
            onMouseDown={handleViewportMouseDown}
            onMouseMove={handleViewportMouseMove}
            onMouseUp={handleViewportMouseUp}
            onMouseLeave={handleViewportMouseUp}
            style={{
              cursor: isPanning
                ? 'grabbing'
                : isSpacePressed || activeTool === 'pan'
                ? 'grab'
                : 'default',
            }}
          >
            {/* Smooth 60fps Transformed Camera Plane */}
            <div
              className="atlas-camera-plane will-change-transform flex items-center justify-center py-4"
              style={{
                transform: `translate3d(${camera.x}px, ${camera.y}px, 0px) scale(${camera.zoom})`,
                transformOrigin: 'center center',
                transition: isPanning ? 'none' : 'transform 100ms ease-out',
              }}
            >
              {(() => {
                const isHex = map.gridTopology === 'hex-pointy' || map.gridTopology === 'hex-flat'
                const hexTopology = map.gridTopology === 'hex-flat' ? 'hex-flat' : 'hex-pointy'
                const hexRadius = 24
                const gridDim = isHex
                  ? getGridPixelDimensions(map.width, map.height, hexRadius, hexTopology)
                  : { totalWidth: map.width * tileSizePx, totalHeight: map.height * tileSizePx }

                return (
                  <div
                    className={`${isHex ? 'relative' : 'inline-grid relative'} border-4 ${
                      !isViewOnly
                        ? 'border-amber-500/80 ring-4 ring-amber-500/20'
                        : 'border-amber-950/60 dark:border-slate-700'
                    } rounded-lg overflow-hidden shadow-2xl ${
                      renderStyle === 'tilt-25d'
                        ? 'atlas-perspective-plane'
                        : 'atlas-flat-plane'
                    }`}
                    style={
                      isHex
                        ? {
                            width: `${gridDim.totalWidth}px`,
                            height: `${gridDim.totalHeight}px`,
                            minWidth: `${gridDim.totalWidth}px`,
                            minHeight: `${gridDim.totalHeight}px`,
                          }
                        : {
                            gridTemplateColumns: `repeat(${map.width}, ${tileSizePx}px)`,
                          }
                    }
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
                      const neighborContext = computeTileNeighborContext(map, col, row)

                      // Hex vs Square calculations
                      const center = isHex
                        ? hexToPixel({ col, row }, hexRadius, hexTopology)
                        : { x: col * tileSizePx + tileSizePx / 2, y: row * tileSizePx + tileSizePx / 2 }
                      const hexWidth = hexTopology === 'hex-pointy' ? Math.sqrt(3) * hexRadius : 2 * hexRadius
                      const hexHeight = hexTopology === 'hex-pointy' ? 2 * hexRadius : Math.sqrt(3) * hexRadius
                      const clipPath = isHex
                        ? hexTopology === 'hex-pointy'
                          ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                          : 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
                        : undefined

                      const isInRulerPath = Boolean(
                        rulerMeasurement?.path.some((p) => p.col === col && p.row === row)
                      )
                      const isRulerOrigin = Boolean(
                        rulerStart && rulerStart.col === col && rulerStart.row === row
                      )

                      return (
                        <button
                          key={id}
                          type="button"
                          data-testid={`map-tile-${col}-${row}`}
                          onMouseDown={(e) => {
                            if (isSpacePressed || activeTool === 'pan' || e.button === 1) {
                              return
                            }
                            if (!isViewOnly && (activeTool === 'brush' || activeTool === 'erase')) {
                              setIsDragging(true)
                              dragStartMapRef.current = map
                              hasStrokeMutatedRef.current = false
                            }
                            applyToolToTile(col, row)
                          }}
                          onMouseEnter={() => {
                            if (isSpacePressed || activeTool === 'pan' || isPanning) {
                              return
                            }
                            handleTileMouseEnter(col, row)
                          }}
                          style={
                            isHex
                              ? {
                                  ...getTileBackgroundStyle(tile),
                                  position: 'absolute',
                                  left: `${center.x - hexWidth / 2}px`,
                                  top: `${center.y - hexHeight / 2}px`,
                                  width: `${hexWidth}px`,
                                  height: `${hexHeight}px`,
                                  clipPath,
                                }
                              : {
                                  ...getTileBackgroundStyle(tile),
                                  width: `${tileSizePx}px`,
                                  height: `${tileSizePx}px`,
                                }
                          }
                          title={`(${col}, ${row}) [${getTileDomain(tile).toUpperCase()}] ${
                            terrainMeta.label
                          }${
                            effectiveSlots.length > 0
                              ? ` · Slots: ${effectiveSlots.map((s) => s.name).join(', ')}`
                              : ''
                          }${tile.label ? ` — ${tile.label}` : ''}`}
                          className={`relative border border-black/15 flex flex-col items-center justify-center transition-transform overflow-hidden ${
                            isSelected || isRulerOrigin
                              ? 'ring-2 ring-white z-20 scale-110 shadow-xl'
                              : isInRulerPath
                              ? 'ring-2 ring-amber-400 z-20 brightness-110 shadow-md'
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
                            neighborContext={neighborContext}
                            enableOrganicShading={shadingMode === 'organic'}
                            showRelief={visibleLayers.relief}
                            showWatershed={visibleLayers.watershed}
                            showRoads={visibleLayers.roads}
                            riverAdjacencies={getConnectedRiverAdjacencies(map, col, row)}
                            roadAdjacencies={getConnectedRoadAdjacencies(map, col, row)}
                            cartographicSymbol={tile.cartographicSymbol}
                            overlay={tile.overlay}
                          />

                          {/* Crisp Hexagonal Polygon Stroke Outline */}
                          {isHex && (
                            <svg
                              viewBox={`0 0 ${hexWidth} ${hexHeight}`}
                              className="absolute inset-0 w-full h-full pointer-events-none"
                            >
                              <polygon
                                points={getHexPolygonPoints(
                                  { x: hexWidth / 2, y: hexHeight / 2 },
                                  hexRadius,
                                  hexTopology
                                )}
                                fill="none"
                                stroke={
                                  isSelected || isRulerOrigin
                                    ? '#f59e0b'
                                    : isInRulerPath
                                    ? '#fbbf24'
                                    : 'rgba(0,0,0,0.22)'
                                }
                                strokeWidth={isSelected || isRulerOrigin ? '2.5' : isInRulerPath ? '2' : '1'}
                              />
                            </svg>
                          )}

                          {/* Ruler Path Golden Highlight Overlay */}
                          {isInRulerPath && (
                            <div className="absolute inset-0 bg-amber-400/25 pointer-events-none z-10 animate-pulse" />
                          )}

                      {/* Corner Micro-Indicators (Top-Left: Extra Slots or Lake/Island indicator) */}
                      {visibleLayers.slots && (extraSlotCount > 0 ? (
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
                      ) : null)}

                      {/* Top-Right Corner Micro-Indicator: Historic Event Star / Faction Crest */}
                      {hasEvents && (
                        <span
                          className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-amber-400 ring-1 ring-black/70 z-20"
                          title="Has linked historical events or lore notes"
                        />
                      )}

                      {/* Center Priority Slot Display (Zero icon clutter on empty background tiles!) */}
                      {visibleLayers.slots && primarySlot && (
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
                      {visibleLayers.labels && tile.label && (
                        <span className="relative z-10 text-[8px] font-serif font-bold text-amber-50 bg-stone-950/75 px-1 rounded truncate max-w-[94%] mt-0.5 shadow-sm">
                          {tile.label}
                        </span>
                      )}

                      {/* Fog of War / Unexplored Wilderness Shroud */}
                      {visibleLayers.fog && tile.isUnexplored && (
                        <div
                          className="absolute inset-0 bg-stone-900/90 backdrop-blur-[1px] z-20 flex flex-col items-center justify-center pointer-events-none select-none"
                          aria-label="Unexplored Fog of War"
                        >
                          <CloudFog className="h-4 w-4 text-stone-400 opacity-60 animate-pulse" />
                        </div>
                      )}
                    </button>
                  )
                })
              )}
              {shadingMode === 'organic' && (
                <div
                  className="absolute inset-0 pointer-events-none cartography-vignette z-30"
                  aria-hidden="true"
                />
              )}
            </div>
          )
        })()}
      </div>

          {/* Floating Distance Ruler Measurement Banner */}
          {rulerMeasurement && (
            <div
              data-testid="hex-ruler-overlay"
              className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-stone-900/95 text-stone-100 border border-amber-500/50 rounded-xl px-4 py-2.5 shadow-2xl flex items-center gap-4 text-xs z-40 pointer-events-auto backdrop-blur-md"
            >
              <div className="flex items-center gap-2 font-mono">
                <Ruler className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="font-bold text-amber-300">
                  {rulerMeasurement.tiles} {map.gridTopology?.startsWith('hex') ? 'hexes' : 'tiles'}
                </span>
                <span className="text-stone-400">·</span>
                <span>{rulerMeasurement.leagues} leagues ({rulerMeasurement.miles} miles)</span>
                <span className="text-stone-400">·</span>
                <span className="text-emerald-400 font-semibold">
                  ~{rulerMeasurement.daysWalk} days march
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRulerStart(null)
                  setRulerHover(null)
                }}
                className="text-stone-400 hover:text-stone-100 px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 transition-colors"
              >
                Clear Ruler
              </button>
            </div>
          )}

          {/* Floating Cartographic Scale & Compass Rose */}
          <div className="absolute bottom-3 left-3 z-30 flex items-center gap-2 pointer-events-none select-none">
            <div className="w-9 h-9 rounded-full bg-card/90 backdrop-blur-md border border-border/70 shadow-lg flex items-center justify-center text-[10px] font-serif font-bold text-primary">
              <div className="relative w-7 h-7 flex items-center justify-center">
                <span className="absolute top-0 text-[8px] font-bold">N</span>
                <span className="absolute bottom-0 text-[8px]">S</span>
                <span className="absolute left-0 text-[8px]">W</span>
                <span className="absolute right-0 text-[8px]">E</span>
                <Compass className="h-3.5 w-3.5 text-primary/70" />
              </div>
            </div>

            <div className="px-2 py-1 rounded-md bg-card/90 backdrop-blur-md border border-border/70 shadow-lg text-[10px] font-mono text-muted-foreground flex items-center gap-1.5">
              <div className="w-8 border-b-2 border-l-2 border-r-2 border-primary/80 h-1.5" />
              <span>~{Math.round(50 / camera.zoom)} Leagues</span>
            </div>
          </div>

          {/* Floating Navigation Hint */}
          <div className="absolute top-3 right-3 z-30 flex items-center gap-1 pointer-events-none select-none">
            <span className="text-[10px] px-2 py-1 rounded-md bg-card/85 backdrop-blur-md border border-border/60 text-muted-foreground hidden sm:inline-flex items-center gap-1">
              <Hand className="h-2.5 w-2.5" />
              <span>Space + Drag to Pan</span>
            </span>
          </div>

          {/* Interactive Floating Minimap Radar */}
          {showMinimap ? (
            <div
              className="absolute bottom-3 right-3 z-30 p-2 rounded-xl bg-card/90 backdrop-blur-md border border-border/80 shadow-2xl space-y-1.5 select-none"
              style={{ maxWidth: '190px' }}
            >
              <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground px-0.5">
                <div className="flex items-center gap-1">
                  <Compass className="h-3 w-3 text-primary" />
                  <span>Minimap Radar</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMinimap(false)}
                  className="text-[10px] hover:text-foreground p-0.5 cursor-pointer"
                  title="Hide Minimap"
                  aria-label="Hide Minimap"
                >
                  ✕
                </button>
              </div>

              {/* Minimap Grid */}
              <div
                className="relative rounded border border-border/60 overflow-hidden cursor-crosshair bg-slate-950"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${map.width}, 6px)`,
                  width: `${map.width * 6}px`,
                  height: `${map.height * 6}px`,
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const clickX = e.clientX - rect.left
                  const clickY = e.clientY - rect.top
                  const col = Math.floor(clickX / 6)
                  const row = Math.floor(clickY / 6)
                  const totalW = map.width * tileSizePx
                  const totalH = map.height * tileSizePx
                  const targetX = (col + 0.5) * tileSizePx - totalW / 2
                  const targetY = (row + 0.5) * tileSizePx - totalH / 2
                  setCamera((prev) => ({
                    ...prev,
                    x: -targetX * prev.zoom,
                    y: -targetY * prev.zoom,
                  }))
                }}
                title="Click on Minimap to center camera"
              >
                {Array.from({ length: map.height }).map((_, r) =>
                  Array.from({ length: map.width }).map((__, c) => {
                    const t = map.tiles[`${c},${r}`]
                    const color = TERRAIN_PALETTE[t?.terrain || 'ocean']?.color || '#1e3a8a'
                    return (
                      <div
                        key={`${c},${r}`}
                        style={{
                          backgroundColor: color,
                          width: '6px',
                          height: '6px',
                        }}
                      />
                    )
                  })
                )}

                {/* Viewport Box Indicator on Minimap */}
                <div
                  className="absolute border-2 border-amber-400 bg-amber-400/20 pointer-events-none rounded-sm transition-all duration-75"
                  style={{
                    width: `${Math.max(12, Math.min(map.width * 6, (map.width * 6) / camera.zoom * 0.55))}px`,
                    height: `${Math.max(12, Math.min(map.height * 6, (map.height * 6) / camera.zoom * 0.55))}px`,
                    left: `${Math.max(0, Math.min(map.width * 6 - 12, (map.width * 6) / 2 - (camera.x / (tileSizePx * map.width)) * (map.width * 6) - 12))}px`,
                    top: `${Math.max(0, Math.min(map.height * 6 - 12, (map.height * 6) / 2 - (camera.y / (tileSizePx * map.height)) * (map.height * 6) - 12))}px`,
                  }}
                />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowMinimap(true)}
              className="absolute bottom-3 right-3 z-30 px-2 py-1 rounded-lg bg-card/90 backdrop-blur-md border border-border/80 shadow-md text-[10px] font-medium flex items-center gap-1 hover:bg-muted"
              title="Show Minimap Radar"
              aria-label="Show Minimap"
            >
              <Compass className="h-3 w-3 text-primary" />
              <span>Show Minimap</span>
            </button>
          )}
        </div>
      </div>

      {/* Right: Tile Slot & Lineage Inspector (4 cols) */}
        <div className="xl:col-span-4 card p-4 sm:p-5 space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <h3 className="text-base font-bold">
                  {inspectedTile.label || `Tile (${inspectedTile.col}, ${inspectedTile.row})`}
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
                Coord ({inspectedTile.col}, {inspectedTile.row}) ·{' '}
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
            {/* Location Name (Editable in Edit Mode) */}
            {!isViewOnly && (
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
            )}

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
                  Calm background {inspectedDomain} tile (no extra icons shown).
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
                      {!isViewOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSlotFromInspected(slot.id)}
                          className="text-muted-foreground hover:text-destructive p-1"
                          title="Remove slot from tile"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Add Slot to Tile (Edit Mode Only) */}
              {!isViewOnly && (
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
              )}
            </div>

            {!isViewOnly && (
              <>
                {/* Base Terrain, Coloring Style & Custom Colors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Base Biome
                    </label>
                    <select
                      value={inspectedTile.terrain}
                      onChange={(e) =>
                        handleUpdateInspectedTile({
                          terrain: e.target.value as TerrainType,
                        })
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
                      Elevation Relief
                    </label>
                    <select
                      value={inspectedTile.relief || 'none'}
                      onChange={(e) =>
                        handleUpdateInspectedTile({
                          relief: e.target.value as ReliefType,
                        })
                      }
                      className="input w-full text-xs py-1 h-8"
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
                      Flora Slot
                    </label>
                    <select
                      value={inspectedTile.flora || 'none'}
                      onChange={(e) =>
                        handleUpdateInspectedTile({
                          flora: e.target.value as FloraType,
                        })
                      }
                      className="input w-full text-xs py-1 h-8"
                    >
                      {Object.values(FLORA_PALETTE).map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.symbol ? `${f.symbol} ${f.label}` : 'None'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Cartographic Trope
                    </label>
                    <select
                      value={inspectedTile.cartographicSymbol || ''}
                      onChange={(e) =>
                        handleUpdateInspectedTile({
                          cartographicSymbol: e.target.value || undefined,
                        })
                      }
                      className="input w-full text-xs py-1 h-8"
                    >
                      <option value="">Auto (from relief/flora)</option>
                      {(['earth', 'water', 'plant', 'feature', 'settlement', 'construction'] as CartographicCategory[]).map(
                        (cat) => (
                          <React.Fragment key={cat}>
                            {getConceptsByCategory(cat).map((concept) => (
                              <optgroup
                                key={concept.id}
                                label={`${cat === 'earth' ? '♠' : cat === 'water' ? '♥' : cat === 'plant' ? '♣' : cat === 'feature' ? '♦' : cat === 'settlement' ? '🏘️' : '🏰'} ${concept.label}`}
                              >
                                {getSymbolsByConcept(concept.id).map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.icon} {s.name} — {s.variantName}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </React.Fragment>
                        )
                      )}
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
                      onChange={(e) =>
                        handleUpdateInspectedTile({ hasRiver: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span>💧 River</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(inspectedTile.hasRoad)}
                      onChange={(e) =>
                        handleUpdateInspectedTile({ hasRoad: e.target.checked })
                      }
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
              </>
            )}

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
                    <button
                      key={ent.id}
                      type="button"
                      onClick={() => onSelectEntity?.(ent.id)}
                      className="w-full text-left text-xs p-1.5 rounded bg-muted/60 hover:bg-accent hover:border-primary flex items-center justify-between border border-border/60 transition-colors"
                      title={`Inspect ${ent.name} in the Codex`}
                    >
                      <span className="font-semibold flex items-center gap-1.5">
                        <span>{ent.icon}</span>
                        <span>{ent.name}</span>
                      </span>
                      <span className="text-[10px] uppercase text-primary font-semibold">
                        {ent.category} →
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Direct Entity Linker on Tile in Edit Mode */}
              {!isViewOnly && entities.length > 0 && (
                <div className="pt-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                    Connect Entities to Tile ({inspectedTile.col}, {inspectedTile.row}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {entities.map((ent) => {
                      const isConnected = inspectedTile.linkedEntityIds.includes(ent.id)
                      return (
                        <button
                          key={ent.id}
                          type="button"
                          onClick={() => {
                            const nextIds = isConnected
                              ? inspectedTile.linkedEntityIds.filter((id) => id !== ent.id)
                              : [...inspectedTile.linkedEntityIds, ent.id]
                            handleUpdateInspectedTile({ linkedEntityIds: nextIds })
                          }}
                          className={`px-2 py-0.5 rounded-full text-[10px] border transition-colors ${
                            isConnected
                              ? 'bg-primary text-primary-foreground border-primary font-semibold'
                              : 'bg-background border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {ent.icon} {ent.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {linkedEvents.length > 0 ? (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {linkedEvents.map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => onSelectEvent?.(ev.moveId)}
                      className="w-full text-left text-xs p-2 rounded bg-muted/50 hover:bg-accent border border-border/60 hover:border-primary space-y-0.5 transition-colors block"
                      title={`Jump to Turn #${ev.moveId} in Chronicle`}
                    >
                      <div className="font-semibold flex justify-between text-[11px]">
                        <span className="text-primary">
                          Turn #{ev.moveId} ({ev.card.value}
                          {ev.card.suit}) · {ev.actionTitle || ev.power}
                        </span>
                        <span className="text-muted-foreground uppercase text-[10px]">
                          {ev.stage} →
                        </span>
                      </div>
                      {ev.note && (
                        <p className="text-[11px] text-muted-foreground leading-snug">
                          {ev.note}
                        </p>
                      )}
                    </button>
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
