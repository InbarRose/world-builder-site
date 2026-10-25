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

## Tasks

- [x] Add ADR-006 and ADR-007 documenting Seeded Auto-Play, Time-Travel Snapshots, and Schema v2 Migration.
- [x] Add ADR-008 and ADR-009 documenting the 5-Level UI Hierarchy, Mode-Adaptive Workspaces, and Bi-Directional Wiki Integration.


