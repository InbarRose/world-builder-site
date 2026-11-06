import { useState, useRef } from 'react'
import {
  Sparkles,
  Play,
  FolderOpen,
  Upload,
  Dice5,
  BookOpen,
  Trash2,
  Copy,
  Clock,
  Compass,
} from 'lucide-react'
import { WorldState } from '../engine/types'
import {
  listSavedWorlds,
  saveWorld,
  deleteWorld,
  duplicateWorld,
  parseImportedWorld,
  createNewWorld,
} from '../engine/storageService'
import { computeWorldStabilityIndex } from '../engine/narrativeEngine'
import { playCardDrawSound, playTurnPassSound, triggerHapticFeedback } from '../engine/soundEngine'
import { NewGameCeremonyModal } from './NewGameCeremonyModal'
import { Link } from 'react-router-dom'

interface StudioLauncherProps {
  onSelectWorld: (world: WorldState) => void
}

export function StudioLauncher({ onSelectWorld }: StudioLauncherProps) {
  const [savedWorlds, setSavedWorlds] = useState<WorldState[]>(() => listSavedWorlds())
  const [showNewGameModal, setShowNewGameModal] = useState(false)
  const [showLoadDrawer, setShowLoadDrawer] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Most recent world for instant Continue
  const activeWorld = savedWorlds[0] || null
  const activeStability = activeWorld ? computeWorldStabilityIndex(activeWorld) : null

  const handleResumeActive = () => {
    if (!activeWorld) return
    playCardDrawSound()
    triggerHapticFeedback('medium')
    onSelectWorld(activeWorld)
  }

  const handleSelectSaved = (w: WorldState) => {
    playCardDrawSound()
    triggerHapticFeedback('medium')
    onSelectWorld(w)
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this realm archive? This action is permanent.')) {
      const remaining = deleteWorld(id)
      setSavedWorlds(remaining)
      triggerHapticFeedback('light')
    }
  }

  const handleDuplicate = (w: WorldState, e: React.MouseEvent) => {
    e.stopPropagation()
    duplicateWorld(w)
    setSavedWorlds(listSavedWorlds())
    triggerHapticFeedback('light')
  }

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const imported = parseImportedWorld(text)
        saveWorld(imported)
        setSavedWorlds(listSavedWorlds())
        playTurnPassSound()
        triggerHapticFeedback('celebration')
        onSelectWorld(imported)
      } catch (err) {
        alert('Failed to parse world file: ' + (err as Error).message)
      }
    }
    reader.readAsText(file)
  }

  const handleQuickStart = () => {
    const defaultNames = ['Aethelgard', 'Vales of Valdris', 'The Ironreach', 'Sunstone Expanse']
    const pick = defaultNames[Math.floor(Math.random() * defaultNames.length)]
    const newWorld = createNewWorld(pick)
    saveWorld(newWorld)
    setSavedWorlds(listSavedWorlds())
    playCardDrawSound()
    triggerHapticFeedback('medium')
    onSelectWorld(newWorld)
  }

  const filteredWorlds = savedWorlds.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-10 px-4">
      {/* Background Cartographic Crest */}
      <div className="w-full max-w-4xl space-y-8 animate-in fade-in duration-300">
        {/* Title & Heraldry Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold tracking-wider uppercase mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Tabletop Cartography & Narrative Studio</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground font-serif">
            World Builder Studio
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Inscribe primeval mythologies, draw epoch cards, shape hex cartography, and forge living
            chronicles across civilizational eras.
          </p>
        </div>

        {/* Section A: Continue Primary Campaign */}
        {activeWorld && activeStability && (
          <div className="card p-6 border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/[0.04] rounded-2xl shadow-xl space-y-4 hover:border-primary/50 transition-all">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Active Campaign in Progress</span>
              </span>
              <div
                className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold flex items-center gap-1 ${activeStability.badgeColor}`}
              >
                <span>{activeStability.icon}</span>
                <span>{activeStability.status}</span>
                <span className="font-mono text-[10px]">({activeStability.score}%)</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-foreground">{activeWorld.name}</h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="capitalize font-semibold text-foreground">
                    Era: {activeWorld.currentStage}
                  </span>
                  <span>·</span>
                  <span>{activeWorld.drawHistory.length} Turns Inscribed</span>
                  <span>·</span>
                  <span>{activeWorld.entities.length} Codex Factions</span>
                  <span>·</span>
                  <span className="font-mono text-[11px]">
                    {new Date(activeWorld.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResumeActive}
                className="btn-primary px-6 py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-transform shrink-0"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Resume Campaign</span>
              </button>
            </div>
          </div>
        )}

        {/* Section B: Main Action Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* New Campaign */}
          <button
            type="button"
            onClick={() => setShowNewGameModal(true)}
            className="p-5 rounded-2xl border border-border bg-card hover:border-primary/60 hover:bg-muted/40 transition-all flex flex-col items-center text-center gap-3 shadow-md group"
          >
            <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary group-hover:scale-110 transition-transform">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">New Campaign</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Initiation ceremony with customized settings
              </div>
            </div>
          </button>

          {/* Load Game Archive */}
          <button
            type="button"
            onClick={() => setShowLoadDrawer(true)}
            className="p-5 rounded-2xl border border-border bg-card hover:border-primary/60 hover:bg-muted/40 transition-all flex flex-col items-center text-center gap-3 shadow-md group"
          >
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <FolderOpen className="h-6 w-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">Load Realm</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Browse {savedWorlds.length} saved world archives
              </div>
            </div>
          </button>

          {/* Quick Start */}
          <button
            type="button"
            onClick={handleQuickStart}
            className="p-5 rounded-2xl border border-border bg-card hover:border-primary/60 hover:bg-muted/40 transition-all flex flex-col items-center text-center gap-3 shadow-md group"
          >
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Dice5 className="h-6 w-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">Quick Start</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                1-click instant realm creation
              </div>
            </div>
          </button>

          {/* Import Realm */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-5 rounded-2xl border border-border bg-card hover:border-primary/60 hover:bg-muted/40 transition-all flex flex-col items-center text-center gap-3 shadow-md group"
          >
            <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">Import Realm</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Load .json file or snapshot backup
              </div>
            </div>
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileImport}
          className="hidden"
        />

        {/* Section C: Reference Links */}
        <div className="pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-primary" />
            <span>World Builder Studio · Pure Client-Side & Offline Ready</span>
          </div>
          <Link
            to="/rules"
            className="hover:text-primary transition-colors flex items-center gap-1.5 font-semibold"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Consult 4-Ages Codex & Quick Reference</span>
          </Link>
        </div>
      </div>

      {/* New Game Ceremony Modal */}
      <NewGameCeremonyModal
        isOpen={showNewGameModal}
        onClose={() => setShowNewGameModal(false)}
        onLaunchWorld={(realm) => {
          saveWorld(realm)
          setSavedWorlds(listSavedWorlds())
          onSelectWorld(realm)
        }}
      />

      {/* Load Realms Drawer / Dialog */}
      {showLoadDrawer && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Realm Archives"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex items-center justify-between gap-3 bg-muted/40">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-base">Realm Archives ({savedWorlds.length})</h3>
              </div>
              <input
                type="text"
                placeholder="Search realms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input h-8 text-xs w-48"
              />
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-2 text-xs">
              {filteredWorlds.length > 0 ? (
                filteredWorlds.map((w) => (
                  <div
                    key={w.id}
                    onClick={() => handleSelectSaved(w)}
                    className="p-3 rounded-xl border border-border hover:border-primary bg-background flex items-center justify-between gap-3 cursor-pointer transition-colors group"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                        {w.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span className="capitalize font-semibold text-primary">
                          {w.currentStage}
                        </span>
                        <span>·</span>
                        <span>{w.drawHistory.length} Turns</span>
                        <span>·</span>
                        <span>{w.entities.length} Codex Factions</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleDuplicate(w, e)}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Duplicate Realm"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      {savedWorlds.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => handleDelete(w.id, e)}
                          className="p-1.5 rounded hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500"
                          title="Delete Realm"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <span className="btn-outline px-3 py-1 text-xs font-semibold group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                        Load
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No realms found matching "{searchQuery}".
                </div>
              )}
            </div>

            <div className="p-3 border-t border-border bg-muted/20 flex justify-end">
              <button
                type="button"
                onClick={() => setShowLoadDrawer(false)}
                className="btn-outline px-4 py-1.5 text-xs font-semibold"
              >
                Close Archives
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
