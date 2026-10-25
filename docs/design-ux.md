---
id: DESIGN_UX
title: UX & Design Standards
version: 2.0.0
status: active
---

# UX & Design Standards — world-builder-site

## 1. Visual & Theming Principles
- **Theme**: Minimalist fantasy-inspired aesthetic with high readability and accessible contrast (WCAG AA).
- **Colors**:
  - Backgrounds: Clean neutral canvas (`bg-background`, `bg-card`, `bg-muted`).
  - Accents: Deep fantasy indigo / violet / emerald accents for active states, card suits, and landmarks.
  - Suits: Spades (♠) / Clubs (♣) neutral dark, Hearts (♥) / Diamonds (♦) bold crimson, Jokers (🃏) royal purple.
- **Typography**: Inter for clean interface controls and data; legible serif / bold display fonts for stage titles and world names.

## 2. 5-Level Information & Navigation Hierarchy
- **Level 0 — Global App Bar (`Layout.tsx`)**: Sticky, ultra-clean 56px top header with Brand Identity, Active World Pill, Primary Route Switcher (`Launchpad`, `Rules`, `Play`, `Map`), Theme Switcher (`Atlas`, `Dark`, `Print`), and Compact Feedback Menu.
- **Level 1 — Workspace Mode & Context Bar**: Page-specific sub-header (e.g., `3.1 Companion`, `3.2 Studio`, `3.3 Freeform` mode selector and focused view tabs).
- **Level 2 — Focused Primary Stage**: A single active focal canvas at a time (`Cards & Turn Desk`, `Map Canvas`, `Codex Wiki`, `Event Chronicle`, or `Map + Codex Split`) — never stacking all 4 systems vertically at once.
- **Level 3 — Collapsible Context Drawers & Optional Panels**: Toggleable panels (`Stage Rules`, `Event Log`, `Codex`, `Map`, `Players`, `Codex Creator Drawer`, `Tile Lineage Inspector`) that stay tucked away until toggled.
- **Level 4 — On-Demand Modals**: Self-contained task dialogs (`WorldManagerModal`, `PlayerManagerModal`, `AutoPlayConsoleModal`).

## 3. Component Design Specifications
- **CardWidget**: Displays large card face with top-left and rotated bottom-right suit/value markers, suit icons, and responsive layout.
- **GridCanvas (`MapCanvas.tsx`)**: Interactive tile grid with distinct **Inspect Mode** (Tile Lineage Inspector with clickable Codex entity & turn event links) and **Paint / Edit Mode** (terrain brush, rivers, roads, faction territories, and entity placement).
- **TimelineViewer (`TimelinePanel.tsx`)**: Chronological event cards with stage badges, move index, relative year markers, custom lore event creator (`+ Log Custom Event`), and clickable tile/entity badges.
- **EntityPanel (`EntityRegistry.tsx`)**: Wiki-first Codex browser with **Browse Wiki Mode** (Entity Spotlight, clickable trait filters, clickable origin/territory tiles, relationship graph badges) and a collapsible **Creator / Editor Drawer** with editable presets.
- **WorldManagerModal**: Dialog for creating new worlds, switching active worlds, exporting JSON files, and importing backups.

---

## Tasks

- [x] Ensure all React components adopt the 5-Level UI Hierarchy and design standards.

