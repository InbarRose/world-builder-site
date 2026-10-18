import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Gamepad2, BookOpen, Map as MapIcon, Moon, Sun, FileText } from 'lucide-react'
import { VisualStyleMode } from '../engine/types'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const [styleMode, setStyleMode] = useState<VisualStyleMode>(() => {
    try {
      const saved = localStorage.getItem('wb_theme')
      if (saved === 'dark' || saved === 'simplified' || saved === 'fantasy') {
        return saved
      }
      return 'fantasy'
    } catch {
      return 'fantasy'
    }
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'simplified', 'fantasy')
    if (styleMode === 'dark') {
      root.classList.add('dark')
    } else if (styleMode === 'simplified') {
      root.classList.add('simplified')
    } else {
      root.classList.add('fantasy')
    }
    try {
      localStorage.setItem('wb_theme', styleMode)
    } catch {
      // ignore storage errors
    }
  }, [styleMode])

  const cycleStyleMode = () => {
    setStyleMode((prev) =>
      prev === 'fantasy' ? 'dark' : prev === 'dark' ? 'simplified' : 'fantasy'
    )
  }

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/rules', label: 'Rules & Cheat Sheet', icon: BookOpen },
    { path: '/play', label: 'Play Studio', icon: Gamepad2 },
    { path: '/map', label: 'Map Maker', icon: MapIcon },
  ]

  const modeBadge =
    styleMode === 'fantasy'
      ? { label: 'Atlas Theme', icon: Sun }
      : styleMode === 'dark'
      ? { label: 'Dark Theme', icon: Moon }
      : { label: 'Simplified / Print', icon: FileText }

  const ModeIcon = modeBadge.icon

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="no-print border-b border-border bg-card/85 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-90">
              <Gamepad2 className="h-7 w-7 text-primary" />
              <div>
                <span className="text-xl font-bold tracking-tight block leading-none">
                  World Builder
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  Tabletop Cartography & Lore Studio
                </span>
              </div>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <nav className="flex items-center space-x-1 sm:space-x-1.5">
                {navItems.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
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
                onClick={cycleStyleMode}
                className="px-2.5 py-2 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent flex items-center gap-1.5"
                aria-label="Toggle color theme"
                title="Switch between Fantasy Atlas, Dark Slate, and Simplified Print-Friendly modes"
              >
                <ModeIcon className="h-4 w-4" />
                <span className="hidden md:inline">{modeBadge.label}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 flex-1">{children}</main>

      {/* Footer */}
      <footer className="no-print border-t border-border mt-auto bg-card/40">
        <div className="container mx-auto px-4 py-5">
          <div className="text-center text-muted-foreground text-xs">
            <p>
              World Builder Studio — Created by Inbar Rose · Offline-Ready Static Edition (Schema v2)
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
