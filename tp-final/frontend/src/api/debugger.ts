export interface ApiDebugEntry {
  id: number
  method: string
  url: string
  path: string
  payload: string | null
  requestHeaders: Record<string, string>
  responseBody: string | null
  responseCode: number | null
  responseHeaders: Record<string, string>
  startedAt: string
  durationMs: number
  responseBytes: number
  ok: boolean
  error: string | null
}

type Listener = () => void

let nextId = 1
let entries: ApiDebugEntry[] = []
const listeners = new Set<Listener>()

function emit() {
  for (const listener of listeners) listener()
}

export function addApiDebugEntry(entry: Omit<ApiDebugEntry, 'id'>) {
  entries = [{ ...entry, id: nextId++ }, ...entries].slice(0, 50)
  emit()
}

export function clearApiDebugEntries() {
  entries = []
  emit()
}

export function subscribeApiDebugEntries(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getApiDebugEntries() {
  return entries
}
