VALID_CSV = b"""well_name,date,oil_rate
LJE-101,2022-01-01,1240.5
LJE-101,2022-02-01,1102.8
LJE-102,2022-01-01,860.0
"""


def _upload(client, csv: bytes = VALID_CSV):
    return client.post(
        "/api/wells/upload",
        files={"file": ("data.csv", csv, "text/csv")},
        data={"oil_rate_unit": "bbl/d"},
    )


def test_upload_creates_wells_and_points(client) -> None:
    response = _upload(client)
    assert response.status_code == 200
    body = response.json()
    assert body["wells_new"] == 2
    assert body["wells_existing"] == 0
    assert body["points_loaded"] == 3
    assert body["rows_rejected"] == 0


def test_upload_missing_columns_returns_422(client) -> None:
    response = _upload(client, b"well_name,oil_rate\nLJE-101,100\n")
    assert response.status_code == 422


def test_reupload_upserts_existing_well(client) -> None:
    _upload(client)
    response = _upload(client)
    body = response.json()
    assert body["wells_new"] == 0
    assert body["wells_existing"] == 2


def test_list_wells_reports_aggregates(client) -> None:
    _upload(client)
    response = client.get("/api/wells")
    assert response.status_code == 200
    wells = {w["name"]: w for w in response.json()}
    assert wells["LJE-101"]["point_count"] == 2
    assert wells["LJE-101"]["last_oil_rate"] == 1102.8
    assert wells["LJE-101"]["forecast_count"] == 0


def test_get_production_series(client) -> None:
    _upload(client)
    well_id = client.get("/api/wells").json()[0]["id"]
    response = client.get(f"/api/wells/{well_id}/production")
    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_get_unknown_well_returns_404(client) -> None:
    assert client.get("/api/wells/999").status_code == 404


def test_delete_well(client) -> None:
    _upload(client)
    well_id = client.get("/api/wells").json()[0]["id"]
    assert client.delete(f"/api/wells/{well_id}").status_code == 204
    assert client.get(f"/api/wells/{well_id}").status_code == 404
