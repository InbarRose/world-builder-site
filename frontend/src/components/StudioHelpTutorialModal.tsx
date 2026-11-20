import React, { useState } from 'react'
import {
  HelpCircle,
  X,
  BookOpen,
  Layers,
  Sparkles,
  Keyboard,
  MousePointer,
  Paintbrush,
  Compass,
  Lightbulb,
} from 'lucide-react'

export type TutorialTabId = 'game' | 'editor' | 'turns' | 'shortcuts'

interface StudioHelpTutorialModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: TutorialTabId
  showHoverHints?: boolean
  onToggleHoverHints?: (enabled: boolean) => void
}

export function StudioHelpTutorialModal({
  isOpen,
  onClose,
  initialTab = 'game',
  showHoverHints = true,
  onToggleHoverHints,
}: StudioHelpTutorialModalProps) {
  const [activeTab, setActiveTab] = useState<TutorialTabId>(initialTab)

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="Studio Help, Hints & World Building Tutorial"
      data-testid="studio-help-tutorial-modal"
    >
      <div className="bg-card text-card-foreground border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Top Photoshop / WC3 Editor Style Title Bar */}
        <div className="px-5 py-3.5 bg-muted/60 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">
                World Building Studio — Manual, Editor Panels & Tutorial
              </h2>
              <p className="text-xs text-muted-foreground">
                Collaborative Fantasy World Creation · Card Rules, 5-Layer Map Editor & Shortcuts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onToggleHoverHints && (
              <button
                type="button"
                data-testid="modal-toggle-hover-hints-btn"
                onClick={() => onToggleHoverHints(!showHoverHints)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  showHoverHints
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-300'
                    : 'bg-background border-border text-muted-foreground'
                }`}
                title="Toggle live contextual hover hints in the bottom status bar"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                <span>Hover Hints: {showHoverHints ? 'ON' : 'OFF'}</span>
              </button>
            )}
            <button
              type="button"
              data-testid="close-studio-tutorial-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Close Studio Tutorial"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-2.5 bg-muted/30 border-b border-border flex flex-wrap gap-1.5">
          <button
            type="button"
            data-testid="tutorial-tab-game"
            onClick={() => setActiveTab('game')}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'game'
                ? 'border-primary text-primary bg-background shadow-2xs'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>1. The World Building Game (4 Stages)</span>
          </button>
          <button
            type="button"
            data-testid="tutorial-tab-editor"
            onClick={() => setActiveTab('editor')}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'editor'
                ? 'border-primary text-primary bg-background shadow-2xs'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>2. Map Editor & 5-Layer Dock</span>
          </button>
          <button
            type="button"
            data-testid="tutorial-tab-turns"
            onClick={() => setActiveTab('turns')}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'turns'
                ? 'border-primary text-primary bg-background shadow-2xs'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>3. Card Turns, Presets & Custom Events</span>
          </button>
          <button
            type="button"
            data-testid="tutorial-tab-shortcuts"
            onClick={() => setActiveTab('shortcuts')}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'shortcuts'
                ? 'border-primary text-primary bg-background shadow-2xs'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Keyboard className="h-3.5 w-3.5" />
            <span>4. Hotkeys & Editor Tips</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs leading-relaxed flex-1">
          {activeTab === 'game' && (
            <div className="space-y-4" data-testid="tutorial-content-game">
              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5">
                <h3 className="text-sm font-bold text-primary flex items-center gap-1.5">
                  <Compass className="h-4 w-4" />
                  <span>Creating Awesome Worlds Together — The Spirit of the Game</span>
                </h3>
                <p className="text-muted-foreground">
                  Unlike computer strategy games, <strong>there is no winner or loser in World Building</strong>.
                  You and your friends take turns drawing playing cards to shape a fantasy world together—from
                  its primeval mountains, forests, and rivers up to its sentient species, civilizations, cultures,
                  myths, and conflicts. Everything created by one player belongs to the whole table, leaving you
                  with a living world map and rich history ready for your role-playing games or stories.
                </p>
              </div>

              {/* 3 Table Roles & Card Meanings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2">
                  <h4 className="font-bold text-foreground">🎭 The Three Table Roles (Shared or Assigned)</h4>
                  <ul className="space-y-1.5 text-muted-foreground">
                    <li>
                      <strong className="text-foreground">🎨 The Artist (Map Canvas):</strong> Draws and shapes
                      the coastline, mountains, forests, settlements, and landmarks on the map.
                    </li>
                    <li>
                      <strong className="text-foreground">📜 The Historian (Timeline Chronicle):</strong> Records
                      each card action and story event in the chronological timeline across the Four Ages.
                    </li>
                    <li>
                      <strong className="text-foreground">📚 The Keeper (Codex Registry):</strong> Tracks the
                      world&apos;s Species, Civilizations/Societies, Traditions, Relationships, and Myths.
                    </li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2">
                  <h4 className="font-bold text-foreground">🃏 How the Draw Deck Works</h4>
                  <ul className="space-y-1.5 text-muted-foreground">
                    <li>
                      <strong className="text-foreground">Number Cards (2–10):</strong> Perform the standard
                      Power matching the card&apos;s suit (♠ ♥ ♣ ♦) in the current Stage.
                    </li>
                    <li>
                      <strong className="text-foreground">Face Cards (J, Q, K):</strong> Perform a{' '}
                      <em>Fantastical</em> (or enhanced) version of that suit&apos;s Power.
                    </li>
                    <li>
                      <strong className="text-foreground">Aces (Natural Disasters):</strong> Trigger a catastrophe
                      in any age—volcanic eruption, earthquake, flood, meteor, plague, or cataclysm!
                    </li>
                    <li>
                      <strong className="text-foreground">Jokers (Wild Fantastical):</strong> Perform a Fantastical
                      version of <em>any</em> power in the current stage.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Canonical 4x4 Reference Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-foreground">
                  📋 Official 4-Stage × 4-Suit Powers Reference Table
                </h4>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-muted/70 border-b border-border">
                        <th className="p-2.5 font-bold">Suit</th>
                        <th className="p-2.5 font-bold">1. Genesis (Pre-History)</th>
                        <th className="p-2.5 font-bold">2. Primal (Earliest Dawn)</th>
                        <th className="p-2.5 font-bold">3. Civilization (Recorded History)</th>
                        <th className="p-2.5 font-bold">4. Intrigue (Recent Decades)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/70">
                      <tr>
                        <td className="p-2.5 font-bold">♠ Spades</td>
                        <td className="p-2.5"><strong>Earth</strong> (Mountains, hills, canyons, caves)</td>
                        <td className="p-2.5"><strong>Settlement</strong> (Camps, villages, early towns)</td>
                        <td className="p-2.5"><strong>Construction</strong> (Cities, castles, roads, wonders)</td>
                        <td className="p-2.5"><strong>Conflict</strong> (Wars, battles, sieges, raids)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-rose-600 dark:text-rose-400">♥ Hearts</td>
                        <td className="p-2.5"><strong>Water</strong> (Rivers, lakes, swamps, glaciers)</td>
                        <td className="p-2.5"><strong>Tradition</strong> (Rites, culture, beliefs, customs)</td>
                        <td className="p-2.5"><strong>Enlightenment</strong> (Arts, science, government, faith)</td>
                        <td className="p-2.5"><strong>Cooperation</strong> (Alliances, joint quests, aid)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-emerald-700 dark:text-emerald-400">♣ Clubs</td>
                        <td className="p-2.5"><strong>Plant</strong> (Forests, jungles, marshes, groves)</td>
                        <td className="p-2.5"><strong>Resource</strong> (Crops, herds, iron, timber, herbs)</td>
                        <td className="p-2.5"><strong>Expansion</strong> (Borders, colonies, conquest, kingdoms)</td>
                        <td className="p-2.5"><strong>Scheme</strong> (Plots, spies, coups, secret pacts)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-amber-600 dark:text-amber-400">♦ Diamonds</td>
                        <td className="p-2.5"><strong>Feature</strong> (Geysers, craters, monoliths, anomalies)</td>
                        <td className="p-2.5"><strong>Skill</strong> (Mastery of sailing, smithing, hunting)</td>
                        <td className="p-2.5"><strong>Diplomacy</strong> (Trade pacts, treaties, royal marriage)</td>
                        <td className="p-2.5"><strong>Myth</strong> (Dragons, lost relics, liches, prophecies)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'editor' && (
            <div className="space-y-4" data-testid="tutorial-content-editor">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <MousePointer className="h-4 w-4" />
                  <span>Warcraft 3 / Photoshop-Style Map Studio & Safe Selection</span>
                </h3>
                <p className="text-muted-foreground">
                  The Map Studio separates <strong>Selecting/Inspecting a Tile</strong> from{' '}
                  <strong>Painting across Tiles</strong> so you never make accidental changes while navigating.
                  Click any tile in <strong>Select &amp; Inspect [S]</strong> mode to directly edit its 5 layers
                  in the docked right-hand Inspector Panel.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5">
                    <Paintbrush className="h-3.5 w-3.5 text-primary" />
                    <span>Tools &amp; Domain Switching</span>
                  </h4>
                  <ul className="space-y-1.5 text-muted-foreground">
                    <li>
                      <strong className="text-foreground">👆 Select &amp; Inspect [S]:</strong> Default safe tool.
                      Click any tile to focus it in the right sidebar and edit its layers in-place.
                    </li>
                    <li>
                      <strong className="text-foreground">🌱 Land / 🌊 Water Switcher:</strong> 1-click toggle at
                      the top of the Tile Inspector that switches a tile between Land (Grassland) and Water (Sea)
                      while clearing leftover clutter.
                    </li>
                    <li>
                      <strong className="text-foreground">Clean Single-Change Clicks:</strong> Clicking a base
                      biome like <em>Grasslands</em> cleanly resets leftover trees, mountains, or symbols so icons
                      stay calm and uncluttered.
                    </li>
                    <li>
                      <strong className="text-foreground">🖌️ Paint Brush [B] &amp; 🪣 Fill:</strong> Arm a brush
                      to paint multiple tiles. Press <code>S</code> or <code>Esc</code> anytime to return to Safe
                      Select, or hold <code>Alt + Click</code> to sample/inspect a tile.
                    </li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    <span>The 5 Docked Cartography Layers (Right Panel)</span>
                  </h4>
                  <ul className="space-y-1.5 text-muted-foreground">
                    <li>
                      <strong className="text-foreground">🌍 1. Base &amp; Regions:</strong> Land/Water domain,
                      base biome, rivers, roads, and <strong>Contiguous Geographic Regions</strong> (name an entire
                      mountain range, forest, or inland sea in 1 click!).
                    </li>
                    <li>
                      <strong className="text-foreground">🏔️ 2. Relief &amp; Canopy:</strong> Permanent elevation
                      (Mountains, Hills, Canyons, Volcanoes), forests/jungles, and optional whiteboard symbols.
                    </li>
                    <li>
                      <strong className="text-foreground">🌾 3. Resources &amp; Wonders:</strong> Natural features,
                      crops, mines, mana springs, dragon bones, and custom features.
                    </li>
                    <li>
                      <strong className="text-foreground">🏰 4. Settlements &amp; Ruins:</strong> Camps, villages,
                      towns, cities, citadels—plus 1-click <strong>Upgrade</strong>, <strong>Collapse to Ruins</strong>,
                      or <strong>Rebuild</strong>.
                    </li>
                    <li>
                      <strong className="text-foreground">📜 5. Realm &amp; Story Notes:</strong> Assign a tile to
                      a Species/Society, write <strong>Location Story &amp; Lore Notes</strong>, add tags, and view
                      every card played on that tile.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'turns' && (
            <div className="space-y-4" data-testid="tutorial-content-turns">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  🃏 Seamless Turn Flow: Draw Card → Pick Preset or Custom → Stamp on Map
                </h3>
                <p className="text-muted-foreground">
                  Whether you use curated fantasy presets or invent custom ideas on the fly, the Studio Turn
                  Workbench lets you place features on the map and record history in one smooth flow.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1.5">
                  <div className="font-bold text-foreground">Step 1: Draw a Card</div>
                  <p className="text-muted-foreground">
                    Click <strong>Draw Card</strong> in the Turn Bar. The card&apos;s suit (♠ ♥ ♣ ♦) and rank
                    unlock the active Power for the current Stage (or a Natural Disaster on an Ace).
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1.5">
                  <div className="font-bold text-foreground">Step 2: Preset or Custom</div>
                  <p className="text-muted-foreground">
                    Click any <strong>Preset</strong> to populate the Workbench (you can still edit its name,
                    icon, terrain, or prose!), or click <strong>✍️ Custom Event</strong> for fast freeform
                    creation.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1.5">
                  <div className="font-bold text-foreground">Step 3: Stamp on Map</div>
                  <p className="text-muted-foreground">
                    Click any tile on the Map (or click <strong>📍 Stamp Active Turn Here</strong> in the Tile
                    Inspector). The tile updates immediately and links to your Timeline Chronicle record!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-4" data-testid="tutorial-content-shortcuts">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2">
                  <h4 className="font-bold text-foreground">⌨️ Map Studio Keyboard Shortcuts</h4>
                  <div className="space-y-1.5 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Safe Select &amp; Inspect Mode</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[11px]">
                        S / V / Esc
                      </kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Arm Paint Brush Tool</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[11px]">
                        B
                      </kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Safe Inspect While Brush Armed</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[11px]">
                        Alt + Click
                      </kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Pan Map Camera</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[11px]">
                        Space + Drag
                      </kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Undo / Redo Map Action</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[11px]">
                        Ctrl+Z / Ctrl+Y
                      </kbd>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2">
                  <h4 className="font-bold text-foreground">💡 Contextual Hints &amp; Help Buttons</h4>
                  <p className="text-muted-foreground">
                    Look at the <strong>Bottom Studio Status Bar</strong> while hovering over any tool, layer tab,
                    domain button, or map tile to see live explanations. You can also click the{' '}
                    <strong>?</strong> button on any layer panel in the right sidebar to toggle inline tips.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-muted/50 border-t border-border flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            Tip: Click any <strong>?</strong> button on the Studio panels or press <strong>?</strong> for quick help.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="btn-primary px-4 py-1.5 text-xs font-bold"
          >
            Got It — Return to Studio
          </button>
        </div>
      </div>
    </div>
  )
}
