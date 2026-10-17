---
id: LLM_OPERATING_GUIDE
title: Agent Operating Guide for world-builder-site
version: 3.0.0
status: authoritative
---

# LLM OPERATING GUIDE — world-builder-site

This document defines **how any AI agent or developer must interact with this repository**, generate code, plan work, and maintain software quality for the `world-builder-site` project.

---

## 1. Mission

Create, maintain, and extend the `world-builder-site` application — a pure client-side, static Single Page Application built in **React 18 + TypeScript + Vite + Tailwind CSS** deployed to GitHub Pages at [world-building.inbarrose.com](https://world-building.inbarrose.com). All development must be deterministic, modular, test-driven, and divided into atomic commits.

---

## 2. Core Rules of Operation

1. **Atomic Commits & Frequent Checkpoints**
   - The user requires atomic changes so they can review and commit frequently.
   - Keep pull requests and changes focused on single logical components with accompanying unit tests.

2. **Phase Discipline**
   - Work strictly within the current milestone defined in `docs/SESSION_STATE.md` and `docs/PROGRESS.md`.
   - Never implement unverified future-phase features before validating the current phase.

3. **Determinism & Test-Driven Development (TDD)**
   - All pure business logic (deck engine, probability calculations, timeline sequences, storage serializers) must be covered with unit tests in Vitest.
   - Maintain minimum **80% test coverage** for core engine and state services.

4. **Safety & Documentation Integrity**
   - Game rules in `rules_v2025-01-27.json` and `frontend/public/data/*.json` are canonical and immutable unless explicitly requested by the user.
   - Always update `docs/PROGRESS.md`, `docs/SESSION_STATE.md`, and `docs/DECISIONS.md` (ADRs) when architectural changes or new modules are introduced.

5. **Human Override**
   - The repository owner (Inbar Rose) has authoritative control. On ambiguity or design conflicts, document questions and request feedback before modifying core behavior.

---

## 3. Repository Architecture

```
world-builder-site/
├── .github/
│   ├── copilot-instructions.md # Quick reference for AI agents
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment to GitHub Pages
├── docs/                       # Architecture, ADRs, blueprints, and progress
├── frontend/
│   ├── public/
│   │   ├── CNAME               # Custom domain config (world-building.inbarrose.com)
│   │   └── data/               # Static card decks and stage power JSONs
│   ├── src/
│   │   ├── components/         # Modular UI (Map, Timeline, Entities, Layout)
│   │   ├── engine/             # Core TypeScript engine (Deck, Rules, Storage)
│   │   ├── pages/              # Top-level routes (Home, Rules, Play/Studio)
│   │   ├── test/               # Vitest + React Testing Library suites
│   │   ├── App.tsx             # Root router & layout
│   │   └── main.tsx            # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── vitest.config.ts
├── AGENTS.md                   # Agent pointers
├── LLM_OPERATING_GUIDE.md      # This guide
├── PROJECT_CONTEXT.md          # High-level project context
├── README.md                   # User quick-start guide
└── rules_v2025-01-27.json      # Canonical rules data
```

---

## 4. Workflows & Command Protocol

All commands run via `npm` inside `frontend/` (or via root package.json scripts):

```bash
# 1. Install dependencies
npm --prefix frontend install

# 2. Start local development server (http://localhost:3000)
npm --prefix frontend run dev

# 3. Run unit tests
npm --prefix frontend run test:ci

# 4. Run test coverage
npm --prefix frontend run test:coverage

# 5. Build static production distribution
npm --prefix frontend run build

# 6. Preview production build locally
npm --prefix frontend run preview
```

---

## 5. Development Cycle for Agents

```
Perceive → Plan → Verify Plan → Implement → Test & Validate → Commit
```

1. **Perceive**: Read `PROJECT_CONTEXT.md`, `docs/SESSION_STATE.md`, and relevant specs in `docs/`.
2. **Plan**: Formulate atomic steps and present in `implementation_plan.md`.
3. **Implement**: Write modular TypeScript code following standard React hook patterns and functional components.
4. **Test & Validate**:
   - Run `npm --prefix frontend run test:ci` (all tests must pass).
   - Run `npm --prefix frontend run build` (TypeScript compilation must pass with 0 errors).
5. **Reflect & Document**: Update `docs/PROGRESS.md` and log ADRs in `docs/DECISIONS.md`.

---

## 6. Coding & Styling Standards

- **TypeScript**: Strict mode enabled (`tsconfig.json`). No `any` where typed interfaces can be expressed.
- **Components**: Functional components only. Keep presentation separated from business/engine logic.
- **Styling**: Tailwind CSS with semantic theme classes (`bg-background`, `text-foreground`, `bg-primary`, `border-border`).
- **Icons**: Lucide React.
- **State Management**: React state hooks (`useState`, `useReducer`, `useContext`) combined with local storage persistence services.

---

## 7. Quality Gate Checklist

Before submitting or committing any change:
- [ ] TypeScript compiles cleanly (`npm run build`).
- [ ] All Vitest unit tests pass (`npm run test:ci`).
- [ ] No regression in existing page routes (`/`, `/rules`, `/play`).
- [ ] `dist/CNAME` and `dist/404.html` are correctly output.
- [ ] Documentation and ADRs updated.

---

## Tasks

- [ ] Maintain this operating guide as the authoritative standard for all agent interactions.
- [ ] Ensure all subagents and tools adhere to the atomic commit and testing rules.

