import { Sprout, Sun, Droplets, Cpu, Recycle, Stethoscope, Server, Database } from 'lucide-react'
import AssemblyButton from '../components/ui/AssemblyButton'

const blocks = [
  {
    icon: Stethoscope,
    numeral: 'I.',
    title: 'What stands today',
    sub: 'The working software',
    items: [
      'A leaf photograph, offered by drag or by browse, with validation, portrait preview, and plain-spoken errors',
      'True pixel-colour inference: green, yellow, brown, and dark regions weighed into a greenness index',
      'Only honest verdicts — healthy or needs-inspection; no disease is ever named',
      'Every finding carries its explanation, the meaning of its score, and cautious counsel',
      'Dashboard and history counted from records kept in your browser',
    ],
  },
  {
    icon: Cpu,
    numeral: 'II.',
    title: 'What is intended',
    sub: 'The full invention, hereafter',
    items: [
      'A solar-fed autonomous unit walking the crop rows on its own',
      'Soil, air, and humidity sensing, reported by Wi-Fi or LoRa',
      'A second photographic look at flagged plants, and precise antifungal or nutrient doses',
      'All such behaviour on this site is rehearsal — no mechanism is joined',
    ],
  },
  {
    icon: Recycle,
    numeral: 'III.',
    title: 'Its pact with the soil',
    sub: 'Why this matters',
    items: [
      'Early visual screening spends attention where it is owed',
      'Aimed future dosing would replace the blanket spraying of whole fields',
      'Season-long records favour decisions of data over decisions of habit',
      'A solar-first design keeps the work in the field light of footprint',
    ],
  },
]

export default function AboutPage() {
  return (
    <div className="grid gap-4">
      <div className="card-espresso p-6 sm:p-10">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#f4ecdd]/25 bg-[#f4ecdd]/10">
          <Sprout className="h-6 w-6 text-[#f4ecdd]" />
        </span>
        <h2 className="font-display mt-4 max-w-2xl text-4xl font-light leading-tight tracking-tight sm:text-5xl">
          COCO BOT 7.0, <em>Smart Autonomous Crop Guardian</em>
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#f4ecdd]/75">
          The proposal: an AI-guided, sun-fed field companion that watches the rows,
          photographs the leaves, marks the first signs of weariness, and — in the full
          vision — treats precisely where treatment is owed. This site is the{' '}
          <strong className="text-[#f4ecdd]">demonstration phase</strong> of that proposal:
          the mind works truly upon photographs, while the body is shown in rehearsal.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Server, t: 'A speaking service', d: 'POST /analyze returns verdict, standing, score, reasoning, and counsel' },
            { icon: Database, t: 'A kept ledger', d: 'Scan history in the browser; figures derived, never dictated' },
            { icon: Sun, t: 'A sunward concept', d: 'Imagined panels, sensors, and pumps preview the hardware vision' },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-[#f4ecdd]/15 bg-black/20 p-4">
              <c.icon className="h-5 w-5 text-[#d3b78f]" />
              <p className="mt-2 text-sm font-semibold text-[#f4ecdd]">{c.t}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-[#f4ecdd]/65">{c.d}</p>
            </div>
          ))}
        </div>
      </div>

      {blocks.map((b) => (
        <div key={b.title} className="card-paper p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="font-display text-3xl font-light text-[#8a6a4d]">{b.numeral}</span>
            <div>
              <h3 className="font-display flex items-center gap-2 text-2xl font-light tracking-tight">
                <b.icon className="h-5 w-5 text-[#8a6a4d]" /> {b.title}
              </h3>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#6f5f4c]">{b.sub}</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2.5">
            {b.items.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-[#3a2c1e]">
                <Droplets className="mt-1 h-3.5 w-3.5 shrink-0 text-[#8a6a4d]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="card-paper p-8 text-center">
        <p className="font-display text-2xl font-light italic">The assembly awaits your leaf.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2.5">
          <AssemblyButton to="/doctor" label="AI Plant Doctor" variant="dark" />
          <AssemblyButton to="/dashboard" label="Farm Dashboard" variant="outline" arrow={false} />
        </div>
      </div>
    </div>
  )
}
