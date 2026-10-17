import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Gamepad2, BookOpen, Map as MapIcon, Moon, Sun } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('wb_theme') === 'dark'
    } catch {
      return false
    }
  })

  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try {
      localStorage.setItem('wb_theme', darkMode ? 'dark' : 'light')
    } catch {
      // ignore storage errors
    }
  }, [darkMode])

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/rules', label: 'Rules', icon: BookOpen },
    { path: '/play', label: 'Play', icon: Gamepad2 },
    { path: '/map', label: 'Map Atlas', icon: MapIcon },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-90">
              <Gamepad2 className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold">World Builder</span>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <nav className="flex items-center space-x-1 sm:space-x-2">
                {navItems.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === path
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                ))}
              </nav>
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                aria-label="Toggle color theme"
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto bg-card/40">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-muted-foreground text-sm">
            <p>World Builder Studio — Collaborative Tabletop World Creation by Inbar Rose</p>
            <p className="text-xs mt-1">Static Edition · Version 1.0.0</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
