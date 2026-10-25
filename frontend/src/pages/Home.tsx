import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Play,
  Map as MapIcon,
  Sparkles,
  Clock,
  Users,
  Layers,
  Bot,
  Compass,
  ArrowRight,
  Globe,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { getActiveWorld } from '../engine/storageService'
import { STAGES } from '../engine/deckEngine'

export function Home() {
  const [activeWorld] = useState(() => getActiveWorld())
  const [agesExpanded, setAgesExpanded] = useState(true)

  const currentStageMeta = STAGES.find((s) => s.id === activeWorld.currentStage) || STAGES[0]

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center py-4 sm:py-8">
      <div className="max-w-6xl w-full space-y-8 sm:space-y-10">
        {/* Hero Launchpad Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Tabletop Narrative, Cartography & Lore Studio</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">World Building</h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Creating Awesome Worlds Together
          </p>
        </div>

        {/* Active Realm Resume Banner */}
        <div className="card p-4 sm:p-5 border-primary/30 bg-gradient-to-r from-primary/[0.06] via-card to-card flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="p-3 rounded-xl bg-primary/15 text-primary shrink-0">
              <Globe className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Active Realm
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">
                  Age {currentStageMeta.number}/4: {currentStageMeta.name}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold truncate mt-0.5">
                {activeWorld.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {activeWorld.drawHistory.length} historical turns ·{' '}
                {activeWorld.entities.length} codex entries · {activeWorld.players.length}{' '}
                tabletop seat(s)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/play"
              className="btn-primary px-4 py-2 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm"
            >
              <span>Resume Session</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/map"
              className="btn-outline px-3.5 py-2 text-xs sm:text-sm font-semibold flex items-center gap-1.5"
            >
              <MapIcon className="h-3.5 w-3.5 text-primary" />
              <span>Open Atlas</span>
            </Link>
          </div>
        </div>

        {/* Primary Area Launchers (1. Rules, 2. Play Modes, 3. Map Atlas) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Rules & Quick Reference */}
          <Link
            to="/rules"
            className="card p-6 hover:shadow-md transition-all hover:border-primary/40 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-7 w-7 text-primary" />
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                  Search & Print
                </span>
              </div>
              <h2 className="text-2xl font-bold">Rules</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Navigate, search, and print the complete collaborative ruleset, suit powers across all 4 Ages, and the 1-Page Quick Reference Card.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-primary">
              <span>Browse Rules & Cheat Sheet</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Play Workspace (Primary Centerpiece) */}
          <Link
            to="/play"
            className="card p-6 hover:shadow-md transition-all border-primary/40 hover:border-primary group flex flex-col justify-between bg-primary/[0.02]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-primary/15 group-hover:bg-primary/25 transition-colors">
                  <Play className="h-7 w-7 text-primary" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/15 text-primary">
                  3 Play Modes
                </span>
              </div>
              <h2 className="text-2xl font-bold">Play</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Enter the Play Workspace: choose between tabletop <strong>Companion</strong>, full campaign & bot <strong>Studio</strong>, or cardless <strong>Freeform</strong> world creation.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-primary">
              <span>Launch Play Workspace</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 3: World Map & Wiki Atlas */}
          <Link
            to="/map"
            className="card p-6 hover:shadow-md transition-all hover:border-primary/40 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <MapIcon className="h-7 w-7 text-primary" />
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                  SVG / PNG Export
                </span>
              </div>
              <h2 className="text-2xl font-bold">Map Atlas</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Inspect and paint your world map grid, blend terrain patterns, place priority settlements & landmarks, and link directly with the Codex.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-primary">
              <span>Explore World Atlas</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Direct Sub-Mode Launchers (3.1 Companion, 3.2 Studio, 3.3 Freeform) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Choose Your Play Experience
            </h3>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Switch modes anytime during your session
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 3.1 Play Companion */}
            <Link
              to="/play?mode=companion"
              className="card p-4 hover:border-primary/50 hover:bg-accent/30 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Layers className="h-4 w-4" />
                    <span>3.1 Play Companion</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-muted font-medium">
                    Tabletop Emulation
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Digital card deck, stage tracker, and power reference. Toggle optional Event Log, Codex, Map, or Player panels only when you want them—100% manual control.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                <span>Open Companion Mode</span>
                <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            {/* 3.2 Studio Mode */}
            <Link
              to="/play?mode=studio"
              className="card p-4 hover:border-primary/50 hover:bg-accent/30 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Bot className="h-4 w-4" />
                    <span>3.2 Studio Mode</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                    Turns & Bot Auto-Play
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Full turn-by-turn campaign studio. Automatically records map, codex, and event changes per turn, with configurable Bot Personalities & full-stage auto-play.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                <span>Open Studio Mode</span>
                <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            {/* 3.3 Freeform Mode */}
            <Link
              to="/play?mode=free-create"
              className="card p-4 hover:border-primary/50 hover:bg-accent/30 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Compass className="h-4 w-4" />
                    <span>3.3 Freeform Sandbox</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-muted font-medium">
                    Cardless Builder
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pure world creation without drawing cards. Sculpt your map, build your interconnected Codex wiki, and chronicle custom lore at your own pace.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                <span>Open Freeform Sandbox</span>
                <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </div>
        </div>

        {/* Collapsible Four Ages Overview */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setAgesExpanded((v) => !v)}
              className="text-left flex items-center gap-2 font-bold text-base hover:text-primary transition-colors"
            >
              <Clock className="h-5 w-5 text-primary" />
              <span>Four Ages of Creation</span>
              {agesExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>1–6 Players or Bots · Offline Ready</span>
            </span>
          </div>

          {agesExpanded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-sm">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">1. Genesis</span>
                  <span className="text-[10px] text-muted-foreground">Pre-History</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Shape continents, mountain ranges, rivers, forests, and natural wonders (♠ Earth · ♥ Water · ♣ Plant · ♦ Feature).
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">2. Primal</span>
                  <span className="text-[10px] text-muted-foreground">Age of Origins</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Awaken sentient species, early settlements, traditions, resources, and skills (♠ Settlement · ♥ Tradition · ♣ Resource · ♦ Skill).
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">3. Civilization</span>
                  <span className="text-[10px] text-muted-foreground">Age of Kingdoms</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Build great monuments, enlightenment, territorial expansion, and diplomacy (♠ Construction · ♥ Enlightenment · ♣ Expansion · ♦ Diplomacy).
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">4. Intrigue</span>
                  <span className="text-[10px] text-muted-foreground">Modern Era</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Weave recent conflicts, alliances, secret schemes, and living myths (♠ Conflict · ♥ Cooperation · ♣ Scheme · ♦ Myth).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
