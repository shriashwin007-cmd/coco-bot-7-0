import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ScanLine, CheckCircle2, AlertTriangle, FileWarning, PlayCircle, Trash2,
  BarChart2, Activity
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart as RechartPieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts'
import Card, { CardSection, CardRow } from '../components/ui/Card'
import KpiCard from '../components/ui/KpiCard'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import CityMap from '../components/map/CityMap'
import { loadScans, saveScans, loadReports, saveReports, clearAllDemoData } from '../utils/storage'
import { createDemoScans, createDemoReports } from '../data/demoData'
import type { ScanRecord, WasteReport } from '../types'
import { formatDate } from '../utils/format'

const LIME = '#B7F34A'
const AMBER = '#F59E0B'
const RED = '#EF4444'


export default function DashboardPage() {
  const [scans, setScans] = useState<ScanRecord[]>([])
  const [reports, setReports] = useState<WasteReport[]>([])
  const [message, setMessage] = useState<string | null>(null)

  function refresh() {
    setScans(loadScans())
    setReports(loadReports())
  }

  useEffect(() => { refresh() }, [])

  function loadDemoData() {
    const existingScans = loadScans().filter((s) => s.source !== 'DEMO')
    const existingReports = loadReports().filter((r) => r.source !== 'DEMO')
    const demoScans = createDemoScans()
    const demoReports = createDemoReports(demoScans)
    saveScans([...demoScans, ...existingScans])
    saveReports([...demoReports, ...existingReports])
    refresh()
    setMessage('Demonstration data loaded. Records are clearly marked as DEMO.')
  }

  function runDemoScenario() {
    loadDemoData()
    setMessage('Demo scenario ready. Open the AI Scanner to walk through a sample analysis flow.')
  }

  function clearDemoData() {
    clearAllDemoData()
    refresh()
    setMessage('Demonstration records cleared.')
  }

  const stats = useMemo(() => {
    const totalAnalyzed = scans.length
    const cleanStreets = scans.filter((s) => s.cleanliness === 'clean').length
    const litteredStreets = scans.filter((s) => s.cleanliness !== 'clean').length
    const highPriorityReports = reports.filter((r) => r.severity === 'high' && r.status !== 'Resolved').length
    return { totalAnalyzed, cleanStreets, litteredStreets, highPriorityReports }
  }, [scans, reports])

  const cleanlinessDist = useMemo(() => [
    { name: 'Clean', value: scans.filter((s) => s.cleanliness === 'clean').length, color: LIME },
    { name: 'Moderate', value: scans.filter((s) => s.cleanliness === 'moderately_littered').length, color: AMBER },
    { name: 'Heavy', value: scans.filter((s) => s.cleanliness === 'heavily_littered').length, color: RED },
  ], [scans])

  const severityDist = useMemo(() => [
    { name: 'Low', value: scans.filter((s) => s.severity === 'low').length, color: LIME },
    { name: 'Medium', value: scans.filter((s) => s.severity === 'medium').length, color: AMBER },
    { name: 'High', value: scans.filter((s) => s.severity === 'high').length, color: RED },
  ], [scans])

  const activityMap = useMemo(() => {
    const map = new Map<string, number>()
    scans.forEach((s) => { const day = s.createdAt.slice(0, 10); map.set(day, (map.get(day) ?? 0) + 1) })
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([day, count]) => ({ day, count }))
  }, [scans])

  const wasteData = useMemo(() => {
    const map = new Map<string, number>()
    scans.forEach((s) => s.wasteCategories.forEach((c) => map.set(c.name, (map.get(c.name) ?? 0) + c.count)))
    return Array.from(map.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8)
  }, [scans])

  const recentScans = scans.slice(0, 8)
  const recentAlerts = reports.filter((r) => r.status !== 'Resolved').slice(0, 6)

  const hasData = scans.length > 0 || reports.length > 0

  const getTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? { value: 100, positive: true } : { value: 0, positive: true }
    const change = ((current - previous) / previous) * 100
    return { value: Math.round(Math.abs(change)), positive: change >= 0 }
  }

  // Simple trend comparison (last 7 days vs previous 7 days)
  const recentPeriod = scans.filter(s => {
    const date = new Date(s.createdAt)
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
    return date >= weekAgo
  }).length
  const previousPeriod = scans.filter(s => {
    const date = new Date(s.createdAt)
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
    const twoWeeksAgo = new Date(); twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    return date >= twoWeeksAgo && date < weekAgo
  }).length

  const cleanTrend = getTrend(
    scans.filter(s => s.cleanliness === 'clean' && new Date(s.createdAt) >= new Date(Date.now() - 7*86400000)).length,
    scans.filter(s => s.cleanliness === 'clean' && new Date(s.createdAt) >= new Date(Date.now() - 14*86400000) && new Date(s.createdAt) < new Date(Date.now() - 7*86400000)).length
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {message && (
        <div className="clay-chip border-[#B7F34A4D] px-5 py-4 text-sm text-[#B7F34A] animate-slide-up">
          {message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#F5F7F6]">Overview</h2>
          <p className="text-sm text-[#9CA3AF]">Command Center Dashboard</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={runDemoScenario} iconLeft={<PlayCircle className="h-4 w-4" />}>
            Run Demo Scenario
          </Button>
          <Button variant="secondary" size="sm" onClick={loadDemoData} iconLeft={<Activity className="h-4 w-4" />}>
            Load Demo Data
          </Button>
          <Button variant="danger" size="sm" onClick={clearDemoData} iconLeft={<Trash2 className="h-4 w-4" />}>
            Clear Demo Data
          </Button>
          <Link to="/scanner">
            <Button size="sm" iconLeft={<ScanLine className="h-4 w-4" />}>Launch Scanner</Button>
          </Link>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          title="No records yet"
          description="Load clearly labelled demonstration data to explore the dashboard, or run a scan in the AI Scanner."
          actionLabel="Load demonstration data"
          onAction={loadDemoData}
          variant="upload"
        />
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Total Analyzed"
              value={stats.totalAnalyzed}
              icon={ScanLine}
              trend={getTrend(recentPeriod, previousPeriod)}
              hint="All scans in history"
            />
            <KpiCard
              title="Clean Streets"
              value={stats.cleanStreets}
              icon={CheckCircle2}
              trend={cleanTrend}
              hint="Clean classification"
            />
            <KpiCard
              title="Littered Streets"
              value={stats.litteredStreets}
              icon={AlertTriangle}
              trend={null}
              hint="Moderate + Heavy"
            />
            <KpiCard
              title="High-Priority Reports"
              value={stats.highPriorityReports}
              icon={FileWarning}
              trend={null}
              hint="Open + Assigned + In Progress"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardRow>
                <h3 className="text-base font-semibold">Cleanliness Distribution</h3>
                <div className="flex items-center gap-4 text-xs">
                  {cleanlinessDist.map((d) => d.value > 0 && (
                    <span key={d.name} className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-[#9CA3AF]">{d.name} {d.value}</span>
                    </span>
                  ))}
                </div>
              </CardRow>
              <CardSection>
                {stats.totalAnalyzed === 0 ? (
                  <div className="h-48 flex items-center justify-center text-[#6B7280] text-sm">No scan data</div>
                ) : (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartPieChart>
                        <Pie
                          data={cleanlinessDist.filter(d => d.value > 0)}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          label={({ name, percent }) => (percent ?? 0) > 0.05 && (
                            <span className="text-xs font-medium text-[#F5F7F6]">{name} {(((percent) ?? 0) * 100).toFixed(0)}%</span>
                          )}
                          labelLine={false}
                        >
                          {cleanlinessDist.filter(d => d.value > 0).map((_, i) => (
                            <Cell key={i} fill={cleanlinessDist[i].color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: '#141A17', border: '1px solid #223027', borderRadius: '10px' }}
                          formatter={(value) => [String(value), 'scans']}
                        />
                      </RechartPieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardSection>
            </Card>

            <Card>
              <CardRow>
                <h3 className="text-base font-semibold">Severity Breakdown</h3>
              </CardRow>
              <CardSection>
                {stats.totalAnalyzed === 0 ? (
                  <div className="h-48 flex items-center justify-center text-[#6B7280] text-sm">No scan data</div>
                ) : (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={severityDist.filter(d => d.value > 0)} layout="vertical">
                        <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={50} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                        <XAxis type="number" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ background: '#141A17', border: '1px solid #223027', borderRadius: '10px' }}
                          formatter={(value) => [String(value), 'scans']}
                        />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                          {severityDist.filter(d => d.value > 0).map((d, i) => (
                            <Cell key={i} fill={d.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardSection>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <Card>
            <CardRow>
              <h3 className="text-base font-semibold">Scan Activity (Last 14 Days)</h3>
              <Badge kind="source" value={scans.some(s => s.source === 'REAL AI') ? 'REAL AI' : 'DEMO'} size="sm" />
            </CardRow>
            <CardSection>
              {activityMap.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-[#6B7280] text-sm">No activity yet</div>
              ) : (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityMap}>
                      <CartesianGrid stroke="#223027" vertical={false} />
                      <XAxis dataKey="day" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                      <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ background: '#141A17', border: '1px solid #223027', borderRadius: '10px' }}
                        formatter={(value) => [String(value), 'scans']}
                        labelFormatter={(v) => `Day ${v}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke={LIME}
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: LIME, strokeWidth: 2, stroke: '#0B0F0D' }}
                        activeDot={{ r: 6, fill: LIME }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardSection>
          </Card>

          {wasteData.length > 0 && (
            <Card>
              <CardRow>
                <h3 className="text-base font-semibold">Top Waste Categories</h3>
              </CardRow>
              <CardSection>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={wasteData} layout="vertical">
                      <XAxis type="number" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={140} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ background: '#141A17', border: '1px solid #223027', borderRadius: '10px' }}
                        formatter={(value) => [String(value), 'items']}
                      />
                      <Bar dataKey="count" fill={LIME} radius={[0, 6, 6, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardSection>
            </Card>
          )}

          {/* Map + Alerts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardRow>
                <h3 className="text-base font-semibold">City Map</h3>
              </CardRow>
              <CardSection className="p-0">
                <CityMap reports={reports} scans={scans} />
              </CardSection>
            </Card>

            <Card>
              <CardRow>
                <h3 className="text-base font-semibold">Active Alerts</h3>
                <span className="text-xs text-[#6B7280]">{recentAlerts.length} unresolved</span>
              </CardRow>
              <CardSection>
                {recentAlerts.length === 0 ? (
                  <div className="py-8 text-center text-sm text-[#9CA3AF]">No active alerts</div>
                ) : (
                  <ul className="space-y-3">
                    {recentAlerts.map((r) => (
                      <li key={r.id} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-[#0F1512] border border-[#223027] hover:border-[#2A3A30] transition-colors">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-[#6B7280]">{r.id.slice(0, 18)}…</span>
                            <Badge kind="severity" value={r.severity} size="sm" />
                          </div>
                          <p className="mt-1 text-sm text-[#9CA3AF] truncate">{r.location || 'Location not set'}</p>
                          <p className="mt-1 text-xs text-[#6B7280] truncate">{r.description}</p>
                        </div>
                        <Badge kind="status" value={r.status} size="sm" />
                      </li>
                    ))}
                  </ul>
                )}
              </CardSection>
            </Card>
          </div>

          {/* Recent Scans Table */}
          <Card>
            <CardRow>
              <h3 className="text-base font-semibold">Recent Scans</h3>
              <Link to="/history">
                <Button variant="ghost" size="sm" iconRight={<BarChart2 className="h-4 w-4" />}>
                  View all
                </Button>
              </Link>
            </CardRow>
            <CardSection>
              {recentScans.length === 0 ? (
                <div className="py-8 text-center text-sm text-[#9CA3AF]">No scans yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[#6B7280] border-b border-[#223027]">
                        <th className="pb-3 pr-4">Scan ID</th>
                        <th className="pb-3 pr-4">Time</th>
                        <th className="pb-3 pr-4">Cleanliness</th>
                        <th className="pb-3 pr-4">Severity</th>
                        <th className="pb-3 pr-4">Categories</th>
                        <th className="pb-3 pr-4">Source</th>
                        <th className="pb-3">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentScans.map((s) => (
                        <tr key={s.id} className="border-b border-[#223027] last:border-0 hover:bg-[#18201C] transition-colors">
                          <td className="py-3 pr-4 font-mono text-xs text-[#9CA3AF]">{s.id}</td>
                          <td className="py-3 pr-4 text-[#9CA3AF] text-xs">{formatDate(s.createdAt)}</td>
                          <td className="py-3 pr-4"><Badge kind="cleanliness" value={s.cleanliness} size="sm" /></td>
                          <td className="py-3 pr-4"><Badge kind="severity" value={s.severity} size="sm" /></td>
                          <td className="py-3 pr-4 text-xs text-[#9CA3AF]">
                            {s.wasteCategories.length
                              ? s.wasteCategories.slice(0, 2).map((c) => `${c.name} (${c.count})`).join(', ') + (s.wasteCategories.length > 2 ? ' …' : '')
                              : '—'}
                          </td>
                          <td className="py-3 pr-4"><Badge kind="source" value={s.source} size="sm" /></td>
                          <td className="py-3 text-xs text-[#9CA3AF] truncate max-w-xs">{s.location || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardSection>
          </Card>
        </>
      )}
    </div>
  )
}