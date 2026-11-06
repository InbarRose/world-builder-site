import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
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

  it('supports Realm Saga Synthesizer Modal, Epoch Scrubber, and Significance Filter Pills', () => {
    const world = createNewWorld('Mythgard')
    world.drawHistory = [
      {
        id: 'turn-1',
        moveId: 1,
        card: { suit: '♠', value: '9', id: '♠-9' },
        timestamp: '2026-05-01T12:00:00.000Z',
        stage: 'genesis',
        power: 'Volcanic Cataclysm',
        note: 'Shattered peaks erupted across the earth.',
        epochYear: 'Eon I',
      },
      {
        id: 'turn-2',
        moveId: 2,
        card: { suit: '♥', value: 'K', id: '♥-K' },
        timestamp: '2026-05-01T12:05:00.000Z',
        stage: 'civilization',
        power: 'Royal Treaty',
        note: 'The peace pact was sealed.',
        epochYear: 'Age II',
      },
    ]

    render(
      <TimelinePanel
        world={world}
        onUpdateRecord={vi.fn()}
        onClearHistory={vi.fn()}
      />
    )

    // Verify Epoch Scrubber buttons
    expect(screen.getByText(/Interactive Epoch Scrubber/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /1\. Genesis/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /3\. Civilization/i })).toBeInTheDocument()

    // Test Significance Filter Pills
    const cataclysmPill = screen.getByRole('button', { name: /Cataclysms 🔥/i })
    fireEvent.click(cataclysmPill)

    expect(screen.getByDisplayValue(/Shattered peaks erupted/i)).toBeInTheDocument()
    expect(screen.queryByDisplayValue(/The peace pact was sealed/i)).not.toBeInTheDocument()

    // Open Realm Saga Modal
    const sagaBtn = screen.getByRole('button', { name: /Realm Saga/i })
    fireEvent.click(sagaBtn)

    const dialog = screen.getByRole('dialog', { name: /Realm Saga Modal/i })
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByText(/The Saga of Mythgard/i)).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: /Genesis/i })).toBeInTheDocument()

    // Close Modal
    fireEvent.click(within(dialog).getByRole('button', { name: /Close Saga Modal/i }))
    expect(screen.queryByRole('dialog', { name: /Realm Saga Modal/i })).not.toBeInTheDocument()
  })

  it('displays Historical Feats and Diplomatic Relations in EntityRegistry', () => {
    const entities = [
      {
        id: 'ent_1',
        name: 'Sun Elves',
        category: 'society' as const,
        stageCreated: 'genesis' as const,
        description: 'Luminous society.',
        traits: ['Solar Magic'],
        status: 'Flourishing',
        diplomaticLinks: [
          {
            id: 'link_1',
            targetEntityId: 'ent_2',
            targetEntityName: 'Deep Dwarves',
            type: 'alliance' as const,
            label: 'Golden Concord',
            icon: '🤝',
          },
        ],
      },
      {
        id: 'ent_2',
        name: 'Deep Dwarves',
        category: 'society' as const,
        stageCreated: 'genesis' as const,
        description: 'Cave miners.',
        traits: ['Stalwart'],
        status: 'Active',
      },
    ]

    const drawHistory = [
      {
        id: 'd1',
        moveId: 1,
        card: { suit: '♥' as const, value: 'A', id: '♥-A' },
        timestamp: '',
        stage: 'civilization' as const,
        power: 'Peace Treaty',
        note: 'Signed peace treaty',
        linkedEntityIds: ['ent_1'],
      },
    ]

    render(
      <EntityRegistry
        entities={entities}
        currentStage="civilization"
        drawHistory={drawHistory}
        selectedEntityId="ent_1"
        onChange={vi.fn()}
      />
    )

    // Inspect ent_1
    expect(screen.getAllByText('Sun Elves').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Historical Feats & Epoch Deeds/i)).toBeInTheDocument()
    expect(screen.getByText('Treaty Forger')).toBeInTheDocument()
    expect(screen.getByText(/Golden Concord/i)).toBeInTheDocument()
  })
})
