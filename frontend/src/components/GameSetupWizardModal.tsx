import { useState } from 'react'
import {
  Wand2,
  CheckCircle2,
  X,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import {
  DeckConfig,
  GenerationSettings,
  GeographyPreset,
  PlayerSeat,
  WorldState,
} from '../engine/types'
import { SHORT_GAME_DECK_CONFIG } from '../engine/deckEngine'
import { PLAYER_COLORS } from '../engine/presets'

interface GameSetupWizardModalProps {
  isOpen: boolean
  world: WorldState
  onClose: () => void
  onApplySetup: (updates: {
    name: string
    generationSettings: GenerationSettings
    deckConfig: DeckConfig
    players: PlayerSeat[]
    newMap?: boolean
  }) => void
}

type WizardStep = 1 | 2 | 3 | 4 | 5

export function GameSetupWizardModal({
  isOpen,
  world,
  onClose,
  onApplySetup,
}: GameSetupWizardModalProps) {
  const [step, setStep] = useState<WizardStep>(1)
  const [worldName, setWorldName] = useState(world.name)
  const [seed, setSeed] = useState(world.generationSettings.seed)
  const [geographyPreset, setGeographyPreset] = useState<GeographyPreset>(
    world.generationSettings.geographyPreset
  )
  const [fantasyLevel, setFantasyLevel] = useState(world.generationSettings.fantasyLevel)
  const [disasterIntensity, setDisasterIntensity] = useState(
    world.generationSettings.disasterIntensity
  )
  const [players, setPlayers] = useState<PlayerSeat[]>(world.players)
  const [deckConfig, setDeckConfig] = useState<DeckConfig>(world.deckConfig)
  const [regenerateMap, setRegenerateMap] = useState(false)

  if (!isOpen) return null

  const handleNext = () => {
    if (step < 5) setStep((s) => (s + 1) as WizardStep)
  }

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as WizardStep)
  }

  const handleFinish = () => {
    onApplySetup({
      name: worldName.trim() || world.name,
      generationSettings: {
        ...world.generationSettings,
        seed: seed.trim() || world.generationSettings.seed,
        geographyPreset,
        fantasyLevel,
        disasterIntensity,
      },
      deckConfig,
      players,
      newMap: regenerateMap,
    })
    onClose()
  }

  const applyDeckPreset = (preset: 'standard' | 'short') => {
    if (preset === 'standard') {
      setDeckConfig({
        ...deckConfig,
        numberRange: [2, 10],
        faceCards: { J: true, Q: true, K: true },
        aceCount: 4,
        jokerCount: 2,
      })
    } else {
      setDeckConfig({
        ...deckConfig,
        ...SHORT_GAME_DECK_CONFIG,
      })
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/65 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Game Setup Wizard"
    >
      <div className="card p-6 max-w-3xl w-full max-h-[92vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Wand2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Studio Campaign Setup Wizard</h3>
              <p className="text-xs text-muted-foreground">
                Step-by-step game setup: world rules, geography, tabletop roster, and deck pacing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-accent rounded-md"
            aria-label="Close Setup Wizard"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
          {[
            { s: 1, title: '1. Rules' },
            { s: 2, title: '2. Geography' },
            { s: 3, title: '3. Players' },
            { s: 4, title: '4. Deck' },
            { s: 5, title: '5. Launch' },
          ].map((item) => (
            <div
              key={item.s}
              className={`py-1.5 px-1 rounded-md font-bold text-[11px] transition-colors ${
                step === item.s
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : step > item.s
                    ? 'bg-primary/15 text-primary'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {item.title}
            </div>
          ))}
        </div>

        {/* Step 1: World & Rules */}
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="font-bold text-sm">Step 1: World Name & Rules Intensity</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">
                  World Name
                </label>
                <input
                  type="text"
                  value={worldName}
                  onChange={(e) => setWorldName(e.target.value)}
                  className="input h-9 text-xs w-full font-semibold"
                  placeholder="Realm Name"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">
                  Random Seed
                </label>
                <input
                  type="text"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  className="input h-9 text-xs w-full font-mono"
                  placeholder="seed-key"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">
                  Fantasy Level
                </label>
                <select
                  value={fantasyLevel}
                  onChange={(e) => setFantasyLevel(e.target.value as any)}
                  className="input h-9 text-xs w-full py-0"
                >
                  <option value="low">Low Fantasy (Grounded, Historical)</option>
                  <option value="medium">Medium Fantasy (Standard, Balanced)</option>
                  <option value="high">High Fantasy (Mythic, Marvelous)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">
                  Ace Cataclysms
                </label>
                <select
                  value={disasterIntensity}
                  onChange={(e) => setDisasterIntensity(e.target.value as any)}
                  className="input h-9 text-xs w-full py-0"
                >
                  <option value="mild">Mild (Localized Hazards)</option>
                  <option value="standard">Standard (Dramatic Reshaping)</option>
                  <option value="cataclysmic">Cataclysmic (Continental Shifts)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Geography */}
        {step === 2 && (
          <div className="space-y-4">
            <h4 className="font-bold text-sm">Step 2: Starting Geography & Map Template</h4>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">
                  Geography Template
                </label>
                <select
                  value={geographyPreset}
                  onChange={(e) => {
                    setGeographyPreset(e.target.value as GeographyPreset)
                    setRegenerateMap(true)
                  }}
                  className="input h-9 text-xs w-full py-0"
                >
                  <option value="continent">Central Continent</option>
                  <option value="archipelago">Island Archipelago</option>
                  <option value="twin-continents">Twin Continents</option>
                  <option value="inland-sea">Inland Sea Basin</option>
                  <option value="pangaea">Supercontinent (Pangaea)</option>
                </select>
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/20">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={regenerateMap}
                    onChange={(e) => setRegenerateMap(e.target.checked)}
                  />
                  <span>Re-seed Atlas Map with this template upon launch</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Players */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm">Step 3: Tabletop Roster ({players.length} Seats)</h4>
              <button
                type="button"
                onClick={() => {
                  if (players.length >= 6) return
                  const idx = players.length
                  const newSeat: PlayerSeat = {
                    id: `p_${Date.now()}_${idx}`,
                    name: `Player ${idx + 1}`,
                    color: PLAYER_COLORS[idx % PLAYER_COLORS.length],
                    role: 'Player',
                    isBot: false,
                    personality: 'shaper',
                  }
                  setPlayers([...players, newSeat])
                }}
                disabled={players.length >= 6}
                className="btn-primary px-3 py-1 text-xs"
              >
                + Add Seat
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {players.map((seat) => (
                <div
                  key={seat.id}
                  className="p-2.5 rounded-lg border border-border bg-background flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: seat.color }}
                    />
                    <input
                      type="text"
                      value={seat.name}
                      onChange={(e) =>
                        setPlayers(
                          players.map((p) =>
                            p.id === seat.id ? { ...p, name: e.target.value } : p
                          )
                        )
                      }
                      className="input h-7 text-xs flex-1 px-2 font-semibold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPlayers(
                        players.map((p) =>
                          p.id === seat.id ? { ...p, isBot: !p.isBot } : p
                        )
                      )
                    }
                    className="px-2 py-1 rounded border border-border text-[11px]"
                  >
                    {seat.isBot ? '🤖 Bot' : '👤 Human'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Deck Pacing */}
        {step === 4 && (
          <div className="space-y-4">
            <h4 className="font-bold text-sm">Step 4: Deck Pacing & Card Setup</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => applyDeckPreset('standard')}
                className="p-3.5 rounded-xl border border-border bg-card text-left hover:border-primary space-y-1"
              >
                <div className="font-bold">Standard Campaign (54 Cards)</div>
                <p className="text-muted-foreground text-[11px]">
                  Full four suits (2–10), face cards (J, Q, K), 4 Aces, and 2 Jokers.
                </p>
              </button>

              <button
                type="button"
                onClick={() => applyDeckPreset('short')}
                className="p-3.5 rounded-xl border border-border bg-card text-left hover:border-primary space-y-1"
              >
                <div className="font-bold">Short Game (27 Cards)</div>
                <p className="text-muted-foreground text-[11px]">
                  Fast-paced session with curated cards and accelerated progression.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Launch Review */}
        {step === 5 && (
          <div className="space-y-4">
            <h4 className="font-bold text-sm">Step 5: Review & Genesis Campaign Launch</h4>
            <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-2 text-xs">
              <div className="font-bold text-sm text-primary">{worldName}</div>
              <div><strong>Seed:</strong> {seed}</div>
              <div><strong>Geography:</strong> {geographyPreset}</div>
              <div><strong>Roster:</strong> {players.length} Tabletop Seat(s)</div>
              <div><strong>Deck:</strong> {deckConfig.aceCount} Aces, {deckConfig.jokerCount} Jokers</div>
            </div>
            <p className="text-xs text-muted-foreground">
              Clicking "Launch Studio Campaign" initializes your game and begins Age 1: Genesis.
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="btn-outline px-4 py-2 text-xs flex items-center gap-1.5 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary px-5 py-2 text-xs flex items-center gap-1.5"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="btn-primary px-6 py-2 text-xs font-bold flex items-center gap-2 shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Launch Studio Campaign</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
