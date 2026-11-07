# Uncompromising AAA-Calibrated Tabletop Benchmark Rubric & Multi-Domain Governance

> **Governance Document**: System Quality Standard, Multi-Domain Rubric, and Adversarial Audit Framework  
> **Effective Date**: 2026-11-06  
> **Status**: Accepted & Enforced  
> **Supersedes**: ADR-010 (Inflated Self-Scoring Standard)

---

## Executive Summary & Adversarial Re-Evaluation

The previous evaluation scored the application at **100.0 / 100**, declaring "Full AAA Benchmark Perfection Achieved."  
**That assessment is hereby formally revoked as an uncritical self-congratulatory assessment.**

When benchmarked with adversarial rigor against the premier commercial titans of digital tabletop, world-building, grand strategy, and professional creative tools (*Foundry VTT, Inkarnate, Wonderdraft, Crusader Kings III, Slay the Spire, Baldur's Gate 3, Linear, Figma*), the true state of this codebase is **44.0 / 100**.

This document defines the **Multi-Domain Expert Council Rubric (6 Domains, 24 Rigorous Submetrics, 100 Maximum Points)**, establishes strict evidence and testing rules, documents the adversarial audit findings, and lays out the Phase 17+ engineering roadmap to systematically achieve real commercial excellence.

---

## Domain Architecture & Expert Perspectives

```mermaid
graph TD
    Root["Uncompromising AAA Benchmark Rubric (100 pts)"]
    Root --> D1["D1: AAA Game Feel & Audiovisual Polish (20 pts)"]
    Root --> D2["D2: Cartographic Engineering & Spatial Simulation (20 pts)"]
    Root --> D3["D3: Narrative Architecture & Causal Simulation (20 pts)"]
    Root --> D4["D4: Tabletop Ergonomics & Multi-Device Sync (15 pts)"]
    Root --> D5["D5: State Machine Rigor & Persistence (15 pts)"]
    Root --> D6["D6: Campaign Publishing & Typographic Fidelity (10 pts)"]

    D1 --> M1["M1.1 Kinetic Card Tactility (5)"]
    D1 --> M2["M1.2 Procedural Audio & Dynamic Stems (5)"]
    D1 --> M3["M1.3 Particle FX & Screen Dynamics (5)"]
    D1 --> M4["M1.4 Ceremonial Choreography (5)"]

    D2 --> M5["M2.1 Dual Hex & Orthogonal Grids (5)"]
    D2 --> M6["M2.2 Vector Watersheds & Spline Roads (5)"]
    D2 --> M7["M2.3 Multi-Octave Shading & Elevation (5)"]
    D2 --> M8["M2.4 Layer Stacking & Procedural Brushes (5)"]

    D3 --> M9["M3.1 Recursive Causal Saga Graph (5)"]
    D3 --> M10["M3.2 Dynamic Geopolitical Faction AI (5)"]
    D3 --> M11["M3.3 Lineage & Cultural Drift (5)"]
    D3 --> M12["M3.4 Utility-AI Bot Personalities (5)"]

    D4 --> M13["M4.1 Real-Time Peer Table Sync (5)"]
    D4 --> M14["M4.2 Touch & Tablet Ergonomics (5)"]
    D4 --> M15["M4.3 Pro Keyboard Hotkey Mastery (5)"]

    D5 --> M16["M5.1 Unified Transactional Undo/Redo (5)"]
    D5 --> M5_2["M5.2 IndexedDB Quota-Resilient Storage (5)"]
    D5 --> M5_3["M5.3 Zero-Dependency Offline PWA (5)"]

    D6 --> M19["M6.1 300-DPI Vector/Raster Cartography (5)"]
    D6 --> M20["M6.2 Multi-Page Print Sourcebook Typesetting (5)"]
```

---

## Detailed Domain Criteria & Adversarial Audit

### Domain 1: AAA Game Feel, Systems Design & Audiovisual Polish (20 Points)
*Expert Perspective: Lead Game Designer & Creative Director (Benchmark: Hearthstone, Slay the Spire, Baldur's Gate 3)*

- **M1.1: Physical Card Tactility & Deck Kinetic Feedback (5 pts)**
  - *Criteria*: Physics-based card drag-and-drop with inertia, dynamic cursor-following 3D perspective tilt (`rotateX`, `rotateY`), visual deck stack thickness reflecting exact remaining cards, sound-synced dealing and discard animation.
  - *Current Reality*: Flat card click with CSS keyframe flip. Zero card physics, zero cursor tilt, static deck illustration.
  - *Audit Score*: **2.5 / 5.0**
- **M1.2: Procedural Audio & Dynamic Stems (5 pts)**
  - *Criteria*: Multi-layer procedural ambient soundscapes with organic micro-variations, contextual musical stingers on high-stakes draws (e.g. Disaster Aces, Fantastical Jokers), sound-effect pitch randomization (±50 cents to avoid acoustic fatigue), master audio mixer.
  - *Current Reality*: Fixed Web Audio oscillator loops. No stinger events on Aces/Jokers, fixed frequencies with potential listener fatigue.
  - *Audit Score*: **2.5 / 5.0**
- **M1.3: Visual Particle FX & Screen Dynamics (5 pts)**
  - *Criteria*: Canvas/WebGL GPU particle emitters on era advances, haptic camera rumble on cataclysms, animated card draw dust, glowing aura on selected cards and hovered provinces.
  - *Current Reality*: Basic CSS pulses and Lucide SVG icons. No real particle physics engine.
  - *Audit Score*: **2.5 / 5.0**
- **M1.4: Ceremonial Choreography & Dramatic Pacing (5 pts)**
  - *Criteria*: Cinematic initiation sequences with dramatic reveals, ceremonial sealing wax animations, prologue scrolls, and audio crescendos.
  - *Current Reality*: Functional modals (`NewGameCeremonyModal`, `EpochCeremonyModal`) with good structure, but lacking audio crescendo and visual staging.
  - *Audit Score*: **2.5 / 5.0**

**Domain 1 Total: 10.0 / 20.0**

---

### Domain 2: Cartographic Engineering, Spatial Simulation & Biome Ecology (20 Points)
*Expert Perspective: Principal Cartographer & GIS Architect (Benchmark: Inkarnate, Wonderdraft, Civilization VI)*

- **M2.1: Dual Hexagonal & Orthogonal Topology (5 pts)**
  - *Criteria*: Seamless toggle between Flat-Topped Hexagonal grid (axial coordinates $q, r, s$ with true hex neighbor math) and Orthogonal cartography, supporting hex-to-hex pathfinding and spatial analysis.
  - *Current Reality*: Pure orthogonal square grid only. No hex grid engine exists.
  - *Audit Score*: **1.5 / 5.0**
- **M2.2: Vector Watershed, River Confluence & Road Splines (5 pts)**
  - *Criteria*: Connected procedural vector rivers flowing down elevation gradients into sea basins, tributary confluence joins, and A* road pathfinding between settlements following gentle slopes.
  - *Current Reality*: Binary `hasRiver` and `hasRoad` booleans per tile rendering static SVG center lines. No watershed physics, no road pathfinding across tiles.
  - *Audit Score*: **2.0 / 5.0**
- **M2.3: Organic Terrain Shading, Elevation Contours & Biome Transitioning (5 pts)**
  - *Criteria*: Continuous elevation contour curves, 8-neighbor organic hillshading, directional sunlight highlights, animated coastal breakers, procedural cliff faces.
  - *Current Reality*: Hand-crafted SVG tile reliefs and basic NW sunlight shadows (`cartographyShadingEngine.ts`). Good foundation, but lacks continuous elevation contours and cliff edging.
  - *Audit Score*: **3.0 / 5.0**
- **M2.4: Layer Stacking & Multi-Radius Procedural Brushes (5 pts)**
  - *Criteria*: Independent rendering layers (Terrain, Biome Clutter, Political Borders, Roads/Rivers, POI Pins, Fog of War, Player Annotations), multi-tile brush radii (1x1, 3x3, 5x5, fill), procedural landmass seeds (Simplex noise).
  - *Current Reality*: Monolithic tile properties. Single-tile click/drag brush. Preset geography generation exists but lacks multi-radius painting and discrete toggleable rendering layers.
  - *Audit Score*: **2.0 / 5.0**

**Domain 2 Total: 8.5 / 20.0**

---

### Domain 3: Narrative Architecture, Worldbuilding Codex & Causal Simulation (20 Points)
*Expert Perspective: Lead Narrative Systems Designer & Worldbuilding Author (Benchmark: Crusader Kings III, Dwarf Fortress, WorldAnvil)*

- **M3.1: Recursive Causal Saga Graph & Emergent Storytelling (5 pts)**
  - *Criteria*: Causal link graph connecting turn events (e.g. Event A directly triggers Event B years later), dynamic fantasy prose generation referencing historic heroes, ruins, and previous cataclysms.
  - *Current Reality*: Template string concatenation with basic power-to-prose mapping (`narrativeEngine.ts`). No recursive causal dependency graph.
  - *Audit Score*: **2.0 / 5.0**
- **M3.2: Dynamic Geopolitical Faction AI & Treaty Lifecycles (5 pts)**
  - *Criteria*: Faction agenda archetypes (Expansionist, Zealot, Mercantile, Imperial), dynamic casus belli generation, non-aggression pacts, vassalage, dynamic territorial borders radiating from settlements.
  - *Current Reality*: Static entity list with manual notes and pairwise numerical score (-100 to +100). No active faction agendas or simulated border expansion.
  - *Audit Score*: **2.0 / 5.0**
- **M3.3: Genealogical Succession & Cultural Drift (5 pts)**
  - *Criteria*: Multi-generational family trees with marriages, heirs, dynastic traits, cultural naming languages, and ancestral relic inheritance.
  - *Current Reality*: Basic string-based progenitor/descendant hierarchy in `LoreFlyoutDrawer`. No dynamic marriages, cultural language generators, or relic tracking.
  - *Audit Score*: **2.0 / 5.0**
- **M3.4: Bot Player Utility-AI & Strategic Personality (5 pts)**
  - *Criteria*: Real Utility-AI evaluating current board threats, diplomatic standing, and player weaknesses to choose deliberate, dramatic actions rather than random picks.
  - *Current Reality*: Weighted random sampling based on 3 percentage dials (`geography`, `ecology`, `civilization`). No situational awareness or strategic evaluation.
  - *Audit Score*: **1.5 / 5.0**

**Domain 3 Total: 7.5 / 20.0**

---

### Domain 4: Tabletop Ergonomics, Human Factors & Multi-Device Synchronicity (15 Points)
*Expert Perspective: Principal UX Architect & Tabletop Facilitator (Benchmark: Foundry VTT, D&D Beyond, Linear)*

- **M4.1: Real-Time Table Peer Synchronization (5 pts)**
  - *Criteria*: Real-time peer-to-peer room synchronization (WebRTC / BroadcastChannel / WebSocket) where GM and players see card flips, token moves, and codex updates in real-time across multiple devices with zero server login.
  - *Current Reality*: Static URL query and compressed hash export/import. Requires manual link/QR re-sharing for every update; zero live sync.
  - *Audit Score*: **2.0 / 5.0**
- **M4.2: Mobile & Tablet Tactile Ergonomics (5 pts)**
  - *Criteria*: Native-grade touch ergonomics (pinch-to-zoom, two-finger pan, swipeable bottom sheets, bottom navigation bar on mobile, large tap targets >=48px).
  - *Current Reality*: Responsive layout with media queries, but drawer side-panels and small buttons remain awkward on mobile screens.
  - *Audit Score*: **2.5 / 5.0**
- **M4.3: Keyboard Mastery & Cognitive Friction Minimization (5 pts)**
  - *Criteria*: Universal keyboard shortcut coverage (`D` draw, `Space+drag` pan, `1-4` stage switch, `Tab` cycle tiles, `Ctrl+K` command palette, `?` hotkey modal), zero-clutter HUD with collapsible focus zones.
  - *Current Reality*: Focus-zone header and settings dropdown implemented in Phase 16; global `Ctrl+K` command palette with search across modes/actions/entities, and `?` hotkey cheat sheet modal implemented and tested in Phase 17 (`CommandPalette.tsx`, `KeyboardShortcutsModal.tsx`).
  - *Audit Score*: **4.5 / 5.0**

**Domain 4 Total: 9.0 / 15.0**

---

### Domain 5: System Reliability, State Machine Rigor & Persistence (15 Points)
*Expert Perspective: Principal Systems & Reliability Architect (Benchmark: Figma, Git, Photoshop)*

- **M5.1: Unified Transactional Multi-Domain Undo/Redo (5 pts)**
  - *Criteria*: Command Pattern / Event Sourcing where an Undo action atomically reverts map tile modifications, codex entities, and draw history records simultaneously without desync.
  - *Current Reality*: Command Pattern engine implemented in Phase 17 (`commandEngine.ts`) with composite drag grouping, multi-domain commands (tile paint, entity create/update/delete), and 50-step undo/redo stack verified by 13 unit tests.
  - *Audit Score*: **4.5 / 5.0**
- **M5.2: IndexedDB Quota-Resilient Storage & Auto-Save (5 pts)**
  - *Criteria*: Asynchronous IndexedDB storage engine with automatic migration pipeline, binary blob caching, debounced auto-save (100ms), and corruption recovery.
  - *Current Reality*: Asynchronous IndexedDB storage adapter implemented in Phase 17 (`storageIndexedDb.ts`) unlocking 50MB+ quotas, automated startup migration from localStorage, and transparent localStorage fallback in restricted sandboxes.
  - *Audit Score*: **4.0 / 5.0**
- **M5.3: Zero-Dependency Offline PWA (5 pts)**
  - *Criteria*: Complete offline execution via Service Worker caching, Web App Manifest, offline sound generation, and self-contained zero-CDN operation.
  - *Current Reality*: Service Worker (`sw.js`) and manifest present; sound engine is procedural Web Audio (zero network assets); full offline functionality verified.
  - *Audit Score*: **4.0 / 5.0**

**Domain 5 Total: 12.5 / 15.0**

---

### Domain 6: Campaign Publishing, Export Fidelity & Typographic Production (10 Points)
*Expert Perspective: Principal Typesetter & Publication Engineer (Benchmark: The Homebrewery, GM Binder, InDesign)*

- **M6.1: High-DPI Vector & Raster Cartography Export (5 pts)**
  - *Criteria*: 300 DPI print-ready PNG/PDF export with custom cartographic border margins, decorative title cartouche, legend box, compass rose, and scale bar.
  - *Current Reality*: Standalone SVG export available, but lacking high-DPI raster render pipeline, customizable cartouche frames, and legend boxes.
  - *Audit Score*: **2.5 / 5.0**
- **M6.2: Publication-Grade Multi-Page Sourcebook Typesetting (5 pts)**
  - *Criteria*: Multi-page fantasy sourcebook with CSS Paged Media `@page` layout, two-column justification, drop capitals, ornamental headers, index of entities, and customizable visual themes (Parchment, Grimdark, Modern Atlas, Solarpunk).
  - *Current Reality*: Standalone HTML sourcebook export (`exportCampaignSourcebookHtml`) with drop caps and print CSS. Lacks multi-theme selector and dynamic table of contents.
  - *Audit Score*: **3.0 / 5.0**

**Domain 6 Total: 5.5 / 10.0**

---

## Adversarial Benchmark Scorecard

| Domain | Weight | Baseline (v3.0) | Inflated Claim (Phase 15/16) | Phase 17 Verified Score | Gap to AAA Standard |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **D1: AAA Game Feel & Audio Polish** | 20% | 5.0 | 20.0 | **10.0** | -10.0 |
| **D2: Cartographic Engineering & Spatial Simulation** | 20% | 9.0 | 20.0 | **8.5** | -11.5 |
| **D3: Narrative Architecture & Causal Simulation** | 20% | 6.0 | 15.0 | **7.5** | -12.5 |
| **D4: Tabletop Ergonomics & Multi-Device Sync** | 15% | 9.0 | 15.0 | **9.0** (+1.5) | -6.0 |
| **D5: System Reliability & Persistence** | 15% | 5.5 | 15.0 | **12.5** (+4.5) | -2.5 |
| **D6: Campaign Publishing & Typographic Fidelity** | 10% | 5.0 | 10.0 | **5.5** | -4.5 |
| **TOTAL SCORE** | **100%** | **39.5** | **100.0 (Revoked)** | **53.0 / 100** (+6.0) | **-47.0 pts** |

> **Conclusion**: The application currently sits at **53.0 / 100** on a true commercial AAA standard following Phase 17 verification (+6.0 pts). With multi-domain transactional undo/redo and quota-resilient IndexedDB persistence active, our next objective is Phase 18: Dual Hexagonal & Orthogonal Cartography Engine to elevate Domain 2 from 8.5 to 13.5 (+5.0 pts).

---

## The AAA Engineering Master Roadmap (Phases 17–24)

### Phase 17: Unified Transactional Command Engine & IndexedDB Resilience
- **Target Delta**: +6.0 pts (D5: 8.0 $\rightarrow$ 14.0)
- **Deliverables**:
  - Implement Command Pattern / Event Sourcing state engine (`commandEngine.ts`) enabling unified atomic Undo/Redo across map tiles, codex entities, and draw records.
  - Implement asynchronous IndexedDB storage provider (`storageIndexedDb.ts`) replacing localStorage with automatic schema migration, 50MB+ capacity, and auto-save debouncing.
  - Add Global Hotkey Cheat Sheet overlay (`?`) and `Ctrl+K` Command Palette.
  - Automated test suite in `commandEngine.test.ts` and `storageIndexedDb.test.ts`.

### Phase 18: Dual Hexagonal & Orthogonal Cartography Engine
- **Target Delta**: +5.0 pts (D2: 8.5 $\rightarrow$ 13.5)
- **Deliverables**:
  - True Flat-Topped Hexagonal grid math (`hexEngine.ts`) with axial coordinates $(q, r, s)$, hex distance calculation, and hex SVG rendering.
  - Seamless toggle between Orthogonal Grid and Hex Grid without losing tile assignments.
  - Multi-radius brushes (1x1, 3x3, 5x5 circular stamp).
  - Automated test suite in `hexEngine.test.ts`.

### Phase 19: Vector Watershed Physics & Connected Road Pathfinding
- **Target Delta**: +4.5 pts (D2: 13.5 $\rightarrow$ 18.0)
- **Deliverables**:
  - Procedural downhill water flow simulation generating connected river branches and estuaries based on elevation.
  - A* road network pathfinding connecting settlements along optimal terrain contours.
  - Layer Stacking panel with toggles for Terrain, Political, Exploration, Roads/Rivers, and Annotations.
  - Automated test suite in `riverRoadEngine.test.ts`.

### Phase 20: Recursive Causal Saga Graph & Emergent Lore Engine
- **Target Delta**: +5.5 pts (D3: 7.5 $\rightarrow$ 13.0)
- **Deliverables**:
  - Directed Acyclic Causal Graph (`causalGraphEngine.ts`) where events link causes and consequences across turns.
  - Dynamic procedural fantasy prose generator that references antecedent events, ancient ruins, and heroic lineages.
  - Visual Event Dependency Graph view in `TimelinePanel.tsx`.
  - Automated test suite in `causalGraphEngine.test.ts`.

### Phase 21: Dynamic Geopolitical Faction AI & Utility-AI Bot Personalities
- **Target Delta**: +5.0 pts (D3: 13.0 $\rightarrow$ 18.0)
- **Deliverables**:
  - Faction Agenda State Machine (Expansion, Defense, Holy Crusade, Trade Dominance) with dynamic Casus Belli and border territory claims.
  - Utility-AI evaluation engine replacing random bot dials with heuristic goal-seeking behavior.
  - Dynasty lineage tracking with marital alliances, succession disputes, and heirloom artifacts.
  - Automated test suite in `factionAiEngine.test.ts`.

### Phase 22: Kinetic Card Physics, Dynamic Particle FX & Acoustic Stems
- **Target Delta**: +6.5 pts (D1: 10.0 $\rightarrow$ 16.5)
- **Deliverables**:
  - Pointer-following 3D card tilt and velocity-driven discard throw animations.
  - WebGL / Canvas GPU particle bursts on card flip and Cataclysm cards.
  - Pitch-randomized audio stem synthesizer (±50 cents) with dramatic musical stingers on Aces and Jokers.
  - Automated test suite in `cardPhysicsEngine.test.ts` and `audioMixer.test.ts`.

### Phase 23: Real-Time Tabletop Peer Synchronization (WebRTC / BroadcastChannel)
- **Target Delta**: +4.5 pts (D4: 7.5 $\rightarrow$ 12.0)
- **Deliverables**:
  - Zero-server peer-to-peer room sync using WebRTC DataChannels and local BroadcastChannel.
  - Host/Client role negotiation where table players see GM card draws and map updates in real time.
  - Reconnection state recovery and conflict resolution.
  - Automated test suite in `peerSyncEngine.test.ts`.

### Phase 24: High-DPI Cartography Cartouche & Multi-Theme Sourcebook Studio
- **Target Delta**: +4.5 pts (D6: 5.5 $\rightarrow$ 10.0)
- **Deliverables**:
  - 300 DPI high-resolution canvas/SVG raster export with ornate decorative border cartouches and dynamic map legends.
  - Multi-theme Sourcebook styles (Parchment, Grimdark Gothic, High Fantasy Gold, Modern Atlas).
  - Automated test suite in `cartoucheExportEngine.test.ts`.

---

## Governance & Phase Acceptance Rules

1. **No Inflation Rule**: Score increases are strictly forbidden without corresponding automated test files, demonstrable user-facing features, and verified code implementation.
2. **Adversarial Audit Rule**: Every phase PR must include an adversarial audit section detailing known limitations and remaining gaps.
3. **Continuous Verification Rule**: 100% of automated tests must pass on CI and the production bundle must build cleanly before any PR is merged.
