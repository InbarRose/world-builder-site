import { useState, useMemo } from 'react'
import {
  Compass,
  X,
  Copy,
  Check,
  MapPin,
  Shield,
  Skull,
  Scroll,
  Sparkles,
  HelpCircle,
} from 'lucide-react'
import { WorldState } from '../engine/types'
import {
  generateCampaignAdventureHooks,
  CampaignQuestHook,
  QuestCategory,
} from '../engine/campaignBridgeEngine'

interface CampaignHooksModalProps {
  isOpen: boolean
  onClose: () => void
  world: WorldState
  onSelectCoord?: (col: number, row: number) => void
  onSelectEntity?: (entityId: string) => void
}

const CATEGORY_TABS: { id: 'all' | QuestCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'All Quests', icon: '📜' },
  { id: 'dungeon_crawl', label: 'Dungeon Crawl', icon: '🗝️' },
  { id: 'political_intrigue', label: 'Political Intrigue', icon: '👑' },
  { id: 'wilderness_expedition', label: 'Wilderness', icon: '🌲' },
  { id: 'mythic_investigation', label: 'Mythic Threat', icon: '⚡' },
]

export function CampaignHooksModal({
  isOpen,
  onClose,
  world,
  onSelectCoord,
  onSelectEntity,
}: CampaignHooksModalProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | QuestCategory>('all')
  const [copiedAll, setCopiedAll] = useState(false)
  const [copiedHookId, setCopiedHookId] = useState<string | null>(null)

  const allHooks = useMemo(() => {
    return generateCampaignAdventureHooks(world.map, world.entities || [], world.drawHistory || [])
  }, [world])

  const filteredHooks = useMemo(() => {
    if (activeCategory === 'all') return allHooks
    return allHooks.filter((h) => h.category === activeCategory)
  }, [allHooks, activeCategory])

  if (!isOpen) return null

  const handleCopyAll = async () => {
    const lines: string[] = [
      `# ⚔️ TTRPG Campaign Hooks & Rumor Tables: ${world.name}`,
      `*Synthesized from ${world.drawHistory.length} historical moves and ${world.entities?.length || 0} co-created factions/relics.*\n`,
    ]

    allHooks.forEach((hook, idx) => {
      lines.push(`### ${idx + 1}. ${hook.title} [${hook.suggestedTier}]`)
      lines.push(`- **Category:** ${hook.category.replace('_', ' ').toUpperCase()}`)
      lines.push(`- **Location:** ${hook.location}${hook.coord ? ` (${hook.coord.col}, ${hook.coord.row})` : ''}`)
      lines.push(`- **Premise:** ${hook.premise}`)
      lines.push(`- **Tavern Rumor:** ${hook.tavernRumor}`)
      lines.push(`- **Complication:** ${hook.complication}\n`)
    })

    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2500)
    } catch {
      // fallback
    }
  }

  const handleCopySingleHook = async (hook: CampaignQuestHook) => {
    const text = [
      `### ${hook.title} [${hook.suggestedTier}]`,
      `- **Location:** ${hook.location}`,
      `- **Premise:** ${hook.premise}`,
      `- **Tavern Rumor:** ${hook.tavernRumor}`,
      `- **Complication:** ${hook.complication}`,
    ].join('\n')

    try {
      await navigator.clipboard.writeText(text)
      setCopiedHookId(hook.id)
      setTimeout(() => setCopiedHookId(null), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Campaign Hooks & Tabletop Rumor Tables"
    >
      <div className="card p-6 max-w-4xl w-full max-h-[92vh] overflow-y-auto space-y-6">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                Tabletop Campaign Hooks & Rumor Tables
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                  D&D 5e / OSR / Pathfinder
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Actionable quest outlines generated dynamically from your co-created ruins, settlements, factions, and cataclysms.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyAll}
              className="btn btn-outline text-xs flex items-center gap-1.5"
              title="Copy all synthesized hooks to clipboard for your campaign notebook or VTT"
            >
              {copiedAll ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Copied All Markdown!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close Campaign Hooks Dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 border ${
                activeCategory === tab.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-muted/40 hover:bg-muted text-muted-foreground border-transparent'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20">
                {tab.id === 'all'
                  ? allHooks.length
                  : allHooks.filter((h) => h.category === tab.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Hook Cards Listing */}
        <div className="space-y-4">
          {filteredHooks.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl">
              <HelpCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">No campaign hooks match this category yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Advance through more eras or place settlements and ruins to expand the table!
              </p>
            </div>
          ) : (
            filteredHooks.map((hook) => (
              <div
                key={hook.id}
                className="p-4 rounded-xl border border-border bg-card/60 hover:border-primary/40 transition-colors space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        {hook.suggestedTier}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground capitalize">
                        {hook.category.replace('_', ' ')}
                      </span>
                      {hook.coord && (
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectCoord && hook.coord) {
                              onSelectCoord(hook.coord.col, hook.coord.row)
                              onClose()
                            }
                          }}
                          className="text-xs flex items-center gap-1 text-primary hover:underline"
                        >
                          <MapPin className="h-3 w-3" />
                          <span>Tile ({hook.coord.col}, {hook.coord.row})</span>
                        </button>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-foreground">{hook.title}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <span>Location:</span>
                      <span className="font-medium text-foreground">{hook.location}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopySingleHook(hook)}
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-xs flex items-center gap-1"
                    title="Copy this adventure hook"
                  >
                    {copiedHookId === hook.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-emerald-500">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Premise */}
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {hook.premise}
                </p>

                {/* Tavern Rumor Blockquote */}
                <div className="p-3 rounded-lg bg-amber-500/5 border-l-2 border-amber-500 text-xs italic text-amber-900 dark:text-amber-200">
                  <div className="font-semibold not-italic text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1">
                    <Scroll className="h-3 w-3" />
                    <span>Tavern Rumor / Local Whisper:</span>
                  </div>
                  {hook.tavernRumor}
                </div>

                {/* Complication */}
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-destructive/5 border border-destructive/20 text-xs text-destructive">
                  <Skull className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Twist / Complication: </span>
                    <span>{hook.complication}</span>
                  </div>
                </div>

                {/* Involved Entities */}
                {hook.involvedEntityIds.length > 0 && (
                  <div className="flex items-center gap-2 pt-1 border-t border-border/50 text-xs text-muted-foreground">
                    <span className="text-[11px] font-medium">Involved Factions/Relics:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {hook.involvedEntityIds.map((eid) => {
                        const ent = world.entities?.find((e) => e.id === eid)
                        if (!ent) return null
                        return (
                          <button
                            key={eid}
                            type="button"
                            onClick={() => {
                              if (onSelectEntity) {
                                onSelectEntity(eid)
                                onClose()
                              }
                            }}
                            className="px-2 py-0.5 rounded text-[11px] bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium flex items-center gap-1 transition-colors"
                          >
                            <Shield className="h-3 w-3 text-primary" />
                            <span>{ent.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Ready for instant use in Roll20, Foundry VTT, Owlbear Rodeo, or pen & paper notebooks.</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline text-xs px-4 py-1.5"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
