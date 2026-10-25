import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TimelinePanel } from '../components/TimelinePanel'
import { EntityRegistry } from '../components/EntityRegistry'
import { createNewWorld } from '../engine/storageService'

describe('TimelinePanel & EntityRegistry Components', () => {
  it('renders timeline turns and filters by search query', () => {
    const world = createNewWorld('Mythgard')
    world.drawHistory = [
      {
        id: 'turn-1',
        moveId: 1,
        card: { suit: '♠', value: '9', id: '♠-9' },
        timestamp: '2026-05-01T12:00:00.000Z',
        stage: 'genesis',
        power: 'Earth',
        note: 'Shattered peaks rise in the east.',
        epochYear: 'Eon I · Mythic Cycle 1',
      },
      {
        id: 'turn-2',
        moveId: 2,
        card: { suit: '♥', value: 'K', id: '♥-K' },
        timestamp: '2026-05-01T12:05:00.000Z',
        stage: 'primal',
        power: 'Tradition',
        note: 'Festival of the Silver Moon founded.',
        epochYear: 'Age of Dawn · ~11,500 B.C.E.',
      },
    ]

    const handleUpdate = vi.fn()
    const handleClear = vi.fn()

    render(
      <TimelinePanel
        world={world}
        onUpdateRecord={handleUpdate}
        onClearHistory={handleClear}
      />
    )

    expect(screen.getByDisplayValue(/Shattered peaks rise/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue(/Festival of the Silver Moon/i)).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText(/Search events, powers/i)
    fireEvent.change(searchInput, { target: { value: 'Silver Moon' } })

    expect(screen.queryByDisplayValue(/Shattered peaks rise/i)).not.toBeInTheDocument()
    expect(screen.getByDisplayValue(/Festival of the Silver Moon/i)).toBeInTheDocument()
  })

  it('registers a new species and loads a preset in EntityRegistry', () => {
    const handleChange = vi.fn()

    render(
      <EntityRegistry
        entities={[]}
        currentStage="primal"
        drawHistory={[]}
        onChange={handleChange}
      />
    )

    // Test loading a species preset
    const presetBtn = screen.getByRole('button', { name: /Sylvan Star-Elves/i })
    fireEvent.click(presetBtn)

    const nameInput = screen.getByPlaceholderText(/Sylvan Elves/i) as HTMLInputElement
    expect(nameInput.value).toBe('Sylvan Star-Elves')

    fireEvent.change(nameInput, { target: { value: 'Starborn Elves' } })

    const traitsInput = screen.getByPlaceholderText(/Master Sailors/i)
    fireEvent.change(traitsInput, { target: { value: 'Astral Magic, Longevity' } })

    const addBtn = screen.getByRole('button', { name: /Add to World Registry/i })
    fireEvent.click(addBtn)

    expect(handleChange).toHaveBeenCalledTimes(1)
    const createdList = handleChange.mock.calls[0][0]
    expect(createdList).toHaveLength(1)
    expect(createdList[0].name).toBe('Starborn Elves')
    expect(createdList[0].traits).toEqual(['Astral Magic', 'Longevity'])
  })

  it('supports Wiki Browse Mode vs Creator Drawer toggle and custom event logging', () => {
    const world = createNewWorld('Aethelgard')
    const handleAddCustomRecord = vi.fn()

    render(
      <TimelinePanel
        world={world}
        onUpdateRecord={vi.fn()}
        onClearHistory={vi.fn()}
        onAddCustomRecord={handleAddCustomRecord}
      />
    )

    // Open Custom Lore Event drawer and submit
    fireEvent.click(screen.getByRole('button', { name: /\+ Log Custom Event/i }))
    const noteInput = screen.getByPlaceholderText(
      /Describe what happened in the world/i
    )
    fireEvent.change(noteInput, {
      target: { value: 'The Obsidian Concord is signed at the Spire.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Save Event/i }))
    expect(handleAddCustomRecord).toHaveBeenCalledTimes(1)
  })
})
