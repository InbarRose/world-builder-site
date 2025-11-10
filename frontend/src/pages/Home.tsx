import { Link } from 'react-router-dom'
import { BookOpen, Play } from 'lucide-react'

export function Home() {
  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
      <div className="max-w-4xl w-full space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold">World Building</h1>
          <p className="text-2xl text-muted-foreground">
            Creating Awesome Worlds Together
          </p>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link
            to="/rules"
            className="card p-8 hover:shadow-lg transition-all hover:scale-105 group"
          >
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <BookOpen className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Rules</h2>
              <p className="text-muted-foreground">
                Learn the complete ruleset for collaborative world building.
                Navigate through stages, powers, and mechanics.
              </p>
            </div>
          </Link>

          <Link
            to="/play"
            className="card p-8 hover:shadow-lg transition-all hover:scale-105 group"
          >
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Play className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Play</h2>
              <p className="text-muted-foreground">
                Draw cards from a deck and explore the game mechanics.
                Configure your deck and track your draws.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

