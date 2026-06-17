import { useMemo } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { ForecastDetail, ProductionPoint } from '../api/types'

const FORECAST_COLORS = ['#7e9cd8', '#e6c384', '#7aa89f', '#7fb4ca', '#c8c093']

interface Props {
  production: ProductionPoint[]
  forecasts: ForecastDetail[]
  logY: boolean
  unit: string
}

interface Row {
  date: string
  actual?: number
  [forecastKey: `forecast_${number}`]: string | number | undefined
}

function ProductionChart({ production, forecasts, logY, unit }: Props) {
  const data = useMemo<Row[]>(() => {
    const byDate = new Map<string, Row>()
    for (const p of production) {
      byDate.set(p.date, { date: p.date, actual: p.oil_rate })
    }
    for (const forecast of forecasts) {
      const key = `forecast_${forecast.id}` as const
      for (const point of forecast.points) {
        const existing = byDate.get(point.date) ?? { date: point.date }
        existing[key] = point.predicted_rate
        byDate.set(point.date, existing)
      }
    }
    return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
  }, [production, forecasts])

  return (
    <ResponsiveContainer width="100%" height={360}>
      <ComposedChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#363646" />
        <XAxis dataKey="date" tick={{ fill: '#727169', fontSize: 11 }} minTickGap={32} />
        <YAxis
          scale={logY ? 'log' : 'auto'}
          domain={logY ? [1, 'auto'] : [0, 'auto']}
          allowDataOverflow={logY}
          tick={{ fill: '#727169', fontSize: 11 }}
          label={{ value: unit, angle: -90, position: 'insideLeft', fill: '#727169' }}
        />
        <Tooltip
          contentStyle={{ background: '#16161d', border: '1px solid #54546d', color: '#dcd7ba' }}
          labelStyle={{ color: '#7e9cd8' }}
        />
        <Legend />
        <Scatter name="History" dataKey="actual" fill="#dcd7ba" />
        {forecasts.map((forecast, index) => (
          <Line
            key={forecast.id}
            name={`${forecast.model_type} #${forecast.id}`}
            type="monotone"
            dataKey={`forecast_${forecast.id}`}
            stroke={FORECAST_COLORS[index % FORECAST_COLORS.length]}
            dot={false}
            strokeWidth={2}
            connectNulls
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export default ProductionChart
