---
id: PHASE_0
title: Phase 0 - Foundation
version: 1.0.0
status: in-progress
---

# Phase 0: Foundation

## Goals

- Create living docs
- Provide automation scripts
- Set up CI pipeline and linting rules
- Prepare initial OpenAPI and db schema templates

## Acceptance Criteria

- Repo scaffold (docs, scripts) committed
- `PROJECT_CONTEXT.md` present and correct
- GitHub Actions CI initial workflow runs (lint + tests)
- `pyproject.toml` present and valid

## Implementation Checklist

- [x] Create `PROJECT_CONTEXT.md`
- [x] Create `docs/` files scaffold
- [x] Create `scripts/` scaffold (context recovery + quality gate stubs)
- [x] Add `pyproject.toml` and `LICENSE`
- [x] Add `.github/workflows/ci.yml`

## Tasks

- [ ] Implement scripts/setup-dev.sh instructions locally and verify
- [ ] Run CI and fix lint failures
- [ ] Add placeholder FastAPI app at `src/app/main.py`
