import { useMemo, useState } from 'react'
import { Search, Trash2, Eye, SlidersHorizontal } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import { loadScans, saveScans } from '../utils/storage'
import type { ScanRecord, Cleanliness, Severity, AnalysisSource } from '../types'
import { formatCleanliness, formatSeverity, formatDate } from '../utils/format'

const selectCls = 'clay-input border-[#2A3A30] px-3 py-2 text-sm text-[#F5F7F6] focus:border-[#B7F34A] focus:outline-none transition-colors'

export default function HistoryPage() {
  const [scans, setScans] = useState<ScanRecord[]>(() => loadScans())
  const [query, setQuery] = useState('')
  const [cleanFilter, setCleanFilter] = useState<Cleanliness | 'all'>('all')
  const [sevFilter, setSevFilter] = useState<Severity | 'all'>('all')
  const [srcFilter, setSrcFilter] = useState<AnalysisSource | 'all'>('all')
  const [detail, setDetail] = useState<ScanRecord | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  function refresh() { setScans(loadScans()) }

  const filtered = useMemo(() => scans.filter((s) => {
    if (cleanFilter !== 'all' && s.cleanliness !== cleanFilter) return false
    if (sevFilter !== 'all' && s.severity !== sevFilter) return false
    if (srcFilter !== 'all' && s.source !== srcFilter) return false
    if (query.trim()) {
      const q = query.toLowerCase()
      const hay = [s.id, s.filename, s.location, s.explanation, s.recommendedAction].filter(Boolean).join(' ').toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  }), [scans, query, cleanFilter, sevFilter, srcFilter])

  const activeFilters = (cleanFilter !== 'all' ? 1 : 0) + (sevFilter !== 'all' ? 1 : 0) + (srcFilter !== 'all' ? 1 : 0)

  function handleDelete(id: string) {
    saveScans(loadScans().filter((s) => s.id !== id))
    refresh()
  }

  function handleClear() { saveScans([]); refresh(); setConfirmClear(false) }
  function resetFilters() { setQuery(''); setCleanFilter('all'); setSevFilter('all'); setSrcFilter('all') }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card title={`Scan history · ${filtered.length} of ${scans.length}`} subtitle="Search and filter previous analyses." action={
        <Button variant="danger" size="sm" onClick={() => setConfirmClear(true)} disabled={scans.length === 0} iconLeft={<Trash2 className="h-3.5 w-3.5" />}>Clear</Button>
      }>
        <div className="mb-5 flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by id, filename, location…"
              className="w-full clay-input border-[#2A3A30] py-2.5 pl-10 pr-3 text-sm text-[#F5F7F6] placeholder:text-[#6B7280] focus:border-[#B7F34A] focus:outline-none focus:ring-2 focus:ring-[#B7F34A]/20 transition-all" />
          </div>
          <select value={cleanFilter} onChange={(e) => setCleanFilter(e.target.value as Cleanliness | 'all')} className={selectCls} aria-label="Filter by cleanliness">
            <option value="all">All cleanliness</option>
            <option value="clean">Clean</option>
            <option value="moderately_littered">Moderately Littered</option>
            <option value="heavily_littered">Heavily Littered</option>
          </select>
          <select value={sevFilter} onChange={(e) => setSevFilter(e.target.value as Severity | 'all')} className={selectCls} aria-label="Filter by severity">
            <option value="all">All severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select value={srcFilter} onChange={(e) => setSrcFilter(e.target.value as AnalysisSource | 'all')} className={selectCls} aria-label="Filter by source">
            <option value="all">All sources</option>
            <option value="REAL AI">REAL AI</option>
            <option value="DEMO">DEMO</option>
          </select>
          {activeFilters > 0 && (
            <Button variant="ghost" size="sm" onClick={resetFilters} iconLeft={<SlidersHorizontal className="h-3.5 w-3.5" />}>
              Reset ({activeFilters})
            </Button>
          )}
        </div>

        {filtered.length === 0 ? (
          <EmptyState variant="search" title="No scans found"
            description={scans.length === 0 ? 'Run an analysis in the AI Scanner or load demonstration data from the Dashboard.' : 'Try adjusting your filters or search term.'} />
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="text-left text-[#6B7280] border-b border-[#223027] text-xs uppercase tracking-wider">
                  <th className="pb-3 pr-4 font-medium">Scan</th>
                  <th className="pb-3 pr-4 font-medium">Timestamp</th>
                  <th className="pb-3 pr-4 font-medium">Cleanliness</th>
                  <th className="pb-3 pr-4 font-medium">Severity</th>
                  <th className="pb-3 pr-4 font-medium">Source</th>
                  <th className="pb-3 pr-4 font-medium">Location</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-[#223027] last:border-0 hover:bg-[#18201C]/60 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        {s.thumbnail ? <img src={s.thumbnail} alt="" className="h-10 w-14 rounded-lg object-cover border border-[#223027]" /> : <div className="h-10 w-14 rounded-lg bg-[#0F1512] border border-[#223027]" />}
                        <span className="font-mono text-xs text-[#9CA3AF]">{s.id.slice(0, 20)}…</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-[#9CA3AF] text-xs whitespace-nowrap tabular-nums">{formatDate(s.createdAt)}</td>
                    <td className="py-3 pr-4"><Badge kind="cleanliness" value={s.cleanliness} size="sm" /></td>
                    <td className="py-3 pr-4"><Badge kind="severity" value={s.severity} size="sm" /></td>
                    <td className="py-3 pr-4"><Badge kind="source" value={s.source} size="sm" /></td>
                    <td className="py-3 pr-4 text-xs text-[#9CA3AF] max-w-[160px] truncate">{s.location || '—'}</td>
                    <td className="py-3">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="secondary" size="sm" onClick={() => setDetail(s)} iconLeft={<Eye className="h-3.5 w-3.5" />}>View</Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(s.id)} aria-label="Delete scan"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={!!detail} title="Scan details" onClose={() => setDetail(null)}>
        {detail && (
          <div className="space-y-4">
            {detail.thumbnail && <img src={detail.thumbnail} alt="Scan" className="h-44 w-full rounded-xl object-cover border border-[#223027]" />}
            <div className="flex flex-wrap gap-2">
              <Badge kind="cleanliness" value={detail.cleanliness} />
              <Badge kind="severity" value={detail.severity} />
              <Badge kind="source" value={detail.source} />
            </div>
            <dl className="space-y-2.5 text-sm">
              <DetailRow label="Scan ID" value={detail.id} mono />
              <DetailRow label="Timestamp" value={formatDate(detail.createdAt)} />
              <DetailRow label="Cleanliness" value={formatCleanliness(detail.cleanliness)} />
              <DetailRow label="Severity" value={formatSeverity(detail.severity)} />
              <DetailRow label="Location" value={detail.location || 'Not provided'} />
              {typeof detail.confidence === 'number' && <DetailRow label="Confidence" value={`${Math.round(detail.confidence * 100)}%`} />}
            </dl>
            <div className="rounded-xl bg-[#0F1512] border border-[#223027] p-3.5">
              <p className="text-[11px] uppercase tracking-wider text-[#6B7280]">Explanation</p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#F5F7F6]">{detail.explanation}</p>
            </div>
            {detail.wasteCategories.length > 0 && (
              <div className="rounded-xl bg-[#0F1512] border border-[#223027] p-3.5">
                <p className="text-[11px] uppercase tracking-wider text-[#6B7280]">Waste categories</p>
                <ul className="mt-2 space-y-1.5">
                  {detail.wasteCategories.map((c, i) => (
                    <li key={i} className="flex justify-between text-sm"><span className="capitalize text-[#F5F7F6]">{c.name}</span><span className="text-[#B7F34A] font-semibold tabular-nums">×{c.count}</span></li>
                  ))}
                </ul>
              </div>
            )}
            <div className="rounded-xl bg-[#0F1512] border border-[#223027] p-3.5">
              <p className="text-[11px] uppercase tracking-wider text-[#6B7280]">Recommended action</p>
              <p className="mt-1.5 text-sm text-[#F5F7F6]">{detail.recommendedAction}</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={confirmClear} title="Clear all scan history?" onClose={() => setConfirmClear(false)} size="sm"
        footer={<><Button variant="ghost" onClick={() => setConfirmClear(false)}>Cancel</Button><Button variant="danger" onClick={handleClear}>Clear all</Button></>}>
        <p className="text-sm leading-relaxed text-[#9CA3AF]">This removes all scan records from local storage. Reports are not affected.</p>
      </Modal>
    </div>
  )
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#223027] pb-2.5 last:border-0 last:pb-0">
      <dt className="text-[#9CA3AF] shrink-0">{label}</dt>
      <dd className={`font-medium text-[#F5F7F6] text-right break-all ${mono ? 'font-mono text-xs' : ''}`}>{value}</dd>
    </div>
  )
}
