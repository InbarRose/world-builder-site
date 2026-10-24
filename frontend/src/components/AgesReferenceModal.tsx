import { BookOpen, ExternalLink, X } from 'lucide-react'
import { STAGES, STAGE_POWERS, STAGE_PRE_SETUP } from '../engine/deckEngine'
import { StageId } from '../engine/types'

interface AgesReferenceModalProps {
  isOpen: boolean
  currentStage: StageId
  onClose: () => void
  onSelectStage?: (stageId: StageId) => void
}

export function AgesReferenceModal({
  isOpen,
  currentStage,
  onClose,
  onSelectStage,
}: AgesReferenceModalProps) {
  if (!isOpen) return null

  const getStageRulesUrl = (stageId: string, powerId?: string) => {
    const baseUrl = '/rules'
    if (powerId) {
      return `${baseUrl}#${encodeURIComponent(powerId)}`
    }
    const stageMap: Record<string, string> = {
      genesis: '1.-genesis',
      primal: '2.-primal',
      civilization: '3.-civilization',
      intrigue: '4.-intrigue',
    }
    return `${baseUrl}#${stageMap[stageId] || stageId}`
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="All 4 Ages Reference Matrix"
    >
      <div className="card p-6 max-w-4xl w-full max-h-[92vh] overflow-y-auto space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Abilities & Suit Powers Through the 4 Ages</h3>
              <p className="text-xs text-muted-foreground">
                Compare how Spades (♠), Hearts (♥), Clubs (♣), and Diamonds (♦) evolve across each era
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-accent rounded-md"
            aria-label="Close Ages Reference"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STAGES.map((st) => {
            const isCurrent = st.id === currentStage
            const suits = STAGE_POWERS[st.id] || {}

            return (
              <div
                key={st.id}
                className={`p-3.5 rounded-lg border space-y-2.5 flex flex-col justify-between ${
                  isCurrent
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border bg-card'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold">
                        {st.number}. {st.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{st.eraLabel}</div>
                    </div>
                    {isCurrent ? (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                        Current
                      </span>
                    ) : onSelectStage ? (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectStage(st.id)
                          onClose()
                        }}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded border border-border hover:bg-accent"
                      >
                        Switch
                      </button>
                    ) : null}
                  </div>

                  <p className="text-[11px] text-muted-foreground bg-muted/50 p-2 rounded leading-relaxed">
                    <strong>Pre-Stage:</strong> {STAGE_PRE_SETUP[st.id]}
                  </p>

                  <div className="space-y-1.5">
                    {Object.entries(suits).map(([suit, power]) => (
                      <div
                        key={suit}
                        className="flex items-center justify-between text-xs p-1.5 rounded bg-muted/30 border border-border/60"
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-bold text-sm ${
                              suit === '♥' || suit === '♦' ? 'text-red-500' : ''
                            }`}
                          >
                            {suit}
                          </span>
                          <span className="font-semibold">{power.name}</span>
                        </div>
                        <a
                          href={getStageRulesUrl(st.id, power.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                          title={`Rules for ${power.name}`}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
