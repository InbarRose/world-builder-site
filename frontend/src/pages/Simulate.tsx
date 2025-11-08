
import { Play, Shuffle, BookOpen } from 'lucide-react'

export function Simulate() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Quick Simulate</h1>
        <p className="text-muted-foreground">
          Test the game mechanics without creating a full session.
        </p>
      </div>

      <div className="card p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Simulation Controls</h2>
          <div className="flex flex-wrap gap-4">
            <button className="btn-primary flex items-center space-x-2">
              <Play className="h-4 w-4" />
              <span>Draw Card</span>
            </button>
            <button className="btn-outline flex items-center space-x-2">
              <Shuffle className="h-4 w-4" />
              <span>Shuffle Deck</span>
            </button>
            <button className="btn-outline flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>View Rules</span>
            </button>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Simulation Results</h2>
        <p className="text-muted-foreground text-center py-8">
          Draw cards to see simulation results here.
        </p>
      </div>
    </div>
  )
}



