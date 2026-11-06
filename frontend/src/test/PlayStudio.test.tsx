import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Play } from '../pages/Play'
import { Rules } from '../pages/Rules'

const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true }

describe('Play Studio & Rules Integration', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          stage: 'genesis',
          suit: '♠',
          power: 'Earth',
          description: 'Create landmasses or mountains.',
          fantasticalDescription: 'Create floating islands.',
          examples: 'Mountain range, canyon.',
        }),
      })
    )
  })

  it('renders Play Studio with default world, draws a card, and logs turn with player attribution', async () => {
    render(
      <BrowserRouter future={routerFuture}>
        <Play />
      </BrowserRouter>
    )

    expect(screen.getByText('Emerald Vale')).toBeInTheDocument()
    const drawBtn = screen.getByRole('button', { name: /Draw Card \(54\)/i })
    await act(async () => {
      fireEvent.click(drawBtn)
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Draw Card \(53\)/i })).toBeInTheDocument()
    })

    expect(screen.getByText('Turn #1')).toBeInTheDocument()
  })

  it('supports Companion Mode toggles, Hotseat Players, Auto-Play, and Codex tabs', async () => {
    render(
      <BrowserRouter future={routerFuture}>
        <Play />
      </BrowserRouter>
    )

    // Toggle Players Panel & add a hotseat player
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Players \(1\)/i }))
    })
    expect(
      screen.getByText(/Hotseat Players & Bot Personalities/i)
    ).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Add Player Seat/i }))
    })
    expect(screen.getByRole('button', { name: /Players \(2\)/i })).toBeInTheDocument()

    // Toggle Auto-Play Panel & run 1 auto turn
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Auto-Play/i }))
    })
    expect(
      screen.getByText(/Procedural Seeded Auto-Play & World Generator/i)
    ).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Auto-Play 1 Turn/i }))
    })
    expect(screen.getByText('Turn #1')).toBeInTheDocument()

    // Switch to World Map tab
    await act(async () => {
      fireEvent.click(screen.getByRole('tab', { name: /World Map/i }))
    })
    expect(screen.getByRole('grid', { name: /World Map Grid/i })).toBeInTheDocument()

    // Switch to Codex tab
    await act(async () => {
      fireEvent.click(screen.getByRole('tab', { name: /Codex/i }))
    })
    expect(screen.getByText(/Quick Presets/i)).toBeInTheDocument()

    // Open World Manager Modal
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Worlds \(1\)/i }))
    })
    expect(screen.getByRole('dialog', { name: /World Manager/i })).toBeInTheDocument()
  })

  it('renders Rules page with Glossary and switches to 1-Page Quick Reference Card', () => {
    render(
      <BrowserRouter future={routerFuture}>
        <Rules />
      </BrowserRouter>
    )

    expect(screen.getByRole('heading', { name: 'Glossary of Terms' })).toBeInTheDocument()
    expect(screen.getByText('Fantastical Power (J, Q, K)')).toBeInTheDocument()

    // Switch to 1-Page Quick Reference Card
    fireEvent.click(screen.getByRole('tab', { name: /1-Page Quick Reference Card/i }))
    expect(
      screen.getByText(/World Building — Quick Reference Sheet/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/Stage & Suit Power Matrix/i)).toBeInTheDocument()
  })

  it('supports Rules keyword search and category focus filter pills', () => {
    render(
      <BrowserRouter future={routerFuture}>
        <Rules />
      </BrowserRouter>
    )

    // Filter by 1. Genesis only
    const genesisButtons = screen.getAllByRole('button', { name: /^1\. Genesis$/i })
    fireEvent.click(genesisButtons[0])
    expect(
      screen.getByRole('heading', { name: /1\. Genesis/i })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Glossary of Terms' })
    ).not.toBeInTheDocument()

    // Search via instant keyword input
    const searchInput = screen.getByLabelText(/Search Rules/i)
    fireEvent.change(searchInput, { target: { value: 'Joker' } })
    expect(screen.getByText(/Powers & Fantastical Face Cards/i)).toBeInTheDocument()
  })

  it('supports 3.1 Companion Mode optional toggles and 3.3 Freeform Mode', async () => {
    render(
      <BrowserRouter future={routerFuture}>
        <Play />
      </BrowserRouter>
    )

    // Switch to 3.1 Companion Mode
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Companion/i }))
    })
    expect(screen.getByText(/Optional Panels:/i)).toBeInTheDocument()

    // Toggle Stage Rules optional panel in Companion mode
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Stage Rules/i }))
    })
    expect(
      screen.getByText(/Full 4-Ages Matrix/i)
    ).toBeInTheDocument()

    // Switch to 3.3 Freeform Mode
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Free-Create/i }))
    })
    expect(screen.getByText(/Freeform World Sandbox/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Draw Card/i })).not.toBeInTheDocument()
  })

  it('supports Share Table QR modal and Export Suite share button', async () => {
    render(
      <BrowserRouter future={routerFuture}>
        <Play />
      </BrowserRouter>
    )

    // Open Share Table modal from toolbar
    const shareBtn = screen.getByRole('button', { name: /Share Table/i })
    await act(async () => {
      fireEvent.click(shareBtn)
    })

    expect(screen.getByRole('heading', { name: /Share with Table/i })).toBeInTheDocument()
    expect(screen.getByText(/Seed Link & QR \(Fast\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Full Session State/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Copy Link/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Download QR Image/i })).toBeInTheDocument()

    // Switch to Full Session State tab
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Full Session State/i }))
    })
    expect(screen.getByText(/Complete State Snapshot:/i)).toBeInTheDocument()

    // Close modal
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Close Share Modal/i }))
    })
  })

  it('detects and hydrates incoming shared realm from URL query or hash', async () => {
    // Simulate window.location.search having a shared seed
    const originalLocation = window.location
    delete (window as unknown as Record<string, unknown>).location
    window.location = {
      ...originalLocation,
      pathname: '/play',
      search: '?shareType=seed&seed=solstice-99&name=Solstice%20Reach&preset=archipelago',
      hash: '',
    } as unknown as Location

    render(
      <BrowserRouter future={routerFuture}>
        <Play />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Shared Realm Received/i)).toBeInTheDocument()
      expect(screen.getByText('Solstice Reach')).toBeInTheDocument()
    })

    // Click Load Shared Realm
    const loadBtn = screen.getByRole('button', { name: /Load Shared Realm/i })
    await act(async () => {
      fireEvent.click(loadBtn)
    })

    // The active world name in the header should now be Solstice Reach
    expect(screen.getByText('Solstice Reach')).toBeInTheDocument()

    // Restore location
    window.location = originalLocation
  })
})
