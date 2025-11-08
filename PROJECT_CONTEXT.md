---
id: PROJECT_CONTEXT
title: Project Context - world-builder-site
version: 1.0.0
status: draft
---

# PROJECT_CONTEXT.md — world-builder-site

## Project Overview

World-builder-site is a web application for collaborative world-building using a card-draw based roleplaying "extra". The app combines a canonical rule system (cards → world events), a timeline, and an interactive grid map. This repo contains the full development scaffold for agentic development.

## Primary Goals

- Provide a static, user-friendly site with a play mode (anonymous) and authenticated persistent sessions with invites.
- Backend implemented in **Python (FastAPI)** with Pydantic/SQLModel models and tests (Pytest).
- Frontend implemented in **React + TypeScript** (Vite), deployed to Vercel.
- Persistent DB: **Supabase (Postgres)**; Auth via Supabase Auth.
- Use GitHub + Copilot for agentic development. This repo follows the LLM Development Framework.

## Key Docs (READ FIRST)

1. `/PROJECT_CONTEXT.md` (this file)
2. `/docs/SESSION_STATE.md` — current phase & next steps
3. `/docs/PROGRESS.md` — phase progress & checkboxes
4. `/docs/technical-architecture.md`
5. `/docs/functional-requirements.md`
6. `/docs/phase-0-specifications.md` (Foundation)
7. `/docs/phase-1-specifications.md` (Game Engine & API)

## Current Phases

- **Phase 0**: Foundation (scaffold, CI, docs) — IN PROGRESS
- **Phase 1**: Game Engine & API — PENDING
- **Phase 2**: Frontend Play UI (React) — PENDING
- **Phase 3**: Collaboration & Sessions — PENDING
- **Phase 4**: AI premium features — PENDING

## Critical Development Rules

1. Always follow phase sequence. Do not implement future-phase features until current phase is validated.
2. Achieve minimum **80% test coverage** for Phase 0/1 components before advancing.
3. Use SQLModel / Pydantic models for shared schema. Export OpenAPI automatically from FastAPI.
4. Keep `rules_vYYYY-MM-DD.json` frozen for Phase 0. Do not alter game rules; build engine to consume it.

## Repo conventions

- Python package manager: **poetry**
- Python version: **>=3.12**
- Frontend: `/frontend` (Vite + React + TypeScript + Tailwind)
- CI: GitHub Actions
- Deploy: Vercel (frontend), FastAPI backend to a serverless / host of choice or Vercel Serverless.

## How to start an agentic session (developer / LLM)

1. Read `PROJECT_CONTEXT.md`.
2. Read `docs/SESSION_STATE.md`.
3. Read current phase file: `docs/phase-0-specifications.md`.
4. Run `./scripts/context-recovery.sh` locally.
5. Use Copilot to create issues from the `## Tasks` sections in docs.

---

## Quick Context Recovery Commands

```bash
# show top-level context
sed -n '1,200p' PROJECT_CONTEXT.md

# show session state
sed -n '1,200p' docs/SESSION_STATE.md

# run recovery helper
./scripts/context-recovery.sh
