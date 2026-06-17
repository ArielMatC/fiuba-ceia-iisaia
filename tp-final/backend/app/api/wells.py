from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas import ProductionPoint, UploadSummary, WellDetail, WellSummary
from app.services import wells as well_service
from app.services.csv_loader import MissingColumnsError, parse_production_csv

router = APIRouter(prefix="/api/wells", tags=["wells"])


@router.post("/upload", response_model=UploadSummary)
async def upload_wells(
    file: UploadFile = File(...),
    oil_rate_unit: str = Form("bbl/d"),
    db: Session = Depends(get_db),
) -> UploadSummary:
    raw = await file.read()
    try:
        result = parse_production_csv(raw)
    except MissingColumnsError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    wells_new, wells_existing, points_loaded = well_service.ingest_records(
        db, result.records, oil_rate_unit
    )
    return UploadSummary(
        wells_new=wells_new,
        wells_existing=wells_existing,
        points_loaded=points_loaded,
        rows_rejected=len(result.rejected),
        rejected=[{"line": r.line, "reason": r.reason} for r in result.rejected],
    )


@router.get("", response_model=list[WellSummary])
def list_wells(db: Session = Depends(get_db)) -> list[dict]:
    return well_service.list_well_summaries(db)


@router.get("/{well_id}", response_model=WellDetail)
def get_well(well_id: int, db: Session = Depends(get_db)) -> WellDetail:
    well = well_service.get_well(db, well_id)
    if well is None:
        raise HTTPException(status_code=404, detail="Well not found")
    return WellDetail.model_validate(well)


@router.get("/{well_id}/production", response_model=list[ProductionPoint])
def get_production(well_id: int, db: Session = Depends(get_db)) -> list[ProductionPoint]:
    if well_service.get_well(db, well_id) is None:
        raise HTTPException(status_code=404, detail="Well not found")
    return [ProductionPoint.model_validate(p) for p in well_service.get_production(db, well_id)]


@router.delete("/{well_id}", status_code=204)
def delete_well(well_id: int, db: Session = Depends(get_db)) -> None:
    well = well_service.get_well(db, well_id)
    if well is None:
        raise HTTPException(status_code=404, detail="Well not found")
    well_service.delete_well(db, well)
