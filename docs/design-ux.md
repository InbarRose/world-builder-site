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

## 2. Component Design Specifications
- **CardWidget**: Displays large card face with top-left and rotated bottom-right suit/value markers, suit icons, and responsive layout.
- **GridCanvas**: Interactive 20x12 tile grid with configurable zoom, terrain tile backgrounds, settlement markers, and hover inspection tooltips.
- **TimelineViewer**: Chronological event cards with stage badges, move index, relative year markers, and note editing.
- **EntityPanel**: Species and society cards with attribute tags and linked territory markers.
- **WorldManagerModal**: Dialog for creating new worlds, switching active worlds, exporting JSON files, and importing backups.

---

## Tasks

- [ ] Ensure all new React components adopt these design standards.

