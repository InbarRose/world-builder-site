import React, { useState } from 'react'
import {
  Download,
  FileText,
  FileJson,
  Layers,
  Image as ImageIcon,
  Check,
  X,
  Compass,
} from 'lucide-react'
import { SelectiveExportOptions, WorldState } from '../engine/types'
import {
  downloadExportFile,
  exportMapLayeredJson,
  exportWorldMarkdown,
  exportWorldYaml,
} from '../engine/exportService'
import { serializeWorld } from '../engine/storageService'
import { exportMapToSvgString } from '../engine/mapEngine'

interface ExportSuiteModalProps {
  isOpen: boolean
  world: WorldState
  onClose: () => void
}

type ExportTab = 'whole-world' | 'selective' | 'map-assets'

export function ExportSuiteModal({ isOpen, world, onClose }: ExportSuiteModalProps) {
  const [activeTab, setActiveTab] = useState<ExportTab>('whole-world')
  const [baseFileName, setBaseFileName] = useState(
    () => `${world.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${new Date().toISOString().split('T')[0]}`
  )

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
        </div>

        {/* Tab 1: Whole World Archive */}
        {activeTab === 'whole-world' && (
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

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl border border-border bg-card space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <ImageIcon className="h-4 w-4" />
                  <span>Vector Map Graphic (SVG)</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  High-resolution vector graphic of your world map with all elevation contours, biomes, rivers, roads, and landmark markers.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadMapSvg}
                className="btn-primary w-full text-xs py-2 flex items-center justify-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Map SVG</span>
              </button>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  <Compass className="h-4 w-4" />
                  <span>Complex Layered Objects (JSON)</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Separate structured arrays for terrain base, elevation relief, hydrology, flora, slots, overlays, and kingdom territory borders.
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
        )}
      </div>
    </div>
  )
}
