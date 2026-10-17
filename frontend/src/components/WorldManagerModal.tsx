import React, { useState } from 'react'
import { Globe, Plus, Trash2, Check, X, Edit3 } from 'lucide-react'
import { WorldState } from '../engine/types'
import { STAGES } from '../engine/deckEngine'

interface WorldManagerModalProps {
  isOpen: boolean
  activeWorld: WorldState
  savedWorlds: WorldState[]
  onClose: () => void
  onSelectWorld: (world: WorldState) => void
  onCreateWorld: (name: string) => void
  onRenameWorld: (newName: string) => void
  onDeleteWorld: (worldId: string) => void
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
}: WorldManagerModalProps) {
  const [newWorldName, setNewWorldName] = useState('')
  const [editingName, setEditingName] = useState(activeWorld.name)

  if (!isOpen) return null

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWorldName.trim()) return
    onCreateWorld(newWorldName.trim())
    setNewWorldName('')
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
      <div className="card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <Globe className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-xl font-bold">Saved Worlds Manager</h3>
              <p className="text-xs text-muted-foreground">
                Worlds are automatically saved in your browser’s local storage
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
        <form onSubmit={handleRename} className="bg-muted/40 p-4 rounded-lg space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Edit3 className="h-3.5 w-3.5" />
            <span>Current Active World Name</span>
          </label>
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

        {/* Create New World */}
        <form onSubmit={handleCreate} className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
            Create New World
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newWorldName}
              onChange={(e) => setNewWorldName(e.target.value)}
              placeholder="e.g., Shattered Isles, Aethelgard..."
              className="input flex-1 text-sm"
            />
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
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Your Worlds ({savedWorlds.length})
          </h4>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {savedWorlds.map((w) => {
              const isActive = w.id === activeWorld.id
              const stageName =
                STAGES.find((s) => s.id === w.currentStage)?.name || w.currentStage
              return (
                <div
                  key={w.id}
                  className={`p-3 rounded-lg border flex flex-wrap items-center justify-between gap-3 transition-colors ${
                    isActive
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:bg-muted/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base">{w.name}</span>
                      {isActive && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Stage: {stageName} · {w.drawHistory.length} turns ·{' '}
                      {w.entities?.length || 0} entities · Updated{' '}
                      {new Date(w.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectWorld(w)
                          setEditingName(w.name)
                        }}
                        className="btn-outline px-3 py-1.5 text-xs flex items-center gap-1"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Switch</span>
                      </button>
                    )}
                    {savedWorlds.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeleteWorld(w.id)}
                        className="btn-outline px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                        title="Delete saved world"
                        aria-label={`Delete ${w.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
