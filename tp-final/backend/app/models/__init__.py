from datetime import date as DateType
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.types import JSON


class Base(DeclarativeBase):
    pass


class Well(Base):
    __tablename__ = "wells"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    field: Mapped[str | None] = mapped_column(String, default=None)
    operator: Mapped[str | None] = mapped_column(String, default=None)
    oil_rate_unit: Mapped[str] = mapped_column(String, default="bbl/d")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    production: Mapped[list["ProductionData"]] = relationship(
        back_populates="well", cascade="all, delete-orphan"
    )
    forecasts: Mapped[list["Forecast"]] = relationship(
        back_populates="well", cascade="all, delete-orphan"
    )


class ProductionData(Base):
    __tablename__ = "production_data"
    __table_args__ = (UniqueConstraint("well_id", "date", name="uq_production_well_date"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    well_id: Mapped[int] = mapped_column(ForeignKey("wells.id", ondelete="CASCADE"), index=True)
    date: Mapped[DateType] = mapped_column()
    oil_rate: Mapped[float] = mapped_column()

    well: Mapped["Well"] = relationship(back_populates="production")


class Forecast(Base):
    __tablename__ = "forecasts"

    id: Mapped[int] = mapped_column(primary_key=True)
    well_id: Mapped[int] = mapped_column(ForeignKey("wells.id", ondelete="CASCADE"), index=True)
    model_type: Mapped[str] = mapped_column(String)
    params_json: Mapped[dict] = mapped_column(JSON)
    r_squared: Mapped[float] = mapped_column()
    horizon_months: Mapped[int] = mapped_column()
    economic_cutoff: Mapped[float | None] = mapped_column(default=None)
    eur: Mapped[float] = mapped_column()
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    well: Mapped["Well"] = relationship(back_populates="forecasts")
    points: Mapped[list["ForecastData"]] = relationship(
        back_populates="forecast", cascade="all, delete-orphan"
    )


class ForecastData(Base):
    __tablename__ = "forecast_data"

    id: Mapped[int] = mapped_column(primary_key=True)
    forecast_id: Mapped[int] = mapped_column(
        ForeignKey("forecasts.id", ondelete="CASCADE"), index=True
    )
    date: Mapped[DateType] = mapped_column()
    predicted_rate: Mapped[float] = mapped_column()

    forecast: Mapped["Forecast"] = relationship(back_populates="points")
