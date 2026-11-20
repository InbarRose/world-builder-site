import React, { useRef } from 'react'
import {
  PanelLeft,
  PanelRight,
  PanelBottom,
  PictureInPicture2,
  X,
  Minus,
  Maximize2,
  GripHorizontal,
} from 'lucide-react'
import {
  StudioDockSlot,
  StudioPanelConfig,
  StudioPanelId,
  StudioWorkspaceLayout,
  bringFloatingPanelToFront,
  getPanelsInDock,
  movePanelToDock,
  resizeDock,
  togglePanelCollapsed,
  updateFloatingPanelRect,
} from '../engine/workspaceLayoutEngine'

interface StudioDockWorkspaceProps {
  layout: StudioWorkspaceLayout
  onChangeLayout: (next: StudioWorkspaceLayout) => void
  centerCanvas: React.ReactNode
  panelContents: Record<StudioPanelId, React.ReactNode>
  panelBadges?: Partial<Record<StudioPanelId, { count?: number; highlight?: boolean }>>
}

export function StudioDockWorkspace({
  layout,
  onChangeLayout,
  centerCanvas,
  panelContents,
  panelBadges = {},
}: StudioDockWorkspaceProps) {
  const dragCleanupRef = useRef<(() => void) | null>(null)

  const leftPanels = layout.allPanelsHidden ? [] : getPanelsInDock(layout, 'left')
  const rightPanels = layout.allPanelsHidden ? [] : getPanelsInDock(layout, 'right')
  const bottomPanels = layout.allPanelsHidden ? [] : getPanelsInDock(layout, 'bottom')
  const floatingPanels = layout.allPanelsHidden ? [] : getPanelsInDock(layout, 'floating')
  const collapsedOrHiddenPanels = (Object.values(layout.panels) as StudioPanelConfig[]).filter(
    (p) => layout.allPanelsHidden || p.dock === 'hidden'
  )

  const startResizeDock = (edge: 'left' | 'right' | 'bottom', e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const startSize =
      edge === 'left'
        ? layout.leftDockWidth
        : edge === 'right'
        ? layout.rightDockWidth
        : layout.bottomDockHeight

    const handleMove = (moveEvent: MouseEvent) => {
      if (edge === 'left') {
        const delta = moveEvent.clientX - startX
        onChangeLayout(resizeDock(layout, 'left', startSize + delta))
      } else if (edge === 'right') {
        const delta = startX - moveEvent.clientX
        onChangeLayout(resizeDock(layout, 'right', startSize + delta))
      } else {
        const delta = startY - moveEvent.clientY
        onChangeLayout(resizeDock(layout, 'bottom', startSize + delta))
      }
    }

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
      dragCleanupRef.current = null
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    dragCleanupRef.current = handleUp
  }

  const startDragFloating = (panel: StudioPanelConfig, e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const origX = panel.floatingRect.x
    const origY = panel.floatingRect.y

    onChangeLayout(bringFloatingPanelToFront(layout, panel.id))

    const handleMove = (moveEvent: MouseEvent) => {
      const nextX = origX + (moveEvent.clientX - startX)
      const nextY = origY + (moveEvent.clientY - startY)
      onChangeLayout(updateFloatingPanelRect(layout, panel.id, { x: nextX, y: nextY }))
    }

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
  }

  const startResizeFloating = (panel: StudioPanelConfig, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    const origW = panel.floatingRect.width
    const origH = panel.floatingRect.height

    const handleMove = (moveEvent: MouseEvent) => {
      onChangeLayout(
        updateFloatingPanelRect(layout, panel.id, {
          width: origW + (moveEvent.clientX - startX),
          height: origH + (moveEvent.clientY - startY),
        })
      )
    }

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
  }

  const renderDockControls = (panelId: StudioPanelId, currentDock: StudioDockSlot) => (
    <div className="flex items-center gap-0.5 shrink-0">
      {currentDock !== 'left' && (
        <button
          type="button"
          data-testid={`panel-${panelId}-dock-left`}
          onClick={() => onChangeLayout(movePanelToDock(layout, panelId, 'left'))}
          className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title="Dock to Left Side Panel"
          aria-label={`Dock ${panelId} Left`}
        >
          <PanelLeft className="h-3 w-3" />
        </button>
      )}
      {currentDock !== 'right' && (
        <button
          type="button"
          data-testid={`panel-${panelId}-dock-right`}
          onClick={() => onChangeLayout(movePanelToDock(layout, panelId, 'right'))}
          className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title="Dock to Right Side Panel"
          aria-label={`Dock ${panelId} Right`}
        >
          <PanelRight className="h-3 w-3" />
        </button>
      )}
      {currentDock !== 'bottom' && (
        <button
          type="button"
          data-testid={`panel-${panelId}-dock-bottom`}
          onClick={() => onChangeLayout(movePanelToDock(layout, panelId, 'bottom'))}
          className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title="Dock to Bottom Drawer"
          aria-label={`Dock ${panelId} Bottom`}
        >
          <PanelBottom className="h-3 w-3" />
        </button>
      )}
      {currentDock !== 'floating' && (
        <button
          type="button"
          data-testid={`panel-${panelId}-float`}
          onClick={() => onChangeLayout(movePanelToDock(layout, panelId, 'floating'))}
          className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title="Undock as Draggable Floating Window"
          aria-label={`Float ${panelId}`}
        >
          <PictureInPicture2 className="h-3 w-3" />
        </button>
      )}
      <button
        type="button"
        data-testid={`panel-${panelId}-hide`}
        onClick={() => onChangeLayout(movePanelToDock(layout, panelId, 'hidden'))}
        className="p-1 rounded hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors"
        title="Hide Panel (Re-open anytime from Workspace menu)"
        aria-label={`Hide ${panelId}`}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )

  const renderDockedStack = (
    dock: 'left' | 'right' | 'bottom',
    panels: StudioPanelConfig[],
    activeTabId: StudioPanelId | null,
    onSelectTab: (id: StudioPanelId) => void
  ) => {
    if (panels.length === 0) return null
    const activePanel = panels.find((p) => p.id === activeTabId) || panels[0]

    return (
      <div
        data-testid={`studio-dock-${dock}`}
        className="flex flex-col h-full min-h-0 bg-card/95 border-border/80 overflow-hidden"
      >
        {/* Tabbed Dock Header */}
        <div className="flex items-center justify-between gap-1 px-2 py-1 border-b border-border/70 bg-muted/50 shrink-0">
          <div className="flex items-center gap-1 min-w-0 overflow-x-auto">
            {panels.map((p) => {
              const isActive = p.id === activePanel.id
              return (
                <button
                  key={p.id}
                  type="button"
                  data-testid={`dock-${dock}-tab-${p.id}`}
                  onClick={() => onSelectTab(p.id)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors ${
                    isActive
                      ? 'bg-background text-primary shadow-2xs border border-primary/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                >
                  <span>{p.icon}</span>
                  <span>{p.title}</span>
                </button>
              )
            })}
          </div>
          {renderDockControls(activePanel.id, dock)}
        </div>

        {/* Independent Internal Scroll Container */}
        <div className="flex-1 min-h-0 overflow-y-auto p-2.5">{panelContents[activePanel.id]}</div>
      </div>
    )
  }

  return (
    <div
      data-testid="studio-dock-workspace"
      className="relative flex-1 min-h-0 flex flex-col overflow-hidden"
    >
      {/* Upper Horizontal Row: Left Dock | Center Map Canvas | Right Dock */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* LEFT RESIZABLE DOCK */}
        {leftPanels.length > 0 && (
          <>
            <aside
              style={{ width: `${layout.leftDockWidth}px` }}
              className="hidden lg:flex flex-col shrink-0 h-full min-h-0 border-r border-border/80"
            >
              {renderDockedStack('left', leftPanels, layout.activeLeftTab, (id) =>
                onChangeLayout({ ...layout, activeLeftTab: id })
              )}
            </aside>
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize Left Dock"
              onMouseDown={(e) => startResizeDock('left', e)}
              className="hidden lg:block w-1 cursor-col-resize bg-transparent hover:bg-primary/40 transition-colors shrink-0"
              title="Drag to resize Left Panel"
            />
          </>
        )}

        {/* CENTER FULL-BLEED MAP CANVAS (ALWAYS VISIBLE) */}
        <div
          data-testid="studio-center-canvas"
          className="flex-1 min-w-0 h-full overflow-y-auto p-2 bg-muted/15"
        >
          {centerCanvas}
        </div>

        {/* RIGHT RESIZABLE DOCK */}
        {rightPanels.length > 0 && (
          <>
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize Right Dock"
              onMouseDown={(e) => startResizeDock('right', e)}
              className="hidden lg:block w-1 cursor-col-resize bg-transparent hover:bg-primary/40 transition-colors shrink-0"
              title="Drag to resize Right Panel"
            />
            <aside
              style={{ width: `${layout.rightDockWidth}px` }}
              className="hidden lg:flex flex-col shrink-0 h-full min-h-0 border-l border-border/80"
            >
              {renderDockedStack('right', rightPanels, layout.activeRightTab, (id) =>
                onChangeLayout({ ...layout, activeRightTab: id })
              )}
            </aside>
          </>
        )}
      </div>

      {/* BOTTOM RESIZABLE DRAWER */}
      {bottomPanels.length > 0 && (
        <>
          <div
            role="separator"
            aria-orientation="horizontal"
            aria-label="Resize Bottom Drawer"
            onMouseDown={(e) => startResizeDock('bottom', e)}
            className="h-1 cursor-row-resize bg-border/60 hover:bg-primary/40 transition-colors shrink-0"
            title="Drag to resize Bottom Drawer"
          />
          <section
            style={{ height: `${layout.bottomDockHeight}px` }}
            className="shrink-0 w-full min-h-0 border-t border-border/80"
          >
            {renderDockedStack('bottom', bottomPanels, layout.activeBottomTab, (id) =>
              onChangeLayout({ ...layout, activeBottomTab: id })
            )}
          </section>
        </>
      )}

      {/* DRAGGABLE & RESIZABLE FLOATING STUDIO WINDOWS */}
      {floatingPanels.map((panel) => (
        <div
          key={panel.id}
          data-testid={`floating-panel-${panel.id}`}
          onMouseDown={() => onChangeLayout(bringFloatingPanelToFront(layout, panel.id))}
          style={{
            left: `${panel.floatingRect.x}px`,
            top: `${panel.floatingRect.y}px`,
            width: `${panel.floatingRect.width}px`,
            height: panel.collapsed ? 'auto' : `${panel.floatingRect.height}px`,
            zIndex: panel.zIndex,
          }}
          className="fixed rounded-xl border border-primary/40 bg-card/98 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Draggable Title Bar (Double-click to roll up) */}
          <div
            onMouseDown={(e) => startDragFloating(panel, e)}
            onDoubleClick={() => onChangeLayout(togglePanelCollapsed(layout, panel.id))}
            className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-muted/80 border-b border-border/70 cursor-move select-none shrink-0"
            title="Drag to move · Double-click to collapse/expand"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <GripHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{panel.icon}</span>
              <span>{panel.title}</span>
            </div>
            <div
              className="flex items-center gap-0.5"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                data-testid={`panel-${panel.id}-collapse`}
                onClick={() => onChangeLayout(togglePanelCollapsed(layout, panel.id))}
                className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                title={panel.collapsed ? 'Expand Floating Window' : 'Roll Up Floating Window'}
                aria-label={`Collapse ${panel.id}`}
              >
                {panel.collapsed ? (
                  <Maximize2 className="h-3 w-3" />
                ) : (
                  <Minus className="h-3 w-3" />
                )}
              </button>
              {renderDockControls(panel.id, 'floating')}
            </div>
          </div>

          {/* Floating Body */}
          {!panel.collapsed && (
            <>
              <div className="flex-1 min-h-0 overflow-y-auto p-2.5">
                {panelContents[panel.id]}
              </div>
              {/* Bottom-Right Resize Grip */}
              <div
                onMouseDown={(e) => startResizeFloating(panel, e)}
                className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize flex items-end justify-end p-0.5 text-muted-foreground/60 hover:text-primary"
                title="Drag to resize floating window"
              >
                <span className="text-[9px] leading-none">◢</span>
              </div>
            </>
          )}
        </div>
      ))}
      {/* Single-Pane Floating Edge Tray Pills for Hidden / Collapsed Panels with Notification Dots */}
      {collapsedOrHiddenPanels.length > 0 && (
        <div
          data-testid="studio-edge-tray-bar"
          className="no-print fixed bottom-3 right-3 z-40 flex items-center gap-1.5 px-2 py-1.5 rounded-full border border-border/90 bg-card/95 backdrop-blur-md shadow-xl"
        >
          {collapsedOrHiddenPanels.map((p) => {
            const badge = panelBadges[p.id]
            return (
              <button
                key={p.id}
                type="button"
                data-testid={`edge-tray-open-${p.id}`}
                onClick={() => {
                  const defaultDock: StudioDockSlot = p.id === 'cards' ? 'left' : 'bottom'
                  const targetDock = p.dock === 'hidden' ? defaultDock : p.dock
                  onChangeLayout(
                    movePanelToDock({ ...layout, allPanelsHidden: false }, p.id, targetDock)
                  )
                }}
                className="relative px-2.5 py-1 rounded-full bg-muted/60 hover:bg-primary hover:text-primary-foreground text-[11px] font-semibold flex items-center gap-1 transition-colors"
                title={`Open ${p.title} panel`}
              >
                <span>{p.icon}</span>
                <span>{p.title}</span>
                {typeof badge?.count === 'number' && badge.count > 0 && (
                  <span className="px-1 rounded-full bg-background/80 text-foreground text-[9px] font-mono font-bold">
                    {badge.count}
                  </span>
                )}
                {badge?.highlight && (
                  <span
                    className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-card animate-pulse"
                    aria-label={`${p.title} attention highlight`}
                  />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
