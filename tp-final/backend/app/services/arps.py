"""Arps decline-curve fitting, prediction and EUR.

Time ``t`` is expressed in months since the first production point (float).
Rates are in the well's declared unit per day (bbl/d or m3/d). EUR converts the
rate-vs-months integral to a volume by multiplying by the average days per month.
"""

from dataclasses import dataclass

import numpy as np
from scipy.optimize import curve_fit

DAYS_PER_MONTH = 365.25 / 12.0

EXPONENTIAL = "exponential"
HYPERBOLIC = "hyperbolic"
HARMONIC = "harmonic"
MODEL_TYPES = (EXPONENTIAL, HYPERBOLIC, HARMONIC)


@dataclass
class FitResult:
    model_type: str
    params: dict  # always {"qi": ..., "Di": ..., "b": ...}
    r_squared: float
    fell_back: bool = False


class FitError(ValueError):
    """Raised when no Arps variant can be fit to the given data."""


def _q_exponential(t: np.ndarray, qi: float, di: float) -> np.ndarray:
    return qi * np.exp(-di * t)


def _q_harmonic(t: np.ndarray, qi: float, di: float) -> np.ndarray:
    return qi / (1.0 + di * t)


def _q_hyperbolic(t: np.ndarray, qi: float, di: float, b: float) -> np.ndarray:
    return qi / np.power(1.0 + b * di * t, 1.0 / b)


def predict_rate(params: dict, t: np.ndarray) -> np.ndarray:
    """Evaluate the rate at the given month offsets for a fitted model."""
    qi, di, b = params["qi"], params["Di"], params["b"]
    if b <= 0:
        return _q_exponential(t, qi, di)
    if b >= 1:
        return _q_harmonic(t, qi, di)
    return _q_hyperbolic(t, qi, di, b)


def _initial_guess(t: np.ndarray, q: np.ndarray) -> tuple[float, float]:
    qi0 = float(q[0]) if q[0] > 0 else float(np.max(q))
    # Di from the log-linear slope of the history (clamped to a small positive).
    positive = q > 0
    if positive.sum() >= 2:
        slope = np.polyfit(t[positive], np.log(q[positive]), 1)[0]
        di0 = float(max(-slope, 1e-4))
    else:
        di0 = 0.05
    return qi0, di0


def _r_squared(q: np.ndarray, predicted: np.ndarray) -> float:
    ss_res = float(np.sum((q - predicted) ** 2))
    ss_tot = float(np.sum((q - np.mean(q)) ** 2))
    if ss_tot == 0:
        return 1.0 if ss_res == 0 else 0.0
    return 1.0 - ss_res / ss_tot


def fit(t: np.ndarray, q: np.ndarray, model_type: str) -> FitResult:
    """Fit one Arps variant. Hyperbolic falls back to exponential if it fails."""
    t = np.asarray(t, dtype=float)
    q = np.asarray(q, dtype=float)
    if t.size < 2:
        raise FitError("at least two production points are required to fit")

    qi0, di0 = _initial_guess(t, q)

    if model_type == EXPONENTIAL:
        return _fit_two_param(t, q, _q_exponential, qi0, di0, b=0.0, model_type=EXPONENTIAL)
    if model_type == HARMONIC:
        return _fit_two_param(t, q, _q_harmonic, qi0, di0, b=1.0, model_type=HARMONIC)
    if model_type == HYPERBOLIC:
        try:
            popt, _ = curve_fit(
                _q_hyperbolic,
                t,
                q,
                p0=[qi0, di0, 0.5],
                bounds=([0.0, 0.0, 1e-6], [np.inf, np.inf, 1.0]),
                maxfev=10000,
            )
            params = {"qi": float(popt[0]), "Di": float(popt[1]), "b": float(popt[2])}
            r2 = _r_squared(q, predict_rate(params, t))
            return FitResult(HYPERBOLIC, params, r2)
        except (RuntimeError, ValueError):
            fallback = _fit_two_param(t, q, _q_exponential, qi0, di0, b=0.0, model_type=EXPONENTIAL)
            fallback.fell_back = True
            return fallback

    raise FitError(f"unknown model_type: {model_type!r}")


def _fit_two_param(t, q, func, qi0, di0, b, model_type) -> FitResult:
    try:
        popt, _ = curve_fit(
            func, t, q, p0=[qi0, di0], bounds=([0.0, 0.0], [np.inf, np.inf]), maxfev=10000
        )
    except (RuntimeError, ValueError) as exc:
        raise FitError(f"could not fit {model_type}: {exc}") from exc
    params = {"qi": float(popt[0]), "Di": float(popt[1]), "b": float(b)}
    r2 = _r_squared(q, predict_rate(params, t))
    return FitResult(model_type, params, r2)


def _cumulative_months(params: dict, t: float) -> float:
    """Analytic cumulative of q over [0, t] (months), in rate-unit x months."""
    qi, di, b = params["qi"], params["Di"], params["b"]
    if di == 0:
        return qi * t
    if b <= 0:
        return qi / di * (1.0 - np.exp(-di * t))
    if b >= 1:
        return qi / di * np.log(1.0 + di * t)
    exponent = (b - 1.0) / b
    return qi / (di * (1.0 - b)) * (1.0 - np.power(1.0 + b * di * t, exponent))


def eur(params: dict, limit_months: int, economic_cutoff: float | None = None) -> float:
    """Estimated Ultimate Recovery as a volume (rate-unit x days).

    Integrates the fitted rate from t=0 to the cutoff time (where the rate hits
    ``economic_cutoff``) or the month limit, whichever comes first.
    """
    t_end = float(limit_months)
    if economic_cutoff is not None and economic_cutoff > 0:
        t_cutoff = time_at_rate(params, economic_cutoff)
        if t_cutoff is not None:
            t_end = min(t_end, t_cutoff)
    return _cumulative_months(params, t_end) * DAYS_PER_MONTH


def time_at_rate(params: dict, rate: float) -> float | None:
    """Months until the rate decays to ``rate``; None if it never reaches it."""
    qi, di, b = params["qi"], params["Di"], params["b"]
    if rate >= qi or di == 0:
        return 0.0 if rate >= qi else None
    if b <= 0:
        return float(np.log(qi / rate) / di)
    if b >= 1:
        return float((qi / rate - 1.0) / di)
    return float((np.power(qi / rate, b) - 1.0) / (b * di))
