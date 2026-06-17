from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas import ForecastDetail, ForecastRequest, ForecastSummary
from app.services import forecast as forecast_service
from app.services import wells as well_service
from app.services.arps import MODEL_TYPES, FitError
from app.services.forecast import NotEnoughDataError

router = APIRouter(prefix="/api", tags=["forecasts"])


def _forecast_detail(forecast) -> ForecastDetail:
    detail = ForecastDetail.model_validate(forecast)
    if detail.economic_cutoff is not None and detail.economic_cutoff > 0:
        detail.points = [
            point for point in detail.points if point.predicted_rate >= detail.economic_cutoff
        ]
    return detail


@router.post("/wells/{well_id}/forecast", response_model=ForecastDetail, status_code=201)
def create_forecast(
    well_id: int, request: ForecastRequest, db: Session = Depends(get_db)
) -> ForecastDetail:
    if well_service.get_well(db, well_id) is None:
        raise HTTPException(status_code=404, detail="Well not found")
    if request.model_type not in MODEL_TYPES:
        raise HTTPException(
            status_code=422,
            detail=f"model_type must be one of {', '.join(MODEL_TYPES)}",
        )
    try:
        forecast = forecast_service.run_forecast(
            db,
            well_id,
            request.model_type,
            request.horizon_months,
            request.economic_cutoff,
        )
    except (NotEnoughDataError, FitError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return _forecast_detail(forecast)


@router.get("/wells/{well_id}/forecasts", response_model=list[ForecastSummary])
def list_forecasts(well_id: int, db: Session = Depends(get_db)) -> list[ForecastSummary]:
    if well_service.get_well(db, well_id) is None:
        raise HTTPException(status_code=404, detail="Well not found")
    return [ForecastSummary.model_validate(f) for f in forecast_service.list_forecasts(db, well_id)]


@router.get("/forecasts/{forecast_id}", response_model=ForecastDetail)
def get_forecast(forecast_id: int, db: Session = Depends(get_db)) -> ForecastDetail:
    forecast = forecast_service.get_forecast(db, forecast_id)
    if forecast is None:
        raise HTTPException(status_code=404, detail="Forecast not found")
    return _forecast_detail(forecast)


@router.delete("/forecasts/{forecast_id}", status_code=204)
def delete_forecast(forecast_id: int, db: Session = Depends(get_db)) -> None:
    forecast = forecast_service.get_forecast(db, forecast_id)
    if forecast is None:
        raise HTTPException(status_code=404, detail="Forecast not found")
    forecast_service.delete_forecast(db, forecast)
