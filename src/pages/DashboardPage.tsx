import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Leaf,
  TriangleAlert,
  ClipboardList,
  Gauge,
  Bell,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import Badge from '../components/ui/Badge'
import AssemblyButton from '../components/ui/AssemblyButton'
import { loadScans, computeStats } from '../utils/storage'
import { formatDate, formatScore } from '../utils/format'

const PIE_COLORS = ['#55622e', '#b97f2e']

export default function DashboardPage() {
  const scans = useMemo(() => loadScans(), [])
  const stats = useMemo(() => computeStats(scans), [scans])

  const activity = useMemo(() => {
    const days: { date: string; label: string; scans: number; healthy: number; flagged: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const label = d.toLocaleDateString(undefined, { weekday: 'short' })
      const dayScans = scans.filter((s) => s.createdAt.slice(0, 10) === key)
      days.push({
        date: key,
        label,
        scans: dayScans.length,
        healthy: dayScans.filter((s) => s.status === 'healthy').length,
        flagged: dayScans.filter((s) => s.status === 'needs_inspection').length,
      })
    }
    return days
  }, [scans])

  const distribution = [
    { name: 'Healthy', value: stats.healthyCount },
    { name: 'Needs inspection', value: stats.needsInspectionCount },
  ]

  const recent = scans.slice(0, 5)
  const alerts = scans.filter((s) => s.status === 'needs_inspection').slice(0, 4)

  if (scans.length === 0) {
    return (
      <div className="card-paper p-10 text-center">
        <ClipboardList className="mx-auto h-10 w-10 text-[#8a6a4d]" />
        <h2 className="font-display mt-4 text-3xl font-light">The ledger is empty</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[#3a2c1e]/75">
          These figures are counted from your saved scans. Offer a leaf to inscribe the first entry.
        </p>
        <AssemblyButton to="/doctor" label="Consult the Doctor" variant="dark" className="mt-5" />
      </div>
    )
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: ClipboardList, label: 'Total scans', value: String(stats.totalScans) },
          { icon: Leaf, label: 'Healthy', value: String(stats.healthyCount) },
          { icon: TriangleAlert, label: 'Needs inspection', value: String(stats.needsInspectionCount) },
          {
            icon: Gauge,
            label: 'Mean greenness',
            value: stats.avgHealthIndex === null ? '—' : formatScore(stats.avgHealthIndex),
          },
        ].map((k) => (
          <div key={k.label} className="card-paper p-5">
            <k.icon className="h-5 w-5 text-[#8a6a4d]" />
            <p className="font-display mt-2 text-5xl font-light tabular-nums">{k.value}</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[#6f5f4c]">{k.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-[#3a2c1e]/70">
        Counted this moment from {stats.totalScans} saved record{stats.totalScans === 1 ? '' : 's'}.
        {stats.avgHealthIndex === null && ' The mean admits no demo entries, which bear no score.'}
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="card-paper p-5 sm:p-6">
          <h3 className="font-display text-2xl font-light tracking-tight">The week in scans</h3>
          <p className="text-xs text-[#6f5f4c]">Seven days, drawn from your history.</p>
          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activity}>
                <CartesianGrid stroke="#8a6a4d55" strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fill: '#6f5f4c', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6f5f4c', fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#f6eeda', border: '1px solid #8a6a4d', borderRadius: 12 }}
                  labelStyle={{ color: '#2a1f14' }}
                />
                <Bar dataKey="healthy" name="Healthy" fill="#55622e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="flagged" name="Needs inspection" fill="#b97f2e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card-paper p-5 sm:p-6">
          <h3 className="font-display text-2xl font-light tracking-tight">The share of health</h3>
          <p className="text-xs text-[#6f5f4c]">Only the verdicts this system can truly give.</p>
          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {distribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#f6eeda', border: '1px solid #8a6a4d', borderRadius: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-5 text-xs text-[#3a2c1e]/80">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#55622e]" /> Healthy ({stats.healthyCount})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#b97f2e]" /> Needs inspection ({stats.needsInspectionCount})
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="card-paper p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl font-light tracking-tight">Recent entries</h3>
            <Link to="/history" className="text-xs font-bold uppercase tracking-[0.18em] text-[#2a1f14] underline underline-offset-4">
              The full ledger
            </Link>
          </div>
          <div className="mt-3 space-y-2.5">
            {recent.map((s) => (
              <div key={s.id} className="panel-inset flex items-center gap-3 p-3">
                {s.thumbnail ? (
                  <img src={s.thumbnail} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#8a6a4d]/25">
                    <Leaf className="h-5 w-5 text-[#3d471f]" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold capitalize">{s.predictedLabel}</p>
                  <p className="text-xs text-[#6f5f4c]">{formatDate(s.createdAt)}</p>
                </div>
                <Badge value={s.status} size="sm" />
              </div>
            ))}
          </div>
        </div>
        <div className="card-paper p-5 sm:p-6">
          <h3 className="font-display flex items-center gap-2 text-2xl font-light tracking-tight">
            <Bell className="h-5 w-5 text-[#8a5d1c]" /> Warnings
          </h3>
          <p className="text-xs text-[#6f5f4c]">Leaves asking for a closer look.</p>
          {alerts.length === 0 ? (
            <p className="panel-inset mt-4 p-5 text-center text-sm text-[#3a2c1e]/75">
              None. Every saved scan presently reads healthy.
            </p>
          ) : (
            <div className="mt-3 space-y-2.5">
              {alerts.map((s) => (
                <div key={s.id} className="rounded-2xl border border-[#b97f2e]/55 bg-[#b97f2e]/12 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold capitalize">{s.predictedLabel}</p>
                    <Badge value={s.source} size="sm" />
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-[#5f4a24]">{s.explanation}</p>
                  <p className="mt-1 text-[11px] text-[#6f5f4c]">{formatDate(s.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
