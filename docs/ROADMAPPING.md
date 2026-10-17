---
id: ROADMAP
title: Roadmap & Milestones
version: 2.0.0
status: active
---

# Roadmap & Milestones — world-builder-site

```
[Phase 0: Governance & Static Foundations] (Done)
  │
  ├──► [Phase 1: Core Engine & Multi-World Local Persistence] (Current)
  │      - TypeScript DeckEngine & CardData types
  │      - WorldStorageService (localStorage named slots, autosave, JSON export/import)
  │      - Unit test coverage (Vitest)
  │
  ├──► [Phase 2: Interactive Grid Map Canvas]
  │      - Configurable 20x12 grid canvas
  │      - Terrain palette & paint/fill tools
  │      - Tile inspector modal/drawer with event linkages
  │      - Map snapshot export (PNG/SVG)
  │
  ├──► [Phase 3: Timeline & Entity Registry]
  │      - Chronological event timeline with epoch/year calculation
  │      - Species, Civilization, and Myth trackers
  │      - Spatial & entity cross-linking with map and cards
  │
  └──► [Phase 4: Integrated World Building Studio]
         - Unified responsive layout with panel toggles
         - Theme polish & accessibility
         - End-to-end verification and documentation
```

## Milestone Deliverables

### Phase 0: Foundations & Governance (Completed)
- Clean up server-side/Vercel artifacts.
- Set up GitHub Pages automated CI/CD with custom domain `world-building.inbarrose.com`.
- Overhaul Agent Instructions, ADRs, and Architecture documentation.

### Phase 1: Modular Engine & Multi-World Persistence
- Refactor card logic into standalone `DeckEngine.ts`.
- Implement `WorldStorageService.ts` for multiple named saved worlds in `localStorage`.
- Comprehensive Vitest test suite for deck logic and serialization.

### Phase 2: Interactive Grid Map Canvas
- Build HTML5/SVG interactive tile canvas with 12+ terrain types.
- Tile inspection drawer showing terrain details, notes, and associated historical events.
- PNG/SVG map image export.

### Phase 3: Timeline & Entity Registry
- Dedicated timeline viewer with search and stage filters.
- Entity registry tracking Primal species, Civilization societies, and Intrigue myths.

### Phase 4: Integrated World Studio & Final Polish
- Unified Studio interface integrating Deck, Map, Timeline, and Entities.
- Export entire world chronicle as a markdown/HTML bundle.

---

## Tasks

- [x] Phase 0: Governance & Static Foundations
- [ ] Phase 1: Core Engine & Multi-World Local Persistence
- [ ] Phase 2: Interactive Grid Map Canvas
- [ ] Phase 3: Timeline & Entity Registry
- [ ] Phase 4: Integrated World Studio & Polish

