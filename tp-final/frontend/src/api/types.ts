export type ModelType = 'exponential' | 'hyperbolic' | 'harmonic'

export interface WellSummary {
  id: number
  name: string
  field: string | null
  operator: string | null
  oil_rate_unit: string
  created_at: string
  point_count: number
  first_date: string | null
  last_date: string | null
  last_oil_rate: number | null
  forecast_count: number
}

export interface WellDetail {
  id: number
  name: string
  field: string | null
  operator: string | null
  oil_rate_unit: string
  created_at: string
}

export interface ProductionPoint {
  date: string
  oil_rate: number
}

export interface RejectedRow {
  line: number
  reason: string
}

export interface UploadSummary {
  wells_new: number
  wells_existing: number
  points_loaded: number
  rows_rejected: number
  rejected: RejectedRow[]
}

export interface ArpsParams {
  qi: number
  Di: number
  b: number
}

export interface ForecastSummary {
  id: number
  well_id: number
  model_type: ModelType
  params_json: ArpsParams
  r_squared: number
  horizon_months: number
  economic_cutoff: number | null
  eur: number
  created_at: string
}

export interface ForecastPoint {
  date: string
  predicted_rate: number
}

export interface ForecastDetail extends ForecastSummary {
  points: ForecastPoint[]
}

export interface ForecastRequest {
  model_type: ModelType
  horizon_months: number
  economic_cutoff: number | null
}
