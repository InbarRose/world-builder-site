import React, { useState, useEffect } from 'react'
import {
  Globe,
  Plus,
  Trash2,
  Check,
  X,
  Edit3,
  Copy,
  Lock,
  Unlock,
  Sparkles,
  Compass,
  Layers,
} from 'lucide-react'
import { GeographyPreset, WorldState } from '../engine/types'
import { STAGES } from '../engine/deckEngine'

export type DeckPacingVariant = 'standard' | 'short' | 'epic'

export interface CreateWorldOptions {
  geographyPreset?: GeographyPreset
  deckVariant?: DeckPacingVariant
  autoGenerate?: boolean
  seed?: number
}

const GEOGRAPHY_OPTIONS: { id: GeographyPreset; label: string }[] = [
  { id: 'pangaea', label: 'Pangaea Continent' },
  { id: 'continent', label: 'Central Continent' },
  { id: 'archipelago', label: 'Archipelago Isles' },
  { id: 'twin-continents', label: 'Twin Continents' },
  { id: 'inland-sea', label: 'Inland Sea Basin' },
]

interface WorldManagerModalProps {
  isOpen: boolean
  activeWorld: WorldState
  savedWorlds: WorldState[]
  onClose: () => void
  onSelectWorld: (world: WorldState) => void
  onCreateWorld: (name: string, options?: CreateWorldOptions) => void
  onRenameWorld: (newName: string) => void
  onDeleteWorld: (worldId: string) => void
  onDuplicateWorld?: (worldId: string) => void
  onToggleLockWorld?: (worldId: string) => void
}

