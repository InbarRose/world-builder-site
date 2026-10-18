import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Map as MapIcon } from 'lucide-react'
import { MapCanvas } from '../components/MapCanvas'
import { getActiveWorld, saveWorld } from '../engine/storageService'
import { MapState, WorldState } from '../engine/types'

export function Map() {
  const [world, setWorld] = useState<WorldState>(() => getActiveWorld())

  useEffect(() => {
    setWorld(getActiveWorld())
  }, [])

  const handleMapChange = (newMap: MapState) => {
    const updated = saveWorld({
      ...world,
      map: newMap,
    })
    setWorld(updated)
  }

  const isMobileDefaultViewOnly = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <MapIcon className="h-6 w-6 sm:h-7 sm:w-7 text-primary shrink-0" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold leading-tight">
              World Atlas — {world.name}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Tap any tile to inspect its terrain, settlements, Codex entities, and history
            </p>
          </div>
        </div>
        <Link to="/play" className="btn-outline flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Play Studio</span>
        </Link>
      </div>

      <MapCanvas
        map={world.map}
        worldName={world.name}
        drawHistory={world.drawHistory}
        entities={world.entities}
        onChange={handleMapChange}
        initialViewOnly={isMobileDefaultViewOnly}
      />
    </div>
  )
}
