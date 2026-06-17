import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'

import {
  clearApiDebugEntries,
  getApiDebugEntries,
  subscribeApiDebugEntries,
  type ApiDebugEntry,
} from '../api/debugger'

function DebugIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 2h8" />
      <path d="M9 2v3" />
      <path d="M15 2v3" />
      <rect x="6" y="5" width="12" height="15" rx="4" />
      <path d="M3 10h3" />
      <path d="M18 10h3" />
      <path d="M3 15h3" />
      <path d="M18 15h3" />
      <path d="M10 11h.01" />
      <path d="M14 11h.01" />
      <path d="M10 16h4" />
    </svg>
  )
}

function methodClass(method: string) {
  if (method === 'GET') return 'text-aqua'
  if (method === 'POST') return 'text-sand'
  if (method === 'DELETE') return 'text-crimson-bright'
  return 'text-wave'
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

function makeCurl(entry: ApiDebugEntry) {
  const parts = [`curl -X ${entry.method}`]
  for (const [key, value] of Object.entries(entry.requestHeaders)) {
    parts.push(`-H "${key}: ${value}"`)
  }
  if (entry.payload) parts.push(`--data '${entry.payload.replaceAll("'", "'\\''")}'`)
  parts.push(`"${entry.url}"`)
  return parts.join(' ')
}

function JsonBlock({ title, value }: { title: string; value: string | null }) {
  return (
    <div className="min-h-0">
      <h4 className="mb-1 text-xs font-semibold uppercase text-muted">{title}</h4>
      <pre className="max-h-40 overflow-auto rounded border border-line bg-ink p-3 text-xs leading-relaxed text-oldwhite">
        {value ?? '—'}
      </pre>
    </div>
  )
}

function HeadersList({ title, headers }: { title: string; headers: Record<string, string> }) {
  const entries = Object.entries(headers)
  return (
    <div>
      <h4 className="mb-1 text-xs font-semibold uppercase text-muted">{title}</h4>
      <div className="max-h-28 overflow-auto rounded border border-line bg-ink p-3 text-xs text-oldwhite">
        {entries.length === 0 ? (
          <span className="text-muted">—</span>
        ) : (
          entries.map(([key, value]) => (
            <div key={key} className="grid grid-cols-[8rem_1fr] gap-2">
              <span className="truncate text-muted">{key}</span>
              <span className="break-all">{value}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function RequestDetail({ entry }: { entry: ApiDebugEntry }) {
  const [copied, setCopied] = useState(false)

  const copyCurl = async () => {
    await navigator.clipboard.writeText(makeCurl(entry))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className={`text-sm font-semibold ${methodClass(entry.method)}`}>{entry.method}</span>
        <span className="break-all text-sm text-fuji">{entry.url}</span>
        <button
          type="button"
          onClick={copyCurl}
          className="ml-auto rounded border border-line px-2 py-1 text-xs text-oldwhite hover:bg-ink-elev"
        >
          {copied ? 'Copied' : 'Copy cURL'}
        </button>
      </div>

      <div className="grid gap-2 text-xs sm:grid-cols-5">
        <div className="rounded border border-line bg-ink p-2">
          <span className="block text-muted">Status</span>
          <span className={entry.ok ? 'text-aqua' : 'text-crimson-bright'}>
            {entry.responseCode ?? 'Network error'}
          </span>
        </div>
        <div className="rounded border border-line bg-ink p-2">
          <span className="block text-muted">Time</span>
          <span>{entry.durationMs} ms</span>
        </div>
        <div className="rounded border border-line bg-ink p-2">
          <span className="block text-muted">Size</span>
          <span>{formatBytes(entry.responseBytes)}</span>
        </div>
        <div className="rounded border border-line bg-ink p-2">
          <span className="block text-muted">Started</span>
          <span>{formatTime(entry.startedAt)}</span>
        </div>
        <div className="rounded border border-line bg-ink p-2">
          <span className="block text-muted">Path</span>
          <span className="break-all">{entry.path}</span>
        </div>
      </div>

      {entry.error && (
        <p className="rounded bg-crimson/10 p-2 text-xs text-crimson">{entry.error}</p>
      )}

      <div className="grid min-h-0 gap-3 lg:grid-cols-2">
        <JsonBlock title="Payload" value={entry.payload} />
        <JsonBlock title="Body response" value={entry.responseBody} />
        <HeadersList title="Request headers" headers={entry.requestHeaders} />
        <HeadersList title="Response headers" headers={entry.responseHeaders} />
      </div>
    </div>
  )
}

function RequestRow({
  entry,
  selected,
  onSelect,
}: {
  entry: ApiDebugEntry
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full border-b border-line/60 px-3 py-2 text-left hover:bg-ink-elev/70 ${
        selected ? 'bg-ink-elev' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`w-12 text-xs font-semibold ${methodClass(entry.method)}`}>
          {entry.method}
        </span>
        <span className="truncate text-xs text-fuji">{entry.path}</span>
      </div>
      <div className="mt-1 flex items-center gap-2 text-xs text-muted">
        <span className={entry.ok ? 'text-aqua' : 'text-crimson-bright'}>
          {entry.responseCode ?? 'ERR'}
        </span>
        <span>{entry.durationMs} ms</span>
        <span>{formatTime(entry.startedAt)}</span>
      </div>
    </button>
  )
}

function ApiDebugger() {
  const entries = useSyncExternalStore(subscribeApiDebugEntries, getApiDebugEntries)
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [panelHeight, setPanelHeight] = useState(46)
  const [resizing, setResizing] = useState(false)

  useEffect(() => {
    if (!resizing) return undefined

    const onPointerMove = (event: PointerEvent) => {
      const nextHeight = ((window.innerHeight - event.clientY) / window.innerHeight) * 100
      setPanelHeight(Math.min(78, Math.max(32, nextHeight)))
    }
    const stopResize = () => setResizing(false)

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', stopResize, { once: true })
    window.addEventListener('pointercancel', stopResize, { once: true })
    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', stopResize)
      window.removeEventListener('pointercancel', stopResize)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [resizing])

  const selected = useMemo(
    () => entries.find((entry) => entry.id === selectedId) ?? entries[0],
    [entries, selectedId],
  )

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-6 bottom-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-line bg-ink-deep text-fuji shadow-2xl shadow-black/40 hover:bg-ink-elev"
        aria-label="Open HTTP debugger"
        title="HTTP debugger"
      >
        <DebugIcon />
        {entries.length > 0 && (
          <span className="absolute -top-1 -right-1 rounded-full bg-wave px-1.5 py-0.5 text-[10px] font-semibold text-ink">
            {entries.length}
          </span>
        )}
      </button>
    )
  }

  return (
    <section className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink-deep text-fuji shadow-2xl shadow-black/50">
      <button
        type="button"
        onPointerDown={(event) => {
          event.preventDefault()
          setResizing(true)
        }}
        aria-label="Resize HTTP debugger panel"
        title="Drag to resize"
        className="absolute -top-2 left-0 flex h-4 w-full cursor-row-resize items-center justify-center"
      >
        <span className="h-1 w-16 rounded-full bg-wave/80" />
      </button>
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <DebugIcon className="h-5 w-5 text-wave" />
        <div>
          <h2 className="text-sm font-semibold">HTTP Debugger</h2>
          <p className="text-xs text-muted">{entries.length} captured requests</p>
        </div>
        <button
          type="button"
          onClick={clearApiDebugEntries}
          disabled={entries.length === 0}
          className="ml-auto rounded border border-line px-3 py-1.5 text-xs text-oldwhite hover:bg-ink-elev disabled:opacity-40"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded bg-wave px-3 py-1.5 text-xs font-medium text-ink hover:bg-wave-bright"
        >
          Close
        </button>
      </div>

      <div
        className="grid min-h-[22rem] grid-cols-1 md:grid-cols-[22rem_1fr]"
        style={{ height: `${panelHeight}vh` }}
      >
        <div className="min-h-0 overflow-auto border-b border-line md:border-r md:border-b-0">
          {entries.length === 0 ? (
            <p className="p-4 text-sm text-muted">No requests captured yet.</p>
          ) : (
            entries.map((entry) => (
              <RequestRow
                key={entry.id}
                entry={entry}
                selected={entry.id === selected?.id}
                onSelect={() => setSelectedId(entry.id)}
              />
            ))
          )}
        </div>
        {selected ? (
          <RequestDetail entry={selected} />
        ) : (
          <div className="p-4 text-sm text-muted">Run an API request to inspect it here.</div>
        )}
      </div>
    </section>
  )
}

export default ApiDebugger
