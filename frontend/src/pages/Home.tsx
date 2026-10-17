import { Link } from 'react-router-dom'
import { BookOpen, Play, Map as MapIcon, Sparkles, Clock, Users } from 'lucide-react'

export function Home() {
  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-6">
      <div className="max-w-5xl w-full space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Tabletop Narrative & Cartography Studio</span>
          </div>
          <h1 className="text-5xl font-bold">World Building</h1>
          <p className="text-2xl text-muted-foreground">
            Creating Awesome Worlds Together
          </p>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/rules"
            className="card p-8 hover:shadow-lg transition-all hover:scale-[1.02] group"
          >
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <BookOpen className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Rules</h2>
              <p className="text-sm text-muted-foreground">
                Learn the complete ruleset for collaborative world building.
                Navigate through stages, powers, and mechanics.
              </p>
            </div>
          </Link>

          <Link
            to="/play"
            className="card p-8 hover:shadow-lg transition-all hover:scale-[1.02] group border-primary/30"
          >
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Play className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Play</h2>
              <p className="text-sm text-muted-foreground">
                Enter the World Studio: draw cards, log timeline turns, register species & kingdoms, and auto-save locally.
              </p>
            </div>
          </Link>

          <Link
            to="/map"
            className="card p-8 hover:shadow-lg transition-all hover:scale-[1.02] group"
          >
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <MapIcon className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Map Atlas</h2>
              <p className="text-sm text-muted-foreground">
                Paint your 20×12 world map grid, blend terrain patterns, stamp cities & monuments, and export to SVG or PNG.
              </p>
            </div>
          </Link>
        </div>

        {/* Four Ages Overview */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>Four Ages of Creation</span>
            </h3>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>100% Client-Side · Offline Ready</span>
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-muted/40 border border-border">
              <div className="font-bold text-primary">1. Genesis</div>
              <p className="text-xs text-muted-foreground mt-1">
                Shape continents, mountain ranges, rivers, forests, and natural wonders.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 border border-border">
              <div className="font-bold text-primary">2. Primal</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaken sentient species, early settlements, traditions, resources, and skills.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 border border-border">
              <div className="font-bold text-primary">3. Civilization</div>
              <p className="text-xs text-muted-foreground mt-1">
                Build great monuments, enlightenment, territorial expansion, and diplomacy.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 border border-border">
              <div className="font-bold text-primary">4. Intrigue</div>
              <p className="text-xs text-muted-foreground mt-1">
                Weave recent conflicts, alliances, secret schemes, and living myths.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
