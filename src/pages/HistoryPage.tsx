import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Trash2, Leaf, Stethoscope, Download } from 'lucide-react'
import Badge from '../components/ui/Badge'
import { loadScans, deleteScan, clearDemoScans, clearAllScans, exportScansJson } from '../utils/storage'
import { formatDate, formatScore } from '../utils/format'
import type { ScanRecord } from '../types'

export default function HistoryPage() {
  const [scans, setScans] = useState<ScanRecord[]>(() => loadScans())
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'healthy' | 'needs_inspection' | 'REAL AI' | 'DEMO'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return scans.filter((s) => {
      if (filter !== 'all' && s.status !== filter && s.source !== filter) return false
      if (!q) return true
      return (
        s.predictedLabel.toLowerCase().includes(q) ||
        s.explanation.toLowerCase().includes(q) ||
        (s.filename ?? '').toLowerCase().includes(q)
      )
    })
  }, [scans, query, filter])

  const handleDelete = (id: string) => setScans(deleteScan(id))

  const handleExport = () => {
    const blob = new Blob([exportScansJson(scans)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cocobot-scan-history.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (scans.length === 0) {
    return (
      <div className="clay p-10 text-center">
        <Search className="mx-auto h-10 w-10 text-[#6B7280]" />
        <h2 className="mt-4 text-lg font-bold">No scan records</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[#9CA3AF]">
          Saved reports from AI Plant Doctor will appear here with thumbnails, timestamps,
          predictions, and analysis source.
        </p>
        <Link to="/doctor" className="clay-btn clay-btn-primary mt-5 inline-flex items-center gap-2 px-6 py-3 text-sm">
          <Stethoscope className="h-4 w-4" /> Analyze a leaf
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="clay flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <div className="clay-input flex flex-1 items-center gap-2 px-4 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-[#6B7280]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by prediction, notes, or filename…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-[#6B7280]"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'healthy', 'needs_inspection', 'REAL AI', 'DEMO'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
                filter === f ? 'clay-nav-active text-[#B7F34A]' : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              {f === 'all' ? 'All' : f === 'needs_inspection' ? 'Needs inspection' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[#6B7280]">
          Showing {filtered.length} of {scans.length} records. Dashboard updates automatically when scans are deleted.
        </span>
        <span className="flex-1" />
        <button onClick={handleExport} className="clay-btn clay-btn-secondary inline-flex items-center gap-1.5 px-3.5 py-2">
          <Download className="h-3.5 w-3.5" /> Export JSON
        </button>
        <button
          onClick={() => setScans(clearDemoScans())}
          className="clay-btn clay-btn-secondary px-3.5 py-2"
          title="Remove only records tagged DEMO"
        >
          Clear demo
        </button>
        <button onClick={() => setScans(clearAllScans())} className="clay-btn clay-btn-danger inline-flex items-center gap-1.5 px-3.5 py-2">
          <Trash2 className="h-3.5 w-3.5" /> Clear all
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        {filtered.map((s) => {
          const open = expanded === s.id
          return (
            <div key={s.id} className="clay p-4">
              <div className="flex items-center gap-3">
                {s.thumbnail ? (
                  <img src={s.thumbnail} alt="" className="h-14 w-14 shrink-0 rounded-2xl object-cover" />
                ) : (
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#223027]">
                    <Leaf className="h-6 w-6 text-[#B7F34A]" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold capitalize">{s.predictedLabel}</p>
                  <p className="text-xs text-[#6B7280]">
                    {formatDate(s.createdAt)}
                    {s.filename ? ` · ${s.filename}` : ''} · Score {formatScore(s.modelScore)}
                  </p>
                </div>
                <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
                  <Badge value={s.status} size="sm" />
                  <Badge value={s.source} size="sm" />
                </div>
                <button
                  onClick={() => setExpanded(open ? null : s.id)}
                  className="clay-btn clay-btn-secondary shrink-0 px-3.5 py-2 text-xs"
                >
                  {open ? 'Hide' : 'Details'}
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="clay-btn clay-btn-danger shrink-0 p-2"
                  aria-label="Delete scan"
                  title="Delete this scan"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 flex gap-1.5 sm:hidden">
                <Badge value={s.status} size="sm" />
                <Badge value={s.source} size="sm" />
              </div>
              {open && (
                <div className="animate-slide-up mt-3 space-y-2.5 border-t border-[#223027] pt-3 text-sm">
                  <p className="leading-relaxed text-[#D1D5DB]">{s.explanation}</p>
                  <div className="rounded-2xl border border-[#B7F34A4D] bg-[#B7F34A1A] p-3.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#B7F34A]">Suggested next step</p>
                    <p className="mt-1 text-sm text-[#E7F8C8]">{s.recommendedNextStep}</p>
                  </div>
                  <p className="text-xs text-[#6B7280]">
                    Analysis source: {s.source === 'REAL AI' ? 'computed from your photo by the AI backend' : 'labelled demonstration example, not a real analysis'}.
                    {s.modelScore === null && ' No model score was recorded for this result.'}
                  </p>
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="clay p-8 text-center text-sm text-[#9CA3AF]">
            No records match your search. Try a different keyword or filter.
          </div>
        )}
      </div>
    </div>
  )
}
