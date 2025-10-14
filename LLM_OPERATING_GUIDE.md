---
id: LLM_OPERATING_GUIDE
title: Agent Operating Guide for world-builder-site
version: 2.0.0
status: authoritative
---

# LLM OPERATING GUIDE

This document defines **how any AI or agentic system should interact with this repository**, generate code, plan work, and maintain quality.
It merges the general "LLM Development Framework" principles with the specifics of the `world-builder-site` architecture.

---

## 1. Mission

Create, maintain, and extend the `world-builder-site` application — a hybrid Python (FastAPI) + React + Supabase world-building platform — in a deterministic, test-driven, phase-based manner with no uncontrolled code generation or scope drift.

---

## 2. Core Rules of Operation

1. **Single-Phase Discipline**  
   - Only work on the *current active phase* listed in `/docs/SESSION_STATE.md`.  
   - Do not alter future-phase files or placeholders until current phase’s quality gates pass.

2. **Determinism & Idempotence**  
   - Each run or commit must yield the same results given the same context and inputs.  
   - Avoid random IDs or timestamps in code output unless seeded.

3. **Explain → Plan → Implement → Validate Loop**  
   1. *Explain* what will be done.  
   2. *Plan* by enumerating tasks or subtasks.  
   3. *Implement* in smallest atomic commits.  
   4. *Validate* via lint + tests + CI results.

4. **Safety & Auditability**  
   - Never delete or overwrite human-authored documentation.  
   - Create new versions instead of destructive edits (e.g., `rules_vYYYY-MM-DD.json`).  
   - All generated code must include minimal docstrings and type hints.

5. **Human Override**  
   - The repository owner (Inbar Rose) always has higher authority.  
   - Agents must stop on uncertainty or conflict and request clarification.

---

## 3. Repository Structure (for agents)

| Folder | Purpose |
|--------|----------|
| `/docs` | All human-readable specifications and phase guides. |
| `/scripts` | Python and shell automation tools. |
| `/src` | FastAPI app (`app/`) and engine modules (`engine/`). |
| `/frontend` | React + TypeScript (Vite) project. |
| `/tests` | Pytest suites (unit/integration). |
| `.github/workflows` | CI/CD configuration. |

Agents must **read** the following before writing code:

- `PROJECT_CONTEXT.md`
- `docs/SESSION_STATE.md`
- Current phase file (e.g., `docs/phase-1-specifications.md`)
- `LLM_OPERATING_GUIDE.md` (this file)

---

## 4. Phase-Based Development System

Each phase consists of:

| Step | Description |
|------|--------------|
| **Spec Review** | Read the relevant `/docs/phase-N-specifications.md`. |
| **Planning** | Generate issue/task list under `/docs/PROGRESS.md`. |
| **Implementation** | Create or modify code limited to that phase. |
| **Testing** | Achieve ≥ 80 % coverage via Pytest. |
| **Quality Gate** | Run `scripts/quality-gate.py`. |
| **Phase Closure** | Update `/docs/SESSION_STATE.md` and mark next phase active. |

Active phase appears as `status: in-progress` in its YAML header.

---

## 5. Workflows for LLM Agents

### 5.1 Context Recovery

When starting work:

```bash
./scripts/context-recovery.sh
```

Read its output (project summary, session, phase).  
Agents then load these files into memory before coding.

### 5.2 Task Execution Protocol

1. Identify all `## Tasks` checkboxes in current phase doc.  
2. Convert them into granular implementation steps.  
3. For each task:
   - Generate plan
   - Write code/tests
   - Run local checks:  

     ```bash
     poetry run ruff check .
     poetry run black --check .
     poetry run pytest
     ```

   - If all pass, commit with conventional message (`feat:`, `fix:`, `test:`).

4. Update the corresponding checkbox in `/docs/PROGRESS.md`.

### 5.3 Pull-Request Discipline

- 1 PR = 1 phase or sub-phase.
- Include test results and coverage summary.
- Reference the phase spec and tasks completed.

---

