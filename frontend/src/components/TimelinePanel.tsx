import { useState } from 'react'
import {
  Clock,
  Filter,
  Search,
  Copy,
  Download,
  Trash2,
  MapPin,
  Users,
  ArrowUpDown,
  RotateCcw,
  Printer,
  Lock,
  Unlock,
  GitBranch,
  Plus,
  BookOpen,
  Compass,
} from 'lucide-react'
import { DrawRecord, StageId, WorldEntity, WorldState } from '../engine/types'
import { DEFAULT_CARD_COLORS, STAGES, calculateEpochYear, getCardDisplay } from '../engine/deckEngine'
import { exportWorldChronicleMarkdown } from '../engine/storageService'
import { RealmSagaModal } from './RealmSagaModal'
import { classifyEventSignificance, EventSignificance } from '../engine/narrativeEngine'

interface TimelinePanelProps {
  world: WorldState
  cardColors?: Record<string, string>
  onUpdateRecord: (recordId: string, updates: Partial<DrawRecord>) => void
  onAddCustomRecord?: (record: DrawRecord) => void
  onSelectTile?: (tileId: string) => void
  onSelectEntity?: (entityId: string) => void
  onClearHistory: () => void
  onRewindToMove?: (moveId: number) => void
  onBranchFromMove?: (moveId: number) => void
  onTogglePinEvent?: (recordId: string) => void
}

