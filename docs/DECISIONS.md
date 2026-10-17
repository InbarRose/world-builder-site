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

## Tasks

- [ ] Add future ADRs whenever new foundational technical decisions are made.

