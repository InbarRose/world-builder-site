import React, { useState } from 'react'
import {
  Users,
  Crown,
  Sparkles,
  Plus,
  Trash2,
  MapPin,
  BookOpen,
  Wand2,
  Shield,
} from 'lucide-react'
import {
  DrawRecord,
  EntityCategory,
  MapState,
  StageId,
  WorldEntity,
} from '../engine/types'
import {
  EntityPreset,
  MYTH_PRESETS,
  PLAYER_COLORS,
  SOCIETY_PRESETS,
  SPECIES_PRESETS,
} from '../engine/presets'

interface EntityRegistryProps {
  entities: WorldEntity[]
  currentStage: StageId
  drawHistory: DrawRecord[]
  map?: MapState
  onChange: (newEntities: WorldEntity[]) => void
}

const CATEGORIES: {
  id: EntityCategory
  label: string
  stageHint: string
  placeholderName: string
  placeholderArchetype: string
  placeholderTraits: string
  placeholderAbilities: string
  icon: typeof Users
  defaultEmoji: string
}[] = [
  {
    id: 'species',
    label: 'Races & Species',
    stageHint: '2. Primal Stage — Origin races, traditions, resources & skills',
    placeholderName: 'e.g., Sylvan Elves, Ironforge Dwarves...',
    placeholderArchetype: 'e.g., Immortal Forest Guardians',
    placeholderTraits: 'e.g., Master Sailors, Sun Worship, Obsidian Smithing',
    placeholderAbilities: 'e.g., Astral Weaving, Deep-Stone Sense',
    icon: Users,
    defaultEmoji: '🧝',
  },
  {
    id: 'society',
    label: 'Civilizations & Nations',
    stageHint: '3. Civilization Stage — Kingdoms, empires, monuments & diplomacy',
    placeholderName: 'e.g., Republic of Valoria, Ashen Empire...',
    placeholderArchetype: 'e.g., Merchant Maritime Republic',
    placeholderTraits: 'e.g., Merchant Guilds, Grand Library, Naval Hegemony',
    placeholderAbilities: 'e.g., Grand Armada, Siege Craft',
    icon: Crown,
    defaultEmoji: '👑',
  },
  {
    id: 'myth',
    label: 'Myths, Schemes & Conflicts',
    stageHint: '4. Intrigue Stage — Legends, ancient dragons, wars & secret pacts',
    placeholderName: 'e.g., The Crimson Conspiracy, Slumbering Leviathan...',
    placeholderArchetype: 'e.g., Ancient Calamity Beast',
    placeholderTraits: 'e.g., Cursed Relic, Shadow Cabal, Prophecy',
    placeholderAbilities: 'e.g., Dragonfire Cataclysm, Silent Coup',
    icon: Sparkles,
    defaultEmoji: '🐉',
  },
]

const STATUS_OPTIONS = [
  'Flourishing',
  'Active',
  'Expanding',
  'Golden Age',
  'At War',
  'Declining',
  'Dormant / Hidden',
  'Fallen / Ruined',
]

