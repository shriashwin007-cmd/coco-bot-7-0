import { useMemo, useState } from 'react'
import { Search, CheckCircle2, Eye } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import { loadReports, saveReports } from '../utils/storage'
import type { WasteReport, ReportStatus, Severity } from '../types'
import { formatDate, formatSeverity } from '../utils/format'

const STATUSES: ReportStatus[] = ['Open', 'Assigned', 'In Progress', 'Resolved']
const selectCls = 'clay-input border-[#2A3A30] px-3 py-2 text-sm text-[#F5F7F6] focus:border-[#B7F34A] focus:outline-none transition-colors'

export default function ReportsPage() {
  const [reports, setReports] = useState<WasteReport[]>(() => loadReports())
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all')
  const [sevFilter, setSevFilter] = useState<Severity | 'all'>('all')
  const [query, setQuery] = useState('')
  const [detail, setDetail] = useState<WasteReport | null>(null)

  function refresh() { setReports(loadReports()) }

  function updateStatus(id: string, status: ReportStatus) {
    saveReports(loadReports().map((r) => (r.id === id ? { ...r, status } : r)))
    refresh()
    if (detail && detail.id === id) setDetail({ ...detail, status })
  }

  const filtered = useMemo(() => reports.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    if (sevFilter !== 'all' && r.severity !== sevFilter) return false
    if (query.trim()) {
      const q = query.toLowerCase()
      const hay = [r.id, r.location, r.description, r.recommendedAction].filter(Boolean).join(' ').toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  }), [reports, statusFilter, sevFilter, query])

  const summary = useMemo(() => ({
    Open: reports.filter((r) => r.status === 'Open').length,
    Assigned: reports.filter((r) => r.status === 'Assigned').length,
    'In Progress': reports.filter((r) => r.status === 'In Progress').length,
    Resolved: reports.filter((r) => r.status === 'Resolved').length,
  }), [reports])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATUSES.map((s) => (
          <div key={s} className="rounded-2xl border border-[#223027] bg-[#141A17] p-5 hover:border-[#2A3A30] transition-colors">
            <div className="flex items-center justify-between">
              <Badge kind="status" value={s} size="sm" />
              <span className="text-3xl font-semibold text-[#F5F7F6] tabular-nums">{summary[s]}</span>
            </div>
          </div>
        ))}
      </div>

      <Card title={`Waste reports · ${filtered.length} of ${reports.length}`} subtitle="Track and resolve sanitation reports.">
        <div className="mb-5 flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search reports…"
              className="w-full clay-input border-[#2A3A30] py-2.5 pl-10 pr-3 text-sm text-[#F5F7F6] placeholder:text-[#6B7280] focus:border-[#B7F34A] focus:outline-none focus:ring-2 focus:ring-[#B7F34A]/20 transition-all" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ReportStatus | 'all')} className={selectCls} aria-label="Filter by status">
            <option value="all">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={sevFilter} onChange={(e) => setSevFilter(e.target.value as Severity | 'all')} className={selectCls} aria-label="Filter by severity">
            <option value="all">All severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No reports found" description="Create a report from an analyzed scan in the AI Scanner, or load demonstration data from the Dashboard." />
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm min-w-[860px]">
              <thead>
                <tr className="text-left text-[#6B7280] border-b border-[#223027] text-xs uppercase tracking-wider">
                  <th className="pb-3 pr-4 font-medium">Report</th>
                  <th className="pb-3 pr-4 font-medium">Location</th>
                  <th className="pb-3 pr-4 font-medium">Severity</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Created</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-[#223027] last:border-0 hover:bg-[#18201C]/60 transition-colors">
                    <td className="py-3 pr-4">
                      <p className="font-mono text-xs text-[#9CA3AF]">{r.id.slice(0, 22)}…</p>
                      <p className="mt-0.5 max-w-[260px] truncate text-xs text-[#6B7280]">{r.description}</p>
                    </td>
                    <td className="py-3 pr-4 text-xs text-[#9CA3AF] max-w-[150px] truncate">{r.location || '—'}</td>
                    <td className="py-3 pr-4"><Badge kind="severity" value={r.severity} size="sm" /></td>
                    <td className="py-3 pr-4">
                      <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value as ReportStatus)}
                        className="clay-input border-[#2A3A30] px-2 py-1.5 text-xs text-[#F5F7F6] focus:border-[#B7F34A] focus:outline-none" aria-label="Change report status">
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="py-3 pr-4 text-xs text-[#9CA3AF] whitespace-nowrap tabular-nums">{formatDate(r.createdAt)}</td>
                    <td className="py-3">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="secondary" size="sm" onClick={() => setDetail(r)} iconLeft={<Eye className="h-3.5 w-3.5" />}>View</Button>
                        {r.status !== 'Resolved' && (
                          <Button size="sm" onClick={() => updateStatus(r.id, 'Resolved')} iconLeft={<CheckCircle2 className="h-3.5 w-3.5" />}>Resolve</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={!!detail} title="Report details" onClose={() => setDetail(null)}>
        {detail && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge kind="severity" value={detail.severity} />
              <Badge kind="status" value={detail.status} />
              {detail.source && <Badge kind="source" value={detail.source} />}
            </div>
            <dl className="space-y-2.5 text-sm">
              <DetailRow label="Report ID" value={detail.id} mono />
              <DetailRow label="Scan ID" value={detail.scanId} mono />
              <DetailRow label="Created" value={formatDate(detail.createdAt)} />
              <DetailRow label="Location" value={detail.location || 'Not provided'} />
              <DetailRow label="Severity" value={formatSeverity(detail.severity)} />
              <DetailRow label="Status" value={detail.status} />
            </dl>
            <div className="rounded-xl bg-[#0F1512] border border-[#223027] p-3.5">
              <p className="text-[11px] uppercase tracking-wider text-[#6B7280]">Description</p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#F5F7F6]">{detail.description}</p>
            </div>
            <div className="rounded-xl bg-[#0F1512] border border-[#223027] p-3.5">
              <p className="text-[11px] uppercase tracking-wider text-[#6B7280]">Recommended action</p>
              <p className="mt-1.5 text-sm text-[#F5F7F6]">{detail.recommendedAction}</p>
            </div>
            {detail.status !== 'Resolved' && (
              <Button onClick={() => updateStatus(detail.id, 'Resolved')} iconLeft={<CheckCircle2 className="h-4 w-4" />}>Mark as resolved</Button>
            )}
          </div>
        )}
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
