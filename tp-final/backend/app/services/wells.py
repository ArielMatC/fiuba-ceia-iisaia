"""Persistence and aggregation logic for wells and production data."""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Forecast, ProductionData, Well
from app.services.csv_loader import ParsedRecord


def ingest_records(
    db: Session, records: list[ParsedRecord], oil_rate_unit: str
) -> tuple[int, int, int]:
    """Upsert wells by name and production by (well_id, date).

    Returns (wells_new, wells_existing, points_loaded).
    """
    wells_by_name: dict[str, Well] = {}
    new_well_names: set[str] = set()
    points_loaded = 0

    for record in records:
        well = wells_by_name.get(record.well_name)
        if well is None:
            well = db.scalar(select(Well).where(Well.name == record.well_name))
            if well is None:
                well = Well(name=record.well_name, oil_rate_unit=oil_rate_unit)
                db.add(well)
                db.flush()
                new_well_names.add(record.well_name)
            wells_by_name[record.well_name] = well

        existing = db.scalar(
            select(ProductionData).where(
                ProductionData.well_id == well.id, ProductionData.date == record.date
            )
        )
        if existing is None:
            db.add(ProductionData(well_id=well.id, date=record.date, oil_rate=record.oil_rate))
        else:
            existing.oil_rate = record.oil_rate
        points_loaded += 1

    db.commit()
    wells_new = len(new_well_names)
    wells_existing = len(wells_by_name) - wells_new
    return wells_new, wells_existing, points_loaded


def list_well_summaries(db: Session) -> list[dict]:
    """Return wells with aggregate stats for the listing view."""
    wells = db.scalars(select(Well).order_by(Well.name)).all()
    summaries = []
    for well in wells:
        agg = db.execute(
            select(
                func.count(ProductionData.id),
                func.min(ProductionData.date),
                func.max(ProductionData.date),
            ).where(ProductionData.well_id == well.id)
        ).one()
        point_count, first_date, last_date = agg

        last_oil_rate = None
        if point_count:
            last_oil_rate = db.scalar(
                select(ProductionData.oil_rate)
                .where(ProductionData.well_id == well.id)
                .order_by(ProductionData.date.desc())
                .limit(1)
            )

        forecast_count = db.scalar(
            select(func.count(Forecast.id)).where(Forecast.well_id == well.id)
        )

        summaries.append(
            {
                "id": well.id,
                "name": well.name,
                "field": well.field,
                "operator": well.operator,
                "oil_rate_unit": well.oil_rate_unit,
                "created_at": well.created_at,
                "point_count": point_count,
                "first_date": first_date,
                "last_date": last_date,
                "last_oil_rate": last_oil_rate,
                "forecast_count": forecast_count,
            }
        )
    return summaries


def get_well(db: Session, well_id: int) -> Well | None:
    return db.get(Well, well_id)


def get_production(db: Session, well_id: int) -> list[ProductionData]:
    return list(
        db.scalars(
            select(ProductionData)
            .where(ProductionData.well_id == well_id)
            .order_by(ProductionData.date)
        ).all()
    )


def delete_well(db: Session, well: Well) -> None:
    db.delete(well)
    db.commit()
