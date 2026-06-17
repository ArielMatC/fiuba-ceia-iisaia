"""Parse and validate uploaded production CSV files.

The parser is pure: it takes raw bytes and returns valid records plus a list of
rejected rows with reasons. Persistence is handled separately by the API layer.
"""

from dataclasses import dataclass, field
from datetime import date
from io import BytesIO

import pandas as pd

REQUIRED_COLUMNS = ("well_name", "date", "oil_rate")


@dataclass
class ParsedRecord:
    well_name: str
    date: date
    oil_rate: float


@dataclass
class RejectedRow:
    line: int
    reason: str


@dataclass
class ParseResult:
    records: list[ParsedRecord] = field(default_factory=list)
    rejected: list[RejectedRow] = field(default_factory=list)


class MissingColumnsError(ValueError):
    """Raised when the CSV is missing one or more required columns."""


def parse_production_csv(raw: bytes) -> ParseResult:
    """Parse CSV bytes into validated records.

    Raises MissingColumnsError if required columns are absent. Otherwise returns
    a ParseResult; invalid rows are collected in ``rejected`` rather than raising.
    Duplicate ``(well_name, date)`` pairs keep the last occurrence.
    """
    try:
        frame = pd.read_csv(BytesIO(raw), dtype=str)
    except Exception as exc:  # noqa: BLE001 - surface any pandas parse failure uniformly
        raise MissingColumnsError(f"Could not parse CSV: {exc}") from exc

    frame.columns = [str(c).strip().lower() for c in frame.columns]
    missing = [c for c in REQUIRED_COLUMNS if c not in frame.columns]
    if missing:
        raise MissingColumnsError(f"Missing required columns: {', '.join(missing)}")

    result = ParseResult()
    # Map (well_name, date) -> index in result.records for last-wins dedupe.
    seen: dict[tuple[str, date], int] = {}

    for position, row in enumerate(frame.itertuples(index=False)):
        line = position + 2  # +1 header, +1 to 1-based
        record, reason = _parse_row(row)
        if record is None:
            result.rejected.append(RejectedRow(line=line, reason=reason))
            continue

        key = (record.well_name, record.date)
        if key in seen:
            result.records[seen[key]] = record  # last occurrence wins
        else:
            seen[key] = len(result.records)
            result.records.append(record)

    return result


def _parse_row(row: tuple) -> tuple[ParsedRecord | None, str]:
    well_name = (row.well_name or "").strip() if row.well_name is not None else ""
    if not well_name:
        return None, "empty well_name"

    try:
        parsed_date = pd.to_datetime(row.date, format="ISO8601").date()
    except (ValueError, TypeError):
        return None, f"invalid date: {row.date!r}"

    try:
        oil_rate = float(row.oil_rate)
    except (ValueError, TypeError):
        return None, f"invalid oil_rate: {row.oil_rate!r}"
    if oil_rate < 0:
        return None, f"negative oil_rate: {oil_rate}"

    return ParsedRecord(well_name=well_name, date=parsed_date, oil_rate=oil_rate), ""
