from datetime import date

import pytest

from app.services.csv_loader import (
    MissingColumnsError,
    parse_production_csv,
)

VALID_CSV = b"""well_name,date,oil_rate
LJE-101,2022-01-01,1240.5
LJE-101,2022-02-01,1102.8
LJE-102,2022-01-01,860.0
"""


def test_parses_valid_csv() -> None:
    result = parse_production_csv(VALID_CSV)
    assert len(result.records) == 3
    assert result.rejected == []
    first = result.records[0]
    assert first.well_name == "LJE-101"
    assert first.date == date(2022, 1, 1)
    assert first.oil_rate == 1240.5


def test_missing_column_raises() -> None:
    csv = b"well_name,oil_rate\nLJE-101,1240.5\n"
    with pytest.raises(MissingColumnsError):
        parse_production_csv(csv)


def test_bad_date_is_rejected_not_fatal() -> None:
    csv = b"well_name,date,oil_rate\nLJE-101,not-a-date,100\nLJE-101,2022-02-01,90\n"
    result = parse_production_csv(csv)
    assert len(result.records) == 1
    assert len(result.rejected) == 1
    assert "invalid date" in result.rejected[0].reason


def test_negative_rate_is_rejected() -> None:
    csv = b"well_name,date,oil_rate\nLJE-101,2022-01-01,-5\n"
    result = parse_production_csv(csv)
    assert result.records == []
    assert "negative" in result.rejected[0].reason


def test_non_numeric_rate_is_rejected() -> None:
    csv = b"well_name,date,oil_rate\nLJE-101,2022-01-01,abc\n"
    result = parse_production_csv(csv)
    assert result.records == []
    assert "invalid oil_rate" in result.rejected[0].reason


def test_duplicate_well_date_keeps_last() -> None:
    csv = b"well_name,date,oil_rate\nLJE-101,2022-01-01,100\nLJE-101,2022-01-01,200\n"
    result = parse_production_csv(csv)
    assert len(result.records) == 1
    assert result.records[0].oil_rate == 200.0


def test_column_names_are_case_insensitive() -> None:
    csv = b"Well_Name,DATE,Oil_Rate\nLJE-101,2022-01-01,100\n"
    result = parse_production_csv(csv)
    assert len(result.records) == 1
