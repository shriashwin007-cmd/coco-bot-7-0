import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Sprout, Menu, X, FlaskConical } from 'lucide-react'

const nav = [
  { to: '/', label: 'Home', end: true },
  { to: '/doctor', label: 'AI Plant Doctor' },
  { to: '/dashboard', label: 'Farm Dashboard' },
  { to: '/robot', label: 'Virtual COCO BOT' },
  { to: '/history', label: 'Scan History' },
  { to: '/about', label: 'About' },
]

const titles: Record<string, { title: string; subtitle: string }> = {
  '/doctor': { title: 'AI Plant Doctor', subtitle: 'Upload a leaf photo for a real AI health reading' },
  '/dashboard': { title: 'Farm Dashboard', subtitle: 'Statistics computed from your saved scans' },
  '/robot': { title: 'Virtual COCO BOT', subtitle: 'Simulated hardware concept — no real devices connected' },
  '/history': { title: 'Scan History', subtitle: 'Search and review past analyses' },
  '/about': { title: 'About COCO BOT 7.0', subtitle: 'Proposed invention and sustainability goals' },
}

export default function AppLayout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'
  const meta = titles[location.pathname] ?? { title: 'COCO BOT 7.0', subtitle: '' }

  return (
    <div className="min-h-screen text-[#F5F7F6]">
      <header className="sticky top-0 z-40 border-b border-[#223027] bg-[#0B0F0D]/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="clay-icon-tile flex h-9 w-9 items-center justify-center">
              <Sprout className="h-5 w-5 text-[#B7F34A]" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold tracking-wide">COCO BOT 7.0</span>
              <span className="block text-[11px] text-[#9CA3AF]">Smart Autonomous Crop Guardian</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'clay-nav-active text-[#B7F34A]' : 'text-[#D1D5DB] hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            <span className="clay-badge inline-flex items-center gap-1.5 rounded-full border border-[#F59E0B4D] bg-[#F59E0B1A] px-3 py-1 text-[11px] font-semibold text-[#F59E0B]">
              <FlaskConical className="h-3 w-3" /> Software demo — no hardware
            </span>
          </div>
          <button
            className="clay-btn clay-btn-secondary p-2 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <nav className="border-t border-[#223027] px-4 py-3 lg:hidden">
            <div className="grid gap-1">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2.5 text-sm font-medium ${
                      isActive ? 'clay-nav-active text-[#B7F34A]' : 'text-[#D1D5DB]'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>

      {isHome ? (
        <Outlet />
      ) : (
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{meta.title}</h1>
            <p className="mt-1 text-sm text-[#9CA3AF]">{meta.subtitle}</p>
          </div>
          <Outlet />
        </main>
      )}

      <footer className="border-t border-[#223027] py-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 text-xs text-[#6B7280] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>COCO BOT 7.0 — software demonstration. AI readings come from leaf-photo analysis; sensor + pump panels are simulated.</span>
          <span>Healthy vs needs-inspection only. No specific diseases diagnosed.</span>
        </div>
      </footer>
    </div>
  )
}
