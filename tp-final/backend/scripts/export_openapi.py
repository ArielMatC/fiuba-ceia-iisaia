"""Export the FastAPI OpenAPI schema to docs/openapi.yaml.

Run from backend/: uv run python -m scripts.export_openapi
"""

from pathlib import Path

import yaml

from app.main import app

OUTPUT = Path(__file__).resolve().parents[2] / "docs" / "openapi.yaml"


def export() -> None:
    schema = app.openapi()
    OUTPUT.write_text(yaml.safe_dump(schema, sort_keys=False, allow_unicode=True), encoding="utf-8")
    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    export()
