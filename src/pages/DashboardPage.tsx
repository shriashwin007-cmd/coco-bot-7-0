import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Leaf,
  TriangleAlert,
  ClipboardList,
  Gauge,
  Stethoscope,
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
import { loadScans, computeStats } from '../utils/storage'
import { formatDate, formatScore } from '../utils/format'

const PIE_COLORS = ['#B7F34A', '#F59E0B']

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
      <div className="clay p-10 text-center">
        <ClipboardList className="mx-auto h-10 w-10 text-[#6B7280]" />
        <h2 className="mt-4 text-lg font-bold">No scans yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[#9CA3AF]">
          Dashboard figures are computed from your saved scan records. Analyze a leaf to
          generate your first data point.
        </p>
        <Link to="/doctor" className="clay-btn clay-btn-primary mt-5 inline-flex items-center gap-2 px-6 py-3 text-sm">
          <Stethoscope className="h-4 w-4" /> Open AI Plant Doctor
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: ClipboardList, label: 'Total plant scans', value: String(stats.totalScans) },
          { icon: Leaf, label: 'Healthy predictions', value: String(stats.healthyCount) },
          { icon: TriangleAlert, label: 'Needs inspection', value: String(stats.needsInspectionCount) },
          {
            icon: Gauge,
            label: 'Avg. health index',
            value: stats.avgHealthIndex === null ? '—' : formatScore(stats.avgHealthIndex),
          },
        ].map((k) => (
          <div key={k.label} className="clay p-5">
            <span className="clay-icon-tile inline-flex h-10 w-10 items-center justify-center">
              <k.icon className="h-5 w-5 text-[#B7F34A]" />
            </span>
            <p className="mt-3 text-2xl font-bold tabular-nums">{k.value}</p>
            <p className="text-xs text-[#9CA3AF]">{k.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-[#6B7280]">
        All figures computed live from {stats.totalScans} saved scan record{stats.totalScans === 1 ? '' : 's'}.
        {stats.avgHealthIndex === null && ' Average excludes demo results, which carry no model score.'}
      </p>

      {/* Charts */}
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="clay p-5">
          <h3 className="font-semibold">Scan activity — last 7 days</h3>
          <p className="text-xs text-[#9CA3AF]">Scans per day from your history.</p>
          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activity}>
                <CartesianGrid stroke="#223027" strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#141A17', border: '1px solid #223027', borderRadius: 10 }}
                  labelStyle={{ color: '#F5F7F6' }}
                />
                <Bar dataKey="healthy" name="Healthy" fill="#B7F34A" radius={[6, 6, 0, 0]} />
                <Bar dataKey="flagged" name="Needs inspection" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="clay p-5">
          <h3 className="font-semibold">Health distribution</h3>
          <p className="text-xs text-[#9CA3AF]">Split of your actual scan labels — only categories the model supports.</p>
          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {distribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#141A17', border: '1px solid #223027', borderRadius: 10 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-5 text-xs text-[#9CA3AF]">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#B7F34A]" /> Healthy ({stats.healthyCount})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" /> Needs inspection ({stats.needsInspectionCount})
            </span>
          </div>
        </div>
      </div>

      {/* Recent + alerts */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="clay p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Recent plant health reports</h3>
            <Link to="/history" className="text-xs font-medium text-[#B7F34A] hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-3 space-y-2.5">
            {recent.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-2xl border border-[#223027] bg-[#0B0F0D]/60 p-3"
              >
                {s.thumbnail ? (
                  <img src={s.thumbnail} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#223027]">
                    <Leaf className="h-5 w-5 text-[#B7F34A]" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium capitalize">{s.predictedLabel}</p>
                  <p className="text-xs text-[#6B7280]">{formatDate(s.createdAt)}</p>
                </div>
                <Badge value={s.status} size="sm" />
              </div>
            ))}
          </div>
        </div>
        <div className="clay p-5">
          <h3 className="flex items-center gap-2 font-semibold">
            <Bell className="h-4 w-4 text-[#F59E0B]" /> Recent alerts
          </h3>
          <p className="text-xs text-[#9CA3AF]">Plants flagged as needing inspection.</p>
          {alerts.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-[#223027] bg-[#0B0F0D]/60 p-5 text-center text-sm text-[#9CA3AF]">
              No alerts — every saved scan currently reads healthy.
            </p>
          ) : (
            <div className="mt-3 space-y-2.5">
              {alerts.map((s) => (
                <div
                  key={s.id}
                  className="rounded-2xl border border-[#F59E0B4D] bg-[#F59E0B1A] p-3.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold capitalize">{s.predictedLabel}</p>
                    <Badge value={s.source} size="sm" />
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-[#F5D9A8]">{s.explanation}</p>
                  <p className="mt-1 text-[11px] text-[#9CA3AF]">{formatDate(s.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
