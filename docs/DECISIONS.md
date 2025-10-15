---
id: DECISIONS
title: Architectural Decisions
version: 1.0.0
status: draft
---

# DECISIONS.md

## ADR-001: Stack selection

**Decision**: Python backend (FastAPI/SQLModel) + React/TypeScript frontend on Vercel; Supabase for DB/Auth.
**Rationale**: Python for core logic & testability; React for interactive canvas and UI responsiveness.
**Consequences**: Backend will be authoritative for game logic.

## ADR-002: Rules immutable by engine

**Decision**: Game rules and mappings are stored in versioned JSON (`rules_vYYYY-MM-DD.json`) and are immutable for saved sessions.
**Rationale**: Prevents content drift and ensures saved games are consistent.

## Tasks

- [ ] Add future ADRs as decisions are made.
