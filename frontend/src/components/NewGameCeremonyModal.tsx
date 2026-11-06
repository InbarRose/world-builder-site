import { useState } from 'react'
import { X, Sparkles, Compass, Users, Layers, ShieldCheck, Dice5 } from 'lucide-react'
import { GameMode, PlayerSeat, StageId, WorldState } from '../engine/types'
import { createNewWorld } from '../engine/storageService'
import { playStageAdvanceSound, triggerHapticFeedback } from '../engine/soundEngine'
import { STAGES } from '../engine/deckEngine'

interface NewGameCeremonyModalProps {
  isOpen: boolean
  onClose: () => void
  onLaunchWorld: (newWorld: WorldState) => void
}

const REALM_NAME_IDEAS = [
  'Aethelgard',
  'Vales of Valdris',
  'The Ironreach',
  'Sunstone Archipelago',
  'Drakenshire',
  'Shattered Expanse',
  'Covenant of Eldoria',
  'Whispering Marches',
]

export function NewGameCeremonyModal({
  isOpen,
  onClose,
  onLaunchWorld,
}: NewGameCeremonyModalProps) {
  const [name, setName] = useState('New Realm')
  const [gameMode, setGameMode] = useState<GameMode>('studio')
  const [startingStage, setStartingStage] = useState<StageId>('genesis')
  const [premise, setPremise] = useState('')
  const [players, setPlayers] = useState<PlayerSeat[]>([
    { id: 'p1', name: 'Player 1', color: '#3b82f6', isBot: false, role: 'Player', personality: 'shaper' },
    { id: 'p2', name: 'Player 2', color: '#10b981', isBot: false, role: 'Player', personality: 'shaper' },
  ])

  if (!isOpen) return null

  const handleRandomizeName = () => {
    const randomName = REALM_NAME_IDEAS[Math.floor(Math.random() * REALM_NAME_IDEAS.length)]
    setName(randomName)
    triggerHapticFeedback('light')
  }

  const handleAddPlayer = () => {
    if (players.length >= 6) return
    const id = `p${players.length + 1}`
    const colors = ['#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']
    const color = colors[players.length % colors.length]
    setPlayers([...players, { id, name: `Player ${players.length + 1}`, color, isBot: false, role: 'Player', personality: 'shaper' }])
    triggerHapticFeedback('light')
  }

  const handleRemovePlayer = (id: string) => {
    if (players.length <= 1) return
    setPlayers(players.filter((p) => p.id !== id))
    triggerHapticFeedback('light')
  }

  const handleUpdatePlayer = (id: string, updates: Partial<PlayerSeat>) => {
    setPlayers(players.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  const handleLaunch = () => {
    const realm = createNewWorld(name.trim() || 'Untitled Realm')
    realm.gameMode = gameMode
    realm.currentStage = startingStage
    realm.deckConfig.selectedStage = startingStage
    realm.players = players
    realm.currentPlayerIndex = 0

    if (premise.trim()) {
      realm.stageNotes[startingStage] = premise.trim()
    }

    playStageAdvanceSound()
    triggerHapticFeedback('celebration')
    onLaunchWorld(realm)
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="New Campaign Initiation Ceremony"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-card border border-border/80 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-border/80 bg-muted/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <Sparkles className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Initiate New Campaign</h2>
              <p className="text-xs text-muted-foreground">
                Consecrate the realm, choose your table format, and prepare the council of players.
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
          {/* Step 1: Realm Name & Premise */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-primary" />
                <span>1. Realm Identity</span>
              </label>
              <button
                type="button"
                onClick={handleRandomizeName}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <Dice5 className="h-3.5 w-3.5" />
                <span>Randomize Name</span>
              </button>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aethelgard, Isle of Mists..."
                className="input w-full text-base font-bold h-11"
              />
              <textarea
                value={premise}
                onChange={(e) => setPremise(e.target.value)}
                placeholder="Mythic Premise (optional): In the dawn of the cosmos, what primeval forces shaped this realm?"
                rows={2}
                className="input w-full text-xs font-serif leading-relaxed"
              />
            </div>
          </div>

          {/* Step 2: Table Format (Mode) */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span>2. Table Play Format</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setGameMode('studio')}
                className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 ${
                  gameMode === 'studio'
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/40 shadow-sm'
                    : 'border-border bg-background hover:border-primary/50'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 text-xs text-primary">
                  <span>🏛️</span>
                  <span>Full Studio</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  Digital deck, automated turn stages, cartography canvas, and interconnected codex.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setGameMode('companion')}
                className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 ${
                  gameMode === 'companion'
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/40 shadow-sm'
                    : 'border-border bg-background hover:border-primary/50'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <span>🎭</span>
                  <span>Companion Table</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  Play with a physical deck at the table with friends; digital tracking for maps and turns.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setGameMode('free-create')}
                className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 ${
                  gameMode === 'free-create'
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/40 shadow-sm'
                    : 'border-border bg-background hover:border-primary/50'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                  <span>🗺️</span>
                  <span>Freeform Sandbox</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  Pure worldbuilder map & codex editor without deck turns or card power restrictions.
                </p>
              </button>
            </div>
          </div>

          {/* Step 3: Starting Era */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span>3. Starting Era / Stage</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STAGES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStartingStage(st.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    startingStage === st.id
                      ? 'border-primary bg-primary/15 font-bold shadow-xs ring-1 ring-primary'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="font-bold truncate">{st.number}. {st.name}</div>
                  <div className="text-[10px] opacity-75 truncate">{st.eraLabel}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Council of Players */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary" />
                <span>4. Council of Players ({players.length})</span>
              </label>
              {players.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddPlayer}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  + Add Seat
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="p-2.5 rounded-lg border border-border bg-muted/20 flex items-center gap-2"
                >
                  <input
                    type="color"
                    value={player.color}
                    onChange={(e) => handleUpdatePlayer(player.id, { color: e.target.value })}
                    className="w-7 h-7 rounded border-0 cursor-pointer p-0 bg-transparent shrink-0"
                    title="Player Color"
                  />
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => handleUpdatePlayer(player.id, { name: e.target.value })}
                    className="input flex-1 h-8 text-xs font-medium"
                    placeholder="Player Name"
                  />
                  {players.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(player.id)}
                      className="text-muted-foreground hover:text-rose-500 p-1 text-xs"
                      title="Remove Seat"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/80 bg-muted/30 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-outline px-4 py-2 text-xs font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLaunch}
            className="btn-primary px-5 py-2 text-xs font-bold flex items-center gap-2 shadow-lg"
          >
            <Sparkles className="h-4 w-4" />
            <span>Forge Realm & Inscribe Destiny</span>
          </button>
        </div>
      </div>
    </div>
  )
}
