# AI Agent Instructions — world-builder-site

This repository is a pure static Single Page Application (React 18 + TypeScript + Vite + Tailwind CSS) deployed to GitHub Pages at [world-building.inbarrose.com](https://world-building.inbarrose.com).

## Authoritative Agent References

1. **[Copilot & Quick Agent Instructions](.github/copilot-instructions.md)** — Tech stack, commands, and file conventions.
2. **[LLM Operating Guide](LLM_OPERATING_GUIDE.md)** — Phase discipline, TDD requirements, atomic commit rules, and quality gates.
3. **[Project Context](PROJECT_CONTEXT.md)** — High-level overview and architecture.
4. **[Architectural Decision Records (ADRs)](docs/DECISIONS.md)** — Core technical decisions.
5. **[Session State](docs/SESSION_STATE.md)** & **[Progress Tracker](docs/PROGRESS.md)** — Current phase and active tasks.

## Core Rules for Agents

- **Make Atomic Changes**: Keep edits focused on a single logical module or feature so commits remain clean and frequent.
- **Test & Validate**: Always run `npm --prefix frontend run test:ci` and `npm --prefix frontend run build` before committing.
- **Preserve Canonical Rules**: Do not modify game rule mechanics in `frontend/public/data/*.json` or `rules_v2025-01-27.json` unless explicitly requested.

