import { useEffect, useState } from 'react'
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  QrCode,
  Share2,
  Sparkles,
  X,
} from 'lucide-react'
import { WorldState } from '../engine/types'
import {
  generateFullStateShareUrl,
  generateQrCodeDataUrl,
  generateSeedShareUrl,
} from '../engine/shareService'

interface ShareTableModalProps {
  isOpen: boolean
  world: WorldState
  onClose: () => void
}

type ShareMode = 'seed' | 'full'

export function ShareTableModal({ isOpen, world, onClose }: ShareTableModalProps) {
  const [shareMode, setShareMode] = useState<ShareMode>('seed')
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [shareUrl, setShareUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [rawSize, setRawSize] = useState<number>(0)
  const [compressedSize, setCompressedSize] = useState<number>(0)

  const [qrError, setQrError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return

    let active = true
    const origin = typeof window !== 'undefined' ? `${window.location.origin}/play` : undefined

    setQrError(null)

    if (shareMode === 'seed') {
      const url = generateSeedShareUrl(world, origin)
      if (active) {
        setShareUrl(url)
        setRawSize(url.length)
        setCompressedSize(url.length)
        generateQrCodeDataUrl(url, 320, false)
          .then((data) => {
            if (active) setQrDataUrl(data)
          })
          .catch(() => {
            if (active) setQrError('Could not generate QR code.')
          })
      }
    } else {
      const rawJson = JSON.stringify(world)
      setRawSize(rawJson.length)
      const url = generateFullStateShareUrl(world, origin)
      if (active) {
        setShareUrl(url)
        setCompressedSize(url.length)
        // Standard QR code limit is ~2300 bytes
        if (url.length > 2300) {
          setQrDataUrl('')
          setQrError(
            'Full session snapshot payload exceeds single QR code capacity (~2.3 KB). Use 1-Click Copy Link or Seed QR to share across tables.'
          )
        } else {
          generateQrCodeDataUrl(url, 320, false)
            .then((data) => {
              if (active) setQrDataUrl(data)
            })
            .catch(() => {
              if (active) {
                setQrDataUrl('')
                setQrError(
                  'Payload exceeds single QR code capacity. Use the share link below.'
                )
              }
            })
        }
      }
    }

    return () => {
      active = false
    }
  }, [isOpen, world, shareMode])

  if (!isOpen) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  const handleDownloadQr = () => {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `${world.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-qr-${shareMode}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const compressionRatio =
    shareMode === 'full' && rawSize > 0
      ? Math.max(0, Math.round((1 - compressedSize / rawSize) * 100))
      : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl p-6 text-card-foreground">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Share with Table</h2>
              <p className="text-xs text-muted-foreground">
                Point any phone or tablet camera to instantly join or mirror this realm
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

        {/* Share Mode Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 mt-4 rounded-xl bg-muted/60 border border-border/40">
          <button
            type="button"
            onClick={() => setShareMode('seed')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              shareMode === 'seed'
                ? 'bg-card text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Seed Link & QR (Fast)</span>
          </button>
          <button
            type="button"
            onClick={() => setShareMode('full')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              shareMode === 'full'
                ? 'bg-card text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Share2 className="h-3.5 w-3.5 text-indigo-500" />
            <span>Full Session State</span>
          </button>
        </div>

        {/* Mode Description */}
        <div className="mt-3 text-xs text-muted-foreground px-1">
          {shareMode === 'seed' ? (
            <p>
              <strong>Lightweight Seed QR:</strong> Generates a clean, compact code (~120 chars) that
              creates this exact realm layout, settings, and player seats on any device.
            </p>
          ) : (
            <div className="space-y-1">
              <p>
                <strong>Complete State Snapshot:</strong> Compresses all painted tiles, historical
                turns, and codex entities into a private client-side URL fragment.
              </p>
              {rawSize > 0 && (
                <div className="text-[11px] font-mono text-primary/80 flex items-center gap-2">
                  <span>
                    Original: {(rawSize / 1024).toFixed(1)} KB → URL:{' '}
                    {(compressedSize / 1024).toFixed(1)} KB
                  </span>
                  {compressionRatio > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                      {compressionRatio}% smaller
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* QR Code Presentation Canvas */}
        <div className="my-5 flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-white dark:bg-slate-900 shadow-inner min-h-[260px]">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR Code for ${world.name}`}
              className="w-56 h-56 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 bg-white p-2"
            />
          ) : qrError ? (
            <div className="w-56 h-56 flex flex-col items-center justify-center text-center p-3 text-xs text-muted-foreground bg-muted/40 rounded-lg border border-dashed border-border/80">
              <Share2 className="h-8 w-8 text-primary/60 mb-2" />
              <p className="font-medium text-foreground">Share via 1-Click Link</p>
              <p className="text-[11px] mt-1 text-muted-foreground leading-relaxed">{qrError}</p>
            </div>
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-xs text-muted-foreground animate-pulse">
              Generating Table QR Code...
            </div>
          )}
          <span className="mt-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {qrDataUrl ? 'Scan with smartphone camera to open' : 'Use the direct share link below'}
          </span>
        </div>

        {/* URL Box & Action Buttons */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              onFocus={(e) => e.target.select()}
              className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-border bg-muted/40 focus:outline-none focus:ring-1 focus:ring-primary truncate"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'btn-primary'
              }`}
            >
              {copied ? (
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

          <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
            <button
              type="button"
              onClick={handleDownloadQr}
              disabled={!qrDataUrl}
              className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 rounded-lg border transition-colors ${
                qrDataUrl
                  ? 'btn-outline'
                  : 'opacity-40 cursor-not-allowed border-border text-muted-foreground'
              }`}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download QR Image (PNG)</span>
            </button>

            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Test Open</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
