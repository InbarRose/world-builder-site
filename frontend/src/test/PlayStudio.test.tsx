import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Play } from '../pages/Play'
import { Rules } from '../pages/Rules'

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
      <BrowserRouter>
        <Play />
      </BrowserRouter>
    )

    expect(screen.getByText('Emerald Vale')).toBeInTheDocument()
    const drawBtn = screen.getByRole('button', { name: /Draw Card \(54\)/i })
    fireEvent.click(drawBtn)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Draw Card \(53\)/i })).toBeInTheDocument()
    })

    expect(screen.getByText('Turn #1')).toBeInTheDocument()
  })

  it('supports Companion Mode toggles, Hotseat Players, Auto-Play, and Codex tabs', () => {
    render(
      <BrowserRouter>
        <Play />
      </BrowserRouter>
    )

    // Toggle Players Panel & add a hotseat player
    fireEvent.click(screen.getByRole('button', { name: /Players \(1\)/i }))
    expect(
      screen.getByText(/Hotseat Players & Bot Personalities/i)
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Add Player Seat/i }))
    expect(screen.getByRole('button', { name: /Players \(2\)/i })).toBeInTheDocument()

    // Toggle Auto-Play Panel & run 1 auto turn
    fireEvent.click(screen.getByRole('button', { name: /Auto-Play/i }))
    expect(
      screen.getByText(/Procedural Seeded Auto-Play & World Generator/i)
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Auto-Play 1 Turn/i }))
    expect(screen.getByText('Turn #1')).toBeInTheDocument()

    // Switch to World Map tab
    fireEvent.click(screen.getByRole('tab', { name: /World Map/i }))
    expect(screen.getByRole('grid', { name: /World Map Grid/i })).toBeInTheDocument()

    // Switch to Codex tab
    fireEvent.click(screen.getByRole('tab', { name: /Codex/i }))
    expect(screen.getByText(/Quick Presets/i)).toBeInTheDocument()

    // Open World Manager Modal
    fireEvent.click(screen.getByRole('button', { name: /Worlds \(1\)/i }))
    expect(screen.getByRole('dialog', { name: /World Manager/i })).toBeInTheDocument()
  })

  it('renders Rules page with Glossary and switches to 1-Page Quick Reference Card', () => {
    render(
      <BrowserRouter>
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
      <BrowserRouter>
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

  it('supports 3.1 Companion Mode optional toggles and 3.3 Freeform Mode', () => {
    render(
      <BrowserRouter>
        <Play />
      </BrowserRouter>
    )

    // Switch to 3.1 Companion Mode
    fireEvent.click(screen.getByRole('button', { name: /Companion/i }))
    expect(screen.getByText(/Optional Panels:/i)).toBeInTheDocument()

    // Toggle Stage Rules optional panel in Companion mode
    fireEvent.click(screen.getByRole('button', { name: /Stage Rules/i }))
    expect(
      screen.getByText(/Full 4-Ages Matrix/i)
    ).toBeInTheDocument()

    // Switch to 3.3 Freeform Mode
    fireEvent.click(screen.getByRole('button', { name: /Free-Create/i }))
    expect(screen.getByText(/Freeform World Sandbox/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Draw Card/i })).not.toBeInTheDocument()
  })
})
