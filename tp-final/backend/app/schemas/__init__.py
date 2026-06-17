from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class ProductionPoint(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    date: date
    oil_rate: float


class WellSummary(BaseModel):
    """Well plus aggregate stats for the listing view."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    field: str | None
    operator: str | None
    oil_rate_unit: str
    created_at: datetime
    point_count: int
    first_date: date | None
    last_date: date | None
    last_oil_rate: float | None
    forecast_count: int


class WellDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    field: str | None
    operator: str | None
    oil_rate_unit: str
    created_at: datetime


class RejectedRow(BaseModel):
    line: int
    reason: str


class UploadSummary(BaseModel):
    wells_new: int
    wells_existing: int
    points_loaded: int
    rows_rejected: int
    rejected: list[RejectedRow]


class ForecastPoint(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    date: date
    predicted_rate: float


class ForecastSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    well_id: int
    model_type: str
    params_json: dict
    r_squared: float
    horizon_months: int
    economic_cutoff: float | None
    eur: float
    created_at: datetime


class ForecastDetail(ForecastSummary):
    points: list[ForecastPoint]


class ForecastRequest(BaseModel):
    model_type: str = "hyperbolic"
    horizon_months: int = 60
    economic_cutoff: float | None = None
