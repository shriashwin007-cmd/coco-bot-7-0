import { useMemo, useState } from 'react'
import { Search, Trash2, Leaf, Download } from 'lucide-react'
import Badge from '../components/ui/Badge'
import AssemblyButton from '../components/ui/AssemblyButton'
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
      <div className="card-paper p-10 text-center">
        <Search className="mx-auto h-10 w-10 text-[#8a6a4d]" />
        <h2 className="font-display mt-4 text-3xl font-light">No entries yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[#3a2c1e]/75">
          Reports saved from the Doctor will be bound here — portraits, dates, verdicts, and seals of origin.
        </p>
        <AssemblyButton to="/doctor" label="Read a Leaf" variant="dark" className="mt-5" />
      </div>
    )
  }

  return (
    <div>
      <div className="card-paper flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <div className="field-input flex flex-1 items-center gap-2 px-4 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-[#8a6a4d]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by verdict, notes, or filename…"
            className="w-full bg-transparent text-sm text-[#2a1f14] outline-none placeholder:text-[#8a6a4d]"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'healthy', 'needs_inspection', 'REAL AI', 'DEMO'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
                filter === f ? 'bg-[#2a1f14] text-[#f4ecdd]' : 'text-[#3a2c1e]/70 hover:bg-[#2a1f14]/8'
              }`}
            >
              {f === 'all' ? 'All' : f === 'needs_inspection' ? 'Needs a look' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[#3a2c1e]/70">
          Showing {filtered.length} of {scans.length} entries. The Dashboard keeps pace with every deletion.
        </span>
        <span className="flex-1" />
        <button onClick={handleExport} className="pill border border-[#2a1f14]/30 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-[#2a1f14]/5">
          <Download className="h-3.5 w-3.5" /> Export
        </button>
        <button
          onClick={() => setScans(clearDemoScans())}
          className="pill border border-[#2a1f14]/30 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-[#2a1f14]/5"
          title="Remove only records bearing the DEMO seal"
        >
          Clear demo
        </button>
        <button onClick={() => setScans(clearAllScans())} className="pill border border-[#a4442e]/60 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#7c3121] hover:bg-[#a4442e]/10">
          <Trash2 className="h-3.5 w-3.5" /> Clear all
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        {filtered.map((s) => {
          const open = expanded === s.id
          return (
            <div key={s.id} className="card-paper p-4 sm:p-5">
              <div className="flex items-center gap-3">
                {s.thumbnail ? (
                  <img src={s.thumbnail} alt="" className="h-14 w-14 shrink-0 rounded-2xl object-cover" />
                ) : (
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#8a6a4d]/25">
                    <Leaf className="h-6 w-6 text-[#3d471f]" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-display truncate text-xl capitalize">{s.predictedLabel}</p>
                  <p className="text-xs text-[#6f5f4c]">
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
                  className="pill shrink-0 border border-[#2a1f14]/30 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-[#2a1f14]/5"
                >
                  {open ? 'Fold' : 'Unfold'}
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="pill shrink-0 border border-[#a4442e]/50 p-2 text-[#7c3121] hover:bg-[#a4442e]/10"
                  aria-label="Delete scan"
                  title="Delete this entry"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 flex gap-1.5 sm:hidden">
                <Badge value={s.status} size="sm" />
                <Badge value={s.source} size="sm" />
              </div>
              {open && (
                <div className="animate-slide-up mt-3 space-y-2.5 border-t border-[#8a6a4d]/35 pt-3 text-sm">
                  <p className="leading-relaxed text-[#3a2c1e]">{s.explanation}</p>
                  <div className="rounded-2xl border border-[#55622e]/50 bg-[#55622e]/10 p-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#3d471f]">Counselled next step</p>
                    <p className="mt-1 text-sm text-[#33401b]">{s.recommendedNextStep}</p>
                  </div>
                  <p className="text-xs text-[#6f5f4c]">
                    Origin: {s.source === 'REAL AI' ? 'computed from your photograph by the service' : 'a labelled illustration, not a true reading'}.
                    {s.modelScore === null && ' No score was inscribed for this entry.'}
                  </p>
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="card-paper p-8 text-center text-sm text-[#3a2c1e]/75">
            No entries answer to that search. Try another word, or another seal.
          </div>
        )}
      </div>
    </div>
  )
}
