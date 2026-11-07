import { useState, useRef } from 'react'
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  FileJson,
  Sparkles,
  Upload,
  X,
  AlertCircle,
  FileCheck2,
} from 'lucide-react'
import { WorldState } from '../engine/types'
import {
  generateSeedShareUrl,
} from '../engine/shareService'
import { parseImportedWorld, saveWorld, serializeWorld } from '../engine/storageService'
import { downloadExportFile } from '../engine/exportService'

interface ShareTableModalProps {
  isOpen: boolean
  world: WorldState
  onClose: () => void
  onImportWorld?: (world: WorldState) => void
}

type TabMode = 'export' | 'import' | 'seed'

export function ShareTableModal({ isOpen, world, onClose, onImportWorld }: ShareTableModalProps) {
  const [tabMode, setTabMode] = useState<TabMode>('export')
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedJson, setCopiedJson] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importedPreview, setImportedPreview] = useState<WorldState | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  if (!isOpen) return null

  const origin = typeof window !== 'undefined' ? `${window.location.origin}/play` : undefined
  const seedShareUrl = generateSeedShareUrl(world, origin)
  const jsonString = serializeWorld(world)
  const fileSizeKb = (new Blob([jsonString]).size / 1024).toFixed(1)

  const handleCopySeedLink = async () => {
    try {
      await navigator.clipboard.writeText(seedShareUrl)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch (err) {
      console.error('Failed to copy seed link', err)
    }
  }

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonString)
      setCopiedJson(true)
      setTimeout(() => setCopiedJson(false), 2000)
    } catch (err) {
      console.error('Failed to copy JSON', err)
    }
  }

  const handleDownloadWorldJson = () => {
    const slug = world.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'world'
    downloadExportFile(`${slug}.world.json`, jsonString, 'application/json')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null)
    setImportedPreview(null)
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const parsed = parseImportedWorld(text)
        if (!parsed.name || !parsed.map) {
          throw new Error('Invalid World State structure.')
        }
        setImportedPreview(parsed)
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse JSON world file.')
      }
    }
    reader.onerror = () => {
      setImportError('Error reading uploaded file.')
    }
    reader.readAsText(file)
  }

  const handleConfirmImport = () => {
    if (!importedPreview) return
    const saved = saveWorld(importedPreview)
    if (onImportWorld) {
      onImportWorld(saved)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl p-6 text-card-foreground">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <FileJson className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Export, Import & Share Realm</h2>
              <p className="text-xs text-muted-foreground">
                Portable JSON files for 100% reliable, zero-server tabletop backup & sharing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Share Modal"
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 gap-1.5 p-1 mt-4 rounded-xl bg-muted/60 border border-border/40">
          <button
            type="button"
            onClick={() => setTabMode('export')}
            className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              tabMode === 'export'
                ? 'bg-card text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Download className="h-3.5 w-3.5 text-primary" />
            <span>Export (.json)</span>
          </button>
          <button
            type="button"
            onClick={() => setTabMode('import')}
            className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              tabMode === 'import'
                ? 'bg-card text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Upload className="h-3.5 w-3.5 text-emerald-500" />
            <span>Import (.json)</span>
          </button>
          <button
            type="button"
            onClick={() => setTabMode('seed')}
            className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              tabMode === 'seed'
                ? 'bg-card text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Seed Link</span>
          </button>
        </div>

        {/* Tab 1: Export (.world.json) */}
        {tabMode === 'export' && (
          <div className="my-5 space-y-4">
            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <FileCheck2 className="h-4 w-4 text-primary" />
                    <span>{world.name}.world.json</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Stage: <span className="capitalize text-foreground font-medium">{world.currentStage}</span> • Moves: <span className="text-foreground font-medium">{world.drawHistory.length}</span> • Entities: <span className="text-foreground font-medium">{world.entities.length}</span>
                  </p>
                </div>
                <span className="text-xs font-mono px-2 py-1 rounded bg-muted text-muted-foreground border border-border">
                  {fileSizeKb} KB
                </span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Contains the complete realm history, map tiles, species, factions, and cards. You can store this file on your drive or send it to another player to load on their machine.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadWorldJson}
                className="flex-1 btn-primary py-2.5 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
              >
                <Download className="h-4 w-4" />
                <span>Download World File (.json)</span>
              </button>
              <button
                type="button"
                onClick={handleCopyJson}
                className="px-3.5 py-2.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors flex items-center gap-1.5"
                title="Copy raw JSON payload to clipboard"
              >
                {copiedJson ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                <span>{copiedJson ? 'Copied JSON' : 'Copy JSON'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Import (.world.json) */}
        {tabMode === 'import' && (
          <div className="my-5 space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded-xl border-2 border-dashed border-border/80 hover:border-primary/60 bg-muted/20 hover:bg-muted/40 cursor-pointer flex flex-col items-center justify-center text-center transition-all"
            >
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-semibold text-foreground">Click to Select .world.json File</p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports all world builder JSON exports and legacy schema versions
              </p>
            </div>

            {importError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {importedPreview && (
              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Ready to Load Realm: {importedPreview.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground capitalize">
                    {importedPreview.currentStage} Era
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  History: {importedPreview.drawHistory.length} turns • Tiles: {Object.keys(importedPreview.map.tiles).length} • Entities: {importedPreview.entities.length}
                </p>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="w-full mt-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Load & Play Imported Realm</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Lightweight Seed Link */}
        {tabMode === 'seed' && (
          <div className="my-5 space-y-4">
            <div className="p-3.5 rounded-xl border border-border bg-muted/30 text-xs space-y-1.5 text-muted-foreground">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Lightweight Seed Link (&lt;120 chars)</span>
              </p>
              <p>
                Copies a compact URL containing this world&apos;s name, generation seed, terrain preset, and council settings. Ideal for texting friends to start an identical world setup.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={seedShareUrl}
                onFocus={(e) => e.target.select()}
                className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-border bg-muted/40 focus:outline-none focus:ring-1 focus:ring-primary truncate"
              />
              <button
                type="button"
                onClick={handleCopySeedLink}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  copiedLink
                    ? 'bg-emerald-600 text-white'
                    : 'btn-primary'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-3 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
          <span>All data remains strictly on your local device.</span>
          <a
            href={seedShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            <span>Test URL</span>
          </a>
        </div>
      </div>
    </div>
  )
}
