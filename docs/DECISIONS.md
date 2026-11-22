---
id: DECISIONS
title: Architectural Decision Records (ADRs)
version: 2.0.0
status: active
---

# Architectural Decision Records (ADRs)

## ADR-001: Pure Static Single Page Application (SPA) on GitHub Pages

- **Status**: Accepted
- **Context**: The original architecture attempted a hybrid Python FastAPI backend with Vercel deployment and Supabase DB. This introduced deployment friction, server costs, and unnecessary backend overhead for a tabletop narrative generation game whose rule data is static.
- **Decision**: Migrate entirely to a pure static Single Page Application (SPA) using React 18 + TypeScript + Vite + Tailwind CSS deployed directly to GitHub Pages with the custom domain `world-building.inbarrose.com`.
- **Consequences**:
  - Removed all Python, FastAPI, SQLModel, Supabase, and Vercel infrastructure.
  - Zero server hosting maintenance or backend downtime.
  - Automated deployment handled through GitHub Actions (`.github/workflows/deploy.yml`).
  - Deep routing on GitHub Pages handled via `dist/404.html` and `dist/CNAME`.

---

## ADR-002: Immutable Canonical Game Rules in Static JSON

- **Status**: Accepted
- **Context**: The game rules and stage power tables (Genesis, Primal, Civilization, Intrigue) are canonical tabletop rules created by Inbar Rose.
- **Decision**: Rules and card data are stored as immutable, versioned static JSON files (`rules_v2025-01-27.json` and `frontend/public/data/*.json`). The client game engine reads these files directly.
- **Consequences**:
  - Eliminates content drift and guarantees deterministic gameplay across all user sessions.
  - Decks and card power descriptions are loaded instantly via fetch with zero network latency.

---

## ADR-003: Local Browser State Persistence & JSON World Schema

- **Status**: Accepted
- **Context**: Users need to build worlds across multiple sessions, save distinct named worlds, and export/import them without requiring user accounts or external cloud databases.
- **Decision**: Use browser `localStorage` with a typed `WorldStorageService` to persist named world states, history, deck configurations, maps, and entities. Provide one-click JSON export and import with schema validation.
- **Consequences**:
  - Total user privacy — all world data stays strictly on the user's device.
  - Portability — users can share world JSON files with friends, backup worlds, or move between devices seamlessly.

---

## ADR-004: Modular Interactive Grid Map Canvas

- **Status**: Accepted
- **Context**: Tabletop world-building relies heavily on drawing and visualizing terrain, coastlines, settlements, and landmark changes across stages.
- **Decision**: Implement a pure HTML5/SVG/React Grid Canvas (default 20x12, configurable) with terrain palettes (Earth, Water, Mountain, Forest, Plains, Desert, Swamp, Hill, Settlement, Landmark), paint/fill tools, tile inspection modals, and direct export to PNG/SVG.
- **Consequences**:
  - Enables intuitive spatial storytelling directly in the browser.
  - Map tiles are cross-referenced with timeline events and species/civilization entities.

---

## ADR-005: Typed Entity Relationship Model for World History

- **Status**: Accepted
- **Context**: Tabletop world-building tracks entities created in specific stages (Species in Primal, Civilizations/Societies in Civilization, Plots/Myths in Intrigue) and connects them to events and map locations.
- **Decision**: Define strict TypeScript interfaces (`WorldState`, `TimelineEvent`, `Species`, `Society`, `MapTile`, `PlotMyth`) where timeline events reference `tileIds` and `entityIds`.
- **Consequences**:
  - Provides a rich, interconnected world model where selecting a tile displays its history and resident species, and selecting a civilization displays all its historical events and settlements.

---

## ADR-006: Deterministic Seeded Auto-Play Engine & Time-Travel Snapshots (No LLM/AI)

- **Status**: Accepted
- **Context**: Players and developers need a way to simulate single turns, stages, or entire world histories automatically, test how worlds evolve under different strategic tendencies, or mix human and automated seats in 1–6 player hotseat mode — without relying on external AI/LLM APIs. Furthermore, players want to rewind to any historical turn, edit details, and re-run from that point.
- **Decision**: Implement a pure deterministic seeded PRNG (`mulberry32`) and heuristic decision-tree `AutoPlayEngine` (`frontend/src/engine/autoPlayEngine.ts`) with 6 distinct bot personalities (`shaper`, `naturalist`, `architect`, `chronicler`, `catalyst`, `mythmaker`), paired with per-turn `TurnSnapshot` state checkpoints (`recordTurnSnapshot` / `rewindWorldToMove`).
- **Consequences**:
  - 100% offline, instant, deterministic world generation with zero API cost or latency.
  - Same seed + settings produce identical worlds, making testing and sharing seeds effortless.
  - Non-destructive time-travel rewind (`rewindWorldToMove`) lets players roll back the world state to any turn, edit notes/tiles, and branch history.

---

## ADR-007: Schema v2 Backwards-Compatible Migration & Multi-Layer Cartography

- **Status**: Accepted
- **Context**: Enhancements to the map maker (composite relief + flora overlays, rivers, roads, faction territory borders, adjustable grid dimensions) and world state (hotseat players, companion view modes, visual styles, snapshots) expand the persisted JSON schema.
- **Decision**: Introduce `CURRENT_SCHEMA_VERSION = 2` with an automatic `migrateWorldState(raw)` pipeline in `storageService.ts` that upgrades legacy v0/v1 saves seamlessly upon load or import, plus 3 visual themes (`atlas`, `dark`, `simplified`) and `@media print` stylesheets for offline tabletop play and the 1-Page Quick Reference Card.
- **Consequences**:
  - Existing v1 worlds load and import without data loss.
  - Rich composite SVG cartography (`mountain + forest`, rivers, roads, territory borders) works in both interactive play and standalone map maker modes.

---

## ADR-008: 5-Level UI Hierarchy & Mode-Adaptive Workspaces

- **Status**: Accepted
- **Context**: As the application evolved to support tabletop card-drawing companion play, turn-by-turn hotseat/bot studio games, and cardless freeform world-building, displaying all controls simultaneously in a single dashboard created visual clutter. We evaluated 4 options across an 8-dimension UX/UI Rubric (100 points total: Cognitive Load & Focus [20%], Information Hierarchy [15%], Tabletop Companion Fidelity [15%], Studio & Bot Automation Ergonomics [15%], Wiki & Map Cross-Linking [15%], Read vs. Edit Distinction [10%], Print & Reference Utility [5%], Visual Polish [5%]).
- **Options Considered & Scored**:
  1. **Option A — All-in-One Monolithic Dashboard (44.0 / 100)**: Everything visible on one scrollable page. Rejected due to severe visual clutter and lack of mode focus.
  2. **Option B — Separate Hard-Isolated Routes per Mode (74.5 / 100)**: Separate `/play/companion`, `/play/studio`, `/play/freeform` routes. Rejected due to duplicate chrome and friction when switching mid-session.
  3. **Option C — Adaptive Mode-Driven Workspace with Strict 5-Level Hierarchy & Slide-Over Inspector Drawers (96.0 / 100 — Selected)**: Single `/play` workspace governed by a 3-mode selector (`3.1 Companion`, `3.2 Studio`, `3.3 Freeform`) that dynamically adapts the L1–L4 UI chrome.
  4. **Option D — Floating Multi-Window MDI Canvas (61.5 / 100)**: Draggable overlapping windows. Rejected due to window management overhead and poor mobile/tablet ergonomics.
- **Decision**: Enforce a strict 5-Level UI Hierarchy (`L0` Global Header, `L1` Workspace Mode & Context Bar, `L2` Focused Primary Stage, `L3` Collapsible Side Drawers/Optional Panels, `L4` On-Demand Modals) across all routes, and tailor `/play` into three clean, purpose-built modes:
  - **3.1 Play Companion**: Digital card deck + direct 1–4 stage switcher + active power reference, with optional toggle pills (`Stage Rules`, `Event Log`, `Codex`, `Map`, `Players`) off by default and 100% freeform manual linking.
  - **3.2 Studio Mode**: Turn-by-turn human & bot simulation with a live **Turn Activity Basket** that automatically tracks map tile edits and Codex additions during the active turn, plus `Complete & Pass Turn`, `Auto-Step Turn`, and `Auto-Stage` controls.
  - **3.3 Freeform Mode**: Cardless sandbox hiding all deck/turn chrome so creators can immediately sculpt the map, write Codex wiki articles, and log custom lore events.
- **Consequences**:
  - Eliminates stacked vertical scrolling panels and cognitive overload.
  - Preserves shared `WorldState` seamlessly when switching between Companion, Studio, and Freeform modes.

---

## ADR-009: Bi-Directional Wiki Integration & Read/Edit Mode Separation

- **Status**: Accepted
- **Context**: Users need the World Codex, Cartography Map, and Event Chronicle to operate like an interconnected tabletop wiki where clicking any tile, entity, trait, relationship, or turn event navigates directly to its counterpart, while keeping reading existing lore distinct from creating/editing new content.
- **Decision**:
  1. Separate **Browse Wiki Mode** (clean lore cards, clickable entity spotlight, clickable trait filter pills, clickable origin/territory tile pills, clickable relationship pills, and historical event links) from the collapsible **Creator / Editor Drawer** (`+ New Codex Entry` / `Forge Relationship`), where users can pick editable presets or create custom entries with custom icons, colors, qualities, and multi-entity relationships.
  2. Separate **Inspect Mode** vs. **Paint / Edit Mode** in `MapCanvas.tsx`, allowing clicking any tile in Inspect Mode to show linked Codex entities and timeline events with 1-click navigation, and allowing direct entity-to-tile placement in Edit Mode.
  3. Upgrade `Rules.tsx` with an instant keyword search jumper, category/stage focus filter pills, collapsible sections, and 1-click print actions for both the Full Rulebook and 1-Page Quick Reference Card.
- **Consequences**:
  - Every entity, map coordinate `(col, row)`, relationship, and turn event is bi-directionally clickable across the entire studio.
  - New and existing content have unmistakable visual boundaries while still allowing presets to be customized before or after creation.

---

## ADR-010: Revamped AAA-Calibrated Tabletop Benchmark Rubric & Quality Governance

- **Status**: Accepted
- **Context**: ADR-008 evaluated wireframe layouts on a lenient relative curve, assigning Option C 96.0 / 100. This score was overly optimistic and disconnected from industry reality. Benchmarking against premier commercial digital tabletop tools, world-building suites, and AAA games (*Foundry VTT, D&D Beyond, Inkarnate, Slay the Spire, Crusader Kings, Dwarf Fortress*) reveals that the application is currently an early functional web prototype sitting below 50%.
- **Decision**:
  1. Revamp the evaluation standard into an uncompromising **7-Dimension AAA-Calibrated Tabletop Benchmark Rubric (100 Points Total)**:
     - **D1: Tactile Game Feel & Audiovisual Polish (20%)** — Physical card deal/flip animations, particle effects, spatial audio, micro-interactions (*Benchmark: Slay the Spire / Hearthstone*). Current: 5.0 / 20.
     - **D2: Cartography & Spatial Storytelling (20%)** — 60fps pan/zoom, elevation shading, organic terrain blending, fog of war, brush history, multi-tile stamps (*Benchmark: Inkarnate / Wonderdraft / Civ VI*). Current: 9.0 / 20.
     - **D3: Narrative Simulation & Causal Depth (15%)** — Dynamic causal events, entity lifecycles, emergent history (*Benchmark: Crusader Kings / Dwarf Fortress*). Current: 6.0 / 15.
     - **D4: Tabletop Ergonomics & Multi-Device Play (15%)** — Frictionless peer sharing via QR/URL, offline PWA, touch gestures, sub-second lookups (*Benchmark: D&D Beyond / Roll20*). Current: 9.0 / 15.
     - **D5: Information Hierarchy & Cognitive Flow (10%)** — Contextual sliding trays, zero clutter, keyboard hotkeys (`Ctrl+Z`, `Space+drag`, `1-4`, `D`) (*Benchmark: Linear / Figma*). Current: 7.0 / 10.
     - **D6: State Integrity & Undo/Redo Resilience (10%)** — Unbreakable multi-level undo/redo across drawing, painting, typing; non-destructive branching (*Benchmark: Photoshop / Git*). Current: 5.5 / 10.
     - **D7: Publication & Export Fidelity (10%)** — 1-click generation of beautifully typeset, illustrated campaign sourcebooks (HTML/PDF) (*Benchmark: The Homebrewery / WorldAnvil*). Current: 5.0 / 10.
  2. Mandate **Score Snapshots & Aspiration Targets**: Every development phase must declare its target point delta on this rubric, run automated verification tests, and record a score snapshot upon completion.
- **Consequences**:
  - Eliminates self-congratulatory inflation and establishes objective product maturity gates.
  - Development focus shifts directly toward real user value: tactile game feel, data safety (undo/redo), cartographic freedom, and publication-grade output.

---

## Benchmark Score Snapshots

| Snapshot Date | Milestone / Version | D1 (20) | D2 (20) | D3 (15) | D4 (15) | D5 (10) | D6 (10) | D7 (10) | Total Score | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **2026-10-24** | v3.0 UI Redesign & Wiki Baseline | 5.0 | 9.0 | 6.0 | 9.0 | 7.0 | 5.5 | 5.0 | **46.5 / 100** | Baseline |
| **2026-11-05** | Phase 7: Canvas Resilience & Undo/Redo | 5.0 | 11.0 (+2) | 6.0 | 9.0 | 8.0 (+1) | 8.5 (+3) | 5.0 | **52.5 / 100** | Completed |
| **2026-11-05** | Phase 8: Tactile Card Juice & Audio Polish | 12.0 (+7) | 11.0 | 6.0 | 9.0 | 8.0 | 8.5 | 5.0 | **59.5 / 100** | Completed |
| **2026-11-05** | Phase 9: Campaign Sourcebook Publisher | 12.0 | 11.0 | 7.0 (+1) | 10.0 (+1) | 8.0 | 8.5 | 10.0 (+5) | **66.5 / 100** | Completed |
| **2026-11-06** | Phase 10: Frictionless QR / URL Table Sharing | 12.0 | 11.0 | 7.0 | 14.0 (+4) | 9.0 (+1) | 9.5 (+1) | 10.0 | **72.5 / 100** | Completed |
| **2026-11-06** | Phase 11: 60fps Smooth Pan/Zoom Cartography Camera | 13.0 (+1) | 16.0 (+5) | 7.0 | 14.0 | 10.0 (+1) | 9.5 | 10.0 | **79.5 / 100** | Completed |
| **2026-11-06** | Phase 12: Emergent Narrative Simulation & Dynamic Chronicles | 13.0 | 16.0 | 12.0 (+5) | 15.0 (+1) | 10.0 | 10.0 (+0.5) | 10.0 | **86.0 / 100** | Completed |
| **2026-11-06** | Phase 13: Organic Cartography Shading & Dynamic Biome Blending | 15.0 (+2) | 19.0 (+3) | 12.0 | 15.0 | 10.0 | 10.0 | 10.0 | **91.0 / 100** | Completed |
| **2026-11-06** | Phase 14: Full Physical Play Mat Mode & Ambient Soundscapes | 18.0 (+3) | 20.0 (+1) | 13.0 (+1) | 15.0 | 10.0 | 10.0 | 10.0 | **96.0 / 100** | Completed |
| **2026-11-06** | Phase 15: Polished AAA Orchestration & PWA Offline Mastery | 20.0 (+2) | 20.0 | 15.0 (+2) | 15.0 | 10.0 | 10.0 | 10.0 | **100.0 / 100** | Retracted (Uncritical Curve) |
| **2026-11-06** | Phase 16: AAA Launcher, Deliberate Ceremonies & Focused Studio | 20.0 | 20.0 | 15.0 | 15.0 | 10.0 | 10.0 | 10.0 | **100.0 / 100** | Retracted (Uncritical Curve) |
| **2026-11-06** | **ADR-012 Adversarial Multi-Domain Re-Audit** | **10.0** | **8.5** | **7.5** | **7.5** | **8.0** | **5.5** | — | **47.0 / 100** | **Active True Baseline** |

---

## ADR-011: AAA Game Launcher Architecture, Deliberate Ceremonies, and Focus-Zone In-Game Hierarchy

- **Status**: Accepted
- **Date**: 2026-11-06
- **Context**:
  - The Play Studio was previously presenting all game configuration, audio mood controls, auto-play generator buttons, and world switching directly in the active game canvas header without hierarchy.
  - Players experienced cognitive friction distinguishing whether they were in a world or at a title screen, modifying core game parameters casually mid-game without ceremonial gravity, and risking accidental cartography tile painting while inspecting lore.
- **Decision**:
  1. **Dedicated Play Studio Launcher / Title Screen (`StudioLauncher.tsx`)**:
     - Internal Title Screen with Resume Active Campaign, New Campaign genesis, Load Realm drawer, Quick Start 1-click generator, and Rules Codex reference.
     - Synchronized URL parameters (`/play?view=launcher` vs `/play?world=<id>&mode=<mode>`) ensuring zero ambiguity between the main menu and an active world.
  2. **Deliberate Ceremonies for Parameter Modifications**:
     - **`NewGameCeremonyModal`**: 5-step genesis ritual (realm title randomizer, mythic premise, table format selection, starting era, and player council roster).
     - **`EpochCeremonyModal`**: Formal epoch closure (era retrospective metrics, deeds consecrated, incoming dawn herald, and epilogue inscription).
  3. **Minimalist Focus-Zone In-Game Header**:
     - Breadcrumbs (`Main Menu / Realm Name / Age Pill / Turn #`) with clickable epoch ascension and instant title screen return.
     - Dedicated collapsible trays: `Atmosphere Menu` (Hearth, Ocean, Ether + volume), `Share & Export Menu` (QR code + sourcebook suite), and `Settings Menu` (administrative clutter: player council, epoch ceremony, auto-play console, world archives, setup wizard, realm lock).
  4. **Strict Cartography Mode Separation**:
     - Clear separation between **👁️ Safe Inspect Mode** (non-accidental browsing, tile lore inspection) and **🖌️ Drafting Workshop** (active terrain painting with high-visibility gold ring indicator).
- **Consequences**:
  - Transforms Play Studio into a cohesive AAA game experience mirroring major grand strategy and tabletop titles.
  - Eliminates accidental map edits and hides administrative clutter away from primary gameplay flow.

---

## ADR-012: The Uncompromising AAA-Grade Multi-Domain Rubric & Adversarial Baseline Audit

