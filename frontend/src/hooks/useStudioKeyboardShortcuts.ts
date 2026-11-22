import { useEffect, useRef } from 'react'
import { GameMode, TurnPhase } from '../engine/types'

export interface StudioKeyboardShortcutOptions {
  isLocked: boolean
  deckLength: number
  gameMode: GameMode
  turnPhase: TurnPhase
  onDrawCard: () => void
  onRedrawCard: () => void
  onPlaceDraftOnMap: () => void
  onAutoPickSmartTile: () => void
  onToggleTwoPager: () => void
  onToggleVault: () => void
}

/**
 * Phase 64 (ADR-068): Extracted Single-PC Laptop Driver velocity hotkey hook
 * ('D' Draw, 'R' Redraw, 'P' Place on Map, '2' 2-Pager, 'A' Auto-Pick, 'Alt+S' Vault).
 * Uses a ref for latest callbacks so the window listener binds stably without churn.
 */
export function useStudioKeyboardShortcuts(options: StudioKeyboardShortcutOptions): void {
  const handlersRef = useRef(options)
  handlersRef.current = options

  useEffect(() => {
    const handleDriverHotkeys = (e: KeyboardEvent) => {
      const activeEl = document.activeElement
      const isInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          (activeEl as HTMLElement).isContentEditable)
      if (isInput || e.ctrlKey || e.metaKey) return

      const key = e.key.toLowerCase()
      const opts = handlersRef.current

      if (e.altKey) {
        if (key === 's') {
          e.preventDefault()
          opts.onToggleVault()
        }
        return
      }

      if (key === 'd') {
        if (!opts.isLocked && opts.deckLength > 0 && (opts.gameMode === 'companion' || opts.turnPhase === 'await_draw')) {
          e.preventDefault()
          opts.onDrawCard()
        }
      } else if (key === 'r') {
        if (!opts.isLocked && opts.deckLength > 0 && opts.turnPhase === 'action_select') {
          e.preventDefault()
          opts.onRedrawCard()
        }
      } else if (key === 'p') {
        if (!opts.isLocked && opts.turnPhase === 'action_select') {
          e.preventDefault()
          opts.onPlaceDraftOnMap()
        }
      } else if (e.key === '2') {
        e.preventDefault()
        opts.onToggleTwoPager()
      } else if (key === 'a') {
        if (!opts.isLocked && opts.turnPhase === 'action_select') {
          e.preventDefault()
          opts.onAutoPickSmartTile()
        }
      }
    }

    window.addEventListener('keydown', handleDriverHotkeys)
    return () => window.removeEventListener('keydown', handleDriverHotkeys)
  }, [])
}
