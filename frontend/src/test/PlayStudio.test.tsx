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
})
