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

  it('renders Play Studio with default world, draws a card, and logs turn in timeline', async () => {
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

  it('switches between studio workspace tabs and opens World Manager modal', () => {
    render(
      <BrowserRouter>
        <Play />
      </BrowserRouter>
    )

    // Switch to World Map tab
    fireEvent.click(screen.getByRole('tab', { name: /World Map/i }))
    expect(screen.getByRole('grid', { name: /World Map Grid/i })).toBeInTheDocument()

    // Switch to Registry tab
    fireEvent.click(screen.getByRole('tab', { name: /Registry/i }))
    expect(screen.getByText(/Register World Entity/i)).toBeInTheDocument()

    // Open World Manager Modal
    fireEvent.click(screen.getByRole('button', { name: /Worlds \(1\)/i }))
    expect(screen.getByRole('dialog', { name: /World Manager/i })).toBeInTheDocument()
  })

  it('renders Rules page with completed Glossary of Terms', () => {
    render(
      <BrowserRouter>
        <Rules />
      </BrowserRouter>
    )

    expect(screen.getByRole('heading', { name: 'Glossary of Terms' })).toBeInTheDocument()
    expect(screen.getByText('Fantastical Power (J, Q, K)')).toBeInTheDocument()
    expect(screen.getByText('Artist, Historian & Keeper')).toBeInTheDocument()
  })
})
