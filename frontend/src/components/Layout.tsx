import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Gamepad2,
  BookOpen,
  Map as MapIcon,
  Moon,
  Sun,
  FileText,
  Star,
  Bug,
  Lightbulb,
  MessageSquarePlus,
  ExternalLink,
  ChevronDown,
  Globe,
} from 'lucide-react'
import { VisualStyleMode, WorldState } from '../engine/types'
import { getActiveWorld } from '../engine/storageService'
import { STAGES } from '../engine/deckEngine'

interface LayoutProps {
  children: React.ReactNode
}

const GITHUB_REPO = 'InbarRose/world-builder-site'
const GITHUB_URL = `https://github.com/${GITHUB_REPO}`
const BUG_REPORT_URL = `${GITHUB_URL}/issues/new?template=bug_report.md&labels=bug&title=%5BBug%5D%3A+`
const FEATURE_REQUEST_URL = `${GITHUB_URL}/issues/new?template=feature_request.md&labels=enhancement&title=%5BSuggestion%5D%3A+`
const ISSUES_URL = `${GITHUB_URL}/issues`

function GitHubMark({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  )
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

  const [activeWorld, setActiveWorld] = useState<WorldState | null>(null)
  const [starCount, setStarCount] = useState<number | null>(null)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const feedbackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      setActiveWorld(getActiveWorld())
    } catch {
      setActiveWorld(null)
    }
  }, [location.pathname, location.search])

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

  useEffect(() => {
    let active = true
    try {
      const cached = sessionStorage.getItem('wb_gh_stars')
      if (cached !== null) {
        const parsed = parseInt(cached, 10)
        if (!Number.isNaN(parsed)) {
          setStarCount(parsed)
          return
        }
      }
      if (typeof fetch === 'function') {
        fetch(`https://api.github.com/repos/${GITHUB_REPO}`)
          .then((res) => (res && res.ok ? res.json() : null))
          .then((data) => {
            if (active && data && typeof data.stargazers_count === 'number') {
              setStarCount(data.stargazers_count)
              sessionStorage.setItem('wb_gh_stars', String(data.stargazers_count))
            }
          })
          .catch(() => {
            // graceful offline fallback
          })
      }
    } catch {
      // ignore
    }
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (feedbackRef.current && !feedbackRef.current.contains(e.target as Node)) {
        setFeedbackOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const cycleStyleMode = () => {
    setStyleMode((prev) =>
      prev === 'fantasy' ? 'dark' : prev === 'dark' ? 'simplified' : 'fantasy'
    )
  }

  const navItems = [
    { path: '/', label: 'Home', shortLabel: 'Home', icon: Home },
    { path: '/rules', label: 'Rules & Reference', shortLabel: 'Rules', icon: BookOpen },
    { path: '/play', label: 'Play Studio', shortLabel: 'Play', icon: Gamepad2 },
    { path: '/map', label: 'World Atlas', shortLabel: 'Atlas', icon: MapIcon },
  ]

  const modeBadge =
    styleMode === 'fantasy'
      ? { label: 'Atlas', icon: Sun }
      : styleMode === 'dark'
      ? { label: 'Dark', icon: Moon }
      : { label: 'Print', icon: FileText }

  const ModeIcon = modeBadge.icon
  const stageMeta = activeWorld
    ? STAGES.find((s) => s.id === activeWorld.currentStage)
    : undefined

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Level 0: Global App Shell Header */}
      <header className="no-print border-b border-border/80 bg-card/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-3 sm:px-4 py-2">
          <div className="flex items-center justify-between gap-2">
            {/* Brand & Active World Context Pill */}
            <div className="flex items-center gap-3 min-w-0">
              <Link to="/" className="flex items-center gap-2 hover:opacity-90 shrink-0">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center shadow-inner">
                  <Gamepad2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="hidden xs:block sm:block">
                  <span className="text-sm sm:text-base font-bold tracking-tight block leading-none">
                    World Builder
                  </span>
                  <span className="hidden md:block text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                    Tabletop Cartography & Lore
                  </span>
                </div>
              </Link>

              {activeWorld && location.pathname !== '/play' && (
                <Link
                  to="/play"
                  className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 hover:bg-accent border border-border text-xs transition-colors truncate max-w-[240px]"
                  title={`Resume ${activeWorld.name} (${stageMeta?.name || 'Genesis'})`}
                >
                  <Globe className="h-3 w-3 text-primary shrink-0" />
                  <span className="font-semibold truncate">{activeWorld.name}</span>
                  {stageMeta && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-primary/15 text-primary font-bold shrink-0">
                      Age {stageMeta.number}
                    </span>
                  )}
                </Link>
              )}
            </div>

            {/* Center: Main Area Switcher */}
            <nav
              className="flex items-center gap-0.5 sm:gap-1 bg-muted/50 p-1 rounded-xl border border-border/70"
              aria-label="Main Navigation"
            >
              {navItems.map(({ path, label, shortLabel, icon: Icon }) => {
                const isActive = location.pathname === path
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="sm:hidden">{shortLabel}</span>
                    <span className="hidden sm:inline">{label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Right: Theme & Compact Community Menu */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Theme Switcher */}
              <button
                type="button"
                onClick={cycleStyleMode}
                className="px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent flex items-center gap-1.5 transition-colors"
                aria-label="Toggle color theme"
                title="Switch between Fantasy Atlas, Dark Slate, and Simplified Print-Friendly modes"
              >
                <ModeIcon className="h-3.5 w-3.5 text-primary" />
                <span className="hidden md:inline">{modeBadge.label}</span>
              </button>

              {/* GitHub Star Pill */}
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center rounded-lg border border-border bg-background hover:bg-accent text-xs font-medium transition-colors overflow-hidden"
                title="View repository and star on GitHub"
              >
                <span className="flex items-center gap-1 px-2 py-1.5 text-foreground">
                  <GitHubMark className="h-3.5 w-3.5" />
                  <span className="hidden xl:inline">GitHub</span>
                </span>
                <span className="flex items-center gap-1 px-1.5 py-1.5 bg-muted/70 border-l border-border text-muted-foreground">
                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                  <span>{starCount !== null ? starCount : 'Star'}</span>
                </span>
              </a>

              {/* Friendly Issue / Feedback Dropdown */}
              <div className="relative" ref={feedbackRef}>
                <button
                  type="button"
                  onClick={() => setFeedbackOpen((o) => !o)}
                  className="px-2 py-1.5 rounded-lg border border-border bg-background hover:bg-accent text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  title="Report a bug or suggest a feature on GitHub"
                >
                  <MessageSquarePlus className="h-3.5 w-3.5 text-primary" />
                  <span className="hidden xl:inline">Feedback</span>
                  <ChevronDown className="h-3 w-3 opacity-70" />
                </button>

                {feedbackOpen && (
                  <div className="absolute right-0 mt-1.5 w-56 rounded-xl border border-border bg-card shadow-lg py-1.5 z-50 text-xs">
                    <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/60">
                      GitHub Issues & Ideas
                    </div>
                    <a
                      href={BUG_REPORT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setFeedbackOpen(false)}
                      className="flex items-center justify-between px-3 py-2 hover:bg-accent text-foreground transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Bug className="h-3.5 w-3.5 text-rose-500" />
                        <span>Report a Bug</span>
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </a>
                    <a
                      href={FEATURE_REQUEST_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setFeedbackOpen(false)}
                      className="flex items-center justify-between px-3 py-2 hover:bg-accent text-foreground transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                        <span>Suggest a Feature</span>
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </a>
                    <a
                      href={ISSUES_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setFeedbackOpen(false)}
                      className="flex items-center justify-between px-3 py-2 hover:bg-accent text-muted-foreground hover:text-foreground border-t border-border/60 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <GitHubMark className="h-3.5 w-3.5" />
                        <span>Browse Open Issues</span>
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-5 flex-1">{children}</main>

      {/* Minimal Footer */}
      <footer className="no-print border-t border-border/70 mt-auto bg-card/40">
        <div className="container mx-auto px-4 py-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3 text-muted-foreground text-xs">
            <p>
              World Builder Studio — Created by Inbar Rose · 100% Client-Side & Offline-Ready
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border hover:bg-accent hover:text-foreground transition-colors"
              >
                <GitHubMark className="h-3.5 w-3.5" />
                <span>GitHub Repo</span>
              </a>
              <a
                href={BUG_REPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border hover:bg-accent hover:text-foreground transition-colors"
              >
                <Bug className="h-3.5 w-3.5 text-rose-500" />
                <span>Report Bug</span>
              </a>
              <a
                href={FEATURE_REQUEST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border hover:bg-accent hover:text-foreground transition-colors"
              >
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                <span>Suggest Idea</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
