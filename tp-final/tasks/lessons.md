# Lessons Learned

Captured by `/learn`. Each entry records what happened, what we learned, and the rule that prevents repeating it.
Stable facts get promoted to CLAUDE.md or `.claude/rules/` and may then be removed from here.

<!-- Entry template:
## YYYY-MM-DD — <short title>
- **Context**: what we were doing
- **Lesson**: what we learned
- **Rule**: how to act next time
-->

## 2026-06-02 — A column named `date` breaks SQLAlchemy 2.x Mapped annotations
- **Context**: `date: Mapped[date]` on ProductionData/ForecastData raised MappedAnnotationError.
- **Lesson**: the mapped attribute `date` shadows the imported `date` type in the class namespace, so SQLAlchemy can't resolve the annotation.
- **Rule**: alias the type (`from datetime import date as DateType`) and annotate `Mapped[DateType]` whenever a column is named `date`.

## 2026-06-05 — FastAPI uploads need python-multipart; ruff B008 fights FastAPI
- **Context**: Form/File endpoints raised "Form data requires python-multipart"; ruff flagged `Depends()`/`File()` defaults.
- **Lesson**: `python-multipart` is a runtime dep for any multipart endpoint; `B008` (no function calls in defaults) is wrong for FastAPI's dependency idiom.
- **Rule**: add `python-multipart` when adding uploads; keep `ignore = ["B008"]` in ruff config.

## 2026-06-10 — Browser E2E: Chrome MCP down, use the Preview MCP
- **Context**: needed a real browser to verify the SPA; the Chrome extension was not connected and computer-use can't drive browsers (read tier).
- **Lesson**: the Preview MCP reads `.claude/launch.json` from the **repo root** (not tp-final/), runs the dev server itself, and needs port 5173 free — stop any manually-started Vite first. CORS is pinned to 5173 so the preview must own that port.
- **Rule**: to screenshot/drive the frontend, free 5173, `preview_start` the `frontend` config, then `preview_eval`/`preview_screenshot`. Root `launch.json` uses `runtimeArgs: ["--prefix","tp-final/frontend","run","dev"]`.

## 2026-06-12 — System python is 3.9; everything goes through uv
- **Context**: Phase 0 backend setup on this machine.
- **Lesson**: `python` resolves to 3.9.13, below the project's 3.11+ requirement. Python 3.12 is pinned via uv (`backend/.python-version`).
- **Rule**: run all backend commands as `uv run ...` from `backend/`; never call `python` directly.

## 2026-06-12 — `npm create vite` drops --template on Windows
- **Context**: `npm create -y vite@latest frontend -- --template react-ts` silently scaffolded the vanilla-ts template (no React, no eslint, no vite.config).
- **Lesson**: npm's argument passthrough mangled the flags on this setup.
- **Rule**: scaffold with `npx -y create-vite@latest <dir> --template react-ts`, then immediately verify `package.json` contains `react` and a `lint` script.

## 2026-06-12 — Node 22.12 is below eslint 10's supported range
- **Context**: npm warned EBADENGINE (eslint 10 wants `^20.19 || ^22.13 || >=24`; installed Node is 22.12.0).
- **Lesson**: eslint installs and runs fine today, but the version is officially unsupported.
- **Rule**: treat as a warning, not a blocker; if eslint misbehaves, upgrading Node is the first suspect.

## 2026-06-15 — Claude Code config only loads from the session root
- **Context**: setting up the `.claude/` scaffolding for tp-final inside a repo that contains several TPs.
- **Lesson**: `settings.json`, rules, and skills under `tp-final/.claude/` are only picked up when Claude Code is started from `tp-final/` (or a directory below it).
- **Rule**: always start `claude` from `tp-final/` when working on this TP.

## 2026-06-17 — Cutoff and EUR must share the chart's time basis
- **Context**: forecast cutoff reduced EUR but did not shorten the persisted/displayed forecast series; EUR also used `horizon_months` from the first historical point while the chart extended horizon beyond the last point.
- **Lesson**: when a forecast has an economic cutoff, the chart points and EUR must use the same fitted time window or the UI appears inconsistent. The displayed series must be capped by caudal, not just by a derived cutoff month. Existing persisted forecasts may still contain stale points, so API responses must defend the invariant too.
- **Rule**: interpret `horizon_months` as future months after the last historical point, persist forecast points only while `predicted_rate >= economic_cutoff`, and filter `ForecastDetail` responses by the same rule.
