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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <MapIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">World Atlas — {world.name}</h1>
            <p className="text-sm text-muted-foreground">
              Paint terrain, stamp settlements, and inspect historical tile coordinates
            </p>
          </div>
        </div>
        <Link to="/play" className="btn-outline flex items-center space-x-2 px-4 py-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to World Studio</span>
        </Link>
      </div>

      <MapCanvas
        map={world.map}
        worldName={world.name}
        drawHistory={world.drawHistory}
        entities={world.entities}
        onChange={handleMapChange}
      />
    </div>
  )
}
