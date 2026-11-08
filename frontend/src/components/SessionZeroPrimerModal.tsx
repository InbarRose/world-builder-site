import { useState, useMemo } from 'react'
import {
  FileText,
  X,
  Copy,
  Check,
  Printer,
  Compass,
  Shield,
  Skull,
  Scroll,
  MapPin,
  Sparkles,
} from 'lucide-react'
import { WorldState } from '../engine/types'
import {
  generateSessionZeroPrimer,
  SessionZeroPrimer,
} from '../engine/campaignBridgeEngine'

interface SessionZeroPrimerModalProps {
  isOpen: boolean
  onClose: () => void
  world: WorldState
  onSelectCoord?: (col: number, row: number) => void
}

export function SessionZeroPrimerModal({
  isOpen,
  onClose,
  world,
  onSelectCoord,
}: SessionZeroPrimerModalProps) {
  const [copied, setCopied] = useState(false)

  const primer: SessionZeroPrimer = useMemo(() => {
    return generateSessionZeroPrimer(
      world.name,
      world.map,
      world.entities || [],
      world.drawHistory || []
    )
  }, [world])

  if (!isOpen) return null

  const handleCopyMarkdown = async () => {
    const md: string[] = [
      `# 📜 SESSION ZERO CAMPAIGN PRIMER: ${primer.worldName}`,
      `> *"A living tabletop setting co-created before the campaign began."*\n`,
      `## 🌍 The World at a Glance`,
      `${primer.pitch}\n`,
      `## 🏰 Starting Settlement & Adventuring Hub: ${primer.startingHub.name}`,
      `${primer.startingHub.description}\n`,
      `### Local Tavern Rumors & Street Whispers:`,
      ...primer.startingHub.localRumors.map((r, i) => `${i + 1}. ${r}`),
      `\n## 🗺️ Known Regions & Frontier Environs`,
      ...primer.knownRegions.map(
        (reg) => `- **${reg.name}** (*${reg.terrain}*): ${reg.vibe}`
      ),
      `\n## 👑 Active Factions & Powers in Play`,
      ...primer.factionsInPlay.map(
        (fac) =>
          `- **${fac.name}** [${fac.category} - ${fac.stance}]: ${fac.agenda}`
      ),
      `\n## 🗝️ Known Ruin Sites & Perilous Dungeons`,
      ...primer.dungeonSites.map(
        (dung) =>
          `- **${dung.name}**: ${dung.origin} *(Hazard: ${dung.peril})*`
      ),
    ]

    try {
      await navigator.clipboard.writeText(md.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Session Zero Campaign Primer"
    >
      <div className="card p-6 max-w-4xl w-full max-h-[94vh] overflow-y-auto space-y-6 print:p-0 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                Session Zero Campaign Primer
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  1-Page Player Handout
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Give your players an immediate, immersive orientation to the world they helped forge.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="btn btn-outline text-xs flex items-center gap-1.5"
              title="Copy formatted markdown for Discord, Obsidian, or Notion"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Copied Markdown!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-outline text-xs flex items-center gap-1.5"
              title="Print or save as PDF"
            >
              <Printer className="h-4 w-4" />
              <span>Print Handout</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close Session Zero Primer Dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Parchment-Styled Document Body */}
        <div className="rounded-xl border border-border/80 bg-gradient-to-b from-card to-card/50 p-6 space-y-6 print:border-none print:p-2">
          {/* Document Title Banner */}
          <div className="text-center pb-4 border-b border-border/60">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-2 print:border">
              <Scroll className="h-3.5 w-3.5" />
              <span>Tabletop Campaign Dossier</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground print:text-black">
              {primer.worldName}
            </h2>
            <p className="text-sm italic text-muted-foreground mt-2 max-w-2xl mx-auto leading-relaxed print:text-neutral-700">
              "{primer.pitch}"
            </p>
          </div>

          {/* Section 1: Starting Hub */}
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3 print:border print:bg-neutral-50">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-base font-bold text-foreground flex items-center gap-2 print:text-black">
                <Compass className="h-5 w-5 text-amber-500" />
                <span>Starting Hub: {primer.startingHub.name}</span>
              </h4>
              {primer.startingHub.coord && onSelectCoord && (
                <button
                  type="button"
                  onClick={() => {
                    if (primer.startingHub.coord) {
                      onSelectCoord(primer.startingHub.coord.col, primer.startingHub.coord.row)
                      onClose()
                    }
                  }}
                  className="text-xs text-primary flex items-center gap-1 hover:underline print:hidden"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>View on Canvas ({primer.startingHub.coord.col}, {primer.startingHub.coord.row})</span>
                </button>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed print:text-neutral-800">
              {primer.startingHub.description}
            </p>

            {/* Local Rumors */}
            <div className="pt-2 border-t border-amber-500/20 space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 print:text-neutral-700">
                Tavern Whispers & Starting Rumors:
              </div>
              <ul className="space-y-1 text-xs italic text-foreground/90 pl-3 border-l-2 border-amber-500/40 print:text-neutral-800">
                {primer.startingHub.localRumors.map((rumor, i) => (
                  <li key={i}>{rumor}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 2: Regions & Factions (2-col grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Known Regions */}
            <div className="p-4 rounded-xl border border-border bg-card/40 space-y-2.5 print:border print:bg-neutral-50">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2 print:text-black">
                <Compass className="h-4 w-4 text-emerald-500" />
                <span>Frontier Regions</span>
              </h4>
              <ul className="space-y-2 text-xs">
                {primer.knownRegions.map((reg, idx) => (
                  <li key={idx} className="space-y-0.5">
                    <span className="font-semibold text-foreground print:text-black">
                      {reg.name} ({reg.terrain}):
                    </span>{' '}
                    <span className="text-muted-foreground print:text-neutral-700">
                      {reg.vibe}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Active Factions */}
            <div className="p-4 rounded-xl border border-border bg-card/40 space-y-2.5 print:border print:bg-neutral-50">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2 print:text-black">
                <Shield className="h-4 w-4 text-primary" />
                <span>Active Factions & Powers</span>
              </h4>
              <ul className="space-y-2 text-xs">
                {primer.factionsInPlay.length === 0 ? (
                  <li className="text-muted-foreground italic">
                    Independent frontier settlements with decentralized chieftain councils.
                  </li>
                ) : (
                  primer.factionsInPlay.slice(0, 4).map((fac, idx) => (
                    <li key={idx} className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-foreground print:text-black">{fac.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground print:border">
                          {fac.category}
                        </span>
                        <span className="text-[10px] text-amber-500 print:text-neutral-700 font-mono">
                          [{fac.stance}]
                        </span>
                      </div>
                      <p className="text-muted-foreground print:text-neutral-700">{fac.agenda}</p>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Section 3: Dungeon Sites & Perils */}
          <div className="p-4 rounded-xl border border-border bg-card/40 space-y-2.5 print:border print:bg-neutral-50">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2 print:text-black">
              <Skull className="h-4 w-4 text-destructive" />
              <span>Known Vaults & Dungeon Sites</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {primer.dungeonSites.map((dung, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1 print:border print:bg-white"
                >
                  <div className="font-bold text-foreground print:text-black">{dung.name}</div>
                  <p className="text-muted-foreground print:text-neutral-700 text-[11px] leading-relaxed">
                    {dung.origin}
                  </p>
                  <div className="text-[10px] text-destructive pt-1 flex items-center gap-1 font-medium">
                    <span>Hazard:</span>
                    <span>{dung.peril}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border print:hidden">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Hand this directly to your players at Session Zero to ground character backstories.</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline text-xs px-4 py-1.5"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
