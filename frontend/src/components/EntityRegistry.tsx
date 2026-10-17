import React, { useState } from 'react'
import { Users, Crown, Sparkles, Plus, Trash2, MapPin } from 'lucide-react'
import { DrawRecord, EntityCategory, StageId, WorldEntity } from '../engine/types'

interface EntityRegistryProps {
  entities: WorldEntity[]
  currentStage: StageId
  drawHistory: DrawRecord[]
  onChange: (newEntities: WorldEntity[]) => void
}

const CATEGORIES: {
  id: EntityCategory
  label: string
  stageHint: string
  placeholderName: string
  placeholderTraits: string
  icon: typeof Users
}[] = [
  {
    id: 'species',
    label: 'Sentient Species',
    stageHint: '2. Primal Stage — Origin races, traditions, resources & skills',
    placeholderName: 'e.g., Sylvan Elves, Ironforge Dwarves...',
    placeholderTraits: 'e.g., Master Sailors, Sun Worship, Obsidian Smithing',
    icon: Users,
  },
  {
    id: 'society',
    label: 'Civilizations & Kingdoms',
    stageHint: '3. Civilization Stage — Nations, empires, monuments & diplomacy',
    placeholderName: 'e.g., Republic of Valoria, Ashen Empire...',
    placeholderTraits: 'e.g., Merchant Guilds, Grand Library, Naval Hegemony',
    icon: Crown,
  },
  {
    id: 'myth',
    label: 'Myths, Schemes & Conflicts',
    stageHint: '4. Intrigue Stage — Legends, ancient dragons, wars & secret pacts',
    placeholderName: 'e.g., The Crimson Conspiracy, Slumbering Leviathan...',
    placeholderTraits: 'e.g., Cursed Relic, Shadow Cabal, Prophecy',
    icon: Sparkles,
  },
]

const STATUS_OPTIONS = [
  'Flourishing',
  'Active',
  'Expanding',
  'At War',
  'Declining',
  'Dormant / Hidden',
  'Fallen / Ruined',
]

export function EntityRegistry({
  entities,
  currentStage,
  drawHistory,
  onChange,
}: EntityRegistryProps) {
  const [activeTab, setActiveTab] = useState<EntityCategory | 'all'>('all')
  const [name, setName] = useState('')
  const [category, setCategory] = useState<EntityCategory>('species')
  const [originTileId, setOriginTileId] = useState('')
  const [status, setStatus] = useState('Flourishing')
  const [description, setDescription] = useState('')
  const [traitsInput, setTraitsInput] = useState('')

  const activeCategoryMeta =
    CATEGORIES.find((c) => c.id === category) || CATEGORIES[0]

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
      status,
    }

    onChange([newEntity, ...entities])
    setName('')
    setOriginTileId('')
    setDescription('')
    setTraitsInput('')
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Create Entity Form */}
      <div className="card p-6 h-fit space-y-4">
        <div>
          <h3 className="text-xl font-bold">Register World Entity</h3>
          <p className="text-xs text-muted-foreground">
            Track species, civilizations, and mythic forces across the stages
          </p>
        </div>

        <form onSubmit={handleCreateEntity} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Entity Type
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2 rounded border text-xs flex flex-col items-center gap-1 transition-colors ${
                      category === cat.id
                        ? 'bg-primary text-primary-foreground border-primary font-semibold'
                        : 'bg-background border-border hover:bg-accent'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{cat.id === 'species' ? 'Species' : cat.id === 'society' ? 'Society' : 'Myth'}</span>
                  </button>
                )
              })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {activeCategoryMeta.stageHint}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={activeCategoryMeta.placeholderName}
              className="input w-full text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Origin Tile (col,row)
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
              Traits / Traditions / Skills (comma-separated)
            </label>
            <input
              type="text"
              value={traitsInput}
              onChange={(e) => setTraitsInput(e.target.value)}
              placeholder={activeCategoryMeta.placeholderTraits}
              className="input w-full text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Lore & Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe their origins, culture, monuments, or ambitions..."
              className="input w-full text-sm min-h-[80px]"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add to World Registry</span>
          </button>
        </form>
      </div>

      {/* Right: Registered Entities List */}
      <div className="lg:col-span-2 card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <h3 className="text-xl font-bold">
            World Registry ({visibleEntities.length})
          </h3>
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
                  ? 'All'
                  : tab === 'species'
                  ? 'Species'
                  : tab === 'society'
                  ? 'Societies'
                  : 'Myths & Plots'}
              </button>
            ))}
          </div>
        </div>

        {visibleEntities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
            <p className="text-sm">
              No entities registered in this category yet. Use the form on the left to add species, societies, or myths!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleEntities.map((ent) => {
              const linkedTurns = drawHistory.filter((rec) =>
                rec.linkedEntityIds?.includes(ent.id)
              )
              return (
                <div
                  key={ent.id}
                  className="p-4 rounded-lg border border-border bg-muted/30 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
                          {ent.category}
                        </span>
                        <h4 className="text-lg font-bold mt-1">{ent.name}</h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <select
                          aria-label={`Status for ${ent.name}`}
                          value={ent.status}
                          onChange={(e) => handleStatusChange(ent.id, e.target.value)}
                          className="input text-xs py-0.5 px-2 h-7"
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
                          title="Delete entity"
                          aria-label={`Delete ${ent.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {ent.originTileId && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-primary" />
                        <span>Origin / Seat: Tile ({ent.originTileId})</span>
                      </div>
                    )}

                    {ent.description && (
                      <p className="text-sm text-foreground/90">{ent.description}</p>
                    )}

                    {ent.traits.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {ent.traits.map((trait) => (
                          <span
                            key={trait}
                            className="text-[11px] px-2 py-0.5 rounded bg-background border border-border text-muted-foreground"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border/60 text-xs text-muted-foreground flex items-center justify-between">
                    <span>Founded in {ent.stageCreated}</span>
                    <span>{linkedTurns.length} linked timeline turns</span>
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
