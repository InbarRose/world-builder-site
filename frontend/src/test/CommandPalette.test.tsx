import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { CommandPalette } from '../components/CommandPalette'
import { createNewWorld } from '../engine/storageService'

describe('CommandPalette (Ctrl+K Spotlight Navigation)', () => {
  const world = createNewWorld('Test Realm', 'seed-palette')
  world.entities.push({
    id: 'ent_dwarf_citadel',
    name: 'Irondeep Dwarves',
    category: 'society',
    description: 'Mountain fortress clan.',
    status: 'active',
    stageCreated: 'primal',
    traits: ['Stonecraft'],
  })

  it('renders searchable spotlight and filters actions and entities', () => {
    const handleClose = vi.fn()
    const handleSelectMode = vi.fn()
    const handleToggleSafeMode = vi.fn()
    const handleOpenCodex = vi.fn()

    render(
      <CommandPalette
        isOpen={true}
        onClose={handleClose}
        world={world}
        currentMode="studio"
        onSelectMode={handleSelectMode}
        onToggleSafeMode={handleToggleSafeMode}
        isDraftingWorkshop={false}
        onUndo={vi.fn()}
        onRedo={vi.fn()}
        canUndo={true}
        canRedo={false}
        onToggleSound={vi.fn()}
        isSoundMuted={false}
        onOpenExportModal={vi.fn()}
        onOpenShareModal={vi.fn()}
        onOpenCodexEntity={handleOpenCodex}
        onReturnToLauncher={vi.fn()}
        onOpenShortcutsModal={vi.fn()}
      />
    )

    const input = screen.getByPlaceholderText(/Type a command, mode, hotkey, or entity name.../i)
    expect(input).toBeInTheDocument()

    // Default list includes initial actions and registered entities
    expect(screen.getByText(/Enter Drafting Workshop/i)).toBeInTheDocument()
    expect(screen.getByText(/Codex: Irondeep Dwarves/i)).toBeInTheDocument()

    // Filter by entity
    fireEvent.change(input, { target: { value: 'irondeep' } })
    expect(screen.getByText(/Codex: Irondeep Dwarves/i)).toBeInTheDocument()
    expect(screen.queryByText(/Enter Drafting Workshop/i)).not.toBeInTheDocument()

    // Click entity
    fireEvent.click(screen.getByText(/Codex: Irondeep Dwarves/i))
    expect(handleOpenCodex).toHaveBeenCalledWith('ent_dwarf_citadel')
    expect(handleClose).toHaveBeenCalled()
  })

  it('navigates with keyboard and closes on ESC', () => {
    const handleClose = vi.fn()

    render(
      <CommandPalette
        isOpen={true}
        onClose={handleClose}
        world={world}
        currentMode="studio"
        onSelectMode={vi.fn()}
        onToggleSafeMode={vi.fn()}
        isDraftingWorkshop={true}
        onUndo={vi.fn()}
        onRedo={vi.fn()}
        canUndo={false}
        canRedo={false}
        onToggleSound={vi.fn()}
        isSoundMuted={false}
        onOpenExportModal={vi.fn()}
        onOpenShareModal={vi.fn()}
        onReturnToLauncher={vi.fn()}
        onOpenShortcutsModal={vi.fn()}
      />
    )

    const input = screen.getByPlaceholderText(/Type a command/i)
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(handleClose).toHaveBeenCalled()
  })
})
