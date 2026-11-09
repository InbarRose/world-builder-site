import { Keyboard, X } from 'lucide-react'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null

  const shortcuts = [
    {
      group: 'Single-PC Laptop Driver & Turn Velocity',
      items: [
        { keys: ['D'], label: 'Draw Card (Deal active historical turn card)' },
        { keys: ['R'], label: 'Redraw Card (Mulligan: shuffle back and deal new card)' },
        { keys: ['P'], label: 'Place on Map (Stamp active turn draft onto inspected tile)' },
        { keys: ['2'], label: 'Toggle 2-Page World Overview Folio' },
        { keys: ['A'], label: 'Auto-Pick Smart Tile for Current Preset' },
        { keys: ['Alt', 'S'], label: 'Open Session Checkpoint Vault (Snapshots & Disaster Recovery)' },
      ],
    },
    {
      group: 'Spotlight & Navigation',
      items: [
        { keys: ['Ctrl', 'K'], label: 'Open Global Command Palette / Spotlight' },
        { keys: ['?'], label: 'Open Keyboard Shortcuts Cheat Sheet' },
        { keys: ['Esc'], label: 'Close Modals or Return to Main Menu' },
      ],
    },
    {
      group: 'Tabletop Cartography & Tools',
      items: [
        { keys: ['W'], label: 'Toggle Drafting Workshop (Active Editing vs. Safe View)' },
        { keys: ['Shift', 'S'], label: 'Switch to Safe Inspection Mode (Shield Protected)' },
        { keys: ['Space', '+ Drag'], label: 'Pan Cartography Viewport Camera' },
        { keys: ['Ctrl', 'Z'], label: 'Undo Last Action (Map, Lore, Turn)' },
        { keys: ['Ctrl', 'Y'], label: 'Redo Last Undone Action' },
      ],
    },
    {
      group: 'Audio & Session Controls',
      items: [
        { keys: ['M'], label: 'Toggle Master Audio & Ambient Soundscapes Mute' },
      ],
    },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl p-6 text-card-foreground animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Keyboard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Keyboard Shortcuts</h2>
              <p className="text-xs text-muted-foreground">
                Speed up live game mastering and solo cartography with keyboard velocity
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Shortcuts Modal"
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Shortcuts Groups */}
        <div className="my-5 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map((group) => (
            <div key={group.group} className="space-y-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {group.group}
              </h3>
              <div className="space-y-1.5">
                {group.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/30 border border-border/30 text-xs"
                  >
                    <span className="text-foreground">{item.label}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.keys.map((k) => (
                        <kbd
                          key={k}
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-background text-foreground border border-border shadow-2xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
          <span>Press ESC to dismiss</span>
          <button
            type="button"
            onClick={onClose}
            className="btn-primary px-3 py-1 text-xs font-semibold"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  )
}
