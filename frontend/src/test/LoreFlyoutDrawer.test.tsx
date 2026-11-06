import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LoreFlyoutDrawer } from '../components/LoreFlyoutDrawer'
import { WorldEntity } from '../engine/types'
import { createInitialMap } from '../engine/mapEngine'
import { createNewWorld } from '../engine/storageService'

describe('LoreFlyoutDrawer Component', () => {
  const baseEntity: WorldEntity = {
    id: 'faction_iron_covenant',
    name: 'Iron Covenant',
    icon: '⚔️',
    category: 'society',
    stageCreated: 'genesis',
    status: 'Alive & Well',
    description: 'An ancient coalition of dwarven metallurgy masters and frontier defenders.',
    traits: ['Industrious', 'Fortified', 'Stern'],
    diplomaticLinks: [
      {
        id: 'rel_1',
        targetEntityId: 'faction_sun_order',
        targetEntityName: 'Solar Order',
        type: 'trade_pact',
        label: 'Trade Pact',
        icon: '🤝',
      },
    ],
  }

  const allyEntity: WorldEntity = {
    id: 'faction_sun_order',
    name: 'Solar Order',
    parentEntityId: 'faction_iron_covenant',
    icon: '☀️',
    category: 'society',
    stageCreated: 'genesis',
    status: 'Ascendant',
    description: 'Priests and solar knights.',
    traits: ['Devout', 'Luminous'],
  }

  const mockMap = createInitialMap(5, 5)
  mockMap.tiles['2,2'].territoryId = 'faction_iron_covenant'
  mockMap.tiles['2,3'].linkedEntityIds = ['faction_iron_covenant']

  const mockWorld = createNewWorld('Aethelgard')
  mockWorld.currentStage = 'civilization'
  mockWorld.map = mockMap
  mockWorld.entities = [baseEntity, allyEntity]
  mockWorld.drawHistory = [
    {
      id: 'turn_1',
      moveId: 1,
      card: { suit: '♠', value: 'A', id: '♠-A' },
      power: 'Advance Banner',
      epochYear: 'Year of Iron, Turn 1',
      note: 'Iron Covenant march past the high passes.',
      timestamp: '2026-11-06T12:00:00.000Z',
      linkedEntityIds: ['faction_iron_covenant'],
      linkedTileIds: ['2,2'],
    },
  ]

  it('renders nothing when entityId is null or entity not found', () => {
    const { container, rerender } = render(
      <LoreFlyoutDrawer
        entityId={null}
        world={mockWorld}
        onClose={vi.fn()}
        onNavigateToTile={vi.fn()}
        onNavigateToEntity={vi.fn()}
      />
    )
    expect(container.firstChild).toBeNull()

    rerender(
      <LoreFlyoutDrawer
        entityId="non_existent"
        world={mockWorld}
        onClose={vi.fn()}
        onNavigateToTile={vi.fn()}
        onNavigateToEntity={vi.fn()}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders entity header, traits, lore description, and territory coordinates', () => {
    const handleClose = vi.fn()
    const handleNavTile = vi.fn()
    const handleNavEntity = vi.fn()

    render(
      <LoreFlyoutDrawer
        entityId="faction_iron_covenant"
        world={mockWorld}
        onClose={handleClose}
        onNavigateToTile={handleNavTile}
        onNavigateToEntity={handleNavEntity}
      />
    )

    expect(screen.getByRole('dialog', { name: /Dossier for Iron Covenant/i })).toBeInTheDocument()
    expect(screen.getByText('Iron Covenant')).toBeInTheDocument()
    expect(screen.getByText(/Industrious/i)).toBeInTheDocument()
    expect(screen.getByText(/Fortified/i)).toBeInTheDocument()
    expect(screen.getByText(/An ancient coalition of dwarven metallurgy/i)).toBeInTheDocument()

    // Claimed territory coordinates (2, 2) and (2, 3)
    const coord22Btn = screen.getByRole('button', { name: /\(2, 2\)/i })
    expect(coord22Btn).toBeInTheDocument()
    fireEvent.click(coord22Btn)
    expect(handleNavTile).toHaveBeenCalledWith('2,2')

    // Chronicle involvement
    expect(screen.getByText(/Iron Covenant march past the high passes/i)).toBeInTheDocument()

    // Dynasty & Lineage Succession
    expect(screen.getByText(/Dynasty & Lineage Succession/i)).toBeInTheDocument()
    expect(screen.getByText(/Offspring \/ Successor Branches/i)).toBeInTheDocument()

    // Close button
    const closeBtns = screen.getAllByRole('button', { name: /Close Dossier/i })
    expect(closeBtns.length).toBeGreaterThan(0)
    fireEvent.click(closeBtns[0])
    expect(handleClose).toHaveBeenCalled()
  })

  it('navigates to another entity when clicking on diplomatic relation', () => {
    const handleNavEntity = vi.fn()

    render(
      <LoreFlyoutDrawer
        entityId="faction_iron_covenant"
        world={mockWorld}
        onClose={vi.fn()}
        onNavigateToTile={vi.fn()}
        onNavigateToEntity={handleNavEntity}
      />
    )

    // Solar Order is in the relations web and lineage branches
    const [allyBtn] = screen.getAllByRole('button', { name: /Solar Order/i })
    expect(allyBtn).toBeInTheDocument()
    fireEvent.click(allyBtn)
    expect(handleNavEntity).toHaveBeenCalledWith('faction_sun_order')
  })
})
