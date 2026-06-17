import type {
  ForecastDetail,
  ForecastRequest,
  ForecastSummary,
  ProductionPoint,
  UploadSummary,
  WellDetail,
  WellSummary,
} from './types'
import { addApiDebugEntry } from './debugger'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function headersToRecord(headers: HeadersInit | Headers | undefined): Record<string, string> {
  if (!headers) return {}
  return Object.fromEntries(new Headers(headers).entries())
}

function responseHeadersToRecord(headers: Headers): Record<string, string> {
  return Object.fromEntries(headers.entries())
}

function summarizeBody(body: BodyInit | null | undefined): string | null {
  if (!body) return null
  if (typeof body === 'string') return prettyJson(body)
  if (body instanceof FormData) {
    const payload: Record<string, unknown> = {}
    for (const [key, value] of body.entries()) {
      payload[key] =
        value instanceof File
          ? { name: value.name, size: value.size, type: value.type || 'application/octet-stream' }
          : value
    }
    return JSON.stringify(payload, null, 2)
  }
  return `[${body.constructor.name}]`
}

function prettyJson(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2)
  } catch {
    return text
  }
}

function parseJson<T>(text: string): T {
  return JSON.parse(text) as T
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`
  const startedAt = new Date()
  const start = performance.now()
  const method = init?.method ?? 'GET'
  const payload = summarizeBody(init?.body)
  const requestHeaders = headersToRecord(init?.headers)
  let loggedResponse = false

  try {
    const response = await fetch(url, init)
    const responseText = response.status === 204 ? '' : await response.text()
    const responseBody = responseText ? prettyJson(responseText) : null
    const durationMs = Math.round(performance.now() - start)

    addApiDebugEntry({
      method,
      url,
      path,
      payload,
      requestHeaders,
      responseBody,
      responseCode: response.status,
      responseHeaders: responseHeadersToRecord(response.headers),
      startedAt: startedAt.toISOString(),
      durationMs,
      responseBytes: responseText.length,
      ok: response.ok,
      error: null,
    })
    loggedResponse = true

    if (!response.ok) {
      let detail = `Request failed (${response.status})`
      if (responseText) {
        try {
          const body = parseJson<{ detail?: unknown }>(responseText)
          if (typeof body.detail === 'string') detail = body.detail
        } catch {
          // response had no JSON body; keep the default message
        }
      }
      throw new Error(detail)
    }
    if (response.status === 204) return undefined as T
    return parseJson<T>(responseText)
  } catch (error) {
    if (loggedResponse) throw error
    const durationMs = Math.round(performance.now() - start)
    addApiDebugEntry({
      method,
      url,
      path,
      payload,
      requestHeaders,
      responseBody: null,
      responseCode: null,
      responseHeaders: {},
      startedAt: startedAt.toISOString(),
      durationMs,
      responseBytes: 0,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}

export const api = {
  listWells: () => request<WellSummary[]>('/api/wells'),

  getWell: (id: number) => request<WellDetail>(`/api/wells/${id}`),

  getProduction: (id: number) => request<ProductionPoint[]>(`/api/wells/${id}/production`),

  deleteWell: (id: number) => request<void>(`/api/wells/${id}`, { method: 'DELETE' }),

  uploadCsv: (file: File, oilRateUnit: string) => {
    const form = new FormData()
    form.append('file', file)
    form.append('oil_rate_unit', oilRateUnit)
    return request<UploadSummary>('/api/wells/upload', { method: 'POST', body: form })
  },

  createForecast: (wellId: number, body: ForecastRequest) =>
    request<ForecastDetail>(`/api/wells/${wellId}/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  listForecasts: (wellId: number) => request<ForecastSummary[]>(`/api/wells/${wellId}/forecasts`),

  getForecast: (id: number) => request<ForecastDetail>(`/api/forecasts/${id}`),

  deleteForecast: (id: number) => request<void>(`/api/forecasts/${id}`, { method: 'DELETE' }),
}
