---
id: FUNCTIONAL_REQS
title: Functional Requirements
version: 2.0.0
status: active
---

# Functional Requirements — world-builder-site

## 1. Core System Features

### 1.1 Rules Wiki (`/rules`)
- Complete wiki-like rules navigation with jump-to-section anchor links and sticky table of contents.
- Stage-by-stage descriptions (Genesis, Primal, Civilization, Intrigue) with associated suit powers.
- Reference lookup tables and pre-stage preparation guidelines.

### 1.2 Card Draw Simulator (`/play`)
- Customizable draw deck supporting standard (54 cards) and short game presets.
- Granular controls: number card range (2-10 slider), face cards (J, Q, K toggles), Ace counts (0-4), Joker counts (0-2).
- Card presentation displaying suit, value, fantastical status, and corresponding stage power descriptions with practical examples.
- Stage progression (automatic deck rebuild and transition across Genesis → Primal → Civilization → Intrigue).

### 1.3 World & Session Persistence
- Named world slots saved directly in browser `localStorage`.
- Auto-save on every move / card draw / map edit.
- One-click JSON export to backup/share world states, and JSON import to restore worlds.

### 1.4 Interactive Grid Map Canvas
- Configurable tile grid (default 20x12) for spatial world depiction.
- Terrain palette: Earth, Mountain, Canyon, Water/River, Ocean, Swamp, Forest/Plant, Jungle, Plains, Desert, Settlement, City, Monument.
- Interactive tools: Brush paint, Bucket fill, Erase, and Select.
- Tile inspection drawer: Displays coordinate, terrain, assigned species/settlements, and linked historical events.
- Map image snapshot export (PNG/SVG).

### 1.5 Timeline & History Engine
- Sequential event tracking (`move_id`, timestamp, stage, power, card drawn, and user narrative note).
- Calculation of relative Epoch / World Year based on stage history.
- Filtering by Stage, Tag, and Tile location.
- Formatted Text and Markdown export.

### 1.6 Entity & Society Registry
- **Species**: Track sentient species created during Primal stage (origins, traditions, resources, skills).
- **Societies & Civilizations**: Track nations and kingdoms created during Civilization stage (governments, monuments, expansion, diplomacy).
- **Plots & Myths**: Track Intrigue events (conflicts, cooperation pacts, secret schemes, ancient myths).

---

## Tasks

- [ ] Complete implementation of Map Canvas, Timeline panel, and Entity Registry.
- [ ] Maintain 100% feature coverage with automated Vitest test cases.

