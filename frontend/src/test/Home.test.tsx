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

    it('renders hero title and subtitle', () => {
        expect(screen.getByRole('heading', { level: 1, name: 'World Building' })).toBeInTheDocument()
        expect(screen.getByText('Creating Awesome Worlds Together')).toBeInTheDocument()
    })

    describe('Navigation Cards', () => {
        it('displays a link to game rules', () => {
            const rulesHeading = screen.getByRole('heading', { level: 2, name: 'Rules' })
            expect(rulesHeading).toBeInTheDocument()
            const link = rulesHeading.closest('a')
            expect(link).toHaveAttribute('href', '/rules')
        })

        it('displays a link to play mode', () => {
            const playHeading = screen.getByRole('heading', { level: 2, name: 'Play' })
            expect(playHeading).toBeInTheDocument()
            const link = playHeading.closest('a')
            expect(link).toHaveAttribute('href', '/play')
        })
    })
})