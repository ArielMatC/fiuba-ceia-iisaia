# Oil Production Forecaster — TP Final (IISAIA / FIUBA)

Web app to forecast per-well oil production using Arps decline curves: upload production history as CSV, fit a decline model (exponential / hyperbolic / harmonic), get an N-month forecast with an EUR estimate, and visualize history + forecast on a single chart.

**Status**: MVP complete (Phases 0–4). Backend (CSV ingest + Arps forecasting + EUR), typed React SPA, and the OpenAPI spec are all in place and verified end-to-end.

## Repo map
- `tasks/todo.md` — full design and phase plan (source of truth)
- `docs/decisions.md` — decision log · `docs/presentation.html` — project presentation
- `docs/openapi.yaml` — exported API spec (kept in sync by a backend test)
- `tasks/lessons.md` — lessons learned across AI-assisted sessions
- `.claude/` — Claude Code project config: rules, skills (`/learn`, `/phase-review`, `/run-app`), session-start hook
- `backend/` — FastAPI API · `frontend/` — React SPA

## Running the app

Backend (requires [uv](https://docs.astral.sh/uv/)):

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

API docs at http://localhost:8000/docs — tests with `uv run pytest`.

Frontend (requires Node 22+):

```bash
cd frontend
npm install
npm run dev
```

App at http://localhost:5173 — expects the backend on port 8000 (set `VITE_API_URL` in `frontend/.env` to change it).

## Demo walkthrough
1. Start the backend and frontend as above.
2. Open http://localhost:5173 → **Login** → **Upload**, drop `docs/sample-data.csv`, pick a unit, and upload (2 wells, 60 points).
3. Go to **Wells** → click a well → choose a model (e.g. hyperbolic), a horizon and an optional economic cutoff → **Generate forecast**.
4. The chart overlays the fitted forecast on the production history; toggle **Log Y**; the forecasts table shows R² and EUR, with per-row **CSV** export and **Delete**.

## OpenAPI spec
The live spec is at `/docs` (Swagger) and `/redoc`. A versioned copy lives at `docs/openapi.yaml`,
regenerated with `uv run python -m scripts.export_openapi` (from `backend/`) and kept honest by
`tests/test_openapi_sync.py`.

## Tests
- Backend: `uv run pytest --cov=app` (31 tests, ~95% coverage) — parser, Arps engine, and API.
- Frontend: `npm run lint` and `npm run build`.

## Working on this TP with Claude Code
Start `claude` from this directory (`tp-final/`) so the project rules, skills, and hooks load.
