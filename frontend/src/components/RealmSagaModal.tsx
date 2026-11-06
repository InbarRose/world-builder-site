import { useState } from 'react'
import {
  BookOpen,
  Copy,
  Printer,
  Sparkles,
  X,
  Crown,
  Check,
  Flame,
  Swords,
  Scroll,
  Building,
} from 'lucide-react'
import { WorldState } from '../engine/types'
import { RealmSaga, synthesizeRealmSaga } from '../engine/narrativeEngine'

interface RealmSagaModalProps {
  isOpen: boolean
  world: WorldState
  onClose: () => void
}

export function RealmSagaModal({ isOpen, world, onClose }: RealmSagaModalProps) {
  const [copied, setCopied] = useState(false)
  const [selectedChapterIdx, setSelectedChapterIdx] = useState<number | 'all'>('all')

  if (!isOpen) return null

  const saga: RealmSaga = synthesizeRealmSaga(world)

  const handleCopyMarkdown = () => {
    const lines: string[] = []
    lines.push(`# The Saga of ${saga.realmName}`)
    lines.push(`*Seed: ${saga.worldSeed} · Total Turns: ${saga.totalTurns}*`)
    lines.push('')
    lines.push(saga.overallSummary)
    lines.push('')

    for (const ch of saga.chapters) {
      lines.push(`## ${ch.stageName}: ${ch.title} (${ch.epochRange})`)
      lines.push(ch.summary)
      lines.push('')
      for (const ev of ch.events) {
        lines.push(`- **Turn #${ev.moveId} [${ev.epochYear}]** ${ev.title}: ${ev.note}`)
      }
      lines.push('')
    }

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const displayedChapters =
    selectedChapterIdx === 'all'
      ? saga.chapters
      : [saga.chapters[selectedChapterIdx]]

  const getSignificanceIcon = (sig: string) => {
    switch (sig) {
      case 'cataclysm':
        return <Flame className="h-3.5 w-3.5 text-amber-500" />
      case 'conflict':
        return <Swords className="h-3.5 w-3.5 text-red-500" />
      case 'diplomacy':
        return <Scroll className="h-3.5 w-3.5 text-emerald-500" />
      case 'expansion':
        return <Building className="h-3.5 w-3.5 text-indigo-500" />
      default:
        return <Sparkles className="h-3.5 w-3.5 text-blue-500" />
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-label="Realm Saga Modal"
    >
      <div className="relative w-full max-w-3xl rounded-2xl border border-border bg-card shadow-2xl p-6 text-card-foreground max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif">The Saga of {saga.realmName}</h2>
              <p className="text-xs text-muted-foreground">
                Synthesized emergent history across {saga.totalTurns} campaign turns
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Saga Modal"
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dominant Faction Banner (if present) */}
        {saga.dominantFaction && (
          <div className="my-3 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200 shrink-0">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-500" />
              <span className="font-semibold">Sovereign Realm:</span>
              <span>{saga.dominantFaction} held the greatest territorial dominion.</span>
            </div>
            <span className="text-[10px] font-mono uppercase bg-amber-500/20 px-2 py-0.5 rounded-full font-bold">
              Dominant Hegemon
            </span>
          </div>
        )}

        {/* Chapter Selection Bar */}
        <div className="flex items-center gap-1.5 my-2 border-b border-border/50 pb-2 text-xs shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedChapterIdx('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedChapterIdx === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Full Saga
          </button>
          {saga.chapters.map((ch, idx) => (
            <button
              key={ch.stageId}
              type="button"
              onClick={() => setSelectedChapterIdx(idx)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedChapterIdx === idx
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {ch.stageName} ({ch.events.length})
            </button>
          ))}
        </div>

        {/* Saga Body Content */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6 my-2">
          {selectedChapterIdx === 'all' && (
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60">
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-serif italic">
                "{saga.overallSummary}"
              </p>
            </div>
          )}

          {displayedChapters.map((ch) => (
            <section key={ch.stageId} className="space-y-3">
              <div className="border-b border-border/60 pb-1.5">
                <span className="text-[11px] font-mono uppercase text-primary font-bold tracking-wider">
                  {ch.stageName} · {ch.epochRange}
                </span>
                <h3 className="text-lg font-bold font-serif tracking-tight text-foreground">
                  {ch.title}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-serif">
                {ch.summary}
              </p>

              {/* Event Timeline Entries */}
              {ch.events.length > 0 && (
                <div className="space-y-2 pt-1">
                  {ch.events.map((ev) => (
                    <div
                      key={ev.moveId}
                      className="p-3 rounded-xl border border-border/50 bg-background/60 hover:bg-muted/40 transition-colors space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                          {getSignificanceIcon(ev.significance)}
                          <span>Turn #{ev.moveId}: {ev.title}</span>
                        </div>
                        <span className="font-mono text-muted-foreground">{ev.epochYear}</span>
                      </div>
                      {ev.note && (
                        <p className="text-muted-foreground leading-relaxed pl-5">
                          {ev.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border/70 shrink-0 text-xs">
          <span className="text-muted-foreground">
            {saga.chapters.reduce((sum, c) => sum + c.events.length, 0)} events recorded in saga
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="btn-outline px-3 py-1.5 flex items-center gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Saga</span>
            </button>
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="btn-primary px-3 py-1.5 flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
