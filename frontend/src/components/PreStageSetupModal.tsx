import { useState } from 'react'
import { X, Plus, Sparkles, Check, MapPin, Users, Crown, ScrollText } from 'lucide-react'
import { MapState, PlayerSeat, StageId, WorldEntity } from '../engine/types'
import { PLAYER_COLORS } from '../engine/presets'

interface PreStageSetupModalProps {
  isOpen: boolean
  stage: StageId
  players: PlayerSeat[]
  entities: WorldEntity[]
  map: MapState
  selectedTileId: string
  onClose: () => void
  onCreateEntity: (entity: WorldEntity) => void
  onRenameTile?: (tileId: string, newLabel: string) => void
  onOpenNewMapRegen?: () => void
}

const SPECIES_QUICK_ICONS = ['🧝', '🧔', '🧑', '🦎', '🦊', '🦅', '🧜', '👹', '🌳', '🪨']
const SOCIETY_QUICK_ICONS = ['👑', '🏛️', '⚔️', '⛵', '🏰', '🕯️', '⚖️', '🦅', '🐉', '🌙']

export function PreStageSetupModal({
  isOpen,
  stage,
  players,
  entities,
  map,
  selectedTileId,
  onClose,
  onCreateEntity,
  onRenameTile,
  onOpenNewMapRegen,
}: PreStageSetupModalProps) {
  const [nameInput, setNameInput] = useState('')
  const [descriptionInput, setDescriptionInput] = useState('')
  const [iconInput, setIconInput] = useState(stage === 'primal' ? '🧝' : '👑')
  const [originTileInput, setOriginTileInput] = useState(selectedTileId || '10,6')
  const [parentSpeciesId, setParentSpeciesId] = useState('')
  const [createdCount, setCreatedCount] = useState(0)

  if (!isOpen) return null

  const speciesList = entities.filter((e) => e.category === 'species')
  const societiesList = entities.filter((e) => e.category === 'society')
  const settlementTiles = Object.values(map.tiles).filter(
    (t) => t.overlay && t.overlay !== 'none'
  )

  const handleQuickAddSpecies = () => {
    const cleanName = nameInput.trim()
    if (!cleanName) return
    const color = PLAYER_COLORS[(entities.length + createdCount) % PLAYER_COLORS.length]
    const newEntity: WorldEntity = {
      id: `ent_species_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      category: 'species',
      name: cleanName,
      icon: iconInput || '🧝',
      color,
      archetype: 'Sentient Species',
      description: descriptionInput.trim() || `Originated near (${originTileInput.trim() || '10,6'}).`,
      originTileId: originTileInput.trim() || undefined,
      traits: [],
      abilities: [],
      status: 'Active',
      stageCreated: 'primal',
    }
    onCreateEntity(newEntity)
    setNameInput('')
    setDescriptionInput('')
    setCreatedCount((c) => c + 1)
  }

  const handleQuickAddSociety = () => {
    const cleanName = nameInput.trim()
    if (!cleanName) return
    const parent = speciesList.find((s) => s.id === parentSpeciesId)
    const color = PLAYER_COLORS[(entities.length + createdCount) % PLAYER_COLORS.length]
    const newEntity: WorldEntity = {
      id: `ent_society_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      category: 'society',
      name: cleanName,
      icon: iconInput || '👑',
      color,
      archetype: parent ? `${parent.name} Society` : 'Founding Society',
      description:
        descriptionInput.trim() ||
        `${cleanName}${parent ? ` (formed by ${parent.name})` : ''} founded at (${originTileInput.trim() || '10,6'}).`,
      originTileId: originTileInput.trim() || undefined,
      parentEntityId: parent?.id,
      traits: [],
      abilities: [],
      status: 'Active',
      stageCreated: 'civilization',
    }
    onCreateEntity(newEntity)
    setNameInput('')
    setDescriptionInput('')
    setCreatedCount((c) => c + 1)
  }

  return (
    <div
      data-testid="pre-stage-setup-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Pre-${stage} Setup Ritual`}
    >
      <div className="card w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-primary/30 bg-card">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-2 bg-muted/40">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <div>
              <h2 className="text-sm sm:text-base font-bold leading-tight">
                {stage === 'genesis' && 'Pre-Genesis Setup — Basic Coastline & Starting Features'}
                {stage === 'primal' && 'Pre-Primal Ritual — Introduce Sentient Species'}
                {stage === 'civilization' && 'Pre-Civilization Ritual — Form Founding Societies'}
                {stage === 'intrigue' && 'Pre-Intrigue Ritual — Name Cities, Nations & Delve Into Plots'}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                From the original World Building rules · Optional &amp; skippable anytime
              </p>
            </div>
          </div>
          <button
            type="button"
            data-testid="close-pre-stage-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
            aria-label="Close Pre-Stage Setup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {stage === 'genesis' && (
            <div className="space-y-3">
              <blockquote className="p-3 rounded-lg bg-muted/40 border-l-4 border-primary text-muted-foreground italic">
                &ldquo;Before starting this stage, make sure you already have some basic terrain
                features such as coastlines for your continent(s) and maybe a river, or a mountain
                or two.&rdquo;
              </blockquote>
              <p className="text-foreground leading-relaxed">
                Your starting map already has a clean coastline with just a mountain or two and a
                small forest grove. During <strong>Stage 1: Genesis</strong>, players draw cards to
                add <strong>Earth (♠)</strong>, <strong>Water (♥)</strong>,{' '}
                <strong>Plant (♣)</strong>, and <strong>Feature (♦)</strong>.
              </p>
              {onOpenNewMapRegen && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenNewMapRegen()
                  }}
                  className="btn-outline px-3 py-1.5 text-xs font-semibold"
                >
                  🗺️ Open Map &amp; Coastline Tools
                </button>
              )}
            </div>
          )}

          {stage === 'primal' && (
            <div className="space-y-3">
              <blockquote className="p-3 rounded-lg bg-muted/40 border-l-4 border-primary text-muted-foreground italic">
                &ldquo;Before starting this stage, each player should create a species, describing
                them and naming them and deciding where on the map they originated from.&rdquo;
              </blockquote>

              {players.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="font-semibold text-muted-foreground">Table Seats:</span>
                  {players.map((p) => (
                    <span
                      key={p.id}
                      className="px-2 py-0.5 rounded-full text-white font-semibold"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-2.5">
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <span>Quick-Create a Starting Species</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {SPECIES_QUICK_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIconInput(ic)}
                      className={`w-7 h-7 rounded border text-sm flex items-center justify-center ${
                        iconInput === ic
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border hover:bg-accent'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    data-testid="prestage-species-name-input"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Species Name (e.g. River Elves)..."
                    className="input h-8 text-xs sm:col-span-2"
                  />
                  <input
                    type="text"
                    value={originTileInput}
                    onChange={(e) => setOriginTileInput(e.target.value)}
                    placeholder="Origin tile (col,row)"
                    className="input h-8 text-xs font-mono"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                    placeholder="Short description (optional)..."
                    className="input h-8 text-xs flex-1"
                  />
                  <button
                    type="button"
                    data-testid="prestage-add-species-btn"
                    onClick={handleQuickAddSpecies}
                    disabled={!nameInput.trim()}
                    className="btn-primary px-3 h-8 text-xs font-bold flex items-center gap-1 disabled:opacity-40"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Species</span>
                  </button>
                </div>
              </div>

              {speciesList.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-muted-foreground">
                    Species in Your World ({speciesList.length}):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {speciesList.map((s) => (
                      <span
                        key={s.id}
                        className="px-2 py-1 rounded-md border border-border bg-background font-semibold flex items-center gap-1"
                      >
                        <span>{s.icon}</span>
                        <span>{s.name}</span>
                        {s.originTileId && (
                          <span className="text-[10px] font-mono text-muted-foreground">
                            ({s.originTileId})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {stage === 'civilization' && (
            <div className="space-y-3">
              <blockquote className="p-3 rounded-lg bg-muted/40 border-l-4 border-primary text-muted-foreground italic">
                &ldquo;Before starting this stage, each player should create some societies within
                the different species which might grow and expand during this stage into kingdoms or
                empires.&rdquo;
              </blockquote>

              <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-2.5">
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  <Crown className="h-3.5 w-3.5 text-primary" />
                  <span>Quick-Create a Founding Society / Realm</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {SOCIETY_QUICK_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIconInput(ic)}
                      className={`w-7 h-7 rounded border text-sm flex items-center justify-center ${
                        iconInput === ic
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border hover:bg-accent'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    data-testid="prestage-society-name-input"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Society Name (e.g. Sun Coast League)..."
                    className="input h-8 text-xs sm:col-span-2"
                  />
                  <select
                    value={parentSpeciesId}
                    onChange={(e) => setParentSpeciesId(e.target.value)}
                    className="input h-8 text-xs py-0"
                  >
                    <option value="">Any Species...</option>
                    {speciesList.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.icon} {sp.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                    placeholder="Short motto or homeland description (optional)..."
                    className="input h-8 text-xs flex-1"
                  />
                  <button
                    type="button"
                    data-testid="prestage-add-society-btn"
                    onClick={handleQuickAddSociety}
                    disabled={!nameInput.trim()}
                    className="btn-primary px-3 h-8 text-xs font-bold flex items-center gap-1 disabled:opacity-40"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Society</span>
                  </button>
                </div>
              </div>

              {societiesList.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-muted-foreground">
                    Societies in Your World ({societiesList.length}):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {societiesList.map((soc) => (
                      <span
                        key={soc.id}
                        className="px-2 py-1 rounded-md border border-border bg-background font-semibold flex items-center gap-1"
                      >
                        <span>{soc.icon}</span>
                        <span>{soc.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {stage === 'intrigue' && (
            <div className="space-y-3">
              <blockquote className="p-3 rounded-lg bg-muted/40 border-l-4 border-primary text-muted-foreground italic">
                &ldquo;Before this stage, you should make sure to give names to cities, nations, and
                societies. And deliberate on their aspects that you have developed over the last two
                stages.&rdquo;
              </blockquote>

              <div className="space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span>Settlements on Your Map ({settlementTiles.length})</span>
                </div>
                {settlementTiles.length === 0 ? (
                  <p className="text-muted-foreground italic">
                    No settlement markers on the map yet — you can name places anytime from the Map
                    Inspector.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {settlementTiles.slice(0, 12).map((tile) => (
                      <div
                        key={tile.id}
                        className="flex items-center gap-2 p-1.5 rounded border border-border bg-background"
                      >
                        <span className="font-mono text-[10px] text-muted-foreground w-12 shrink-0">
                          ({tile.id})
                        </span>
                        <input
                          type="text"
                          defaultValue={tile.label || ''}
                          onBlur={(e) => {
                            if (onRenameTile && e.target.value.trim() !== (tile.label || '')) {
                              onRenameTile(tile.id, e.target.value.trim())
                            }
                          }}
                          placeholder={`Name this ${tile.overlay}...`}
                          className="input h-7 text-xs flex-1"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {societiesList.length > 0 && (
                <div className="space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ScrollText className="h-3.5 w-3.5 text-primary" />
                    <span>Active Societies &amp; Nations ({societiesList.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {societiesList.map((soc) => (
                      <span
                        key={soc.id}
                        className="px-2 py-0.5 rounded-md border border-border bg-muted/40 font-semibold"
                      >
                        {soc.icon} {soc.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-border bg-muted/30 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground font-medium"
          >
            Skip for now
          </button>
          <button
            type="button"
            data-testid="prestage-done-btn"
            onClick={onClose}
            className="btn-primary px-4 py-1.5 text-xs font-bold flex items-center gap-1.5"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Begin Stage</span>
          </button>
        </div>
      </div>
    </div>
  )
}
