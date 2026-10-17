---
id: copilot-instructions
version: 2.0.0
title: Copilot/LLM Agent Instructions for world-builder-site
status: authoritative
---

# Copilot/LLM Agent Instructions — world-builder-site

## Mission & Scope

Develop, maintain, and extend `world-builder-site` — a pure static Single Page Application (React 18 + TypeScript + Vite + Tailwind CSS) deployed to GitHub Pages at [world-building.inbarrose.com](https://world-building.inbarrose.com). All development must follow deterministic, phase-based, test-driven methodologies with atomic commits.

## Essential Knowledge for AI Agents

### 1. Architecture & Structure

- **Framework**: React 18 with TypeScript and Vite. Functional components with hooks only.
- **Styling**: Tailwind CSS with utility-first classes and Lucide React icons.
- **Routing**: React Router 6. Deep linking and page refresh are supported via `dist/404.html` and `dist/CNAME`.
- **Game Engine & Data**: All game rules, stage powers, and card decks load client-side from static JSON in `public/data/` or typed engine modules. No backend or server-side requirements.
- **Persistence**: Browser `localStorage` for named world state storage, plus JSON file export/import.
- **Testing**: Vitest + React Testing Library in `frontend/src/test/`.

### 2. Critical Workflows & Commands

All development is centered in `frontend/` (or via root convenience scripts):

```bash
# Install dependencies
npm --prefix frontend install

# Local development server (http://localhost:3000)
npm --prefix frontend run dev

# Run unit tests
npm --prefix frontend run test:ci

# Build production static bundle (outputs to frontend/dist)
npm --prefix frontend run build

# Preview production build locally
npm --prefix frontend run preview
```

### 3. Project-Specific Conventions

- **Atomic Commits**: The repository owner prefers small, atomic changes so they can review and commit frequently.
- **Data & Rules**: Game rules in `rules_v2025-01-27.json` and `frontend/public/data/*.json` are canonical. Never alter rule mechanics without explicit user direction.
- **Doc Integrity**: Keep `/docs/` and ADRs updated with any architectural decisions.
- **File Structure**:
  - `frontend/src/engine/` — Pure TypeScript game engine logic, types, deck calculations, and storage services.
  - `frontend/src/components/` — Modular React UI components (Layout, Map, Timeline, Entities, etc.).
  - `frontend/src/pages/` — Top-level view routes (`Home.tsx`, `Rules.tsx`, `Play.tsx`).
  - `frontend/src/test/` — Unit and component tests.
  - `frontend/public/` — Static assets, `CNAME`, and card deck data JSONs.

### 4. Output & Commit Standards

- Use conventional commits: `feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`.
- Ensure tests pass (`npm run test:ci`) and static build succeeds (`npm run build`) before closing tasks.

## Tasks

- [ ] Keep this file up to date as project evolves.
- [ ] Ensure all agents load and follow this file before operating.

