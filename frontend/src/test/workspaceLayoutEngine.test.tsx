import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  DOCK_LIMITS,
  STUDIO_WORKSPACE_STORAGE_KEY,
  bringFloatingPanelToFront,
  createWorkspacePreset,
  loadStudioWorkspaceLayout,
  movePanelToDock,
  resizeDock,
  saveStudioWorkspaceLayout,
  toggleAllPanelsHidden,
  togglePanelCollapsed,
  togglePanelVisibility,
  updateFloatingPanelRect,
} from '../engine/workspaceLayoutEngine'
import { StudioDockWorkspace } from '../components/StudioDockWorkspace'

describe('Workspace Layout Engine & Modular Photoshop Studio (Phases 38-39)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('creates all 4 built-in Studio Workspace presets with expected dock assignments', () => {
    const classic = createWorkspacePreset('classic')
    expect(classic.panels.cards.dock).toBe('left')
    expect(classic.panels.codex.dock).toBe('bottom')
    expect(classic.panels.timeline.dock).toBe('bottom')
    expect(classic.allPanelsHidden).toBe(false)

    const pureCanvas = createWorkspacePreset('pure-canvas')
    expect(pureCanvas.allPanelsHidden).toBe(true)

    const cardFocus = createWorkspacePreset('card-focus')
    expect(cardFocus.panels.cards.dock).toBe('left')
    expect(cardFocus.leftDockWidth).toBe(440)
    expect(cardFocus.panels.timeline.dock).toBe('bottom')

    const loreHistory = createWorkspacePreset('lore-history')
    expect(loreHistory.panels.timeline.dock).toBe('left')
    expect(loreHistory.panels.codex.dock).toBe('right')
    expect(loreHistory.panels.cards.dock).toBe('bottom')
  })

  it('moves panels across Left, Right, Bottom, Floating, and Hidden docks and reconciles active tabs', () => {
    let layout = createWorkspacePreset('classic')
    layout = movePanelToDock(layout, 'cards', 'floating')
    expect(layout.panels.cards.dock).toBe('floating')
    expect(layout.activeLeftTab).toBeNull()

    layout = movePanelToDock(layout, 'codex', 'right')
    expect(layout.panels.codex.dock).toBe('right')
    expect(layout.activeRightTab).toBe('codex')
    expect(layout.activeBottomTab).toBe('timeline')

    layout = togglePanelVisibility(layout, 'timeline')
    expect(layout.panels.timeline.dock).toBe('hidden')
    expect(layout.activeBottomTab).toBeNull()
  })

  it('clamps dock resize dimensions, updates floating rects, manages z-index, and persists to localStorage', () => {
    let layout = createWorkspacePreset('classic')
    layout = resizeDock(layout, 'left', 9999)
    expect(layout.leftDockWidth).toBe(DOCK_LIMITS.maxSideWidth)

    layout = resizeDock(layout, 'bottom', 50)
    expect(layout.bottomDockHeight).toBe(DOCK_LIMITS.minBottomHeight)

    layout = movePanelToDock(layout, 'cards', 'floating')
    layout = updateFloatingPanelRect(layout, 'cards', { x: 200, y: 150, width: 500, height: 400 })
    expect(layout.panels.cards.floatingRect).toEqual({ x: 200, y: 150, width: 500, height: 400 })

    const prevZ = layout.panels.codex.zIndex
    layout = bringFloatingPanelToFront(layout, 'codex')
    expect(layout.panels.codex.zIndex).toBeGreaterThan(prevZ)

    layout = togglePanelCollapsed(layout, 'cards')
    expect(layout.panels.cards.collapsed).toBe(true)

    layout = toggleAllPanelsHidden(layout)
    expect(layout.allPanelsHidden).toBe(true)

    saveStudioWorkspaceLayout(layout)
    expect(localStorage.getItem(STUDIO_WORKSPACE_STORAGE_KEY)).toBeTruthy()
    const reloaded = loadStudioWorkspaceLayout()
    expect(reloaded.leftDockWidth).toBe(DOCK_LIMITS.maxSideWidth)
    expect(reloaded.allPanelsHidden).toBe(true)
    expect(reloaded.panels.cards.dock).toBe('floating')
  })

  it('renders StudioDockWorkspace with centered canvas and interactive dock/float/collapse controls', () => {
    function Harness() {
      const [layout, setLayout] = React.useState(() => createWorkspacePreset('classic'))
      return (
        <StudioDockWorkspace
          layout={layout}
          onChangeLayout={setLayout}
          centerCanvas={<div data-testid="mock-center-map">World Map Canvas</div>}
          panelContents={{
            cards: <div>Cards Panel Body</div>,
            codex: <div>Codex Panel Body</div>,
            timeline: <div>Timeline Panel Body</div>,
          }}
        />
      )
    }

    render(<Harness />)

    expect(screen.getByTestId('studio-center-canvas')).toHaveTextContent('World Map Canvas')
    expect(screen.getByTestId('studio-dock-left')).toHaveTextContent('Cards Panel Body')
    expect(screen.getByTestId('studio-dock-bottom')).toHaveTextContent('Codex Panel Body')

    // Switch bottom dock tab to Chronicle
    fireEvent.click(screen.getByTestId('dock-bottom-tab-timeline'))
    expect(screen.getByTestId('studio-dock-bottom')).toHaveTextContent('Timeline Panel Body')

    // Undock Cards panel as a floating window
    fireEvent.click(screen.getByTestId('panel-cards-float'))
    expect(screen.getByTestId('floating-panel-cards')).toHaveTextContent('Cards Panel Body')

    // Roll up floating Cards window
    fireEvent.click(screen.getByTestId('panel-cards-collapse'))
    expect(screen.getByTestId('floating-panel-cards')).not.toHaveTextContent('Cards Panel Body')

    // Re-dock Cards to Right dock
    fireEvent.click(screen.getByTestId('panel-cards-dock-right'))
    expect(screen.getByTestId('studio-dock-right')).toHaveTextContent('Cards Panel Body')
  })
})
