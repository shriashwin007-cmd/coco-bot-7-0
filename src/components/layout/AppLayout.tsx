import { useEffect, useState, type CSSProperties } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { X, FlaskConical } from 'lucide-react'
import RollText from '../ui/RollText'

const tabs = [
  { to: '/doctor', label: 'Doctor' },
  { to: '/dashboard', label: 'Fields' },
]

const menuLinks = [
  { to: '/', label: 'Home', note: 'The assembly at a glance', end: true },
  { to: '/doctor', label: 'AI Plant Doctor', note: 'A reading of your leaf' },
  { to: '/dashboard', label: 'Farm Dashboard', note: 'Records of every scan' },
  { to: '/robot', label: 'Virtual COCO BOT', note: 'The machine, simulated' },
  { to: '/history', label: 'Scan History', note: 'Every report, kept' },
  { to: '/about', label: 'About', note: 'The invention & its aims' },
]

const titles: Record<string, { eyebrow: string; title: string; subtitle: string }> = {
  '/doctor': { eyebrow: 'Chapter I', title: 'AI Plant Doctor', subtitle: 'Offer a leaf photograph and receive an honest reading.' },
  '/dashboard': { eyebrow: 'Chapter II', title: 'Farm Dashboard', subtitle: 'Figures drawn from your saved scans — nothing invented.' },
  '/robot': { eyebrow: 'Chapter III', title: 'Virtual COCO BOT', subtitle: 'The proposed field machine, shown as simulation.' },
  '/history': { eyebrow: 'Chapter IV', title: 'Scan History', subtitle: 'Search and revisit every past analysis.' },
  '/about': { eyebrow: 'Chapter V', title: 'About COCO BOT 7.0', subtitle: 'The invention and its pact with the soil.' },
}

const EASE = 'cubic-bezier(0.35, 0.35, 0, 1)'

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [hidden, setHidden] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'
  const meta = titles[location.pathname]

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(t)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  // Hide the masthead on scroll-down, return it on scroll-up (reference behaviour).
  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setHidden(y > 180 && y > last && !menuOpen)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [menuOpen])

  const headerTransform = !mounted
    ? 'translate3d(0, -150%, 0) skew(-10deg, -5deg)'
    : hidden && !menuOpen
      ? 'translate3d(0, -150%, 0)'
      : 'translateZ(0)'

  return (
    <div className="min-h-screen text-[#2a1f14]">
      {/* Masthead */}
      <header className="fixed inset-x-0 top-0 z-50" style={{ transform: headerTransform, transition: `transform 1.5s ${EASE}` }}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#2a1f14]/45 via-[#2a1f14]/15 to-transparent" aria-hidden />
        <div className="relative mx-auto flex max-w-[1400px] items-start justify-between gap-4 px-5 pt-5 sm:px-8">
          <Link to="/" className="leading-none text-[#f7f1e3]">
            <span className="font-display block text-[1.7rem] font-light tracking-tight sm:text-3xl">
              Coco Bot
            </span>
            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.28em] opacity-80">
              7.0 · Crop Guardian
            </span>
          </Link>

          <nav className="mt-1 hidden items-center gap-0 md:flex" aria-label="Primary">
            {tabs.map((t, i) => (
              <span key={t.to} className="flex items-center">
                {i > 0 && <span className="mx-1 h-6 w-px bg-[#2a1f14]" aria-hidden />}
                <NavLink
                  to={t.to}
                  className={({ isActive }) =>
                    `tab-pill px-10 py-2.5 text-xs font-bold uppercase tracking-[0.22em] ${
                      isActive ? 'tab-pill-active' : ''
                    }`
                  }
                >
                  {t.label}
                </NavLink>
              </span>
            ))}
          </nav>

          <button
            onClick={() => setMenuOpen(true)}
            className="pill pill-cream roll-hover mt-1 w-44 justify-between px-4 py-2.5 sm:w-56"
            aria-label="Open menu"
          >
            <span className="menu-lines" aria-hidden>
              <span />
              <span />
              <span />
            </span>
            <RollText text="MENU" className="text-xs font-bold tracking-[0.22em]" />
          </button>
        </div>
      </header>

      {/* Menu overlay */}
      {menuOpen && (
        <div className="animate-fade-in fixed inset-0 z-[70] flex flex-col bg-[#f1e7d1] text-[#2a1f14]">
          <div className="mx-auto flex w-full max-w-[1400px] items-start justify-between px-5 pt-5 sm:px-8">
            <span className="font-display text-[1.7rem] font-light tracking-tight">Coco Bot</span>
            <button
              onClick={() => setMenuOpen(false)}
              className="pill pill-dark roll-hover px-5 py-2.5 text-xs font-bold uppercase tracking-[0.22em]"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" /> <RollText text="Close" />
            </button>
          </div>
          <nav className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-5 sm:px-8" aria-label="Menu">
            {menuLinks.map((l, i) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className="menu-link roll-hover group flex items-baseline gap-4 border-b border-[#2a1f14]/15 py-3 sm:py-4"
                style={{ '--i': i } as CSSProperties}
              >
                <span className="text-xs font-semibold tracking-widest text-[#8a6a4d]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-display text-4xl font-light tracking-tight transition-transform duration-700 group-hover:translate-x-2 sm:text-6xl" style={{ transitionTimingFunction: EASE }}>
                  <RollText text={l.label} />
                </span>
                <span className="ml-auto hidden text-xs uppercase tracking-[0.2em] text-[#6f5f4c] sm:block">
                  {l.note}
                </span>
              </NavLink>
            ))}
          </nav>
          <p className="mx-auto w-full max-w-[1400px] px-5 pb-6 text-[11px] uppercase tracking-[0.2em] text-[#6f5f4c] sm:px-8">
            Software demonstration · No hardware connected
          </p>
        </div>
      )}

      {isHome || !meta ? (
        <Outlet />
      ) : (
        <main className="mx-auto max-w-[1200px] px-5 pb-16 pt-32 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#2a1f14]/70">{meta.eyebrow}</p>
          <h1 className="font-display mt-2 text-5xl font-light tracking-tight sm:text-7xl">{meta.title}</h1>
          <p className="mt-3 max-w-xl text-[15px] text-[#3a2c1e]/80">{meta.subtitle}</p>
          <div className="mt-8">
            <Outlet />
          </div>
        </main>
      )}

      <footer className="border-t border-[#2a1f14]/25">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-5 py-6 text-[11px] uppercase tracking-[0.18em] text-[#2a1f14]/70 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span className="inline-flex items-center gap-2">
            <FlaskConical className="h-3.5 w-3.5" /> Coco Bot 7.0 — a software demonstration
          </span>
          <span>Healthy vs needs-inspection only · Simulations labelled</span>
        </div>
      </footer>
    </div>
  )
}
