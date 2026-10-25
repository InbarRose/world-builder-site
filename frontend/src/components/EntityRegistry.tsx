import React, { useState, useMemo } from 'react'
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
  Link2,
  ArrowLeftRight,
  Palette,
  Sliders,
  Search,
  Edit3,
  X,
  Eye,
  Clock,
} from 'lucide-react'
import {
  CompanionSettlementIcons,
  DrawRecord,
  EntityCategory,
  EntityRelationship,
  MapState,
  RelationshipType,
  StageId,
  WorldEntity,
} from '../engine/types'
import {
  COLOR_SWATCH_PALETTES,
  ENTITY_ICON_GALLERY,
  EntityPreset,
  MODULAR_ABILITY_BLOCKS,
  MODULAR_TRAIT_BLOCKS,
  MYTH_PRESETS,
  PLAYER_COLORS,
  RELATIONSHIP_PRESETS,
  SETTLEMENT_ICON_SETS,
  SOCIETY_PRESETS,
  SPECIES_PRESETS,
} from '../engine/presets'

interface EntityRegistryProps {
  entities: WorldEntity[]
  currentStage: StageId
  drawHistory: DrawRecord[]
  map?: MapState
  selectedEntityId?: string | null
  onSelectEntity?: (entityId: string | null) => void
  onSelectTile?: (tileId: string) => void
  onSelectEvent?: (moveId: number) => void
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
    stageHint:
      '2. Primal Stage — Start plain like Lego blocks! Pick icon, colors & settlements, then snap on traits & powers over time.',
    placeholderName: 'e.g., Sylvan Elves, Ironforge Dwarves...',
    placeholderArchetype: 'Optional subtitle (or leave blank)',
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

const DEFAULT_SETTLEMENT_ICONS: CompanionSettlementIcons = {
  camp: '⛺',
  village: '🏡',
  town: '🏘️',
  city: '🏰',
  metropolis: '👑',
  architectureStyle: 'Stone & Timber Keeps',
}

export function EntityRegistry({
  entities,
  currentStage,
  drawHistory,
  map,
  selectedEntityId,
  onSelectEntity,
  onSelectTile,
  onSelectEvent,
  onChange,
}: EntityRegistryProps) {
  const [activeTab, setActiveTab] = useState<EntityCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null)

  const inspectedEntityId =
    selectedEntityId !== undefined ? selectedEntityId : internalSelectedId
  const setInspectedEntityId = (id: string | null) => {
    setInternalSelectedId(id)
    onSelectEntity?.(id)
  }

  // Distinct View Mode vs Create/Edit Studio Drawer Toggle
  // Defaults to true when empty so new worlds can immediately pick a preset or create, or toggleable anytime
  const [isCreatorOpen, setIsCreatorOpen] = useState<boolean>(() => entities.length === 0)
  const [showRelationshipDrawer, setShowRelationshipDrawer] = useState<boolean>(false)

  // Form State (Create New or Edit Existing)
  const [editingFormEntityId, setEditingFormEntityId] = useState<string | null>(null)
  const [category, setCategory] = useState<EntityCategory>('species')
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🧝')
  const [color, setColor] = useState(PLAYER_COLORS[0])
  const [secondaryColor, setSecondaryColor] = useState('#fef3c7')
  const [archetype, setArchetype] = useState('')
  const [parentEntityId, setParentEntityId] = useState('')
  const [originTileId, setOriginTileId] = useState('')
  const [status, setStatus] = useState('Flourishing')
  const [description, setDescription] = useState('')
  const [traitsInput, setTraitsInput] = useState('')
  const [abilitiesInput, setAbilitiesInput] = useState('')
  const [settlementIcons, setSettlementIcons] = useState<CompanionSettlementIcons>({
    ...DEFAULT_SETTLEMENT_ICONS,
  })

  // Visual & Lego-Block Picker Drawers
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [showLegoBlocksDrawer, setShowLegoBlocksDrawer] = useState(false)
  const [editingEntityId, setEditingEntityId] = useState<string | null>(null)

  // Relationship Builder state
  const [relSourceId, setRelSourceId] = useState('')
  const [relTargetId, setRelTargetId] = useState('')
  const [relType, setRelType] = useState<RelationshipType>('alliance')
  const [relCustomLabel, setRelCustomLabel] = useState('')

  const activeCategoryMeta =
    CATEGORIES.find((c) => c.id === category) || CATEGORIES[0]

  const presetsForCategory: EntityPreset[] =
    category === 'species'
      ? SPECIES_PRESETS
      : category === 'society'
      ? SOCIETY_PRESETS
      : MYTH_PRESETS

  const parseCommaList = (raw: string): string[] =>
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

  const currentTraitsList = parseCommaList(traitsInput)
  const currentAbilitiesList = parseCommaList(abilitiesInput)

  const resetCreatorForm = (defaultCat: EntityCategory = category) => {
    const catMeta = CATEGORIES.find((c) => c.id === defaultCat) || CATEGORIES[0]
    setEditingFormEntityId(null)
    setCategory(defaultCat)
    setName('')
    setIcon(catMeta.defaultEmoji)
    setColor(PLAYER_COLORS[0])
    setSecondaryColor('#fef3c7')
    setArchetype('')
    setParentEntityId('')
    setOriginTileId('')
    setStatus('Flourishing')
    setDescription('')
    setTraitsInput('')
    setAbilitiesInput('')
    setSettlementIcons({ ...DEFAULT_SETTLEMENT_ICONS })
  }

