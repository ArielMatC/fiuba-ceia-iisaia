"""Orchestrates fitting an Arps model to a well and persisting the forecast."""

from datetime import date

import numpy as np
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Forecast, ForecastData, ProductionData
from app.services import arps
from app.services.arps import DAYS_PER_MONTH, FitError


class NotEnoughDataError(ValueError):
    """Raised when a well has too few points to fit a decline curve."""


def _add_months(start: date, months: int) -> date:
    month_index = start.month - 1 + months
    year = start.year + month_index // 12
    month = month_index % 12 + 1
    # Clamp day to 1 — production series are modelled at month granularity.
    return date(year, month, 1)


def _months_since(first: date, current: date) -> float:
    return (current - first).days / DAYS_PER_MONTH


def run_forecast(
    db: Session,
    well_id: int,
    model_type: str,
    horizon_months: int,
    economic_cutoff: float | None,
) -> Forecast:
    points = list(
        db.scalars(
            select(ProductionData)
            .where(ProductionData.well_id == well_id)
            .order_by(ProductionData.date)
        ).all()
    )
    if len(points) < 2:
        raise NotEnoughDataError("at least two production points are required")

    first_date = points[0].date
    last_date = points[-1].date
    t = np.array([_months_since(first_date, p.date) for p in points])
    q = np.array([p.oil_rate for p in points])

    result = arps.fit(t, q, model_type)
    last_month_offset = int(round(_months_since(first_date, last_date)))
    total_months = last_month_offset + horizon_months
    eur_value = arps.eur(result.params, total_months, economic_cutoff)

    forecast = Forecast(
        well_id=well_id,
        model_type=result.model_type,
        params_json=result.params,
        r_squared=result.r_squared,
        horizon_months=horizon_months,
        economic_cutoff=economic_cutoff,
        eur=eur_value,
    )
    db.add(forecast)
    db.flush()

    # Forecast series: monthly points from the first historical date through
    # horizon_months beyond the last point. Economic cutoff is applied directly
    # to each predicted rate, so no persisted point falls below the cutoff.
    for k in range(total_months + 1):
        point_date = _add_months(first_date, k)
        rate = float(arps.predict_rate(result.params, np.array([float(k)]))[0])
        if economic_cutoff is not None and economic_cutoff > 0 and rate < economic_cutoff:
            break
        db.add(ForecastData(forecast_id=forecast.id, date=point_date, predicted_rate=rate))

    db.commit()
    db.refresh(forecast)
    return forecast


def list_forecasts(db: Session, well_id: int) -> list[Forecast]:
    return list(
        db.scalars(
            select(Forecast).where(Forecast.well_id == well_id).order_by(Forecast.created_at.desc())
        ).all()
    )


def get_forecast(db: Session, forecast_id: int) -> Forecast | None:
    return db.get(Forecast, forecast_id)


def delete_forecast(db: Session, forecast: Forecast) -> None:
    db.delete(forecast)
    db.commit()


__all__ = [
    "FitError",
    "NotEnoughDataError",
    "run_forecast",
    "list_forecasts",
    "get_forecast",
    "delete_forecast",
]
