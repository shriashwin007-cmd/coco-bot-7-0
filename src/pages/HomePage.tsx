import { Link } from 'react-router-dom'
import {
  Stethoscope,
  LayoutDashboard,
  ScanLine,
  Droplets,
  TriangleAlert,
  FlaskConical,
  Sprout,
} from 'lucide-react'

const LEAF_IMG =
  'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=1200&auto=format&fit=crop'
const FIELD_IMG =
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=800&auto=format&fit=crop'
const FARMER_IMG =
  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=800&auto=format&fit=crop'

const capabilities = [
  {
    numeral: 'I.',
    title: 'Leaf-photo AI analysis',
    text: 'Offer a leaf photograph. The backend weighs green against discoloured pixels and returns a genuine reading — healthy, or in need of inspection.',
  },
  {
    numeral: 'II.',
    title: 'A ledger of fields',
    text: 'Every saved scan joins the dashboard: living totals, health shares, activity across days, and recent alerts. Counted from your records, never invented.',
  },
  {
    numeral: 'III.',
    title: 'The machine, foreshadowed',
    text: 'The proposed solar field unit — soil, air, light, and pumps — is previewed as a clearly labelled simulation of what is intended.',
  },
]

const pipeline = [
  { numeral: '1', title: 'Photograph', text: 'One leaf, in clear daylight.' },
  { numeral: '2', title: 'Analyze', text: 'Pixel-colour analysis computes a greenness index.' },
  { numeral: '3', title: 'Consider', text: 'Read the explanation and the suggested next step.' },
  { numeral: '4', title: 'Record', text: 'Save the report; dashboard and history follow.' },
]

