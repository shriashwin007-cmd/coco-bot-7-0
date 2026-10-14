import { Link } from 'react-router-dom'
import {
  Stethoscope,
  LayoutDashboard,
  Leaf,
  Droplets,
  Sun,
  Radio,
  ScanLine,
  TriangleAlert,
  FlaskConical,
} from 'lucide-react'

const capabilities = [
  {
    icon: ScanLine,
    title: 'Leaf-photo AI analysis',
    text: 'Upload a leaf photograph. The backend measures green vs discoloured pixels and returns a genuine health reading — healthy or needs inspection.',
  },
  {
    icon: LayoutDashboard,
    title: 'Farm dashboard',
    text: 'Every saved scan feeds live totals, health splits, activity charts, and recent alerts. Figures come from your records, never hardcoded.',
  },
  {
    icon: Droplets,
    title: 'Intended field sensing',
    text: 'The proposed COCO BOT hardware would track soil moisture, temperature, and humidity. The website shows this future as a clearly labelled simulation.',
  },
]

const pipeline = [
  { step: '1', title: 'Photograph', text: 'Take a clear daylight photo of a single leaf.' },
  { step: '2', title: 'Analyze', text: 'AI Plant Doctor computes a leaf-greenness health index from the pixels.' },
  { step: '3', title: 'Review', text: 'Read the explanation, score meaning, and suggested next steps.' },
  { step: '4', title: 'Track', text: 'Save the report — dashboard and history update automatically.' },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:pt-20">
          <div>
            <span className="clay-badge inline-flex items-center gap-1.5 rounded-full border border-[#B7F34A4D] bg-[#B7F34A1A] px-3 py-1 text-[11px] font-semibold tracking-wide text-[#B7F34A]">
              <FlaskConical className="h-3 w-3" /> SOFTWARE DEMONSTRATION — NO PHYSICAL ROBOT CONNECTED
            </span>
            <h1 className="mt-5 text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Intelligent Plant Care. <span className="text-[#B7F34A]">Smarter Farming.</span>
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#9CA3AF]">
              COCO BOT 7.0 is a proposed AI-powered crop guardian. Today&apos;s website
              demonstrates its plant-health brain: upload a leaf photo and get an honest
              healthy-or-needs-inspection reading with an explanation you can verify.
              The future solar field robot — sensors, pumps, connectivity — is previewed
              as a clearly labelled simulation.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/doctor"
                className="clay-btn clay-btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm"
              >
                <Stethoscope className="h-4 w-4" /> AI Plant Doctor
              </Link>
              <Link
                to="/dashboard"
                className="clay-btn clay-btn-secondary inline-flex items-center gap-2 px-6 py-3 text-sm"
              >
                <LayoutDashboard className="h-4 w-4" /> Farm Dashboard
              </Link>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-[#6B7280]">
              Only healthy vs needs-inspection classification is supported. The system does
              not name specific diseases — uncertain cases advise expert confirmation.
            </p>
          </div>
          <div className="clay overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1200&auto=format&fit=crop"
              alt="Green crop field at daylight"
              className="h-72 w-full object-cover sm:h-96"
              loading="eager"
            />
            <div className="grid grid-cols-3 divide-x divide-[#223027] border-t border-[#223027] text-center">
              {[
                { icon: Leaf, top: 'Leaf AI', bottom: 'Real pixel analysis' },
                { icon: Sun, top: 'Solar concept', bottom: 'Simulated' },
                { icon: Radio, top: 'Wi-Fi / LoRa', bottom: 'Simulated' },
              ].map((s) => (
                <div key={s.top} className="px-3 py-4">
                  <s.icon className="mx-auto h-5 w-5 text-[#B7F34A]" />
                  <p className="mt-1.5 text-xs font-semibold">{s.top}</p>
                  <p className="text-[11px] text-[#6B7280]">{s.bottom}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">What this demonstration does</h2>
        <p className="mt-1 text-sm text-[#9CA3AF]">Three working software areas — plus a simulated hardware preview.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {capabilities.map((c) => (
            <div key={c.title} className="clay p-6">
              <span className="clay-icon-tile inline-flex h-11 w-11 items-center justify-center">
                <c.icon className="h-5 w-5 text-[#B7F34A]" />
              </span>
              <h3 className="mt-4 font-semibold">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#9CA3AF]">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="clay p-6 sm:p-8">
          <h2 className="text-xl font-bold tracking-tight">How a scan works</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pipeline.map((p) => (
              <div key={p.step} className="rounded-2xl border border-[#223027] bg-[#0B0F0D]/60 p-5">
                <span className="clay-badge inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#B7F34A4D] bg-[#B7F34A1A] text-sm font-bold text-[#B7F34A]">
                  {p.step}
                </span>
                <h3 className="mt-3 font-semibold">{p.title}</h3>
                <p className="mt-1 text-sm text-[#9CA3AF]">{p.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-[#F59E0B4D] bg-[#F59E0B1A] p-4 text-sm text-[#F5D9A8]">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#F59E0B]" />
            <p>
              Care guidance is suggestive, not a guaranteed cure. Anything flagged as needing
              inspection should be confirmed by an agronomist or plant clinic before treatment.
            </p>
          </div>
        </div>
      </section>

      {/* Concept strip */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="clay overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1200&auto=format&fit=crop"
              alt="Farmer inspecting green crops"
              className="h-56 w-full object-cover"
              loading="lazy"
            />
            <div className="p-6">
              <h3 className="font-semibold">Built for sustainable agriculture</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#9CA3AF]">
                Early visual screening helps growers focus attention where it matters, reduce
                preventive chemical use, and keep records of crop health over the season.
              </p>
              <Link to="/about" className="clay-btn clay-btn-outline mt-4 inline-flex px-5 py-2.5 text-sm">
                About the invention
              </Link>
            </div>
          </div>
          <div className="clay overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=1200&auto=format&fit=crop"
              alt="Close-up of healthy green leaves"
              className="h-56 w-full object-cover"
              loading="lazy"
            />
            <div className="p-6">
              <h3 className="font-semibold">Preview the virtual field unit</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#9CA3AF]">
                Soil moisture, temperature, humidity, solar power, connectivity, and pump
                states — all simulated to show how the future COCO BOT unit is intended to behave.
              </p>
              <Link to="/robot" className="clay-btn clay-btn-outline mt-4 inline-flex px-5 py-2.5 text-sm">
                Open Virtual COCO BOT
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