export function EntityRegistry({
  entities,
  currentStage,
  drawHistory,
  map,
  onChange,
}: EntityRegistryProps) {
  const [activeTab, setActiveTab] = useState<EntityCategory | 'all'>('all')
  const [category, setCategory] = useState<EntityCategory>('species')
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🧝')
  const [color, setColor] = useState(PLAYER_COLORS[0])
  const [archetype, setArchetype] = useState('')
  const [originTileId, setOriginTileId] = useState('')
  const [status, setStatus] = useState('Flourishing')
  const [description, setDescription] = useState('')
  const [traitsInput, setTraitsInput] = useState('')
  const [abilitiesInput, setAbilitiesInput] = useState('')

  const activeCategoryMeta =
    CATEGORIES.find((c) => c.id === category) || CATEGORIES[0]

  const presetsForCategory: EntityPreset[] =
    category === 'species'
      ? SPECIES_PRESETS
      : category === 'society'
      ? SOCIETY_PRESETS
      : MYTH_PRESETS

  const handleApplyPreset = (preset: EntityPreset) => {
    setCategory(preset.category)
    setName(preset.name)
    setIcon(preset.icon)
    setColor(preset.color)
    setArchetype(preset.archetype)
    setDescription(preset.description)
    setTraitsInput(preset.traits.join(', '))
    setAbilitiesInput(preset.abilities.join(', '))
  }

  const handleCreateEntity = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const newEntity: WorldEntity = {
      id: `entity_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      category,
      stageCreated: currentStage,
      originTileId: originTileId.trim() || undefined,
      description: description.trim(),
      traits: traitsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      abilities: abilitiesInput
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
      status,
      icon: icon.trim() || activeCategoryMeta.defaultEmoji,
      color,
      archetype: archetype.trim() || undefined,
    }

    onChange([newEntity, ...entities])
    setName('')
    setArchetype('')
    setOriginTileId('')
    setDescription('')
    setTraitsInput('')
    setAbilitiesInput('')
  }

  const handleDeleteEntity = (id: string) => {
    onChange(entities.filter((ent) => ent.id !== id))
  }

  const handleStatusChange = (id: string, newStatus: string) => {
    onChange(
      entities.map((ent) => (ent.id === id ? { ...ent, status: newStatus } : ent))
    )
  }

  const visibleEntities =
    activeTab === 'all'
      ? entities
      : entities.filter((ent) => ent.category === activeTab)

  const countTerritoryTiles = (entityId: string): number => {
    if (!map) return 0
    return Object.values(map.tiles).filter((t) => t.territoryId === entityId).length
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Codex Creator & Preset Library (5 cols) */}
      <div className="lg:col-span-5 card p-6 h-fit space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <BookOpen className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-lg font-bold">Register WorldEntity</h3>
            <p className="text-xs text-muted-foreground">
              Choose a template preset or customize races, kingdoms & myths
            </p>
          </div>
        </div>

        {/* Category Selector */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">
            Codex Category
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategory(cat.id)
                    setIcon(cat.defaultEmoji)
                  }}
                  className={`p-2 rounded border text-xs flex flex-col items-center gap-1 transition-colors ${
                    category === cat.id
                      ? 'bg-primary text-primary-foreground border-primary font-semibold'
                      : 'bg-background border-border hover:bg-accent'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>
                    {cat.id === 'species'
                      ? 'Species'
                      : cat.id === 'society'
                      ? 'Society'
                      : 'Myth'}
                  </span>
                </button>
              )
            })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {activeCategoryMeta.stageHint}
          </p>
        </div>

        {/* Built-in Presets Bar */}
        <div className="bg-muted/40 p-3 rounded-lg border border-border space-y-2">
          <div className="text-xs font-semibold flex items-center gap-1.5 text-primary">
            <Wand2 className="h-3.5 w-3.5" />
            <span>Quick Presets (Click to Load & Customize)</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {presetsForCategory.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="px-2 py-1 rounded border border-border bg-background hover:bg-accent text-xs flex items-center gap-1 transition-colors"
                title={preset.description}
              >
                <span>{preset.icon}</span>
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleCreateEntity} className="space-y-3">
          <div className="grid grid-cols-4 gap-2">
            <div className="col-span-3">
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={activeCategoryMeta.placeholderName}
                className="input w-full text-sm h-9"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Emblem
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="input w-full text-center text-base h-9"
                maxLength={4}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Archetype / Government
              </label>
              <input
                type="text"
                value={archetype}
                onChange={(e) => setArchetype(e.target.value)}
                placeholder={activeCategoryMeta.placeholderArchetype}
                className="input w-full text-xs h-9"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Banner Color
              </label>
              <input
                type="color"
                aria-label="Entity Banner Color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-9 w-full rounded border border-border bg-background p-1 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Origin / Capital Tile (col,row)
              </label>
              <input
                type="text"
                value={originTileId}
                onChange={(e) => setOriginTileId(e.target.value)}
                placeholder="e.g., 10,6"
                className="input w-full text-xs h-9"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input w-full text-xs h-9"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Cultural Traditions & Traits (comma-separated)
            </label>
            <input
              type="text"
              value={traitsInput}
              onChange={(e) => setTraitsInput(e.target.value)}
              placeholder={activeCategoryMeta.placeholderTraits}
              className="input w-full text-xs h-9"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Powers, Skills & Special Abilities (comma-separated)
            </label>
            <input
              type="text"
              value={abilitiesInput}
              onChange={(e) => setAbilitiesInput(e.target.value)}
              placeholder={activeCategoryMeta.placeholderAbilities}
              className="input w-full text-xs h-9"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Codex Lore & History
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe their origins, culture, monuments, or ambitions..."
              className="input w-full text-sm min-h-[75px]"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Add to World Registry</span>
          </button>
        </form>
      </div>

      {/* Right: Illustrated World Codex & Wiki (7 cols) */}
      <div className="lg:col-span-7 card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h3 className="text-xl font-bold">
              World Codex & Wiki ({visibleEntities.length})
            </h3>
            <p className="text-xs text-muted-foreground">
              Encyclopedia of sentient species, kingdoms, and mythic forces
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(['all', 'species', 'society', 'myth'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'all'
                  ? 'All Entries'
                  : tab === 'species'
                  ? 'Races & Species'
                  : tab === 'society'
                  ? 'Civilizations'
                  : 'Myths & Plots'}
              </button>
            ))}
          </div>
        </div>

        {visibleEntities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
            <p className="text-sm">
              No codex entries in this category yet. Select a Quick Preset on the left or create your own!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleEntities.map((ent) => {
              const linkedTurns = drawHistory.filter(
                (rec) =>
                  rec.linkedEntityIds?.includes(ent.id) ||
                  (ent.originTileId && rec.linkedTileIds?.includes(ent.originTileId))
              )
              const territoryCount = countTerritoryTiles(ent.id)

              return (
                <div
                  key={ent.id}
                  className="p-4 rounded-lg border border-border bg-muted/25 space-y-3 flex flex-col justify-between relative overflow-hidden"
                  style={{
                    borderLeftWidth: '4px',
                    borderLeftColor: ent.color || '#6366f1',
                  }}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shadow-sm border border-border bg-background"
                          style={{ borderColor: ent.color }}
                        >
                          {ent.icon || '🚩'}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                              {ent.category}
                            </span>
                            {ent.archetype && (
                              <span className="text-[11px] text-muted-foreground italic truncate max-w-[140px]">
                                {ent.archetype}
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-bold leading-snug mt-0.5">
                            {ent.name}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <select
                          aria-label={`Status for ${ent.name}`}
                          value={ent.status}
                          onChange={(e) => handleStatusChange(ent.id, e.target.value)}
                          className="input text-[11px] py-0.5 px-1.5 h-7 w-auto"
                        >
                          {STATUS_OPTIONS.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleDeleteEntity(ent.id)}
                          className="p-1 text-muted-foreground hover:text-destructive rounded"
                          title="Delete codex entry"
                          aria-label={`Delete ${ent.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {ent.originTileId && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-primary" />
                          Seat: ({ent.originTileId})
                        </span>
                      )}
                      {territoryCount > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Shield className="h-3 w-3 text-primary" />
                          Territory: {territoryCount} tiles
                        </span>
                      )}
                    </div>

                    {ent.description && (
                      <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                        {ent.description}
                      </p>
                    )}

                    {ent.traits.length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block mb-1">
                          Traditions & Cultural Traits
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {ent.traits.map((trait) => (
                            <span
                              key={trait}
                              className="text-[11px] px-2 py-0.5 rounded bg-background border border-border text-foreground/80"
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {ent.abilities && ent.abilities.length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block mb-1">
                          Skills & Powers
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {ent.abilities.map((ab) => (
                            <span
                              key={ab}
                              className="text-[11px] px-2 py-0.5 rounded bg-primary/10 text-primary font-medium"
                            >
                              ⚡ {ab}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Linked Chronicle Events Preview */}
                  <div className="pt-2 border-t border-border/60 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Emerged in {ent.stageCreated}</span>
                      <span className="font-medium">
                        {linkedTurns.length} historical events
                      </span>
                    </div>
                    {linkedTurns.length > 0 && (
                      <div className="space-y-1 max-h-24 overflow-y-auto pt-1">
                        {linkedTurns.slice(-2).map((t) => (
                          <div
                            key={t.id}
                            className="text-[11px] p-1.5 rounded bg-background/70 border border-border/60 truncate"
                            title={t.note}
                          >
                            <strong>Turn #{t.moveId}:</strong> {t.note || t.power}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
