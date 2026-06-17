# TP Final — Oil Production Forecaster — Tracker

App de pronóstico de producción por pozo usando curvas de declinación tipo Arps.
Backend FastAPI + SQLite. Frontend React + Vite. Input: CSV subido por el usuario.

> **Diseño** (dominio, modelo de datos, API, UI, estructura, riesgos): ver [ARCHITECTURE.md](../ARCHITECTURE.md).
> **Decisiones** (el porqué): [docs/decisions.md](../docs/decisions.md). **Tokens de UI**: [STYLEGUIDE.md](../STYLEGUIDE.md).
> Este archivo es solo el tracker de fases + Review.

---

## Fases (checklist)

### Fase 0 — Setup
- [x] Scaffolding backend (`pyproject.toml`, FastAPI hello, ruff, pytest)
- [x] Scaffolding frontend (Vite + TS, eslint, Tailwind)
- [x] README raíz con instrucciones de arranque (back + front)
- [x] `.gitignore` y `docs/csv-format.md` con CSV de ejemplo

### Fase 1 — Backend: dominio mínimo
- [x] Modelos SQLAlchemy + creación de schema al arranque
- [x] Schemas Pydantic
- [x] Endpoint `POST /api/wells/upload` con validación de columnas, upsert por `well_name`, dedupe `(well, date)`
- [x] `GET /api/wells`, `GET /api/wells/{id}/production`
- [x] Tests: parser de CSV (válido, columnas faltantes, fechas malas, duplicados)
- [x] Regenerar `docs/openapi.yaml` con los endpoints nuevos (sync test verde)

### Fase 2 — Backend: motor de forecast
- [x] `services/arps.py`: fit de las 3 variantes con `curve_fit`, devuelve params + R²
- [x] `predict(params, dates)` y `eur(params, cutoff)`
- [x] Endpoint `POST /api/wells/{id}/forecast` → fit + persistir + devolver
- [x] `GET /api/forecasts/{id}`, `GET /api/wells/{id}/forecasts`
- [x] Tests: fit sobre data sintética de cada variante (recuperar params dentro de tolerancia), EUR conocido, manejo de fit fallido
- [x] Regenerar `docs/openapi.yaml` con los endpoints nuevos (sync test verde)

### Fase 3 — Frontend
- [x] Cliente API tipado + react-query
- [x] Página Upload con dropzone, preview, feedback de carga
- [x] Página Wells (tabla + navegación)
- [x] Página Well Detail: gráfico histórico, formulario forecast, render del forecast superpuesto, lista de forecasts previos
- [x] Toggle log-y, tooltip con valores, descarga de forecast a CSV

### Fase 4 — Integración y pulido
- [x] CORS configurado, variables de entorno (`VITE_API_URL`)
- [x] Dataset demo (1–2 pozos sintéticos) en `docs/sample-data.csv`
- [x] Walkthrough end-to-end manual: upload → forecast → ver gráfico
- [x] README final con walkthrough (capturas pendientes, opcional)

---

## Review (post-implementación)

> _Se completa al finalizar cada fase con: qué se hizo, qué quedó pendiente, lecciones._

### Fase 0 — 2026-06-12
- **Hecho**: backend FastAPI gestionado con uv (Python 3.12 pineado, pytest/ruff/black verdes, endpoint `GET /api/health`); frontend Vite + React 19 + TS + Tailwind v4 + eslint/prettier (lint y build verdes); `.gitignore`; `docs/csv-format.md`; READMEs raíz y backend con instrucciones.
- **Verificado**: `uv run pytest` 1 passed; `GET /api/health` y `/docs` → 200; frontend dev en 5173 → 200 con Tailwind aplicado; build de producción OK.
- **Desvíos del diseño**: React 19 en lugar de 18 (default del template actual de Vite, sin impacto en el MVP — rule y docs actualizadas).
- **Pendiente**: nada de Fase 0.
- **Lecciones**: ver `tasks/lessons.md` (python default 3.9 → todo vía uv; `npm create vite` pierde `--template` en Windows; warning de engine Node 22.12 vs eslint 10).

### Fases 1–4 — 2026-06-12
- **Hecho (Fase 1)**: modelos SQLAlchemy 2.x (4 tablas, cascada), schemas Pydantic v2, `POST /api/wells/upload` (parser puro en `csv_loader.py` con validación + dedupe last-wins + upsert), `GET /api/wells` (con agregados), `GET /api/wells/{id}` y `/production`, `DELETE`. Requisito OpenAPI: export + sync test.
- **Hecho (Fase 2)**: `services/arps.py` (fit de las 3 variantes con bounds, R², fallback hiperbólico→exponencial; `predict_rate`; `eur` con cutoff económico y cumulativo analítico), `services/forecast.py` (orquesta fit + persiste serie mensual que solapa histórico + horizonte), endpoints de forecast (crear/listar/detalle/borrar).
- **Hecho (Fase 3)**: cliente API tipado (`src/api/`), hooks react-query, router, páginas Upload (dropzone + resumen), Wells (tabla + borrar), WellDetail (gráfico Recharts con histórico + forecast superpuesto, toggle log-Y, tabla de forecasts con R²/EUR, export CSV, borrar).
- **Hecho (Fase 4)**: CORS (origen 5173), `VITE_API_URL`, `docs/sample-data.csv` (2 pozos sintéticos), README final con walkthrough.
- **Verificado**: backend 31 tests / **95% coverage**, ruff + black limpios; frontend lint + build limpios; **E2E real en navegador** (Preview MCP): upload de sample-data → 2 pozos/60 puntos, forecast hiperbólico R²=0.9949 EUR=600.540, gráfico con forecast superpuesto proyectado a 2029, toggle log-Y, y fetch CORS browser→API OK.
- **Desvíos del diseño**: EUR se define como volumen (rate×días, convertido desde rate×meses con `DAYS_PER_MONTH`); serie de forecast solapa el histórico para visualización; `python-multipart` agregado (requerido por uploads de FastAPI); ruff ignora `B008` (idioma de `Depends`).
- **Pendiente**: capturas/gif en el README (opcional). Migraciones (Alembic) fuera de alcance MVP (schema en startup).
- **Lecciones**: ver `tasks/lessons.md`.
