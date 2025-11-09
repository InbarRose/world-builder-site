import { describe, it, expect } from 'vitest'
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

    it('renders welcome message', () => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('World Builder Site')
        expect(screen.getByText(/Create collaborative worlds/i)).toBeInTheDocument()
    })

    describe('Quick Actions', () => {
        it('displays a link to start a new session', () => {
            const link = screen.getByRole('link', { name: 'New Session Start a new world-building session' })
            expect(link).toBeInTheDocument()
            expect(link).toHaveAttribute('href', '/sessions')
        })

        it('displays a link to quick simulate', () => {
            const link = screen.getByRole('link', { name: 'Quick Simulate Try the game mechanics' })
            expect(link).toBeInTheDocument()
            expect(link).toHaveAttribute('href', '/simulate')
        })

        it('displays a link to game rules', () => {
            const link = screen.getByRole('link', { name: 'Game Rules Learn how to play' })
            expect(link).toBeInTheDocument()
            expect(link).toHaveAttribute('href', '/rules')
        })

        it('displays interactive map as coming soon', () => {
            expect(screen.getByText('Interactive Map')).toHaveClass('text-muted-foreground')
            expect(screen.getByText('Coming soon')).toBeInTheDocument()
        })
    })

    describe('Features Section', () => {
        it('displays the features heading', () => {
            expect(screen.getByRole('heading', { name: 'Features' })).toBeInTheDocument()
        })

        it('displays feature cards', () => {
            expect(screen.getByText('Card-Driven Storytelling')).toBeInTheDocument()
            expect(screen.getByText('Collaborative Sessions')).toBeInTheDocument()
            expect(screen.getByText('Interactive Timeline')).toBeInTheDocument()
        })
    })

    describe('System Status Section', () => {
        it('displays system status information', () => {
            expect(screen.getByText('System Status')).toBeInTheDocument()
            expect(screen.getByText('API Server')).toBeInTheDocument()
            expect(screen.getByText('Game Engine')).toBeInTheDocument()
            expect(screen.getByText('Database')).toBeInTheDocument()

            const statusElements = screen.getAllByText(/Online|Active|Connected/)
            expect(statusElements).toHaveLength(3)
            statusElements.forEach(element => {
                expect(element).toHaveClass('text-green-600')
            })
        })
    })
})