from pathlib import Path

import yaml

from app.main import app

SPEC_PATH = Path(__file__).resolve().parents[2] / "docs" / "openapi.yaml"
REGEN_HINT = "regenerate with: uv run python -m scripts.export_openapi (from backend/)"


def test_openapi_yaml_is_in_sync() -> None:
    assert SPEC_PATH.exists(), f"docs/openapi.yaml is missing - {REGEN_HINT}"
    on_disk = yaml.safe_load(SPEC_PATH.read_text(encoding="utf-8"))
    assert on_disk == app.openapi(), f"docs/openapi.yaml is stale - {REGEN_HINT}"