  const handleLoadEntityIntoEditor = (ent: WorldEntity) => {
    setEditingFormEntityId(ent.id)
    setCategory(ent.category)
    setName(ent.name)
    setIcon(ent.icon || '🧝')
    setColor(ent.color || PLAYER_COLORS[0])
    setSecondaryColor(ent.secondaryColor || '#fef3c7')
    setArchetype(ent.archetype || '')
    setParentEntityId(ent.parentEntityId || '')
    setOriginTileId(ent.originTileId || '')
    setStatus(ent.status || 'Flourishing')
    setDescription(ent.description || '')
    setTraitsInput(ent.traits.join(', '))
    setAbilitiesInput((ent.abilities || []).join(', '))
    if (ent.settlementIcons) {
      setSettlementIcons({ ...ent.settlementIcons })
    }
    setIsCreatorOpen(true)
  }

  const toggleFormTraitBlock = (traitLabel: string) => {
    const list = parseCommaList(traitsInput)
    const next = list.includes(traitLabel)
      ? list.filter((t) => t !== traitLabel)
      : [...list, traitLabel]
    setTraitsInput(next.join(', '))
  }

  const toggleFormAbilityBlock = (abilityLabel: string) => {
    const list = parseCommaList(abilitiesInput)
    const next = list.includes(abilityLabel)
      ? list.filter((a) => a !== abilityLabel)
      : [...list, abilityLabel]
    setAbilitiesInput(next.join(', '))
  }

  const handleSwapFormColors = () => {
    const prevPrimary = color
    setColor(secondaryColor)
    setSecondaryColor(prevPrimary)
  }

  const handleApplyPreset = (preset: EntityPreset) => {
    setIsCreatorOpen(true)
    setCategory(preset.category)
    setName(preset.name)
    setIcon(preset.icon)
    setColor(preset.color)
    setSecondaryColor(preset.secondaryColor || '#fef3c7')
    setArchetype(preset.archetype || '')
    setDescription(preset.description || '')
    setTraitsInput((preset.traits || []).join(', '))
    setAbilitiesInput((preset.abilities || []).join(', '))
    if (preset.settlementIcons) {
      setSettlementIcons({ ...preset.settlementIcons })
    }
  }

  const handleCreateOrSaveEntity = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    if (editingFormEntityId) {
      onChange(
        entities.map((ent) =>
          ent.id === editingFormEntityId
            ? {
                ...ent,
                name: name.trim(),
                category,
                parentEntityId: parentEntityId || undefined,
                originTileId: originTileId.trim() || undefined,
                description: description.trim(),
                traits: parseCommaList(traitsInput),
                abilities: parseCommaList(abilitiesInput),
                status,
                icon: icon.trim() || activeCategoryMeta.defaultEmoji,
                color,
                secondaryColor,
                archetype: archetype.trim() || undefined,
                settlementIcons:
                  category === 'species' || category === 'society'
                    ? { ...settlementIcons }
                    : undefined,
              }
            : ent
        )
      )
      setInspectedEntityId(editingFormEntityId)
      resetCreatorForm(category)
      return
    }

