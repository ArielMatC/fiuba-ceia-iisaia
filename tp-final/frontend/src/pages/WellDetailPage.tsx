import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import {
  useCreateForecast,
  useDeleteForecast,
  useForecastDetails,
  useForecasts,
  useProduction,
  useWell,
} from '../api/hooks'
import type { ForecastDetail, ForecastSummary, ModelType } from '../api/types'
import ProductionChart from '../components/ProductionChart'

const MODELS: ModelType[] = ['exponential', 'hyperbolic', 'harmonic']

function downloadForecastCsv(forecast: ForecastDetail, wellName: string) {
  const header = 'date,predicted_rate\n'
  const rows = forecast.points.map((p) => `${p.date},${p.predicted_rate}`).join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${wellName}-forecast-${forecast.id}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function volumeUnit(rateUnit: string) {
  if (rateUnit === 'bbl/d') return 'bbl'
  if (rateUnit === 'm3/d' || rateUnit === 'm³/d') return 'm³'
  return rateUnit.replace(/\/d$/, '')
}

function formatRate(value: number | null, unit: string) {
  if (value === null) return '—'
  return `${value.toLocaleString()} ${unit}`
}

function formatVolume(value: number, unit: string) {
  return `${Math.round(value).toLocaleString()} ${volumeUnit(unit)}`
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        checked ? 'bg-wave' : 'bg-line'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-fuji transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="m6 6 1 14h10l1-14" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}

function ForecastDeleteToast({
  forecast,
  isDeleting,
  error,
  onCancel,
  onDelete,
}: {
  forecast: ForecastSummary
  isDeleting: boolean
  error?: string
  onCancel: () => void
  onDelete: () => void
}) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed right-6 bottom-6 z-50 w-[min(24rem,calc(100vw-3rem))] rounded-lg border border-line bg-ink-deep p-4 shadow-2xl shadow-black/40"
    >
      <div className="flex gap-3">
        <div className="mt-0.5 rounded-full bg-crimson/15 p-2 text-crimson">
          <TrashIcon />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-fuji">Delete forecast?</p>
          <p className="mt-1 text-sm text-oldwhite">
            {forecast.model_type} forecast #{forecast.id} will be removed from this well.
          </p>
          {error && <p className="mt-2 text-xs text-crimson">{error}</p>}
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="rounded border border-line px-3 py-1.5 text-sm text-oldwhite hover:bg-ink-elev disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="rounded bg-crimson px-3 py-1.5 text-sm font-medium text-fuji hover:bg-crimson-bright disabled:opacity-40"
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function WellDetailPage() {
  const { wellId } = useParams()
  const id = Number(wellId)

  const well = useWell(id)
  const production = useProduction(id)
  const forecasts = useForecasts(id)
  const createForecast = useCreateForecast(id)
  const deleteForecast = useDeleteForecast(id)

  const [selectedForecastIds, setSelectedForecastIds] = useState<number[]>([])
  const selectedForecastQueries = useForecastDetails(selectedForecastIds)
  const selectedForecasts = selectedForecastQueries
    .map((query) => query.data)
    .filter((forecast): forecast is ForecastDetail => forecast !== undefined)
  const selectedForecastById = useMemo(
    () => new Map(selectedForecasts.map((forecast) => [forecast.id, forecast])),
    [selectedForecasts],
  )

  const [model, setModel] = useState<ModelType>('hyperbolic')
  const [horizon, setHorizon] = useState(60)
  const [cutoff, setCutoff] = useState('')
  const [logY, setLogY] = useState(false)
  const [forecastToDelete, setForecastToDelete] = useState<ForecastSummary | null>(null)
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!deleteNotice) return
    const timeout = window.setTimeout(() => setDeleteNotice(null), 3000)
    return () => window.clearTimeout(timeout)
  }, [deleteNotice])

  const onGenerate = () => {
    createForecast.mutate(
      {
        model_type: model,
        horizon_months: horizon,
        economic_cutoff: cutoff ? Number(cutoff) : null,
      },
      {
        onSuccess: (created) =>
          setSelectedForecastIds((current) =>
            current.includes(created.id) ? current : [...current, created.id],
          ),
      },
    )
  }

  const setForecastVisible = (forecastId: number, visible: boolean) => {
    setSelectedForecastIds((current) => {
      if (visible) return current.includes(forecastId) ? current : [...current, forecastId]
      return current.filter((id) => id !== forecastId)
    })
  }

  if (well.isLoading) return <p className="text-muted">Loading…</p>
  if (well.isError) return <p className="text-crimson">{(well.error as Error).message}</p>

  const unit = well.data?.oil_rate_unit ?? 'bbl/d'

  return (
    <div className="space-y-6">
      <div>
        <Link to="/wells" className="text-sm text-muted hover:underline">
          ← Wells
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">{well.data?.name}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-line bg-ink-elev/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-sand">Production &amp; forecast</h2>
            <label className="flex items-center gap-2 text-xs text-oldwhite">
              <input type="checkbox" checked={logY} onChange={(e) => setLogY(e.target.checked)} />
              Log Y
            </label>
          </div>
          <ProductionChart
            production={production.data ?? []}
            forecasts={selectedForecasts}
            logY={logY}
            unit={unit}
          />
        </div>

        <div className="space-y-4 rounded-lg border border-line bg-ink-elev/40 p-4">
          <h2 className="font-semibold text-sand">Generate forecast</h2>
          <label className="block text-sm">
            Model
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as ModelType)}
              className="mt-1 w-full rounded border border-line bg-ink px-2 py-1"
            >
              {MODELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Horizon (months)
            <input
              type="number"
              min={1}
              value={horizon}
              onChange={(e) => setHorizon(Number(e.target.value))}
              className="mt-1 w-full rounded border border-line bg-ink px-2 py-1"
            />
          </label>
          <label className="block text-sm">
            Economic cutoff ({unit}, optional)
            <input
              type="number"
              min={0}
              value={cutoff}
              onChange={(e) => setCutoff(e.target.value)}
              className="mt-1 w-full rounded border border-line bg-ink px-2 py-1"
            />
          </label>
          <button
            type="button"
            onClick={onGenerate}
            disabled={createForecast.isPending}
            className="w-full rounded bg-wave px-4 py-2 text-sm font-medium text-ink hover:bg-wave-bright disabled:opacity-40"
          >
            {createForecast.isPending ? 'Fitting…' : 'Generate forecast'}
          </button>
          {createForecast.isError && (
            <p className="text-xs text-crimson">{createForecast.error.message}</p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-line">
        <h2 className="border-b border-line px-4 py-3 font-semibold text-sand">Forecasts</h2>
        {forecasts.data && forecasts.data.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="px-4 py-2">Model</th>
                <th className="px-4 py-2">R²</th>
                <th className="px-4 py-2">Horizon</th>
                <th className="px-4 py-2">Cutoff</th>
                <th className="px-4 py-2">EUR</th>
                <th className="px-4 py-2">View</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {forecasts.data.map((f) => (
                <tr
                  key={f.id}
                  className={`border-t border-line/60 ${
                    selectedForecastIds.includes(f.id) ? 'bg-ink-elev' : ''
                  }`}
                >
                  <td className="px-4 py-2">{f.model_type}</td>
                  <td className="px-4 py-2">{f.r_squared.toFixed(4)}</td>
                  <td className="px-4 py-2">{f.horizon_months} mo</td>
                  <td className="px-4 py-2">{formatRate(f.economic_cutoff, unit)}</td>
                  <td className="px-4 py-2">{formatVolume(f.eur, unit)}</td>
                  <td className="px-4 py-2">
                    <ToggleSwitch
                      checked={selectedForecastIds.includes(f.id)}
                      onChange={(on) => setForecastVisible(f.id, on)}
                      label={`View ${f.model_type} forecast`}
                    />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const forecast = selectedForecastById.get(f.id)
                          if (forecast) downloadForecastCsv(forecast, well.data?.name ?? 'well')
                        }}
                        disabled={!selectedForecastById.has(f.id)}
                        title="Download CSV"
                        aria-label="Download CSV"
                        className="text-oldwhite hover:text-fuji disabled:opacity-30"
                      >
                        <DownloadIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          deleteForecast.reset()
                          setForecastToDelete(f)
                        }}
                        title="Delete forecast"
                        aria-label="Delete forecast"
                        className="text-crimson hover:text-crimson-bright"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-4 py-3 text-sm text-muted">No forecasts yet.</p>
        )}
      </div>

      {forecastToDelete && (
        <ForecastDeleteToast
          forecast={forecastToDelete}
          isDeleting={deleteForecast.isPending}
          error={deleteForecast.isError ? deleteForecast.error.message : undefined}
          onCancel={() => {
            deleteForecast.reset()
            setForecastToDelete(null)
          }}
          onDelete={() => {
            const forecastId = forecastToDelete.id
            deleteForecast.mutate(forecastId, {
              onSuccess: () => {
                setForecastVisible(forecastId, false)
                setForecastToDelete(null)
                setDeleteNotice('Forecast deleted')
              },
            })
          }}
        />
      )}

      {deleteNotice && !forecastToDelete && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-6 bottom-6 z-50 rounded-lg border border-line bg-ink-deep px-4 py-3 text-sm text-fuji shadow-2xl shadow-black/40"
        >
          {deleteNotice}
        </div>
      )}
    </div>
  )
}

export default WellDetailPage
