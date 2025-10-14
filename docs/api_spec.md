---
id: API_SPEC
title: API Specification (overview)
version: 0.1.0
status: draft
---

# API Spec (overview)

FastAPI will auto-generate OpenAPI; below are key endpoints to implement for Phase 1.

## Public

- `GET /rules` — returns rules JSON
- `POST /simulate/draw` — simulate a draw (anon)

## Authenticated

- `POST /auth/signup` — signup
- `POST /auth/login` — login / magic link
- `POST /sessions` — create session
- `GET /sessions/:id` — read session
- `PUT /sessions/:id/state` — update session state (timeline/map)
- `POST /sessions/:id/invite` — create invite token
- `POST /sessions/:id/export` — request export

## Tasks

- [ ] Implement FastAPI routers and Pydantic models
- [ ] Generate OpenAPI YAML from app and store under `docs/openapi/`
