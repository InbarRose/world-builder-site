import React, { useState, useEffect } from 'react'
import {
  Camera,
  X,
  RotateCcw,
  Download,
  Trash2,
  Clock,
  Layers,
  Users,
  AlertTriangle,
  BookmarkPlus,
} from 'lucide-react'
import { WorldState } from '../engine/types'
import {
  WorldCheckpoint,
  listWorldCheckpoints,
  saveWorldCheckpoint,
  deleteWorldCheckpoint,
  clearWorldCheckpoints,
  restoreWorldFromCheckpoint,
  exportCheckpointAsJson,
  getCheckpointTriggerBadge,
  createWorldCheckpoint,
} from '../engine/snapshotVaultEngine'

interface SessionVaultModalProps {
  isOpen: boolean
  onClose: () => void
  world: WorldState
  onRestoreWorld: (restored: WorldState) => void
  onNotify?: (msg: string) => void
}

export const SessionVaultModal: React.FC<SessionVaultModalProps> = ({
  isOpen,
  onClose,
  world,
  onRestoreWorld,
  onNotify,
}) => {
  const [checkpoints, setCheckpoints] = useState<WorldCheckpoint[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null)
  const [filterTrigger, setFilterTrigger] = useState<string>('all')

  const refreshList = () => {
    if (world?.id) {
      setCheckpoints(listWorldCheckpoints(world.id))
    }
  }

  useEffect(() => {
    if (isOpen && world?.id) {
      refreshList()
      setConfirmRestoreId(null)
    }
  }, [isOpen, world?.id])

  if (!isOpen) return null

  const handleCreateManualCheckpoint = (e: React.FormEvent) => {
    e.preventDefault()
    if (!world) return

    const title = newTitle.trim() || `Turn #${world.drawHistory?.length || 0} Checkpoint`
    const lastCheckpoint = checkpoints.length > 0 ? checkpoints[0] : null
    const created = createWorldCheckpoint(
      world,
      title,
      newDesc.trim(),
      'manual',
      lastCheckpoint
    )

    saveWorldCheckpoint(created)
    setNewTitle('')
    setNewDesc('')
    refreshList()
    onNotify?.(`Saved checkpoint: "${title}"`)
  }

  const handleRestore = (chk: WorldCheckpoint) => {
    const restored = restoreWorldFromCheckpoint(chk)
    onRestoreWorld(restored)
    setConfirmRestoreId(null)
    onNotify?.(`Restored world to "${chk.title}" (Turn #${chk.turnNumber})`)
    onClose()
  }

  const handleDelete = (chkId: string) => {
    if (!world?.id) return
    deleteWorldCheckpoint(world.id, chkId)
    refreshList()
  }

  const handleClearAll = () => {
    if (!world?.id) return
    if (window.confirm('Delete all stored checkpoints for this world?')) {
      clearWorldCheckpoints(world.id)
      refreshList()
      onNotify?.('Cleared all session checkpoints.')
    }
  }

  const handleDownloadCheckpointJson = (chk: WorldCheckpoint) => {
    const jsonStr = exportCheckpointAsJson(chk)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const safeTitle = chk.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    a.download = `${world.name || 'world'}_chk_t${chk.turnNumber}_${safeTitle}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filteredCheckpoints = checkpoints.filter((c) => {
    if (filterTrigger === 'all') return true
    return c.triggerType === filterTrigger
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Session Checkpoint Vault"
      data-testid="session-vault-modal"
    >
      <div className="bg-card border border-border rounded-xl shadow-2xl max-w-4xl w-full p-6 space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                Session Checkpoint Vault
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                  {checkpoints.length} Snapshots
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Disaster recovery, era milestones & branching checkpoints for single-PC tabletop facilitators.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
            aria-label="Close"
            data-testid="close-vault-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create Manual Checkpoint Card */}
        <div className="bg-muted/40 border border-border/80 rounded-lg p-4 flex-shrink-0">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-foreground">
            <BookmarkPlus className="w-4 h-4 text-primary" />
            Create Immediate Checkpoint
          </h3>
          <form onSubmit={handleCreateManualCheckpoint} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Checkpoint Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={`e.g. Turn #${world.drawHistory?.length || 0} — Before Awakening the Dragon`}
                  className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  data-testid="snapshot-title-input"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Table Note / Context (Optional)
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Table agreed on eastern migration before storm"
                  className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  data-testid="snapshot-desc-input"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-1.5 shadow-sm"
                data-testid="create-checkpoint-btn"
              >
                <Camera className="w-3.5 h-3.5" />
                📸 Save Checkpoint
              </button>
            </div>
          </form>
        </div>

        {/* Filter Bar & Controls */}
        <div className="flex items-center justify-between gap-2 flex-shrink-0 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-muted-foreground font-medium mr-1">Filter:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'manual', label: 'Manual' },
              { id: 'era_transition', label: 'Era Transitions' },
              { id: 'cataclysm', label: 'Cataclysms' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterTrigger(f.id)}
                className={`px-2.5 py-1 rounded-md border transition-colors ${
                  filterTrigger === f.id
                    ? 'bg-primary/20 text-primary border-primary/40 font-medium'
                    : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {checkpoints.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
              data-testid="clear-vault-btn"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </button>
          )}
        </div>

        {/* Checkpoints Timeline List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredCheckpoints.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg p-6 space-y-2">
              <Clock className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm font-medium text-muted-foreground">
                No checkpoints stored yet.
              </p>
              <p className="text-xs text-muted-foreground/80 max-w-sm mx-auto">
                Checkpoints are created automatically on era transitions and cataclysms, or manually at any point using the form above.
              </p>
            </div>
          ) : (
            filteredCheckpoints.map((chk) => {
              const badge = getCheckpointTriggerBadge(chk.triggerType)
              const isConfirming = confirmRestoreId === chk.id
              const dateStr = new Date(chk.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })

              return (
                <div
                  key={chk.id}
                  className="bg-card border border-border/80 rounded-lg p-3.5 hover:border-border transition-colors space-y-2.5"
                  data-testid="checkpoint-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${badge.badgeClass}`}
                        >
                          <span>{badge.icon}</span>
                          <span>{badge.label}</span>
                        </span>
                        <h4 className="text-sm font-bold text-foreground">
                          {chk.title}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          Turn #{chk.turnNumber} ({chk.stage})
                        </span>
                      </div>
                      {chk.description && (
                        <p className="text-xs text-muted-foreground italic">
                          "{chk.description}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleDownloadCheckpointJson(chk)}
                        title="Download JSON Snapshot"
                        className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted text-xs flex items-center gap-1 border border-border/60"
                        data-testid="download-checkpoint-json-btn"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">JSON</span>
                      </button>
                      <button
                        onClick={() => handleDelete(chk.id)}
                        title="Delete Checkpoint"
                        className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-muted text-xs border border-border/60"
                        data-testid="delete-checkpoint-btn"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Diff & Metrics Strip */}
                  <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/40 text-xs">
                    <div className="flex items-center gap-3 text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        {dateStr}
                      </span>
                      {chk.diffFromPrevious && (
                        <>
                          <span className="flex items-center gap-1 text-primary">
                            <Layers className="w-3 h-3" />
                            {chk.diffFromPrevious.tilesChanged} tiles changed
                          </span>
                          {chk.diffFromPrevious.entitiesAdded > 0 && (
                            <span className="flex items-center gap-1 text-emerald-400">
                              <Users className="w-3 h-3" />
                              +{chk.diffFromPrevious.entitiesAdded} entities
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Restore Action */}
                    <div>
                      {isConfirming ? (
                        <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-md">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                          <span className="text-xs font-semibold text-rose-400">
                            Confirm revert?
                          </span>
                          <button
                            onClick={() => handleRestore(chk)}
                            className="px-2 py-0.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded"
                            data-testid="confirm-restore-btn"
                          >
                            Yes, Restore
                          </button>
                          <button
                            onClick={() => setConfirmRestoreId(null)}
                            className="px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmRestoreId(chk.id)}
                          className="px-3 py-1 text-xs font-semibold rounded-md border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1 transition-colors"
                          data-testid="restore-checkpoint-btn"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Restore State
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border pt-3 flex-shrink-0 text-xs text-muted-foreground">
          <span>
            Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[11px]">Alt+S</kbd> to open this vault anytime.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-muted hover:bg-muted/80 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
