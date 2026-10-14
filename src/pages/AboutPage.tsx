import { Link } from 'react-router-dom'
import { Sprout, Sun, Droplets, Cpu, Recycle, Stethoscope, Server, Database } from 'lucide-react'

const blocks = [
  {
    icon: Stethoscope,
    title: 'What works today (software)',
    items: [
      'Leaf-photo upload with drag & drop, validation, preview, and error handling',
      'Real pixel-colour inference: green / yellow / brown / dark-spot ratios → health index',
      'Honest healthy vs needs-inspection outcomes — no invented disease names',
      'Explanations, score meanings, and cautious next-step guidance on every result',
      'Dashboard and history computed from saved localStorage records',
    ],
  },
  {
    icon: Cpu,
    title: 'Proposed full invention (future hardware)',
    items: [
      'Solar-powered autonomous field unit patrolling crop rows',
      'Soil-moisture, temperature, and humidity sensing with Wi-Fi / LoRa uplink',
      'On-board camera re-scanning flagged plants and targeting antifungal / nutrient pumps',
      'All hardware behaviour on this site is simulated — no devices are connected',
    ],
  },
  {
    icon: Recycle,
    title: 'Sustainability connection',
    items: [
      'Early visual screening focuses attention on plants that need it',
      'Targeted future treatment would replace blanket preventive spraying',
      'Season-long scan records support data-driven, lower-chemical farming',
      'Solar-first power concept keeps field operation low-emission',
    ],
  },
]

export default function AboutPage() {
  return (
    <div className="grid gap-4">
      <div className="clay p-6 sm:p-8">
        <span className="clay-icon-tile inline-flex h-12 w-12 items-center justify-center">
          <Sprout className="h-6 w-6 text-[#B7F34A]" />
        </span>
        <h2 className="mt-4 text-xl font-bold">COCO BOT 7.0 — Smart Autonomous Crop Guardian</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#9CA3AF]">
          COCO BOT 7.0 is a proposed invention: an AI-guided, solar-powered field robot that
          watches over crops, photographs leaves, flags early signs of stress, and — in the
          full vision — applies precise antifungal or nutrient doses only where needed. This
          website is the <strong className="text-white">software demonstration phase</strong> of
          that invention: the AI brain and the farm records work for real on leaf photos, while
          the robot body is shown as a transparent simulation.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Server, t: 'FastAPI inference', d: 'POST /analyze returns label, status, score, explanation, next step' },
            { icon: Database, t: 'Local records', d: 'Scan history in localStorage; stats derived, never hardcoded' },
            { icon: Sun, t: 'Solar concept', d: 'Simulated power, sensors & pumps preview the hardware vision' },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-[#223027] bg-[#0B0F0D]/60 p-4">
              <c.icon className="h-5 w-5 text-[#B7F34A]" />
              <p className="mt-2 text-sm font-semibold">{c.t}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-[#9CA3AF]">{c.d}</p>
            </div>
          ))}
        </div>
      </div>

      {blocks.map((b) => (
        <div key={b.title} className="clay p-6">
          <h3 className="flex items-center gap-2 font-semibold">
            <b.icon className="h-5 w-5 text-[#B7F34A]" /> {b.title}
          </h3>
          <ul className="mt-3 space-y-2">
            {b.items.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-[#D1D5DB]">
                <Droplets className="mt-1 h-3.5 w-3.5 shrink-0 text-[#B7F34A]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="clay p-6 text-center">
        <p className="text-sm text-[#9CA3AF]">Try the working demonstration now.</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2.5">
          <Link to="/doctor" className="clay-btn clay-btn-primary inline-flex px-6 py-3 text-sm">
            AI Plant Doctor
          </Link>
          <Link to="/dashboard" className="clay-btn clay-btn-secondary inline-flex px-6 py-3 text-sm">
            Farm Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
