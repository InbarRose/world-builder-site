import { useMemo, useState } from 'react'
import { MapPin, Search, X } from 'lucide-react'
import { GeographicRegion, MapState } from '../engine/types'

export type MapInventoryCategory =
  | 'all'
  | 'regions'
  | 'rivers'
  | 'settlements'
  | 'landmarks'
  | 'nature'

export interface MapInventoryItem {
  id: string
  category: Exclude<MapInventoryCategory, 'all'>
  icon: string
  name: string
  subtitle: string
  tileId: string
  regionId?: string
}

interface MapInventoryDrawerProps {
  isOpen: boolean
  map: MapState
  regions: GeographicRegion[]
  selectedTileId: string
  highlightedRegionId?: string | null
  onClose: () => void
  onSelectItem: (item: MapInventoryItem) => void
}

/**
 * Phase 67 (ADR-070): Collapsible, searchable Map Asset Inventory drawer.
 * Lets players search and jump directly to any Region, River, Settlement/Site,
 * Named Landmark, or Mountain/Forest on the map.
 */
export function MapInventoryDrawer({
  isOpen,
  map,
  regions,
  selectedTileId,
  highlightedRegionId,
  onClose,
  onSelectItem,
}: MapInventoryDrawerProps) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<MapInventoryCategory>('all')

  const allItems = useMemo<MapInventoryItem[]>(() => {
    const items: MapInventoryItem[] = []

    // 1. Geographic Regions (Named & Detected)
    for (const reg of regions) {
      const centroidId = `${reg.centroid.col},${reg.centroid.row}`
      items.push({
        id: `region_${reg.id}`,
        category: 'regions',
        icon: reg.icon,
        name: reg.name,
        subtitle: `${reg.categoryLabel} · ${reg.tileIds.length} tiles · (${centroidId})`,
        tileId: centroidId,
        regionId: reg.id,
      })
    }

    const tiles = Object.values(map.tiles)
    for (const tile of tiles) {
      const slots = tile.slots || []

      // 2. Rivers & Hydrology
      if (tile.hasRiver) {
        items.push({
          id: `river_${tile.id}`,
          category: 'rivers',
          icon: '🌊',
          name: tile.label ? `${tile.label} (River)` : `River Channel (${tile.id})`,
          subtitle: `Waterway · ${tile.terrain} · (${tile.id})`,
          tileId: tile.id,
        })
      }

      // 3. Settlements, Citadels, Wonders, Ruins & Resource Slots
      if (tile.overlay && tile.overlay !== 'none') {
        items.push({
          id: `overlay_${tile.id}`,
          category: 'settlements',
          icon:
            tile.overlay === 'capital'
              ? '👑'
              : tile.overlay === 'city'
              ? '🏙️'
              : tile.overlay === 'castle'
              ? '🏰'
              : tile.overlay === 'ruins'
              ? '🏛️'
              : '🏘️',
          name: tile.label || `${tile.overlay.charAt(0).toUpperCase() + tile.overlay.slice(1)} (${tile.id})`,
          subtitle: `${tile.overlay} · (${tile.id})`,
          tileId: tile.id,
        })
      }

      for (const slot of slots) {
        items.push({
          id: `slot_${tile.id}_${slot.id}`,
          category: 'settlements',
          icon: slot.icon || '📍',
          name: slot.name,
          subtitle: `${slot.category} · (${tile.id})`,
          tileId: tile.id,
        })
      }

      // 4. Named Landmarks (any labeled tile not already covered as overlay/river)
      if (tile.label && tile.label.trim() && !tile.hasRiver && (!tile.overlay || tile.overlay === 'none')) {
        items.push({
          id: `landmark_${tile.id}`,
          category: 'landmarks',
          icon: '📍',
          name: tile.label.trim(),
          subtitle: `Named Landmark · ${tile.terrain} · (${tile.id})`,
          tileId: tile.id,
        })
      }

      // 5. Notable Natural Features (Mountains & Forests)
      if (tile.relief === 'mountain' || tile.terrain === 'mountain') {
        items.push({
          id: `peak_${tile.id}`,
          category: 'nature',
          icon: '🏔️',
          name: tile.label || `Mountain Peak (${tile.id})`,
          subtitle: `Alpine Relief · (${tile.id})`,
          tileId: tile.id,
        })
      } else if (tile.flora === 'forest' || tile.terrain === 'forest') {
        items.push({
          id: `wood_${tile.id}`,
          category: 'nature',
          icon: '🌲',
          name: tile.label || `Woodland (${tile.id})`,
          subtitle: `Forest Canopy · (${tile.id})`,
          tileId: tile.id,
        })
      }
    }

    return items
  }, [map.tiles, regions])

  const counts = useMemo(() => {
    const c: Record<MapInventoryCategory, number> = {
      all: allItems.length,
      regions: 0,
      rivers: 0,
      settlements: 0,
      landmarks: 0,
      nature: 0,
    }
    for (const it of allItems) {
      c[it.category]++
    }
    return c
  }, [allItems])

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allItems.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false
      if (!q) return true
      return (
        item.name.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.tileId.toLowerCase().includes(q)
      )
    })
  }, [allItems, activeCategory, query])

  if (!isOpen) return null

  const categories: { id: MapInventoryCategory; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: '🗺️' },
    { id: 'regions', label: 'Regions', icon: '🌍' },
    { id: 'rivers', label: 'Rivers', icon: '🌊' },
    { id: 'settlements', label: 'Sites', icon: '🏘️' },
    { id: 'landmarks', label: 'Labels', icon: '📍' },
    { id: 'nature', label: 'Nature', icon: '🏔️' },
  ]

  return (
    <div
      data-testid="map-inventory-drawer"
      className="mt-1.5 rounded-xl border border-primary/30 bg-card/95 backdrop-blur-md p-2.5 shadow-lg space-y-2 text-xs"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-bold text-foreground">
          <span>🗺️</span>
          <span>Map Asset Inventory</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
            {filteredItems.length} / {allItems.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Map Inventory"
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Live Search Input */}
      <div className="relative">
        <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          data-testid="map-inventory-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search regions, rivers, towns, landmarks, or coords (e.g. 10,6)..."
          className="input w-full h-8 pl-8 pr-2 text-xs"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            data-testid={`inventory-filter-${cat.id}`}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-colors flex items-center gap-1 ${
              activeCategory === cat.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
            <span className="text-[10px] opacity-80 font-mono">({counts[cat.id]})</span>
          </button>
        ))}
      </div>

      {/* Scrollable Inventory Results */}
      {filteredItems.length === 0 ? (
        <div className="py-4 text-center text-[11px] text-muted-foreground italic">
          No map assets match “{query || activeCategory}”.
        </div>
      ) : (
        <div className="max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 pr-1">
          {filteredItems.slice(0, 60).map((item) => {
            const isSelected =
              (item.regionId && highlightedRegionId === item.regionId) ||
              (!item.regionId && selectedTileId === item.tileId)
            return (
              <button
                key={item.id}
                type="button"
                data-testid={`inventory-item-${item.id}`}
                onClick={() => onSelectItem(item)}
                className={`text-left px-2 py-1.5 rounded-lg border transition-all flex items-start gap-2 ${
                  isSelected
                    ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                    : 'border-border/80 bg-background/80 hover:border-primary/40 hover:bg-accent/50'
                }`}
              >
                <span className="text-sm shrink-0 mt-0.5">{item.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-foreground truncate">{item.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{item.subtitle}</div>
                </div>
                <MapPin className="h-3 w-3 text-primary/70 shrink-0 mt-1" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
