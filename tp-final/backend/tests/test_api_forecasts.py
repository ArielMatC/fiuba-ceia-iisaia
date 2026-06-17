from datetime import date

import numpy as np

from app.models import ForecastData

DATES = [f"2022-{m:02d}-01" for m in range(1, 13)] + [f"2023-{m:02d}-01" for m in range(1, 13)]


def _decline_csv() -> bytes:
    rows = ["well_name,date,oil_rate"]
    for i, d in enumerate(DATES):
        rate = 1000.0 * np.exp(-0.08 * i)
        rows.append(f"DECL-1,{d},{rate:.3f}")
    return ("\n".join(rows) + "\n").encode()


def _seed_well(client) -> int:
    client.post(
        "/api/wells/upload",
        files={"file": ("data.csv", _decline_csv(), "text/csv")},
        data={"oil_rate_unit": "bbl/d"},
    )
    return client.get("/api/wells").json()[0]["id"]


def test_create_forecast_returns_points_and_metrics(client) -> None:
    well_id = _seed_well(client)
    response = client.post(
        f"/api/wells/{well_id}/forecast",
        json={"model_type": "exponential", "horizon_months": 36},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["model_type"] == "exponential"
    assert body["r_squared"] > 0.99
    assert body["eur"] > 0
    assert len(body["points"]) > 36


def test_economic_cutoff_caps_points_and_eur(client) -> None:
    well_id = _seed_well(client)
    uncapped = client.post(
        f"/api/wells/{well_id}/forecast",
        json={"model_type": "exponential", "horizon_months": 36},
    ).json()
    capped = client.post(
        f"/api/wells/{well_id}/forecast",
        json={"model_type": "exponential", "horizon_months": 36, "economic_cutoff": 500},
    ).json()

    assert capped["economic_cutoff"] == 500
    assert capped["eur"] < uncapped["eur"]
    assert len(capped["points"]) < len(uncapped["points"])
    assert all(point["predicted_rate"] >= 500 for point in capped["points"])


def test_economic_cutoff_above_initial_rate_returns_no_points(client) -> None:
    well_id = _seed_well(client)
    response = client.post(
        f"/api/wells/{well_id}/forecast",
        json={"model_type": "exponential", "horizon_months": 36, "economic_cutoff": 2000},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["eur"] == 0
    assert body["points"] == []


def test_get_forecast_filters_persisted_points_below_cutoff(client, db_session) -> None:
    well_id = _seed_well(client)
    created = client.post(
        f"/api/wells/{well_id}/forecast",
        json={"model_type": "exponential", "horizon_months": 36, "economic_cutoff": 500},
    ).json()
    db_session.add(
        ForecastData(
            forecast_id=created["id"],
            date=date(2099, 1, 1),
            predicted_rate=1.0,
        )
    )
    db_session.commit()

    detail = client.get(f"/api/forecasts/{created['id']}").json()

    assert all(point["predicted_rate"] >= 500 for point in detail["points"])
    assert all(point["date"] != "2099-01-01" for point in detail["points"])


def test_forecast_unknown_well_404(client) -> None:
    response = client.post("/api/wells/999/forecast", json={"model_type": "exponential"})
    assert response.status_code == 404


def test_forecast_invalid_model_type_422(client) -> None:
    well_id = _seed_well(client)
    response = client.post(f"/api/wells/{well_id}/forecast", json={"model_type": "linear"})
    assert response.status_code == 422


def test_list_and_get_forecast(client) -> None:
    well_id = _seed_well(client)
    created = client.post(
        f"/api/wells/{well_id}/forecast", json={"model_type": "exponential"}
    ).json()

    listing = client.get(f"/api/wells/{well_id}/forecasts")
    assert listing.status_code == 200
    assert len(listing.json()) == 1

    detail = client.get(f"/api/forecasts/{created['id']}")
    assert detail.status_code == 200
    assert detail.json()["id"] == created["id"]


def test_delete_forecast(client) -> None:
    well_id = _seed_well(client)
    fid = client.post(f"/api/wells/{well_id}/forecast", json={"model_type": "exponential"}).json()[
        "id"
    ]
    assert client.delete(f"/api/forecasts/{fid}").status_code == 204
    assert client.get(f"/api/forecasts/{fid}").status_code == 404


def test_forecast_count_reflected_in_well_listing(client) -> None:
    well_id = _seed_well(client)
    client.post(f"/api/wells/{well_id}/forecast", json={"model_type": "exponential"})
    well = next(w for w in client.get("/api/wells").json() if w["id"] == well_id)
    assert well["forecast_count"] == 1