    const newEntity: WorldEntity = {
      id: `entity_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      category,
      stageCreated: currentStage,
      parentEntityId: parentEntityId || undefined,
      originTileId: originTileId.trim() || undefined,
      description: description.trim(),
      traits: parseCommaList(traitsInput),
      abilities: parseCommaList(abilitiesInput),
      status,
      icon: icon.trim() || activeCategoryMeta.defaultEmoji,
      color,
      secondaryColor,
      archetype: archetype.trim() || undefined,
      settlementIcons:
        category === 'species' || category === 'society'
          ? { ...settlementIcons }
          : undefined,
      diplomaticLinks: [],
    }

    onChange([newEntity, ...entities])
    setInspectedEntityId(newEntity.id)
    resetCreatorForm(category)
  }

  const handleUpdateEntity = (id: string, updates: Partial<WorldEntity>) => {
    onChange(entities.map((ent) => (ent.id === id ? { ...ent, ...updates } : ent)))
  }

  const handleToggleEntityTrait = (ent: WorldEntity, traitLabel: string) => {
    const exists = ent.traits.includes(traitLabel)
    const nextTraits = exists
      ? ent.traits.filter((t) => t !== traitLabel)
      : [...ent.traits, traitLabel]
    handleUpdateEntity(ent.id, { traits: nextTraits })
  }

  const handleToggleEntityAbility = (ent: WorldEntity, abilityLabel: string) => {
    const current = ent.abilities || []
    const exists = current.includes(abilityLabel)
    const nextAbilities = exists
      ? current.filter((a) => a !== abilityLabel)
      : [...current, abilityLabel]
    handleUpdateEntity(ent.id, { abilities: nextAbilities })
  }

  const handleCreateRelationship = () => {
    if (!relSourceId || !relTargetId || relSourceId === relTargetId) return
    const sourceEnt = entities.find((e) => e.id === relSourceId)
    const targetEnt = entities.find((e) => e.id === relTargetId)
    if (!sourceEnt || !targetEnt) return

    const preset =
      RELATIONSHIP_PRESETS.find((r) => r.type === relType) || RELATIONSHIP_PRESETS[0]
    const label = relCustomLabel.trim() || preset.label

    const forwardLink: EntityRelationship = {
      id: `rel_${Date.now()}_f`,
      targetEntityId: targetEnt.id,
      targetEntityName: targetEnt.name,
      type: relType,
      label,
      icon: preset.icon,
    }
    const reverseLink: EntityRelationship = {
      id: `rel_${Date.now()}_r`,
      targetEntityId: sourceEnt.id,
      targetEntityName: sourceEnt.name,
      type: relType,
      label,
      icon: preset.icon,
    }

    onChange(
      entities.map((ent) => {
        if (ent.id === sourceEnt.id) {
          return {
            ...ent,
            diplomaticLinks: [...(ent.diplomaticLinks || []), forwardLink],
          }
        }
        if (ent.id === targetEnt.id) {
          return {
            ...ent,
            diplomaticLinks: [...(ent.diplomaticLinks || []), reverseLink],
          }
        }
        return ent
      })
    )
    setRelCustomLabel('')
  }

  const handleDeleteEntity = (id: string) => {
    if (inspectedEntityId === id) setInspectedEntityId(null)
    if (editingFormEntityId === id) resetCreatorForm()
    onChange(entities.filter((ent) => ent.id !== id))
  }

  const handleStatusChange = (id: string, newStatus: string) => {
    handleUpdateEntity(id, { status: newStatus })
  }

  const visibleEntities = useMemo(() => {
    return entities.filter((ent) => {
      if (activeTab !== 'all' && ent.category !== activeTab) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = ent.name.toLowerCase().includes(q)
        const matchArch = ent.archetype?.toLowerCase().includes(q)
        const matchDesc = ent.description?.toLowerCase().includes(q)
        const matchTrait = ent.traits.some((t) => t.toLowerCase().includes(q))
        const matchAbil = ent.abilities?.some((a) => a.toLowerCase().includes(q))
        const matchTile = ent.originTileId?.toLowerCase().includes(q)
        if (!matchName && !matchArch && !matchDesc && !matchTrait && !matchAbil && !matchTile) {
          return false
        }
      }
      return true
    })
  }, [entities, activeTab, searchQuery])

  const speciesList = entities.filter((e) => e.category === 'species')
  const inspectedEntity = entities.find((e) => e.id === inspectedEntityId) || null

  const getClaimedTileIds = (entityId: string): string[] => {
    if (!map) return []
    return Object.values(map.tiles)
      .filter((t) => t.territoryId === entityId || t.linkedEntityIds.includes(entityId))
      .map((t) => t.id)
  }

  const countTerritoryTiles = (entityId: string): number => {
    if (!map) return 0
    return Object.values(map.tiles).filter((t) => t.territoryId === entityId).length
  }

  return (
    <div className="space-y-5">
      {/* =========================================================================
          TOP CODEX WIKI HEADER BAR: Distinct Read/Browse vs. Create/Edit Controls
          ========================================================================= */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-3 border-border/80 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold">
                World Codex & Wiki ({visibleEntities.length})
              </h3>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  isCreatorOpen
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                    : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {isCreatorOpen
                  ? editingFormEntityId
                    ? '✏️ Editing Entry'
                    : '✨ Creator Drawer Open'
                  : '👁️ Browse Wiki Mode'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Click any entry, trait, relationship, or map coordinate to inspect its interconnected lore
            </p>
          </div>
        </div>

        {/* Right: Mode Toggles (+ New Entry, Forge Link, Browse Only) */}
        <div className="flex flex-wrap items-center gap-2">
          {entities.length >= 2 && (
            <button
              type="button"
              onClick={() => setShowRelationshipDrawer((v) => !v)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                showRelationshipDrawer
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:bg-accent'
              }`}
            >
              <Link2 className="h-3.5 w-3.5" />
              <span>Forge Relationship</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (isCreatorOpen && !editingFormEntityId) {
                setIsCreatorOpen(false)
              } else {
                resetCreatorForm(category)
                setIsCreatorOpen(true)
              }
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              isCreatorOpen && !editingFormEntityId
                ? 'bg-secondary text-secondary-foreground border border-border'
                : 'btn-primary shadow-sm'
            }`}
          >
            {isCreatorOpen && !editingFormEntityId ? (
              <>
                <Eye className="h-3.5 w-3.5" />
                <span>Focus Wiki Reader</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span>+ New Codex Entry</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Diplomatic & Lineage Relationship Forger Drawer */}
      {showRelationshipDrawer && entities.length >= 2 && (
        <div className="card p-4 space-y-3 border-primary/30 bg-primary/[0.02]">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" />
              <div>
                <h4 className="text-sm font-bold">Forge Diplomatic / Historical Link</h4>
                <p className="text-[11px] text-muted-foreground">
                  Connect nations, species, or cities with alliances, marriages, trade, or rivalries
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowRelationshipDrawer(false)}
              className="p-1 hover:bg-accent rounded"
              aria-label="Close Relationship Forger"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <select
              aria-label="First Entity"
              value={relSourceId}
              onChange={(e) => setRelSourceId(e.target.value)}
              className="input h-8 text-xs py-1"
            >
              <option value="">Select First Entity...</option>
              {entities.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.icon} {e.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Relationship Type"
              value={relType}
              onChange={(e) => setRelType(e.target.value as RelationshipType)}
              className="input h-8 text-xs py-1"
            >
              {RELATIONSHIP_PRESETS.map((r) => (
                <option key={r.type} value={r.type}>
                  {r.icon} {r.label}
                </option>
              ))}
            </select>
            <select
              aria-label="Second Entity"
              value={relTargetId}
              onChange={(e) => setRelTargetId(e.target.value)}
              className="input h-8 text-xs py-1"
            >
              <option value="">Select Second Entity...</option>
              {entities.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.icon} {e.name}
                </option>
              ))}
            </select>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={relCustomLabel}
                onChange={(e) => setRelCustomLabel(e.target.value)}
                placeholder="Treaty/War name..."
                className="input h-8 text-xs flex-1"
              />
              <button
                type="button"
                onClick={handleCreateRelationship}
                disabled={!relSourceId || !relTargetId || relSourceId === relTargetId}
                className="btn-primary px-3 h-8 text-xs font-semibold shrink-0 disabled:opacity-50"
              >
                Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MAIN WORKSPACE SPLIT: Creator/Editor Drawer (When Open) + Wiki Gallery
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Modular Lego-Block Creator & Preset Library Drawer (5 cols when open) */}
        {isCreatorOpen && (
          <div className="lg:col-span-5 space-y-5">
            <div className="card p-5 space-y-4 border-primary/30 shadow-md">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="text-base font-bold">
                      {editingFormEntityId ? 'Edit Codex Entry' : 'Modular Codex Builder'}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      {editingFormEntityId
                        ? 'Modify name, colors, icons, qualities, or origin seat'
                        : 'Pick an editable preset or start blank, then snap on qualities & powers'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    resetCreatorForm()
                    setIsCreatorOpen(false)
                  }}
                  className="p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground"
                  title="Close Creator Drawer"
                >
                  <X className="h-4 w-4" />
                </button>
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
                          if (!editingFormEntityId) setIcon(cat.defaultEmoji)
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

              {/* Built-in Presets Bar (Loads into form for full editing!) */}
              <div className="bg-muted/40 p-3 rounded-lg border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold flex items-center gap-1.5 text-primary">
                    <Wand2 className="h-3.5 w-3.5" />
                    <span>Quick Presets (Click to Load & Customize)</span>
                  </div>
                  {category === 'species' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                      🧱 Editable Base
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                  {presetsForCategory.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="px-2 py-1 rounded border border-border bg-background hover:bg-accent text-xs flex items-center gap-1.5 transition-colors"
                      title={`${preset.name} (${preset.settlementIcons.camp}→${preset.settlementIcons.metropolis})`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/20"
                        style={{
                          background: `linear-gradient(135deg, ${preset.color} 50%, ${preset.secondaryColor} 50%)`,
                        }}
                      />
                      <span>{preset.icon}</span>
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleCreateOrSaveEntity} className="space-y-3.5">
                {/* Name & Emblem + Visual Preview */}
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-7">
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
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Icon
                    </label>
                    <input
                      type="text"
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      className="input w-full text-center text-base h-9 px-1"
                      maxLength={4}
                    />
                  </div>
                  <div className="col-span-3">
                    <button
                      type="button"
                      onClick={() => setShowIconPicker(!showIconPicker)}
                      className={`w-full h-9 rounded border text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                        showIconPicker
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border hover:bg-accent'
                      }`}
                    >
                      <span>{icon}</span>
                      <span>Icons</span>
                    </button>
                  </div>
                </div>

                {/* Expandable Categorized Icon Gallery */}
                {showIconPicker && (
                  <div className="p-3 rounded-lg border border-primary/40 bg-muted/30 space-y-2.5 max-h-56 overflow-y-auto">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">
                        Choose an Emblem Icon
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowIconPicker(false)}
                        className="text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        Done
                      </button>
                    </div>
                    {ENTITY_ICON_GALLERY.map((group) => (
                      <div key={group.category} className="space-y-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                          {group.category}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {group.icons.map((item) => (
                            <button
                              key={item.icon + item.label}
                              type="button"
                              onClick={() => setIcon(item.icon)}
                              className={`w-8 h-8 rounded border flex items-center justify-center text-base transition-all ${
                                icon === item.icon
                                  ? 'border-primary bg-primary/15 ring-1 ring-primary scale-105'
                                  : 'border-border bg-background hover:bg-accent'
                              }`}
                              title={item.label}
                            >
                              {item.icon}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Primary & Secondary Color Swatch Picker + 1-Click Swap */}
                <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold flex items-center gap-1.5">
                      <Palette className="h-3.5 w-3.5 text-primary" />
                      <span>Primary & Secondary Color Swatches</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleSwapFormColors}
                      className="px-2 py-0.5 rounded border border-border bg-background hover:bg-accent text-[11px] font-medium flex items-center gap-1"
                      title="Swap Primary and Secondary colors"
                    >
                      <ArrowLeftRight className="h-3 w-3" />
                      <span>Swap Primary ↔ Secondary</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4 flex items-center gap-1.5">
                      <input
                        type="color"
                        aria-label="Entity Banner Color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="h-8 w-10 rounded border border-border bg-background p-0.5 cursor-pointer"
                      />
                      <span className="text-[11px] text-muted-foreground">Primary</span>
                    </div>
                    <div className="col-span-4 flex items-center gap-1.5">
                      <input
                        type="color"
                        aria-label="Entity Secondary Color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="h-8 w-10 rounded border border-border bg-background p-0.5 cursor-pointer"
                      />
                      <span className="text-[11px] text-muted-foreground">Secondary</span>
                    </div>
                    <div className="col-span-4 flex items-center justify-end">
                      <div
                        className="px-2.5 py-1 rounded-md border-2 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                        style={{
                          borderColor: color,
                          backgroundColor: `${secondaryColor}44`,
                        }}
                      >
                        <span>{icon}</span>
                        <span className="truncate max-w-[70px]">{name || 'Preview'}</span>
                      </div>
                    </div>
                  </div>

                  {/* 12 Curated Dual-Color Swatch Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {COLOR_SWATCH_PALETTES.map((sw) => {
                      const isMatch =
                        color.toLowerCase() === sw.primary.toLowerCase() &&
                        secondaryColor.toLowerCase() === sw.secondary.toLowerCase()
                      return (
                        <button
                          key={sw.id}
                          type="button"
                          onClick={() => {
                            setColor(sw.primary)
                            setSecondaryColor(sw.secondary)
                          }}
                          className={`h-6 px-2 rounded-full border text-[10px] font-medium flex items-center gap-1.5 transition-all ${
                            isMatch
                              ? 'border-primary ring-2 ring-primary/40 bg-background font-bold'
                              : 'border-border bg-background/80 hover:bg-accent'
                          }`}
                          title={sw.name}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${sw.primary} 50%, ${sw.secondary} 50%)`,
                            }}
                          />
                          <span className="hidden sm:inline">{sw.name.split(' ')[0]}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {category === 'society' && speciesList.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Founding / Ancestral Species (Lineage)
                    </label>
                    <select
                      value={parentEntityId}
                      onChange={(e) => setParentEntityId(e.target.value)}
                      className="input w-full text-xs h-8"
                    >
                      <option value="">Multi-Species / Independent</option>
                      {speciesList.map((sp) => (
                        <option key={sp.id} value={sp.id}>
                          {sp.icon} {sp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Companion Settlement Icons Progression (Camp -> Village -> Town -> City -> Metropolis) */}
                {(category === 'species' || category === 'society') && (
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="text-[11px] font-bold text-primary">
                        Companion Map Settlement Icons
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {SETTLEMENT_ICON_SETS.map((setPreset) => (
                          <button
                            key={setPreset.id}
                            type="button"
                            onClick={() => setSettlementIcons({ ...setPreset.icons })}
                            className="px-1.5 py-0.5 rounded border border-border bg-background hover:bg-accent text-[10px]"
                            title={`Load ${setPreset.name}: ${setPreset.icons.camp}→${setPreset.icons.metropolis}`}
                          >
                            {setPreset.icons.camp}→{setPreset.icons.metropolis}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 text-center">
                      {(
                        [
                          ['camp', 'Camp'],
                          ['village', 'Village'],
                          ['town', 'Town'],
                          ['city', 'City'],
                          ['metropolis', 'Capital'],
                        ] as const
                      ).map(([key, label]) => (
                        <div key={key}>
                          <span className="text-[9px] text-muted-foreground block">
                            {label}
                          </span>
                          <input
                            type="text"
                            value={settlementIcons[key]}
                            onChange={(e) =>
                              setSettlementIcons({
                                ...settlementIcons,
                                [key]: e.target.value,
                              })
                            }
                            className="input h-7 w-full text-center text-xs px-0.5"
                            maxLength={4}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Subtitle / Style
                    </label>
                    <input
                      type="text"
                      value={archetype}
                      onChange={(e) => setArchetype(e.target.value)}
                      placeholder={activeCategoryMeta.placeholderArchetype}
                      className="input w-full text-xs h-8"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Seat Tile (col,row)
                    </label>
                    <input
                      type="text"
                      value={originTileId}
                      onChange={(e) => setOriginTileId(e.target.value)}
                      placeholder="e.g., 10,6"
                      className="input w-full text-xs h-8"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="input w-full text-xs h-8 py-0"
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Snap-On Modular Lego Blocks Toggle */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Qualities, Traits & Powers (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowLegoBlocksDrawer(!showLegoBlocksDrawer)}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>🧱 {showLegoBlocksDrawer ? 'Hide Lego Blocks' : 'Snap Modular Blocks'}</span>
                    </button>
                  </div>

                  {showLegoBlocksDrawer && (
                    <div className="p-3 rounded-lg border border-primary/40 bg-primary/[0.03] space-y-3 max-h-64 overflow-y-auto">
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-primary block">
                          Snap-On Trait & Tradition Blocks:
                        </span>
                        {MODULAR_TRAIT_BLOCKS.map((grp) => (
                          <div key={grp.category} className="space-y-1">
                            <span className="text-[10px] text-muted-foreground font-semibold block">
                              {grp.suitHint} {grp.category}
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {grp.items.map((item) => {
                                const active = currentTraitsList.includes(item.label)
                                return (
                                  <button
                                    key={item.label}
                                    type="button"
                                    onClick={() => toggleFormTraitBlock(item.label)}
                                    className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
                                      active
                                        ? 'bg-primary text-primary-foreground border-primary font-semibold'
                                        : 'bg-background border-border hover:bg-accent'
                                    }`}
                                  >
                                    {item.icon} {item.label}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-border/60">
                        <span className="text-[11px] font-bold text-primary block">
                          Snap-On Power & Ability Blocks:
                        </span>
                        {MODULAR_ABILITY_BLOCKS.map((grp) => (
                          <div key={grp.category} className="space-y-1">
                            <span className="text-[10px] text-muted-foreground font-semibold block">
                              {grp.suitHint} {grp.category}
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {grp.items.map((item) => {
                                const active = currentAbilitiesList.includes(item.label)
                                return (
                                  <button
                                    key={item.label}
                                    type="button"
                                    onClick={() => toggleFormAbilityBlock(item.label)}
                                    className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
                                      active
                                        ? 'bg-primary text-primary-foreground border-primary font-semibold'
                                        : 'bg-background border-border hover:bg-accent'
                                    }`}
                                  >
                                    {item.icon} {item.label}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <input
                    type="text"
                    value={traitsInput}
                    onChange={(e) => setTraitsInput(e.target.value)}
                    placeholder={activeCategoryMeta.placeholderTraits}
                    className="input w-full text-xs h-8"
                  />
                  <input
                    type="text"
                    value={abilitiesInput}
                    onChange={(e) => setAbilitiesInput(e.target.value)}
                    placeholder={activeCategoryMeta.placeholderAbilities}
                    className="input w-full text-xs h-8"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Codex Notes / Lore (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Leave blank to start plain, or record notes as their story unfolds..."
                    className="input w-full text-xs min-h-[54px]"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold"
                  >
                    <Plus className="h-4 w-4" />
                    <span>
                      {editingFormEntityId ? 'Save Changes' : 'Add to World Registry'}
                    </span>
                  </button>
                  {editingFormEntityId && (
                    <button
                      type="button"
                      onClick={() => resetCreatorForm()}
                      className="btn-outline px-3 py-2 text-xs"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Right: Illustrated World Codex & Wiki Reader (12 cols when Creator closed, 7 cols when open) */}
        <div
          className={`${
            isCreatorOpen ? 'lg:col-span-7' : 'lg:col-span-12'
          } card p-5 sm:p-6 space-y-5 h-fit`}
        >
          {/* Search & Category Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter codex by name, quality, trait, or tile..."
                className="input h-9 pl-9 text-xs w-full"
              />
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

          {/* Focused Wiki Entity Spotlight Banner (When an Entity is clicked/inspected) */}
          {inspectedEntity && (
            <div
              className="p-4 rounded-xl border-2 bg-primary/[0.03] space-y-3 relative"
              style={{ borderColor: inspectedEntity.color || '#6366f1' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-sm border-2 bg-background shrink-0"
                    style={{
                      borderColor: inspectedEntity.color,
                      backgroundColor: inspectedEntity.secondaryColor
                        ? `${inspectedEntity.secondaryColor}44`
                        : undefined,
                    }}
                  >
                    {inspectedEntity.icon || '🚩'}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary text-primary-foreground">
                        Wiki Focus · {inspectedEntity.category}
                      </span>
                      <span className="text-xs text-muted-foreground font-semibold">
                        {inspectedEntity.status}
                      </span>
                    </div>
                    <h4 className="text-lg font-extrabold mt-0.5">
                      {inspectedEntity.name}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleLoadEntityIntoEditor(inspectedEntity)}
                    className="btn-outline px-2.5 py-1 text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit Full Entry</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectedEntityId(null)}
                    className="p-1 rounded hover:bg-accent text-muted-foreground"
                    title="Close Spotlight"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {inspectedEntity.description && (
                <p className="text-xs sm:text-sm leading-relaxed text-foreground/90">
                  {inspectedEntity.description}
                </p>
              )}

              {/* Clickable Connected Map Tiles */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {inspectedEntity.originTileId && (
                  <button
                    type="button"
                    onClick={() => onSelectTile?.(inspectedEntity.originTileId!)}
                    className="px-2.5 py-1 rounded-md bg-background border border-primary/40 text-primary font-semibold hover:bg-primary/10 flex items-center gap-1"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Seat Tile ({inspectedEntity.originTileId})</span>
                  </button>
                )}
                {getClaimedTileIds(inspectedEntity.id)
                  .slice(0, 6)
                  .map((tid) => (
                    <button
                      key={tid}
                      type="button"
                      onClick={() => onSelectTile?.(tid)}
                      className="px-2 py-0.5 rounded bg-background border border-border hover:border-primary text-[11px] font-mono"
                    >
                      🗺️ ({tid})
                    </button>
                  ))}
              </div>
            </div>
          )}

          {visibleEntities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl space-y-3">
              <p className="text-sm">
                No codex entries match your filter yet.
              </p>
              {!isCreatorOpen && (
                <button
                  type="button"
                  onClick={() => setIsCreatorOpen(true)}
                  className="btn-primary px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create or Load a Preset Entry</span>
                </button>
              )}
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 ${
                isCreatorOpen ? 'md:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-3'
              } gap-4`}
            >
              {visibleEntities.map((ent) => {
                const linkedTurns = drawHistory.filter(
                  (rec) =>
                    rec.linkedEntityIds?.includes(ent.id) ||
                    (ent.originTileId && rec.linkedTileIds?.includes(ent.originTileId))
                )
                const territoryCount = countTerritoryTiles(ent.id)
                const parentSpecies = ent.parentEntityId
                  ? entities.find((e) => e.id === ent.parentEntityId)
                  : undefined
                const isCustomizing = editingEntityId === ent.id
                const isSpotlighted = inspectedEntityId === ent.id

                return (
                  <div
                    key={ent.id}
                    className={`p-4 rounded-xl border bg-muted/25 space-y-3 flex flex-col justify-between relative overflow-hidden transition-all ${
                      isSpotlighted
                        ? 'border-primary ring-1 ring-primary shadow-md'
                        : 'border-border hover:border-primary/40'
                    }`}
                    style={{
                      borderLeftWidth: '4px',
                      borderLeftColor: ent.color || '#6366f1',
                    }}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setInspectedEntityId(isSpotlighted ? null : ent.id)
                          }
                          className="flex items-center gap-2.5 text-left group min-w-0"
                        >
                          <span
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shadow-sm border-2 bg-background shrink-0 group-hover:scale-105 transition-transform"
                            style={{
                              borderColor: ent.color,
                              backgroundColor: ent.secondaryColor
                                ? `${ent.secondaryColor}44`
                                : undefined,
                            }}
                          >
                            {ent.icon || '🚩'}
                          </span>
                          <div className="min-w-0">
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
                            <h4 className="text-base font-bold leading-snug mt-0.5 group-hover:text-primary transition-colors truncate">
                              {ent.name}
                            </h4>
                          </div>
                        </button>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingEntityId(isCustomizing ? null : ent.id)
                            }
                            className={`px-2 py-1 rounded border text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                              isCustomizing
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background border-border hover:bg-accent'
                            }`}
                            title="Snap modular traits, powers, icons, or swap color swatches"
                          >
                            <Sliders className="h-3 w-3" />
                            <span>🧱 Snap</span>
                          </button>
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

                      {/* Clickable Spatial & Lineage Wiki Pills */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {ent.originTileId && (
                          <button
                            type="button"
                            onClick={() => onSelectTile?.(ent.originTileId!)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-background border border-border hover:border-primary hover:text-primary transition-colors"
                            title={`Inspect Tile (${ent.originTileId}) on the Map`}
                          >
                            <MapPin className="h-3 w-3 text-primary" />
                            <span>Seat: ({ent.originTileId})</span>
                          </button>
                        )}
                        {territoryCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-background border border-border">
                            <Shield className="h-3 w-3 text-primary" />
                            <span>Territory: {territoryCount} tiles</span>
                          </span>
                        )}
                        {parentSpecies && (
                          <button
                            type="button"
                            onClick={() => setInspectedEntityId(parentSpecies.id)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary font-medium hover:underline"
                          >
                            <span>Lineage: {parentSpecies.icon} {parentSpecies.name}</span>
                          </button>
                        )}
                      </div>

                      {/* Companion Settlement Icon Strip */}
                      {ent.settlementIcons && (
                        <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-background/80 border border-border/60 text-[11px]">
                          <span className="text-muted-foreground font-medium">
                            {ent.settlementIcons.architectureStyle || 'Settlements'}:
                          </span>
                          <span
                            className="flex items-center gap-1.5 text-sm"
                            title="Camp → Village → Town → City → Capital"
                          >
                            <span>{ent.settlementIcons.camp}</span>
                            <span className="text-[9px] text-muted-foreground">→</span>
                            <span>{ent.settlementIcons.village}</span>
                            <span className="text-[9px] text-muted-foreground">→</span>
                            <span>{ent.settlementIcons.town}</span>
                            <span className="text-[9px] text-muted-foreground">→</span>
                            <span>{ent.settlementIcons.city}</span>
                            <span className="text-[9px] text-muted-foreground">→</span>
                            <span>{ent.settlementIcons.metropolis}</span>
                          </span>
                        </div>
                      )}

                      {/* Inline Modular Lego-Block & Swatch Customizer */}
                      {isCustomizing && (
                        <div className="p-3 rounded-lg border border-primary/40 bg-background space-y-2.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-primary">
                              🧱 Modular Blocks & Swatches
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateEntity(ent.id, {
                                  color: ent.secondaryColor || '#fef3c7',
                                  secondaryColor: ent.color || '#10b981',
                                })
                              }
                              className="px-2 py-0.5 rounded border border-border hover:bg-accent text-[10px] font-semibold flex items-center gap-1"
                            >
                              <ArrowLeftRight className="h-3 w-3" />
                              <span>Swap Primary ↔ Secondary</span>
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {COLOR_SWATCH_PALETTES.slice(0, 8).map((sw) => (
                              <button
                                key={sw.id}
                                type="button"
                                onClick={() =>
                                  handleUpdateEntity(ent.id, {
                                    color: sw.primary,
                                    secondaryColor: sw.secondary,
                                  })
                                }
                                className="w-5 h-5 rounded-full border border-black/20"
                                style={{
                                  background: `linear-gradient(135deg, ${sw.primary} 50%, ${sw.secondary} 50%)`,
                                }}
                                title={sw.name}
                              />
                            ))}
                          </div>

                          <div>
                            <span className="text-[10px] font-semibold text-muted-foreground block mb-1">
                              Click to Snap/Unsnap Traits:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {MODULAR_TRAIT_BLOCKS.flatMap((g) => g.items)
                                .slice(0, 10)
                                .map((item) => {
                                  const has = ent.traits.includes(item.label)
                                  return (
                                    <button
                                      key={item.label}
                                      type="button"
                                      onClick={() =>
                                        handleToggleEntityTrait(ent, item.label)
                                      }
                                      className={`px-1.5 py-0.5 rounded text-[10px] border ${
                                        has
                                          ? 'bg-primary text-primary-foreground border-primary font-semibold'
                                          : 'bg-muted/40 border-border hover:bg-accent'
                                      }`}
                                    >
                                      {item.icon} {item.label}
                                    </button>
                                  )
                                })}
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-semibold text-muted-foreground block mb-1">
                              Click to Snap/Unsnap Powers:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {MODULAR_ABILITY_BLOCKS.flatMap((g) => g.items)
                                .slice(0, 10)
                                .map((item) => {
                                  const has = (ent.abilities || []).includes(item.label)
                                  return (
                                    <button
                                      key={item.label}
                                      type="button"
                                      onClick={() =>
                                        handleToggleEntityAbility(ent, item.label)
                                      }
                                      className={`px-1.5 py-0.5 rounded text-[10px] border ${
                                        has
                                          ? 'bg-primary text-primary-foreground border-primary font-semibold'
                                          : 'bg-muted/40 border-border hover:bg-accent'
                                      }`}
                                    >
                                      {item.icon} {item.label}
                                    </button>
                                  )
                                })}
                            </div>
                          </div>

                          <textarea
                            value={ent.description || ''}
                            onChange={(e) =>
                              handleUpdateEntity(ent.id, { description: e.target.value })
                            }
                            placeholder="Add custom lore or description..."
                            className="input w-full text-xs min-h-[46px]"
                          />
                        </div>
                      )}

                      {ent.description ? (
                        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                          {ent.description}
                        </p>
                      ) : (
                        ent.traits.length === 0 &&
                        (!ent.abilities || ent.abilities.length === 0) && (
                          <p className="text-[11px] italic text-muted-foreground">
                            Plain modular foundation — draw cards or click "🧱 Snap" to add traits, traditions & powers.
                          </p>
                        )
                      )}

                      {ent.traits.length > 0 && (
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block mb-1">
                            Traditions, Qualities & Resources
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {ent.traits.map((trait) => (
                              <button
                                key={trait}
                                type="button"
                                onClick={() => setSearchQuery(trait)}
                                className="text-[11px] px-2 py-0.5 rounded bg-background border border-border hover:border-primary text-foreground/80 transition-colors"
                                title={`Filter Codex by "${trait}"`}
                              >
                                {trait}
                              </button>
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
                              <button
                                key={ab}
                                type="button"
                                onClick={() => setSearchQuery(ab)}
                                className="text-[11px] px-2 py-0.5 rounded bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
                                title={`Filter Codex by "${ab}"`}
                              >
                                ⚡ {ab}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Clickable Diplomatic Links & Relations */}
                      {ent.diplomaticLinks && ent.diplomaticLinks.length > 0 && (
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block mb-1">
                            Diplomatic Relations & Lineage
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {ent.diplomaticLinks.map((rel) => (
                              <button
                                key={rel.id}
                                type="button"
                                onClick={() => setInspectedEntityId(rel.targetEntityId)}
                                className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 hover:border-amber-500 text-foreground font-medium transition-colors"
                                title={`Inspect ${rel.targetEntityName} in Codex`}
                              >
                                {rel.icon} {rel.label} with <strong>{rel.targetEntityName}</strong>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Linked Chronicle Events Preview (Clickable to jump to Turn) */}
                    <div className="pt-2 border-t border-border/60 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Emerged in {ent.stageCreated}</span>
                        <span className="font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{linkedTurns.length} historical events</span>
                        </span>
                      </div>
                      {linkedTurns.length > 0 && (
                        <div className="space-y-1 max-h-24 overflow-y-auto pt-1">
                          {linkedTurns.slice(-2).map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => onSelectEvent?.(t.moveId)}
                              className="w-full text-left text-[11px] p-1.5 rounded bg-background/70 border border-border/60 hover:border-primary truncate block transition-colors"
                              title={t.note || t.power}
                            >
                              <strong>Turn #{t.moveId}:</strong> {t.note || t.power}
                            </button>
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
    </div>
  )
}
