import { Link } from 'react-router-dom'
import { Leaf, ScanLine, Activity, Target, ArrowRight, CheckCircle2, Shield, MapPin, Sparkles } from 'lucide-react'
import Button from '../components/ui/Button'
import Card, { CardSection } from '../components/ui/Card'

const features = [
  {
    icon: ScanLine,
    title: 'AI Waste Detection',
    description: 'Analyze street images to identify visible litter and classify overall cleanliness of the captured area.',
  },
  {
    icon: Activity,
    title: 'Smart Waste Monitoring',
    description: 'Track scan history, waste categories, and cleaning priorities across monitored locations.',
  },
  {
    icon: Target,
    title: 'Intelligent Hotspot Analysis',
    description: 'Surface recurring waste hotspots so sanitation teams can plan routes and allocate resources.',
  },
]

const steps = [
  { n: '01', title: 'Capture', text: 'Upload a street or sidewalk photo from the field.' },
  { n: '02', title: 'Analyze', text: 'AI reviews visible waste and estimates severity.' },
  { n: '03', title: 'Act', text: 'Teams prioritize cleanup using generated reports and maps.' },
]

const stats = [
  { label: 'Scans Analyzed', value: '12.4K', note: 'Demo data' },
  { label: 'Clean Streets', value: '8.2K', note: 'Demo data' },
  { label: 'Reports Filed', value: '3.1K', note: 'Demo data' },
  { label: 'Cities Covered', value: '47', note: 'Demo data' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen text-[#F5F7F6]">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-[#223027] bg-[#0B0F0D]/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center clay-icon-tile text-[#B7F34A]">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold text-[#F5F7F6]">TrashBots</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-[#9CA3AF] md:flex">
            <Link to="/scanner" className="hover:text-[#F5F7F6] transition-colors">Scanner</Link>
            <Link to="/dashboard" className="hover:text-[#F5F7F6] transition-colors">Dashboard</Link>
            <Link to="/about" className="hover:text-[#F5F7F6] transition-colors">About</Link>
          </nav>
          <Link to="/scanner">
            <Button size="sm" iconLeft={<ArrowRight className="h-4 w-4" />}>Launch Scanner</Button>
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto relative max-w-7xl px-6 py-20 md:py-28">
          <div className="mx-auto grid max-w-4xl gap-10 text-center md:grid-cols-2 md:max-w-6xl md:text-left">
            <div className="flex flex-col items-center md:items-start">
              <div className="clay-badge inline-flex items-center gap-2 rounded-full border border-[#B7F34A4D] bg-[#B7F34A1A] px-4 py-1.5 text-xs font-semibold tracking-wide text-[#B7F34A]">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered Smart Waste Management
              </div>
              <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                Smarter Cities.<br /><span className="text-[#B7F34A]">Cleaner Streets.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-[#9CA3AF] md:text-lg">
                TrashBots uses AI-powered street analysis to identify litter, reveal waste hotspots,
                and help sanitation teams prioritize cleaning.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 md:flex-row md:items-center">
                <Link to="/scanner">
                  <Button size="lg" iconLeft={<ScanLine className="h-5 w-5" />}>
                    Launch AI Scanner
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline" size="lg" iconRight={<ArrowRight className="h-4 w-4" />}>
                    Explore Dashboard
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <HeroVisual />
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-20 grid gap-6 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-[#223027] bg-[#141A17] p-6 text-center transition-all hover:border-[#2A3A30]">
                <p className="text-3xl font-semibold text-[#F5F7F6] tabular-nums">{s.value}</p>
                <p className="mt-1 text-sm text-[#9CA3AF]">{s.label}</p>
                <p className="mt-1 text-[10px] text-[#6B7280] uppercase tracking-wider">{s.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Built for sanitation operations</h2>
            <p className="mt-3 text-base leading-relaxed text-[#9CA3AF]">
              Three core capabilities that help teams work smarter, not harder.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} hoverable className="h-full">
                <CardSection>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center clay-icon-tile text-[#B7F34A]">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-[#F5F7F6]">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#9CA3AF]">{f.description}</p>
                </CardSection>
              </Card>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">How it works</h2>
            <p className="mt-3 text-base leading-relaxed text-[#9CA3AF]">
              From street photo to actionable insight in three steps.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <Card key={s.n} hoverable className="h-full">
                <CardSection>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center clay-icon-tile text-[#B7F34A] font-mono text-sm font-semibold">
                      {s.n}
                    </span>
                    <h3 className="text-base font-semibold text-[#F5F7F6]">{s.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#9CA3AF] pl-10">{s.text}</p>
                </CardSection>
              </Card>
            ))}
          </div>
        </section>

        {/* Trust indicators */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <Card className="bg-[#141A17]">
            <CardSection>
              <div className="grid gap-8 md:grid-cols-3">
                <TrustItem icon={Shield} title="No fabricated predictions" text="Confidence scores and categories only appear when the AI backend provides them." />
                <TrustItem icon={MapPin} title="Illustrative locations" text="Map markers are clearly labelled demo data. Real GPS requires metadata or manual entry." />
                <TrustItem icon={CheckCircle2} title="Demo-first design" text="Fully functional without a backend. Load clearly labelled sample data instantly." />
              </div>
            </CardSection>
          </Card>
        </section>

        {/* SDG 11 */}
        <section className="mx-auto max-w-7xl px-6 pb-16">
          <Card className="bg-[#0F1512] border-[#2A3A30]">
            <CardSection>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center clay-icon-tile text-[#B7F34A]">
                  <Leaf className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">UN Sustainable Development Goal 11</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#9CA3AF]">
                    Sustainable Cities and Communities. TrashBots supports cleaner, more livable cities by
                    helping sanitation teams prioritize interventions and monitor environmental
                    conditions over time.
                  </p>
                </div>
              </div>
            </CardSection>
          </Card>
        </section>
      </main>

      <footer className="border-t border-[#223027] px-6 py-8 text-center text-xs text-[#6B7280]">
        TrashBots &mdash; demonstration build. Sample data and illustrative markers are not real measurements.
      </footer>
    </div>
  )
}

function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-[4/3] max-w-md overflow-hidden rounded-2xl border border-[#223027] bg-gradient-to-br from-[#121a16] to-[#0B0F0D]">
      <svg viewBox="0 0 400 300" className="h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#B7F34A" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#B7F34A" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="roadGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#1A241E" />
            <stop offset="100%" stopColor="#141A17" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#glow)" />
        {/* Skyline */}
        <g fill="#1A241E" stroke="#2A3A30" strokeWidth="0.5">
          <rect x="15" y="140" width="55" height="130" rx="2" />
          <rect x="80" y="100" width="45" height="170" rx="2" />
          <rect x="135" y="120" width="65" height="150" rx="2" />
          <rect x="210" y="90" width="55" height="180" rx="2" />
          <rect x="275" y="130" width="75" height="140" rx="2" />
        </g>
        {/* Windows */}
        <g fill="#B7F34A" opacity="0.4">
          <rect x="25" y="160" width="5" height="5" rx="1" />
          <rect x="40" y="160" width="5" height="5" rx="1" />
          <rect x="55" y="160" width="5" height="5" rx="1" />
          <rect x="25" y="180" width="5" height="5" rx="1" />
          <rect x="40" y="180" width="5" height="5" rx="1" />
          <rect x="90" y="120" width="5" height="5" rx="1" />
          <rect x="105" y="120" width="5" height="5" rx="1" />
          <rect x="90" y="140" width="5" height="5" rx="1" />
          <rect x="145" y="140" width="5" height="5" rx="1" />
          <rect x="160" y="140" width="5" height="5" rx="1" />
          <rect x="220" y="110" width="5" height="5" rx="1" />
          <rect x="285" y="150" width="5" height="5" rx="1" />
          <rect x="300" y="150" width="5" height="5" rx="1" />
        </g>
        {/* Road */}
        <rect x="0" y="260" width="400" height="40" fill="url(#roadGrad)" />
        <g fill="#B7F34A" opacity="0.6">
          <rect x="30" y="276" width="28" height="3" rx="1.5" />
          <rect x="85" y="276" width="28" height="3" rx="1.5" />
          <rect x="140" y="276" width="28" height="3" rx="1.5" />
          <rect x="195" y="276" width="28" height="3" rx="1.5" />
          <rect x="250" y="276" width="28" height="3" rx="1.5" />
          <rect x="305" y="276" width="28" height="3" rx="1.5" />
        </g>
        {/* Drone */}
        <g transform="translate(330,55)" opacity="0.9">
          <ellipse cx="0" cy="0" rx="16" ry="10" fill="#141A17" stroke="#B7F34A" strokeWidth="1" opacity="0.3" />
          <circle r="12" fill="#141A17" stroke="#B7F34A" strokeWidth="1.5" />
          <path d="M-10 0 H10 M0 -8 V8" stroke="#B7F34A" strokeWidth="1.5" strokeLinecap="round" />
          <circle r="3" fill="#B7F34A" opacity="0.8" />
        </g>
        {/* Floating particles */}
        <g fill="#B7F34A" opacity="0.3">
          <circle cx="60" cy="40" r="1.5" />
          <circle cx="180" cy="30" r="1" />
          <circle cx="300" cy="50" r="1.5" />
          <circle cx="120" cy="70" r="1" />
        </g>
      </svg>
      <div className="absolute bottom-3 left-3 rounded-full border border-[#223027] bg-[#0F1512]/80 px-3 py-1 text-[10px] text-[#6B7280] uppercase tracking-wider">
        Illustrative concept
      </div>
    </div>
  )
}

function TrustItem({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center clay-icon-tile text-[#B7F34A]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-[#F5F7F6]">{title}</h3>
        <p className="mt-1 text-sm text-[#9CA3AF]">{text}</p>
      </div>
    </div>
  )
}