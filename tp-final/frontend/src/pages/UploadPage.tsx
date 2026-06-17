import { useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'

import { useUpload } from '../api/hooks'

function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [unit, setUnit] = useState('bbl/d')
  const [dragging, setDragging] = useState(false)
  const upload = useUpload()

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    const dropped = event.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }

  const onPick = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0]
    if (picked) setFile(picked)
  }

  const summary = upload.data

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Upload production CSV</h1>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 text-center transition ${
          dragging ? 'border-wave bg-ink-elev' : 'border-line'
        }`}
      >
        <p className="text-oldwhite">Drag &amp; drop a CSV here, or</p>
        <label className="mt-3 cursor-pointer rounded bg-wave px-4 py-2 text-sm font-medium text-ink hover:bg-wave-bright">
          Choose file
          <input type="file" accept=".csv" className="hidden" onChange={onPick} />
        </label>
        {file && <p className="mt-3 text-sm text-sand">{file.name}</p>}
      </div>

      <div className="flex items-center gap-4">
        <label className="text-sm text-oldwhite">
          Oil rate unit:{' '}
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="ml-2 rounded border border-line bg-ink-elev px-2 py-1"
          >
            <option value="bbl/d">bbl/d</option>
            <option value="m3/d">m³/d</option>
          </select>
        </label>
        <button
          type="button"
          disabled={!file || upload.isPending}
          onClick={() => file && upload.mutate({ file, unit })}
          className="rounded bg-wave px-4 py-2 text-sm font-medium text-ink hover:bg-wave-bright disabled:opacity-40"
        >
          {upload.isPending ? 'Uploading…' : 'Upload'}
        </button>
      </div>

      {upload.isError && (
        <p className="rounded bg-crimson/10 p-3 text-sm text-crimson">{upload.error.message}</p>
      )}

      {summary && (
        <div className="rounded-lg border border-line bg-ink-elev p-4 text-sm">
          <h2 className="mb-2 font-semibold text-sand">Upload result</h2>
          <ul className="space-y-1 text-oldwhite">
            <li>New wells: {summary.wells_new}</li>
            <li>Existing wells: {summary.wells_existing}</li>
            <li>Points loaded: {summary.points_loaded}</li>
            <li>Rows rejected: {summary.rows_rejected}</li>
          </ul>
          {summary.rejected.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-crimson">
              {summary.rejected.slice(0, 10).map((r) => (
                <li key={r.line}>
                  Line {r.line}: {r.reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default UploadPage
