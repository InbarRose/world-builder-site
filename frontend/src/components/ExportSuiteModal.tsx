import { useState } from 'react'
import {
  Download,
  FileText,
  FileJson,
  Layers,
  Image as ImageIcon,
  X,
  Compass,
  BookOpen,
  Palette,
  Sparkles,
} from 'lucide-react'
import { SelectiveExportOptions, WorldState } from '../engine/types'
import {
  downloadExportFile,
  exportCampaignSourcebookHtml,
  exportMapLayeredJson,
  exportWorldMarkdown,
  exportWorldYaml,
} from '../engine/exportService'
import { serializeWorld } from '../engine/storageService'
import { exportMapToSvgString } from '../engine/mapEngine'
import {
  CartoucheTheme,
  generateCartoucheMapSvg,
  renderCartoucheSvgToPngBlob,
} from '../engine/cartoucheExportEngine'

interface ExportSuiteModalProps {
  isOpen: boolean
  world: WorldState
  onClose: () => void
  onOpenShare?: () => void
}

type ExportTab = 'whole-world' | 'selective' | 'map-assets'

export function ExportSuiteModal({ isOpen, world, onClose, onOpenShare }: ExportSuiteModalProps) {
  const [activeTab, setActiveTab] = useState<ExportTab>('whole-world')
  const [baseFileName, setBaseFileName] = useState(
    () => `${world.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${new Date().toISOString().split('T')[0]}`
  )

  // Multi-Theme Sourcebook setting
  const [sourcebookTheme, setSourcebookTheme] = useState<
    'parchment' | 'grimdark' | 'royal-gold' | 'modern'
  >('parchment')

  // Cartouche Poster Settings
  const [cartoucheTheme, setCartoucheTheme] = useState<CartoucheTheme>('parchment')
  const [showBorder, setShowBorder] = useState(true)
  const [showCartouche, setShowCartouche] = useState(true)
  const [showLegend, setShowLegend] = useState(true)
  const [showCompass, setShowCompass] = useState(true)
  const [showScaleBar, setShowScaleBar] = useState(true)
  const [isExportingPng, setIsExportingPng] = useState(false)

  // Selective export checkboxes
  const [selectiveOptions, setSelectiveOptions] = useState<SelectiveExportOptions>({
    includeWorldMetadata: true,
    includeTimeline: true,
    includeCodex: true,
    includeMapState: true,
    includeGenerationSettings: true,
    includePlayers: true,
    stageFilter: 'all',
  })

  if (!isOpen) return null

  const handleDownloadHtmlSourcebook = () => {
    const html = exportCampaignSourcebookHtml(world, {
      ...selectiveOptions,
      sourcebookTheme,
    })
    downloadExportFile(`${baseFileName}-sourcebook.html`, html, 'text/html')
  }

  const handleDownloadMarkdown = () => {
    const md = exportWorldMarkdown(world, selectiveOptions)
    downloadExportFile(`${baseFileName}.md`, md, 'text/markdown')
  }

  const handleDownloadYaml = () => {
    const yaml = exportWorldYaml(world, selectiveOptions)
    downloadExportFile(`${baseFileName}.yaml`, yaml, 'text/yaml')
  }

  const handleDownloadJson = () => {
    const jsonStr = serializeWorld(world)
    downloadExportFile(`${baseFileName}.json`, jsonStr, 'application/json')
  }

  const handleDownloadLayeredMapJson = () => {
    const layered = exportMapLayeredJson(world)
    downloadExportFile(`${baseFileName}-map-layers.json`, JSON.stringify(layered, null, 2), 'application/json')
  }

  const handleDownloadMapSvg = () => {
    const svgStr = exportMapToSvgString(world.map, world.name)
    downloadExportFile(`${baseFileName}-map.svg`, svgStr, 'image/svg+xml')
  }

  const handleDownloadCartoucheSvg = () => {
    const svgStr = generateCartoucheMapSvg(world, {
      theme: cartoucheTheme,
      showBorder,
      showCartouche,
      showLegend,
      showCompass,
      showScaleBar,
    })
    downloadExportFile(`${baseFileName}-atlas-cartouche-${cartoucheTheme}.svg`, svgStr, 'image/svg+xml')
  }

  const handleDownloadCartouchePng = async () => {
    try {
      setIsExportingPng(true)
      const svgStr = generateCartoucheMapSvg(world, {
        theme: cartoucheTheme,
        showBorder,
        showCartouche,
        showLegend,
        showCompass,
        showScaleBar,
      })
      const pngBlob = await renderCartoucheSvgToPngBlob(svgStr, 3)
      const url = URL.createObjectURL(pngBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${baseFileName}-atlas-poster-${cartoucheTheme}-300dpi.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('High-DPI PNG export failed, falling back to SVG:', err)
      handleDownloadCartoucheSvg()
    } finally {
      setIsExportingPng(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Export Suite"
    >
      <div className="card p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">World Export & Archival Suite</h3>
              <p className="text-xs text-muted-foreground">
                Export book-ready Markdown, human-readable YAML, Schema v2 JSON, or multi-layer map assets
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-accent rounded-md"
            aria-label="Close Export Modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* File Name Configuration */}
        <div className="bg-muted/40 p-3.5 rounded-lg border border-border/70 space-y-1">
          <label className="text-xs font-semibold text-muted-foreground block">
            Export File Base Name
          </label>
          <input
            type="text"
            value={baseFileName}
            onChange={(e) => setBaseFileName(e.target.value)}
            className="input text-xs font-mono w-full h-8"
            placeholder="world-name"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border pb-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('whole-world')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'whole-world'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent text-foreground'
            }`}
          >
            Whole World Archive
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('selective')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'selective'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent text-foreground'
            }`}
          >
            Selective Section Export
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('map-assets')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'map-assets'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent text-foreground'
            }`}
          >
            Map Graphics & Layer Objects
          </button>

          {onOpenShare && (
            <button
              type="button"
              onClick={() => {
                onClose()
                onOpenShare()
              }}
              className="ml-auto px-2.5 py-1.5 rounded-md border border-primary/40 text-primary hover:bg-primary/10 flex items-center gap-1.5 font-semibold text-xs transition-colors"
              title="Open World Backup & Share Modal"
            >
              <FileJson className="h-3.5 w-3.5" />
              <span>Share & Backup (.json)</span>
            </button>
          )}
        </div>

        {/* Tab 1: Whole World Archive */}
        {activeTab === 'whole-world' && (
          <div className="space-y-4">
            {/* Featured Hero Card: Campaign Sourcebook with Multi-Theme Picker */}
            <div className="p-4 rounded-xl border-2 border-primary/40 bg-primary/5 space-y-3.5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <BookOpen className="h-4 w-4" />
                    <span>Official Campaign Sourcebook (.html / Print PDF)</span>
                    <span className="text-[10px] uppercase font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      Publication Ready
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                    Standalone fantasy RPG sourcebook with embedded SVG cartography, two-column lore chapters, drop caps, Codex stat blocks, and 1-click print-to-PDF formatting.
                  </p>
                </div>
                <button
                  type="button"
                  data-testid="export-sourcebook-btn"
                  onClick={handleDownloadHtmlSourcebook}
                  className="btn-primary shrink-0 px-4 py-2.5 text-xs font-bold flex items-center gap-2 shadow-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Campaign Book</span>
                </button>
              </div>

              {/* Sourcebook Theme Style Selector */}
              <div className="pt-2 border-t border-primary/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-primary flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5" />
                  <span>Typesetting Theme:</span>
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      { id: 'parchment', label: '📜 Parchment' },
                      { id: 'grimdark', label: '⚔️ Grimdark' },
                      { id: 'royal-gold', label: '👑 Royal Gold' },
                      { id: 'modern', label: '🌍 Modern Atlas' },
                    ] as const
                  ).map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      data-testid={`sourcebook-theme-${th.id}`}
                      onClick={() => setSourcebookTheme(th.id)}
                      className={`px-2.5 py-1 rounded-lg border font-semibold text-[11px] transition-all ${
                        sourcebookTheme === th.id
                          ? 'bg-primary text-primary-foreground border-primary shadow-2xs'
                          : 'bg-background border-border hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {th.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border border-border bg-card space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <FileText className="h-4 w-4" />
                    <span>Markdown (.md)</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Book-ready world chronicle, complete codex wiki with species/kingdoms/myths, and turn chronology.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadMarkdown}
                  className="btn-primary w-full text-xs py-2 flex items-center justify-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export Markdown</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                    <Layers className="h-4 w-4" />
                    <span>YAML (.yaml)</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Clean, human-readable structured YAML document formatted for tabletop wikis and game masters.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadYaml}
                  className="btn-outline w-full text-xs py-2 flex items-center justify-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export YAML</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <FileJson className="h-4 w-4" />
                    <span>JSON (Schema v2)</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Full programmatic backup with snapshots, turn history, map tiles, and configuration for re-importing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="btn-outline w-full text-xs py-2 flex items-center justify-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Selective Section Export */}
        {activeTab === 'selective' && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Select which sections to include in your customized Markdown or YAML export:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { key: 'includeWorldMetadata', label: 'World Title & Genesis Metadata' },
                { key: 'includeCodex', label: `Codex Wiki (${world.entities?.length || 0} Species, Kingdoms & Myths)` },
                { key: 'includeTimeline', label: `Historian's Chronicle (${world.drawHistory?.length || 0} Turns)` },
                { key: 'includeMapState', label: 'Atlas Geography Summary & Notable Landmarks' },
                { key: 'includePlayers', label: `Tabletop Roster (${world.players?.length || 0} Players & Bots)` },
                { key: 'includeGenerationSettings', label: 'World Genesis Seeds & Pacing Rules' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border bg-background cursor-pointer hover:bg-muted/50 text-xs"
                >
                  <input
                    type="checkbox"
                    checked={Boolean((selectiveOptions as any)[item.key])}
                    onChange={(e) =>
                      setSelectiveOptions((prev) => ({
                        ...prev,
                        [item.key]: e.target.checked,
                      }))
                    }
                    className="rounded border-border"
                  />
                  <span className="font-medium">{item.label}</span>
                </label>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={handleDownloadHtmlSourcebook}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Download Custom Sourcebook (.html)</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className="btn-outline text-xs px-4 py-2 flex items-center gap-1.5"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Download Custom Markdown</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadYaml}
                className="btn-outline text-xs px-4 py-2 flex items-center gap-1.5"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Download Custom YAML</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Map Graphics & Layer Objects */}
        {activeTab === 'map-assets' && (
          <div className="space-y-4">
            {/* Featured Hero Card: High-DPI Cartographic Atlas Poster & Cartouche */}
            <div
              data-testid="cartouche-export-card"
              className="p-4 rounded-xl border-2 border-primary/40 bg-primary/5 space-y-3.5"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <Sparkles className="h-4 w-4" />
                    <span>High-DPI Cartographic Atlas Poster &amp; Cartouche</span>
                    <span className="text-[10px] uppercase font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      300 DPI Ready
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                    Print-grade fantasy world map with decorative border margins, corner filigrees, ornate title cartouche, 8-point compass rose, map legend, and distance scale bar.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    data-testid="download-cartouche-svg-btn"
                    onClick={handleDownloadCartoucheSvg}
                    className="btn-outline px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Vector (.svg)</span>
                  </button>
                  <button
                    type="button"
                    data-testid="download-cartouche-png-btn"
                    onClick={handleDownloadCartouchePng}
                    disabled={isExportingPng}
                    className="btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    <span>{isExportingPng ? 'Rendering PNG...' : 'Download 300 DPI (.png)'}</span>
                  </button>
                </div>
              </div>

              {/* Cartouche Controls & Theme Selector */}
              <div className="pt-2 border-t border-primary/20 space-y-2.5 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-primary flex items-center gap-1.5">
                    <Palette className="h-3.5 w-3.5" />
                    <span>Cartographic Atlas Style:</span>
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(
                      [
                        { id: 'parchment', label: '📜 Parchment' },
                        { id: 'grimdark', label: '⚔️ Grimdark' },
                        { id: 'royal-gold', label: '👑 Royal Gold' },
                        { id: 'atlas', label: '🌍 Modern Atlas' },
                      ] as const
                    ).map((cth) => (
                      <button
                        key={cth.id}
                        type="button"
                        data-testid={`cartouche-theme-${cth.id}`}
                        onClick={() => setCartoucheTheme(cth.id)}
                        className={`px-2.5 py-1 rounded-lg border font-semibold text-[11px] transition-all ${
                          cartoucheTheme === cth.id
                            ? 'bg-primary text-primary-foreground border-primary shadow-2xs'
                            : 'bg-background border-border hover:bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {cth.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Elements Toggles */}
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground pt-1">
                  <span className="font-semibold text-foreground">Frame Elements:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showBorder}
                      onChange={(e) => setShowBorder(e.target.checked)}
                      className="rounded border-border"
                    />
                    <span>Ornate Filigree Border</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showCartouche}
                      onChange={(e) => setShowCartouche(e.target.checked)}
                      className="rounded border-border"
                    />
                    <span>Title Cartouche</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showCompass}
                      onChange={(e) => setShowCompass(e.target.checked)}
                      className="rounded border-border"
                    />
                    <span>Compass Rose</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showLegend}
                      onChange={(e) => setShowLegend(e.target.checked)}
                      className="rounded border-border"
                    />
                    <span>Map Legend</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showScaleBar}
                      onChange={(e) => setShowScaleBar(e.target.checked)}
                      className="rounded border-border"
                    />
                    <span>Scale Bar</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Existing Raw SVG & Complex Layer JSON Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-border bg-card space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <ImageIcon className="h-4 w-4" />
                    <span>Raw Map Vector (SVG)</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Unframed raw tile vector graphic without cartouche margins or borders.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadMapSvg}
                  className="btn-outline w-full text-xs py-2 flex items-center justify-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Raw Map SVG</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                    <Compass className="h-4 w-4" />
                    <span>Complex Layered Objects (JSON)</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Structured arrays for terrain base, elevation relief, hydrology, flora, slots, overlays, and kingdom territory borders.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadLayeredMapJson}
                  className="btn-outline w-full text-xs py-2 flex items-center justify-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Map Layers JSON</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
