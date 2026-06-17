# Oil Production Forecaster — TP Final (IISAIA / FIUBA)

Web app that forecasts per-well oil production using Arps decline curves.
Backend: FastAPI + SQLAlchemy 2.x + SQLite + SciPy. Frontend: React 19 + TypeScript + Vite.

**Current state**: MVP complete (Phases 0–4). Backend (CSV ingest, Arps fit/predict/EUR, REST API, OpenAPI export) with 31 tests at ~95% coverage; typed React SPA (Upload / Wells / WellDetail with overlay chart, log-Y, CSV export); verified end-to-end in a browser.

## Source of truth
- `ARCHITECTURE.md` — structural map of the system (modules, data model, API, request flows). Design lives here.
- `STYLEGUIDE.md` — brand identity, color/typography tokens, UI component patterns.
- `docs/decisions.md` — design decision log (ADR-lite, the *why*).
- `tasks/todo.md` — phase plan with checkboxes and per-phase Review (tracker, not design).
- `tasks/lessons.md` — lessons learned across sessions (injected at session start by a hook).
- `docs/presentation.html` — project presentation (deliverables and scope).

Keep `ARCHITECTURE.md` and `STYLEGUIDE.md` in sync with every structural/visual change — see `.claude/rules/docs.md`.

## Repo layout (planned, see todo.md §5)
- `backend/` — FastAPI app: `app/main.py`, `app/models/`, `app/schemas/`, `app/api/`, `app/services/`, `tests/`
- `frontend/` — Vite + React + TS: `src/api/`, `src/components/`, `src/pages/`
- `docs/`, `tasks/`

## Commands
Backend (from `backend/`, managed with **uv** — never call `python` directly, the system default is 3.9):
- `uv sync` — create/update the env (Python 3.12, pinned in `.python-version`)
- `uv run uvicorn app.main:app --reload --port 8000` — dev server
- `uv run pytest` / `uv run pytest --cov=app` — tests / coverage
- `uv run ruff check .` and `uv run black --check .` — lint / format check
- `uv run python -m scripts.export_openapi` — export the OpenAPI spec to `docs/openapi.yaml` (required after any API change; a sync test enforces it)

Frontend (from `frontend/`):
- `npm run dev` — Vite dev server (port 5173)
- `npm run build` — type-check + production build
- `npm run lint` / `npm run format` — eslint / prettier

## Workflow
- Each phase (todo.md §6) starts in plan mode and closes with `/phase-review`.
- A phase is done only when: tests pass, backend coverage ≥ 85%, the demo is verifiable, and the Review section in todo.md is updated.
- Detailed conventions live in `.claude/rules/` (workflow, domain-arps, backend, frontend).

## Project Learning Protocol
This project must get smarter every session:
1. After any user correction, design decision, or discovered gotcha → run `/learn`.
2. Routing: operational lessons → `tasks/lessons.md`; design decisions → `docs/decisions.md`; stable facts (confirmed commands, conventions) → promote into this file or the matching `.claude/rules/` file.
3. Keep this file short: stable facts only, no history. History lives in lessons and decisions.
4. At the end of any session that changed code or made decisions, run `/learn` before finishing.
