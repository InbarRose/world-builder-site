import { useState } from 'react'
import { X, Sparkles, ArrowRight, Award, Compass, Scroll } from 'lucide-react'
import { StageId, WorldState } from '../engine/types'
import { STAGES, getNextStage } from '../engine/deckEngine'
import { computeEntityAchievements } from '../engine/narrativeEngine'
import { playStageAdvanceSound, triggerHapticFeedback } from '../engine/soundEngine'

interface EpochCeremonyModalProps {
  isOpen: boolean
  currentStage: StageId
  world: WorldState
  onClose: () => void
  onAdvanceStage: (nextStage: StageId, epilogueNote?: string) => void
}

export function EpochCeremonyModal({
  isOpen,
  currentStage,
  world,
  onClose,
  onAdvanceStage,
}: EpochCeremonyModalProps) {
  const [epilogueNote, setEpilogueNote] = useState('')

  if (!isOpen) return null

  const currentStageData = STAGES.find((s) => s.id === currentStage) || STAGES[0]
  const nextStageId = getNextStage(currentStage)
  const nextStageData = nextStageId ? STAGES.find((s) => s.id === nextStageId) : null

  // Turns recorded in this current era
  const eraTurns = world.drawHistory.filter((r) => r.stage === currentStage)
  const achievements = computeEntityAchievements(world)
  const totalFeatsCount = Object.values(achievements).reduce((sum, feats) => sum + feats.length, 0)

  const handleConfirmAdvance = () => {
    if (!nextStageId) return
    playStageAdvanceSound()
    triggerHapticFeedback('celebration')
    onAdvanceStage(nextStageId, epilogueNote.trim() || undefined)
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Age Advancement Ceremony"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-card border border-amber-500/40 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-border/80 bg-amber-500/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-500">
              <Scroll className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Epoch Advancement Ceremony
              </h2>
              <p className="text-xs text-muted-foreground">
                Conclude the current age and herald the dawn of a new historical epoch.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm">
          {/* Era Transition Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-primary/10 to-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 text-center">
            <div className="flex-1 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Departing Era
              </span>
              <div className="font-bold text-base text-foreground">
                {currentStageData.number}. {currentStageData.name}
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">
                {currentStageData.eraLabel}
              </div>
            </div>

            <div className="p-2 rounded-full bg-background border border-border text-primary shadow-xs">
              <ArrowRight className="h-5 w-5" />
            </div>

            <div className="flex-1 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Incoming Dawn
              </span>
              <div className="font-bold text-base text-primary">
                {nextStageData ? `${nextStageData.number}. ${nextStageData.name}` : 'Eternal Cycle'}
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">
                {nextStageData ? nextStageData.eraLabel : 'Realm Completed'}
              </div>
            </div>
          </div>

          {/* Era Retrospective Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                <Compass className="h-3.5 w-3.5 text-primary" />
                <span>Events Recorded</span>
              </div>
              <div className="text-xl font-black">{eraTurns.length} Turns</div>
              <div className="text-[11px] text-muted-foreground">in {currentStageData.name}</div>
            </div>

            <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                <Award className="h-3.5 w-3.5 text-amber-500" />
                <span>Deeds Consecrated</span>
              </div>
              <div className="text-xl font-black">{totalFeatsCount} Historical Feats</div>
              <div className="text-[11px] text-muted-foreground">across realm codex</div>
            </div>
          </div>

          {/* Incoming Era Description */}
          {nextStageData && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                The Herald of {nextStageData.name}
              </span>
              <p className="p-3 rounded-lg bg-muted/20 border border-border/80 text-xs text-muted-foreground leading-relaxed font-serif">
                {nextStageData.eraLabel}
              </p>
            </div>
          )}

          {/* Epilogue Inscription */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Inscribe Epoch Epilogue (Optional):
            </label>
            <textarea
              value={epilogueNote}
              onChange={(e) => setEpilogueNote(e.target.value)}
              placeholder="What legacy does this age leave behind as centuries roll into the new dawn?"
              rows={2}
              className="input w-full text-xs font-serif leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/80 bg-muted/30 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-outline px-4 py-2 text-xs font-medium"
          >
            Remain in {currentStageData.name}
          </button>
          <button
            type="button"
            onClick={handleConfirmAdvance}
            className="btn-primary px-5 py-2 text-xs font-bold flex items-center gap-2 shadow-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black border-amber-400"
          >
            <Sparkles className="h-4 w-4" />
            <span>Ascend to {nextStageData ? nextStageData.name : 'Next Era'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