export function WorldManagerModal({
  isOpen,
  activeWorld,
  savedWorlds,
  onClose,
  onSelectWorld,
  onCreateWorld,
  onRenameWorld,
  onDeleteWorld,
  onDuplicateWorld,
  onToggleLockWorld,
}: WorldManagerModalProps) {
  const [newWorldName, setNewWorldName] = useState('')
  const [editingName, setEditingName] = useState(activeWorld.name)
  const [geographyPreset, setGeographyPreset] = useState<GeographyPreset>('pangaea')
  const [deckVariant, setDeckVariant] = useState<DeckPacingVariant>('standard')
  const [autoGenerate, setAutoGenerate] = useState(false)
  const [seed, setSeed] = useState<number>(() => Math.floor(1000 + Math.random() * 9000))
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => {
    setEditingName(activeWorld.name)
  }, [activeWorld.name])

  if (!isOpen) return null

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWorldName.trim()) return
    onCreateWorld(newWorldName.trim(), {
      geographyPreset,
      deckVariant,
      autoGenerate,
      seed,
    })
    setNewWorldName('')
    setSeed(Math.floor(1000 + Math.random() * 9000))
  }

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingName.trim()) return
    onRenameWorld(editingName.trim())
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="World Manager"
    >
      <div className="card p-6 max-w-3xl w-full max-h-[92vh] overflow-y-auto space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <Globe className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-xl font-bold">World Manager & Setup Studio</h3>
              <p className="text-xs text-muted-foreground">
                Each world has its own isolated map, timeline, and codex — switching or creating worlds never modifies your other realms
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-accent rounded-md"
            aria-label="Close World Manager"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Rename Active World */}
        <form onSubmit={handleRename} className="bg-muted/40 p-4 rounded-lg space-y-2 border border-border">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Edit3 className="h-3.5 w-3.5" />
              <span>Active World Name</span>
            </label>
            {activeWorld.isLocked && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full">
                <Lock className="h-3 w-3" /> Read-Only Locked
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              className="input flex-1 text-sm"
              placeholder="Enter world name..."
            />
            <button type="submit" className="btn-primary px-4 py-2 text-sm">
              Rename
            </button>
          </div>
        </form>

        {/* Guided New World Creation Wizard */}
        <form onSubmit={handleCreate} className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Compass className="h-4 w-4" />
              <span>Create New Isolated World</span>
            </label>
            <span className="text-[11px] text-muted-foreground">
              Safe: leaves {activeWorld.name} untouched
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-2">
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                World Name
              </label>
              <input
                type="text"
                value={newWorldName}
                onChange={(e) => setNewWorldName(e.target.value)}
                placeholder="e.g., Shattered Isles, Aethelgard..."
                className="input w-full text-sm h-9"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Random Seed
              </label>
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(Number(e.target.value) || 1000)}
                className="input w-full text-sm h-9 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Geography Template
              </label>
              <select
                value={geographyPreset}
                onChange={(e) => setGeographyPreset(e.target.value as GeographyPreset)}
                className="input w-full text-xs h-9"
              >
                {GEOGRAPHY_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Deck Pacing Variant
              </label>
              <select
                value={deckVariant}
                onChange={(e) => setDeckVariant(e.target.value as DeckPacingVariant)}
                className="input w-full text-xs h-9"
              >
                <option value="standard">Standard (54 Cards)</option>
                <option value="short">Quick Game (30 Cards)</option>
                <option value="epic">Epic Saga (Double Face)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Starting Mode
              </label>
              <button
                type="button"
                onClick={() => setAutoGenerate(!autoGenerate)}
                className={`w-full h-9 px-2.5 rounded-md border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  autoGenerate
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border hover:bg-muted'
                }`}
              >
                {autoGenerate ? (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Auto-Play All 4 Ages</span>
                  </>
                ) : (
                  <>
                    <Layers className="h-3.5 w-3.5" />
                    <span>Start at Stage 1: Genesis</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="btn-primary px-4 py-2 text-sm flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Create World</span>
            </button>
          </div>
        </form>

        {/* Saved Worlds List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Your Saved Worlds ({savedWorlds.length})
            </h4>
            <span className="text-[11px] text-muted-foreground">
              Click Duplicate to snapshot any world before experimenting
            </span>
          </div>
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {savedWorlds.map((w) => {
              const isActive = w.id === activeWorld.id
              const stageIndex = STAGES.findIndex((s) => s.id === w.currentStage)
              const stageInfo = STAGES[stageIndex] || STAGES[0]
              const speciesCount = (w.entities || []).filter((e) => e.category === 'species').length
              const civCount = (w.entities || []).filter((e) => e.category === 'society').length
              const geoPreset = w.generationSettings?.geographyPreset || 'pangaea'

              return (
                <div
                  key={w.id}
                  className={`p-3.5 rounded-lg border flex flex-wrap items-center justify-between gap-3 transition-colors ${
                    isActive
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                      : 'border-border bg-card hover:bg-muted/40'
                  }`}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-base truncate">{w.name}</span>
                      {isActive && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                          Active
                        </span>
                      )}
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                        Age {stageIndex + 1}/4: {stageInfo.name}
                      </span>
                      {w.isLocked && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
                          <Lock className="h-2.5 w-2.5" /> Locked
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span>{w.drawHistory.length} turns</span>
                      <span>·</span>
                      <span>{speciesCount} species</span>
                      <span>·</span>
                      <span>{civCount} kingdoms</span>
                      <span>·</span>
                      <span className="capitalize">{geoPreset}</span>
                      {w.generationSettings?.seed && (
                        <>
                          <span>·</span>
                          <span className="font-mono text-[11px]">Seed #{w.generationSettings.seed}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectWorld(w)
                          setEditingName(w.name)
                        }}
                        className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Load World</span>
                      </button>
                    )}

                    {onDuplicateWorld && (
                      <button
                        type="button"
                        onClick={() => onDuplicateWorld(w.id)}
                        className="btn-outline px-2.5 py-1.5 text-xs flex items-center gap-1"
                        title={`Duplicate ${w.name} as an independent snapshot`}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span>Duplicate</span>
                      </button>
                    )}

                    {onToggleLockWorld && (
                      <button
                        type="button"
                        onClick={() => onToggleLockWorld(w.id)}
                        className={`btn-outline px-2.5 py-1.5 text-xs flex items-center gap-1 ${
                          w.isLocked ? 'border-amber-500/50 text-amber-700 dark:text-amber-300' : ''
                        }`}
                        title={w.isLocked ? 'Unlock world for editing' : 'Lock world to prevent accidental changes'}
                      >
                        {w.isLocked ? (
                          <>
                            <Lock className="h-3.5 w-3.5" />
                            <span>Locked</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="h-3.5 w-3.5" />
                            <span>Lock</span>
                          </>
                        )}
                      </button>
                    )}

                    {savedWorlds.length > 1 && (
                      confirmDeleteId === w.id ? (
                        <div className="flex items-center gap-1 bg-destructive/10 px-2 py-1 rounded border border-destructive/30">
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteWorld(w.id)
                              setConfirmDeleteId(null)
                            }}
                            className="text-[11px] font-bold text-destructive hover:underline"
                          >
                            Confirm Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-[11px] text-muted-foreground hover:underline ml-1"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(w.id)}
                          className="btn-outline px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                          title="Delete saved world"
                          aria-label={`Delete ${w.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
