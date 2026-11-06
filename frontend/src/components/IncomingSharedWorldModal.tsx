import { Globe, MapPin, Sparkles, History, Users, X } from 'lucide-react'
import { WorldState } from '../engine/types'
import { STAGES } from '../engine/deckEngine'

interface IncomingSharedWorldModalProps {
  incomingWorld: WorldState
  onAccept: () => void
  onDecline: () => void
}

export function IncomingSharedWorldModal({
  incomingWorld,
  onAccept,
  onDecline,
}: IncomingSharedWorldModalProps) {
  const stageName = STAGES.find((s) => s.id === incomingWorld.currentStage)?.name || 'Genesis'
  const historyCount = incomingWorld.drawHistory?.length || 0
  const entitiesCount = incomingWorld.entities?.length || 0
  const playerCount = incomingWorld.players?.length || 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-primary/30 bg-card shadow-2xl p-6 text-card-foreground">
        {/* Accent Banner */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <Sparkles className="h-4 w-4" />
            <span>Shared Realm Received</span>
          </div>
          <button
            type="button"
            onClick={onDecline}
            className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="my-4 space-y-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight">{incomingWorld.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Seed: <code className="font-mono text-primary">{incomingWorld.generationSettings?.seed || 'custom'}</code>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-muted/50 border border-border/40 flex items-center gap-2">
              <Globe className="h-4 w-4 text-emerald-500" />
              <div>
                <div className="text-[10px] text-muted-foreground">Current Stage</div>
                <div className="font-semibold">{stageName}</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-muted/50 border border-border/40 flex items-center gap-2">
              <History className="h-4 w-4 text-amber-500" />
              <div>
                <div className="text-[10px] text-muted-foreground">Chronicle History</div>
                <div className="font-semibold">{historyCount} {historyCount === 1 ? 'Turn' : 'Turns'}</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-muted/50 border border-border/40 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-[10px] text-muted-foreground">Codex Entities</div>
                <div className="font-semibold">{entitiesCount} Recorded</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-muted/50 border border-border/40 flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-500" />
              <div>
                <div className="text-[10px] text-muted-foreground">Table Players</div>
                <div className="font-semibold">{playerCount} Seats</div>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground pt-1">
            Loading this realm will save it into your local realm registry. Your existing saved worlds will remain safe.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-border/60">
          <button
            type="button"
            onClick={onDecline}
            className="btn-outline flex-1 py-2 text-xs font-semibold"
          >
            Keep Current & Dismiss
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="btn-primary flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Load Shared Realm</span>
          </button>
        </div>
      </div>
    </div>
  )
}
