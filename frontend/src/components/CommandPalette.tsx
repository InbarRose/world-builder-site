import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Compass,
  FileJson,
  Layers,
  Map as MapIcon,
  RotateCcw,
  RotateCw,
  Search,
  Settings,
  Volume2,
  VolumeX,
  BookOpen,
  Shield,
  Palette,
  Scroll,
  Radio,
} from 'lucide-react'
import { GameMode, WorldState } from '../engine/types'

export interface PaletteActionItem {
  id: string
  title: string
  category: 'Modes' | 'Tabletop Actions' | 'Entities' | 'Audio & System'
  description?: string
  icon: React.ReactNode
  shortcut?: string
  onSelect: () => void
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  world: WorldState
  currentMode: GameMode
  onSelectMode: (mode: GameMode) => void
  onToggleSafeMode: () => void
  isDraftingWorkshop: boolean
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  onToggleSound: () => void
  isSoundMuted: boolean
  onOpenExportModal: () => void
  onOpenShareModal: () => void
  onOpenCampaignHooksModal?: () => void
  onOpenSessionZeroPrimerModal?: () => void
  onOpenCompendiumModal?: () => void
  onOpenTableSyncModal?: () => void
  onOpenCodexEntity?: (entityId: string) => void
  onReturnToLauncher: () => void
  onOpenShortcutsModal: () => void
}

