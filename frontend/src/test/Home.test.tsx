import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Home } from '../pages/Home'

describe('Home Component', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )
  })

  it('renders hero title, subtitle, and active realm resume banner', () => {
    expect(screen.getByRole('heading', { level: 1, name: 'World Building' })).toBeInTheDocument()
    expect(screen.getByText('Creating Awesome Worlds Together')).toBeInTheDocument()
    expect(screen.getByText('Active Realm')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Resume Session/i })).toHaveAttribute('href', '/play')
  })

  describe('Navigation Cards & Direct Play Mode Launchers', () => {
    it('displays a link to game rules', () => {
      const rulesHeading = screen.getByRole('heading', { level: 2, name: 'Rules' })
      expect(rulesHeading).toBeInTheDocument()
      const link = rulesHeading.closest('a')
      expect(link).toHaveAttribute('href', '/rules')
    })

    it('displays a link to play mode and direct sub-mode launchers (Companion, Studio, Freeform)', () => {
      const playHeading = screen.getByRole('heading', { level: 2, name: 'Play' })
      expect(playHeading).toBeInTheDocument()
      const link = playHeading.closest('a')
      expect(link).toHaveAttribute('href', '/play')

      expect(screen.getByRole('link', { name: /3\.1 Play Companion/i })).toHaveAttribute(
        'href',
        '/play?mode=companion'
      )
      expect(screen.getByRole('link', { name: /3\.2 Studio Mode/i })).toHaveAttribute(
        'href',
        '/play?mode=studio'
      )
      expect(screen.getByRole('link', { name: /3\.3 Freeform Sandbox/i })).toHaveAttribute(
        'href',
        '/play?mode=free-create'
      )
    })
  })
})