## 6. Reasoning Framework (adapted from original guide)

### 6.1 Cognitive Steps

Perceive → Clarify → Plan → Verify Plan → Implement → Test → Reflect

### 6.2 Verification Layer

Before writing any code:

- Check context freshness: compare current phase IDs vs. cached.  
- Validate that all dependencies of the task exist.  
- Abort if missing files or undefined behavior.

### 6.3 Reflection Layer

After completing a unit of work:

- Run static analysis.  
- Compare result against spec acceptance criteria.  
- Log reflection entry under `/docs/PROGRESS.md`.

---

## 7. Quality and Testing Standards

| Type | Framework | Coverage |
|------|------------|-----------|
| Unit | Pytest | ≥ 80 % |
| Integration | Pytest (async + HTTPX) | Must cover main endpoints |
| E2E | Playwright (frontend) | Optional for MVP |
| Lint | Ruff + Black | No warnings |
| Type Check | MyPy | Strict mode |

---

## 8. Coding Conventions

### Python

- Use `async def` endpoints in FastAPI.
- All public functions typed and documented.
- Pydantic v2 models with field validation.

### React/TypeScript

- Functional components only.
- CSS via Tailwind + design tokens.
- Data fetching through typed client (OpenAPI-generated).

---

## 9. Communication Protocol Between Frontend and Backend

- API schema auto-generated by FastAPI OpenAPI.
- Shared TypeScript types built from Python models via `datamodel-code-generator`.
- Responses serialized through Pydantic models only.
- WebSocket or SSE used later for collaboration (Phase 3).

---

## 10. Security Rules (from master framework)

- No secrets committed to repo; use GitHub Secrets.  
- Sanitize all text inputs.  
- Rate-limit public endpoints.  
- JWT validity ≤ 24 h.  
- Hash all tokens and sensitive data before persistence.  
- Enforce CORS and CSRF headers.

---

## 11. Tooling & Automation

| Purpose | Script |
|----------|---------|
| Setup | `scripts/setup-dev.sh` |
| Context restore | `scripts/context-recovery.sh` |
| Quality gate | `scripts/quality-gate.py` |
| Architecture check | `scripts/check-architecture.py` |
| Test runner | `scripts/test-runner.py` |

Agents must run these in sequence before moving phases.

---

## 12. Collaboration Etiquette

- Always respect phase boundaries.  
- Never alter human narrative content in `/docs/rules*` or `/docs/lore*`.  
- When uncertain about a decision, add a question entry in `/docs/DECISIONS.md`.

---

## 13. Error Recovery Procedure

If an operation fails:

1. Record failure summary in `/docs/PROGRESS.md`.  
2. Run `scripts/context-recovery.sh`.  
3. Roll back offending commit if needed.  
4. Re-plan before new attempt.

---

## 14. Output Expectations

Every generated code file must include the following header (example shown as plain text to avoid nested triple quotes):

    Auto-generated by agent under LLM_OPERATING_GUIDE v2.0.
    Phase: <current_phase_id>
    Date: <YYYY-MM-DD>
    Purpose: <short description>

Every generated Markdown spec must end with a `## Tasks` section.

---

## 15. Ethics & Attribution

- Respect copyright of included assets (e.g., game-icons.net).  
- Attribute creative assets appropriately in `/docs/assets.md`.  
- Never leak sensitive data or API keys.

---

## 16. Next Steps for Agents

1. Verify that this guide matches the repo context.  
2. Proceed with tasks in `/docs/phase-0-specifications.md`.  
3. On completion, update `/docs/SESSION_STATE.md` to `Phase 1`.

---

## 17. Appendix – Quick Command Reference

```bash
# run backend locally
poetry run uvicorn src.app.main:app --reload

# run tests
poetry run pytest

# run quality gate
python scripts/quality-gate.py

# run architecture check
python scripts/check-architecture.py
```

---

## Tasks

- [ ] Keep this file up to date when new tooling or phases are added.
- [ ] Ensure Copilot or any agent loads this guide first when operating.
