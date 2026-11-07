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
  ├──► [Phase 11: 60fps Smooth Pan/Zoom Cartography Camera] (Done — Score: 79.5 / 100)
  │      - Canvas viewport zoom/pan with mouse wheel, space+drag, floating radar minimap
  │
  ├──► [Phase 12: Emergent Narrative Simulation & Dynamic Chronicles] (Done — Score: 86.0 / 100)
  │      - Deterministic 4-chapter prose saga synthesizer (`RealmSagaModal.tsx`)
  │      - Turn significance classifier, historical deeds & diplomatic harmony engine
  │
  ├──► [Phase 13: Organic Cartography Shading & Dynamic Biome Blending] (Done — Score: 91.0 / 100)
  │      - Multi-octave elevation relief shading, organic biome border blending
  │      - Coastline shallows, NW sunlit crest highlights, water shimmer waves
  │
  ├──► [Phase 14: Full Physical Play Mat Mode & Ambient Soundscapes] (Done)
  │
  ├──► [Phase 15: Polished AAA Orchestration & PWA Offline Mastery] (Done)
  │
  ├──► [Phase 16: AAA Launcher, Deliberate Ceremonies & Focused Studio] (Done)
  │      - True Adversarial Baseline Re-Audit (ADR-012: 47.0 / 100)
  │
  ├──► [Phase 17: Unified Transactional Command Engine & IndexedDB Resilience] (Next — Target: 53.0 / 100)
  │      - Multi-domain atomic Undo/Redo across map, codex, and timeline
  │      - Async IndexedDB storage provider with schema migration & quota resilience
  │      - Command palette (`Ctrl+K`) and Hotkey Cheat Sheet overlay (`?`)
  │
  ├──► [Phase 18: Dual Hexagonal & Orthogonal Cartography Engine] (Target: 58.0 / 100)
  │      - True flat-topped hex grid topology (axial q, r, s coordinates)
  │      - Seamless topology switcher without data loss, multi-radius brush suite
  │
  ├──► [Phase 19: Vector Watershed Physics & Connected Road Pathfinding] (Target: 62.5 / 100)
  │      - Downhill procedural river flow and confluence joins based on elevation
  │      - A* road pathfinding between settlements; Layer Stacking toggle panel
  │
  ├──► [Phase 20: Recursive Causal Saga Graph & Emergent Lore Engine] (Target: 68.0 / 100)
  │      - Directed acyclic event causality graph (antecedents -> triggers -> consequences)
  │      - Dynamic contextual fantasy prose referencing historic heroes and ruins
  │
  ├──► [Phase 21: Dynamic Geopolitical Faction AI & Utility-AI Personalities] (Target: 73.0 / 100)
  │      - Faction agenda state machine, dynamic casus belli, dynamic borders
  │      - Utility-AI evaluation replacing random sampling for bot decisions
  │
  ├──► [Phase 22: Kinetic Card Physics, Dynamic Particle FX & Acoustic Stems] (Target: 79.5 / 100)
  │      - Velocity-driven card physics, pointer 3D tilt, visual deck thickness
  │      - GPU particle emitters on card flips and cataclysms, pitch-randomized audio stems
  │
  ├──► [Phase 23: Real-Time Tabletop Peer Synchronization] (Target: 84.0 / 100)
  │      - Serverless WebRTC / BroadcastChannel live room sync across devices
  │      - Live GM card draws, tile painting, and token movement replication
  │
  └──► [Phase 24: High-DPI Cartouche & Multi-Theme Sourcebook Studio] (Target: 88.5+ / 100)
         - 300 DPI print-ready map export with decorative border cartouches
         - Multi-theme Sourcebook styles (Parchment, Grimdark, High Fantasy, Atlas)
```

## Milestone Deliverables

### Phase 16: AAA Launcher, Deliberate Ceremonies & Focused Studio (Completed)
- Dedicated Title Screen / Main Menu (`StudioLauncher.tsx`) with Resume, New Game, Load Game, Quick Start.
- 5-step `NewGameCeremonyModal.tsx` and `EpochCeremonyModal.tsx` for deliberate game parameter changes.
- Minimalist focus-zone header with Atmosphere popover, Share popover, and Settings menu.
- Map canvas safe inspect mode by default with visual gold ring during active drafting.
- 64/64 passing automated tests across 10 test suites.

### Phase 17: Unified Transactional Command Engine & IndexedDB Resilience (Next — Target: 53.0 / 100)
- **Command Pattern State Engine (`commandEngine.ts`)**: Encapsulates all mutating user actions (draw card, paint tile, register entity, update relationship) into reversible commands. An Undo operation atomically reverts map, codex, and draw records simultaneously without desynchronization.
- **IndexedDB Storage Adapter (`storageIndexedDb.ts`)**: Asynchronous, quota-resilient storage replacing `localStorage` to support 50MB+ of world history, binary assets, and fast debounced auto-saves.
- **Command Palette & Keyboard Overlay**: Global `Ctrl+K` command jumper for instant tool selection, and `?` modal for complete hotkey discovery.
- **Verification**: `commandEngine.test.ts` and `storageIndexedDb.test.ts`.

---

## Tasks

- [x] Phase 0–15 Implementation and Testing
- [x] Phase 16: AAA Game Launcher, Deliberate Ceremonies & Focused Tabletop Studio
- [x] ADR-012: Adversarial Multi-Domain Re-Audit & Rubric Standardization (47.0 / 100 Real Baseline)
- [ ] Implement Phase 17: Unified Transactional Command Engine & IndexedDB Resilience (Target: 53.0 / 100)
- [ ] Implement Phase 18: Dual Hexagonal & Orthogonal Cartography Engine (Target: 58.0 / 100)
- [ ] Implement Phase 19: Vector Watershed Physics & Connected Road Pathfinding (Target: 62.5 / 100)
- [ ] Implement Phase 20: Recursive Causal Saga Graph & Emergent Lore Engine (Target: 68.0 / 100)
- [ ] Implement Phase 21: Dynamic Geopolitical Faction AI & Utility-AI Personalities (Target: 73.0 / 100)
- [ ] Implement Phase 22: Kinetic Card Physics, Dynamic Particle FX & Acoustic Stems (Target: 79.5 / 100)
- [ ] Implement Phase 23: Real-Time Tabletop Peer Synchronization (Target: 84.0 / 100)
- [ ] Implement Phase 24: High-DPI Cartography Cartouche & Multi-Theme Sourcebook Studio (Target: 88.5+ / 100)