export function CommandPalette({
  isOpen,
  onClose,
  world,
  currentMode,
  onSelectMode,
  onToggleSafeMode,
  isDraftingWorkshop,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onToggleSound,
  isSoundMuted,
  onOpenExportModal,
  onOpenShareModal,
  onOpenCampaignHooksModal,
  onOpenSessionZeroPrimerModal,
  onOpenCompendiumModal,
  onOpenTableSyncModal,
  onOpenCodexEntity,
  onReturnToLauncher,
  onOpenShortcutsModal,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Auto-focus on open
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Build searchable action list
  const actions: PaletteActionItem[] = useMemo(() => {
    const list: PaletteActionItem[] = [
      {
        id: 'mode_safe_inspect',
        title: isDraftingWorkshop ? 'Switch to Safe Inspection Mode' : 'Safe Inspection Mode (Active)',
        category: 'Modes',
        description: 'Prevent accidental canvas edits; inspect tiles and read lore',
        icon: <Shield className="h-4 w-4 text-emerald-500" />,
        shortcut: 'Shift+S',
        onSelect: () => {
          if (isDraftingWorkshop) onToggleSafeMode()
          onClose()
        },
      },
      {
        id: 'mode_drafting_workshop',
        title: isDraftingWorkshop ? 'Drafting Workshop (Active)' : 'Enter Drafting Workshop',
        category: 'Modes',
        description: 'Unlock brushes, relief stamps, and terrain sculpting tools',
        icon: <Palette className="h-4 w-4 text-amber-500" />,
        shortcut: 'W',
        onSelect: () => {
          if (!isDraftingWorkshop) onToggleSafeMode()
          onClose()
        },
      },
      {
        id: 'mode_companion',
        title: 'Switch to Companion Mode',
        category: 'Modes',
        description: 'Compact view for physical tabletop cards & companion tracking',
        icon: <Layers className="h-4 w-4 text-indigo-400" />,
        onSelect: () => {
          onSelectMode('companion')
          onClose()
        },
      },
      {
        id: 'mode_studio',
        title: 'Switch to Studio Mode',
        category: 'Modes',
        description: 'Complete AAA grand strategy worldbuilding suite',
        icon: <Compass className="h-4 w-4 text-primary" />,
        onSelect: () => {
          onSelectMode('studio')
          onClose()
        },
      },
      {
        id: 'action_undo',
        title: 'Undo Last Action',
        category: 'Tabletop Actions',
        description: 'Roll back last map paint, entity edit, or turn action',
        icon: <RotateCcw className="h-4 w-4 text-muted-foreground" />,
        shortcut: 'Ctrl+Z',
        onSelect: () => {
          if (canUndo) onUndo()
          onClose()
        },
      },
      {
        id: 'action_redo',
        title: 'Redo Action',
        category: 'Tabletop Actions',
        description: 'Reapply last undone change',
        icon: <RotateCw className="h-4 w-4 text-muted-foreground" />,
        shortcut: 'Ctrl+Y',
        onSelect: () => {
          if (canRedo) onRedo()
          onClose()
        },
      },
      {
        id: 'action_share_backup',
        title: 'Share & Backup Realm (.json)',
        category: 'Tabletop Actions',
        description: 'Export or import portable world file for tabletop play',
        icon: <FileJson className="h-4 w-4 text-emerald-500" />,
        onSelect: () => {
          onClose()
          onOpenShareModal()
        },
      },
      {
        id: 'action_campaign_tome',
        title: 'Export Campaign Sourcebook & Tome',
        category: 'Tabletop Actions',
        description: 'Generate publication-ready 2-column RPG campaign PDF/HTML',
        icon: <BookOpen className="h-4 w-4 text-primary" />,
        onSelect: () => {
          onClose()
          onOpenExportModal()
        },
      },
      {
        id: 'action_campaign_hooks',
        title: '⚔️ TTRPG Campaign Hooks & Rumors',
        category: 'Tabletop Actions',
        description: 'Synthesized adventure hooks, dungeon sites, and tavern rumors',
        icon: <Compass className="h-4 w-4 text-amber-500" />,
        onSelect: () => {
          onClose()
          onOpenCampaignHooksModal?.()
        },
      },
      {
        id: 'action_compendium',
        title: '📖 Tabletop Presets & Tropes Compendium',
        category: 'Tabletop Actions',
        description: 'Browse 200+ canonical powers, tropes, traditions, and action presets',
        icon: <BookOpen className="h-4 w-4 text-indigo-500" />,
        onSelect: () => {
          onClose()
          onOpenCompendiumModal?.()
        },
      },
      {
        id: 'action_session_zero_primer',
        title: '📜 Session Zero Campaign Primer (Handout)',
        category: 'Tabletop Actions',
        description: '1-page printable player orientation handout for Session Zero',
        icon: <Scroll className="h-4 w-4 text-primary" />,
        onSelect: () => {
          onClose()
          onOpenSessionZeroPrimerModal?.()
        },
      },
      {
        id: 'action_table_peer_sync',
        title: '📡 Real-Time Table & Second-Screen Sync',
        category: 'Tabletop Actions',
        description: 'Synchronize card draws, map stamps, and turns across second screens or peers',
        icon: <Radio className="h-4 w-4 text-emerald-500" />,
        onSelect: () => {
          onClose()
          onOpenTableSyncModal?.()
        },
      },
      {
        id: 'system_toggle_sound',
        title: isSoundMuted ? 'Unmute Ambient Soundscapes' : 'Mute Soundscapes & SFX',
        category: 'Audio & System',
        description: 'Procedural Web Audio hearth, surf, and choral tones',
        icon: isSoundMuted ? <VolumeX className="h-4 w-4 text-rose-500" /> : <Volume2 className="h-4 w-4 text-emerald-500" />,
        shortcut: 'M',
        onSelect: () => {
          onToggleSound()
          onClose()
        },
      },
      {
        id: 'system_keyboard_shortcuts',
        title: 'Keyboard Shortcuts Cheat Sheet',
        category: 'Audio & System',
        description: 'View full reference of hotkeys and navigation keys',
        icon: <Settings className="h-4 w-4 text-muted-foreground" />,
        shortcut: '?',
        onSelect: () => {
          onClose()
          onOpenShortcutsModal()
        },
      },
      {
        id: 'system_return_launcher',
        title: 'Return to Studio Main Menu',
        category: 'Audio & System',
        description: 'Save and navigate back to campaign launcher',
        icon: <MapIcon className="h-4 w-4 text-muted-foreground" />,
        shortcut: 'Esc',
        onSelect: () => {
          onClose()
          onReturnToLauncher()
        },
      },
    ]

    // Inject active world entities dynamically into searchable items
    for (const ent of world.entities) {
      list.push({
        id: `entity_${ent.id}`,
        title: `Codex: ${ent.name}`,
        category: 'Entities',
        description: `${ent.category.toUpperCase()} • ${ent.traits?.slice(0, 2).join(', ') || 'Active entity'}`,
        icon: <span className="text-sm shrink-0">{ent.icon || '📜'}</span>,
        onSelect: () => {
          onClose()
          if (onOpenCodexEntity) {
            onOpenCodexEntity(ent.id)
          }
        },
      })
    }

    return list
  }, [
    world.entities,
    isDraftingWorkshop,
    isSoundMuted,
    canUndo,
    canRedo,
    onClose,
    onToggleSafeMode,
    onSelectMode,
    onUndo,
    onRedo,
    onToggleSound,
    onOpenExportModal,
    onOpenShareModal,
    onOpenCodexEntity,
    onReturnToLauncher,
    onOpenShortcutsModal,
  ])

  // Filter actions based on query
  const filteredActions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return actions
    return actions.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q))
    )
  }, [actions, query])

  // Reset selected index on filter change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredActions.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % Math.max(1, filteredActions.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredActions[selectedIndex]) {
        filteredActions[selectedIndex].onSelect()
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden text-card-foreground animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-border/70 bg-muted/20">
          <Search className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, mode, hotkey, or entity name..."
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted rounded border border-border">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-border/20">
          {filteredActions.length > 0 ? (
            filteredActions.map((action, idx) => {
              const isSelected = idx === selectedIndex
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={action.onSelect}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full px-3 py-2.5 rounded-xl text-left text-xs transition-colors flex items-center justify-between gap-3 ${
                    isSelected ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted/50 text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-muted/60 shrink-0">{action.icon}</div>
                    <div className="min-w-0">
                      <div className="truncate">{action.title}</div>
                      {action.description && (
                        <div className="text-[10px] text-muted-foreground truncate font-normal">
                          {action.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {action.shortcut && (
                      <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground border border-border">
                        {action.shortcut}
                      </kbd>
                    )}
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-1.5 py-0.5 rounded bg-muted/40">
                      {action.category}
                    </span>
                  </div>
                </button>
              )
            })
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No matching actions or entities found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2 border-t border-border/40 bg-muted/30 text-[11px] text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>ESC to close</span>
          </div>
          <span className="font-mono text-[10px]">Spotlight • {world.name} ({currentMode.toUpperCase()})</span>
        </div>
      </div>
    </div>
  )
}
