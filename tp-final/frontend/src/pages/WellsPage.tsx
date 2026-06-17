import { Link } from 'react-router-dom'

import { useDeleteWell, useWells } from '../api/hooks'

function OilWellIcon() {
  return (
    <svg
      viewBox="0 0 576 512"
      fill="currentColor"
      className="h-5 w-5 shrink-0 text-fuji"
      aria-hidden="true"
    >
      {/* Font Awesome Free "oil-well" icon, CC BY 4.0. */}
      <path d="M528.3 61.3c-11.4-42.7-55.3-68-98-56.6L414.9 8.8C397.8 13.4 387.7 31 392.3 48l24.5 91.4L308.5 167.5l-6.3-18.1C297.7 136.6 285.6 128 272 128s-25.7 8.6-30.2 21.4l-13.6 39L96 222.6 96 184c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 264-16 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l512 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-137.3 0L340 257.5l-62.2 16.1L305.3 352l-66.6 0L265 277l-74.6 19.3L137.3 448 96 448l0-159.2 337.4-87.5 25.2 94c4.6 17.1 22.1 27.2 39.2 22.6l15.5-4.1c42.7-11.4 68-55.3 56.6-98L528.3 61.3zM205.1 448l11.2-32 111.4 0 11.2 32-133.8 0z" />
    </svg>
  )
}

function WellsPage() {
  const { data: wells, isLoading, isError, error } = useWells()
  const deleteWell = useDeleteWell()

  if (isLoading) return <p className="text-muted">Loading wells…</p>
  if (isError) return <p className="text-crimson">{(error as Error).message}</p>

  if (!wells || wells.length === 0) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">Wells</h1>
        <p className="text-muted">
          No wells yet.{' '}
          <Link to="/upload" className="text-wave underline">
            Upload a CSV
          </Link>{' '}
          to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Wells</h1>
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-elev text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Points</th>
              <th className="px-4 py-3">Range</th>
              <th className="px-4 py-3">Last rate</th>
              <th className="px-4 py-3">Forecasts</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {wells.map((well) => (
              <tr key={well.id} className="border-t border-line/60 hover:bg-ink-elev/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <OilWellIcon />
                    <Link
                      to={`/wells/${well.id}`}
                      className="font-medium text-wave hover:underline"
                    >
                      {well.name}
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-3">{well.point_count}</td>
                <td className="px-4 py-3 text-muted">
                  {well.first_date ?? '—'} → {well.last_date ?? '—'}
                </td>
                <td className="px-4 py-3">
                  {well.last_oil_rate != null ? well.last_oil_rate.toFixed(1) : '—'}{' '}
                  <span className="text-muted">{well.oil_rate_unit}</span>
                </td>
                <td className="px-4 py-3">{well.forecast_count}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete well ${well.name}?`)) deleteWell.mutate(well.id)
                    }}
                    className="text-xs text-crimson hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default WellsPage
