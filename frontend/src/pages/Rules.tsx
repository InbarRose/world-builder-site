import React, { useState, useEffect, useMemo } from 'react'
import {
  BookOpen,
  Menu,
  X,
  Printer,
  FileSpreadsheet,
  Book,
  Search,
  ChevronRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'

interface NavItem {
  id: string
  title: string
  level: number
  children?: NavItem[]
}

const NAVIGATION: NavItem[] = [
  { id: 'introduction', title: 'Introduction', level: 1 },
  { id: 'guide-to-world-building', title: 'Guide to World Building', level: 1 },
  {
    id: 'preparation-and-requirements',
    title: 'Preparation and Requirements',
    level: 1,
    children: [
      { id: 'what-you-will-need', title: 'What you will need', level: 2 },
      { id: 'how-long-it-will-take', title: 'How long it will take', level: 2 },
    ],
  },
  {
    id: 'system',
    title: 'System',
    level: 1,
    children: [
      { id: 'setup', title: 'Setup', level: 2 },
      { id: 'playing-a-stage', title: 'Playing a Stage', level: 2 },
      { id: 'powers', title: 'Powers', level: 2 },
      { id: 'cards', title: 'Cards', level: 2 },
    ],
  },
  {
    id: 'stages-and-powers',
    title: 'Stages and Powers',
    level: 1,
    children: [
      { id: 'timeline-and-history', title: 'Timeline and History', level: 2 },
      { id: 'natural-disasters', title: 'Natural Disasters', level: 2 },
      {
        id: '1.-genesis',
        title: '1. Genesis',
        level: 2,
        children: [
          { id: '(♠)---earth', title: '(♠) - Earth', level: 3 },
          { id: '(♥)---water', title: '(♥) - Water', level: 3 },
          { id: '(♣)---plant', title: '(♣) - Plant', level: 3 },
          { id: '(♦)---feature', title: '(♦) - Feature', level: 3 },
        ],
      },
      {
        id: '2.-primal',
        title: '2. Primal',
        level: 2,
        children: [
          { id: '(♠)---settlement', title: '(♠) - Settlement', level: 3 },
          { id: '(♥)---tradition', title: '(♥) - Tradition', level: 3 },
          { id: '(♣)---resource', title: '(♣) - Resource', level: 3 },
          { id: '(♦)---skill', title: '(♦) - Skill', level: 3 },
        ],
      },
      {
        id: '3.-civilization',
        title: '3. Civilization',
        level: 2,
        children: [
          { id: '(♠)---construction', title: '(♠) - Construction', level: 3 },
          { id: '(♥)---enlightenment', title: '(♥) - Enlightenment', level: 3 },
          { id: '(♣)---expansion', title: '(♣) - Expansion', level: 3 },
          { id: '(♦)---diplomacy', title: '(♦) - Diplomacy', level: 3 },
        ],
      },
      {
        id: '4.-intrigue',
        title: '4. Intrigue',
        level: 2,
        children: [
          { id: '(♠)---conflict', title: '(♠) - Conflict', level: 3 },
          { id: '(♥)---cooperation', title: '(♥) - Cooperation', level: 3 },
          { id: '(♣)---scheme', title: '(♣) - Scheme', level: 3 },
          { id: '(♦)---myth', title: '(♦) - Myth', level: 3 },
        ],
      },
    ],
  },
  { id: 'glossary-of-terms', title: 'Glossary of Terms', level: 1 },
  { id: 'reference-table', title: 'Reference Table', level: 1 },
  { id: 'acknowledgements', title: 'Acknowledgements', level: 1 },
]

interface SearchableEntry {
  id: string
  title: string
  category: string
  snippet: string
}

const SEARCH_INDEX: SearchableEntry[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    category: 'Overview',
    snippet: 'Collaborative fantasy world-building game using cards to shape terrain, civilizations, and history.',
  },
  {
    id: 'setup',
    title: 'Setup & Collaborative Roles',
    category: 'System',
    snippet: 'Assign Artist (map), Historian (timeline), and Keeper (codex) roles and draw a starting coastline.',
  },
  {
    id: 'powers',
    title: 'Powers & Fantastical Face Cards',
    category: 'System',
    snippet: 'Cards 2–10 trigger normal suit powers; Jack, Queen, King, and Jokers trigger Fantastical powers.',
  },
  {
    id: 'natural-disasters',
    title: 'Natural Disasters (Aces)',
    category: 'System',
    snippet: 'Triggered whenever an Ace is drawn: volcanic eruptions, earthquakes, tsunamis, meteors, plagues.',
  },
  {
    id: '1.-genesis',
    title: '1. Genesis Stage',
    category: 'Stage 1',
    snippet: 'Pre-history 10,000+ years ago. Earth (♠), Water (♥), Plant (♣), and Feature (♦) shape the landscape.',
  },
  {
    id: '(♠)---earth',
    title: '(♠) Earth — Genesis',
    category: 'Stage 1 Power',
    snippet: 'Mountains, hills, canyons, deserts, cliffs, caves, islands, and craters.',
  },
  {
    id: '(♥)---water',
    title: '(♥) Water — Genesis',
    category: 'Stage 1 Power',
    snippet: 'Rivers, lakes, swamps, waterfalls, tidal pools, maelstroms, and glaciers.',
  },
  {
    id: '(♣)---plant',
    title: '(♣) Plant — Genesis',
    category: 'Stage 1 Power',
    snippet: 'Forests, jungles, grasslands, rainforests, marshes, and ancient groves.',
  },
  {
    id: '(♦)---feature',
    title: '(♦) Feature — Genesis',
    category: 'Stage 1 Power',
    snippet: 'Geysers, craters, strong winds, currents, salt flats, landmarks, lava flows, natural wonders.',
  },
  {
    id: '2.-primal',
    title: '2. Primal Stage',
    category: 'Stage 2',
    snippet: 'Origin of sentient species. Settlement (♠), Tradition (♥), Resource (♣), and Skill (♦).',
  },
  {
    id: '(♠)---settlement',
    title: '(♠) Settlement — Primal',
    category: 'Stage 2 Power',
    snippet: 'Enhance a species with villages, camps, towns, small cities, and nomadic routes.',
  },
  {
    id: '(♥)---tradition',
    title: '(♥) Tradition — Primal',
    category: 'Stage 2 Power',
    snippet: 'Religious, cultural, militaristic, agricultural customs, festivals, and rites of passage.',
  },
  {
    id: '(♣)---resource',
    title: '(♣) Resource — Primal',
    category: 'Stage 2 Power',
    snippet: 'Domesticated crops, beasts, wood, stone, iron, quarries, and magical reagents.',
  },
  {
    id: '(♦)---skill',
    title: '(♦) Skill — Primal',
    category: 'Stage 2 Power',
    snippet: 'Mastery in hunting, sailing, smithing, magic, craftsmanship, or astronomy.',
  },
  {
    id: '3.-civilization',
    title: '3. Civilization Stage',
    category: 'Stage 3',
    snippet: 'Societies, kingdoms, and empires. Construction (♠), Enlightenment (♥), Expansion (♣), Diplomacy (♦).',
  },
  {
    id: '(♠)---construction',
    title: '(♠) Construction — Civilization',
    category: 'Stage 3 Power',
    snippet: 'Major cities, roads, bridges, castles, universities, temples, and terraforming.',
  },
  {
    id: '(♥)---enlightenment',
    title: '(♥) Enlightenment — Civilization',
    category: 'Stage 3 Power',
    snippet: 'Science, governments (republic, feudalism), philosophy, arts, monuments, and dogmas.',
  },
  {
    id: '(♣)---expansion',
    title: '(♣) Expansion — Civilization',
    category: 'Stage 3 Power',
    snippet: 'Expand borders through conquest, exploration, colonies, forming kingdoms and empires.',
  },
  {
    id: '(♦)---diplomacy',
    title: '(♦) Diplomacy — Civilization',
    category: 'Stage 3 Power',
    snippet: 'Alliances, trade routes, royal marriages, brokering peace, and negotiating borders.',
  },
  {
    id: '4.-intrigue',
    title: '4. Intrigue Stage',
    category: 'Stage 4',
    snippet: 'Recent decades & modern plots. Conflict (♠), Cooperation (♥), Scheme (♣), and Myth (♦).',
  },
  {
    id: '(♠)---conflict',
    title: '(♠) Conflict — Intrigue',
    category: 'Stage 4 Power',
    snippet: 'Wars, battles, rebellions, sieges, purges, and ruined cities.',
  },
  {
    id: '(♥)---cooperation',
    title: '(♥) Cooperation — Intrigue',
    category: 'Stage 4 Power',
    snippet: 'Coalitions, shared defense, guilds, peace summits, and joint quests.',
  },
  {
    id: '(♣)---scheme',
    title: '(♣) Scheme — Intrigue',
    category: 'Stage 4 Power',
    snippet: 'Espionage, spies, assassinations, black markets, secret cabals, and coups.',
  },
  {
    id: '(♦)---myth',
    title: '(♦) Myth — Intrigue',
    category: 'Stage 4 Power',
    snippet: 'Dragons, lost artifacts, lich lairs, prophecies, curses, and plot hooks.',
  },
  {
    id: 'glossary-of-terms',
    title: 'Glossary of Terms',
    category: 'Reference',
    snippet: 'Definitions for Draw Deck, Stage, Power, Fantastical Power, Natural Disaster, Joker, and Roles.',
  },
  {
    id: 'reference-table',
    title: '4×4 Stage & Suit Reference Table',
    category: 'Reference',
    snippet: 'Complete matrix comparing Spades, Hearts, Clubs, and Diamonds across all 4 stages.',
  },
]

