import { useEffect, useState } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import { Leaf, FlaskConical } from 'lucide-react'
import Sidebar from './Sidebar'

const titles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Command Center', subtitle: 'Operational overview of street cleanliness' },
  '/scanner': { title: 'AI Street Scanner', subtitle: 'Upload and analyze street imagery' },
  '/history': { title: 'Scan History', subtitle: 'Search and review past analyses' },
  '/reports': { title: 'Waste Reports', subtitle: 'Track and resolve sanitation reports' },
  '/about': { title: 'About TrashBots', subtitle: 'Platform, stack and integration guide' },
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'
  const meta = titles[location.pathname] ?? { title: 'TrashBots', subtitle: '' }

  useEffect(() => {
    const stored = localStorage.getItem('trashbots_sidebar_collapsed')
    if (stored) setCollapsed(stored === 'true')
  }, [])

  useEffect(() => {
    localStorage.setItem('trashbots_sidebar_collapsed', String(collapsed))
  }, [collapsed])

  if (isHome) return <Outlet />

  return (
    <div className="flex h-screen overflow-hidden text-[#F5F7F6]">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between gap-4 border-b border-[#223027] bg-[#0F1512]/80 backdrop-blur px-6 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-[#6B7280]">
              <Link to="/" className="hover:text-[#B7F34A] transition-colors flex items-center gap-1">
                <Leaf className="h-3 w-3" /> TrashBots
              </Link>
              <span>/</span>
              <span className="truncate">{meta.title}</span>
            </div>
            <h1 className="mt-1 text-lg font-semibold tracking-tight truncate">{meta.title}</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#9CA3AF] shrink-0">
            <span className="hidden sm:inline tabular-nums">{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            <span className="clay-badge rounded-full border border-[#F59E0B4D] bg-[#F59E0B1A] px-3 py-1 text-[11px] font-semibold tracking-wide text-[#F59E0B] flex items-center gap-1.5">
              <FlaskConical className="h-3 w-3" />
              Demo Environment
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
