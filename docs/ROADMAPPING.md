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
  ├──► [Phase 1: Core Engine & Multi-World Local Persistence] (Done)
  │
  ├──► [Phase 2: Interactive Grid Map Canvas] (Done)
  │
  ├──► [Phase 3: Timeline & Entity Registry] (Done)
  │
  ├──► [Phase 4: Integrated World Studio & Final Polish] (Done)
  │
  ├──► [Phase 5: Vision Refinement & v2.1 Studio Polish] (Done)
  │      - Hotseat multiplayer (1–6 seats), Seeded Auto-Play, Time-travel rewind
  │
  ├──► [Phase 6: v3.0 UI Hierarchy & Wiki Codex] (Done — Baseline: 46.5 / 100)
  │      - 5-Level UI Hierarchy, Mode-Adaptive Workspaces (Companion, Studio, Freeform),
  │        Bi-directional Wiki cross-linking, Instant search rules hub
  │
  ├──► [Phase 7: Map Canvas Resilience & Undo/Redo Engine] (Next — Target: 52.5 / 100)
  │      - 20-step tile state undo/redo buffer (`Ctrl+Z` / `Ctrl+Y`)
  │      - Toolbar Undo/Redo controls & dirty state indicators
  │
  ├──► [Phase 8: Tactile Game Feel, Card Juice & Audio Polish] (Target: 59.5 / 100)
  │      - 3D CSS card flip & deal physics with micro-interactions
  │      - Optional synthesized web-audio clicks/chimes with mute toggle
  │
  ├──► [Phase 9: Standalone "Campaign Sourcebook" Publisher] (Target: 66.5 / 100)
  │      - 1-click self-contained printable HTML/PDF campaign book
  │      - Embedded 2.5D SVG map, timeline chapters by Age, Codex stat blocks
  │
  ├──► [Phase 10: Frictionless Table Sharing via Compact URL / QR Code] (Target: 72.5 / 100)
  │      - URL fragment state compression via lz-string & QR code generator modal
  │
  └──► [Phase 11: 60fps Smooth Pan/Zoom Cartography Camera] (Target: 79.5 / 100)
         - Canvas viewport zoom/pan with mouse wheel, space+drag, and pinch gestures
```

## Milestone Deliverables

### Phase 0–6 (Completed Baseline — Score: 46.5 / 100)
- Verified static SPA architecture on GitHub Pages.
- 5-Level UI hierarchy, 3 mode workspaces, and bi-directional Wiki Codex (34/34 passing tests).

### Phase 7: Map Canvas Resilience & Undo/Redo Engine (Target: 52.5 / 100)
- Immutable 20-action history stack (`undoStack` and `redoStack`) for brush and bucket fill operations.
- `Ctrl+Z` / `Ctrl+Y` keyboard bindings and visual toolbar triggers.
- Unit tests verifying multi-step fill/brush reversals.

### Phase 8: Tactile Game Feel, Card Juice & Audio Polish (Target: 59.5 / 100)
- 3D card dealing and flipping animation transitions.
- Subtle sound design using Web Audio API (card draw, turn pass, stage advance) with instant mute control.
- Micro-interactions on buttons, tiles, and timeline scrubbers.

### Phase 9: Standalone "Campaign Sourcebook" Publisher (Target: 66.5 / 100)
- Publication-grade HTML/CSS export bundle styled like an official fantasy RPG sourcebook.
- Two-column responsive layout with embedded SVG world map, chapter-by-stage chronicle, and entity dossiers.

### Phase 10: Frictionless Table Sharing via Compact URL / QR Code (Target: 72.5 / 100)
- Client-side compression of world states/seeds into URL fragments.
- QR code display modal for instant mobile/tablet loading across the physical table without files.

### Phase 11: 60fps Smooth Pan/Zoom Cartography Camera (Target: 79.5 / 100)
- Infinite canvas viewport pan and zoom controls (`Space + Drag`, mouse wheel, touch pinch).
- Coordinate ruler, minimap viewport indicator, and grid scale markers.

---

## Tasks

- [x] Phase 0: Governance & Static Foundations
- [x] Phase 1: Core Engine & Multi-World Local Persistence
- [x] Phase 2: Interactive Grid Map Canvas
- [x] Phase 3: Timeline & Entity Registry
- [x] Phase 4: Integrated World Studio & Polish
- [x] Phase 5: Vision Refinement & v2.1 Studio Polish
- [x] Phase 6: v3.0 UI Hierarchy & Wiki Codex Baseline (Score: 46.5 / 100)
- [x] Phase 7: Map Canvas Resilience & Undo/Redo Engine (Score: 52.5 / 100)
- [x] Phase 8: Tactile Game Feel, Card Juice & Audio Polish (Score: 59.5 / 100)
- [x] Phase 9: Standalone "Campaign Sourcebook" Publisher (Score: 66.5 / 100)
- [x] Phase 10: Frictionless Table Sharing via Compact URL / QR Code (Score: 72.5 / 100)
- [ ] Phase 11: 60fps Smooth Pan/Zoom Cartography Camera (Target: 79.5 / 100)

