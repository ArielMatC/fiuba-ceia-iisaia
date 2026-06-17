import numpy as np
import pytest

from app.services import arps
from app.services.arps import DAYS_PER_MONTH, FitError

T = np.arange(0, 36, dtype=float)


def test_recovers_exponential_params() -> None:
    q = 1000.0 * np.exp(-0.08 * T)
    result = arps.fit(T, q, arps.EXPONENTIAL)
    assert result.params["qi"] == pytest.approx(1000.0, rel=1e-3)
    assert result.params["Di"] == pytest.approx(0.08, rel=1e-3)
    assert result.params["b"] == 0.0
    assert result.r_squared > 0.999


def test_recovers_harmonic_params() -> None:
    q = 1000.0 / (1.0 + 0.08 * T)
    result = arps.fit(T, q, arps.HARMONIC)
    assert result.params["qi"] == pytest.approx(1000.0, rel=1e-3)
    assert result.params["Di"] == pytest.approx(0.08, rel=1e-3)
    assert result.params["b"] == 1.0


def test_recovers_hyperbolic_params() -> None:
    q = 1000.0 / np.power(1.0 + 0.5 * 0.08 * T, 1.0 / 0.5)
    result = arps.fit(T, q, arps.HYPERBOLIC)
    assert result.params["qi"] == pytest.approx(1000.0, rel=1e-2)
    assert result.params["Di"] == pytest.approx(0.08, rel=1e-2)
    assert result.params["b"] == pytest.approx(0.5, rel=5e-2)
    assert not result.fell_back


def test_exponential_eur_matches_closed_form() -> None:
    params = {"qi": 1000.0, "Di": 0.08, "b": 0.0}
    horizon = 60
    expected = 1000.0 / 0.08 * (1.0 - np.exp(-0.08 * horizon)) * DAYS_PER_MONTH
    assert arps.eur(params, horizon) == pytest.approx(expected, rel=1e-9)


def test_eur_respects_economic_cutoff() -> None:
    params = {"qi": 1000.0, "Di": 0.08, "b": 0.0}
    # Cutoff above qi -> zero producing time -> zero EUR.
    assert arps.eur(params, 60, economic_cutoff=2000.0) == pytest.approx(0.0)
    # A cutoff below qi caps the integration earlier than the full horizon.
    capped = arps.eur(params, 600, economic_cutoff=50.0)
    full = arps.eur(params, 600, economic_cutoff=None)
    assert capped < full


def test_hyperbolic_and_harmonic_eur_are_positive_and_cutoff_aware() -> None:
    for b in (0.5, 1.0):
        params = {"qi": 1000.0, "Di": 0.08, "b": b}
        full = arps.eur(params, 120, economic_cutoff=None)
        capped = arps.eur(params, 120, economic_cutoff=100.0)
        assert full > 0
        assert capped < full


def test_predict_rate_dispatches_by_b() -> None:
    t = np.array([0.0, 10.0])
    assert arps.predict_rate({"qi": 100.0, "Di": 0.1, "b": 0.0}, t)[0] == 100.0
    assert arps.predict_rate({"qi": 100.0, "Di": 0.1, "b": 1.0}, t)[1] > 0
    assert arps.predict_rate({"qi": 100.0, "Di": 0.1, "b": 0.5}, t)[1] > 0


def test_fit_requires_two_points() -> None:
    with pytest.raises(FitError):
        arps.fit(np.array([0.0]), np.array([100.0]), arps.EXPONENTIAL)


def test_hyperbolic_falls_back_on_noise_free_flat_data() -> None:
    # Degenerate flat series can defeat the hyperbolic solver; fallback must hold.
    q = np.full_like(T, 500.0)
    result = arps.fit(T, q, arps.HYPERBOLIC)
    assert result.params["qi"] == pytest.approx(500.0, rel=1e-2)
