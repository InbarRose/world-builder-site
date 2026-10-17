---
id: TECH_ARCH
title: Technical Architecture
version: 2.0.0
status: active
---

# Technical Architecture — world-builder-site

## 1. System Overview

`world-builder-site` is a pure client-side, static Single Page Application (SPA) hosted on **GitHub Pages** with the custom domain `world-building.inbarrose.com`. It requires no server-side execution, database servers, or authentication backends.

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser / Client                      │
│                                                             │
│  ┌─────────────────┐   ┌─────────────────┐   ┌────────────┐ │
│  │   Rules View    │   │  Studio / Play  │   │ Home / Wiki│ │
│  └────────┬────────┘   └────────┬────────┘   └──────┬─────┘ │
│           │                     │                   │       │
│  ┌────────▼─────────────────────▼───────────────────▼─────┐ │
│  │                    Presentation Layer                   │ │
│  │   (React 18 + Tailwind CSS + Lucide Icons + Router)     │ │
│  └──────────────────────────────┬──────────────────────────┘ │
│                                 │                            │
│  ┌──────────────────────────────▼──────────────────────────┐ │
│  │                    Core Engine Layer                    │ │
│  │  - DeckEngine (shuffling, distribution, presets)        │ │
│  │  - MapEngine (grid state, terrain, painting)            │ │
│  │  - TimelineEngine (chronology, epoch, filtering)        │ │
│  │  - EntityRegistry (species, societies, myths)           │ │
│  └──────────────────────────────┬──────────────────────────┘ │
│                                 │                            │
│  ┌──────────────────────────────▼──────────────────────────┐ │
│  │                   Persistence Layer                     │ │
│  │  - WorldStorageService (localStorage named slots)       │ │
│  │  - JSON Import / Export / Backup                        │ │
│  │  - Static Asset Loader (public/data/*.json)             │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Layers & Modules

### 2.1 Presentation Layer (`frontend/src/components/`, `pages/`)
- **Pages**:
  - `Home.tsx` — Landing page with quick access to rules, saved worlds, and play mode.
  - `Rules.tsx` — Full interactive rules wiki with sticky table of contents and stage power tables.
  - `Play.tsx` — Integrated World Studio combining card drawing, map canvas, timeline, and entity registry.
- **Component Subsystems**:
  - `map/` — Interactive SVG/HTML5 grid canvas, terrain palette, tile inspector.
  - `timeline/` — Chronological move history, filters, note annotations.
  - `entities/` — Species, civilizations, and myths trackers.
  - `world/` — Multi-world manager modal, save/load, JSON import/export.

### 2.2 Core Engine Layer (`frontend/src/engine/`)
- **`types.ts`**: TypeScript definitions for cards, stage powers, map tiles, timeline events, species, societies, and world state.
- **`deckEngine.ts`**: Pure functions for deck creation, shuffling (Fisher-Yates), probability distribution, face card filters, and stage power mapping.
- **`storageService.ts`**: Handles saving/loading named worlds in browser `localStorage`, auto-saving, migration, and JSON file export/import.

### 2.3 Static Data Layer (`frontend/public/data/`)
- Canonical stage JSON files (`genesis-earth.json`, `primal-settlement.json`, `civilization-construction.json`, `intrigue-conflict.json`, etc.) loaded client-side via asynchronous fetch.

---

## 3. Hosting & CI/CD Pipeline
- **Platform**: GitHub Pages via GitHub Actions.
- **Workflow**: `.github/workflows/deploy.yml` triggers on push to `main`, installs dependencies (`npm ci`), runs tests (`npm run test:ci`), builds static distribution (`npm run build`), and deploys artifacts to GitHub Pages.
- **Domain**: `world-building.inbarrose.com` via `dist/CNAME`.
- **SPA Fallback**: `dist/404.html` copies `dist/index.html` during build.

---

## Tasks

- [ ] Maintain this architecture doc as new frontend subsystems are added.

