import React, { useRef, useState } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'

export type ExpandedPaneId = 'none' | 'map' | 'cards' | 'history'

interface SinglePaneStudioLayoutProps {
  mapCanvas: React.ReactNode
  cardsPanel: React.ReactNode
  chroniclePanel: React.ReactNode
  codexPanel: React.ReactNode
  chronicleCount: number
  codexCount: number
  deckCount: number
  isCardDrawn: boolean
  onQuickDrawCard?: () => void
}

/**
 * Phase 63 (ADR-067): True Single-Pane-of-Glass 70/30 World Builder Studio.
 * - Left 70% (resizable 45%-85%): Full-focus World Map Canvas
 * - Right 30% (resizable): Stacked Top (Cards & Current Turn) + Bottom (Chronicle / Codex)
 * - Every section (Map, Cards & Turn, Chronicle/Codex) can expand to 100% fullscreen and restore cleanly.
 */
export function SinglePaneStudioLayout({
  mapCanvas,
  cardsPanel,
  chroniclePanel,
  codexPanel,
  chronicleCount,
  codexCount,
  deckCount,
  isCardDrawn,
  onQuickDrawCard,
}: SinglePaneStudioLayoutProps) {
  const [mapWidthPct, setMapWidthPct] = useState(70)
  const [topSectionPct, setTopSectionPct] = useState(54)
  const [bottomTab, setBottomTab] = useState<'chronicle' | 'codex'>('chronicle')
  const [expandedPane, setExpandedPane] = useState<ExpandedPaneId>('none')

  const containerRef = useRef<HTMLDivElement | null>(null)
  const sidebarRef = useRef<HTMLDivElement | null>(null)

  const startHorizontalResize = (e: React.MouseEvent) => {
    e.preventDefault()
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()

    const handleMove = (ev: MouseEvent) => {
      const nextPct = ((ev.clientX - rect.left) / rect.width) * 100
      setMapWidthPct(Math.max(45, Math.min(85, Math.round(nextPct))))
    }
    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
  }

  const startVerticalResize = (e: React.MouseEvent) => {
    e.preventDefault()
    const sidebar = sidebarRef.current
    if (!sidebar) return
    const rect = sidebar.getBoundingClientRect()

    const handleMove = (ev: MouseEvent) => {
      const nextPct = ((ev.clientY - rect.top) / rect.height) * 100
      setTopSectionPct(Math.max(25, Math.min(78, Math.round(nextPct))))
    }
    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
  }

  const isMapFullscreen = expandedPane === 'map'
  const isCardsFullscreen = expandedPane === 'cards'
  const isHistoryFullscreen = expandedPane === 'history'

  return (
    <div
      ref={containerRef}
      data-testid="studio-dock-workspace"
      className="flex-1 min-h-0 flex flex-row overflow-hidden bg-background select-none"
    >
      {/* LEFT 70%: WORLD MAP CANVAS */}
      {!isCardsFullscreen && !isHistoryFullscreen && (
        <section
          data-testid="studio-center-canvas"
          style={{ width: isMapFullscreen ? '100%' : `${mapWidthPct}%` }}
          className="relative h-full min-w-0 flex flex-col overflow-hidden bg-muted/15"
        >
          {/* Floating Map Fullscreen Toggle */}
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5">
            {isMapFullscreen && onQuickDrawCard && !isCardDrawn && (
              <button
                type="button"
                onClick={onQuickDrawCard}
                className="btn-primary px-2.5 py-1 text-[11px] font-bold shadow-md"
              >
                ▶ Draw Card ({deckCount})
              </button>
            )}
            <button
              type="button"
              data-testid="expand-map-btn"
              onClick={() => setExpandedPane(isMapFullscreen ? 'none' : 'map')}
              className="px-2 py-1 rounded-md border border-border bg-card/90 backdrop-blur text-[11px] font-semibold text-foreground hover:bg-muted shadow-sm flex items-center gap-1"
              title={isMapFullscreen ? 'Restore 70/30 Studio Split' : 'Expand Map to Fullscreen'}
              aria-label={isMapFullscreen ? 'Restore Studio Split' : 'Expand Map Fullscreen'}
            >
              {isMapFullscreen ? (
                <>
                  <Minimize2 className="h-3 w-3" />
                  <span>70/30</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3 w-3" />
                  <span className="hidden xl:inline">Full Map</span>
                </>
              )}
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden select-text">{mapCanvas}</div>

          {/* Floating Edge Tray Pills when Map is Fullscreen */}
          {isMapFullscreen && (
            <div
              data-testid="studio-edge-tray-bar"
              className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-border bg-card/95 backdrop-blur-md shadow-xl text-xs"
            >
              <button
                type="button"
                data-testid="edge-tray-open-cards"
                onClick={() => setExpandedPane('none')}
                className="px-2.5 py-1 rounded-full hover:bg-muted font-semibold flex items-center gap-1"
              >
                <span>🃏</span>
                <span>Cards &amp; Turn</span>
                <span className="text-[10px] font-mono text-muted-foreground">{deckCount}</span>
              </button>
              <button
                type="button"
                data-testid="edge-tray-open-chronicle"
                onClick={() => {
                  setBottomTab('chronicle')
                  setExpandedPane('none')
                }}
                className="px-2.5 py-1 rounded-full hover:bg-muted font-semibold flex items-center gap-1"
              >
                <span>📜</span>
                <span>Chronicle</span>
                <span className="text-[10px] font-mono text-muted-foreground">{chronicleCount}</span>
              </button>
              <button
                type="button"
                data-testid="edge-tray-open-codex"
                onClick={() => {
                  setBottomTab('codex')
                  setExpandedPane('none')
                }}
                className="px-2.5 py-1 rounded-full hover:bg-muted font-semibold flex items-center gap-1"
              >
                <span>👥</span>
                <span>Codex</span>
                <span className="text-[10px] font-mono text-muted-foreground">{codexCount}</span>
              </button>
            </div>
          )}
        </section>
      )}

      {/* HORIZONTAL 70/30 RESIZE HANDLE */}
      {expandedPane === 'none' && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize Map and Sidebar"
          onMouseDown={startHorizontalResize}
          className="w-1.5 shrink-0 cursor-col-resize bg-border/60 hover:bg-primary/60 transition-colors"
          title="Drag to resize Map / Sidebar split"
        />
      )}

      {/* RIGHT 30%: SIDEBAR (TOP: CARDS & TURN · BOTTOM: CHRONICLE / CODEX) */}
      {!isMapFullscreen && (
        <aside
          ref={sidebarRef}
          data-testid="studio-right-sidebar"
          style={{
            width:
              isCardsFullscreen || isHistoryFullscreen ? '100%' : `${100 - mapWidthPct}%`,
          }}
          className="h-full min-w-[280px] flex flex-col overflow-hidden bg-card border-l border-border/70"
        >
          {/* TOP SECTION: CARDS & CURRENT TURN */}
          {!isHistoryFullscreen && (
            <div
              data-testid="studio-sidebar-cards-pane"
              style={{ height: isCardsFullscreen ? '100%' : `${topSectionPct}%` }}
              className="min-h-0 flex flex-col overflow-hidden"
            >
              <div className="px-2.5 py-1 border-b border-border/70 bg-muted/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <span>🃏</span>
                  <span>Card &amp; Active Turn</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                    {deckCount} left
                  </span>
                </div>
                <button
                  type="button"
                  data-testid="expand-cards-btn"
                  onClick={() => setExpandedPane(isCardsFullscreen ? 'none' : 'cards')}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                  title={isCardsFullscreen ? 'Restore Split View' : 'Expand Card & Turn Fullscreen'}
                  aria-label={isCardsFullscreen ? 'Restore Card Panel' : 'Expand Card Panel Fullscreen'}
                >
                  {isCardsFullscreen ? (
                    <Minimize2 className="h-3.5 w-3.5" />
                  ) : (
                    <Maximize2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto p-2.5 select-text">
                {cardsPanel}
              </div>
            </div>
          )}

          {/* VERTICAL RESIZE HANDLE BETWEEN TOP & BOTTOM SIDEBAR SECTIONS */}
          {expandedPane === 'none' && (
            <div
              role="separator"
              aria-orientation="horizontal"
              aria-label="Resize Cards and History panes"
              onMouseDown={startVerticalResize}
              className="h-1.5 shrink-0 cursor-row-resize bg-border/60 hover:bg-primary/60 transition-colors"
              title="Drag to resize Card & Turn / History split"
            />
          )}

          {/* BOTTOM SECTION: CHRONICLE (HISTORY) & CODEX */}
          {!isCardsFullscreen && (
            <div
              data-testid="studio-sidebar-history-pane"
              style={{ height: isHistoryFullscreen ? '100%' : `${100 - topSectionPct}%` }}
              className="min-h-0 flex flex-col overflow-hidden"
            >
              <div className="px-2 py-1 border-b border-border/70 bg-muted/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1" role="tablist" aria-label="History and Codex">
                  <button
                    type="button"
                    role="tab"
                    data-testid="sidebar-tab-chronicle"
                    aria-selected={bottomTab === 'chronicle'}
                    onClick={() => setBottomTab('chronicle')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                      bottomTab === 'chronicle'
                        ? 'bg-primary text-primary-foreground shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    📜 Chronicle ({chronicleCount})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    data-testid="sidebar-tab-codex"
                    aria-selected={bottomTab === 'codex'}
                    onClick={() => setBottomTab('codex')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                      bottomTab === 'codex'
                        ? 'bg-primary text-primary-foreground shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    👥 Codex ({codexCount})
                  </button>
                </div>
                <button
                  type="button"
                  data-testid="expand-history-btn"
                  onClick={() => setExpandedPane(isHistoryFullscreen ? 'none' : 'history')}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                  title={isHistoryFullscreen ? 'Restore Split View' : 'Expand History Fullscreen'}
                  aria-label={isHistoryFullscreen ? 'Restore History Panel' : 'Expand History Panel Fullscreen'}
                >
                  {isHistoryFullscreen ? (
                    <Minimize2 className="h-3.5 w-3.5" />
                  ) : (
                    <Maximize2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto p-2 select-text">
                {bottomTab === 'chronicle' ? chroniclePanel : codexPanel}
              </div>
            </div>
          )}
        </aside>
      )}
    </div>
  )
}