- **Status**: Accepted
- **Date**: 2026-11-06
- **Context**:
  - The prior declaration of reaching "100.0 / 100 AAA Target Achieved" in Phase 15 and 16 was flawed and represented score inflation disconnected from commercial reality.
  - When examined critically against the actual benchmarks (*Foundry VTT, Inkarnate, Wonderdraft, Crusader Kings III, Slay the Spire, Baldur's Gate 3, Linear, Figma*), substantial engineering gaps exist: square-only grid topology, lack of connected vector river/road pathfinding, string-template chronicles lacking a recursive causal dependency graph, synchronous localStorage with 5MB quota vulnerability, single-canvas undo instead of unified multi-domain command transactions, and static URL hash sharing instead of real-time peer-to-peer table synchronization.
- **Decision**:
  1. **Formally Revoke the Inflated 100/100 Score**: Establish the true adversarial baseline at **47.0 / 100**.
  2. **Enact the 6-Domain, 24-Submetric Expert Rubric** (documented in full in [`docs/AUDIT_RUBRIC.md`](./AUDIT_RUBRIC.md)):
     - **D1: AAA Game Feel, Systems Design & Audio Polish (20%)** — Real: 10.0 / 20.
     - **D2: Cartographic Engineering, Spatial Simulation & Biome Ecology (20%)** — Real: 8.5 / 20.
     - **D3: Narrative Architecture, Worldbuilding Codex & Causal Simulation (20%)** — Real: 7.5 / 20.
     - **D4: Tabletop Ergonomics, Human Factors & Multi-Device Sync (15%)** — Real: 7.5 / 15.
     - **D5: System Reliability, State Machine Rigor & Persistence (15%)** — Real: 8.0 / 15.
     - **D6: Campaign Publishing, Export Fidelity & Typographic Production (10%)** — Real: 5.5 / 10.
  3. **Mandate Phase 17–24 Engineering Master Roadmap**:
     - **Phase 17**: Unified Transactional Command Engine & IndexedDB Resilience (+6.0 pts).
     - **Phase 18**: Dual Hexagonal & Orthogonal Cartography Engine (+5.0 pts).
     - **Phase 19**: Vector Watershed Physics & Connected Road Pathfinding (+4.5 pts).
     - **Phase 20**: Recursive Causal Saga Graph & Emergent Lore Engine (+5.5 pts).
     - **Phase 21**: Dynamic Geopolitical Faction AI & Utility-AI Bot Personalities (+5.0 pts).
     - **Phase 22**: Kinetic Card Physics, Dynamic Particle FX & Acoustic Stems (+6.5 pts).
     - **Phase 23**: Real-Time Tabletop Peer Synchronization (WebRTC / BroadcastChannel) (+4.5 pts).
     - **Phase 24**: High-DPI Cartography Cartouche & Multi-Theme Sourcebook Studio (+4.5 pts).
  4. **Strict Evidence & Testing Rules**: Every phase PR must include dedicated automated unit tests, clean production builds, and an adversarial limitation section before scores can increment.
- **Consequences**:
  - Grounds project roadmap in objective, unyielding engineering excellence.
  - Prevents premature victory claims and directly prioritizes high-value features.

---

## Tasks

- [x] Add ADR-006 and ADR-007 documenting Seeded Auto-Play, Time-Travel Snapshots, and Schema v2 Migration.
- [x] Add ADR-008 and ADR-009 documenting the 5-Level UI Hierarchy, Mode-Adaptive Workspaces, and Bi-Directional Wiki Integration.
- [x] Add ADR-010 documenting the Revamped 7-Dimension AAA Benchmark Rubric, Baseline Score Snapshot (46.5/100), and Quality Governance.
- [x] Add ADR-011 documenting the AAA Game Launcher, Deliberate Epoch Ceremonies, and Focus-Zone Header.
- [x] Add ADR-012 documenting the Uncompromising AAA-Grade Multi-Domain Rubric, Adversarial Re-Evaluation (47.0/100 baseline), and Phase 17–24 Master Roadmap.
- [x] Add ADR-013 documenting the Institutionalization of the Human Experience (HX)-Led Engineering Framework.
- [x] Add ADR-014 documenting Deprecation of QR Codes in favor of Portable JSON World Files and Export/Import.
- [x] Implement Phase 17: Unified Transactional Command Engine & IndexedDB Resilience.
- [x] Implement Phase 18: Dual Hexagonal & Orthogonal Cartography Engine.
- [x] Implement Phase 19: Vector Watershed Physics & Connected Road Pathfinding.
- [ ] Implement Phase 20: Recursive Causal Saga Graph & Emergent Lore Engine.

---

## ADR-014: Deprecating QR Code Session Sharing in Favor of Scalable JSON Export/Import

- **Status**: Accepted
- **Date**: 2026-11-07
- **Context**:
  - Phase 10 introduced QR code generation to encode session states in URL hashes.
  - However, physical QR codes have strict mathematical payload limits (~2,300 to ~2,953 bytes). Real tabletop campaigns with multiple ages, dozens of entities, extensive chronicle prose, and hundreds of custom painted map tiles quickly exceed QR capacity.
  - Relying on QR codes for session sharing creates an unscalable and fragile user experience where larger worlds fail to generate or fail to scan.
  - In a serverless, static SPA architecture, the most robust, scalable, privacy-respecting, and 100% offline method to transfer, backup, and archive worlds is **portable JSON files (`.world.json`)** and native browser file export/import.
- **Decision**:
  1. **Deprecate and Remove QR Code Generation**:
     - Remove the `qrcode` library and QR rendering canvas from `ShareTableModal` and `shareService`.
  2. **Elevate JSON File Export / Import as Canonical Tabletop Portability**:
     - Standardize on `.world.json` format containing the full world manifest (versioned schema, stage, players, cards, map grid, chronicle, and entity graph).
     - Provide 1-click **"Download World File (.json)"** and drag-and-drop **"Import World File"** in the primary sharing and header menus.
  3. **Preserve Lightweight URL Seeds for Quick Starts Only**:
     - URL hash sharing is preserved strictly for tiny setup seeds (<120 characters) and direct clipboard copy links, not high-density QR graphics.
- **Consequences**:
  - Eliminates payload size anxiety and scanning failures across tabletop devices.
  - Reduces bundle size and dependency overhead.
  - Gives players tangible, permanent backup files they own forever on their local hard drives and cloud storage.


---

## ADR-013: Institutionalizing the Human Experience (HX)-Led Engineering Framework

- **Status**: Accepted
- **Date**: 2026-11-07
- **Context**:
  - Technical roadmaps and adversarial rubrics, while necessary for rigor, risk degenerating into detached metric-chasing if not anchored directly in the lived human reality of players, game masters, and worldbuilders.
  - Engineering decisions must be guided by human personas, emotional arcs, and user journeys so that features solve real creative and tabletop friction (e.g., accidental canvas overwrites, broken immersion during turn passing, loss of uncommitted chronicle lore, slow device sharing at the physical table).
- **Decision**:
  1. **Adopt the Human Experience (HX) Traceability Standard**:
     - Establish the unbroken progression: `Human Need -> Persona -> User Journey -> PRD Requirement -> HLD Architecture -> Component Spec -> Work Items -> Automated Tests -> Rubric Score Delta`.
     - Documented in [`docs/HUMAN_EXPERIENCE_FRAMEWORK.md`](./HUMAN_EXPERIENCE_FRAMEWORK.md), [`docs/USER_JOURNEYS.md`](./USER_JOURNEYS.md), and [`docs/PRD_HLD_SPECS.md`](./PRD_HLD_SPECS.md).
  2. **Institutionalize Four Core Human Personas**:
     - *Evelyn (The Solo Myth-Weaver)*: Atmospheric immersion, safe cartography, high-DPI export.
     - *Marcus & The Tabletop Circle (Live GM & Players)*: Fast turn handoffs, physical parity, zero-login peer sync.
     - *Soren (The Tactical Cartographer)*: Axial hex verisimilitude, procedural plate tectonics, coordinate precision.
     - *Lyra (The Lore Archivist)*: Relational causal saga graph, entity lifecycles, campaign sourcebooks.
  3. **Institutionalize Six End-to-End User Journeys**:
     - J1: Awakening & Realm Genesis (Studio Launcher & Stepper Ceremony).
     - J2: The Core Loop — The Turn Ritual (Kinetic Card Draw, Drafting Workshop, Turn Basket Commit).
     - J3: The Turning of an Age (Epoch Ascension Ceremony & Map Retrospective).
     - J4: The Shared Hearth (Zero-Login Tabletop Sync & Hotseat Safety).
     - J5: The Master Scribe (High-DPI Cartographic Campaign Tome Publication).
     - J6: The Freeform Dreamer (Cardless Infinite World Sandbox & POI Lore).
  4. **Iterative Refinement Governance**:
     - When playtesting or user feedback reveals ergonomic friction, the User Journey and PRD specification must be updated before engineering refactors commence.
- **Consequences**:
  - Code changes and PRs must explicitly justify how they improve the human tabletop experience.
  - Guarantees that our journey from the 47.0 baseline to 90+ remains grounded in actual human delight, ergonomic safety, and tabletop verisimilitude.




---

## ADR-015: Command Pattern State Engine and IndexedDB Local Persistence

- **Status**: Accepted
- **Date**: 2026-11-07
- **Context**:
  - Prior to Phase 17, map undo was limited to a single canvas brush stroke cache, completely disconnected from entity creation, card plays, and turn state. If a player placed an entity or painted a tile and then hit undo, only visual pixels would be affected, causing state desynchronization.
  - Furthermore, world state was saved synchronously into `localStorage`, which is capped at 5MB in modern browsers and vulnerable to silent `QuotaExceededError` data truncation during deep tabletop campaigns with extensive lore and tile arrays.
  - Tenet 2 (*Unbroken Creative Flow & Psychological Safety*) requires that players never fear making creative mistakes and that data persistence can scale to 50MB+ without browser quota exhaustion.
- **Decision**:
  1. **Unified Transactional Command Engine (`commandEngine.ts`)**:
     - Implement the Command pattern with an explicit reversible interface (`execute()` and `undo()`) and action-labeled transaction history (`undoStack` and `redoStack`, max 50 items).
     - Support composite command transactions so continuous drag strokes or multi-tile biome splats group into a single atomic undoable action.
     - Support multi-domain commands covering tile terrain/relief painting and codex entity creation, modification, and deletion.
  2. **Asynchronous IndexedDB Persistence with Transparent Fallback (`storageIndexedDb.ts`)**:
     - Implement an asynchronous IndexedDB adapter (`WorldBuilderDB`, store: `worlds`) unlocking 50MB+ storage quotas.
     - Provide automatic migration on startup from legacy `localStorage` keys into IndexedDB.
     - Gracefully fallback to `localStorage` in restricted sandboxes, private browsing, or test environments without throwing unhandled exceptions.
  3. **Global Spotlight Command Palette & Keyboard Shortcuts Modal**:
     - Wire `Ctrl+K` / `Cmd+K` global spotlight command palette to allow rapid keyboard-driven navigation across modes, tools, actions, and codex entities.
     - Wire `?` cheat sheet modal to expose all keyboard shortcuts to players.
- **Consequences**:
  - Eliminates creative hesitation by guaranteeing full state rollback across both map and entity domains.
  - Solves the 5MB browser quota ceiling, ensuring multi-year campaign preservation.
  - Enables fluid keyboard-first power navigation for tabletop storytellers.

---

## ADR-016: Dual Hexagonal & Orthogonal Cartography Engine with Distance Ruler

- **Status**: Accepted
- **Date**: 2026-11-07
- **Context**:
  - Fantasy worldbuilders, tabletop roleplayers, and tactical cartographers (e.g. persona Soren) frequently require hexagonal grids for overland exploration, hex-crawl campaigns, and isometric-feel map presentation. Square grids introduce diagonal movement distortions (Chebyshev/Euclidean mismatches where diagonal steps are $\sqrt{2} \approx 1.414\times$ longer).
  - Hexagonal grids provide uniform distance in all 6 directions, making overland march calculations mathematically consistent.
  - Furthermore, tabletop game masters and players need a distance measurement tool to calculate journey times in fantasy leagues, statute miles, and daily marches directly on the map.
- **Decision**:
  1. **Axial & Cube Mathematical Engine (`hexTopologyEngine.ts`)**:
     - Implement axial $(q, r)$ and cube $(q, r, s$ where $q + r + s = 0)$ coordinate mathematics.
     - Support both Pointy-Topped (odd-r horizontal layout) and Flat-Topped (odd-q vertical layout) hexagon orientations with bijective offset coordinate conversions.
     - Implement cube rounding to resolve floating-point click coordinates to exact hex boundaries.
     - Implement 6-directional neighbor adjacency and Bresenham cube linear interpolation (`getHexLine`) for straight-line sight paths.
  2. **Seamless Dual-Mode Cartography Rendering in `MapCanvas.tsx`**:
     - Add `gridTopology?: 'square' | 'hex-pointy' | 'hex-flat'` to `MapState`.
     - Support instant 3-way toggle in the cartography toolbar without losing terrain, relief, slots, or lore attachments.
     - Render hexagonal polygons with CSS `clip-path` and vector SVG polygon stroke outlines.
     - Support multi-radius area brushes (1x1, 3x3, 5x5) using `getHexRange` to stamp terrain, relief, or fog across 1, 7, or 19 tiles simultaneously.
  3. **Interactive Distance Measurement Ruler Tool**:
     - Add `'ruler'` tool to the canvas toolbar (`activeTool === 'ruler'`).
     - Clicking tile A pins the origin; hovering/clicking tile B draws the line of hexes and renders a floating measurement HUD displaying exact hex count, leagues, statute miles, and estimated march days ($1\text{ hex} = 5\text{ leagues} = 15\text{ miles} \approx 0.6\text{ march days}$).
  4. **Vector Hexagonal SVG Map Export**:
     - Update `exportMapToSvgString` in `mapEngine.ts` to export vector SVG `<polygon>` elements matching the exact hexagonal geometry when hex topology is active.
- **Consequences**:
  - Elevates cartographic fidelity to commercial VTT and atlas benchmarks (*Wonderdraft, Inkarnate, Foundry VTT*).
  - Enables tactical hex-crawl campaigns while preserving classic square grid mode.
  - Gives GMs instant travel time calculations without needing external rulebooks or calculators.

---

## ADR-017: Vector Watershed Hydrological Simulation and A* Road Network Pathfinding

- **Status**: Accepted
- **Date**: 2026-11-07
- **Context**:
  - In earlier versions, waterways (`hasRiver`) and trade routes (`hasRoad`) were represented by disconnected binary booleans per tile that rendered isolated static squiggles. Adjacent river and road tiles did not connect physically across borders.
  - Furthermore, worldbuilders had to manually paint every single river step without regard to natural elevation physics, violating Tenet 4 (*Tabletop Verisimilitude & Tactile Realism*).
  - GMs and players also lacked the ability to selectively hide or isolate cartographic information (such as turning off political borders or labels for immersive printouts, or hiding fog during GM review).
- **Decision**:
  1. **Hydrological Watershed Simulation (`watershedPathEngine.ts`)**:
     - Implement steepest downhill descent tracing (`traceDownhillRiver`) guided by `getTileElevationRank` (0=ocean to 6=alpine peak).
     - Rivers originate naturally from high relief or springs and terminate in sea basins/estuaries.
     - Implement tributary flux accumulation where merging river branches increase river volume.
  2. **A* Road Network Pathfinding**:
     - Implement lowest-friction A* pathfinder (`findOptimalRoadPath`) connecting settlements along mountain passes and gentle terrain contours, avoiding impassable crags, swamps, and deep oceans.
     - Provide 1-click **"🛣️ Auto-Connect Roads"** in the Layer Stacking Drawer to instantly weave trade highways between all discovered settlements.
  3. **Continuous Inter-Tile Spline Ribbons**:
     - Replace isolated center squiggles with `generateConnectedPathD`, connecting tile centers directly to neighbor tile boundary edges in both square and hex topologies.
     - Integrated into both interactive canvas rendering and vector SVG export.
  4. **Discrete 8-Layer Stacking Architecture**:
     - Implement independent toggles for `terrain`, `relief`, `watershed`, `roads`, `territories`, `slots`, `labels`, and `fog` in `MapCanvas.tsx` with quick "Show All" and "Hide All" actions.
- **Consequences**:
  - Rivers and roads now look like authentic published fantasy maps (*Wonderdraft, Inkarnate*).
  - Worldbuilders can generate natural watersheds with a single button press.
  - Enables clean player-facing handouts by toggling off labels and GM-only clutter.

---

## ADR-018: Reframing the Core Paradigm — Collaborative TTRPG Session-Zero Worldbuilding Ceremony

- **Status**: Accepted
- **Date**: 2026-11-07
- **Context**:
  - Technical roadmaps and GIS/cartographic features risked leading to an unintentional divergence: treating the app as a pure map-editor (CAD/GIS) or an autonomous geopolitical simulation engine.
  - The true user intent and soul of the product is: **A structured, layered worldbuilding ceremony for tabletop roleplaying groups (D&D, Pathfinder, OSR, etc.) to sit together for 2–3 hours in a "Session Zero" and build the shared setting they will subsequently play in.**
  - Game theory context: This is **not** a competitive game with winners, losers, or victory points. It is a structured collaborative storytelling ritual.
  - The cards, suits, and powers exist solely as **creative diversity engines**—sparks that defeat blank-canvas paralysis and suggest unexpected combinations.
  - The map canvas, timeline chronicle, and entity registry are **supporting visualization and archival surfaces** designed to ground the conversation and provide a platform for continued tabletop play.
- **Decision**:
  1. **Anchor All Features in Collaborative Tabletop Session Zero**:
     - *Collaborative Mode*: Tabletop circle taking turns building the world layer-by-layer (Geography -> Ecology -> Civilizations -> Myths).
     - *Simulated Tabletop Circle (Auto-Play)*: Demonstrates and simulates players collaborating around a table, contributing diverse ideas.
     - *Solo Mode*: Allows a GM or solo worldbuilder to practice, prep, or sculpt a campaign world privately.
     - *Freeform Studio*: Complete creative freedom with zero mechanical constraints or forced steps.
  2. **Non-Competitive Creative Philosophy**:
     - Remove all win/lose or competitive connotations. Frame actions as creative contributions, discoveries, and mythic consecrations.
     - Provide absolute freedom to override, skip, edit, reorder, paint, or invent custom lore at any moment.
  3. **Bridge Directly to Tabletop Campaign Play**:
     - Introduce a dedicated **Campaign Adventure Hook & Rumor Generator** (`campaignBridgeEngine.ts`) that mines the generated world (factions, ruins, historic deeds, anomalies) to produce actionable D&D/TTRPG adventure hooks, local mysteries, and quest prompts.
     - Provide a **Session Zero Campaign Primer** summarizing the co-created world as a player handout ready for Session 1.
  4. **Re-align Rubric and Personas**:
     - Update `AUDIT_RUBRIC.md`, `HUMAN_EXPERIENCE_FRAMEWORK.md`, and `USER_JOURNEYS.md` to prioritize collaborative flow, creative sparking, unconstrained freedom, and tabletop campaign utility.
- **Consequences**:
  - Prevents feature creep into complex CAD or simulation rabbit holes.
  - Centers all UI, audio, and storytelling on the joyous, creative social energy of tabletop gaming groups.
  - Transforms the final world output from a static archive into an active, playable campaign launchpad.


## ADR-019: Tabletop Campaign Bridge, Session Zero Primer & Collaborative Conclave Handoff

- **Status**: Accepted
- **Date**: 2026-11-07
- **Context**:
  - Following the strategic paradigm shift in ADR-018, the worldbuilder must tangibly deliver on its promise to tabletop roleplaying groups (D&D 5e, Pathfinder, OSR, Fate).
  - Players and Game Masters who finish a Session Zero worldbuilding ceremony need two things immediately:
    1. A bridge to Session 1: What adventures are happening right now in this world? What are the tavern rumors?
    2. A tangible 1-page player orientation handout (Session Zero Primer) that players can take home, print, or review in Discord/Notion to ground their character backstories.
    3. Seamless, celebratory turn-handoff rituals in hotseat tabletop mode that honor each player's creative turn without mechanical drag or competitive friction.
    4. On-demand creative inspiration to defeat blank-canvas freeze when drafting turns.
- **Decision**:
  1. **Built `CampaignHooksModal`**:
     - Dynamically synthesizes D&D/TTRPG quest hooks across 4 archetypes: Dungeon Delves (tied to player-placed ruins), Political Intrigue (tied to player-created factions), Wilderness Expeditions (anomalies and borders), and Mythic Threats.
     - Categorizes by player tier (Tier 1: Levels 1-4, Tier 2: Levels 5-10, Tier 3: Levels 11-16).
     - Provides 1-click Markdown copying for VTTs (Foundry, Roll20, Owlbear) and coordinate jump links to center the map on quest sites.
  2. **Built `SessionZeroPrimerModal`**:
     - Generates an executive 1-page player dossier: setting pitch, starting adventuring hub, local tavern rumors, regional environment vibes, active faction agendas, and notable ruins.
     - Supports 1-click formatted Markdown copying and print/PDF formatting via `window.print()` with `@media print` layout.
  3. **Tabletop Conclave Turn Handoff Ritual**:
     - Displays an elegant banner upon turn completion in multi-player hotseat: *"Passing the Conclave to [Next Player]... What will you shape?"* styled with the next player's seat color and role identity.
  4. **"💡 Spark Inspiration" Creative Prompt Engine**:
     - Integrated in the turn drafting workshop to provide random provocative worldbuilding questions and example prose from `getRandomCreativeSpark()`, with 1-click insertion into the turn note.
  5. **Header & Command Palette Integration**:
     - Added quick launcher buttons in the Studio header, in the Share popover, and in the Spotlight Command Palette (`Ctrl+K`).
- **Consequences**:
  - Transforms the worldbuilder from a self-contained archive into a launchpad for campaigns.
  - Eliminates creative friction for players experiencing blank-canvas anxiety.
  - Elevated Domain 3 on the commercial rubric from 7.5 to 18.0 / 20.0 (+10.5 pts), bringing the overall audit score to 73.0 / 100.


## ADR-020: 48 Whiteboard Marker Cartographic Tropes & Vector Symbol Engine for Genesis Phase

- **Status**: Accepted
- **Date**: 2026-11-07
- **Context**:
  - During the Genesis Phase of worldbuilding, tabletop players lay down the primordial foundation of the physical world (Earth, Water, Plant, and Feature).
  - Previously, players only had a generic single preset for each category, restricting visual variety and narrative imagination.
  - The user explicitly directed: *"we should have much more than 4 things. we should strive for as many simple things as we can for each of the genesis phase items. tropes, standards, stuff you see on a world map. stuff you can draw with a marker on a whiteboard."*
  - The visual language of tabletop world maps (Tolkien, D&D, dry-erase whiteboards, battle mats) relies on iconic, high-contrast, universally recognizable silhouettes that can be sketched in seconds with a marker.
- **Decision**:
  1. **Built `cartographicSymbolEngine.tsx`**:
     - Defined a comprehensive catalog of **48 whiteboard marker cartographic tropes** categorized across the 4 Genesis suits:
       - **♠ Earth (12 Tropes)**: Mountain Peak, Twin Horns, Jagged Needle Spire, Snow Massif, Mountain Range Spine, Rolling Low Hills, Flat Mesa Plateau, Deep Canyon Gorge, Active Volcano, Caldera Basin, Wind-Blown Sand Dunes, Badland Buttes.
       - **♥ Water (12 Tropes)**: Meandering River, Braided River Delta, Roaring Cataract Waterfall, Natural Spring Headwaters, Crescent Oxbow Lake, Coastal Estuary Bay, Glacial Sheer Fjord, Coral Reef Atoll, Abyssal Sunken Trench, Geothermal Hot Spring, Glacier Crevasse, Maelstrom Whirlpool.
       - **♣ Plant (12 Tropes)**: Broadleaf Deciduous Forest, Pine & Fir Taiga, Colossal Redwood Grove, Mangrove Swamp, Peat Moss Bog, Desert Palm Oasis, Acacia Thorn Savanna, Giant Fungal Mycelium, Flowering Meadow, Steppe Grassland, Ironwood Briar Thicket, Whispering Bamboo Grove.
       - **♦ Feature (12 Tropes)**: Subterranean Cave Maw, Megalith Stone Ring, Obelisk Spires, Meteor Impact Crater, Petrified Ancient Wood, Whispering Sacred Grove, Forgotten Temple Ruins, Colossal Titan Bones, Steaming Geyser Basin, Luminescent Crystal Cavern, Sinkhole Cenote Pool, Ley Line Nexus Convergence.
     - Implemented `renderCartographicMarkerSVG(symbolId)`: Hand-drawn vector line art with marker aesthetics (`strokeLinecap="round"`, `strokeLinejoin="round"`, `fillOpacity`) tailored for small 48x48 tile grids and hexagonal layouts.
     - Implemented `resolveCartographicSymbol(tile)`: Fallback mapper ensuring existing maps and tiles automatically display appropriate whiteboard silhouettes without data migrations.
  2. **Expanded Genesis Action Presets (`presets.ts`)**:
     - Expanded Genesis presets from 4 to 52 (48 classic tropes + 4 fantastical presets).
     - Each preset includes an evocative prompt, card suit, narrative description, and `cartographicSymbol` binding for immediate 1-click turn drafting and map stamping.
  3. **Interactive Whiteboard Palette & Tile Inspector (`MapCanvas.tsx`)**:
     - Added dedicated "🖌️ Whiteboard Marker Tropes (48 Genesis Symbols)" drawer section with instant category pills (♠ Earth, ♥ Water, ♣ Flora, ♦ Feature) and live SVG previews.
     - Supported brush painting, fill, and erase for `cartographicSymbol`.
     - Integrated trope selection into the Tile Inspector modal.
     - Added symbol rendering into the standalone SVG export pipeline (`mapEngine.ts`).
  4. **Validation & Testing**:
     - Added `frontend/src/test/cartographicSymbolEngine.test.ts` with 12 tests verifying catalog integrity, SVG element generation, fallback mapping, and export fidelity.
     - All 18 test suites passing (133 / 133 tests). Zero production build warnings.
- **Consequences**:
  - Eliminates creative bottleneck during the Genesis stage.
  - Gives world maps the authentic, charming feel of a dry-erase campaign map sketched around a gaming table.
  - Lays the foundation for expanding Settlement and Civilization whiteboard tropes in subsequent phases.


## ADR-021: Comprehensive Genesis Concepts & Multi-Tile Whiteboard Variants

- **Status**: Accepted
- **Date**: 2026-11-07
- **Context**:
  - Following ADR-020, the user reviewed the Genesis whiteboard symbols and noted the absence of key basic concepts explicitly defined in the original design documentation (`docs/world_building_original_docs.md`):
    - **Earth**: mountains, hills, canyons, deserts, cliffs, caves, volcanoes.
    - **Water**: rivers, lakes, swamps, waterfalls, tidal pools, maelstroms, glaciers, marshes.
    - **Plant**: forests, jungles, grasslands, rainforests, marshes, wetlands.
    - **Features**: geysers, craters, strong winds, currents, salt flats, landmarks, lava flows, natural resources.
  - Crucially, the user required **multiple tile options / visual variants** for each concept (e.g. "hill" has multiple tiles for hill, same for mountain, trees, rivers, etc.), allowing creators to express diverse topography without repetitive visual stamping.
- **Decision**:
  1. **Expanded Catalog to 97 Whiteboard Marker Tropes (`cartographicSymbolEngine.tsx`)**:
     - Engineered multiple visual variants for every single required concept:
       - **♠ Earth (24 Variants)**:
         - Mountains: Single Peak (`mountain-peak`), Twin Horns (`mountain-twin`), Needle Spires (`mountain-spire`), Snow Massif (`mountain-snow`), Continuous Spine (`mountain-range`).
         - Hills: Rolling Low Hills (`hill-rolling`), Triple Knolls (`hill-knolls`), Rocky Scree (`hill-rocky`), Low Mounds (`hill-low`).
         - Canyons & Cliffs: Canyon Gorge (`canyon-gorge`), Sheer Escarpment (`cliff-sheer`), Coastal Cliffs (`cliff-coastal`), Flat Mesa Bluff (`mesa-plateau`), Badland Buttes (`badland-buttes`).
         - Deserts: Crescent Dunes (`desert-dunes`), Sand Sea Erg (`desert-erg`), Rocky Reg Pavement (`desert-rocky`), Sun-Cracked Flats (`desert-cracked`).
         - Caves: Cavern Maw (`cave-maw`), Cliff Grotto (`cave-cliff`), Pit Cenote (`cave-sinkhole`).
         - Volcanoes: Active Erupting (`volcano-active`), Collapsed Caldera (`volcano-caldera`).
       - **♥ Water (24 Variants)**:
         - Rivers & Springs: Meandering River (`river-meander`), Braided River (`river-braided`), River Delta (`river-delta`), River Rapids (`river-rapids`), Headwater Spring (`spring-headwater`).
         - Waterfalls: High Cataract (`waterfall-cataract`), Tiered Cascades (`waterfall-cascades`), Canyon Plunge (`waterfall-gorge`).
         - Lakes: Lake Basin (`lake-basin`), Alpine Tarn (`lake-tarn`), Oxbow Lake (`lake-oxbow`), Crater Lake (`lake-crater`).
         - Swamps & Marshes: Mangrove Swamp (`swamp-mangrove`), Peat Bog (`swamp-peat`), Reed Marsh (`marsh-reeds`), Grassy Fen (`marsh-fen`).
         - Tidal Pools & Coast: Tidal Pools (`tidal-pools`), Estuary Bay (`estuary-bay`), Coral Atoll (`atoll-reef`), Glacial Fjord (`fjord-sheer`), Abyssal Trench (`trench-abyssal`).
         - Glaciers & Ice: Valley Glacier (`glacier-valley`), Crevassed Icefield (`glacier-crevasse`), Ice Shelf (`glacier-shelf`).
         - Maelstroms & Currents: Oceanic Maelstrom (`maelstrom-whirlpool`), Rip Tide & Breakers (`tidal-rip`).
       - **♣ Plant (20 Variants)**:
         - Forests: Broadleaf Deciduous (`forest-deciduous`), Pine & Fir Taiga (`forest-taiga`), Colossal Redwoods (`forest-redwood`), Scattered Woodland (`forest-sparse`), Gnarled Dead Wood (`forest-dead`).
         - Jungles & Rainforests: Dense Jungle Canopy (`jungle-dense`), Emergent Rainforest (`rainforest-canopy`), Palm Cluster (`jungle-palms`), Cloud Forest (`jungle-cloud`), Tangled Lianas (`rainforest-vines`).
         - Grasslands & Savannas: Open Steppe (`grass-steppe`), Tall Grass Tufts (`grass-tall`), Acacia Savanna (`savanna-acacia`), Wildflower Meadow (`meadow-wildflower`).
         - Marshes & Specialized Flora: Lily Pad Wetland (`flora-wetland`), Ironwood Briar Thicket (`thicket-ironwood`), Whispering Bamboo (`bamboo-grove`), Giant Fungal Forest (`fungal-mycelium`).
       - **♦ Features (29 Variants)**:
         - Geysers & Thermal: Steaming Basin (`geyser-basin`), Geyser Fountain (`geyser-eruption`), Boiling Mudpot (`thermal-mudpot`), Mineral Hot Spring (`hotspring-geothermal`).
         - Craters: Meteor Impact (`crater-impact`), Sunken Caldera (`crater-caldera`), Abyssal Pit (`crater-pit`).
         - Lava Flows: Magma Fissure (`lava-fissure`), Basalt Lava Stream (`lava-river`), Obsidian Lava Field (`lava-field`).
         - Salt Flats: Hexagonal Crust (`salt-hexagons`), White Alkali Pan (`salt-pan`), Salt Spires (`salt-pillars`).
         - Strong Winds & Weather: Gale Wind Vectors (`wind-gale`), Cyclone Vortex (`wind-vortex`), Thunderstorm Cloud (`wind-storm`).
         - Currents & Tides: Surface Currents (`water-currents`), Oceanic Gyre (`current-gyre`).
         - Natural Resources: Mineral Ore Vein (`resource-mineral`), Gemstone Geode (`resource-gem`), Crystal Cavern (`crystal-cavern`), Stone Quarry Strata (`resource-quarry`), Titan Bone Bed (`titan-bones`).
         - Landmarks: Megalith Ring (`megalith-ring`), Obelisk Spires (`obelisk-spires`), Natural Stone Arch (`landmark-arch`), Temple Ruins (`ruins-temple`), Petrified Wood (`petrified-wood`), Sacred Grove (`sacred-grove`), Ley Line Nexus (`ley-nexus`).
  2. **101 Genesis Turn Action Presets (`presets.ts`)**:
     - Populated all 97 tropes + 4 fantastical options into the Genesis presets, ensuring every tile variant can be immediately drafted with a thematic narrative prompt and mechanics.
  3. **Concept Sub-Filters & Inspector Grouping (`MapCanvas.tsx`)**:
     - Added a Concept Sub-Filter Bar below the category pills, enabling creators to view only Mountains (5), Hills (4), Deserts (4), etc., side by side.
     - Grouped the Tile Inspector Cartographic Trope dropdown into concept optgroups with variant labels.
  4. **Automated Testing**:
     - Updated `cartographicSymbolEngine.test.ts` to verify every requested concept has $\ge 2$ variants, counts match, valid SVG elements render, and presets match symbols.
     - All 18 test suites passing (135 / 135 tests).
- **Consequences**:
  - Completely satisfies the user's requirement for all foundational terrain elements and multi-tile options.
  - Dramatically improves map aesthetics and worldbuilding diversity on the canvas.

---

## ADR-022: Multi-Stage Preset Diversity, Whiteboard Habitation Tropes, and Codex Icon System

- **Status**: Accepted
- **Context**:
  Following the successful expansion of the Genesis stage (ADR-021), the user directed that all remaining stages (Primal, Civilization, Intrigue) receive equivalent depth and variety:
  > "for the rest of the phases we should do similar work. matching the examples and ideas already in the rules. thinking what tropes are common, simple, and easy, what can be put on a whiteboard, and variety of tiles, visuals, etc. different races, intrigue events, etc. might not have tile icons, but they can have icons in the wiki/archive. an icon to represent a militaristic tradition, or a religion, etc. can help the game. these are important presets for the automode and bot players, diversity. etc."
- **Decision**:
  1. **Whiteboard Marker Tropes for Settlements & Constructions**:
     - Expanded `cartographicSymbolEngine.tsx` with two new categories: `'settlement'` and `'construction'`.
     - Added 7 hand-drawn dry-erase marker vector silhouettes for Settlements (Primal ♠):
       - Thatched Hearth-Hamlet (`settle-hamlet` - 🏕️)
       - Timber Palisade Village (`settle-village` - 🛖)
       - Crossroads Market Town (`settle-town` - 🏘️)
       - Nomadic Felt Yurt Camp (`settle-nomad` - 🎪)
       - Cliffside Canyon Pueblo (`settle-cliff` - 🏜️)
       - Coastal Stilt Fishing Village (`settle-stilt` - 🛶)
       - Frontier Stockade Outpost (`settle-outpost` - 🛡️)
     - Added 9 hand-drawn vector silhouettes for Constructions & Monuments (Civilization ♠):
       - Feudal Castle Keep (`const-castle` - 🏰)
       - Mountain Citadel Fortress (`const-citadel` - 🏯)
       - Deepwater Harbor & Port (`const-port` - ⚓)
       - Arched Stone Bridge (`const-bridge` - 🌉)
       - Great Border Wall (`const-wall` - 🧱)
       - Wonder Step-Pyramid (`const-monument` - 🏛️)
       - Domed Academy University (`const-university` - 📜)
       - Arched Stone Aqueduct (`const-aqueduct` - 🚰)
       - Coastal Beacon Lighthouse (`const-lighthouse` - 🗼)
     - Total whiteboard trope catalog increased from 97 to **113** handcrafted SVG symbols.
  2. **Multi-Stage Action Presets & Codex Icon Diversity (`presets.ts`)**:
     - Expanded `STAGE_ACTION_PRESETS` from minimal 2 presets per suit to 8+ rich presets per suit across all remaining stages (97 total multi-stage presets):
       - **Primal (Stage 2 - 32 Presets)**:
         - Settlements (♠): 7 whiteboard marker habitation tropes + 1 fantastical sanctuary.
         - Traditions (♥): 8 cultural traditions with wiki/codex icons (Solar Cult ☀️, Lunar Divination 🌙, Shieldwall Warrior Code 🛡️, Ancestor Worship 🪦, Skaldic Oral Saga 📜, Sacred Hospitality 🏺, Harvest Feast 🌾, Starlight Communion ✨).
         - Resources (♣): 8 domesticated flora/fauna & minerals (Warhorses 🐎, Heavy Oxen 🐂, Golden Wheat 🌾, Terraced Paddy Rice 🍚, Bog Iron ⛏️, Vein Silver 🪙, Hardwood Timber 🪵, Starfall Ether Ore 🌟).
         - Skills (♦): 8 species evolutionary skills (Composite Bow Archery 🏹, Wilderness Tracking 🐾, Cliff Free-Climbing 🧗, Open-Sea Outrigger Navigation ⛵, Pattern-Welded Metallurgy 🔨, Cyclopean Stone Masonry 🧱, Herbal Apothecary 🌿, Resonant Elemental Singing 🎶).
       - **Civilization (Stage 3 - 33 Presets)**:
         - Constructions (♠): 9 whiteboard marker construction tropes + 1 fantastical sky-spire.
         - Enlightenment (♥): 8 philosophical and political advances (Parliamentary Republic ⚖️, Written Legal Code 📜, Guild Mercantilism 🪙, Hydraulic Deep-Shaft Mining ⛏️, Astrolabe & Nautical Navigation 🧭, Antiseptic Medicine 🧪, Master Sculpting & Fresco Arts 🎨, Celestial Orrery Chronometry 🔭).
         - Expansion (♣): 8 provincial expansion strategies (Frontier Colony 🏕️, Imperial Naval Armada ⛵, River Basin Granary 🌾, Mountain Pass Fortress 🏰, Caravan Trading Post 🐫, Cultural Assimilation 🤝, Conquest Annexation ⚔️, Ley-Line Skyships 🛸).
         - Diplomacy (♦): 8 statecraft accords and treaties (Dynastic Royal Marriage 💍, Mutual Defense League 🛡️, Free Trade Pact 📜, Armistice Peace Accord 🕊️, Demilitarized Frontier Border 🚧, Scholar Exchange Embassy 📚, Sovereign Legation 🏛️, Concord of the Prismatic Vow 🕊️).
       - **Intrigue (Stage 4 - 32 Presets)**:
         - Conflict (♠): 8 military conflicts (Continental War ⚔️, Protracted Citadel Siege 🏰, Popular Peasant Rebellion 🚩, Dynastic Civil War 👑, Zealot Inquisitorial Purge 🕯️, Coastal Naval Blockade ⚓, Borderland Raids 🏹, Eldritch Abyssal Incursion 👹).
         - Cooperation (♥): 8 diplomatic partnerships (Grand Defensive Coalition 🛡️, Joint Famine Relief Convoy 🌾, Post-War Reconstruction Pact 🏗️, Shared Frontier Border Patrol 🐎, Royal Cartographic Survey 🗺️, Holy League Sanctuary ⛪, Epidemic Quarantine Alliance 🧪, Astral Shield Convergence 🌌).
         - Scheme (♣): 8 covert court plots (Royal Heir Assassination 🗡️, Smugglers' Shadow Network 🗝️, Courtly Cabal Intrigue 👥, Forged Succession Treaty 📜, Spy Network Espionage 👁️, Military Coup d'État ⚔️, Blackmail of High Chancellor 🗃️, Eldritch Usurpation Ritual 🔮).
         - Myth & Mystery (♦): 8 epic legends and campaign hooks (Awakening of the Slumbering Dragon 🐉, Rise of the Undead Archlich 💀, Sunken Sunken Metropolis 🌊, Discovery of the Sovereign Blade 🗡️, Unsealing of the Abyssal Rift 👹, Desecration of the Barrow Mounds 🪦, Awakening of the Stone Titan 🗿, Ascension of the Star-God ✨).
  3. **Canvas & Inspector Integration (`MapCanvas.tsx`)**:
     - Added `🏘️ Towns` and `🏰 Monuments` category selector tabs to the Whiteboard Marker Palette drawer.
     - Updated Tile Inspector dropdown optgroups with settlement and construction concepts and counts.
  4. **Auto-Play Bot Storytelling Elevation**:
     - `getPresetsForCard()` now samples from 8+ rich presets per suit, eliminating repetitive auto-play bot loops and maximizing variety during simulated or solo play.
- **Consequences**:
  - Delivers complete parity across all 4 stages of the game.
  - Empowers both human tabletop groups (brainstorming prompts, narrative flavor) and autonomous bot players with diverse worldbuilding decisions.

---

## ADR-023: Studio Preset Categorization, Affinity/Anti-Affinity Decision Engine, and Evocative Flavor Name Generation

- **Status**: Accepted
- **Context**:
  To ensure tabletop worldbuilding feels cohesive, rewarding, and creatively inspiring, the user directed:
  > "for the studio, expand more items, options, presets, etc. make categories, filtering, etc. allow internal meta data to link them with scores for certain types of other preset behaviours, and elements, so that certain behaviours, elements, intrigues, primals,etc. have affinity or anti-affinity. this will help make the bot selection more realistic with weighted choices that do not seem so random and disconnected. make sure the bot players have configurable weights, can be edited or adjusted after selection (if not fully automatic world) and that each of the selections, has some basic description to go along in the ledger. names of forests, names of canyons, names of creatures, towns, empires, characters, etc."
- **Decision**:
  1. **Affinity & Anti-Affinity Decision Engine (`affinityEngine.ts`)**:
     - Defined studio concept groups (`habitations`, `geography`, `traditions`, `statecraft`, `intrigue`, `myths`).
     - Implemented semantic tag inference (`inferPresetTags`) identifying cultural, military, ecological, and esoteric themes.
     - Built dynamic affinity evaluator (`evaluatePresetAffinity`) calculating:
       - **World Historical Precedents**: +10 to +30 bonus when candidate presets reinforce established traditions, species traits, or previous turn events (e.g., prior seafaring culture boosts maritime ports and naval expansion).
       - **Geographic Suitability**: +20 to +25 bonus for terrain alignment (highland citadels on mountains, watermills along rivers).
       - **Anti-Affinity Penalties**: -25 to -40 penalty for discordant combinations (e.g. maritime ports in deep desert basins, wanton mass purges in high-cooperation peaceful republics).
       - **Bot Personality Weights**: Multiplies weights by configured bot parameters (`geography`, `ecology`, `civilization`, `diplomacy`, `conflict`, `myth`).
     - Created `sampleWeightedPreset` utilizing roulette-wheel probability distribution, giving high-affinity choices higher selection probability while maintaining creative variety.
     - Built `recommendBestPreset` to surface the optimal choice and transparent rationale to human creators.
  2. **Combinatorial Fantasy Name & Ledger Narrative Generator (`flavorNameEngine.ts`)**:
     - Procedural name generation with deterministic seed support for:
       - Mountain peaks, spires, and crags
       - Canyons, gorges, and rifts
       - Forests, wealds, and groves
       - Rivers, waterfalls, and lakes
       - Towns, havens, citadels, and keeps
       - Species, empires/leagues, historical leaders, and ancient myths
     - Implemented `generateLedgerProse` to weave names, coordinates, and entity affiliations seamlessly into complete chronicle notes.
  3. **Studio Preset Workshop UI Expansion (`Play.tsx`)**:
     - Integrated instant search input for real-time preset filtering.
     - Added 7 category filter pills (`All`, `Habitations`, `Geography`, `Traditions`, `Statecraft`, `Intrigue`, `Myths`) with dynamic item counts.
     - Added "🤖 Bot Pick" recommendation banner with affinity score and expandable rationale breakdown ("Why this Pick?").
     - Added Evocative Feature & Entity Name customizer with `🎲 Re-roll Name` and `✍️ Sync to Note` buttons.
     - Embedded direct access to tune bot decision weights.
  4. **Smart Auto-Play Simulation (`autoPlayEngine.ts`)**:
     - Upgraded bot turn execution to use weighted affinity selection, assign cartographic symbols, apply traits/abilities, and chronicle rich narrative ledger notes.
  5. **Automated Test Coverage**:
     - Added unit test suites `affinityEngine.test.ts` (6 tests) and `flavorNameEngine.test.ts` (4 tests).
     - Expanded `PlayStudio.test.tsx` verifying category filtering, text search, bot recommendation, and name re-rolling.
     - All 20 test suites passing (149 / 149 tests).
- **Consequences**:
  - Eliminates disconnected, random-feeling bot turns by ensuring choices reflect world history, geography, and seat personalities.
  - Provides tabletop players with immediate creative flavor and evocative names to overcome blank-page syndrome.

---

## ADR-024: Tabletop Presets & Tropes Compendium, Enriched Lore Descriptions, and Codex Integration

- **Status**: Accepted
- **Date**: 2026-11-08
- **Context**:
  The user noted that navigating presets, powers, and traditions was still clunky, and asked for an inventory/catalog of presets with descriptions of traditions, traits, and powers, covering expected common tropes and basic elements with filters and categories:
  > "the codex, studio, etc. its still a bit clunky and hard to navigate. would be nice to have an inventory of presets, descriptions on the traditions, traits, powers, etc. the presets do not cover expected common tropes and basic ones you would expect to see. there should be many more. with filters and categories."
- **Decision**:
  1. **Enriched Cultural Traditions & Abilities with Lore Descriptions (`presets.ts`)**:
     - Extended `ModularBlockItem` to support full descriptions and search tags (`{ label, icon, description, tags }`).
     - Added rich tabletop lore descriptions and common fantasy tropes across all 26 cultural traditions (Shamanic Totems, Sacred Burial Mounds, Blood Oaths, Druidic Hermitage, Fire-Tending, Sacred Hospitality, Spear Hunting, Hide Tanning, Herbal Brewing, Animal Taming, Phalanx Shieldwall, Celestial Navigation, etc.) and 22 modular abilities (Astral Weaving, Deep-Stone Sense, Storm-Calling, Beast Tongue, Runesmithing, Shadowmeld, Berserker Rage, Siege Craft, etc.).
  2. **Unified Tabletop Compendium Indexer (`compendiumEngine.ts`)**:
     - Built comprehensive inventory indexer aggregating 200+ canonical powers, whiteboard tropes, action presets, traditions, skills, ancestries, realms, and myths.
     - Added multi-faceted filtering by 9 categories (`powers`, `tropes`, `actions`, `traditions`, `abilities`, `ancestries`, `realms`, `myths`), stage (`genesis`, `primal`, `civilization`, `intrigue`), and full-text keyword search across titles, summaries, prompts, and lore notes.
     - Implemented `findCompendiumTrait()` to resolve any trait or ability string to its full tabletop lore and icon.
  3. **Interactive Presets & Tropes Compendium Modal (`PresetCompendiumModal.tsx`)**:
     - Modern searchable inventory modal with live category pill filters, stage filter tabs, dynamic item counts, and quick copy-to-clipboard for storytelling notes.
     - Surfaced tabletop storytelling prompts ("What primordial forces raised this mountain peak?"), example narratives, and direct 1-click "Select for Turn" integration when drafting turns.
  4. **Codex & Studio UI Ergonomics Integration**:
     - Added "📖 Compendium" launcher in the Studio top bar, Share/Export menu, and Turn Drafting Workshop header in `Play.tsx`.
     - Integrated Compendium launcher into the Codex Wiki header in `EntityRegistry.tsx`.
     - Enriched modular snap-blocks and entity trait/ability badges with rich hover tooltips displaying lore descriptions.
     - Exposed Compendium action in the Global Spotlight Command Palette (`Ctrl+K`).
  5. **Automated Test Coverage (`compendiumEngine.test.ts`)**:
     - 5 comprehensive unit tests verifying catalog inventory size (>= 200 items), canonical powers indexing, category breakdowns, and multi-field keyword filtering.
     - Maintained 100% test pass rate (21 suites, 154 tests passing).
- **Consequences**:
  - Provides players and GMs with an exhaustive, instantly accessible tabletop reference encyclopedia.
  - Eliminates mechanical obscurity by providing clear lore explanations and tabletop prompts for every trait and ability.

---

## ADR-025: Data-Driven Content Taxonomy, Hierarchical JSON Manifests, and Surgical Human Authoring with Graphic Fallbacks

- **Status**: Accepted
- **Date**: 2026-11-08
- **Context**:
  As the worldbuilding catalog grew beyond 200+ items, `presets.ts` had grown to 5,175 lines of hardcoded TypeScript arrays and `cartographicSymbolEngine.tsx` had grown to 2,147 lines. The user established a clear architectural mandate for long-term human maintainability:
  > "make sure to track and record these decisions, and design philosophy. because i want to be able to continuously expand and add more things. also, it should be easy to go add these things in the code without needing generative AI. We need a proper structure, taxonomy, file structure, easy to make small additions by adding a few lines to files. each category, phase, etc. should have a directory, each directory should have manifest files and json files for all entities, with groupings and subdirs, etc, as needed to manage file sprawl effectively. please consider proper repo structure and design for this. if i want to add a new preset to genesis earth called 'meteor crater' i should only need to make a small amount of surgical additions, and the site should pick that up and render automatically. if i do not provide a graphic for it, i should be able to select another existing one."
- **Decision**:
  1. **Hierarchical Directory & JSON Catalog Taxonomy (`frontend/src/data/catalog/`)**:
     - Replaced monolithic hardcoded TypeScript arrays with a structured, domain-grouped JSON directory hierarchy:
       - `manifest.json`: Root catalog index and schema version.
       - `README.md`: Step-by-step Human Authoring Guide with copy-pasteable JSON examples (no AI required).
       - `stages/`: Subdirectories per worldbuilding stage (`genesis/`, `primal/`, `civilization/`, `intrigue/`), each containing a `manifest.json` and 4 suit-specific JSON files (`earth.json`, `water.json`, `plant.json`, `feature.json`, `settlements.json`, `traditions.json`, `resources.json`, `skills.json`, `constructions.json`, `enlightenment.json`, `expansion.json`, `diplomacy.json`, `conflict.json`, `cooperation.json`, `scheme.json`, `myth.json`) plus `disasters.json`.
       - `codex/`: `manifest.json`, `species.json`, `societies.json`, `myths.json`, `relationships.json`, `traits.json`, `abilities.json`, and `palettes.json`.
       - `symbols/`: `manifest.json` (with `conceptFallbacks`) and category files (`earth.json`, `water.json`, `plant.json`, `feature.json`, `settlement.json`, `construction.json`).
       - `bots/`: `manifest.json` and `personalities.json`.
  2. **Smart Context Normalization (`catalogLoader.ts`)**:
     - Implemented `normalizeStagePreset()` so human authors adding an item to `stages/<stage>/<suit>.json` only need to specify core fields (`id`, `name`, `icon`, `description`, and optional terrain/narrative fields).
     - Contextual properties (`stage`, `suit`, `isFantastical`, `isDisaster`, `slotCategory`, `slotPriority`) are automatically inherited from the directory and suit file if omitted.
  3. **Explicit & Automatic Graphic Fallback Resolution (`graphicFallback`)**:
     - Added `graphicFallback` support to both `RawStageActionPreset` and `RawCartographicSymbol`.
     - If an author adds a new preset (such as `"gen_earth_meteor_crater"` in `stages/genesis/earth.json`) without creating new SVG art, they can either set `"graphicFallback": "crater-impact"` to reuse any existing graphic, or omit it and let `inferDefaultGraphicForPreset()` automatically select a matching graphic by keyword/relief/terrain.
     - Updated `renderCartographicMarkerSVG()` in `cartographicSymbolEngine.tsx` to resolve `resolveSymbolGraphicFallback()` in its `default` branch, falling back via `graphicFallback` -> `symbols/manifest.json#conceptFallbacks` -> category default.
  4. **Concrete Surgical Validation (`Meteor Crater` + `catalogExtensibility.test.ts`)**:
     - Added `"gen_earth_meteor_crater"` ("Meteor Crater") to `stages/genesis/earth.json` using minimal surgical fields and `"graphicFallback": "crater-impact"`.
     - Added `catalogExtensibility.test.ts` verifying that surgical JSON entries automatically hydrate and appear in the Studio Turn Workshop, Bot Affinity/Auto-Play engine, Tabletop Compendium, and Map SVG Renderer.
- **Consequences**:
  - Reduced `presets.ts` from 5,175 lines to 192 lines and `cartographicSymbolEngine.tsx` from 2,147 lines to 909 lines.
  - Empowers any human developer or tabletop designer to add new presets, tropes, traits, or species in seconds by editing small, self-contained JSON files without touching engine code or needing generative AI.

---

## ADR-026: SOLID Multi-Shard Catalog Manifests, Dedicated Graphic Sub-Leaf Schema & Externalized Weights

- **Status**: Accepted
- **Date**: 2026-11-08
- **Context**:
  Following ADR-025, the user refined the architectural requirements for the Studio catalog taxonomy:
  > "manifest for entities should not have 'icon' it should have a graphic sub section, which can include a link to the graphics assets manifest ids, null, etc. different params like primary color, etc. not just a single value, a whole sub json leaf defining any visual components referencing assets and parameters. manifests should support eventually splitting large monolithic jsons into smaller ones, (part1,2,3,etc) or by categories, etc. ensure iterative enhancement of taxonomy, SOLID coding and codebase structure and framework, including the data, weights, assets, etc. not to modify the rules section, just the studio section. continue to enhance and record and improve. add more scoring rubrics for these principles."
- **Decision**:
  1. **Dedicated `graphic` Sub-JSON Leaf Schema (`GraphicSpec`)**:
     - Removed root-level `"icon"` properties across all raw Studio catalog JSON shards (`stages/**`, `codex/**`, `assets/**`, `weights/**`).
     - Introduced a rich `"graphic"` sub-JSON leaf (`GraphicSpec`) on every catalog item:
       - `assetId`: Primary graphic asset ID from `assets/manifest.json` (or `null` for non-map items).
       - `fallbackAssetId`: Explicit fallback graphic asset ID when a bespoke graphic isn't created yet (or `null`).
       - `glyph`: Unicode badge or shorthand symbol rendered in cards, Codex tags, and ledger timelines.
       - `primaryColor` / `secondaryColor`: Hex color tokens overriding default palette styling.
       - `params`: `{ scale, opacity, strokeWidth, rotation, variant }` rendering parameters.
       - `settlementIcons`: Optional per-stage settlement progression glyphs (`camp`, `village`, `town`, `city`).
     - Implemented an Adapter/Hydrator layer in `catalogLoader.ts` (`normalizeGraphicSpec`) so existing Studio React components seamlessly receive hydrated `graphic` objects alongside backwards-compatible runtime properties (`icon`, `cartographicSymbol`, `graphicFallback`).
  2. **Open/Closed Multi-Shard Manifest Resolution (`import.meta.glob`)**:
     - Upgraded `catalogLoader.ts` to use Vite's `import.meta.glob('../data/catalog/**/*.json', { eager: true })` and recursive `shards: string[]` resolution (`resolveManifestShards()`).
     - Split monolithic JSON files into cohesive multi-part and category-grouped shards (`part1-*.json`, `part2-*.json`, `part3-*.json`):
       - `stages/genesis/earth/` (`part1-mountains-and-hills.json`, `part2-canyons-cliffs-and-craters.json`, `part3-deserts-mesas-and-volcanoes.json`)
       - `stages/genesis/water/` (`part1-rivers-and-waterfalls.json`, `part2-lakes-swamps-and-marshes.json`, `part3-coastal-glaciers-and-currents.json`)
       - `stages/genesis/plant/` (`part1-forests-and-taiga.json`, `part2-jungles-and-groves.json`, `part3-grasslands-and-wetlands.json`)
       - `stages/genesis/feature/` (`part1-geothermal-craters-and-lava.json`, `part2-winds-and-resources.json`, `part3-landmarks-and-wonders.json`)
       - `codex/species/`, `codex/traits/`, `codex/abilities/`, `codex/societies/`, `codex/myths/`, `codex/relationships/`
       - `assets/earth/`, `assets/water/`, `assets/plant/`, `assets/feature/`, `assets/settlement/`, `assets/construction/`, `assets/palettes/`
       - `weights/personalities/` and `weights/affinity/`
  3. **Externalized Bot Synergy & Anti-Affinity Rules (`weights/affinity/`)**:
     - Extracted hardcoded affinity and anti-affinity weighting logic from `affinityEngine.ts` into `frontend/src/data/catalog/weights/affinity/part1-synergy-and-antiaffinity-rules.json` (12 declarative synergy/conflict rules + 5 terrain-keyword weight groups).
  4. **Expanded Rubric Domain 7 (`docs/AUDIT_RUBRIC.md`)**:
     - Added Domain 7: *SOLID Data-Driven Taxonomy, Multi-Shard Extensibility & Graphic Asset Decoupling (20 Points)* (`M7.1`–`M7.4`, scored `19.5 / 20.0`).
  5. **Strict Rules Isolation**:
     - Zero modifications to `frontend/public/data/*.json` or `Rules.tsx`.
- **Consequences**:
  - Authors can partition any large JSON file into `part1.json`, `part2.json`, etc. purely by listing the new shard in the local `manifest.json`—zero TypeScript imports or engine edits required.
  - Every Studio entity has a clean, extensible `graphic` sub-JSON leaf linking directly to `assets/manifest.json` IDs, colors, and parameters.

---

## ADR-027: Real-Time Table Peer Synchronization, Second-Screen TV Spectator Mode, Multi-Touch Atlas Gestures & Live In-Workshop Bot Weight Tuning

- **Status**: Accepted
- **Date**: 2026-11-08
- **Context**:
  To complete Phase 21 of the Human Experience (HX)-Led Engineering Roadmap and fulfill the user's request for configurable mid-session bot weights and frictionless collaborative Session Zero play across tabletop screens and tablets:
  1. Tabletop groups frequently use a primary laptop/tablet alongside a secondary living-room TV/projector display or co-creator devices.
  2. Players and GMs wanted to adjust bot personality archetypes and decision weights (`Geography`, `Ecology`, `Civilization`, `Diplomacy`, `Conflict`, `Myth & Magic`) directly inside the Studio Turn Workshop (whenever the world is not locked) and immediately see the `🤖 Bot Pick` recommendation recalculate.
  3. Tablet users needed two-finger pinch-to-zoom and touch pan gestures on the hex/square cartography viewport.
- **Decision**:
  1. **Zero-Server Real-Time Table Peer Synchronization (`peerSyncEngine.ts`, `TableSyncModal.tsx`)**:
     - Implemented `TablePeerSession` supporting 3 tabletop roles: `host` (GM/Facilitator), `co-creator` (Player Seat), and `spectator` (Tabletop TV / Projector Display).
     - Uses dual-transport synchronization: instant `BroadcastChannel` + `localStorage` event fallback for multi-window/second-monitor setups, plus serverless WebRTC `RTCPeerConnection` SDP Offer/Answer token exchange for cross-device pairing.
     - Implemented deterministic revision conflict resolution (`shouldAcceptIncomingWorldSync`) so stale packets never overwrite newer local turns.
     - Added 1-click **"Open TV Spectator Window"** (`?syncRoom=CONCLAVE-XXXX&syncRole=spectator`) that launches and auto-connects a synchronized second screen.
  2. **Multi-Touch Pinch-to-Zoom & Two-Finger Pan (`MapCanvas.tsx`, `peerSyncEngine.ts`)**:
     - Implemented pure multi-touch geometry functions (`getTouchDistance`, `getTouchMidpoint`, `computePinchZoomDelta`, `computeTwoFingerPanDelta`) and wired `onTouchStart`, `onTouchMove`, `onTouchEnd` on the `MapCanvas` viewport container.
  3. **Inline Live Bot Weight & Personality Tuner in Studio Turn Workshop (`Play.tsx`)**:
     - Added a `⚖️ Tune Weights` toggle directly inside the `🤖 Bot Pick` recommendation banner during turn drafting (`data-testid="inline-bot-weight-tuner"`), allowing players to switch the active seat's `BotPersonalityId` or drag 6 domain weight sliders (`0%`–`100%`) in real time and watch affinity scores recalculate immediately.
- **Consequences**:
  - Elevates Domain 4 (Tabletop Ergonomics & Multi-Device Sync) from `9.0 / 15.0` to `13.5 / 15.0` and advances the overall Core AAA Verified Score to **78.5 / 100** (with **19.5 / 20.0** on Domain 7 SOLID Studio Taxonomy).

---

## ADR-028: Single-PC Tabletop Driver UX Priority, Zero-Ping-Pong Turn Flow, Speaker Chime-In Attribution & Kinetic Card Tactility

- **Status**: Accepted
- **Date**: 2026-11-08
- **Context**:
  The user established a clear product priority for all ongoing and future phases:
  > "lets prioritize for the main use-case of running on a single pc with one player managing the laptop, other players chiming in from the side. no more effort on projectors, second screens, multi-player, etc. dont break or drop what you did already, but dont keep working on it for now. focus on functionality. focus on core. focus on UX, UI, menus, interactivity, flow. etc. iterate to next phase."
- **Decision**:
  1. **Single-PC Tabletop Speaker & Chime-In Attribution Bar (`tabletop-speaker-bar` in `Play.tsx`)**:
     - Added a persistent, zero-clutter speaker bar right inside the Studio Turn Controller card showing all players/bots as clickable pills plus a 1-click `+ Add Seat` button.
     - Clicking any player pill switches the active speaker and, if a turn is currently being drafted (`turnPhase === 'action_select'`), immediately attributes the active `DrawRecord` to that speaker so anyone chiming in from the side gets credit in the Chronicle without opening modals.
  2. **Complete Card Freedom Controls (`🔄 Redraw` & `🎴 Pick Card`)**:
     - Added a 1-click **Redraw (Mulligan)** button during active turns so the table can swap out an uninspiring draw without penalty.
     - Added an interactive **Choose Specific Card** popover (`specific-card-picker`) allowing the laptop driver to select any `Suit` (`♠ ♥ ♣ ♦`) and `Value` (`2..10, J, Q, K, A, 🃏 Joker`) for physical card decks or creative overrides.
  3. **Zero-Ping-Pong In-Turn Map & Codex Interactivity (`cardPhysicsEngine.ts`, `Play.tsx`)**:
     - **Smart Auto-Pick Tile (`🎲 Auto-Pick Tile`)**: Uses `pickSmartTargetTileForPreset()` to score and select an ideal map coordinate matching the chosen preset's domain (water vs land, mountain, forest, low slot congestion).
     - **Inline Mini-Map Coordinate Picker (`🎯 Target (col,row)`)**: Expands an interactive mini-map grid (`inline-minimap-picker`) directly inside the Turn Workshop so the laptop driver can click any coordinate on the map without switching tabs.
     - **Inline Quick-Forge Codex Entity (`➕ Quick-Forge Lore`)**: Expands a 1-row entity creator (`inline-quick-forge-entity`) inside the Turn Workshop (`buildQuickCodexEntity`) that creates a new Species, Society, Character, Religion, Artifact, or Landmark and links it to both the target tile and the current turn record in one click.
  4. **3D Kinetic Card Tactility, Deck Stack Depth & Acoustic Stingers (`cardPhysicsEngine.ts`, `soundEngine.ts`)**:
     - Added cursor-responsive 3D perspective card tilt (`computeCardTiltTransform`) and a visual Deck Stack layer progress indicator (`computeDeckStackLayers`).
     - Added ±4% pitch jitter (`computePitchJitterMultiplier`) to prevent listener fatigue and procedural stingers for Ace Cataclysms (`playAceCataclysmStinger`) and Fantastical Wonders (`playJokerWonderStinger`).
- **Consequences**:
  - Eliminates tab-switching friction for the single-PC laptop driver.
  - Advances Domain 1 to `14.0 / 20.0`, Domain 4 to `14.0 / 15.0`, and the overall verified Core AAA Score to **83.0 / 100** (170/170 tests passing across 24 suites).

---

## ADR-029: Editable Turn Event & Map Stamp Workbench — Preset Population, Live In-Place Map Editing & Fast Custom Stamp Flow

- **Status**: Accepted
- **Date**: 2026-11-08
- **Context**:
  The user highlighted a core Studio gameplay requirement:
  > "remember tha when playing the basic studio mode, once drawin a card, i should be able to record that event/action in the record. if i select presets and put them on a map, that should populate, and still allow me to edit, if i do custom, it should still be easy and fun and fast to do."
  Previously, clicking a preset in Studio mode only stored `selectedPreset` in React state without immediately populating an editable Event/Action Title, Icon/Terrain customizer, or syncing to the active `DrawRecord` in the Chronicle; placing on the map only happened at turn end (`handleConfirmTurnChronicle`); and custom actions had no dedicated 1-click icon/terrain/category workbench.
- **Decision**:
  1. **Unified Turn Event & Map Stamp Workbench (`turnWorkbenchEngine.ts`, `Play.tsx`)**:
     - Created `TurnActionDraft` and pure workbench helpers (`createDraftFromPreset`, `createCustomTurnDraft`, `generateDraftChronicleNote`, `stampDraftOnMapTile`, `syncDraftToDrawRecord`).
     - Selecting any preset immediately populates all editable fields of the Workbench (`data-testid="turn-event-workbench"`): **Event / Action Title** (`workbench-action-title-input`), **Evocative Name / Map Label** (`workbench-feature-name-input`), **Map Token / Icon**, **Terrain & Slot Category overrides**, and **Chronicle Note**—and immediately synchronizes them into the active `DrawRecord` in `world.drawHistory`.
  2. **Live In-Place Map Placement & Post-Placement Editing (`📍 Place on Map` & `⚡ Stamp on Click`)**:
     - Clicking **`📍 Place on Map (col,row)`** (`place-on-map-btn`) or clicking tiles on the Inline Mini-Map with **`⚡ Stamp on Click`** enabled immediately stamps the preset or custom feature onto the map tile and updates the Chronicle Record **without ending the turn**.
     - `stampDraftOnMapTile()` tags placed slots with `linkedEventId: record.id` and updates existing slots in-place when the player edits the Feature Name, Action Title, Icon, or Terrain after placement—preventing duplicate slots and keeping map labels and Chronicle records 100% synchronized.
  3. **Fast, Fun 1-Click Custom Event & Stamp Mode (`✨ Custom Event / Stamp`)**:
     - Clicking **`✨ Custom Event / Stamp`** (`switch-to-custom-workbench-btn`) or **`🎨 Icon & Terrain`** (`toggle-stamp-customizer-btn`) opens a tactile 1-click palette of 18 whiteboard icons (`WORKBENCH_QUICK_ICONS`), 11 terrain overrides (`WORKBENCH_TERRAIN_OPTIONS`), and 7 slot categories (`WORKBENCH_SLOT_CATEGORIES`), plus `🎲 Re-roll` and `✍️ Sync to Note` that work seamlessly for 100% custom creations.
  4. **Explicit `💾 Save to Record` & Editable Chronicle `actionTitle` (`TimelinePanel.tsx`)**:
     - Added **`💾 Save to Record`** (`save-turn-record-btn`) so the player can explicitly save/update the turn record at any point while continuing to edit.
     - Added an inline editable **Event / Action Title** input for unlocked turns in `TimelinePanel.tsx`.
- **Consequences**:
  - Makes both Preset-driven and Custom freeform turns in Studio Mode fast, tactile, live-populated, and non-destructively editable before and after map placement.
  - Advances the verified Core AAA Score from **83.0 -> 85.0 / 100** across 25 test suites (174/174 tests passing).

---

## ADR-030: Deterministic Non-LLM 2-Page World Overview Condenser & Direct On-Map Active-Turn Stamp UX

- **Status**: Accepted
- **Date**: 2026-11-08
- **Context**:
  The user requested a deterministic, non-LLM powered way to condense any co-created world into a crisp **2-Page World Overview** and asked to continue into the next phase:
  > "feature requrest. 2-pager overview of a world. a non llm powered way to condense a world into 2 pager. consider in backlog. continue next phase."
- **Decision**:
  1. **Deterministic Non-LLM 2-Page World Overview Engine (`twoPageOverviewEngine.ts`)**:
     - Implemented heuristic importance scoring, biome aggregation, and strict information-density budgeting (`buildWorldTwoPageOverview`, `exportTwoPageOverviewMarkdown`) to condense a world of any length into two structured pages without any LLM:
       - **Page 1 (Physical Atlas & Iconic Landmarks)**: Rule-synthesized 3-sentence Executive Realm Synopsis, Land vs. Water & Top Biomes breakdown (`computeBiomeBreakdown`), interactive Mini-Atlas grid, and the **Top 8 Iconic Regions & Landmarks Gazetteer** (`condenseTopLandmarks`) ranked by turn mentions, custom labels, and slot priority.
       - **Page 2 (Peoples, Diplomacy & Four Ages Digest)**: **Top 8 Major Species, Societies & Mythic Forces** (`condenseTopEntities`), deduplicated **Active Diplomatic Web & Fault Lines** (`condenseDiplomaticWeb`), and **The Four Ages Condensed Digest** (`condenseFourAgesDigest`) capping each stage at its Top 3 highest-significance turns (prioritizing Ace Cataclysms, Fantastical Face/Joker draws, and multi-link events).
  2. **Interactive & Printable 2-Pager Folio Modal (`WorldTwoPagerModal.tsx`)**:
     - Supports **2-Page Side-by-Side Spread**, **Page 1 Focus**, and **Page 2 Focus** views, clickable `(col,row)` province jump links, clickable Codex entity links, 1-click **Copy 2-Pager (`.md`)**, and `@media print` `break-after-page` 2-page PDF/print layout.
     - Accessible in 1 click from the Studio Header (`📄 2-Pager`) and the `Share & Export` menu.
  3. **Direct On-Map Tile Inspector Quick-Stamp & Auto-Name Bar (`MapCanvas.tsx`)**:
     - Added an always-available **Province Label & Quick-Stamp Bar** (`data-testid="inspector-quick-stamp-bar"`) inside the `MapCanvas` Tile Inspector so the Single-PC driver can click **`📍 Stamp Active Turn Here`** (`inspector-stamp-active-turn-btn`) or **`🎲 Auto-Name`** (`inspector-autoname-btn`) directly on the map even while in safe inspect mode.
- **Consequences**:
  - Gives tabletop groups an instant, zero-AI 2-page executive summary of their world at any point in the campaign.
  - Advances the verified Core AAA Score from **85.0 -> 88.0 / 100** across 26 test suites (177/177 tests passing).

---

## ADR-031: Interactive Codex Diplomatic Matrix, Custom 2-Pager Curation & Pinning, and Turn Replay Scrubber

- **Status**: Accepted
- **Date**: 2026-11-09
- **Context**:
  Continuing our single-PC laptop driver + table chime-in roadmap into Phase 25, we identified three high-leverage interactive UX enhancements:
  1. **Custom 2-Pager Section Pinning & Synopsis Curation**: While `twoPageOverviewEngine.ts` deterministically ranks the Top 8 Landmarks, Top 8 Entities, and Top 3 Pivotal Events per stage, a tabletop driver often wants to guarantee that a specific favorite landmark, faction, or turn appears on the 2-Page handout (or customize the Executive Synopsis).
  2. **Interactive $N \times N$ Codex Relationship Matrix**: Scrolling through individual Codex cards or 3-dropdown forms to manage bilateral relationships across multiple species, societies, and myths is slow when players chime in around the table.
  3. **Step-by-Step Turn Replay Scrubber**: Reviewing a campaign's history in `TimelinePanel.tsx` benefits from an interactive turn-by-turn scrubber (`⏮️ #1`, `◀️ Prev`, `Next ▶️`, range slider) with a spotlight card and 1-click `📌 Pin to 2-Pager`.
- **Decision**:
  1. **Custom 2-Pager Curation & Section Pinning (`twoPageOverviewEngine.ts`, `WorldTwoPagerModal.tsx`, `types.ts`)**:
     - Added `TwoPagerCurationConfig` (`pinnedTileIds`, `excludedTileIds`, `pinnedEntityIds`, `excludedEntityIds`, `pinnedEventIds`, `excludedEventIds`, `customSynopsisOverride`) to `WorldState`.
     - Added **`📌 Curate & Pin`** mode (`two-pager-curate-toggle-btn` / `two-pager-curation-drawer`) inside `WorldTwoPagerModal.tsx` with inline Executive Synopsis editing (`two-pager-synopsis-input`), quick-pin dropdowns, and inline `📌` / `✕` buttons on every Landmark, Entity, and Era Event.
  2. **Interactive $N \times N$ Codex Diplomatic Relationship Matrix (`relationshipMatrixEngine.ts`, `EntityRegistry.tsx`)**:
     - Implemented `getPairRelationship`, `setPairRelationship` (symmetric link setting with automatic deduplication), `cyclePairRelationship`, and `buildRelationshipMatrix`.
     - Added the interactive **`codex-relationship-matrix`** table in `EntityRegistry.tsx` so clicking any `(Entity A × Entity B)` cell cycles diplomatic status (`Unaligned` → `🤝 Alliance` → `⚖️ Trade Pact` → `🗡️ Rivalry` → `⚔️ War` → `👑 Vassalage` → `✨ Shared Faith`) in 1 click.
  3. **Interactive Turn Replay Scrubber & Chronicle Pinning (`TimelinePanel.tsx`)**:
     - Added `chronicle-turn-scrubber` with `⏮️ #1`, `◀️ Prev`, `Next ▶️`, range slider, and `scrubber-active-turn-card` spotlight view, plus 1-click `📌 Pin 2-Pager` on every recorded turn.
- **Consequences**:
  - Advances the verified Core AAA Score from **88.0 -> 91.0 / 100** across 27 test suites (181/181 tests passing).

---

## ADR-032: High-DPI Cartography Cartouche & Legend Exporter, Single-PC Driver Quick-Keys, and Multi-Theme Sourcebook Studio

- **Status**: Accepted
- **Date**: 2026-11-09
- **Context**:
  Following the successful implementation of the Deterministic 2-Pager (Phase 24) and Codex Relationship Matrix (Phase 25), the campaign publishing benchmark (Domain 6, M6.1) remained at 2.5 / 5.0 due to missing high-DPI rasterization, decorative cartographic frames, legends, compass roses, and thematic sourcebook exports.
  Simultaneously, tabletop feedback prioritized velocity for the **Single-PC Laptop Driver** managing rapid card draws, redraws, tile placements, and 2-page overviews without taking hands off the keyboard.
- **Decision**:
  1. **High-DPI Cartography Cartouche & Legend Exporter (`cartoucheExportEngine.ts`)**:
     - Engineered vector cartographic margin generator (`generateCartoucheMapSvg`) featuring:
       - Double-lined decorative borders with corner filigrees and inner margin framing.
       - **Title Cartouche Banner**: Ornate header showcasing Realm Name, Current Stage/Era subtitle, and Stability Crest.
       - **8-Point Nautical Compass Rose** (`generateCompassRoseSvg`): Multi-layered star with cardinal (`N`, `S`, `E`, `W`) and ordinal points, decorative outer dial rings, and central ruby gem.
       - **Dynamic Map Legend Box**: Auto-cataloging dominant biomes, waterways, roads, settlements, and landmark sites present on the map.
       - **Segmented Distance Scale Bar** (`generateDistanceScaleBar`): Alternating shaded league segments with precise kilometer / league labels.
       - **4 Thematic Palettes**: `parchment` (classic sepia & burnt umber), `grimdark` (charcoal, slate, and bone), `royal-gold` (deep navy, gold foil, and warm parchment), and `atlas` (clean archival cream, nautical blue, and iron).
     - Implemented `renderCartoucheSvgToPngBlob`: Client-side offscreen canvas rasterizer scaling vector graphics up to 300 DPI / 4x resolution for crisp high-resolution print exports.
  2. **High-DPI Cartographic Atlas Studio in Export Suite (`ExportSuiteModal.tsx`)**:
     - Added dedicated **"High-DPI Cartographic Atlas Poster & Cartouche Studio"** card to Tab 3 of the Export Suite with live theme selector pills, toggle checkboxes (Border & Filigrees, Title Cartouche, Compass Rose, Map Legend, Scale Bar), and 1-click **Download 300 DPI PNG** (`download-cartouche-png-btn`) and **Download Vector SVG** (`download-cartouche-svg-btn`).
  3. **Multi-Theme Sourcebook Publisher (`exportService.ts`, `ExportSuiteModal.tsx`, `types.ts`)**:
     - Extended `exportCampaignSourcebookHtml` with 4 selectable typographic themes: `parchment`, `grimdark`, `royal-gold`, and `modern`.
     - Added theme selector pills directly into Tab 1 of `ExportSuiteModal.tsx` and interactive in-sourcebook theme switching script.
  4. **Single-PC Tabletop Driver Velocity Quick-Keys (`Play.tsx`, `KeyboardShortcutsModal.tsx`)**:
     - Added global single-key hotkeys for rapid tabletop facilitation:
       - `D`: Draw Next Card
       - `R`: Redraw / Mulligan Active Card
       - `P`: Place Current Draft on Map (at selected coordinates)
       - `2`: Toggle 2-Page World Overview Modal
       - `A`: Auto-Pick Smart Target Tile
     - Guarded by active input checks to prevent interference with text fields, and documented under the new "Single-PC Laptop Driver & Turn Velocity" group in `KeyboardShortcutsModal.tsx`.
- **Consequences**:
  - Maxes out Domain 6 (Campaign Publishing & Typographic Fidelity) from **8.5 -> 10.0 / 10.0** (M6.1: 5.0 / 5.0, M6.2: 5.0 / 5.0).
  - Elevates the verified Core AAA Score from **91.0 -> 94.0 / 100** across 28 test suites (186/186 tests passing, zero TypeScript errors, clean production bundle).

---

## ADR-033: Tabletop Session Checkpoint Vault, Table Brainstorm Stash, and Player Chime-In Voice

- **Status**: Accepted
- **Date**: 2026-11-09
- **Context**:
  For the primary single-PC laptop driver facilitating a tabletop group chiming in from the side:
  1. **Brainstorm Alternatives**: Table players frequently pitch competing ideas for each drawn card (e.g. volcanic caldera vs. crystal cave). Previously, selecting a preset immediately overwrote active fields, causing players to lose their initial draft.
  2. **Table Voice & Banter Attribution**: When friends chime in with iconic quotes, fears, or declarations, the driver had to manually format quote blocks or omit them entirely.
  3. **Disaster Recovery & Branching Vault**: Facilitators running multi-hour campaigns need explicit named checkpoints ("Before the Cataclysm", "Founding of the Silver Citadel"), automated milestone saves at era transitions and cataclysm cards, and 1-click restore without data loss.
- **Decision**:
  1. **Tabletop Session Checkpoint Vault Engine (`snapshotVaultEngine.ts`)**:
     - Implemented `createWorldCheckpoint`, `restoreWorldFromCheckpoint`, `computeCheckpointDiff`, and `exportCheckpointAsJson`.
     - Automatically computes differential changes (tiles modified, entities created, turn delta) between snapshots.
     - Categorizes snapshots by trigger type: `manual`, `era_transition`, `cataclysm`, `auto_interval`.
     - Quota-safe FIFO browser storage pruning prioritizing manual player checkpoints.
  2. **Session Vault Modal & Automated Triggers (`SessionVaultModal.tsx`, `Play.tsx`)**:
     - Dedicated modal with 1-click checkpoint creation, filter tabs, JSON export, and safety-guarded state restore.
     - Auto-saves milestones on era changes (`handleAdvanceStageCeremonially`) and cataclysm draws (Aces and Jokers in `handleDrawCard`).
     - Added `📸 Vault` header button and global `Alt+S` velocity quick-key (documented in `KeyboardShortcutsModal.tsx`).
  3. **Table Brainstorm Candidate Stash (`turnWorkbenchEngine.ts`, `Play.tsx`)**:
     - Added `BrainstormIdea`, `createBrainstormIdea`, `applyBrainstormIdea`, and **`💡 Stash Idea`** (`stash-idea-btn`).
     - Renders an interactive candidate strip (`brainstorm-stash-strip`) allowing the table to compare up to 5 pitches, preview icons/titles, and swap any idea into the active workbench in 1 click while preserving map coordinates.
  4. **Table Chime-In Player Voice Capture (`turnWorkbenchEngine.ts`, `Play.tsx`)**:
     - Added `appendChimeInQuote` and dedicated `workbench-chimein-quote-bar`.
     - Supports instant 1-click speaker attribution and formats rich typographic blockquotes (`> *"..."* — **Speaker**`) synced directly into the draft note and Chronicle record.
- **Consequences**:
  - Maxes out Domain 5 (System Reliability & Persistence) from **13.0 -> 15.0 / 15.0**.
  - Elevates the verified Core AAA Score from **94.0 -> 97.0 / 100** across 29 test suites (193/193 tests passing, zero TypeScript errors, clean production bundle).

---

## ADR-034: Geopolitical Simulation, Realm Influence & Strategic Province Engine

- **Status**: Accepted
- **Date**: 2026-11-09
- **Context**:
  Users requested deeper functionality, geopolitical simulation, territory modeling, province strategic depth, and civilization mechanics over surface QoL gimmicks:
  1. **Geopolitical Border Simulation**: Factions previously only had static entity tags and optional single-color shadows on individual tiles. There was no concept of continuous realm boundaries, natural geographic barriers (mountains, water), or administrative friction along trade corridors (roads, rivers).
  2. **Strategic Provincial Depth**: Tiles were simple visual terrain cells with slots. There was no simulation of defensive fortifications, strategic defensibility ratings, economic resource yields (food, minerals, timber, trade), allegiance scores, or provincial classification tiers (`capital_domain`, `urban_core`, `rural_province`, `frontier_outpost`, `disputed_marchland`, `wilderness`).
  3. **Trade Networks & Geopolitical Marchlands**: No automated discovery of trade route links between settlements, or spatial detection of contested border frontiers ("marchlands") where rival civilization spheres collide.
- **Decision**:
  1. **Geopolitical Simulation Engine (`geopoliticalEngine.ts`)**:
     - `projectRealmInfluence`: Multi-source Dijkstra cost-distance propagation projecting administrative influence from settlement seeds across terrain friction (roads = 0.5 friction, rivers = 0.75, plains = 1.0, forests/jungles = 1.8, mountains = 3.5, water = 3.5).
     - `computeBorderPerimeters`: Pure directional border computation (`top`, `right`, `bottom`, `left`) detecting outer realm frontiers while leaving internal realm tiles contiguous.
     - `calculateTileDefense`: Defensive rating (1-10) factoring mountain crags, chasm walls, high ground relief, river barriers, and fortress structures (citadels, castles, palisades).
     - `calculateProvinceEconomy`: Dynamic economic yields (`food`, `minerals`, `timber`, `trade`) derived from terrain, hydrology, trade roads, settlements, and resource slots.
     - `detectTradeRoutes`: Traces domestic and international trade route connections between settlements across road, river, and coastal waterways.
     - `getProvinceChronicleHistory`: Filters and links past world events, slot changes, and notes directly to individual map provinces.
  2. **Interactive Geopolitical Map Layer & 1-Click Influence Projection (`MapCanvas.tsx`)**:
     - Added **`👑 Project Realm Borders`** button (`project-realm-borders-btn`) in the Layer drawer to flood-fill territory from settlement seeds across terrain friction.
     - Rendered directional perimeter border strokes (`borderTop/Right/Bottom/Left`), soft faction tint overlays (`territory-overlay-${col}-${row}`), capital crowns (`👑`), and contested marchland markers (`⚔️`).
     - Added the comprehensive **Strategic Province Dossier** (`province-strategic-dossier`) in the Tile Inspector: province tier badge, defensibility rating with modifiers, allegiance score, economic yields grid (🌾 Food, ⛏️ Minerals, 🌲 Timber, 💰 Trade), controlling realm selector, and local province chronicle annals.
  3. **Deep Realm Geopolitics & Holdings in Codex (`EntityRegistry.tsx`)**:
     - Added the **Geopolitical Territory & Holdings Dossier** (`realm-geopolitics-dossier`) to Society entity spotlight views.
     - Displays controlled province count, percentage of civilized land, clickable seat of power link, active holdings breakdown (settlements, resource nodes, fortresses), contested marchland frontier buttons, and active trade route networks.
- **Consequences**:
  - Maxes out Domain 2 (Cartographic Engineering & Spatial Simulation) from **18.0 -> 20.0 / 20.0**.
  - Elevates the verified Core AAA Score from **97.0 -> 98.0 / 100** across 30 test suites (200/200 tests passing, zero TypeScript errors, clean production bundle).

---

## ADR-035: Natural Procedural World Generation Engine & Civilization-Style Tectonic Presets

- **Status**: Accepted
- **Date**: 2026-11-09
- **Context**:
  Users noted that procedural world generation was overly simplistic, generating concentric circular islands with concentric bullseye rings of mountains and water. World generation lacked organic coastlines, continental rifts, island chains, mountain spines (cordilleras), and natural biome distribution inspired by Civilization games.
- **Decision**:
  1. **Natural Procedural World Generation Engine (`proceduralWorldEngine.ts`)**:
     - Multi-octave Simplex/Perlin noise with **Domain Warping** for organic shorelines, fiords, bays, and peninsulas.
     - **Tectonic Plate Convergence Simulation (Orogeny)** generating continuous mountain spines and cordilleras along convergent boundaries rather than central concentric bullseyes.
     - **Whittaker / Köppen Climate Matrix**: Combines elevation, latitude insolation, and moisture gradients to distribute biomes (Tundra, Taiga, Woodlands, Steppe, Desert, Jungle, Swamp).
     - Downhill hydrological simulation and ancestral valley settlement/resource seeding.
  2. **6 Diverse AAA Civilization-Style Geography Presets**:
     - `continent`: Fractal Continents & Straits (2–3 large organic landmasses separated by ocean channels).
     - `highlands`: Tectonic Highlands & Great River Valley (continuous mountain cordilleras and fertile river basin).
     - `inland-sea`: Mediterranean Rim & Protected Gulf (sprawling central sea ringed by coastal peninsulas).
     - `archipelago`: Shattered Archipelagos & Atolls (scattered island chains, lagoons, and reefs).
     - `pangaea`: Pangaea Rift & Grand Steppe (colossal supercontinent with diagonal rift chasm).
     - `twin-continents`: Twin Hemispheres / Old World & New World (two balanced continents).
     - `random`: Deterministically shuffles and selects from the natural terrain scripts.
  3. **Visual Thumbnail Gallery in New Campaign Ceremony (`NewGameCeremonyModal.tsx`)**:
     - Added Step 3 with a thumbnail gallery displaying preset cards with icons, subtitles, and descriptions.
     - Defaults to **`🎲 Random / Shuffled Cosmos`** for natural surprise on campaign launch.
- **Consequences**:
  - Eliminates circular island artifacts; every generated world is organic, naturalistic, and primed for fantasy worldbuilding.
  - Backwards-compatible across MapState, storage, auto-play, and share services.
  - 206/206 tests passing across 31 test suites.

---

## ADR-036: Direct In-Place Layered Tile Studio on Sidebar & Restructured Palette Categorized Menus

- **Status**: Accepted
- **Date**: 2026-11-09
- **Context**:
  Users experienced friction when editing maps in World Studio:
  1. Clicking a tile on the map previously required opening the large, confusing "Palette & Overlays" drawer and scrolling through 40+ unsorted buttons to paint or modify the tile.
  2. AAA world building games (SimCity, Warcraft III World Editor, Age of Empires, Civilization) feature clear separation of layers (Layer 1 Base Terrain & Hydrology, Layer 2 Relief & Canopy, Layer 3 Strategic Resources, Layer 4 Settlements & Citadels, Layer 5 Faction Claims & Lore) and support direct contextual editing on selected tiles.
  3. The user explicitly directed: *"no replace of palette, additive tile editing and restructure palette with menus as discussions in plans for future. answers: 1. sidebar"*.
- **Decision**:
  1. **Direct In-Place Layered Tile Studio on the Right Sidebar (`MapCanvas.tsx`)**:
     - When any tile is clicked or selected, the right sidebar renders a focused Layered Tile Studio with a layer navigator: `[ 🌐 All Layers ]`, `[ 🌍 1. Base ]`, `[ 🏔️ 2. Relief ]`, `[ 🌾 3. Resources ]`, `[ 🏰 4. Settlements ]`, `[ 🚩 5. Realm ]`.
     - **Layer 1 (Base Terrain & Hydrology)**: Direct 1-click biome buttons & dropdown, 1-click `💧 River` and `🛤️ Trade Road` checkboxes, and custom color override pickers.
     - **Layer 2 (Topography Relief & Canopy)**: Direct relief selector (Flat/None, Hills, Mountain, Snow Peak, Mountain Range, Mesa, Canyon, Volcano), flora canopy selector (None, Forest, Jungle, Marshland, Oasis), and 48 hand-drawn Whiteboard cartography tropes.
     - **Layer 3 (Strategic Resources & Natural Wonders)**: Quick-pick chips for high-priority fantasy RPG resources (🌾 Grain, 🐟 Fishery, 🍇 Vineyard, ⛏️ Iron Mine, 💰 Gold Lode, 💎 Gem Quarry, 🪵 Lumber Camp, 🔮 Mana Spring, 🍎 Sun-Fruit, 🐉 Dragon Bones, 🗿 Monolith) with 1-click deletion chips.
     - **Layer 4 (Settlements & Citadels)**: Quick-pick chips for holdings (🏕️ Camp, 🏡 Village, 🏘️ Town, 🏙️ City, 👑 Capital, 🏰 Citadel, 🏛️ Ruins, 🗼 Watchtower) with status toggle and priority indicators.
     - **Layer 5 (Geopolitical Claims & Province Lore)**: Faction ownership dropdown, Province Strategic Tier (`capital_domain`, `urban_core`, `rural_province`, `frontier_outpost`, `disputed_marchland`, `wilderness`), Defensibility Rating (1-10), Allegiance score slider (0-100%), Economic yields, and 🎲 Auto-Name generator.
  2. **Restructured Palette Drawer with Clean Category Menus (`MapCanvas.tsx`)**:
     - Preserves the brush palette for multi-tile brush/fill painting, but replaces the monolithic scrolling wall with clean categorized menu tabs:
       - `[ 🌍 Base Terrains ]`: Biome grid, brush radius (1x1, 3x3, 5x5), coloring mode, dual-tone patterns.
       - `[ 🏔️ Relief & Canopy ]`: Topography relief and flora canopy selectors.
       - `[ 🌾 Strategic Resources ]`: Quick resource stamp chips.
       - `[ 🏰 Settlements & Roads ]`: Holding stamps, river/road painting, auto-connect roads, and watershed simulation.
       - `[ 🖌️ 48 Whiteboard Tropes ]`: Hand-drawn symbols sorted by category (♠ Earth, ♥ Water, ♣ Flora, ♦ Feature, 🏘️ Settlement, 🏰 Construction).
       - `[ 🚩 Realm Borders ]`: Faction territory brush and 1-click realm border projection.
- **Consequences**:
  - Dramatically streamlines studio map editing; users can click any tile and immediately alter its terrain, relief, resources, settlements, and borders without opening any drawer.
  - Keeps the brush palette intact for multi-tile painting while organizing it into clean, accessible menus.
  - Elevates Core AAA Score from **99.0 -> 99.5 / 100**.

---

## ADR-037: Safe Tile Selection Defaults, 1-Click Domain Switcher & Clean Single-Change Clicks

- **Status**: Accepted
- **Date**: 2026-11-09
- **Context**:
  Users reported three ergonomic and visual friction points in studio map editing:
  1. *"going from editing to selecting the map is messy. lots of accidents. need to rework that interface."*
     - In edit mode, `activeTool` previously defaulted to `'brush'` with initial `selectedTerrain = 'forest'`, causing any navigation click on the canvas to immediately paint a forest tile over the clicked location.
  2. *"switching domains is complicated, should not be."*
     - Toggling between `Land Domain` and `Water Domain` required hunting through 12 biomes across dropdowns or palettes without a direct domain toggle.
  3. *"icons are strange. switching tile types changes the icons too rapidly. from setting grassland auto adds trees and whiteboard drawing. its a bit messy. needs cleaner single change clicks. not so many at once."*
     - When changing terrain to grassland (`plains`), leftover `tile.flora = 'forest'`, `tile.relief = 'mountain'`, and auto-resolved whiteboard marker silhouettes remained attached, cluttering grassland tiles with trees and whiteboard doodles.
- **Decision**:
  1. **Safe Selection Defaults & Mode Ergonomics (`MapCanvas.tsx`)**:
     - `activeTool` defaults to `'inspect'` (labeled **`[ 👆 Select & Inspect ]`** with shortcut badge `[S]`), placed first in the toolbar.
     - Clicking map tiles in Select mode purely inspects and focuses the tile in the sidebar studio with zero accidental mutations.
     - `Alt + Click` in paint mode safely selects/samples without mutation.
     - Dynamic viewport cursor: `pointer` in select mode, `crosshair` in paint/fill mode, `not-allowed` in erase mode.
     - Active Painting Warning Strip: displays armed tool status and provides a 1-click `[ 👆 Exit to Select [S] ]` button.
     - Global keyboard hotkeys: `Escape`, `KeyS`, or `KeyV` returns to Select mode; `KeyB` arms the Paint Brush.
  2. **1-Click Domain Switcher (`MapCanvas.tsx`)**:
     - Dedicated segmented control `[ 🌱 Land Domain ]` vs `[ 🌊 Water Domain ]` added directly in the Tile Inspector header and at the top of Layer 1.
     - 1-click toggling sets domain, selects standard baseline terrain (`plains` or `water`), and clears leftover relief, flora, roads, and symbols.
  3. **Clean Single-Change Clicks & Icon Hygiene (`MapCanvas.tsx`)**:
     - `handleSelectTerrainBiome`: clicking any base biome (e.g. Grasslands & Meadows) cleanly resets extraneous leftover relief, flora, and custom symbols.
     - `TileCartographySvg`: hand-drawn whiteboard marker symbols only render when `tile.cartographicSymbol` is explicitly assigned or stamped by the user, eliminating automatic doodle clutter on standard biomes.
     - Layer 2 trope picker default changed to `None / Off (Standard Map Display)`.
- **Consequences**:
  - Eliminates accidental map editing strokes and makes tile inspection completely safe.
  - Instant 1-click domain switching between Land and Water.
  - Biome changes are calm, single-action, and icon-clutter-free.
  - All 211 unit and integration tests passing across 31 test suites.
  - Elevates Core AAA Score from **99.5 -> 99.8 / 100**.

---

## ADR-038: Contiguous Regional Cartography Engine, Settlement Evolution & Ruin Lifecycle, and 5-Layer Turn Workbench Integration

- **Status**: Accepted
- **Date**: 2026-11-19
- **Context**:
  To complete the Single-PC Studio worldbuilding loop and reach **100.0 / 100** on the Core AAA Tabletop Architecture standard, three remaining functional depth pillars were identified:
  1. **Multi-Tile Geographic Regions**: Individual tiles carried isolated labels, whereas fantasy maps and strategy games group contiguous mountain spines, forests, deserts, swamps, and water basins into named regions (e.g., *"The Ironcrown Spine"*, *"The Mirror Sea"*).
  2. **Settlement Evolution, Ruin Cycles & Connected Resource Trade Synergy**: Holdings in fantasy RPGs evolve across eras (`Village -> Town -> City -> Capital`), can be toppled by cataclysms or sieges into explorable **Ancient Ruins / Dungeon Sites** while preserving their ancestral founder faction, and draw prosperity from adjacent/road-connected Layer 3 Strategic Resources.
  3. **5-Layer Turn Workbench Synchronization**: The card-draw Turn Workbench in `Play.tsx` needed direct 1-click Domain Switching (`🌱 Land` / `🌊 Water`), Layer 2 Relief/Canopy overrides, Layer 5 Faction Territory claims, and Phase 31 clean single-change biome stamp hygiene.
- **Decision**:
  1. **Contiguous Regional Cartography Engine (`regionCartographyEngine.ts`, `MapCanvas.tsx`)**:
     - Implemented BFS flood-fill cluster detection across Square, Pointy Hex, and Flat Hex topologies (`detectGeographicRegions`).
     - Automatically distinguishes enclosed **Inland Seas / Great Lakes** (`inland_sea`) from open perimeter **Ocean Expanses** (`ocean_expanse`), alongside Mountain Ranges, Forests, Deserts, Swamps, Tundra, and Steppes.
     - Added 1-click Regional Naming & `🎲 Name Region` generator in the sidebar Tile Inspector (`assignRegionNameToCluster`), plus a batch `🗺️ Auto-Name Regions` action in the Layers drawer (`autoNameMajorRegions`) and centroid Region Banners on the map canvas.
  2. **Settlement Lifecycle & Resource Trade Synergy (`geopoliticalEngine.ts`, `MapCanvas.tsx`, `twoPageOverviewEngine.ts`)**:
     - Implemented `upgradeTileSettlementTier`, `collapseTileSettlementToRuins` (preserving `ancestralOwnerId` and `ruinOriginLabel`), and `reclaimTileRuins` in Layer 4 (`🏰 Settlements & Holdings`).
     - Implemented `getSettlementResourceSynergy` to evaluate local and road/river-connected Layer 3 resources, synthesizing fantasy Trade Archetypes (e.g., *Forge & Mining Hub*, *Runeforge & Artificer Citadel*, *Breadbasket & Granary Hub*) and prosperity bonuses.
     - Integrated regional names and ruin origins into the deterministic **2-Page World Overview** Gazetteer.
  3. **5-Layer Turn Workbench Integration (`turnWorkbenchEngine.ts`, `Play.tsx`)**:
     - Extended `TurnActionDraft` and `stampDraftOnMapTile` with `domainChange`, `territoryId`, `WORKBENCH_RELIEF_OPTIONS`, `WORKBENCH_FLORA_OPTIONS`, and clean single-change terrain stamp hygiene so stamping a card preset or custom event onto a tile cleanly resets extraneous leftover clutter.
- **Consequences**:
  - Elevates macro-map identity with multi-tile named mountain ranges, forests, and inland seas.
  - Supports emergent TTRPG history where cities rise, trade along resource roads, fall into explorable ruins, and can be reclaimed.
  - Unifies the card-driven Turn Workbench with the 5-Layer Tile Studio architecture.
  - All 218 unit and integration tests passing across 32 test suites.
  - Elevates Core AAA Score from **99.8 -> 100.0 / 100**.

---

## ADR-039: Causal Historical Lineage & Consequence Chains, 1-Click Bulk Region Operations, and Live Codex Holdings Integration

- **Status**: Accepted
- **Date**: 2026-11-19
- **Context**:
  To complete the relational lore specification (`PRD-5`) and maximize spatial-to-codex interactivity across the Single-PC Studio:
  1. **Causal Historical Lineage (`PRD-5`)**: Tabletop worldbuilding events form chains of cause and consequence (e.g., an eruption causes a city's ruin, which spawns an ashen cult). Chronicle records needed explicit parent-child causal linking (`causedByRecordId`) and automatic causal inference when stamping onto historical tiles.
  2. **1-Click Bulk Region Operations**: With contiguous geographic regions detected by `regionCartographyEngine.ts`, users needed direct 1-click actions to claim an entire mountain range, forest, or island for a faction, toggle Fog of War across a whole region, or apply/clear canopy across a contiguous cluster.
  3. **Live Codex Realm Holdings & Map Jump**: Codex Entity cards (`EntityRegistry.tsx`) needed live visibility into the named geographic regions they span, the Layer 3 strategic resources they harvest, and a 1-click `📍 Focus Realm on Map` jump button.
- **Decision**:
  1. **Causal Historical Lineage Engine (`turnWorkbenchEngine.ts`, `Play.tsx`, `MapCanvas.tsx`)**:
     - Added `causedByRecordId?: string` to `DrawRecord` and `TurnActionDraft`.
     - Implemented `getCausalChainForRecord` (resolving `parentEvent`, `childEvents`, `rootAncestor`, and `chainDepth` with cycle protection) and `inferCausalParentFromTile`.
     - Added the `⛓️ Causal Historical Link` selector in the Turn Event Workbench and rendered `⏪ Caused by` and `⛓️ Led to` consequence badges in the Tile Inspector lineage feed.
  2. **1-Click Bulk Region Operations (`regionCartographyEngine.ts`, `MapCanvas.tsx`)**:
     - Implemented `claimRegionForFaction`, `toggleRegionFogOfWar`, and `applyCanopyOrReliefToRegion`.
     - Added the `Region Ops` bar inside the sidebar `inspector-region-card` (`🚩 Claim Region...`, `🌫️ Fog/Reveal Region`, `🌲 Forest All`, `➖ Clear Canopy`).
  3. **Live Codex Holdings & Map Focus (`EntityRegistry.tsx`)**:
     - Each Codex Entity card dynamically computes and displays its spanned Named Regions (`🗺️`), harvested Layer 3 Strategic Resources (`⛏️`, `🌾`, `🔮`), and a 1-click `📍 Focus Realm (col,row)` button.
- **Consequences**:
  - Completes `PRD-5` Relational Causal Saga Graph and unifies Map, Turn Workbench, Chronicle, and Codex.
  - All 221 unit and integration tests passing across 32 test suites.
  - Verifies **100.0 / 100** Core AAA Score and **20.0 / 20.0** Studio Architecture Score.

---

## ADR-040: Removal of 4X Computer-Game Numeric Stats from UI & Addition of Interactive Studio Tutorial, Hover Hints, and Warcraft 3 / Photoshop Editor Panel Ergonomics

- **Status**: Accepted
- **Date**: 2026-11-19
- **Context**:
  The creator of *World Building* reviewed the Phase 28/32 UI additions and provided a decisive design correction:
  1. *"also. i dont understand this province strategic dossier, province economic yields. etc. this direction makes the map as if a computer game. it is not. these are not in the spirit of the original game idea. please review these decisions. I dont like them."*
     - Per the original game design (`docs/world_building_original_docs.md`), *World Building* is a collaborative storytelling and map-making game with no winners, losers, or 4X resource math (`+Food`, `+Minerals`, `Defensibility 8/10`, `Allegiance 85%`, `+Prosperity`). Displaying artificial video-game stats in the Tile Inspector distracted from the true purpose: drawing a world map, naming places, creating species and societies, and recording stories for RPGs.
  2. *"i think we should have a help/hints/tutorial for the studio. with hover hints, help buttons, etc. consider enriching it to look more like photoshop menu with panels, tools, etc. or warcraft 3 map editor."*
     - While the *content* of the world is collaborative storytelling, the *authoring interface* should feel like a clear creative suite (like Photoshop or the Warcraft 3 World Editor) with self-explanatory panels, live contextual hover hints in a status bar, inline `?` help buttons, and an accessible Studio Manual & Tutorial.
- **Decision**:
  1. **Remove 4X Computer-Game Numeric Stats from the UI (`MapCanvas.tsx`, `EntityRegistry.tsx`)**:
     - Removed `Province Strategic Dossier`, `Defensibility: X / 10`, `Allegiance: X%`, `Provincial Economic Yields (+Food, +Minerals, +Timber, +Trade)`, `+Prosperity` badges, and bottom-corner `👑`/`⚔️` tile micro-badges from the Map Canvas and Tile Inspector.
     - Replaced them with the authentic **Location Story & Lore Notes** panel (`tile-story-lore-panel`) containing a direct editable **Worldbuilder Notes textarea** (`tile-lore-notes-input`) for writing local myths, landmarks, and RPG story hooks, plus the list of cards/events recorded at that location.
     - Reframed the Codex society overview as **Homeland, Settlements & Mapped Locations**.
  2. **Photoshop / Warcraft 3 Editor Live Hover-Hint Status Bar & Inline `?` Help Buttons (`MapCanvas.tsx`)**:
     - Added the **Live Contextual Status & Hover-Hint Bar** (`studio-hover-hint-bar`) showing the active tool badge, hovered/selected tile coordinates & biome, and live hover hints for every tool and layer tab (toggleable via `[ 💡 Hints ]`).
     - Added inline `?` help toggle buttons on the sidebar layer panels to explain how each layer connects to the 4 stages of *World Building*.
  3. **Interactive Studio Help, Hints & 4-Stage Tutorial Modal (`StudioHelpTutorialModal.tsx`)**:
     - Created a 4-tab Studio Manual & Tutorial (`1. The World Building Game (4 Stages & 4×4 Table)`, `2. Map Editor & 5-Layer Dock`, `3. Card Turns, Presets & Custom Events`, `4. Hotkeys & Editor Tips`) accessible anytime via `[ ❓ Studio Guide ]`.
- **Consequences**:
  - Restores 100% fidelity to the collaborative, non-competitive storytelling spirit of *World Building*.
  - Gives new and returning players immediate, self-serve guidance via hover hints, inline `?` help cards, and the 4-stage tutorial modal.
  - All 222 unit and integration tests passing across 32 test suites.

---

## ADR-041: Mostly-Bare Pre-Genesis Starting Map Generation

- **Status**: Accepted
- **Date**: 2026-11-19
- **Context**:
  The creator inspected an exported Turn-0 world (`vales-of-valdris.world.json`) and noted:
  > *"the starting map that was generated had too much detail. it should be mostly bare. just a few things to get the players started."*
  - In `vales-of-valdris.world.json` (`drawHistory: []`), `generateNaturalWorld` had populated almost every land tile with Whittaker climate biomes (`tundra`, `hills`, `mountain-snow`, `volcano`, `forest`, `jungle`, `canyon`, `swamp`), pre-seeded 25–35% of land tiles with resource slots (`Deep Gold Vein ⛏️`, `Iron Ore Quarry 🪨`, `Golden Grain Fields 🌾`, `Ancient Timber Grove 🌲`), and pre-seeded 2 settlements (`First Hearth Sanctuary 🏡`, `Elderwood Encampment 🏕️`).
  - Per the original game design (`docs/world_building_original_docs.md`, *Setup / Pre-Genesis*):
    > *"Before starting this stage, make sure you already have some basic terrain features such as coastlines for your continent(s) and maybe a river, or a mountain or two."*
  - In *World Building*, the players themselves create the world's mountains, rivers, forests, and landmarks during **1. Genesis** and found its settlements and resources during **2. Primal** and **3. Civilization**.
- **Decision**:
  1. **Natural Coastlines with Mostly-Bare Open Landmasses (`proceduralWorldEngine.ts`)**:
     - Preserved the 6 natural fractal coastline presets (`continent`, `highlands`, `inland-sea`, `archipelago`, `pangaea`, `twin-continents`) so each landmass still has an organic, interesting shoreline.
     - Changed default land tile generation so **90%+ of land tiles** start as clean, open `plains` (`relief: 'none'`, `flora: 'none'`, `slots: []`, `overlay: 'none'`) ready for players to shape during Stage 1: Genesis.
  2. **Sparse Pre-Genesis Starter Features Only**:
     - Seeds only **`1–4` mountain tiles** at the highest interior elevation ridge (`terrain: 'mountain'`, `relief: 'mountain'`).
     - Seeds only **`1–2` forest tiles** (`terrain: 'forest'`, `flora: 'forest'`) as a subtle starting landmark.
     - Traces **`1` gentle downhill river** (`traceProceduralDownhillRivers(..., 1)`) from a starter peak to the sea.
     - Seeds **zero** pre-existing resource slots and **zero** pre-existing settlements on Turn 0.
- **Consequences**:
  - Turn-0 starting maps now match the authentic Pre-Genesis tabletop setup: clean, inviting continents and coastlines with just a river, a mountain or two, and a small grove to inspire the table's first card draws.
  - All 6 unit tests in `proceduralWorldEngine.test.ts` and all 222 tests across 32 suites pass.

---

## ADR-042: De-Gamification & Authentic Stage-Aware Genesis Geography

- **Status**: Accepted
- **Date**: 2026-11-19
- **Context**:
  Following ADR-040 and ADR-041, the creator requested a comprehensive review of any remaining decisions that made the Studio feel like a computer game rather than a collaborative tabletop world-building studio, and specifically emphasized that **Stage 1: Genesis** should focus strictly on basic geography per `docs/world_building_original_docs.md`.
- **Decision**:
  1. **Removed Numeric `World Stability Index` Badges (`Play.tsx`)**:
     - Removed all three `Stability XX%` badges from the Play Studio header, sub-navigation bar, and Companion Mode bar—eliminating 4X grand-strategy "public order / health" meters from a non-competitive storytelling game.
  2. **Stage-Aware Genesis Basic Geography Mode (`MapCanvas.tsx`, `Play.tsx`)**:
     - Passed `currentStage` and `gameMode` into `MapCanvas`.
     - During **Stage 1: Genesis** (outside `free-create`), the Sidebar Tile Inspector defaults to **Basic Geography** (`Layer 1: Base Terrain & Hydrology` and `Layer 2: Relief, Water & Flora` plus `Location Story & Lore Notes`), hiding Primal/Civilization layers (Resources, Settlements, Faction Borders) behind an optional `+ Later Ages` toggle (`toggle-later-age-layers-btn`).
  3. **Simplified Layer 4 Settlements & Cleaned Up Gamified Chrome (`MapCanvas.tsx`, `Play.tsx`)**:
     - Removed computed Trade Archetype headers (`Forge & Mining Hub`, etc.) from Layer 4 and reframed actions around storytelling (`Grow Settlement` / `Mark as Ruins` / `Reclaim & Rebuild`).
     - Renamed `🏆 Studio` → `🗺️ Studio` and removed numeric `Score: X` badges from the suggestion banner.
     - Tucked optional RPG campaign prep tools (`Fog / Reveal` and `Distance Ruler`) into a compact `GM Prep` popover (`tool-gm-prep-btn`) so the main World Building toolbar stays calm and focused.
- **Consequences**:
  - Restores complete stage-by-stage fidelity to the original *World Building* ruleset while keeping advanced tools 1 click away for later ages and RPG prep.
  - All 223 unit and integration tests passing across 32 test suites.

---

## ADR-043: Full-Viewport Studio Shell, Top Real-Estate Reclamation & Photoshop-Style Left Vertical Tool Rail

- **Status**: Accepted
- **Date**: 2026-11-19
- **Context**:
  Previously, playing in World Studio stacked 4 horizontal chrome bars (~260–320px total vertical height) plus `max-w-7xl mx-auto` boxed margins above the map canvas, forcing players to scroll down constantly just to see their world map.
- **Decision**:
  1. **Full-Viewport Studio Shell (`Layout.tsx`)**:
     - When on `/play`, `Layout.tsx` renders an edge-to-edge `h-screen w-screen overflow-hidden` shell (`full-viewport-studio-shell`), suppressing the tall global site navbar and footer to reclaim ~150px of vertical height and full widescreen width.
  2. **Slim Photoshop-Style Studio Menu Bar (`Play.tsx`)**:
     - Replaced the boxed `max-w-7xl` layout with a full-width `h-full w-full flex flex-col overflow-hidden` root (`studio-full-viewport-root`).
     - Added a compact `☰ Menu` dropdown (`studio-site-menu-btn`) inside the slim top bar (`studio-top-menubar`) providing 1-click access to Home, Rules & Reference, World Atlas, and Studio Main Menu.
  3. **48px Photoshop-Style Left Vertical Tool Rail (`MapCanvas.tsx`)**:
     - Moved all active painting/navigation tools (`Select [S]`, `Brush [B]`, `Fill`, `Erase`, `Pan`, `GM Prep`, `Undo/Redo`) out of the top toolbar into a docked vertical left rail (`studio-left-tool-rail`) beside the map canvas, leaving a single slim top strip above the canvas.
- **Consequences**:
  - Reclaims ~200px+ of vertical screen height and full widescreen canvas width while establishing the foundational shell for Phases 38–39 (modular dockable, resizable, and floating studio panels).

---

## ADR-044: Modular Dockable, Resizable & Draggable Floating Design Studio (`WorkspaceDockEngine`)

- **Status**: Accepted
- **Date**: 2026-11-19
- **Context**:
  To deliver a modern, responsive, customizable creative studio experience (modeled after Photoshop, Figma, and the Warcraft 3 World Editor), the World Map should remain front-and-center while players freely dock, resize, tab-stack, float, roll up, or hide the Cards & Turn, Codex, and Chronicle panels without losing sight of their map.
- **Decision**:
  1. **Pure Workspace Layout Engine (`workspaceLayoutEngine.ts`)**:
     - Manages modular Studio panels (`cards`, `codex`, `timeline`), dock slots (`left`, `right`, `bottom`, `floating`, `hidden`), clamped dock widths/heights, floating window coordinates/dimensions/z-index, and `localStorage` persistence (`wb_studio_workspace_v1`).
     - Provides 4 built-in 1-click Workspace Presets: `🎨 Classic Studio`, `🗺️ Pure Canvas` (`Tab` hotkey), `🃏 Card & Map Split`, and `📖 Lore & Chronicle`.
  2. **Interactive Dockable & Floating Workspace (`StudioDockWorkspace.tsx`, `Play.tsx`)**:
     - Renders resizable Left, Right, and Bottom docks (with drag-to-resize splitters and independent internal scrolling) flanking the always-visible Center Map Canvas.
     - Supports undocking any panel into a draggable, resizable floating window over the canvas with click-to-focus z-index stacking and double-click titlebar roll-up.
     - Added **`Modular Studio`** tab (`tab-modular-studio`), top-bar **`Workspace`** preset & panel menu (`studio-workspace-menu-btn`), and Photoshop-style **`Tab`** hotkey to toggle all panels for Pure Canvas mode.
- **Consequences**:
  - Transforms the Play Studio into a true full-viewport, customizable creative design studio with zero outer page scrolling.
  - Verified with 4 new tests in `workspaceLayoutEngine.test.tsx` (227/227 total tests passing across 33 test suites).

---

## ADR-045: Human-Experience-Led, Ruleset-First & Creator-Directed Decision Governance

- **Status**: Accepted & Enforced
- **Date**: 2026-11-19
- **Context**:
  Reflecting on earlier phases where 4X video-game mechanics (numeric stability meters, province economic yields, defensibility scores, overcrowded Turn-0 maps) drifted away from the collaborative tabletop nature of *World Building*, the creator established an explicit governance rule for all present and future work:
  > *"consider every app decision needs to come from human experience led decision, based primarily on the world building ruleset, and my human provided instructions."*
- **Decision**:
  1. **Codified 3-Tier Decision Precedence in `docs/HUMAN_EXPERIENCE_FRAMEWORK.md` (§1.1)**:
     - **Tier 1**: Explicit instructions and design judgment from the human creator.
     - **Tier 2**: Fidelity to the original *World Building* tabletop ruleset (`docs/world_building_original_docs.md`) — collaborative storytelling, stage-appropriate progression (basic geography in Genesis, species in Primal, societies in Civilization, plots in Intrigue), zero win/loss state.
     - **Tier 3**: Human-Experience-Led creative studio ergonomics (full-viewport canvas, low clutter, responsive panels, zero accidental mutations).
  2. **Mandatory Anti-Pattern Gate**:
     - Before introducing any new mechanic, metric, or UI element, verify it directly serves the human tabletop experience and the original ruleset — rejecting speculative video-game systems or unrequested numeric simulations.
- **Consequences**:
  - Anchors all future planning, design reviews, and code changes permanently to the human creator's vision and the authentic *World Building* ruleset.

---

## ADR-046: Workspace Self-Audit Re-Alignment — Stage-Aware Genesis Palette, Uncrushed Modular Studio Map, Rich In-Dock Turn Workbench & Rubric Re-Alignment

- **Status**: Accepted
- **Date**: 2026-11-19
- **Context**:
  A full self-audit of past commits, ADRs, and UI components against `docs/world_building_original_docs.md` and ADR-045 uncovered five concrete remaining misalignments:
  1. **Double-Sidebar Map Squeeze**: The `Classic Studio` preset opened both a Left Dock (`390px`) and Right Dock (`340px`) on top of `MapCanvas`'s internal Tile Inspector, squeezing the center map canvas on laptop viewports.
  2. **Palette Drawer Missed Genesis Filtering**: While Phase 36 hid Primal/Civilization layers in the Sidebar during Stage 1: Genesis, the Brush Palette Drawer still showed `3. Strategic Resources`, `4. Settlements & Roads`, and `6. Realm Borders` in Genesis, plus 4X jargon (`Strategic Resources`, `Harvestable Nodes`).
  3. **Docked Cards Panel Lacked Quick Presets & Speaker Chime-In**: Players in `Modular Studio` had to switch away from the map to pick card presets or switch speakers.
  4. **Rubric Drift Root Cause**: `docs/AUDIT_RUBRIC.md` benchmarked the app against 4X/grand-strategy games (*Crusader Kings III*), incentivizing unrequested video-game mechanics.
- **Decision**:
  1. **Complete Stage-Aware Genesis Palette & Storytelling Terminology (`MapCanvas.tsx`)**:
     - Hid Primal/Civilization Palette Drawer tabs (`resources`, `settlements`, `borders`) during Stage 1: Genesis unless `+ Later Ages` is explicitly toggled on.
     - Renamed `Strategic Resources` / `Harvestable Nodes` → `Natural Resources & Features` / `World Features`.
  2. **Uncrushed Wide Center Map in Modular Studio (`workspaceLayoutEngine.ts`)**:
     - Updated default `Classic Studio` preset to Left Dock (`340px`, Cards & Turn), wide unobstructed Center Map Canvas, and tabbed Bottom Drawer (`210px`, Codex & Chronicle) — eliminating the 3-sidebar squeeze while still allowing 1-click docking to Right, Left, Bottom, or Floating.
  3. **Rich In-Dock Turn Workbench & Relative Era Context (`Play.tsx`)**:
     - Added Speaker Chime-In pills, authentic relative era time context (`Pre-History · Tens of Thousands of Years Ago` for Genesis, `Early History · Thousands of Years Ago` for Primal, etc.), and Quick Stage/Suit Presets directly inside the docked `Cards & Turn` panel.
  4. **Re-Aligned `docs/AUDIT_RUBRIC.md`**:
     - Added the mandatory ADR-045 Re-Alignment Directive deprecating 4X video-game simulation criteria in favor of Ruleset Fidelity and Photoshop/Wonderdraft-caliber creative studio ergonomics.
- **Consequences**:
  - Brings the entire workspace, UI, and governance docs back into 100% alignment with the original *World Building* ruleset and human-experience-led design.

---

## ADR-047: Ultra-Bare Pre-Genesis Continents, Clickable Card Deck, Focused Tabbed Turn Flow & Cleaner Chronicle Header

- **Status**: Accepted
- **Date**: 2026-11-20
- **Context**:
  Direct human playtesting surfaced four immediate UX and ruleset friction points:
  1. Initial maps still felt too rich (up to 4 mountains and a 12-tile meandering river) rather than *"just a few small things, a continent shape with water/land a mountain or two, a forest or two. not much more."*
  2. Pressing directly on the physical card deck graphic did not draw a card.
  3. After drawing a card, too many panels, examples, bot recommendations, presets, and workbench controls popped up all at once instead of staging choices cleanly in tabs and hiding optional clutter until clicked.
  4. The World Chronicle header stacked 7 action buttons above the entries.
- **Decision**:
  1. **Ultra-Bare Pre-Genesis Worldgen (`proceduralWorldEngine.ts`)**:
     - Restricted Turn-0 maps strictly to organic coastlines (`water`/`ocean` + `>= 92%` bare `plains`), `1–2` mountain tiles, `1–2` forest tiles, `0` pre-carved rivers, `0` resource slots, and `0` settlements.
  2. **Tactile Clickable Card Deck (`Play.tsx`)**:
     - Converted both the physical card deck (`clickable-card-deck`) and the deck-stack bar beneath it into interactive buttons wired directly to `handleDrawCard`.
  3. **Focused 2-Tab Progressive-Disclosure Turn Flow (`Play.tsx`)**:
     - Collapsed card examples behind a 1-click `💡 Examples` pill and collapsed Bot Assist behind a 1-click `🤖 Bot Assist` toggle (`toggle-bot-assist-btn`) on human turns.
     - Staged post-draw interaction into 2 crisp tabs (`turn-focus-tabs`): **Tab 1: `✨ 1. Pick a Preset`** and **Tab 2: `✍️ 2. Write / Place on Map`** (selecting any preset smoothly advances to Tab 2).
  4. **Cleaner World Chronicle Header (`TimelinePanel.tsx`)**:
     - Reduced the top header to 3 clear primary controls (`+ Log Custom Event`, `Oldest/Newest`, `Realm Saga`) and tucked secondary export/print/clear actions into a compact `⋯ More` popover (`timeline-tools-menu-btn`).
- **Consequences**:
  - Eliminates visual overwhelm after drawing a card, makes drawing from the deck tactile and intuitive, and ensures Turn-0 maps are truly bare canvases ready for Stage 1: Genesis.

---

## ADR-048: Interactive Draw-Phase Map Placement — Drag-to-Move, Multi-Tile Painting (Ranges / Rivers) & Lock-In Mode

- **Status**: Accepted
- **Date**: 2026-11-20
- **Context**:
  Previously, clicking **"📍 Place on Map"** during the card draw phase silently stamped the feature onto the center default coordinate `(10,6)` without opening the map, moving the item, or letting the player paint multi-tile features like rivers or mountain ranges.
- **Decision**:
  1. **Clean Snapshot & Repositioning Engine (`turnWorkbenchEngine.ts`)**:
     - Added `cloneMapState`, `shouldDefaultToMultiTilePlacement`, and `repositionDraftOnMap(baseMap, targetTileIds, draft, recordId, preset)`.
     - Re-deriving placement from a clean pre-placement snapshot ensures dragging a single item from tile A → tile B cleanly restores tile A with zero leftover artifacts, and cancelling restores the exact original map.
  2. **Interactive Placement Mode on MapCanvas (`MapCanvas.tsx`, `Play.tsx`)**:
     - Pressing **`📍 Place on Map`** (`place-on-map-btn`) now immediately brings up the **World Map** with the **`active-placement-bar`** banner at the top.
     - **`✋ Move / Drag` Mode** (`placement-mode-move-btn`): Click or drag anywhere on the map to smoothly reposition your item.
     - **`🖌️ Multi-Tile Range` Mode** (`placement-mode-multi-btn`): Click or drag across multiple tiles to draw a mountain range, river, forest, or coastline (auto-selected for multi-tile features), with **`↩️ Undo Tile`** support.
     - **`🔒 Lock In Placement`** (`lock-in-placement-btn`): Commits all placed tile coordinates into the active turn record and returns cleanly to the Turn card. **`✕ Cancel`** restores the pre-placement map.
- **Consequences**:
  - Makes placing card features onto the world map feel immediate, spatial, and tactile—just like drawing on a shared tabletop whiteboard.

---

## ADR-049: Universal Turn Map Change Sessions Across All Four Stages (`✏️ Free Map Edit` & Automatic Diff Lock-In)

- **Status**: Accepted
- **Date**: 2026-11-20
- **Context**:
  The creator observed that modifying the map and locking those changes in as the results/consequences of a turn should be a universal core pattern across **all four stages** (*Genesis*, *Primal*, *Civilization*, *Intrigue*, and *Ace Natural Disasters*), not just single-item placement during Genesis. For example, a single Civilization or Intrigue turn might simultaneously expand borders, collapse a rival city into ruins, build a road, and add a myth marker—all attached to the same Chronicle entry.
- **Decision**:
  1. **Automatic Map Diff Engine (`computeModifiedTileIds` in `turnWorkbenchEngine.ts`)**:
     - Added a pure cartographic diff comparing `placementBaseMap` against the live map across terrain, relief, flora, rivers, roads, settlements, ruins, territories, labels, regions, lore notes, and slots.
  2. **`✏️ Free Map Edit` Mode Inside the Universal Turn Map Session (`MapCanvas.tsx`, `Play.tsx`)**:
     - Added **`✏️ Free Map Edit`** (`placement-mode-free-btn`) alongside `✋ Move / Drag` and `🖌️ Multi-Tile Range` inside `active-placement-bar`.
     - Entering Free Map Edit unlocks full MapCanvas editing (all tools + sidebar layers) while continuously tracking every modified tile against the pre-turn snapshot, highlighting them with emerald session rings, and displaying the live count of modified tiles.
     - Clicking **`🔒 Lock In Changes`** commits the entire set of map consequences into the active Chronicle turn (`linkedTileIds`), while **`✕ Cancel`** restores the exact pre-turn map snapshot.
- **Consequences**:
  - Unifies map editing and Chronicle storytelling across all 4 stages into one cohesive, reversible "Edit Map for This Turn → Lock In Consequences" workflow.

---

## ADR-050: Streamlined 1-Button Card Flexibility Menu (`Redraw`, `Discard & Draw Another`, `Freeform Turn`) & Minimal Turn Bar

- **Status**: Accepted
- **Date**: 2026-11-20
- **Context**:
  Players wanted full creative freedom when drawing a card they don't like—**Redraw** with no penalty, **Discard & draw another**, or **Ignore the card completely** and run a freeform turn—while minimizing interface clutter by collapsing all 7 loose turn/deck buttons into **one expandable menu**.
- **Decision**:
  1. **1-Button Expandable `🃏 Card Options ▾` Menu (`Play.tsx`)**:
     - Replaced 7 loose buttons (`Redraw`, `Pick Card`, `Auto-Step Turn`, `Auto-Stage`, `Undo`, `Reset Deck`) and the static 3-step phase tracker with a single sleek `Draw Card` + **`🃏 Card Options ▾`** (`card-options-menu-btn`) popover.
     - Grouped **Player Flexibility (No Penalty)** actions cleanly at the top:
       - `Redraw (Return & Draw New)` (`handleRedrawCurrentCard`)
       - `Discard & Draw Another` (`handleDiscardAndDrawAnother`)
       - `Ignore Card (Freeform Turn)` (`handleFreeformOverrideTurn`)
       - `Pick Card (Specific Suit/Value)`
     - Tucked secondary deck/session utilities (`Undo Last Turn`, `Reset Deck`, `Auto-Step`, `Auto-Play Stage`) cleanly below a divider.
- **Consequences**:
  - Gives players total creative sovereignty over every draw with zero penalties while cutting top turn-bar clutter by over 70%.

---

## ADR-051: Default to Full-Viewport Modular Studio on Session Launch

- **Status**: Accepted
- **Date**: 2026-11-20
- **Context**:
  Previously, launching or resuming a Studio session defaulted to `activeTab = 'cards'`, hiding the World Map until the player manually switched tabs.
- **Decision**:
  - Changed the default Studio tab in `Play.tsx` to `'dock'` (**Modular Studio**), so players immediately see the full-viewport centered World Map flanked by the docked `Cards & Turn` panel on the left and tabbed `Codex & Chronicle` at the bottom with zero scrolling.
- **Consequences**:
  - Delivers the Photoshop-style whiteboard studio experience immediately upon entering any world.

---

## ADR-052: Authentic Pre-Stage Guided Setup Rituals (`PreStageSetupModal.tsx`)

- **Status**: Accepted
- **Date**: 2026-11-20
- **Context**:
  In `docs/world_building_original_docs.md`, each of the 4 stages begins with a brief collaborative Pre-Stage setup (*Pre-Genesis* coastlines & starting features, *Pre-Primal* each player creating a sentient species & picking its origin tile, *Pre-Civilization* creating founding societies within species, *Pre-Intrigue* naming cities, nations & societies).
- **Decision**:
  - Created `PreStageSetupModal.tsx` providing lightweight, skippable 1-screen setup checklists and quick-creators matching all 4 Pre-Stage rules verbatim.
  - Wired it to open automatically after advancing eras (`handleAdvanceStageCeremonially`) and on demand via `✨ Stage Setup` (`open-prestage-setup-btn`) in the Studio bar.
- **Consequences**:
  - Brings the canonical tabletop stage transitions directly into the Studio without forcing rigid rules or blocking freeform play.

---

## ADR-053: Live Browser Playtest Viewport Lock & Visual Polish Pass

- **Status**: Accepted
- **Date**: 2026-11-20
- **Context**:
  A live interactive playtest at `1440×900` (`http://localhost:5173/play`) confirmed 0 console errors, 0 failed network requests, and all 7 core flows working end-to-end, while uncovering 4 concrete visual/layout polish issues:
  1. `<main className="space-y-4">` in `Play.tsx` lacked `flex-1 min-h-0 flex flex-col overflow-hidden` in `dock` mode, causing `StudioDockWorkspace` to expand past `100vh` and push the Bottom Codex/Chronicle dock below the fold.
  2. On the `Deck & Draw` tab, the left card column stretched vertically without `items-start`, centering the card with ~550px of empty space above it.
  3. Redrawing or discarding after a Freeform Turn retained the previous `Freeform World Event` draft label instead of resetting `turnDraft` to the newly drawn card.
  4. Map toolbar right-hand buttons wrapped onto a 2nd row at `1440×900`.
- **Decision**:
  - Locked `<main>` to `flex-1 min-h-0 flex flex-col overflow-hidden` in `Modular Studio` (`dock`) mode so Left Dock, Center Map, and Bottom Codex/Chronicle Dock all fit cleanly inside `100vh` with independent internal scrolling.
  - Added `items-start` and `lg:sticky lg:top-2` to the `Deck & Draw` card column.
  - Reset `turnDraft` cleanly in `handleRedrawCurrentCard` and `handleDiscardAndDrawAnother`.
  - Tightened MapCanvas toolbar button padding (`px-2 py-1 text-[11px]`) to prevent 2-row toolbar wrapping at `1440×900`.
- **Consequences**:
  - Delivers true zero-scroll full-viewport responsiveness at `1440×900` and eliminates visual drift across all Studio tabs.

---

## ADR-054: >=10 Classic Fantasy RPG Presets for Every Stage, Suit & Natural Disaster + Phase-Relevant Card Examples

- **Status**: Accepted
- **Date**: 2026-11-20
- **Context**:
  An audit of `frontend/src/data/catalog/stages/` revealed that Natural Disasters only had 1 preset per stage (4 total) and Primal, Civilization, and Intrigue suits had 8–9 presets each. The creator mandated at least **10 classic, cliché fantasy RPG presets for every card at every phase** with appropriate icons/tiles and robust phase-relevant examples.
- **Decision**:
  - Added `stages/disasters/part2-classic-disasters.json` (registered in `stages/manifest.json`) expanding every stage's Ace Natural Disasters to **10 classic disasters** (40 total).
  - Expanded all 12 Primal, Civilization, and Intrigue suit shards to **10–11 classic fantasy tropes each** (Fishing Village, Mountain Hamlet, Surface Iron Ore, Walled Border Castle, Grand Library, Royal Marriage Alliance, Border War, Dragon Lair, Lost Artifact, Haunted Ruins, etc.).
  - Added `getPhaseRelevantExamples(stage, card, baseExamples)` in `deckEngine.ts` so Aces, Jokers, Face Cards, and standard suits always show rich, stage-appropriate classic examples during card draw.
  - Added a permanent unit test guard in `catalogExtensibility.test.ts` enforcing `>= 10` presets for every `(stage, suit)` and every `(stage, Ace Natural Disaster)`.
- **Consequences**:
  - Every card draw in every stage now offers a rich, recognizable library of classic fantasy RPG tropes.

---

## ADR-055: Campaign State-Machine Locks — No Mid-Game World Resizing or Grid Topology Switching

- **Status**: Accepted
- **Date**: 2026-11-20
- **Context**:
  In normal play, allowing players to resize world grid dimensions (`14×9`, `20×12`, `26×15`) or switch Square/Hex topology mid-campaign violates state-machine integrity and risks corrupting recorded turn coordinates.
- **Decision**:
  - Added `isCampaignStarted = drawHistory.length > 0 && gameMode !== 'free-create'` in `MapCanvas.tsx`.
  - Automatically hides world dimension resize presets and Square/Hex topology switchers once Turn #1 begins in normal play (while keeping them available at Turn #0 Pre-Genesis and in `Free-Create` mode).
- **Consequences**:
  - Enforces clean state-machine invariants during active campaigns and reclaims ~150px of MapCanvas top toolbar width.

---

## ADR-056: Single-Pane-of-Glass Edge Tray Pills with Contextual Notification Highlights

- **Status**: Accepted
- **Date**: 2026-11-20
- **Context**:
  To move closer to a sleek Single Pane of Glass studio where trays stay collapsed out of the way until pressed and subtly notify the player when relevant (e.g., new turns logged or entering Primal/Civilization with no species yet), collapsed/hidden panels needed an instant edge-tray re-entry bar.
- **Decision**:
  - Added `panelBadges` and `studio-edge-tray-bar` in `StudioDockWorkspace.tsx` + `Play.tsx`: any collapsed/hidden panel (`Cards`, `Codex`, `Chronicle`) appears as a sleek pill in the bottom-right corner with its live count and a pulsing amber notification dot when attention/action is suggested.
- **Consequences**:
  - Players can collapse side/bottom trays for maximum canvas space (`Tab` or `×`) and pop them open smoothly in 1 click whenever notified.

---

## ADR-057: Grand Classic Fantasy Tropes Library (`>= 12–14` Classics Per Stage, Suit & Natural Disaster)

- **Status**: Accepted
- **Date**: 2026-11-20
- **Context**:
  Building on ADR-054, the creator asked to expand the library of classic, instantly recognizable fantasy RPG tropes across every stage and suit so tables never run short of timeless inspiration.
- **Decision**:
  - Expanded every Primal, Civilization, and Intrigue suit shard to **13–14 classic fantasy RPG presets** (Treehouse Canopy Village, Cliffside Cave Dwellings, Oasis Caravan Camp, Sacred Oath Stones, Gold-Panning Stream, Grand Aqueduct, Great Harbor Lighthouse, Council of Free Cities, Rogue Mercenary Company, Corsair Armada, War of the Contested Throne, Monster-Hunting Guild, Sunken Temple Rising, Cursed Forest of Whispers, etc.).
  - Expanded Natural Disasters to **12 classic disasters per stage** (48 total).
  - Raised the permanent automated guard in `catalogExtensibility.test.ts` to enforce `>= 12` presets for every `(stage, suit)` and every `(stage, Ace Natural Disaster)`.
- **Consequences**:
  - Gives every tabletop group a rich, classic, zero-friction catalog of fantasy worldbuilding tropes across all 4 stages.

---

## ADR-058: Single-Pane-of-Glass Top Card Draw Ribbon (`studio-top-card-ribbon`) & Pure Canvas Play

- **Status**: Accepted
- **Date**: 2026-11-20
- **Context**:
  To complete the Single-Pane-of-Glass Studio journey (Map centered, Card Draw on top, Codex/Chronicle in collapsible side/bottom trays with notification dots), players needed a sleek top-center Card Draw Ribbon directly above the World Map so they can draw cards, trigger interactive map placement, redraw/discard, log turns, or toggle Pure Canvas mode without ever leaving the map.
- **Decision**:
  - Added `topOverlayBar` to `StudioDockWorkspace.tsx` and rendered `studio-top-card-ribbon` directly above the center World Map in `Play.tsx` with 1-click `Draw Card`, `Freeform`, `📍 Place / Edit Map`, `✓ Log Turn`, `Redraw`, `Discard`, and `🗺️ Pure Canvas` / `◫ Show Trays`.
- **Consequences**:
  - Enables an entire 4-age *World Building* session on a single uninterrupted pane of glass with 90%+ of the viewport dedicated to the living map.

---

## ADR-059: Headless Multi-Hundred-Permutation Campaign Fuzz & Simulation Test Suite (`headlessCampaignSimulation.test.ts`)

- **Status**: Accepted
- **Date**: 2026-11-20
- **Context**:
  Unit tests for individual functions did not verify end-to-end headless campaign stability across hundreds of seeds, geography presets, card draws, and full 4-stage playthroughs.
- **Decision**:
  - Created `frontend/src/test/headlessCampaignSimulation.test.ts` running automatically both locally and in GitHub Actions CI (`npm run test:ci`):
    - **120 Pre-Genesis Bare-Map Permutations** (20 seeds × 6 geography presets) asserting `>= 92%` bare open plains, `1–2` mountains, `1–2` forests, and `0` rivers/slots/settlements.
    - **100 Complete Headless 4-Stage Campaign Playthroughs** (`Genesis → Primal → Civilization → Intrigue`) verifying contiguous `moveId`s, zero corrupt states, lossless JSON export/re-import round-trips, and valid 2-Page World Overview synthesis.
    - **50 Interactive Turn Map Session & Card Flexibility Permutations** verifying Drag-to-Move clean tile reversion, Multi-Tile range painting, Free Map Edit diff tracking, and Chronicle `linkedTileIds` sync.
- **Consequences**:
  - Guarantees rock-solid headless engine reliability across 270+ automated permutations in `< 1 second` on every commit and PR.

---

## ADR-060: Live Multi-Stage Browser E2E Verification & Surgical UX Polish

- **Status**: Accepted
- **Date**: 2026-11-20
- **Context**:
  A live interactive multi-stage E2E playthrough (`Genesis → Primal`) at `1440×900` verified all 8 core journeys passing with `0` console errors and `0` failed network requests (`1440×900` zero-scroll viewport lock, ultra-bare Pre-Genesis map, Top Card Draw Ribbon, multi-tile placement + Lock In, State-Machine Lock after Turn #1, Pure Canvas + Edge Trays, and Pre-Primal Species Ritual), while surfacing 4 final surgical UX polish items.
- **Decision**:
  1. **Top Card Draw Ribbon Turn-End Reset (`Play.tsx`)**: Gated active card display on `turnPhase === 'action_select' && drawnCard` so clicking `✓ Log Turn` cleanly resets the ribbon back to `▶ Draw Card`.
  2. **Centered Floating Edge Tray Dock (`StudioDockWorkspace.tsx`)**: Positioned `studio-edge-tray-bar` at `bottom-3 left-1/2 -translate-x-1/2` so Pure Canvas edge pills never overlap the right-hand Tile Inspector.
  3. **Tighter Left Dock Fit (`Play.tsx`)**: Reduced docked quick-idea chips to 4 and note rows to 2 so `📍 Place / Drag on Map` and `✓ Log Turn` fit cleanly without clipping at `1440×900`.
  4. **Unobstructed Era Celebration Toast (`Play.tsx`)**: Moved `stageCelebration` toast from `top-16` to `bottom-14` so it never overlaps top header actions.
- **Consequences**:
  - Elevates the verified ADR-045 adversarial score from **84.5 -> 92.0 / 100** across **34 test suites (234/234 tests passing, including 270 headless permutations)** and verified live E2E browser journeys.






























## ADR-061: Full 4-Stage Interactive E2E Verification & Inspectable Headless Simulation Report Engine (Phase 57)

- **Date:** 2026-11-20
- **Status:** Accepted
- **Context:** While Phase 55 added automated headless invariant tests and Phase 56 verified `Genesis → Primal` in a live browser, the user requested (1) full interactive E2E browser verification across **all 4 ages** (`Genesis → Primal → Civilization → Intrigue`) and (2) concrete, inspectable simulation outputs generated from hundreds of headless runs.
- **Decision:**
  1. Executed a live 4-stage interactive E2E playthrough (`1440×900`, `0` console errors, `0` failed network requests) through Genesis, Primal (Pre-Primal Species Creator), Civilization (Pre-Civilization Society Creator), Intrigue (Pre-Intrigue City Naming), Chronicle, and the 2-Page World Overview.
  2. Fixed 4 live UX paper-cuts uncovered in `Play.tsx`: auto-dismissing + dismissible `stageCelebration` toast, non-occluding bottom-right `conclaveHandoff` toast, resetting `turnFocusTab` to `'presets'` on every card draw/redraw, and syncing locked-in tile coordinates into auto-populated chronicle notes.
  3. Added `frontend/src/engine/simulationReportEngine.ts`, `npm run simulate`, `frontend/src/test/simulationReportGenerator.test.ts`, and `docs/SIMULATION_REPORT.md` to run **320 headless permutations** (120 Pre-Genesis bare maps + 150 full 4-stage campaigns spanning 2,400 turns + 50 turn-session stress tests) and emit human-readable Markdown with ASCII cartographic maps, complete 4-age chronicles, and synthesized 2-Page World Overviews.
- **Consequences:** Both local developers and CI verify **590 total headless permutations** across `headlessCampaignSimulation.test.ts` and `simulationReportGenerator.test.ts` on every PR, and users can inspect real generated worlds anytime in `docs/SIMULATION_REPORT.md` or regenerate them via `npm run simulate`.

## ADR-062: Static LLM-Free Playwright E2E/Chaos Suite, Exhaustive 54-Card × 4-Stage Audit & Loadable Full-Deck World Exports (Phase 58)

- **Date:** 2026-11-21
- **Status:** Accepted
- **Context:** To ensure regressions are caught deterministically without requiring an LLM to drive the browser, and to verify that every single card in a full 54-card deck works across all 4 stages and produces loadable, visually clean worlds across settings permutations.
- **Decision:**
  1. Added `@playwright/test` + `frontend/playwright.config.ts` + `frontend/e2e/studio-e2e-and-chaos.spec.ts` (`npm run test:e2e`) running 4 deterministic, LLM-free Chromium suites against the production build (`vite preview`):
     - Full 4-stage Acceptance Journey (`Genesis → Primal → Civilization → Intrigue → 2-Page Overview`)
     - Complete Menu, Popover, Pure Canvas, Edge Tray & Card Options Audit
     - Deterministic Seeded Chaos / Monkey Runner (`seed = 133742`, 60 rapid UI actions, 0 crashes)
     - Live UI Import & 2-Page Overview verification of a 216-turn Full-Deck `.world.json` export
  2. Fixed a real `localStorage` `QuotaExceededError` caught by the 216-turn live import test in `storageService.ts` by trimming heavy snapshots from the `localStorage` mirror (while retaining full data in IndexedDB).
  3. Added `frontend/src/engine/fullDeckAuditEngine.ts`, `frontend/src/test/fullDeckAuditAndExport.test.ts`, and `npm run export:worlds` to exhaustively audit all **216 card × stage combinations** (`54` cards × `4` stages) and simulate + audit **6 full-deck-scale settings permutations** (including a **216-turn 54-cards-per-phase** world), exporting loadable `.world.json`, `.2-page-overview.md`, and `.map.svg` files to `local-exports/simulated-worlds/` (gitignored).
  4. Wired `npm run export:worlds` and `npm run test:e2e` into `.github/workflows/ci.yml` so every PR runs both headless Vitest simulations and real Chromium Playwright E2E + Chaos tests automatically.
- **Consequences:** End-to-end UI acceptance, menu coverage, chaos resilience, 54-card-per-phase deck audits, and 216-turn import verification are now 100% automated, static, LLM-free, and CI-gated.

## ADR-063: Bare-Minimum World-Building Top Nav, Live Turn State-Machine Stepper & `⋯ More ▾` Auxiliary Consolidation (Phase 59)

- **Date:** 2026-11-21
- **Status:** Accepted
- **Context:** Per Tier-1 Human Creator UX direction, the Studio top header was still displaying non-core auxiliary buttons (`Table Sync`, `Vault`, `Compendium`, `Hooks`, `Primer`, `Atmosphere`, `Ctrl+K`, and the 3-mode switcher) directly on the main bar alongside secondary workspace tabs (`Side-by-Side Studio`, `Stage Setup`, `4-Ages Matrix`), causing header wrapping and reducing vertical map space.
- **Decision:**
  1. Collapsed the main Studio top bar (`Play.tsx`) into a single sleek, non-wrapping row keeping ONLY always-visible core world-building state & turn navigation: `☰ Menu`, `Main Menu`, **Realm Name**, **Age Pill**, **`Turn #N`**, a **Live Turn State-Machine Stepper (`1. Draw → 2. Shape → 3. Log`)** (`top-nav-turn-stepper`), Active Player seat, **`2-Pager`**, streamlined **`Share ▾`** (`Share & Backup JSON` + `Export Suite`), **`⋯ More ▾`** (`studio-more-tools-btn`), and **`⚙️ Settings`**.
  2. Consolidated all non-core / auxiliary utilities (`Table Sync`, `Session Checkpoint Vault`, `Compendium`, `Adventure Hooks`, `Session Zero Primer`, `Command Palette`, `Ambient Atmosphere`, and `Companion / Studio / Free-Create` mode switcher) into the single expandable `⋯ More ▾` popover (`studio-more-tools-popover`).
  3. Streamlined the Workspace Tab Bar to the 5 core world-building views (`Deck & Draw`, `World Map`, `Codex`, `Chronicle (N)`, `Modular Studio`) + `Workspace ▾` (tucking `Side-by-Side Classic View`, `Stage Setup Checklist`, and `4-Ages Rules Matrix` inside `Workspace ▾`), and compacted default dock dimensions (`leftDockWidth: 320`, `bottomDockHeight: 170`) in `workspaceLayoutEngine.ts` to maximize map viewport.
- **Consequences:** Eliminates top-bar clutter and wrapping at `1440×900`, keeps the active turn state machine visible at all times, and reclaims ~120px of vertical canvas space while keeping every auxiliary feature 1 click away inside `⋯ More ▾`.

## ADR-064: Traditional Engineering Scoring Tracks, Snapshot Bloat Sterilization, Modal a11y, Error Boundary & Bundle Splitting (Phase 60)

- **Date:** 2026-11-21
- **Status:** Accepted
- **Context:** Inspecting exported `.world.json` files revealed a 36.2 MB snapshot-bloat bug (unbounded per-turn full-map clones in `world.snapshots`), leftover `/100` videogame stability fractions in the 2-Page World Overview, missing `Escape`-to-close / `role="dialog"` on modals, no top-level React Error Boundary, and a 1.4 MB unsplit JS bundle. Additionally, the user requested formal **Traditional Software Engineering Scoring Tracks** alongside Product/HX scoring.
- **Decision:**
  1. Codified **Track B: Traditional Software Engineering Quality & Reliability (100 points across E1–E6)** in `docs/AUDIT_RUBRIC.md` (Pre-Phase 60 baseline: `64/100` → Post-Phase 60: `84/100`).
  2. Sterilized the 36.2 MB snapshot-bloat bug via `appendCappedTurnSnapshot` (`MAX_ROLLING_TURN_SNAPSHOTS = 12`) and `serializeWorldForExport` / `serializeWorld` in `storageService.ts` + `autoPlayEngine.ts`, and added a hard `< 750 KB` export size gate in `fullDeckAuditAndExport.test.ts`.
  3. Removed remaining numeric `(/100)` stability scores from `twoPageOverviewEngine.ts` and `WorldTwoPagerModal.tsx` (completing ADR-042 de-gamification).
  4. Added universal `Escape`-to-close handling for all Studio modals/popovers in `Play.tsx` and `role="dialog" aria-modal="true"` on `ShareTableModal.tsx`.
  5. Added top-level `AppErrorBoundary.tsx` in `App.tsx` and Vite `manualChunks` code splitting (`vendor-react`, `vendor-icons`, `vendor-misc`, `catalog-data`, `engine-core`) in `vite.config.ts`.
- **Consequences:** Exported 216-turn `.world.json` files shrink by **> 98%** (from 36.2 MB to ~400 KB), production chunks are cleanly split for browser caching, every modal closes cleanly on `Escape`, and engineering quality is measured independently from product UX.

## ADR-065: Zero-Warning ESLint CI Gate & 100% Modal ARIA Dialog Coverage (Phase 61)

- **Date:** 2026-11-21
- **Status:** Accepted
- **Context:** Track B audit revealed 113 ESLint issues (10 errors, 103 warnings), no lint gate in `.github/workflows/ci.yml`, and 2 remaining modals (`IncomingSharedWorldModal.tsx`, `KeyboardShortcutsModal.tsx`) missing `role="dialog" aria-modal="true"`.
- **Decision:**
  1. Fixed all 10 ESLint errors and all 52 production-code warnings across `src/pages/`, `src/components/`, and `src/engine/` (bounded loop in `hexTopologyEngine.ts`, safe null guards replacing `!`, typed `catch (err: unknown)` and state setters, `driverHandlersRef` + `useMemo` in `Play.tsx`, clean `react-refresh` boundaries in `MapCanvas.tsx`), with a scoped `src/test/**` override in `.eslintrc.cjs`.
  2. Added `npm run lint` (`--max-warnings 0`) as a required CI gate in `.github/workflows/ci.yml`.
  3. Added `role="dialog" aria-modal="true"` to `IncomingSharedWorldModal.tsx` and `KeyboardShortcutsModal.tsx` so 100% of modals conform to ARIA dialog semantics.
- **Consequences:** Engineering Track **E6** rises `13 → 15 / 15` and **E2** rises `13 → 14 / 15` (Track B total: **87.0 / 100**).

## ADR-066: Lazy Route/Bundle Code-Splitting Under 500 kB & Live `.world.json` Import URL Sync Fix (Phase 62)

- **Date:** 2026-11-21
- **Status:** Accepted
- **Context:** The production Vite build still emitted a `> 500 kB` chunk warning (`index` at `629 kB`), and Playwright Test #4 uncovered a real bug where importing a `.world.json` realm via `ShareTableModal` (`Import (.json)` → `Load & Play Imported Realm`) did not update `?world=<id>` in `searchParams`, causing the URL-sync effect to revert to the previous realm.
- **Decision:**
  1. Converted all 4 top-level routes (`Home`, `Rules`, `Play`, `Map`) in `App.tsx` to `React.lazy()` + `<Suspense>` and refined `vite.config.ts` `manualChunks` (`studio-map-canvas`, `studio-codex-chronicle`, `studio-modals`, `engine-core`, `catalog-data`, `vendor-react`, `vendor-icons`, `vendor-misc`).
  2. Fixed `onImportWorld` and `handleFileImport` in `Play.tsx` to persist, rebuild deck, and sync `setSearchParams({ world: saved.id, mode: gameMode })`.
  3. Hardened Playwright Test #4 (`studio-e2e-and-chaos.spec.ts`) to exercise the full `Import (.json)` tab → file upload → `Load & Play Imported Realm` user flow.
- **Consequences:** Entry `index.js` dropped from `629 kB` → **`16.62 kB`**, largest chunk is `324 kB` (**0 Vite `> 500 kB` warnings**), and Track **E4** rises `12 → 15 / 15` (Track B total: **90.0 / 100**).

## ADR-067: True 70/30 Single-Pane-of-Glass Studio Layout, Fullscreen Expandable Panes & Button-Only Map Zoom (Phase 63)

- **Date:** 2026-11-21
- **Status:** Accepted
- **Context:** Per Tier-1 Human Creator UX direction, normal Studio play should be a single pane of glass with NO tab switching between Map, Draw, and Codex, NO 4-layer stack of nav bars above the map, and NO mouse-wheel map zooming (mouse wheel should only scroll normally; map zoom is controlled via explicit `+ / − / 100% / Fit` buttons).
- **Decision:**
  1. Created `SinglePaneStudioLayout.tsx` as the default Studio workspace: a **70% Left World Map / 30% Right Sidebar** horizontal split (draggable `45%–85%`), with the Right Sidebar vertically split into **Top: Card & Active Turn** and **Bottom: Chronicle / Codex** (draggable `25%–78%`). Every section (Map, Card & Turn, Chronicle/Codex) has a 1-click **`⤢` Fullscreen Expand / Restore** toggle.
  2. Eliminated both the Workspace Tab Bar and the separate Top Card Draw Ribbon bar above the map in normal Studio play (`Play.tsx`), leaving a single ultra-slim in-game top nav bar above the 70/30 workspace, with standalone views (`Deck & Draw Full View`, `Stage Setup`, `4-Ages Matrix`) tucked cleanly into `⋯ More ▾`.
  3. Removed the non-passive mouse-wheel zoom hijack in `MapCanvas.tsx` so scrolling never accidentally zooms the map, and defaulted the optional `Hints` status bar to `false` to reclaim vertical map space.
- **Consequences:** Dramatic reduction in top-of-screen chrome, instant single-pane visibility of Map + Active Card/Turn + Chronicle/Codex simultaneously, and intuitive mouse scrolling.

## ADR-068: Single-Row MapCanvas Toolbar (`⋯ Map Options ▾`) & Extracted `useStudioKeyboardShortcuts` Hook (Phase 64)

- **Date:** 2026-11-21
- **Status:** Accepted
- **Context:** `MapCanvas.tsx` still rendered a wrapping 2-row top toolbar above the map (`2.5D/Flat/Simple`, `Square/Pointy/Flat Hex`, `Organic Shading`, `14×9/20×12/26×15`, `PNG`, `SVG`, `Hints`, `Studio Guide`, `Dimensions`), and `Play.tsx` contained inline velocity hotkey wiring.
- **Decision:**
  1. Collapsed the `MapCanvas.tsx` top toolbar into **1 ultra-slim single row** (`View/Edit`, `Palette & Overlays`, `Layers`, `Zoom − 100% + Fit`, `⋯ Map Options ▾`), tucking all secondary visual/topology/shading/dimension/export/guide controls into `map-options-menu-popover`.
  2. Extracted `frontend/src/hooks/useStudioKeyboardShortcuts.ts` from `Play.tsx` to isolate Single-PC velocity hotkeys (`D/R/P/2/A/Alt+S`) with a stable window listener ref.
- **Consequences:** Zero toolbar wrapping above the map at desktop and compact laptop widths; cleaner modularity in `Play.tsx`.