export default function HomePage() {
  return (
    <div>
      {/* ————— Hero in the assembly format ————— */}
      <section className="relative overflow-hidden pt-32 sm:pt-36">
        <div
          className="orbit left-1/2 top-24 h-[130vw] w-[130vw] -translate-x-1/2 sm:h-[92vw] sm:w-[92vw]"
          aria-hidden
        />

        <p className="animate-rise relative z-20 text-center text-[11px] font-bold uppercase tracking-[0.34em] text-[#f7f1e3]/85">
          Imagine Possible · Smart Farming
        </p>

        <div className="relative mx-auto mt-2 max-w-[1400px] px-4 text-center">
          <h1 className="hero-display">
            <span className="animate-rise-1 relative z-20 block">Healthy</span>
            <span className="animate-rise-2 relative z-0 block">Leaves</span>
          </h1>

          <div className="animate-rise-2 relative z-10 mx-auto -mt-[5vw] w-[min(540px,74vw)]">
            <div className="arch overflow-hidden border border-[#f7f1e3]/40 shadow-[0_40px_80px_-30px_rgba(42,31,20,0.7)]">
              <img
                src={LEAF_IMG}
                alt="Close-up of green leaves"
                className="aspect-[4/5] w-full object-cover"
                loading="eager"
              />
            </div>
            <p className="font-display mt-4 text-xl font-light italic text-[#f7f1e3] sm:text-2xl">
              Observation
              <br />
              Precedes Treatment
            </p>
            <Link
              to="/doctor"
              className="pill pill-cream mt-4 px-7 py-3 text-xs font-bold uppercase tracking-[0.22em]"
            >
              Analyze a Leaf
            </Link>
          </div>

          <span className="hero-display animate-rise-3 relative z-20 -mt-[7vw] block">First</span>

          {/* Scattered captions */}
          <p className="absolute left-[6%] top-[38%] hidden max-w-[150px] text-left text-xs font-bold leading-relaxed text-[#2a1f14] lg:block">
            An Open Guardian
            <br />
            for Growers
          </p>
          <p className="absolute right-[7%] top-[24%] hidden max-w-[150px] text-right text-xs font-bold leading-relaxed text-[#2a1f14] lg:block">
            Coordinates:
            <br />
            Your Fields
          </p>
        </div>

        {/* Tilted side cards */}
        <div className="tilt-l absolute -left-10 bottom-6 hidden w-52 overflow-hidden rounded-2xl border border-[#f7f1e3]/40 shadow-xl md:block lg:w-64" aria-hidden>
          <img src={FIELD_IMG} alt="" className="aspect-[3/4] w-full object-cover" loading="lazy" />
          <span className="font-display absolute left-3 top-2 text-2xl font-light text-[#f7f1e3]">P.</span>
        </div>
        <div className="tilt-r absolute -right-10 bottom-6 hidden w-52 overflow-hidden rounded-2xl border border-[#f7f1e3]/40 shadow-xl md:block lg:w-64" aria-hidden>
          <img src={FARMER_IMG} alt="" className="aspect-[3/4] w-full object-cover" loading="lazy" />
          <span className="font-display absolute right-3 top-2 text-2xl font-light text-[#2a1f14]">G.</span>
        </div>

        <div className="h-16 sm:h-24" />
      </section>

      {/* ————— Statement ————— */}
      <section className="mx-auto max-w-[1200px] px-5 py-14 sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#2a1f14]/70">
          <span className="inline-flex items-center gap-2">
            <FlaskConical className="h-3.5 w-3.5" /> A software demonstration — no machine connected
          </span>
        </p>
        <h2 className="font-display mt-4 max-w-3xl text-4xl font-light leading-tight tracking-tight sm:text-6xl">
          Intelligent plant care, <em>smarter</em> farming.
        </h2>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[#3a2c1e]/85">
          COCO BOT 7.0 is a proposed AI crop guardian. This site demonstrates its mind: a
          leaf photograph becomes an honest healthy-or-needs-inspection reading, with the
          reasoning shown. The future solar field robot is previewed as simulation — and
          labelled as such, wherever it appears.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/doctor" className="pill pill-dark px-7 py-3.5 text-xs font-bold uppercase tracking-[0.22em]">
            <Stethoscope className="h-4 w-4" /> AI Plant Doctor
          </Link>
          <Link to="/dashboard" className="pill pill-cream px-7 py-3.5 text-xs font-bold uppercase tracking-[0.22em]">
            <LayoutDashboard className="h-4 w-4" /> Farm Dashboard
          </Link>
        </div>
      </section>

      {/* ————— Capabilities ————— */}
      <section className="mx-auto max-w-[1200px] px-5 pb-14 sm:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {capabilities.map((c) => (
            <article key={c.numeral} className="card-paper p-7">
              <div className="flex items-center justify-between">
                <span className="font-display text-3xl font-light">{c.numeral}</span>
                {c.numeral === 'I.' ? (
                  <ScanLine className="h-5 w-5 text-[#8a6a4d]" />
                ) : c.numeral === 'II.' ? (
                  <LayoutDashboard className="h-5 w-5 text-[#8a6a4d]" />
                ) : (
                  <Droplets className="h-5 w-5 text-[#8a6a4d]" />
                )}
              </div>
              <h3 className="font-display mt-4 text-2xl font-normal tracking-tight">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#3a2c1e]/80">{c.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ————— The rite of scanning ————— */}
      <section className="mx-auto max-w-[1200px] px-5 pb-14 sm:px-8">
        <div className="card-espresso p-7 sm:p-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#f4ecdd]/70">The Rite of Scanning</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pipeline.map((p) => (
              <div key={p.numeral} className="border-t border-[#f4ecdd]/25 pt-4">
                <span className="font-display text-5xl font-light text-[#f4ecdd]/90">{p.numeral}</span>
                <h3 className="font-display mt-2 text-xl">{p.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#f4ecdd]/70">{p.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#b97f2e]/60 bg-[#b97f2e]/15 p-4 text-sm text-[#f4e3c2]">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Counsel here is suggestive, never a cure. Whatever is flagged for inspection
              should be confirmed by an agronomist or plant clinic before any treatment.
            </p>
          </div>
        </div>
      </section>

      {/* ————— Two plates ————— */}
      <section className="mx-auto max-w-[1200px] px-5 pb-16 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="card-paper overflow-hidden">
            <div className="overflow-hidden">
              <img src={FARMER_IMG} alt="Grower walking the rows" className="h-60 w-full object-cover" loading="lazy" />
            </div>
            <div className="p-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#8a6a4d]">Plate IV.</p>
              <h3 className="font-display mt-1 text-3xl font-light tracking-tight">For lasting agriculture</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#3a2c1e]/80">
                Early visual screening directs attention where it is owed, spares preventive
                chemistry, and keeps a season-long record of the canopy.
              </p>
              <Link to="/about" className="pill pill-dark mt-5 px-6 py-3 text-xs font-bold uppercase tracking-[0.22em]">
                Read the Doctrine
              </Link>
            </div>
          </div>
          <div className="card-paper overflow-hidden">
            <div className="overflow-hidden">
              <img src={FIELD_IMG} alt="Sunlit crop field" className="h-60 w-full object-cover" loading="lazy" />
            </div>
            <div className="p-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#8a6a4d]">Plate V.</p>
              <h3 className="font-display mt-1 text-3xl font-light tracking-tight">Behold the virtual unit</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#3a2c1e]/80">
                Soil, air, sunlight, signal, and pump states — every one simulated, to show
                how the future COCO BOT means to behave in the rows.
              </p>
              <Link to="/robot" className="pill pill-dark mt-5 px-6 py-3 text-xs font-bold uppercase tracking-[0.22em]">
                <Sprout className="h-4 w-4" /> Enter the Simulation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