export type RulesCategoryFilter =
  | 'all'
  | 'system'
  | 'genesis'
  | 'primal'
  | 'civilization'
  | 'intrigue'
  | 'glossary'

export function Rules() {
  const [activeSection, setActiveSection] = useState('introduction')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [desktopTocCollapsed, setDesktopTocCollapsed] = useState(false)
  const [viewMode, setViewMode] = useState<'full' | 'quick-card'>('full')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<RulesCategoryFilter>('all')

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (hash) {
        setActiveSection(hash)
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const scrollToSection = (id: string) => {
    setActiveSection(id)
    setSidebarOpen(false)
    setCategoryFilter('all')
    window.location.hash = id
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 30)
  }

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    return SEARCH_INDEX.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.snippet.toLowerCase().includes(q)
    )
  }, [searchQuery])

  const renderNavItem = (item: NavItem) => (
    <div key={item.id}>
      <button
        onClick={() => scrollToSection(item.id)}
        className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors text-xs sm:text-sm ${
          activeSection === item.id
            ? 'bg-primary text-primary-foreground font-semibold'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        }`}
        style={{ paddingLeft: `${(item.level - 1) * 0.85 + 0.75}rem` }}
      >
        {item.title}
      </button>
      {item.children && (
        <div className="ml-2 mt-0.5 space-y-0.5">
          {item.children.map(renderNavItem)}
        </div>
      )}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Top Control & Search Bar (Hidden when printing) */}
      <div className="no-print card p-3.5 sm:p-4 space-y-3 border-border/80 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: View Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border" role="tablist" aria-label="Rules View Mode">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'full'}
              onClick={() => setViewMode('full')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                viewMode === 'full'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Book className="h-4 w-4" />
              <span>Full Rules Book</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'quick-card'}
              onClick={() => setViewMode('quick-card')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                viewMode === 'quick-card'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>1-Page Quick Reference Card</span>
            </button>
          </div>

          {/* Center: Instant Search Input */}
          {viewMode === 'full' && (
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rules, stages, suits (♠ ♥ ♣ ♦), or glossary..."
                aria-label="Search Rules"
                className="input h-9 pl-9 pr-8 text-xs w-full"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Right: TOC Toggle & Print Action */}
          <div className="flex items-center gap-2">
            {viewMode === 'full' && (
              <button
                type="button"
                onClick={() => setDesktopTocCollapsed((c) => !c)}
                className="hidden lg:inline-flex btn-outline px-2.5 py-1.5 text-xs items-center gap-1.5"
                title={desktopTocCollapsed ? 'Show Table of Contents' : 'Collapse Table of Contents'}
              >
                {desktopTocCollapsed ? (
                  <>
                    <PanelLeftOpen className="h-3.5 w-3.5" />
                    <span>Show Contents</span>
                  </>
                ) : (
                  <>
                    <PanelLeftClose className="h-3.5 w-3.5" />
                    <span>Hide Contents</span>
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-outline px-3.5 py-1.5 text-xs sm:text-sm flex items-center gap-2 font-medium"
              title="Print or Save as PDF for offline tabletop play"
            >
              <Printer className="h-4 w-4 text-primary" />
              <span>
                {viewMode === 'quick-card'
                  ? 'Print Quick Reference Card'
                  : 'Print Full Rules'}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Filter Pills (Stage & Section Jumpers) */}
        {viewMode === 'full' && (
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60 overflow-x-auto">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground font-semibold mr-1 shrink-0">
                Focus Filter:
              </span>
              {(
                [
                  { id: 'all', label: 'All Sections' },
                  { id: 'system', label: 'Core System & Roles' },
                  { id: 'genesis', label: '1. Genesis' },
                  { id: 'primal', label: '2. Primal' },
                  { id: 'civilization', label: '3. Civilization' },
                  { id: 'intrigue', label: '4. Intrigue' },
                  { id: 'glossary', label: 'Glossary & Matrix' },
                ] as const
              ).map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setCategoryFilter(pill.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    categoryFilter === pill.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Instant Search Results Dropdown Panel */}
        {viewMode === 'full' && searchQuery.trim() !== '' && (
          <div className="p-3 rounded-xl border border-primary/30 bg-muted/30 space-y-2 max-h-72 overflow-y-auto">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-primary">
                Search Results ({searchResults.length})
              </span>
              <span className="text-muted-foreground">
                Click any result to jump directly to that rule
              </span>
            </div>
            {searchResults.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">
                No rules or powers matched "{searchQuery}".
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {searchResults.map((res) => (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => {
                      scrollToSection(res.id)
                      setSearchQuery('')
                    }}
                    className="p-2.5 rounded-lg border border-border bg-card hover:border-primary/50 text-left space-y-1 transition-all flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          {res.category}
                        </span>
                        <span className="text-xs font-bold">{res.title}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                        {res.snippet}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {viewMode === 'quick-card' ? (
        <QuickReferenceCard />
      ) : (
        <div className="flex gap-6 lg:gap-8 relative">
          {/* Mobile Slide-Over Backdrop */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar Navigation (Collapsible on Desktop & Slide-Over on Mobile) */}
          {!desktopTocCollapsed && (
            <aside
              className={`no-print ${
                sidebarOpen
                  ? 'fixed inset-y-0 left-0 z-50 w-72 shadow-2xl rounded-none'
                  : 'hidden'
              } lg:block lg:sticky lg:top-16 h-fit lg:w-64 flex-shrink-0 bg-card border lg:rounded-xl p-4`}
              style={{ maxHeight: sidebarOpen ? '100vh' : 'calc(100vh - 5rem)' }}
            >
              <div className="flex items-center justify-between mb-3 lg:hidden border-b border-border pb-2">
                <h2 className="font-bold text-sm">Rules Table of Contents</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 hover:bg-accent rounded"
                  aria-label="Close Contents"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav
                className="space-y-0.5 overflow-y-auto"
                style={{ maxHeight: sidebarOpen ? 'calc(100vh - 5rem)' : 'calc(100vh - 8rem)' }}
              >
                {NAVIGATION.map(renderNavItem)}
              </nav>
            </aside>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Sticky Contents & Quick Stage Jump Bar */}
            <div className="no-print lg:hidden sticky top-12 z-20 mb-4 bg-card/95 backdrop-blur border border-border rounded-lg p-2 flex items-center justify-between gap-2 shadow-sm">
              <button
                onClick={() => setSidebarOpen(true)}
                className="btn-outline flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold shrink-0"
              >
                <Menu className="h-4 w-4" />
                <span>Contents</span>
              </button>
              <div className="flex items-center gap-1 overflow-x-auto text-xs">
                {[
                  { id: '1.-genesis', label: '1. Genesis' },
                  { id: '2.-primal', label: '2. Primal' },
                  { id: '3.-civilization', label: '3. Civ' },
                  { id: '4.-intrigue', label: '4. Intrigue' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => scrollToSection(st.id)}
                    className="px-2 py-1 rounded bg-muted hover:bg-accent whitespace-nowrap font-medium"
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-4 sm:p-8 space-y-6 sm:space-y-8">
              <div className="text-center space-y-2 border-b border-border/60 pb-6">
                <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto no-print" />
                <h1 className="text-2xl sm:text-4xl font-bold">World Building</h1>
                <p className="text-base sm:text-xl text-muted-foreground">
                  Game Rules & Reference Wiki
                </p>
              </div>

              <RulesContent categoryFilter={categoryFilter} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function QuickReferenceCard() {
  const [mobileStageTab, setMobileStageTab] = useState<'all' | 1 | 2 | 3 | 4>('all')

  const mobileStageCards = [
    {
      num: 1 as const,
      title: '1. Genesis (10,000+ Yrs Ago)',
      pre: 'Pre-Stage: Draw basic coastlines',
      suits: [
        { suit: '♠', name: 'Earth', desc: 'Mountains, canyons, islands, hills, valleys, cliffs, caves, craters.' },
        { suit: '♥', name: 'Water', desc: 'Rivers, lakes, seas, swamps, waterfalls, glaciers, bays, maelstroms.' },
        { suit: '♣', name: 'Plant', desc: 'Forests, jungles, grasslands, reefs, marshes, giant flora, groves.' },
        { suit: '♦', name: 'Feature', desc: 'Volcanoes, geysers, crystal caverns, monoliths, anomalies, ley lines.' },
      ],
    },
    {
      num: 2 as const,
      title: '2. Primal (Thousands of Yrs Ago)',
      pre: 'Pre-Stage: Each player creates a Species',
      suits: [
        { suit: '♠', name: 'Settlement', desc: 'Villages, camps, towns, small cities, nomadic routes, migrations.' },
        { suit: '♥', name: 'Tradition', desc: 'Beliefs, customs, taboos, festivals, rites of passage, social codes.' },
        { suit: '♣', name: 'Resource', desc: 'Metals, crops, livestock, timber, quarries, magical reagents.' },
        { suit: '♦', name: 'Skill', desc: 'Crafts, magic, metallurgy, navigation, taming, astronomy, runes.' },
      ],
    },
    {
      num: 3 as const,
      title: '3. Civilization (Hundreds of Yrs Ago)',
      pre: 'Pre-Stage: Create Societies & Kingdoms',
      suits: [
        { suit: '♠', name: 'Construction', desc: 'Major cities, castles, roads, bridges, temples, universities, wonders.' },
        { suit: '♥', name: 'Enlightenment', desc: 'Laws, governments, philosophies, academies, arts, science, dogmas.' },
        { suit: '♣', name: 'Expansion', desc: 'Colonies, conquests, trade routes, territorial borders, outposts.' },
        { suit: '♦', name: 'Diplomacy', desc: 'Alliances, treaties, royal marriages, trade leagues, vassals, feuds.' },
      ],
    },
    {
      num: 4 as const,
      title: '4. Intrigue (Recent Decades)',
      pre: 'Pre-Stage: Name Cities, Nations & Armies',
      suits: [
        { suit: '♠', name: 'Conflict', desc: 'Wars, battles, rebellions, sieges, rivalries, purges, ruined cities.' },
        { suit: '♥', name: 'Cooperation', desc: 'Guilds, peace summits, shared projects, coalitions, cultural fusion.' },
        { suit: '♣', name: 'Scheme', desc: 'Assassinations, espionage, coups, heists, betrayals, secret cabals.' },
        { suit: '♦', name: 'Myth', desc: 'Monsters, prophecies, lost relics, curses, heroes, dungeons, planar rifts.' },
      ],
    },
  ]

  return (
    <div className="card print-one-page p-3.5 sm:p-5 space-y-3 border-2 border-foreground/20">
      <div className="flex flex-wrap items-center justify-between border-b-2 border-foreground/30 pb-2 gap-2">
        <div>
          <h1 className="text-base sm:text-xl font-extrabold tracking-tight uppercase leading-tight">
            World Building — Quick Reference Sheet
          </h1>
          <p className="text-[11px] text-muted-foreground leading-tight">
            1-Page Tabletop Cheat Sheet · Created by Inbar Rose · Draw 1 Card → Interpret Suit & Stage Power → Update Map, Timeline & Codex
          </p>
        </div>
        <div className="text-[11px] leading-tight text-left sm:text-right bg-muted/50 px-2.5 py-1 rounded border border-border w-full sm:w-auto">
          <div><strong>Standard Deck (54):</strong> 2–10, J, Q, K, 4 Aces, 2 Jokers</div>
          <div><strong>Short Game Deck (27):</strong> 2–6, K only, 2 Aces, 1 Joker</div>
        </div>
      </div>

      {/* Mobile Stage Quick-Filter (Hidden in Print & Desktop) */}
      <div className="no-print sm:hidden flex items-center gap-1 overflow-x-auto pb-1">
        {(
          [
            { id: 'all', label: 'Full 4×4 Matrix' },
            { id: 1, label: '1. Genesis' },
            { id: 2, label: '2. Primal' },
            { id: 3, label: '3. Civ' },
            { id: 4, label: '4. Intrigue' },
          ] as const
        ).map((tab) => (
          <button
            key={String(tab.id)}
            type="button"
            onClick={() => setMobileStageTab(tab.id)}
            className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap border ${
              mobileStageTab === tab.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted/40 border-border text-muted-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mobile Single-Stage Stacked Cards (when a specific stage is selected on phone) */}
      {mobileStageTab !== 'all' && (
        <div className="no-print sm:hidden space-y-2">
          {mobileStageCards
            .filter((s) => s.num === mobileStageTab)
            .map((st) => (
              <div key={st.num} className="p-3 rounded-lg border-2 border-primary/30 bg-muted/20 space-y-2">
                <div>
                  <div className="font-extrabold text-sm">{st.title}</div>
                  <div className="text-xs text-primary font-semibold">{st.pre}</div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {st.suits.map((s) => (
                    <div key={s.suit} className="p-2.5 rounded border border-border bg-card flex items-start gap-2.5">
                      <span
                        className={`text-2xl font-black leading-none ${
                          s.suit === '♥' || s.suit === '♦' ? 'text-red-600' : ''
                        }`}
                      >
                        {s.suit}
                      </span>
                      <div>
                        <div className="font-bold text-xs uppercase text-primary">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* 4x4 Stage & Suit Power Reference Matrix (Dominant Centerpiece) */}
      <div className={`space-y-1.5 ${mobileStageTab !== 'all' ? 'hidden sm:block print:block' : ''}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-extrabold text-primary uppercase tracking-wider text-xs sm:text-sm">
            ★ Stage & Suit Power Matrix
          </h2>
          <span className="text-[11px] font-medium text-muted-foreground">
            Play rounds until the stage deck is empty, then perform the next Pre-Stage step
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[640px] sm:min-w-full border-collapse border-2 border-foreground/35 text-xs sm:text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border-2 border-foreground/25 p-2 text-center w-14">Suit</th>
                <th className="border-2 border-foreground/25 p-2 text-left">
                  <div className="font-extrabold">1. Genesis</div>
                  <div className="text-[10px] font-semibold text-primary">10,000+ Yrs Ago (Pre-History)</div>
                  <div className="text-[10px] font-normal text-muted-foreground">
                    Pre-Stage: Draw basic coastlines
                  </div>
                </th>
                <th className="border-2 border-foreground/25 p-2 text-left">
                  <div className="font-extrabold">2. Primal</div>
                  <div className="text-[10px] font-semibold text-primary">Thousands of Yrs Ago (Origins)</div>
                  <div className="text-[10px] font-normal text-muted-foreground">
                    Pre-Stage: Each player creates a Species
                  </div>
                </th>
                <th className="border-2 border-foreground/25 p-2 text-left">
                  <div className="font-extrabold">3. Civilization</div>
                  <div className="text-[10px] font-semibold text-primary">Hundreds of Yrs Ago (Kingdoms)</div>
                  <div className="text-[10px] font-normal text-muted-foreground">
                    Pre-Stage: Create Societies & Kingdoms
                  </div>
                </th>
                <th className="border-2 border-foreground/25 p-2 text-left">
                  <div className="font-extrabold">4. Intrigue</div>
                  <div className="text-[10px] font-semibold text-primary">Recent Decades (Modern Plots)</div>
                  <div className="text-[10px] font-normal text-muted-foreground">
                    Pre-Stage: Name Cities, Nations & Armies
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-2 border-foreground/25 p-2 font-black text-xl text-center bg-muted/30">♠</td>
                <td className="border-2 border-foreground/25 p-2">
                  <div className="font-bold text-primary uppercase text-xs">Earth</div>
                  <div className="text-xs leading-snug">Mountains, canyons, islands, hills, valleys, cliffs, caves, craters.</div>
                </td>
                <td className="border-2 border-foreground/25 p-2">
                  <div className="font-bold text-primary uppercase text-xs">Settlement</div>
                  <div className="text-xs leading-snug">Villages, camps, towns, small cities, nomadic routes, migrations.</div>
                </td>
                <td className="border-2 border-foreground/25 p-2">
                  <div className="font-bold text-primary uppercase text-xs">Construction</div>
                  <div className="text-xs leading-snug">Major cities, castles, roads, bridges, temples, universities, wonders.</div>
                </td>
                <td className="border-2 border-foreground/25 p-2">
                  <div className="font-bold text-primary uppercase text-xs">Conflict</div>
                  <div className="text-xs leading-snug">Wars, battles, rebellions, sieges, rivalries, purges, ruined cities.</div>
                </td>
              </tr>
              <tr>
                <td className="border-2 border-foreground/25 p-2 font-black text-xl text-center text-red-600 bg-muted/30">♥</td>
                <td className="border-2 border-foreground/25 p-2">
                  <div className="font-bold text-primary uppercase text-xs">Water</div>
                  <div className="text-xs leading-snug">Rivers, lakes, seas, swamps, waterfalls, glaciers, bays, maelstroms.</div>
                </td>
                <td className="border-2 border-foreground/25 p-2">
                  <div className="font-bold text-primary uppercase text-xs">Tradition</div>
                  <div className="text-xs leading-snug">Beliefs, customs, taboos, festivals, rites of passage, social codes.</div>
                </td>
                <td className="border-2 border-foreground/25 p-2">
                  <div className="font-bold text-primary uppercase text-xs">Enlightenment</div>
                  <div className="text-xs leading-snug">Laws, governments, philosophies, academies, arts, science, dogmas.</div>
                </td>
                <td className="border-2 border-foreground/25 p-2">
                  <div className="font-bold text-primary uppercase text-xs">Cooperation</div>
                  <div className="text-xs leading-snug">Alliances, trade pacts, joint quests, shared defense against threats.</div>
                </td>
              </tr>
              <tr>
                <td className="border-2 border-foreground/25 p-2 font-black text-xl text-center bg-muted/30">♣</td>
                <td className="border-2 border-foreground/25 p-2">
                  <div className="font-bold text-primary uppercase text-xs">Plant</div>
                  <div className="text-xs leading-snug">Forests, jungles, grasslands, marshes, reefs, ancient groves.</div>
                </td>
                <td className="border-2 border-foreground/25 p-2">
                  <div className="font-bold text-primary uppercase text-xs">Resource</div>
                  <div className="text-xs leading-snug">Ore veins, fertile soil, beasts of burden, timber, stone, rare herbs.</div>
                </td>
                <td className="border-2 border-foreground/25 p-2">
                  <div className="font-bold text-primary uppercase text-xs">Expansion</div>
                  <div className="text-xs leading-snug">New colonies, border growth, conquest, forming kingdoms & empires.</div>
                </td>
                <td className="border-2 border-foreground/25 p-2">
                  <div className="font-bold text-primary uppercase text-xs">Scheme</div>
                  <div className="text-xs leading-snug">Espionage, secret cabals, assassinations, black markets, plots.</div>
                </td>
              </tr>
              <tr>
                <td className="border-2 border-foreground/25 p-2 font-black text-xl text-center text-red-600 bg-muted/30">♦</td>
                <td className="border-2 border-foreground/25 p-2">
                  <div className="font-bold text-primary uppercase text-xs">Feature</div>
                  <div className="text-xs leading-snug">Geysers, lava flows, salt flats, currents, monoliths, natural wonders.</div>
                </td>
                <td className="border-2 border-foreground/25 p-2">
                  <div className="font-bold text-primary uppercase text-xs">Skill</div>
                  <div className="text-xs leading-snug">Seafaring, smithing, archery, magic, craftsmanship, hunting.</div>
                </td>
                <td className="border-2 border-foreground/25 p-2">
                  <div className="font-bold text-primary uppercase text-xs">Diplomacy</div>
                  <div className="text-xs leading-snug">Treaties, embassies, royal marriages, trade routes, brokering peace.</div>
                </td>
                <td className="border-2 border-foreground/25 p-2">
                  <div className="font-bold text-primary uppercase text-xs">Myth</div>
                  <div className="text-xs leading-snug">Dragons, ancient ruins, lost artifacts, lich lairs, prophecies.</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Compact Single-Row Card Ranks & Roles Footer */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 text-xs leading-snug">
        <div className="md:col-span-7 p-2.5 rounded border border-foreground/25 bg-muted/30">
          <h2 className="font-bold text-primary uppercase tracking-wider text-[11px] mb-1">
            Card Ranks & Meanings
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-[11px]">
            <div><strong>2–10 (Numbered):</strong> Standard Suit Power in active Stage.</div>
            <div><strong>J, Q, K (Face Cards):</strong> <em>Fantastical</em> (magical/extraordinary) Suit Power.</div>
            <div><strong>Aces (A):</strong> <em>Natural Disaster</em> or cataclysmic upheaval.</div>
            <div><strong>Jokers (🃏):</strong> Wild — <em>Fantastical</em> version of <strong>any</strong> Power.</div>
          </div>
        </div>
        <div className="md:col-span-5 p-2.5 rounded border border-foreground/25 bg-muted/30">
          <h2 className="font-bold text-primary uppercase tracking-wider text-[11px] mb-1">
            Collaborative Roles & Golden Rule
          </h2>
          <div className="text-[11px] space-y-0.5">
            <div><strong>Artist:</strong> Draws map · <strong>Historian:</strong> Logs timeline · <strong>Keeper:</strong> Tracks species & factions.</div>
            <div className="text-muted-foreground"><strong>Shared Ownership:</strong> Anything created belongs to everyone at the table to build upon or transform!</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RulesContent({ categoryFilter }: { categoryFilter: RulesCategoryFilter }) {
  const showOverview = categoryFilter === 'all'
  const showSystem = categoryFilter === 'all' || categoryFilter === 'system'
  const showGenesis = categoryFilter === 'all' || categoryFilter === 'genesis'
  const showPrimal = categoryFilter === 'all' || categoryFilter === 'primal'
  const showCivilization = categoryFilter === 'all' || categoryFilter === 'civilization'
  const showIntrigue = categoryFilter === 'all' || categoryFilter === 'intrigue'
  const showStagesParent = showGenesis || showPrimal || showCivilization || showIntrigue
  const showGlossary = categoryFilter === 'all' || categoryFilter === 'glossary'

  return (
    <div className="prose prose-slate max-w-none">
      {showOverview && (
        <>
          <Section id="introduction" title="Introduction">
            <p>
              World building is a game where you and your friends will create a world. The theme of this
              game is Fantasy, and the idea is that you could then later use this world in your other
              role-playing-games, or for a fantasy story.
            </p>
            <p>
              Throughout the game, different players will take turns using different powers to shape a
              world. From its terrain, and up to its civilizations, their cultures, and the wars they
              fight. While this is happening, you will want to write down and record the different
              actions that are happening to use as the history for your world, and to track the
              different races and cultures and their wars and technological developments so that you will
              have a rich world to play in. You will of course, also need to be drawing this world as
              you play, and you will end up with an awesome world map that you can use for your game.
              The added benefit of course, that if you make the world with the same players that will
              be playing in your game, they will be much more connected to the world and already know
              it's history!
            </p>
          </Section>

          <Section id="guide-to-world-building" title="Guide to World Building">
            <p>
              A world is a complex concept with many elements, simplifying it into a system like the one
              here takes certain simplifications. But we can also make certain assumption to make the
              whole process easier and more fun! The system will let you create forests and rivers, but
              that doesn't mean there aren't trees here and there, small groves, or little streams. The
              elements you introduce with the powers in this game aren't the only thing in the game,
              we assume that the world will have hills, rocks, trees, and vegetation, including the
              occasional stream, brook, or pond. The features that his systems powers let you create
              represent significant terrain features, fauna, flora, settlements, and events. In other
              words, don't worry about the small stuff.
            </p>
          </Section>
        </>
      )}

      {showSystem && (
        <>
          <Section id="preparation-and-requirements" title="Preparation and Requirements">
            <SubSection id="what-you-will-need" title="What you will need">
              <p>
                For World Building, you will need a few players, pencils, plenty of paper, and
                preferably a whiteboard with markers, or some other large and easy for all players to
                see and interact with medium on which to draw. (perhaps even playable online with some
                sort of collaborative whiteboard) It works well with a single player doing all the
                drawing, or everyone doing their own thing, whatever you prefer as a group, but a single
                player drawing will usually take slightly more time than otherwise. And lastly you will
                need a normal deck of playing cards (with jokers) this is the Draw Deck.
              </p>
            </SubSection>

            <SubSection id="how-long-it-will-take" title="How long it will take">
              <p>
                Each stage of the game should take between an hour and two hours, depending on how
                detailed you are making the game, and any variant or house rules you may be using.
              </p>
            </SubSection>
          </Section>

          <Section id="system" title="System">
            <p>
              The process of building a world is split into three stages, with a fourth optional stage;
              Genesis, Primal, Civilization, and Intrigue. Each stage is slightly different from the
              others, with focus given to different aspects of building a world.
            </p>
            <p>
              Unlike other "games" or systems, there is no winner or loser when World Building. The
              players are simply creating a world together.
            </p>
            <p>
              During the progression of the game, as the world goes through stages the players are free
              to do anything that they want, they could create mountains in the first stage, only to
              destroy them in the second stage. A player can put two of his creations against each
              other, or even wipe them out completely. Something created by a player is owned by
              everyone.
            </p>

            <SubSection id="setup" title="Setup">
              <p>To set up the game, prepare your playing area. Each player should make sure that:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>They have easy access to the Draw Deck.</li>
                <li>They can see and gesture at locations on the map.</li>
                <li>They have pencil and paper to record actions and make notes.</li>
              </ul>
              <p>
                There are three optional, but recommended, roles that should be assigned or shared by
                players:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Artist, dedicated to drawing the map.</li>
                <li>Historian, dedicated to recording the timeline.</li>
                <li>Keeper, dedicated to tracking various developments.</li>
              </ul>
              <p>
                Now, before you start, you should draw a basic outline of a coastline, and maybe a few
                features as a starting map. If you like you can design a whole seasonal system, with
                tides, and moons, and weather, multiple continents, and etc. But for the purpose of the
                game you will only be needing a single main landmass, a few features, and maybe some
                islands.
              </p>
              <p>Once you've done all that you are ready to start the first stage!</p>
            </SubSection>

            <SubSection id="playing-a-stage" title="Playing a Stage">
              <p>At the start of each stage, shuffle and prepare the Draw Deck.</p>
              <p>Decide how many cards of each type you want to include….</p>
              <p>A stage is played in rounds until all cards have been played.</p>
              <p>
                Each round, players will draw a card from the Draw Deck and play it for everyone to see.
                Placing it faceup in the discard pile.
              </p>
              <p>
                After all the effects are determined, the Artist should depict or draw any relevant
                changes in the map. The Historian should record the actions in the timeline, and the
                Keeper should track any relevant changes in the world.
              </p>
            </SubSection>

            <SubSection id="powers" title="Powers">
              <p>During each stage there are four powers.</p>
              <p>
                Powers can also be made Fantastical by using face cards of the same suit, or a Joker.
              </p>
              <p>
                Fantastical versions of powers are essentially the same as normal powers only
                fantastical, you should decide ahead of time with the rest of the players just how
                fantastical you want to make it. Low and High fantasy can both be easily supported,
                additionally you may decide to remove Fantastical powers from the game completely and
                simply use them as <em>enhanced</em> or <em>better-than-normal</em> versions of the
                powers.
              </p>
              <p>
                Powers can affect any size area on the map, there is no size factor. But you should
                consider carefully how big or small things should be, and to keep room for things and
                not to overcrowd anything. Use your own judgement.
              </p>
            </SubSection>

            <SubSection id="cards" title="Cards">
              <p>During each stage, there are four powers. Each power corresponds to a different card suite.</p>
              <p>The cards numbered 2 through 10 are used for powers of the current stage.</p>
              <p>
                The face cards (Jack, Queen, King) are used to perform Fantastical versions of the
                powers of the current stage.
              </p>
              <p>Aces are Natural Disasters.</p>
              <p>Jokers are Fantastical versions of any power.</p>
            </SubSection>
          </Section>
        </>
      )}

      {showStagesParent && (
        <Section id="stages-and-powers" title="Stages and Powers">
          <p>
            Each stage has a focus on a different stage of world building. Here you will find those
            stages, and explanations of how to use them to build the world as well as a list of the
            powers for each age and descriptions of them.
          </p>

          {categoryFilter === 'all' && (
            <>
              <SubSection id="timeline-and-history" title="Timeline and History">
                <p>
                  The stages take place over the history and timeline of the world you are making. When
                  deciding the scale of time for the different actions during different stages consider
                  the following:
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>
                    Genesis is pre-history, the exact date of actions are not that important and it should
                    be assumed that all events in this time happened before recorded history more than
                    tens of thousands of years ago
                  </li>
                  <li>
                    Primal is the earliest history, the actions and events in this stage don't need to
                    have fixed dates, and have all taken place many thousands of years ago
                  </li>
                  <li>
                    Civilization is history, these are all actions and events that took place over
                    hundreds or a few thousands years ago, they act as a precursor to the Intrigue stage
                    and don't need to be very nuanced or detailed.
                  </li>
                  <li>
                    Intrigue is the most recent history, these are all actions and events that have taken
                    place in the last few decades or years. These actions and events act as a lead into
                    the story of the world and set up the major plots and stories.
                  </li>
                </ol>
              </SubSection>

              <SubSection id="natural-disasters" title="Natural Disasters">
                <p>
                  Natural Disasters happen during any age and are triggered whenever a player draws an Ace
                  card. When this happens, the player who drew the card should decide what happens.
                  Examples of natural disasters could be a volcanic eruption, an earthquake, a tsunami, a
                  meteor, a plague, a tornado, etc.
                </p>
              </SubSection>
            </>
          )}

          {showGenesis && (
            <StageSection
              id="1.-genesis"
              title="1. Genesis"
              description="The Genesis stage represents the early stage of a world, the main focus of this stage is to create a terrain/landscape for everything else to be in. Players should focus on using their powers during this stage to add features to the map."
              preStage="Before starting this stage, make sure you already have some basic terrain features such as coastlines for your continent(s) and maybe a river, or a mountain or two."
              powers={[
                { id: '(♠)---earth', suit: '♠', name: 'Earth', description: 'This power represents earthly features: mountains, hills, canyons, deserts, cliffs, caves, etc.' },
                { id: '(♥)---water', suit: '♥', name: 'Water', description: 'This power represents watery features: rivers, lakes, swamps, waterfalls, tidal pools, maelstroms, glaciers, etc.' },
                { id: '(♣)---plant', suit: '♣', name: 'Plant', description: 'This power represents the vegetation, flora, and plants: forests, jungles, grasslands, rainforests, marshes, etc.' },
                { id: '(♦)---feature', suit: '♦', name: 'Feature', description: 'This power represents specific features, or elements in the world: weather, climates, unique places, special formations, complex geological elements, for example; geysers, craters, strong winds, currents, salt flats, landmarks, lava flows, natural resources, etc. Things that you would put on a map that aren\'t really represented with the other powers.' },
              ]}
            />
          )}

          {showPrimal && (
            <StageSection
              id="2.-primal"
              title="2. Primal"
              description="The Primal stage represents the origin of intelligent species and races and what makes them special. The focus is on introducing new species to the world, and developing them. Players will each create a species, and then take turns enhancing those species in preparation for the next stage. Species here refers to a race of sentient beings that will be the basis for the nations and societies for the Civilization and Intrigue stages; Humans, Elves, Dwarves, Orcs, etc."
              preStage="Before starting this stage, each player should create a species, describing them and naming them and deciding where on the map they originated from."
              powers={[
                { id: '(♠)---settlement', suit: '♠', name: 'Settlement', description: 'Enhance the species with a settlement; villages, towns, small cities, etc. (Major Cities, Kingdoms, Empires, and the like are more complex and are only available during the Civilization stage.)' },
                { id: '(♥)---tradition', suit: '♥', name: 'Tradition', description: 'Enhance the species with a tradition; religious, cultural, militaristic, ritualistic, agricultural, rites of passage, etc.' },
                { id: '(♣)---resource', suit: '♣', name: 'Resource', description: 'Enhance the species with a resource; domesticated crops or animals, raw materials (wood, stone, iron, etc), natural resource, etc.' },
                { id: '(♦)---skill', suit: '♦', name: 'Skill', description: 'Enhance the species with a skill; something that they are the greatest at, hunting, sailing, climbing, building, crafting, farming, etc.' },
              ]}
            />
          )}

          {showCivilization && (
            <StageSection
              id="3.-civilization"
              title="3. Civilization"
              description="The Civilization stage represents the development of species into varied societies and their impact on nature, the landscape, and each other. The focus is on making the different societies more unique, by playing the stage from their perspective. To let the species created during the Primal stage interact with each other and the world around them in interesting ways and diverge and grow as societies. The powers of this stage should be from the perspective of Societies, Civilizations, and Groups. Many of the powers in this stage can overlap in their effects, and that is okay, they are different approaches with different motivations which leads to a deeper world."
              preStage="Before starting this stage, each player should create some societies within the different species which might grow and expand during this stage into kingdoms or empires."
              powers={[
                { id: '(♠)---construction', suit: '♠', name: 'Construction', description: 'The power of construction; the society will complete a significant construction project. Building a new City, Roads and Bridges, A Castle, A University, Terraform the landscape, etc.' },
                { id: '(♥)---enlightenment', suit: '♥', name: 'Enlightenment', description: 'The power of enlightenment; the society will discover or develop technologically, scientifically, socially, culturally, or religiously. Becoming the best at something (mining, farming, boat-making, armor-crafting, architecture, medicine) or becoming paragons of new thinking; governments (feudalism, republic, aristocracy, etc), philosophy (pacifism, militarism, socialism, etc), arts (music, painting, sculptures) or becoming moved by their beliefs to build monuments, spread religion, or adhere to dogmas.' },
                { id: '(♣)---expansion', suit: '♣', name: 'Expansion', description: 'The power of expansion; the society will expand their borders through war, conquest, exploration, population growth, or alliance with other societies. Taking control of land that is owned by others or not at all. Founding new settlements, integrating into old settlements or conquering them. Forming kingdoms and empires.' },
                { id: '(♦)---diplomacy', suit: '♦', name: 'Diplomacy', description: 'The power of diplomacy; the society will work with other societies to trade, learn, grow, or cooperate together or against others. Exchanging goods and ideas for prosperity, making alliances, joining dynasties by marriage, forming kingdoms and empires. Brokering peace, ending wars, negotiating borders.' },
              ]}
            />
          )}

          {showIntrigue && (
            <StageSection
              id="4.-intrigue"
              title="4. Intrigue"
              description="The Intrigue stage is where the players create the very recent history of the world. It represents the late stages of a world, where societies have already developed rich mythologies, where they interact with one another, and discover mysteries. The focus on this stage is enrich the world with connections, friendly or unfriendly and between the world, it's landscape, and its populace. The focus of this stage is to make the world an interesting place for telling stories, by discussing and creating plots, stories, and events that are all tied together, all close together, and all within a few decades of the start of the story."
              preStage="Before this stage, you should make sure to give names to cities, nations, and societies. And deliberate on their aspects that you have developed over the last two stages. Noting the power, influence, armies, government, economy, etc of the different societies in the world."
              powers={[
                { id: '(♠)---conflict', suit: '♠', name: 'Conflict', description: 'The power of conflict; Groups work against each other, wars, battles, zealots purging heretics, cities are destroyed, etc. Conflicts can be specific or general, tactical or strategic, conquest or raid. Conflicts could be internal or between societies.' },
                { id: '(♥)---cooperation', suit: '♥', name: 'Cooperation', description: 'The power of cooperation; Groups work together, trading goods and ideas, helping each other, protecting each other, etc. When cooperating societies can accomplish great things, or bring down great foes, they can be good or bad, fast or slow, ongoing or temporary.' },
                { id: '(♣)---scheme', suit: '♣', name: 'Scheme', description: 'The power of scheming; Groups scheme and plot, spies and informants trade and share information and secrets, kings are assassinated, black markets are formed, secret alliances are made, etc. Anything that happens as part of a complex plot, or plans that are set in motion only to be triggered later, ongoing things in the world. Schemes can be internal to a society or involve multiple societies.' },
                { id: '(♦)---myth', suit: '♦', name: 'Myth', description: 'The power of myth; this lets you add mythical things to your world and the story, they could have been there all along, or only recently arrived. It could be a dragon in a cave, a mysterious lost artifact somewhere in a desert, a lich who lives in a haunted palace near a specific mountain, etc. Myth is a general term which will let you add story elements that are part of the world and interesting for the game or story. These could be plot hooks, quests, or looming dangers in the world.' },
              ]}
            />
          )}
        </Section>
      )}

      {showGlossary && (
        <>
          <Section id="glossary-of-terms" title="Glossary of Terms">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
              <div className="p-4 rounded-lg bg-muted/40 border border-border">
                <dt className="font-bold text-primary">Draw Deck</dt>
                <dd className="text-sm text-muted-foreground mt-1">
                  The customized playing card deck drawn from during each stage to determine which power a player invokes on their turn.
                </dd>
              </div>
              <div className="p-4 rounded-lg bg-muted/40 border border-border">
                <dt className="font-bold text-primary">Stage</dt>
                <dd className="text-sm text-muted-foreground mt-1">
                  One of the four eras of creation (Genesis, Primal, Civilization, Intrigue), each focusing on a distinct layer of the world’s development.
                </dd>
              </div>
              <div className="p-4 rounded-lg bg-muted/40 border border-border">
                <dt className="font-bold text-primary">Power (2–10 Cards)</dt>
                <dd className="text-sm text-muted-foreground mt-1">
                  A world-shaping action determined by the drawn card’s suit (♠, ♥, ♣, ♦) and the current active Stage.
                </dd>
              </div>
              <div className="p-4 rounded-lg bg-muted/40 border border-border">
                <dt className="font-bold text-primary">Fantastical Power (J, Q, K)</dt>
                <dd className="text-sm text-muted-foreground mt-1">
                  Triggered by drawing a face card (Jack, Queen, or King), allowing an extraordinary, magical, or larger-than-life version of that suit’s power.
                </dd>
              </div>
              <div className="p-4 rounded-lg bg-muted/40 border border-border">
                <dt className="font-bold text-primary">Natural Disaster (Ace)</dt>
                <dd className="text-sm text-muted-foreground mt-1">
                  Triggered by drawing an Ace; unleashes a cataclysmic upheaval or upheaval appropriate to the current Stage.
                </dd>
              </div>
              <div className="p-4 rounded-lg bg-muted/40 border border-border">
                <dt className="font-bold text-primary">Joker (Wild Fantastical)</dt>
                <dd className="text-sm text-muted-foreground mt-1">
                  Allows the player to choose any Fantastical Power from the current stage (or combine effects creatively).
                </dd>
              </div>
              <div className="p-4 rounded-lg bg-muted/40 border border-border">
                <dt className="font-bold text-primary">Artist, Historian & Keeper</dt>
                <dd className="text-sm text-muted-foreground mt-1">
                  The three collaborative roles: the <strong>Artist</strong> illustrates the map, the <strong>Historian</strong> chronicles the timeline, and the <strong>Keeper</strong> tracks species, societies, and factions.
                </dd>
              </div>
              <div className="p-4 rounded-lg bg-muted/40 border border-border">
                <dt className="font-bold text-primary">Species & Societies</dt>
                <dd className="text-sm text-muted-foreground mt-1">
                  Sentient races introduced before the Primal stage and the kingdoms, nations, or organizations they form prior to the Civilization stage.
                </dd>
              </div>
            </dl>
          </Section>

          <Section id="reference-table" title="Reference Table">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-3 text-left"></th>
                    <th className="border border-border p-3 text-center">1 - Genesis</th>
                    <th className="border border-border p-3 text-center">2 - Primal</th>
                    <th className="border border-border p-3 text-center">3 - Civilization</th>
                    <th className="border border-border p-3 text-center">4 - Intrigue</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3 font-semibold">♠</td>
                    <td className="border border-border p-3 text-center">Earth</td>
                    <td className="border border-border p-3 text-center">Settlement</td>
                    <td className="border border-border p-3 text-center">Construction</td>
                    <td className="border border-border p-3 text-center">Conflict</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">♥</td>
                    <td className="border border-border p-3 text-center">Water</td>
                    <td className="border border-border p-3 text-center">Tradition</td>
                    <td className="border border-border p-3 text-center">Enlightenment</td>
                    <td className="border border-border p-3 text-center">Cooperation</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">♣</td>
                    <td className="border border-border p-3 text-center">Plant</td>
                    <td className="border border-border p-3 text-center">Resource</td>
                    <td className="border border-border p-3 text-center">Expansion</td>
                    <td className="border border-border p-3 text-center">Scheme</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-semibold">♦</td>
                    <td className="border border-border p-3 text-center">Feature</td>
                    <td className="border border-border p-3 text-center">Skill</td>
                    <td className="border border-border p-3 text-center">Diplomacy</td>
                    <td className="border border-border p-3 text-center">Myth</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              <strong>Aces:</strong> Natural Disaster, <strong>Face Cards:</strong> Fantastical Power,{' '}
              <strong>Joker:</strong> Any Fantastical Power
            </p>
          </Section>
        </>
      )}

      {showOverview && (
        <Section id="acknowledgements" title="Acknowledgements">
          <SubSection id="the-author" title="The Author">
            <p>
              I am Inbar Rose. <a href="mailto:inbarrose@gmail.com" className="text-primary hover:underline">inbarrose@gmail.com</a>. I love roleplaying games and World Building. And I made this so that I could have fun with my friends doing what I love.
            </p>
          </SubSection>

          <SubSection id="inspiration" title="Inspiration">
            <p>
              World Building was inspired by a wonderful system contained in a single document called
              "Dawn of Worlds" (First Edition, July 2005, © N. Bob Pesall, Esq. Attorney At Law,
              Dickinson, ND). This is a total re-thinking of that work, but the ideas came because I
              wanted a better way to do what I did in that game.
            </p>
          </SubSection>

          <SubSection id="thanks" title="Thanks">
            <p>Thanks to Stav Geffen for inspiring me to use Cards for this game. And for helping me focus on what's important.</p>
            <p>Thanks to Golan Gross for being an amazing artist during my first ever attempt at world building, and through his art making me realize how awesome this can be.</p>
            <p>Thanks to Alon Tsang for dropping everything at the last minute to keep us playing, and keep us excited.</p>
          </SubSection>
        </Section>
      )}
    </div>
  )
}

interface SectionProps {
  id: string
  title: string
  children: React.ReactNode
}

function Section({ id, title, children }: SectionProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <section id={id} className="scroll-mt-16">
      <div className="flex items-center justify-between pt-8 border-t border-border first:border-t-0 first:pt-0 mb-4">
        <h2 className="text-2xl sm:text-3xl font-bold !my-0">{title}</h2>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="no-print p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent text-xs flex items-center gap-1"
          title={collapsed ? `Expand ${title}` : `Collapse ${title}`}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>
      {!collapsed && <div className="space-y-4">{children}</div>}
    </section>
  )
}

