---
id: TECH_ARCH
title: Technical Architecture
version: 1.0.0
status: draft
---

# Technical Architecture

## Overview

- Frontend: React + TypeScript (Vite), located in `/frontend`.
- Backend: FastAPI (Python) exposing REST + optional WebSocket endpoints.
- Database: Supabase (Postgres).
- Auth: Supabase Auth + JWT for session tokens.
- Deployment: Frontend on Vercel; backend can be serverless or hosted (recommend Vercel functions or Fly.io).

## Components

- `engine` (Python): rules loader, deck simulator, stage engine, timeline manager.
- `api` (FastAPI): REST endpoints for sessions, draws, invites, exports.
- `db` (SQLModel): users, sessions, session_state, timeline, map tiles, entities.
- `frontend`: UI components, grid canvas, timeline UI, deck controls.

## Integration patterns

- Use Pydantic models for all request/response schemas.
- Use optimistic concurrency with `version` field on sessions.

## Tasks

- [ ] Implement API contract in `docs/api_spec.md` (or generate via FastAPI).
