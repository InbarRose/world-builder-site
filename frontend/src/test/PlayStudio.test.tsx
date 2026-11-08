import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Play } from '../pages/Play'
import { Rules } from '../pages/Rules'

const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true }

describe('Play Studio & Rules Integration', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.replaceState({}, '', '/play')
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

  it('renders Play Studio Title Screen launcher, resumes campaign, draws a card, logs turn, and returns to main menu', async () => {
    render(
      <BrowserRouter future={routerFuture}>
        <Play />
      </BrowserRouter>
    )

    // Verify Title Screen / Launcher
    expect(screen.getByText('World Builder Studio')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Resume Campaign/i })).toBeInTheDocument()
    expect(screen.getByText('Emerald Vale')).toBeInTheDocument()

    // Resume into the world session
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Resume Campaign/i }))
    })

    // Now in session: breadcrumb trail with Main Menu button
    expect(screen.getByRole('button', { name: /Main Menu/i })).toBeInTheDocument()
    const drawBtn = screen.getByRole('button', { name: /Draw Card \(54\)/i })
    await act(async () => {
      fireEvent.click(drawBtn)
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Draw Card \(53\)/i })).toBeInTheDocument()
    })

    expect(screen.getAllByText(/Turn #1/i).length).toBeGreaterThan(0)

    // Return to Title Screen via breadcrumb button
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Main Menu/i }))
    })
    expect(screen.getByText('World Builder Studio')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Resume Campaign/i })).toBeInTheDocument()
  })

  it('supports Companion Mode toggles, Hotseat Players, Auto-Play, and Codex tabs', async () => {
    render(
      <BrowserRouter future={routerFuture}>
        <Play />
      </BrowserRouter>
    )

    // Resume into session
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Resume Campaign/i }))
    })

    // Open Settings Menu to access Player Council
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Settings Menu/i }))
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Player Council/i }))
    })
    expect(
      screen.getByText(/Hotseat Players & Bot Personalities/i)
    ).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Add Player Seat/i }))
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Close Player Roster/i }))
    })

    // Open Settings Menu to access Auto-Play
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Settings Menu/i }))
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Auto-Play Console/i }))
    })
    expect(
      screen.getByText(/Procedural Seeded Auto-Play & World Generator/i)
    ).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Auto-Play 1 Turn/i }))
    })
    expect(screen.getAllByText(/Turn #1/i).length).toBeGreaterThan(0)

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

    // Open World Manager Modal from Settings Menu
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Settings Menu/i }))
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /World Archives/i }))
    })
    expect(screen.getByRole('dialog', { name: /World Manager/i })).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Close World Manager/i }))
    })
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

    // Resume into session
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Resume Campaign/i }))
    })

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

  it('supports Share & Backup JSON modal and Export Suite share button', async () => {
    render(
      <BrowserRouter future={routerFuture}>
        <Play />
      </BrowserRouter>
    )

    // Resume into session
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Resume Campaign/i }))
    })

    // Open Share menu from toolbar
    const shareMenuBtn = screen.getByRole('button', { name: /Share & Export Menu/i })
    await act(async () => {
      fireEvent.click(shareMenuBtn)
    })

    // Open Share & Backup modal
    const shareTableBtn = screen.getByRole('button', { name: /Share & Backup JSON/i })
    await act(async () => {
      fireEvent.click(shareTableBtn)
    })

    expect(screen.getByRole('heading', { name: /Export, Import & Share Realm/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Export \(\.json\)/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Import \(\.json\)/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Seed Link/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Download World File \(\.json\)/i })).toBeInTheDocument()

    // Switch to Import tab
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Import \(\.json\)/i }))
    })
    expect(screen.getByText(/Click to Select \.world\.json File/i)).toBeInTheDocument()

    // Switch to Seed Link tab
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Seed Link/i }))
    })
    expect(screen.getByText(/Lightweight Seed Link/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Copy Link/i })).toBeInTheDocument()

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

  it('supports deliberate AAA New Campaign ceremony initiation and Epoch ceremony advancement', async () => {
    render(
      <BrowserRouter future={routerFuture}>
        <Play />
      </BrowserRouter>
    )

    // Click New Campaign on Title Screen Launcher
    const newCampBtn = screen.getByRole('button', { name: /New Campaign Initiation ceremony/i })
    await act(async () => {
      fireEvent.click(newCampBtn)
    })

    // Verify New Game Ceremony Modal is open
    expect(screen.getByText(/Initiate New Campaign/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Forge Realm & Inscribe Destiny/i })).toBeInTheDocument()

    // Consecrate realm into live session
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Forge Realm & Inscribe Destiny/i }))
    })

    // Verify in-game session entered
    expect(screen.getByRole('button', { name: /Main Menu/i })).toBeInTheDocument()

    // Enact deliberate Epoch Ceremony from Age breadcrumb
    const eraBtn = screen.getByRole('button', { name: /Age 1: Genesis/i })
    await act(async () => {
      fireEvent.click(eraBtn)
    })

    // Verify Epoch Ceremony Modal is open
    expect(screen.getByText(/Epoch Advancement Ceremony/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Ascend to Primal/i })).toBeInTheDocument()

    // Advance Epoch ceremonially
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Ascend to Primal/i }))
    })

    // Verify epoch advanced to Age 2
    expect(screen.getByRole('button', { name: /Age 2: Primal/i })).toBeInTheDocument()
  })

  it('supports quick start instant realm generation from title menu', async () => {
    render(
      <BrowserRouter future={routerFuture}>
        <Play />
      </BrowserRouter>
    )

    const quickStartBtn = screen.getByRole('button', { name: /Quick Start 1-click instant/i })
    await act(async () => {
      fireEvent.click(quickStartBtn)
    })

    // Live session entered immediately
    expect(screen.getByRole('button', { name: /Main Menu/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Draw Card \(54\)/i })).toBeInTheDocument()
  })

  it('supports TTRPG Campaign Bridge, Adventure Hooks, Session Zero Primer, and Creative Sparks', async () => {
    render(
      <BrowserRouter future={routerFuture}>
        <Play />
      </BrowserRouter>
    )

    // Resume into live studio session
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Resume Campaign/i }))
    })

    // Open Adventure Hooks modal from header
    const hooksBtn = screen.getByRole('button', { name: /Tabletop Campaign Adventure Hooks/i })
    await act(async () => {
      fireEvent.click(hooksBtn)
    })
    expect(screen.getByText(/Tabletop Campaign Hooks & Rumor Tables/i)).toBeInTheDocument()

    // Close Hooks modal
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Close Campaign Hooks Dialog/i }))
    })

    // Open Session Zero Primer modal from header
    const primerBtn = screen.getByRole('button', { name: /Session Zero 1-Page Campaign Primer/i })
    await act(async () => {
      fireEvent.click(primerBtn)
    })
    expect(screen.getByText(/Session Zero Campaign Primer/i)).toBeInTheDocument()
    expect(screen.getByText(/1-Page Player Handout/i)).toBeInTheDocument()

    // Close Primer modal
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Close Session Zero Primer Dialog/i }))
    })

    // Draw a card in Studio mode
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Draw Card \(54\)/i }))
    })

    // Click "💡 Spark Inspiration"
    const sparkBtn = screen.getByRole('button', { name: /Spark Inspiration/i })
    await act(async () => {
      fireEvent.click(sparkBtn)
    })

    // Verify creative spark box is revealed
    expect(screen.getByText(/Creative Spark:/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Use as Note/i })).toBeInTheDocument()

    // Click "Use as Note"
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Use as Note/i }))
    })

    // Complete turn
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Complete & Pass Turn/i }))
    })

    // Turn is complete and deck is at 53
    expect(screen.getByRole('button', { name: /Draw Card \(53\)/i })).toBeInTheDocument()
  })
})