export function TimelinePanel({
  world,
  cardColors = DEFAULT_CARD_COLORS,
  onUpdateRecord,
  onAddCustomRecord,
  onSelectTile,
  onSelectEntity,
  onClearHistory,
  onRewindToMove,
  onBranchFromMove,
  onTogglePinEvent,
}: TimelinePanelProps) {
  const [stageFilter, setStageFilter] = useState<StageId | 'all'>('all')
  const [entityFilter, setEntityFilter] = useState<string>('all')
  const [significanceFilter, setSignificanceFilter] = useState<EventSignificance | 'all'>('all')
  const [showSagaModal, setShowSagaModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortAsc, setSortAsc] = useState(false)
  const [coordInputs, setCoordInputs] = useState<Record<string, string>>({})
  const [unlockedRecordIds, setUnlockedRecordIds] = useState<Record<string, boolean>>({})
  const [confirmRewindMoveId, setConfirmRewindMoveId] = useState<number | null>(null)
  const [confirmClearHistory, setConfirmClearHistory] = useState(false)
  const [scrubbedMoveIndex, setScrubbedMoveIndex] = useState<number | null>(null)

  // Freeform Lore Event Adder state
  const [showAddEventForm, setShowAddEventForm] = useState(false)
  const [customTitle, setCustomTitle] = useState('')
  const [customNote, setCustomNote] = useState('')
  const [customTile, setCustomTile] = useState('')

  const filteredRecords = world.drawHistory
    .filter((rec) => {
      if (stageFilter !== 'all' && rec.stage !== stageFilter) return false
      if (
        entityFilter !== 'all' &&
        (!rec.linkedEntityIds || !rec.linkedEntityIds.includes(entityFilter))
      ) {
        return false
      }
      if (significanceFilter !== 'all') {
        const sig = classifyEventSignificance(rec)
        if (sig !== significanceFilter) return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchNote = rec.note?.toLowerCase().includes(q)
        const matchPower = rec.power?.toLowerCase().includes(q)
        const matchActionTitle = rec.actionTitle?.toLowerCase().includes(q)
        const matchEpoch = rec.epochYear?.toLowerCase().includes(q)
        const matchPlayer = rec.playerName?.toLowerCase().includes(q)
        const matchTile = rec.linkedTileIds?.some((t) => t.toLowerCase().includes(q))
        if (!matchNote && !matchPower && !matchActionTitle && !matchEpoch && !matchPlayer && !matchTile) {
          return false
        }
      }
      return true
    })
    .slice()

  if (!sortAsc) {
    filteredRecords.reverse()
  }

  const toggleUnlockRecord = (id: string) => {
    setUnlockedRecordIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleCopyText = () => {
    const text = world.drawHistory
      .map((rec) => {
        const { display } = getCardDisplay(rec.card, cardColors)
        const stageName = STAGES.find((s) => s.id === rec.stage)?.name || 'Custom'
        const epoch = rec.epochYear ? ` [${rec.epochYear}]` : ''
        const player = rec.playerName ? ` (${rec.playerName})` : ''
        const noteText = rec.note ? ` — ${rec.note}` : ''
        return `Turn #${rec.moveId}${epoch}${player} (${stageName} · ${display} ${rec.power || ''})${noteText}`
      })
      .join('\n')
    navigator.clipboard?.writeText(text)
  }

  const handleExportMarkdown = () => {
    const md = exportWorldChronicleMarkdown(world)
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${world.name.toLowerCase().replace(/\s+/g, '-')}-chronicle.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleAddTileLink = (rec: DrawRecord) => {
    const raw = (coordInputs[rec.id] || '').trim()
    if (!raw) return
    const existing = rec.linkedTileIds || []
    if (!existing.includes(raw)) {
      onUpdateRecord(rec.id, { linkedTileIds: [...existing, raw] })
    }
    setCoordInputs({ ...coordInputs, [rec.id]: '' })
  }

  const handleRemoveTileLink = (rec: DrawRecord, tileId: string) => {
    const existing = rec.linkedTileIds || []
    onUpdateRecord(rec.id, { linkedTileIds: existing.filter((id) => id !== tileId) })
  }

  const handleToggleEntityLink = (rec: DrawRecord, entityId: string) => {
    const existing = rec.linkedEntityIds || []
    const next = existing.includes(entityId)
      ? existing.filter((id) => id !== entityId)
      : [...existing, entityId]
    onUpdateRecord(rec.id, { linkedEntityIds: next })
  }

  return (
    <div className="card p-5 sm:p-6 space-y-5">
      {/* Header & Export Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Clock className="h-6 w-6 text-primary shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">World Chronicle & Timeline</h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground flex items-center gap-1">
                <Lock className="h-3 w-3" />
                <span>Past Events Protected</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {world.drawHistory.length} historical turns recorded · Past events are locked by default to prevent accidental edits (click Unlock to edit or Branch to fork a new world)
            </p>
          </div>
        </div>

        <div className="no-print flex flex-wrap items-center gap-2">
          {onAddCustomRecord && !world.isLocked && (
            <button
              type="button"
              onClick={() => setShowAddEventForm((v) => !v)}
              className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Log Custom Event</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setSortAsc(!sortAsc)}
            className="btn-outline flex items-center gap-1.5 px-3 py-1.5 text-xs"
            title="Toggle chronological order"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>{sortAsc ? 'Oldest First' : 'Newest First'}</span>
          </button>
          <button
            type="button"
            onClick={handleCopyText}
            disabled={world.drawHistory.length === 0}
            className="btn-outline flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:opacity-50"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Copy Text</span>
          </button>
          <button
            type="button"
            onClick={() => setShowSagaModal(true)}
            disabled={world.drawHistory.length === 0}
            className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            title="Synthesize and view rich narrative Realm Saga"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Realm Saga</span>
          </button>
          <button
            type="button"
            onClick={handleExportMarkdown}
            disabled={world.drawHistory.length === 0}
            className="btn-outline flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Chronicle (.md)</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            disabled={world.drawHistory.length === 0}
            className="btn-outline flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:opacity-50"
            title="Print World Chronicle"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print</span>
          </button>
          {!world.isLocked && (
            confirmClearHistory ? (
              <div className="inline-flex items-center gap-1 bg-destructive/10 border border-destructive/30 px-2 py-1 rounded text-xs">
                <span className="text-destructive font-semibold">Clear all turns?</span>
                <button
                  type="button"
                  onClick={() => {
                    onClearHistory()
                    setConfirmClearHistory(false)
                  }}
                  className="px-2 py-0.5 rounded bg-destructive text-destructive-foreground font-bold"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClearHistory(false)}
                  className="px-2 py-0.5 rounded bg-background border border-border"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClearHistory(true)}
                disabled={world.drawHistory.length === 0}
                className="btn-outline flex items-center gap-1.5 px-3 py-1.5 text-xs text-destructive disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Optional Freeform Custom Event Logger Drawer */}
      {showAddEventForm && onAddCustomRecord && (
        <div className="no-print p-4 rounded-xl border border-primary/30 bg-primary/[0.03] space-y-3 text-xs">
          <div className="font-bold text-primary flex items-center justify-between">
            <span>📜 Log Custom World Event / Activity</span>
            <button
              type="button"
              onClick={() => setShowAddEventForm(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Event Title (e.g., Founding of Silverkeep)..."
              className="input h-8 text-xs sm:col-span-2"
            />
            <input
              type="text"
              value={customTile}
              onChange={(e) => setCustomTile(e.target.value)}
              placeholder="Optional Tile (col,row)..."
              className="input h-8 text-xs"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Describe what happened in the world..."
              className="input h-8 text-xs flex-1"
            />
            <button
              type="button"
              onClick={() => {
                if (!customNote.trim() && !customTitle.trim()) return
                const moveId = world.drawHistory.length + 1
                const newRec: DrawRecord = {
                  id: `custom_${Date.now()}`,
                  moveId,
                  card: { suit: '♦', value: '★', id: `custom-${moveId}` },
                  timestamp: new Date().toISOString(),
                  stage: world.currentStage,
                  power: customTitle.trim() || 'Lore Chronicle',
                  actionTitle: customTitle.trim() || undefined,
                  note: customNote.trim(),
                  linkedTileIds: customTile.trim() ? [customTile.trim()] : [],
                  linkedEntityIds: [],
                  epochYear: calculateEpochYear(world.currentStage, moveId),
                }
                onAddCustomRecord(newRec)
                setCustomTitle('')
                setCustomNote('')
                setCustomTile('')
                setShowAddEventForm(false)
              }}
              className="btn-primary px-4 h-8 text-xs font-bold shrink-0"
            >
              Save Event
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="no-print grid grid-cols-1 md:grid-cols-3 gap-3 bg-muted/40 p-3 rounded-lg">
        <div className="relative">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events, powers, players, notes, tiles..."
            className="input w-full pl-9 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <select
            aria-label="Filter by Stage"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as StageId | 'all')}
            className="input w-full text-xs h-9"
          >
            <option value="all">All Stages & Ages</option>
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.number}. {s.name} ({s.eraLabel})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground shrink-0" />
          <select
            aria-label="Filter by Entity"
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="input w-full text-xs h-9"
          >
            <option value="all">All Species, Civilizations & Myths</option>
            {world.entities.map((ent: WorldEntity) => (
              <option key={ent.id} value={ent.id}>
                {ent.icon || ''} {ent.name} ({ent.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Interactive Epoch Scrubber & Turn-by-Turn Replay */}
      <div className="no-print p-3 rounded-xl bg-muted/40 border border-border/60 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-primary">
            <Compass className="h-3.5 w-3.5" />
            <span>Interactive Epoch &amp; Turn Replay Scrubber</span>
          </span>
          <span className="text-[11px] font-mono text-muted-foreground">
            {stageFilter === 'all' ? 'All Eras Visible' : `${stageFilter.toUpperCase()} Focus`}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {STAGES.map((s) => {
            const count = world.drawHistory.filter((r) => r.stage === s.id).length
            const isSelected = stageFilter === s.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStageFilter(isSelected ? 'all' : s.id)}
                className={`p-2 rounded-lg text-left border transition-all text-xs ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background/80 hover:bg-muted text-muted-foreground border-border/60'
                }`}
              >
                <div className="font-bold truncate">{s.number}. {s.name}</div>
                <div className="text-[10px] opacity-80">{count} {count === 1 ? 'Turn' : 'Turns'}</div>
              </button>
            )
          })}
        </div>

        {/* Phase 25: Step-by-Step Turn Scrubber & Spotlight Replay */}
        {world.drawHistory.length > 0 && (
          <div
            data-testid="chronicle-turn-scrubber"
            className="pt-2 border-t border-border/60 space-y-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  data-testid="scrubber-first-turn-btn"
                  onClick={() => setScrubbedMoveIndex(0)}
                  className="px-2 py-1 rounded bg-background border border-border hover:bg-muted text-[11px] font-semibold"
                  title="Jump to Turn #1"
                >
                  ⏮️ #1
                </button>
                <button
                  type="button"
                  data-testid="scrubber-prev-turn-btn"
                  onClick={() =>
                    setScrubbedMoveIndex((prev) =>
                      prev === null
                        ? Math.max(0, world.drawHistory.length - 1)
                        : Math.max(0, prev - 1)
                    )
                  }
                  className="px-2 py-1 rounded bg-background border border-border hover:bg-muted text-[11px] font-semibold"
                >
                  ◀️ Prev
                </button>
                <button
                  type="button"
                  data-testid="scrubber-next-turn-btn"
                  onClick={() =>
                    setScrubbedMoveIndex((prev) =>
                      prev === null
                        ? 0
                        : Math.min(world.drawHistory.length - 1, prev + 1)
                    )
                  }
                  className="px-2 py-1 rounded bg-background border border-border hover:bg-muted text-[11px] font-semibold"
                >
                  Next ▶️
                </button>
                {scrubbedMoveIndex !== null && (
                  <button
                    type="button"
                    data-testid="scrubber-clear-btn"
                    onClick={() => setScrubbedMoveIndex(null)}
                    className="px-2 py-1 rounded bg-primary/15 text-primary border border-primary/30 text-[11px] font-semibold"
                  >
                    ⏭️ Show All ({world.drawHistory.length})
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-1 max-w-xs">
                <input
                  type="range"
                  aria-label="Turn Replay Scrubber"
                  min={0}
                  max={Math.max(0, world.drawHistory.length - 1)}
                  value={
                    scrubbedMoveIndex !== null
                      ? scrubbedMoveIndex
                      : Math.max(0, world.drawHistory.length - 1)
                  }
                  onChange={(e) => setScrubbedMoveIndex(parseInt(e.target.value, 10))}
                  className="w-full accent-primary cursor-pointer"
                />
                <span className="text-[11px] font-mono font-bold text-primary shrink-0">
                  {scrubbedMoveIndex !== null
                    ? `Turn #${scrubbedMoveIndex + 1}/${world.drawHistory.length}`
                    : `${world.drawHistory.length} Turns`}
                </span>
              </div>
            </div>

            {scrubbedMoveIndex !== null && world.drawHistory[scrubbedMoveIndex] && (() => {
              const spot = world.drawHistory[scrubbedMoveIndex]
              const isPinned = (world.twoPagerConfig?.pinnedEventIds || []).includes(spot.id)
              return (
                <div
                  data-testid="scrubber-active-turn-card"
                  className="p-3 rounded-xl bg-background border-2 border-primary/40 shadow-2xs flex flex-wrap items-center justify-between gap-2 text-xs animate-in fade-in duration-150"
                >
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-primary text-primary-foreground font-bold text-[11px]">
                        Spotlight Turn #{spot.moveId}
                      </span>
                      <span className="font-bold">
                        [{spot.card.value}{spot.card.suit}] {spot.actionTitle || spot.power}
                      </span>
                      {spot.epochYear && (
                        <span className="text-[11px] text-muted-foreground font-mono">
                          ({spot.epochYear})
                        </span>
                      )}
                    </div>
                    {spot.note && (
                      <p className="text-foreground/90 text-[11px] leading-snug">{spot.note}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {spot.linkedTileIds?.map((tid) => (
                      <button
                        key={tid}
                        type="button"
                        onClick={() => onSelectTile?.(tid)}
                        className="px-2 py-1 rounded bg-primary/10 text-primary font-mono text-[11px] hover:underline"
                      >
                        📍 ({tid})
                      </button>
                    ))}
                    {onTogglePinEvent && (
                      <button
                        type="button"
                        onClick={() => onTogglePinEvent(spot.id)}
                        className={`px-2 py-1 rounded border text-[11px] font-semibold ${
                          isPinned
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        📌 {isPinned ? 'Pinned to 2-Pager' : 'Pin to 2-Pager'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* Event Significance Filter Pills */}
      <div className="no-print flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-muted-foreground font-medium text-[11px] mr-1">Event Type:</span>
        {(['all', 'creation', 'expansion', 'conflict', 'diplomacy', 'cataclysm'] as const).map((sig) => {
          const isSelected = significanceFilter === sig
          const labels = {
            all: 'All Events',
            creation: 'Creation 🌍',
            expansion: 'Expansion 🏛️',
            conflict: 'Conflicts ⚔️',
            diplomacy: 'Diplomacy 📜',
            cataclysm: 'Cataclysms 🔥',
          }
          return (
            <button
              key={sig}
              type="button"
              onClick={() => setSignificanceFilter(sig)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background hover:bg-muted text-muted-foreground border-border'
              }`}
            >
              {labels[sig]}
            </button>
          )
        })}
      </div>

      {/* Timeline Entries */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-lg">
          <p className="text-sm">
            {world.drawHistory.length === 0
              ? 'No cards drawn yet. Draw a card or run Auto-Play to weave your world’s history!'
              : 'No timeline events match your active filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
          {filteredRecords.map((record) => {
            const { display, color } = getCardDisplay(record.card, cardColors)
            const stageObj = STAGES.find((s) => s.id === record.stage)
            const isLatestTurn = record.moveId === world.drawHistory.length
            const isUnlocked =
              !world.isLocked && (isLatestTurn || Boolean(unlockedRecordIds[record.id]))

            return (
              <div
                key={record.id}
                className={`p-4 border rounded-lg space-y-2.5 transition-colors ${
                  isLatestTurn
                    ? 'bg-primary/[0.03] border-primary/40'
                    : 'bg-muted/30 border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-bold">
                      Turn #{record.moveId}
                    </span>
                    <span className={`text-2xl font-bold ${color}`}>{display}</span>
                    <div>
                      <div className="font-semibold text-sm flex flex-wrap items-center gap-2">
                        <span>{record.power || 'Card Draw'}</span>
                        {record.actionTitle && (
                          <span className="text-xs px-2 py-0.5 rounded bg-primary/15 text-primary font-semibold">
                            ✦ {record.actionTitle}
                          </span>
                        )}
                        {stageObj && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-background border border-border text-muted-foreground">
                            {stageObj.number}. {stageObj.name}
                          </span>
                        )}
                        {record.playerName && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
                            style={{
                              backgroundColor: record.playerColor || '#3b82f6',
                            }}
                          >
                            {record.playerName}
                            {record.isAutoPlayed ? ' (Bot)' : ''}
                          </span>
                        )}
                      </div>
                      {record.epochYear && (
                        <div className="text-xs text-muted-foreground">{record.epochYear}</div>
                      )}
                    </div>
                  </div>

                  {/* Safe Turn Actions: Pin to 2-Pager, Unlock Edit, Non-Destructive Branch New World, and Guarded Rewind */}
                  <div className="no-print flex flex-wrap items-center gap-1.5">
                    {onTogglePinEvent && (
                      <button
                        type="button"
                        data-testid={`timeline-pin-event-${record.id}`}
                        onClick={() => onTogglePinEvent(record.id)}
                        className={`px-2 py-1 rounded border text-[11px] font-medium flex items-center gap-1 transition-colors ${
                          (world.twoPagerConfig?.pinnedEventIds || []).includes(record.id)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-border text-muted-foreground hover:text-foreground'
                        }`}
                        title="Pin this historical turn to Page 2 of the 2-Page World Overview"
                      >
                        <span>📌</span>
                        <span>
                          {(world.twoPagerConfig?.pinnedEventIds || []).includes(record.id)
                            ? 'Pinned'
                            : 'Pin 2-Pager'}
                        </span>
                      </button>
                    )}

                    {!world.isLocked && !isLatestTurn && (
                      <button
                        type="button"
                        onClick={() => toggleUnlockRecord(record.id)}
                        className={`px-2 py-1 rounded border text-[11px] font-medium flex items-center gap-1 transition-colors ${
                          isUnlocked
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-border text-muted-foreground hover:text-foreground'
                        }`}
                        title={
                          isUnlocked
                            ? 'Lock this past turn to prevent accidental edits'
                            : 'Unlock this past turn to edit its note or links'
                        }
                      >
                        {isUnlocked ? (
                          <>
                            <Unlock className="h-3 w-3" />
                            <span>Editing</span>
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3" />
                            <span>Unlock Edit</span>
                          </>
                        )}
                      </button>
                    )}

                    {onBranchFromMove && !isLatestTurn && (
                      <button
                        type="button"
                        onClick={() => onBranchFromMove(record.moveId)}
                        className="px-2.5 py-1 rounded border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 text-[11px] font-semibold flex items-center gap-1"
                        title={`Create a new saved world branched at Turn #${record.moveId} without modifying "${world.name}"`}
                      >
                        <GitBranch className="h-3 w-3" />
                        <span>Branch New World</span>
                      </button>
                    )}

                    {onRewindToMove && !isLatestTurn && !world.isLocked && (
                      confirmRewindMoveId === record.moveId ? (
                        <div className="inline-flex items-center gap-1 bg-amber-500/15 border border-amber-500/40 px-2 py-0.5 rounded text-[11px]">
                          <span className="font-semibold">Rewind to #{record.moveId}?</span>
                          <button
                            type="button"
                            onClick={() => {
                              onRewindToMove(record.moveId)
                              setConfirmRewindMoveId(null)
                            }}
                            className="px-1.5 py-0.5 rounded bg-primary text-primary-foreground font-bold"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmRewindMoveId(null)}
                            className="px-1.5 py-0.5 rounded bg-background border border-border"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmRewindMoveId(record.moveId)}
                          className="btn-outline px-2 py-1 text-[11px] flex items-center gap-1"
                          title={`Rewind current world to Turn #${record.moveId}`}
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Rewind</span>
                        </button>
                      )
                    )}
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Slot Modifications & Diplomatic Lineage */}
                {((record.slotChanges && record.slotChanges.length > 0) ||
                  record.relationshipCreated) && (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    {record.slotChanges?.map((change, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-background border border-border text-[11px] font-medium"
                      >
                        {change.slotIcon} +{change.slotName} ({change.tileId})
                      </span>
                    ))}
                    {record.relationshipCreated && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[11px] font-semibold">
                        {record.relationshipCreated.icon} {record.relationshipCreated.label}
                      </span>
                    )}
                  </div>
                )}

                {/* Narrative Title & Note (Read-Only for past turns unless unlocked!) */}
                <div className="space-y-1.5">
                  {isUnlocked && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                        Event / Action Title:
                      </span>
                      <input
                        type="text"
                        aria-label={`Edit Turn #${record.moveId} Action Title`}
                        value={record.actionTitle || ''}
                        onChange={(e) => {
                          if (!isUnlocked) return
                          onUpdateRecord(record.id, { actionTitle: e.target.value })
                        }}
                        placeholder="Event or preset title (e.g., Jagged Mountain Range, Treaty of Ash)..."
                        className="input h-7 text-xs flex-1"
                      />
                    </div>
                  )}
                  <textarea
                    value={record.note || ''}
                    readOnly={!isUnlocked}
                    onChange={(e) => {
                      if (!isUnlocked) return
                      onUpdateRecord(record.id, { note: e.target.value })
                    }}
                    placeholder={
                      isUnlocked
                        ? 'Chronicle what happened in the world during this turn...'
                        : 'No chronicle note recorded for this turn.'
                    }
                    className={`input w-full text-xs sm:text-sm min-h-[50px] ${
                      !isUnlocked
                        ? 'bg-background/50 cursor-default border-border/50 text-foreground/90'
                        : ''
                    }`}
                  />
                </div>

                {/* Spatial & Entity Linkages */}
                <div className="no-print flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border/60 text-xs">
                  {/* Linked Map Coordinates */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-muted-foreground flex items-center gap-1 font-medium">
                      <MapPin className="h-3.5 w-3.5" />
                      Tiles:
                    </span>
                    {(record.linkedTileIds || []).map((tId) => (
                      <span
                        key={tId}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-background border border-border hover:border-primary font-mono text-[11px]"
                      >
                        <button
                          type="button"
                          onClick={() => onSelectTile?.(tId)}
                          className="hover:text-primary hover:underline"
                          title={`Inspect Tile (${tId}) on Map`}
                        >
                          ({tId})
                        </button>
                        {isUnlocked && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTileLink(record, tId)}
                            className="hover:text-destructive"
                            aria-label={`Unlink tile ${tId}`}
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                    {isUnlocked && (
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="text"
                          value={coordInputs[record.id] || ''}
                          onChange={(e) =>
                            setCoordInputs({ ...coordInputs, [record.id]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddTileLink(record)
                            }
                          }}
                          placeholder="col,row"
                          className="input h-6 w-16 px-1.5 text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddTileLink(record)}
                          className="btn-outline h-6 px-2 text-[11px]"
                        >
                          + Tile
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Linked Entities */}
                  {world.entities.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-muted-foreground font-medium">Codex:</span>
                      {world.entities.map((ent) => {
                        const isLinked = (record.linkedEntityIds || []).includes(ent.id)
                        if (!isUnlocked && !isLinked) return null
                        return (
                          <button
                            key={ent.id}
                            type="button"
                            onClick={() => {
                              if (isUnlocked) {
                                handleToggleEntityLink(record, ent.id)
                              } else {
                                onSelectEntity?.(ent.id)
                              }
                            }}
                            className={`px-2 py-0.5 rounded-full text-[11px] border transition-colors ${
                              isLinked
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background border-border text-muted-foreground hover:text-foreground'
                            }`}
                            title={
                              isUnlocked
                                ? `Toggle link to ${ent.name}`
                                : `Inspect ${ent.name} in Codex`
                            }
                          >
                            {ent.icon} {ent.name}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
      {/* Realm Saga Synthesizer Modal */}
      <RealmSagaModal
        isOpen={showSagaModal}
        world={world}
        onClose={() => setShowSagaModal(false)}
      />
    </div>
  )
}
