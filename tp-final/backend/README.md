# Backend — Oil Production Forecaster API

FastAPI + SQLAlchemy + SQLite. Managed with [uv](https://docs.astral.sh/uv/).

## Setup

```bash
uv sync
```

## Run

```bash
uv run uvicorn app.main:app --reload --port 8000
```

OpenAPI docs at http://localhost:8000/docs

## Tests and lint

```bash
uv run pytest
uv run pytest --cov=app
uv run ruff check .
uv run black --check .
```
