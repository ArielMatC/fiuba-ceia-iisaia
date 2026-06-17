# Design Decisions (ADR-lite)

One entry per decision, newest last. The full design lives in `tasks/todo.md`.

## 2026-06-11 — MVP scope, stack, and model
- **Context**: TP final deliverable definition (see `docs/presentation.html`).
- **Decision**: Arps decline curves (exponential / hyperbolic / harmonic) fitted with `scipy.optimize.curve_fit`; FastAPI + SQLAlchemy + SQLite backend; React 18 + TS + Vite frontend; `oil_rate` only; CSV upload as the single input path.
- **Consequences**: zero-infrastructure persistence, auto-generated OpenAPI, gas/water and auth out of scope. Full spec in `tasks/todo.md` §1–§5.

## 2026-06-12 — AI engineering scaffolding
- **Context**: the TP deliverables explicitly include "CLAUDE.md + rules + skills".
- **Decision**:
  - `CLAUDE.md` as a short stable-facts hub; detailed conventions in `.claude/rules/` (`workflow` and `domain-arps` always loaded; `backend`/`frontend` path-scoped via `paths` frontmatter).
  - Skills: `/learn` (learning loop), `/phase-review` (phase closure), `/run-app` (run + smoke check).
  - A `SessionStart` hook injects `tasks/lessons.md` plus pending todo items into every session.
- **Consequences**: every session starts with project memory; knowledge is routed to lessons (operational), this file (decisions), or CLAUDE.md/rules (stable facts).

## 2026-06-12 — Phase 0 toolchain
- **Context**: scaffolding both apps with the versions current at setup time.
- **Decision**: backend managed with **uv** (Python 3.12 pinned in `.python-version`); **React 19** (current Vite template default — supersedes the React 18 named in the original design); **Tailwind v4** via the `@tailwindcss/vite` plugin (CSS-first, no `tailwind.config`); eslint 10 flat config + prettier (`eslint-config-prettier`).
- **Consequences**: all backend commands run through `uv run`; frontend rule updated to React 19; Tailwind needs only `@import 'tailwindcss'` in `index.css`.

## 2026-06-12 — OpenAPI spec exported as a versioned deliverable
- **Context**: the TP requires the API spec as a YAML file in the repo, not only the live `/docs` endpoint.
- **Decision**: FastAPI stays the source of truth; `backend/scripts/export_openapi.py` exports the schema to `docs/openapi.yaml`, and `backend/tests/test_openapi_sync.py` fails whenever the file is stale relative to the app.
- **Consequences**: every API change must be followed by a regeneration (enforced by the test suite); the spec-first alternative was discarded.

## 2026-06-12 — EUR defined as a volume, integrated to a cutoff
- **Context**: the design left the EUR unit loose; the rate is per-day but model time is in months.
- **Decision**: EUR integrates the fitted rate over months (closed-form per variant) and multiplies by `DAYS_PER_MONTH` (365.25/12) to yield a volume in rate-unit × days. Integration stops at the economic-cutoff time (rate reaches the cutoff) or the horizon, whichever is first; the cutoff used is always stored.
- **Consequences**: EUR is comparable across forecasts only at equal cutoffs (documented in the UI). The forecast series is generated monthly from the first historical date through the horizon so the curve overlays history in the chart.

## 2026-06-17 — Kanagawa rebrand + design-system doc rename
- **Context**: brand refresh requested; the UI started from a generic slate/amber Tailwind look.
- **Decision**: adopt the *Great Wave off Kanagawa* palette (the well-known Kanagawa color scheme):
  sumi-ink surfaces, fuji-white text, crystal-blue (`#7E9CD8`) as the primary accent, carp-yellow
  (`#E6C384`) highlights, autumn-red danger. Tokens are defined as Tailwind v4 `@theme` colors in
  `frontend/src/index.css` and documented in `STYLEGUIDE.md` (renamed from `docs/design-system.md`).
  The app logo is a stylized cresting wave (`frontend/src/components/WaveLogo.tsx`).
- **Consequences**: components use semantic tokens (`bg-ink`, `text-fuji`, `text-wave`, …) instead of
  raw Tailwind slate/amber; the chart palette moved to Kanagawa hexes; `STYLEGUIDE.md` lives at the
  project root next to `ARCHITECTURE.md`.

## 2026-06-12 — Schema created at startup, no migrations (MVP)
- **Context**: SQLite single-file persistence for an academic MVP.
- **Decision**: `init_db()` runs `create_all` in the FastAPI lifespan; no Alembic. CORS is restricted to `http://localhost:5173`.
- **Consequences**: schema changes require recreating the DB file (`oil_forecaster.db`, gitignored); a production setup would add migrations and configurable origins.

## 2026-06-17 — Multiple forecast overlays
- **Context**: users need to compare more than one saved forecast for the same well directly on the decline chart.
- **Decision**: forecast table **View** switches are independent toggles instead of a single-selection control. The detail page fetches every selected forecast detail and `ProductionChart` renders one forecast line per selected ID using the documented chart palette.
- **Consequences**: users can visually compare model variants/horizons/cutoffs at once; CSV export remains per-row and is enabled when that row's selected forecast detail is loaded.

## 2026-06-17 — Cutoff caps the same forecast range shown in the chart
- **Context**: cutoff was only reducing EUR, while the persisted/displayed forecast curve still extended through the full horizon. EUR also used the raw `horizon_months` from t=0, while the chart treated horizon as future months beyond the last historical point.
- **Decision**: treat `horizon_months` as future months after the last historical point. Compute EUR over the fitted range from the first historical point through `last historical month + horizon_months`, capped by `economic_cutoff`; persist monthly forecast points only while `predicted_rate >= economic_cutoff`; filter `ForecastDetail` responses the same way for legacy rows already stored with lower points.
- **Consequences**: the table EUR and the chart now describe the same economic forecast window. Forecast lines stop by caudal and never include a returned point below the cutoff, including old forecasts created before this fix.
