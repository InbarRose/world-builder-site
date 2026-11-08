import { useState, useMemo } from 'react'
import {
  X,
  Search,
  BookOpen,
  Copy,
  Check,
  ChevronRight,
  Filter,
} from 'lucide-react'
import {
  CompendiumCategory,
  CompendiumItem,
  getCompendiumCategories,
  searchCompendium,
} from '../engine/compendiumEngine'
import { STAGE_ACTION_PRESETS, StageActionPreset } from '../engine/presets'
import { StageId } from '../engine/types'

interface PresetCompendiumModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectActionPreset?: (preset: StageActionPreset) => void
  currentStage?: StageId
}

export function PresetCompendiumModal({
  isOpen,
  onClose,
  onSelectActionPreset,
  currentStage,
}: PresetCompendiumModalProps) {
  const [activeCategory, setActiveCategory] = useState<CompendiumCategory>('all')
  const [selectedStage, setSelectedStage] = useState<StageId | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const categories = useMemo(() => getCompendiumCategories(), [])

  const filteredItems = useMemo(() => {
    return searchCompendium({
      query: searchQuery,
      category: activeCategory,
      stage: selectedStage,
    })
  }, [searchQuery, activeCategory, selectedStage])

  if (!isOpen) return null

  const handleCopyText = (item: CompendiumItem) => {
    const textToCopy = `**${item.title}** (${item.subtitle || item.categoryLabel})
${item.summary}
${item.description}
${item.tabletopPrompt ? `\nPrompt: ${item.tabletopPrompt}` : ''}
${item.exampleNarrative ? `\nNarrative: "${item.exampleNarrative}"` : ''}`

    navigator.clipboard.writeText(textToCopy)
    setCopiedId(item.id)
    setTimeout(() => {
      setCopiedId(null)
    }, 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compendium-title"
    >
      <div className="bg-card border border-border w-full max-w-6xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border bg-muted/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 id="compendium-title" className="text-lg font-bold flex items-center gap-2">
                <span>Tabletop Presets & Tropes Compendium</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-mono">
                  {filteredItems.length} Entries
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Inventory of canonical stage powers, whiteboard cartography tropes, cultural traditions, and tabletop archetypes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Close Compendium"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-4 border-b border-border bg-background/95 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search presets, traditions, traits, powers, or whiteboard tropes..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:ring-2 focus:ring-primary focus:bg-background outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Stage Filter */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
              <span className="text-[11px] font-semibold text-muted-foreground mr-1 hidden sm:inline">Stage:</span>
              {(['all', 'genesis', 'primal', 'civilization', 'intrigue'] as const).map((stg) => {
                const isActive = selectedStage === stg
                return (
                  <button
                    key={stg}
                    type="button"
                    onClick={() => setSelectedStage(stg)}
                    className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-all ${
                      isActive
                        ? 'bg-foreground text-background shadow-sm'
                        : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {stg === 'all' ? 'All Stages' : currentStage === stg ? `${stg} (Current)` : stg}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Compendium Grid Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/10">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground space-y-2">
              <Filter className="h-8 w-8 mx-auto opacity-40" />
              <div className="font-semibold text-sm">No compendium entries found</div>
              <p className="text-xs max-w-sm mx-auto">
                No presets or tropes matched &ldquo;{searchQuery}&rdquo;. Try clearing your search query or selecting &ldquo;All Items&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setActiveCategory('all')
                  setSelectedStage('all')
                }}
                className="mt-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredItems.map((item) => {
                const isCopied = copiedId === item.id
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-card border border-border/80 shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-2">
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-2xl shrink-0 p-1 rounded-lg bg-muted/60">{item.icon}</span>
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                              {item.title}
                            </h3>
                            {item.subtitle && (
                              <div className="text-[11px] text-muted-foreground truncate">{item.subtitle}</div>
                            )}
                          </div>
                        </div>

                        {/* Stage / Suit Badge */}
                        {item.stage && (
                          <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted border border-border/60 text-muted-foreground uppercase">
                            {item.stage} {item.suit}
                          </span>
                        )}
                      </div>

                      {/* Summary & Description */}
                      <p className="text-xs leading-relaxed text-foreground/90 font-medium">
                        {item.summary}
                      </p>
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>

                      {/* Tabletop Prompt */}
                      {item.tabletopPrompt && (
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-200">
                          <strong className="font-semibold text-amber-700 dark:text-amber-400">💡 Prompt: </strong>
                          <span>{item.tabletopPrompt}</span>
                        </div>
                      )}

                      {/* Example Narrative */}
                      {item.exampleNarrative && (
                        <div className="text-[11px] italic text-muted-foreground border-l-2 border-primary/40 pl-2 leading-relaxed">
                          &ldquo;{item.exampleNarrative}&rdquo;
                        </div>
                      )}
                    </div>

                    {/* Footer Tags & Actions */}
                    <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2 text-xs">
                      {/* Tag Chips */}
                      <div className="flex flex-wrap items-center gap-1 overflow-hidden">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.2 rounded bg-muted text-[9px] text-muted-foreground font-mono"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {onSelectActionPreset && item.category === 'actions' && (
                          <button
                            type="button"
                            onClick={() => {
                              const rawId = item.id.replace('action_', '')
                              const preset = STAGE_ACTION_PRESETS.find((p) => p.id === rawId)
                              if (preset) {
                                onSelectActionPreset(preset)
                                onClose()
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold hover:bg-primary/90 transition-all flex items-center gap-1 shadow-sm"
                            title="Select this preset for the active turn"
                          >
                            <span>Apply</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCopyText(item)}
                          className="px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-[11px] font-medium transition-all flex items-center gap-1"
                          title="Copy lore and narrative to clipboard"
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy Lore</span>
                            </>
                          )}
                        </button>
                      </div>
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
