---
id: PHASE_1
title: Phase 1 - Game Engine & API
version: 1.0.0
status: pending
---

# Phase 1: Game Engine & API

## Goals

- Implement FastAPI backend with core engine
- Create SQLModel schemas (users, sessions, session_state, timeline, tiles, entities)
- Implement card draw logic (server-side)
- Provide endpoints for anonymous simulate and persistent session operations

## Acceptance Criteria

- Unit tests (Pytest) for engine functions passing
- API routes exist and OpenAPI docs generated
- DB migrations setup (Alembic)
- `rules_v2025-10-14.json` added as canonical rules

## Implementation Checklist

- [ ] Create `src/engine` module (deck, rules loader)
- [ ] Create `src/api` routers (auth, sessions, simulate, export)
- [ ] Create `tests/unit` for engine and models
- [ ] Implement `scripts/test-runner.py` integration

## Tasks

- [ ] Implement SQLModel classes
- [ ] Implement simple `POST /simulate/draw` endpoint
- [ ] Add example session export JSON generator