interface SubSectionProps {
  id: string
  title: string
  children: React.ReactNode
}

function SubSection({ id, title, children }: SubSectionProps) {
  return (
    <section id={id} className="scroll-mt-16">
      <h3 className="text-xl sm:text-2xl font-semibold mb-3 mt-6">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

interface Power {
  id: string
  suit: string
  name: string
  description: string
}

interface StageSectionProps {
  id: string
  title: string
  description: string
  preStage: string
  powers: Power[]
}

function StageSection({ id, title, description, preStage, powers }: StageSectionProps) {
  return (
    <section id={id} className="scroll-mt-16">
      <h3 className="text-xl sm:text-2xl font-semibold mb-3 mt-6">{title}</h3>
      <p className="mb-4">{description}</p>
      <div className="bg-muted/50 p-4 rounded-xl border border-border/60 mb-4">
        <p className="font-semibold mb-1.5 text-primary">Pre-{title}:</p>
        <p className="text-sm">{preStage}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 not-prose">
        {powers.map((power) => (
          <div
            key={power.id}
            id={power.id}
            className="scroll-mt-16 p-4 rounded-xl border border-border bg-card border-l-4 border-l-primary space-y-1.5"
          >
            <h4 className="text-base font-bold flex items-center gap-1.5">
              <span
                className={
                  power.suit === '♥' || power.suit === '♦' ? 'text-red-600' : 'text-foreground'
                }
              >
                ({power.suit})
              </span>
              <span>- {power.name}</span>
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {power.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
