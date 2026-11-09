import { useMemo, useState } from 'react'
import {
  X,
  FileText,
  Copy,
  Check,
  Printer,
  Columns,
  MapPin,
  Users,
  Clock,
  Globe,
  Sliders,
  RotateCcw,
} from 'lucide-react'
import { TwoPagerCurationConfig, WorldState } from '../engine/types'
import {
  buildWorldTwoPageOverview,
  exportTwoPageOverviewMarkdown,
  toggleTwoPagerExcludeItem,
  toggleTwoPagerPinItem,
} from '../engine/twoPageOverviewEngine'
import { TERRAIN_PALETTE, createDefaultTile, getTileId } from '../engine/mapEngine'

interface WorldTwoPagerModalProps {
  isOpen: boolean
  onClose: () => void
  world: WorldState
  onSelectCoord?: (col: number, row: number) => void
  onSelectEntity?: (entityId: string) => void
  onUpdateTwoPagerConfig?: (config: TwoPagerCurationConfig) => void
}

type TwoPagerViewMode = 'spread' | 'page1' | 'page2'

export function WorldTwoPagerModal({
  isOpen,
  onClose,
  world,
  onSelectCoord,
  onSelectEntity,
  onUpdateTwoPagerConfig,
}: WorldTwoPagerModalProps) {
  const [viewMode, setViewMode] = useState<TwoPagerViewMode>('spread')
  const [copied, setCopied] = useState(false)
  const [isCurating, setIsCurating] = useState(false)

  const overview = useMemo(() => buildWorldTwoPageOverview(world), [world])

  if (!isOpen) return null

  const currentConfig: TwoPagerCurationConfig = world.twoPagerConfig || {}
  const pinnedCount =
    (currentConfig.pinnedTileIds?.length || 0) +
    (currentConfig.pinnedEntityIds?.length || 0) +
    (currentConfig.pinnedEventIds?.length || 0)
  const excludedCount =
    (currentConfig.excludedTileIds?.length || 0) +
    (currentConfig.excludedEntityIds?.length || 0) +
    (currentConfig.excludedEventIds?.length || 0)

  const handleTogglePin = (category: 'tile' | 'entity' | 'event', itemId: string) => {
    if (!onUpdateTwoPagerConfig) return
    onUpdateTwoPagerConfig(toggleTwoPagerPinItem(currentConfig, category, itemId))
  }

  const handleToggleExclude = (category: 'tile' | 'entity' | 'event', itemId: string) => {
    if (!onUpdateTwoPagerConfig) return
    onUpdateTwoPagerConfig(toggleTwoPagerExcludeItem(currentConfig, category, itemId))
  }

  const handleCopyMarkdown = () => {
    const md = exportTwoPageOverviewMarkdown(overview)
    navigator.clipboard?.writeText(md)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleJumpToTile = (tileId: string) => {
    const [cStr, rStr] = tileId.split(',')
    const col = parseInt(cStr, 10)
    const row = parseInt(rStr, 10)
    if (!Number.isNaN(col) && !Number.isNaN(row) && onSelectCoord) {
      onSelectCoord(col, row)
      onClose()
    }
  }

  const { page1, page2 } = overview

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="two-pager-modal-title"
      data-testid="world-two-pager-modal"
    >
      <div className="bg-card border border-border w-full max-w-7xl max-h-[94vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Action Header */}
        <div className="no-print px-5 py-3.5 border-b border-border bg-muted/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/15 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="two-pager-modal-title" className="text-lg font-black">
                  2-Page World Overview: {overview.worldName}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  Deterministic · Non-LLM
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Condensed 2-page executive folio — Page 1: Physical Atlas &amp; Gazetteer · Page 2: Peoples, Diplomacy &amp; Four Ages Digest
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-background border border-border rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('spread')}
                className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-all ${
                  viewMode === 'spread'
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Columns className="h-3.5 w-3.5" />
                <span>2-Page Spread</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('page1')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  viewMode === 'page1'
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Page 1: Atlas
              </button>
              <button
                type="button"
                onClick={() => setViewMode('page2')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  viewMode === 'page2'
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Page 2: History
              </button>
            </div>

            {onUpdateTwoPagerConfig && (
              <button
                type="button"
                data-testid="two-pager-curate-toggle-btn"
                onClick={() => setIsCurating((v) => !v)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isCurating
                    ? 'bg-primary text-primary-foreground border-primary shadow-2xs'
                    : 'bg-background border-border hover:bg-muted text-foreground'
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>
                  📌 Curate &amp; Pin
                  {pinnedCount + excludedCount > 0
                    ? ` (${pinnedCount} pinned${excludedCount > 0 ? `, ${excludedCount} hidden` : ''})`
                    : ''}
                </span>
              </button>
            )}

            <button
              type="button"
              data-testid="copy-two-pager-md-btn"
              onClick={handleCopyMarkdown}
              className="btn-outline px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Copied 2-Pager!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy 2-Pager (.md)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="btn-primary px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print 2-Pager</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close 2-Page World Overview"
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Collapsible Curation & Section Pinning Studio Drawer */}
        {isCurating && onUpdateTwoPagerConfig && (
          <div
            data-testid="two-pager-curation-drawer"
            className="no-print px-5 py-3.5 border-b border-primary/30 bg-primary/[0.04] space-y-3 text-xs animate-in fade-in duration-150 shrink-0"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-bold text-primary flex items-center gap-1.5">
                <Sliders className="h-4 w-4" />
                <span>2-Pager Curation &amp; Section Pinning</span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  — Pin must-have landmarks, entities, or turns so they always appear in the 2-Page spread, or customize the Executive Synopsis.
                </span>
              </div>
              {(pinnedCount > 0 || excludedCount > 0 || page1.hasCustomSynopsis) && (
                <button
                  type="button"
                  data-testid="two-pager-reset-pins-btn"
                  onClick={() => onUpdateTwoPagerConfig({})}
                  className="px-2.5 py-1 rounded-lg bg-background border border-border hover:bg-muted text-[11px] font-semibold flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset All Curation ({pinnedCount + excludedCount})</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              {/* Custom Synopsis Override */}
              <div className="lg:col-span-6 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Executive Synopsis (Editable Override)
                  </label>
                  {page1.hasCustomSynopsis && (
                    <button
                      type="button"
                      data-testid="two-pager-reset-synopsis-btn"
                      onClick={() =>
                        onUpdateTwoPagerConfig({
                          ...currentConfig,
                          customSynopsisOverride: undefined,
                        })
                      }
                      className="text-[10px] text-primary hover:underline"
                    >
                      Restore Auto-Synopsis
                    </button>
                  )}
                </div>
                <textarea
                  data-testid="two-pager-synopsis-input"
                  rows={2}
                  value={
                    currentConfig.customSynopsisOverride !== undefined
                      ? currentConfig.customSynopsisOverride
                      : page1.defaultExecutiveSynopsis
                  }
                  onChange={(e) =>
                    onUpdateTwoPagerConfig({
                      ...currentConfig,
                      customSynopsisOverride: e.target.value,
                    })
                  }
                  className="input w-full text-xs py-1.5 leading-snug"
                />
              </div>

              {/* Quick-Pin Pickers */}
              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    📌 Pin Map Province
                  </label>
                  <select
                    aria-label="Pin Map Province"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) handleTogglePin('tile', e.target.value)
                    }}
                    className="input h-8 text-xs py-1 w-full"
                  >
                    <option value="">+ Pin Landmark/Tile...</option>
                    {Object.values(world.map.tiles)
                      .filter(
                        (t) =>
                          t.label ||
                          (t.slots && t.slots.length > 0) ||
                          t.linkedEventIds.length > 0
                      )
                      .map((t) => {
                        const isPinned = (currentConfig.pinnedTileIds || []).includes(t.id)
                        const label =
                          t.label ||
                          t.slots?.[0]?.name ||
                          `${TERRAIN_PALETTE[t.terrain]?.label || t.terrain}`
                        return (
                          <option key={t.id} value={t.id}>
                            {isPinned ? '📌 ' : ''}({t.id}) {label}
                          </option>
                        )
                      })}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    📌 Pin Codex Entity
                  </label>
                  <select
                    aria-label="Pin Codex Entity"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) handleTogglePin('entity', e.target.value)
                    }}
                    className="input h-8 text-xs py-1 w-full"
                  >
                    <option value="">+ Pin Species/Society...</option>
                    {world.entities.map((ent) => {
                      const isPinned = (currentConfig.pinnedEntityIds || []).includes(ent.id)
                      return (
                        <option key={ent.id} value={ent.id}>
                          {isPinned ? '📌 ' : ''}
                          {ent.icon} {ent.name}
                        </option>
                      )
                    })}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    📌 Pin Chronicle Turn
                  </label>
                  <select
                    aria-label="Pin Chronicle Turn"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) handleTogglePin('event', e.target.value)
                    }}
                    className="input h-8 text-xs py-1 w-full"
                  >
                    <option value="">+ Pin Pivotal Turn...</option>
                    {world.drawHistory.map((rec) => {
                      const isPinned = (currentConfig.pinnedEventIds || []).includes(rec.id)
                      return (
                        <option key={rec.id} value={rec.id}>
                          {isPinned ? '📌 ' : ''}#{rec.moveId} {rec.actionTitle || rec.power}
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable 2-Page Spread Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/20">
          <div
            className={
              viewMode === 'spread'
                ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 items-start'
                : 'max-w-4xl mx-auto space-y-6'
            }
          >
            {/* ==============================================================
                PAGE 1: PHYSICAL ATLAS, BIOME PROFILE & TOP LANDMARKS GAZETTEER
                ============================================================== */}
            {(viewMode === 'spread' || viewMode === 'page1') && (
              <section
                data-testid="two-pager-page-1"
                className="card p-5 sm:p-6 bg-card border-2 border-border/80 shadow-md space-y-4 break-after-page"
              >
                {/* Page 1 Folio Header */}
                <div className="flex items-center justify-between border-b-2 border-primary/30 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                      Page 1 of 2 · Physical &amp; Geopolitical Atlas
                    </span>
                    <h3 className="text-xl font-black text-foreground">
                      {overview.worldName}
                    </h3>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-bold flex items-center justify-end gap-1">
                      <span>{overview.stability.icon}</span>
                      <span>{overview.stability.status}</span>
                      <span className="font-mono text-muted-foreground">
                        ({overview.stability.score}/100)
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      Seed: {overview.seed} · {overview.totalTurns} Turns
                    </div>
                  </div>
                </div>

                {/* Deterministic Executive Synopsis */}
                <div className="p-3.5 rounded-xl bg-primary/[0.04] border border-primary/25 text-xs leading-relaxed">
                  <div className="font-bold text-primary uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    <span>Executive Realm Synopsis</span>
                  </div>
                  <p data-testid="two-pager-executive-synopsis" className="text-foreground/95">
                    {page1.executiveSynopsis}
                  </p>
                </div>

                {/* Compact Mini-Atlas Snapshot + Biome Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-muted/30 p-3 rounded-xl border border-border">
                  {/* Mini-Atlas Grid */}
                  <div className="sm:col-span-5 flex flex-col items-center">
                    <div
                      className="inline-grid gap-px p-1 rounded bg-stone-950/30 border border-border"
                      style={{
                        gridTemplateColumns: `repeat(${world.map.width}, minmax(10px, 13px))`,
                      }}
                    >
                      {Array.from({ length: world.map.height }).map((_, r) =>
                        Array.from({ length: world.map.width }).map((__, c) => {
                          const tid = getTileId(c, r)
                          const t = world.map.tiles[tid] || createDefaultTile(c, r)
                          const meta = TERRAIN_PALETTE[t.terrain] || TERRAIN_PALETTE.ocean
                          return (
                            <button
                              key={tid}
                              type="button"
                              onClick={() => handleJumpToTile(tid)}
                              style={{ backgroundColor: meta.color }}
                              className="h-3 rounded-[1px] text-[7px] flex items-center justify-center hover:ring-1 hover:ring-white"
                              title={`(${c},${r}) ${meta.label}${t.label ? ` — ${t.label}` : ''}`}
                            >
                              {t.slots && t.slots.length > 0 ? t.slots[0].icon : ''}
                            </button>
                          )
                        })
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      Click any province to inspect on Map
                    </span>
                  </div>

                  {/* Biome & Feature Metrics */}
                  <div className="sm:col-span-7 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <span>🌍 Land: {page1.biomeBreakdown.landPercent}%</span>
                      <span>🌊 Seas: {page1.biomeBreakdown.waterPercent}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-blue-500/30 overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${page1.biomeBreakdown.landPercent}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px]">
                      <div className="px-2 py-1 rounded bg-background border border-border flex items-center justify-between">
                        <span>🏔️ Peaks</span>
                        <span className="font-mono font-bold">
                          {page1.biomeBreakdown.mountainCount}
                        </span>
                      </div>
                      <div className="px-2 py-1 rounded bg-background border border-border flex items-center justify-between">
                        <span>🌲 Forests</span>
                        <span className="font-mono font-bold">
                          {page1.biomeBreakdown.forestCount}
                        </span>
                      </div>
                      <div className="px-2 py-1 rounded bg-background border border-border flex items-center justify-between">
                        <span>🌊 Rivers</span>
                        <span className="font-mono font-bold">
                          {page1.biomeBreakdown.riverCount}
                        </span>
                      </div>
                      <div className="px-2 py-1 rounded bg-background border border-border flex items-center justify-between">
                        <span>🏘️ Towns</span>
                        <span className="font-mono font-bold">
                          {page1.biomeBreakdown.settlementCount}
                        </span>
                      </div>
                      <div className="px-2 py-1 rounded bg-background border border-border flex items-center justify-between">
                        <span>🏛️ Sites</span>
                        <span className="font-mono font-bold">
                          {page1.biomeBreakdown.landmarkCount}
                        </span>
                      </div>
                      <div className="px-2 py-1 rounded bg-background border border-border flex items-center justify-between">
                        <span>🛤️ Roads</span>
                        <span className="font-mono font-bold">
                          {page1.biomeBreakdown.roadCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top 8 Iconic Regions & Landmarks Gazetteer */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-border pb-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Top Regions &amp; Landmarks Gazetteer ({page1.topLandmarks.length})</span>
                    </h4>
                    <span className="text-[10px] text-muted-foreground">
                      Ranked by historical mentions &amp; priority
                    </span>
                  </div>

                  {page1.topLandmarks.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-3">
                      No named landmarks or region slots placed yet. Stamp presets or custom features onto the map to populate this gazetteer.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {page1.topLandmarks.map((lm) => (
                        <div
                          key={lm.tileId}
                          className={`p-2.5 rounded-lg bg-background border transition-all text-xs space-y-1 ${
                            lm.isPinned
                              ? 'border-primary/70 ring-1 ring-primary/30'
                              : 'border-border/80 hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold truncate flex items-center gap-1">
                              {lm.isPinned && <span title="Pinned to 2-Pager">📌</span>}
                              <span>{lm.icon}</span>
                              <span>{lm.name}</span>
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleJumpToTile(lm.tileId)}
                                className="px-1.5 py-0.2 rounded bg-primary/10 text-primary font-mono text-[10px] hover:underline shrink-0"
                                title="Jump to map coordinate"
                              >
                                ({lm.tileId})
                              </button>
                              {onUpdateTwoPagerConfig && (
                                <button
                                  type="button"
                                  data-testid={`two-pager-pin-tile-${lm.tileId}`}
                                  onClick={() => handleTogglePin('tile', lm.tileId)}
                                  className={`no-print px-1 py-0.2 rounded text-[10px] border transition-colors ${
                                    lm.isPinned
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground'
                                  }`}
                                  title={lm.isPinned ? 'Unpin landmark' : 'Pin landmark to 2-Pager'}
                                >
                                  📌
                                </button>
                              )}
                              {onUpdateTwoPagerConfig && isCurating && (
                                <button
                                  type="button"
                                  data-testid={`two-pager-hide-tile-${lm.tileId}`}
                                  onClick={() => handleToggleExclude('tile', lm.tileId)}
                                  className="no-print px-1 py-0.2 rounded text-[10px] bg-destructive/10 text-destructive hover:bg-destructive/20"
                                  title="Hide landmark from 2-Pager"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="text-[10px] text-muted-foreground flex items-center justify-between">
                            <span>{lm.terrainLabel}</span>
                            {lm.turnMentions > 0 && (
                              <span>{lm.turnMentions} turn{lm.turnMentions > 1 ? 's' : ''}</span>
                            )}
                          </div>
                          <p className="text-[11px] text-foreground/85 leading-snug">
                            {lm.summary}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ==============================================================
                PAGE 2: PEOPLES, POWERS, DIPLOMACY & THE FOUR AGES DIGEST
                ============================================================== */}
            {(viewMode === 'spread' || viewMode === 'page2') && (
              <section
                data-testid="two-pager-page-2"
                className="card p-5 sm:p-6 bg-card border-2 border-border/80 shadow-md space-y-4"
              >
                {/* Page 2 Folio Header */}
                <div className="flex items-center justify-between border-b-2 border-primary/30 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                      Page 2 of 2 · Peoples, Diplomacy &amp; Four Ages Digest
                    </span>
                    <h3 className="text-xl font-black text-foreground">
                      Civilizations &amp; Chronicle of {overview.worldName}
                    </h3>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-bold text-primary">{overview.currentStageName}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {overview.totalEntities} Codex Entries
                    </div>
                  </div>
                </div>

                {/* Top 8 Species, Societies & Mythic Forces */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-border pb-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      <span>Major Species, Societies &amp; Mythic Forces ({page2.topEntities.length})</span>
                    </h4>
                    <span className="text-[10px] text-muted-foreground">
                      Ranked by chronicle &amp; diplomatic weight
                    </span>
                  </div>

                  {page2.topEntities.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-2">
                      No Codex species, societies, or myths recorded yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {page2.topEntities.map((ent) => (
                        <div
                          key={ent.id}
                          className={`p-2.5 rounded-lg bg-background border transition-all text-xs space-y-1 ${
                            ent.isPinned
                              ? 'border-primary/70 ring-1 ring-primary/30'
                              : 'border-border/80 hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (onSelectEntity) {
                                  onSelectEntity(ent.id)
                                  onClose()
                                }
                              }}
                              className="font-bold truncate flex items-center gap-1 hover:text-primary text-left"
                            >
                              {ent.isPinned && <span title="Pinned to 2-Pager">📌</span>}
                              <span>{ent.icon}</span>
                              <span>{ent.name}</span>
                            </button>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="px-1.5 py-0.2 rounded bg-muted text-[9px] uppercase font-semibold">
                                {ent.category}
                              </span>
                              {ent.originTileId && (
                                <button
                                  type="button"
                                  onClick={() => handleJumpToTile(ent.originTileId!)}
                                  className="px-1.5 py-0.2 rounded bg-primary/10 text-primary font-mono text-[10px] hover:underline"
                                >
                                  ({ent.originTileId})
                                </button>
                              )}
                              {onUpdateTwoPagerConfig && (
                                <button
                                  type="button"
                                  data-testid={`two-pager-pin-entity-${ent.id}`}
                                  onClick={() => handleTogglePin('entity', ent.id)}
                                  className={`no-print px-1 py-0.2 rounded text-[10px] border transition-colors ${
                                    ent.isPinned
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground'
                                  }`}
                                  title={ent.isPinned ? 'Unpin entity' : 'Pin entity to 2-Pager'}
                                >
                                  📌
                                </button>
                              )}
                              {onUpdateTwoPagerConfig && isCurating && (
                                <button
                                  type="button"
                                  data-testid={`two-pager-hide-entity-${ent.id}`}
                                  onClick={() => handleToggleExclude('entity', ent.id)}
                                  className="no-print px-1 py-0.2 rounded text-[10px] bg-destructive/10 text-destructive hover:bg-destructive/20"
                                  title="Hide entity from 2-Pager"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="text-[10px] text-primary/90 font-medium truncate">
                            {ent.traitsSummary}
                          </div>
                          <p className="text-[11px] text-foreground/85 leading-snug">
                            {ent.shortDescription}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Active Diplomatic Web & Fault Lines */}
                {page2.diplomaticHighlights.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border pb-1">
                      ⚔️ Active Diplomatic Web &amp; Fault Lines
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {page2.diplomaticHighlights.map((dip) => (
                        <div
                          key={dip.id}
                          className="px-2.5 py-1.5 rounded-lg bg-muted/40 border border-border text-[11px] flex items-center justify-between gap-2"
                        >
                          <span className="font-semibold truncate">
                            {dip.sourceIcon} {dip.sourceName} ↔ {dip.targetIcon} {dip.targetName}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-[10px] shrink-0">
                            {dip.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* The Four Ages Condensed Digest */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-border pb-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>The Four Ages — Condensed Chronicle Digest</span>
                    </h4>
                    <span className="text-[10px] text-muted-foreground">
                      Top pivotal turns per historical stage
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {page2.eraDigests.map((era) => (
                      <div
                        key={era.stageId}
                        className="p-3 rounded-xl bg-muted/30 border border-border space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between border-b border-border/60 pb-1">
                          <span className="font-bold text-primary">
                            Age {era.stageNumber}: {era.stageName}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {era.totalTurns} turn{era.totalTurns === 1 ? '' : 's'}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground italic">
                          {era.headline}
                        </div>

                        {era.pivotalEvents.length === 0 ? (
                          <div className="text-[11px] text-muted-foreground/70 py-1">
                            No turns recorded in this stage yet.
                          </div>
                        ) : (
                          <ul className="space-y-1 pt-0.5">
                            {era.pivotalEvents.map((ev) => (
                              <li
                                key={ev.moveId}
                                className="text-[11px] leading-snug flex items-start justify-between gap-1.5"
                              >
                                <div>
                                  {ev.isPinned && <span title="Pinned to 2-Pager">📌 </span>}
                                  <span className="font-mono font-bold text-primary">
                                    #{ev.moveId}
                                  </span>{' '}
                                  <span className="font-semibold">{ev.title}:</span>{' '}
                                  <span className="text-foreground/85">{ev.summary}</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {ev.tileId && (
                                    <button
                                      type="button"
                                      onClick={() => handleJumpToTile(ev.tileId!)}
                                      className="px-1 py-0.2 rounded bg-primary/10 text-primary font-mono text-[9px] shrink-0 hover:underline"
                                    >
                                      ({ev.tileId})
                                    </button>
                                  )}
                                  {onUpdateTwoPagerConfig && isCurating && (
                                    <button
                                      type="button"
                                      data-testid={`two-pager-hide-event-${ev.recordId}`}
                                      onClick={() => handleToggleExclude('event', ev.recordId)}
                                      className="no-print px-1 py-0.2 rounded text-[9px] bg-destructive/10 text-destructive hover:bg-destructive/20"
                                      title="Hide turn from 2-Pager"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
