import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CampaignHooksModal } from '../components/CampaignHooksModal'
import { SessionZeroPrimerModal } from '../components/SessionZeroPrimerModal'
import { createNewWorld } from '../engine/storageService'
import { createDefaultTile } from '../engine/mapEngine'

describe('CampaignBridge UI Components', () => {
  const world = createNewWorld('Aethelgard')
  // Add a ruin tile and a settlement tile to enrich hooks
  world.map.tiles['5,5'] = {
    ...createDefaultTile(5, 5, 'mountain'),
    relief: 'hills',
    overlay: 'ruins',
    label: 'Sunken Vault of the Ancients',
  }
  world.map.tiles['2,2'] = {
    ...createDefaultTile(2, 2, 'plains'),
    overlay: 'city',
    label: 'Highcliff Haven',
  }
  world.entities.push({
    id: 'ent-1',
    name: 'Order of the Broken Shield',
    category: 'society',
    stageCreated: 'genesis',
    description: 'An ancient knightly order',
    status: 'active',
    icon: '🛡️',
    traits: ['Fanatical devotion to frontier outposts'],
  })

  it('renders CampaignHooksModal with categories and filtered hooks', () => {
    const handleClose = vi.fn()
    const handleSelectCoord = vi.fn()

    render(
      <CampaignHooksModal
        isOpen={true}
        onClose={handleClose}
        world={world}
        onSelectCoord={handleSelectCoord}
      />
    )

    // Check title and category filters
    expect(
      screen.getByText(/Tabletop Campaign Hooks & Rumor Tables/i)
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /all quests/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dungeon crawl/i })).toBeInTheDocument()

    // Ruin tile hook should be visible
    expect(
      screen.getByText(/The Sinking Tombs of Sunken Vault of the Ancients/i)
    ).toBeInTheDocument()

    // Filter to dungeon crawl
    fireEvent.click(screen.getByRole('button', { name: /dungeon crawl/i }))
    expect(
      screen.getByText(/The Sinking Tombs of Sunken Vault of the Ancients/i)
    ).toBeInTheDocument()

    // Test location button click
    const tileBtn = screen.getByText(/Tile \(5, 5\)/i)
    fireEvent.click(tileBtn)
    expect(handleSelectCoord).toHaveBeenCalledWith(5, 5)
    expect(handleClose).toHaveBeenCalled()
  })

  it('renders SessionZeroPrimerModal with 1-page dossier contents', () => {
    const handleClose = vi.fn()
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})

    render(
      <SessionZeroPrimerModal
        isOpen={true}
        onClose={handleClose}
        world={world}
      />
    )

    // Check header and pitch
    expect(screen.getByText(/Session Zero Campaign Primer/i)).toBeInTheDocument()
    expect(screen.getByText(/1-Page Player Handout/i)).toBeInTheDocument()
    expect(screen.getByText('Aethelgard')).toBeInTheDocument()

    // Check starting hub
    expect(screen.getByText(/Starting Hub: Highcliff Haven/i)).toBeInTheDocument()

    // Check active factions
    expect(screen.getByText('Order of the Broken Shield')).toBeInTheDocument()

    // Test print action
    const printBtn = screen.getByText(/Print Handout/i)
    fireEvent.click(printBtn)
    expect(printSpy).toHaveBeenCalled()
    printSpy.mockRestore()
  })
})
