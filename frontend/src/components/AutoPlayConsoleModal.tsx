import React, { useState } from 'react'
import {
  Sparkles,
  Bot,
  Play as PlayIcon,
  FastForward,
  Dices,
  Sliders,
  Check,
  X,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { GenerationSettings, GeographyPreset, WorldState } from '../engine/types'
import {
  MYTH_PRESETS,
  SOCIETY_PRESETS,
  SPECIES_PRESETS,
  STAGE_ACTION_PRESETS,
} from '../engine/presets'

interface AutoPlayConsoleModalProps {
  isOpen: boolean
  world: WorldState
  generateIntoNewWorld: boolean
  onClose: () => void
  onAutoStepOneTurn: () => void
  onAutoPlayCurrentStage: () => void
  onAutoPlayFullWorld: () => void
  onUpdateGenerationSettings: (updates: Partial<GenerationSettings>) => void
  onSetGenerateIntoNewWorld: (val: boolean) => void
}

type AutoPlayTab = 'actions' | 'dials' | 'presets'

export function AutoPlayConsoleModal({
  isOpen,
  world,
  generateIntoNewWorld,
  onClose,
  onAutoStepOneTurn,
  onAutoPlayCurrentStage,
  onAutoPlayFullWorld,
  onUpdateGenerationSettings,
  onSetGenerateIntoNewWorld,
}: AutoPlayConsoleModalProps) {
  const [activeTab, setActiveTab] = useState<AutoPlayTab>('actions')
  const [presetFilterCategory, setPresetFilterCategory] = useState<'species' | 'society' | 'myth' | 'actions'>('species')

  if (!isOpen) return null

  const { generationSettings } = world
  const disabledPresets = generationSettings.disabledPresetIds || []

  const handleTogglePreset = (presetId: string) => {
    const current = generationSettings.disabledPresetIds || []
    const next = current.includes(presetId)
      ? current.filter((id) => id !== presetId)
      : [...current, presetId]
    onUpdateGenerationSettings({ disabledPresetIds: next })
  }

  const handleEnableAllPresets = () => {
    onUpdateGenerationSettings({ disabledPresetIds: [] })
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Procedural Seeded Auto-Play & World Generator"
    >
      <div className="card p-6 max-w-3xl w-full max-h-[92vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Procedural Seeded Auto-Play & World Generator</h3>
              <p className="text-xs text-muted-foreground">
                Intelligent deterministic simulation guided by bot personalities, world dials, and enabled studio presets
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-accent rounded-md"
            aria-label="Close Auto-Play Modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border pb-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('actions')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'actions'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent text-foreground'
            }`}
          >
            ⚡ Run Simulation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dials')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'dials'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent text-foreground'
            }`}
          >
            🎛️ World Levers & Dials
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'presets'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent text-foreground'
            }`}
          >
            🧱 Studio Presets Pool ({disabledPresets.length} Disabled)
          </button>
        </div>

        {/* Tab 1: Actions & Seed Bar */}
        {activeTab === 'actions' && (
          <div className="space-y-4">
            {/* Seed & Geography Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-muted/40 p-3.5 rounded-xl border border-border/70 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">
                  Random Seed
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={generationSettings.seed}
                    onChange={(e) =>
                      onUpdateGenerationSettings({ seed: e.target.value })
                    }
                    className="input h-8 text-xs font-mono flex-1"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateGenerationSettings({
                        seed: `realm-${Math.floor(1000 + Math.random() * 9000)}`,
                      })
                    }
                    className="btn-outline px-2 h-8"
                    title="Generate new seed"
                  >
                    <Dices className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">
                  Geography Preset
                </label>
                <select
                  value={generationSettings.geographyPreset}
                  onChange={(e) =>
                    onUpdateGenerationSettings({
                      geographyPreset: e.target.value as GeographyPreset,
                    })
                  }
                  className="input h-8 text-xs py-0 w-full"
                >
                  <option value="continent">Central Continent</option>
                  <option value="archipelago">Island Archipelago</option>
                  <option value="twin-continents">Twin Continents</option>
                  <option value="inland-sea">Inland Sea Basin</option>
                  <option value="pangaea">Supercontinent (Pangaea)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">
                  Fantasy Level
                </label>
                <select
                  value={generationSettings.fantasyLevel}
                  onChange={(e) =>
                    onUpdateGenerationSettings({
                      fantasyLevel: e.target.value as 'low' | 'medium' | 'high',
                    })
                  }
                  className="input h-8 text-xs py-0 w-full"
                >
                  <option value="low">Low (Grounded Historical)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High Mythic (Magical)</option>
                </select>
              </div>
            </div>

            {/* Run Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border border-border bg-card space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-sm flex items-center gap-1.5">
                    <PlayIcon className="h-4 w-4 text-primary" />
                    <span>Auto-Play 1 Turn</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Resolves the current player's turn using their transparent personality weights.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onAutoStepOneTurn()
                    onClose()
                  }}
                  disabled={world.isLocked}
                  className="btn-outline w-full text-xs py-2 disabled:opacity-50"
                >
                  Auto-Play 1 Turn
                </button>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-sm flex items-center gap-1.5">
                    <FastForward className="h-4 w-4 text-primary" />
                    <span>Auto-Play Current Stage</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Simulates all remaining turns in the active Age ({world.currentStage}).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onAutoPlayCurrentStage()
                    onClose()
                  }}
                  disabled={world.isLocked}
                  className="btn-outline w-full text-xs py-2 disabled:opacity-50"
                >
                  Auto-Play Current Stage
                </button>
              </div>

              <div className="p-4 rounded-xl border border-primary/40 bg-primary/5 space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-sm flex items-center gap-1.5 text-primary">
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Full 4-Stage World</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Simulates all 4 Ages from Genesis to Intrigue into a complete world history.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onAutoPlayFullWorld()
                    onClose()
                  }}
                  className="btn-primary w-full text-xs py-2 shadow-sm"
                >
                  Generate Full 4-Stage World
                </button>
              </div>
            </div>

            {/* Non-destructive save toggle */}
            <div className="p-3 rounded-lg border border-border bg-muted/20 flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={generateIntoNewWorld || !!world.isLocked}
                  onChange={(e) => onSetGenerateIntoNewWorld(e.target.checked)}
                />
                <span>Generate into a New Saved World Snapshot (Never overwrites current world)</span>
              </label>
              {world.isLocked && (
                <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                  World Locked (Auto-protected)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Dials & Levers */}
        {activeTab === 'dials' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-border bg-card space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span>Turns Per Stage</span>
                  <span className="font-mono text-primary font-bold">
                    {generationSettings.turnsPerStage ?? 8} turns
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="16"
                  value={generationSettings.turnsPerStage ?? 8}
                  onChange={(e) =>
                    onUpdateGenerationSettings({
                      turnsPerStage: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full"
                />
                <p className="text-[11px] text-muted-foreground">
                  Controls historical depth across each of the 4 Ages (Total turns = 4 × {generationSettings.turnsPerStage ?? 8}).
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-card space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span>Starting Species (Stage 2)</span>
                  <span className="font-mono text-primary font-bold">
                    {generationSettings.startingSpeciesCount ?? 3}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={generationSettings.startingSpeciesCount ?? 3}
                  onChange={(e) =>
                    onUpdateGenerationSettings({
                      startingSpeciesCount: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full"
                />
                <p className="text-[11px] text-muted-foreground">
                  Number of plain modular species automatically spawned in the Primal Age.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-card space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span>Starting Kingdoms (Stage 3)</span>
                  <span className="font-mono text-primary font-bold">
                    {generationSettings.startingKingdomsCount ?? 3}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={generationSettings.startingKingdomsCount ?? 3}
                  onChange={(e) =>
                    onUpdateGenerationSettings({
                      startingKingdomsCount: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full"
                />
                <p className="text-[11px] text-muted-foreground">
                  Number of sovereign realms and initial borders founded in the Civilization Age.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-card space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span>Map Spread vs. Cluster Bias</span>
                  <span className="font-mono text-primary font-bold">
                    {generationSettings.spreadBias ?? 75}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={generationSettings.spreadBias ?? 75}
                  onChange={(e) =>
                    onUpdateGenerationSettings({
                      spreadBias: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full"
                />
                <p className="text-[11px] text-muted-foreground">
                  Higher values encourage civilizations to colonize open land tiles; lower values cluster them together.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-muted/30 flex flex-wrap items-center gap-6 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={generationSettings.allowDisasters !== false}
                  onChange={(e) =>
                    onUpdateGenerationSettings({
                      allowDisasters: e.target.checked,
                    })
                  }
                />
                <span>Allow Ace Disasters & Cataclysms</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={generationSettings.allowFantastical !== false}
                  onChange={(e) =>
                    onUpdateGenerationSettings({
                      allowFantastical: e.target.checked,
                    })
                  }
                />
                <span>Allow Fantastical Face Cards (J, Q, K)</span>
              </label>
            </div>
          </div>
        )}

        {/* Tab 3: Preset Pool Filtering */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex gap-1.5">
                {(
                  [
                    { id: 'species', label: `Species (${SPECIES_PRESETS.length})` },
                    { id: 'society', label: `Kingdoms (${SOCIETY_PRESETS.length})` },
                    { id: 'myth', label: `Myths (${MYTH_PRESETS.length})` },
                    { id: 'actions', label: `Turn Actions (${STAGE_ACTION_PRESETS.length})` },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setPresetFilterCategory(t.id)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      presetFilterCategory === t.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border border-border'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {disabledPresets.length > 0 && (
                <button
                  type="button"
                  onClick={handleEnableAllPresets}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Enable All Presets
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto pr-1">
              {(presetFilterCategory === 'species'
                ? SPECIES_PRESETS
                : presetFilterCategory === 'society'
                  ? SOCIETY_PRESETS
                  : presetFilterCategory === 'myth'
                    ? MYTH_PRESETS
                    : STAGE_ACTION_PRESETS
              ).map((item) => {
                const isDisabled = disabledPresets.includes(item.id)
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTogglePreset(item.id)}
                    className={`p-2 rounded-lg border text-left text-xs flex items-center justify-between gap-1.5 transition-all ${
                      isDisabled
                        ? 'border-border bg-muted/40 opacity-50 line-through'
                        : 'border-primary/40 bg-background font-medium hover:border-primary'
                    }`}
                  >
                    <span className="truncate">
                      {item.icon} {item.name}
                    </span>
                    <span className="text-[10px] shrink-0 font-bold">
                      {isDisabled ? 'OFF' : 'ON'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
