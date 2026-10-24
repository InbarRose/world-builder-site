import { useState } from 'react'
import { Users, UserPlus, Trash2, X, Sliders } from 'lucide-react'
import { BotPersonalityId, BotPersonalityWeights, PlayerRole, PlayerSeat } from '../engine/types'
import { BOT_PERSONALITIES, getEffectiveBotWeights } from '../engine/presets'

interface PlayerRosterModalProps {
  isOpen: boolean
  players: PlayerSeat[]
  currentPlayerIndex: number
  onClose: () => void
  onAddPlayerSeat: () => void
  onUpdatePlayerSeat: (seatId: string, updates: Partial<PlayerSeat>) => void
  onRemovePlayerSeat: (seatId: string) => void
}

const ROLES: PlayerRole[] = ['Artist', 'Historian', 'Keeper', 'Player']

const WEIGHT_LABELS: { key: keyof BotPersonalityWeights; label: string; icon: string }[] = [
  { key: 'geography', label: 'Geography', icon: '🏔️' },
  { key: 'ecology', label: 'Ecology', icon: '🌿' },
  { key: 'civilization', label: 'Civilization', icon: '🏛️' },
  { key: 'diplomacy', label: 'Diplomacy', icon: '📜' },
  { key: 'conflict', label: 'Conflict', icon: '⚔️' },
  { key: 'myth', label: 'Myth & Magic', icon: '✨' },
]

export function PlayerRosterModal({
  isOpen,
  players,
  currentPlayerIndex,
  onClose,
  onAddPlayerSeat,
  onUpdatePlayerSeat,
  onRemovePlayerSeat,
}: PlayerRosterModalProps) {
  const [expandedWeightSeatId, setExpandedWeightSeatId] = useState<string | null>(null)

  if (!isOpen) return null

  const handleUpdateBotWeight = (
    seat: PlayerSeat,
    key: keyof BotPersonalityWeights,
    value: number
  ) => {
    const currentWeights = getEffectiveBotWeights(seat)
    onUpdatePlayerSeat(seat.id, {
      customWeights: {
        ...currentWeights,
        [key]: value,
      },
    })
  }

  const handleResetBotWeights = (seatId: string) => {
    onUpdatePlayerSeat(seatId, { customWeights: undefined })
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Hotseat Players & Bot Personalities"
    >
      <div className="card p-6 max-w-4xl w-full max-h-[92vh] overflow-y-auto space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Hotseat Players & Bot Personalities</h3>
              <p className="text-xs text-muted-foreground">
                Configure 1–6 tabletop seats, assign roles, and tune transparent bot decision weights
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAddPlayerSeat}
              disabled={players.length >= 6}
              className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Add Player Seat</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-accent rounded-md"
              aria-label="Close Player Roster"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {players.map((seat, idx) => {
            const isCurrentTurn = idx === currentPlayerIndex % players.length
            const botMeta = BOT_PERSONALITIES[seat.personality]
            const effectiveWeights = getEffectiveBotWeights(seat)
            const isWeightsExpanded = expandedWeightSeatId === seat.id

            return (
              <div
                key={seat.id}
                className={`p-3.5 rounded-xl border space-y-3 transition-colors ${
                  isCurrentTurn
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border bg-card'
                }`}
              >
                {/* Header: Color, Name & Delete */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <input
                      type="color"
                      value={seat.color}
                      onChange={(e) =>
                        onUpdatePlayerSeat(seat.id, { color: e.target.value })
                      }
                      className="w-6 h-6 rounded border-0 p-0 cursor-pointer shrink-0"
                      title="Player badge color"
                    />
                    <input
                      type="text"
                      value={seat.name}
                      onChange={(e) =>
                        onUpdatePlayerSeat(seat.id, { name: e.target.value })
                      }
                      className="input h-7 text-xs font-semibold flex-1 px-2"
                      placeholder="Player Name"
                    />
                  </div>
                  {players.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemovePlayerSeat(seat.id)}
                      className="text-muted-foreground hover:text-destructive p-1 rounded"
                      title="Remove seat"
                      aria-label={`Remove seat ${seat.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Role & Seat Control */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">
                      Role
                    </label>
                    <select
                      value={seat.role}
                      onChange={(e) =>
                        onUpdatePlayerSeat(seat.id, {
                          role: e.target.value as PlayerRole,
                        })
                      }
                      className="input h-7 text-xs py-0 px-2 w-full"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">
                      Seat Type
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdatePlayerSeat(seat.id, { isBot: !seat.isBot })
                      }
                      className={`w-full h-7 rounded border text-xs font-medium px-2 flex items-center justify-center gap-1 transition-colors ${
                        seat.isBot
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border hover:bg-muted'
                      }`}
                    >
                      {seat.isBot ? '🤖 Auto-Bot' : '👤 Human'}
                    </button>
                  </div>
                </div>

                {/* Bot Personality Selection */}
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">
                    Bot Personality
                  </label>
                  <select
                    value={seat.personality}
                    onChange={(e) =>
                      onUpdatePlayerSeat(seat.id, {
                        personality: e.target.value as BotPersonalityId,
                        customWeights: undefined,
                      })
                    }
                    className="input h-7 text-xs py-0 px-2 w-full"
                  >
                    {Object.values(BOT_PERSONALITIES).map((bp) => (
                      <option key={bp.id} value={bp.id}>
                        {bp.icon} {bp.name} — {bp.title}
                      </option>
                    ))}
                  </select>
                  {botMeta && (
                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                      {botMeta.description}
                    </p>
                  )}
                </div>

                {/* Transparent Decision Weights */}
                <div className="pt-2 border-t border-border/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground">
                      Decision Weights {seat.customWeights ? '(Custom)' : '(Default)'}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedWeightSeatId(isWeightsExpanded ? null : seat.id)
                      }
                      className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <Sliders className="h-3 w-3" />
                      <span>{isWeightsExpanded ? 'Hide Sliders' : 'Tweak Weights'}</span>
                    </button>
                  </div>

                  {!isWeightsExpanded ? (
                    <div className="grid grid-cols-3 gap-1 text-[10px]">
                      {WEIGHT_LABELS.map((w) => (
                        <div
                          key={w.key}
                          className="bg-muted/40 px-1.5 py-0.5 rounded border border-border/50 flex items-center justify-between"
                          title={`${w.label}: ${effectiveWeights[w.key]}/100`}
                        >
                          <span>{w.icon}</span>
                          <span className="font-mono font-bold">
                            {effectiveWeights[w.key]}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1.5 bg-muted/30 p-2.5 rounded-lg border border-border">
                      {WEIGHT_LABELS.map((w) => (
                        <div key={w.key} className="space-y-0.5">
                          <div className="flex justify-between text-[10px]">
                            <span>
                              {w.icon} {w.label}
                            </span>
                            <span className="font-mono font-bold">
                              {effectiveWeights[w.key]}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={effectiveWeights[w.key]}
                            onChange={(e) =>
                              handleUpdateBotWeight(
                                seat,
                                w.key,
                                parseInt(e.target.value, 10)
                              )
                            }
                            className="w-full h-1.5"
                          />
                        </div>
                      ))}
                      {seat.customWeights && (
                        <button
                          type="button"
                          onClick={() => handleResetBotWeights(seat.id)}
                          className="text-[10px] text-muted-foreground hover:text-foreground underline pt-1 block"
                        >
                          Reset to {botMeta?.name} Defaults
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
