import { useState } from 'react'
import {
  Droplets,
  Thermometer,
  Wind,
  Leaf,
  Sun,
  Radio,
  SprayCan,
  FlaskConical,
  Play,
  Loader2,
} from 'lucide-react'
import Badge from '../components/ui/Badge'
import { loadBotState, runMonitoringCycle } from '../utils/simulation'

export default function VirtualBotPage() {
  const [state, setState] = useState(loadBotState)
  const [running, setRunning] = useState(false)
  const [log, setLog] = useState<string[]>([])

  const handleCycle = () => {
    setRunning(true)
    setLog(['The rite begins — a simulated round of the rows…'])
    window.setTimeout(() => {
      const { state: next, log: lines } = runMonitoringCycle()
      setState(next)
      setLog(lines)
      setRunning(false)
    }, 900)
  }

  const sensors = [
    { icon: Droplets, label: 'Soil moisture', value: `${state.soilMoisture}%`, hint: state.soilMoisture < 35 ? 'Parched — watering counselled' : 'Within the expected measure' },
    { icon: Thermometer, label: 'Temperature', value: `${state.temperature}°C`, hint: 'Air among the canopy' },
    { icon: Wind, label: 'Humidity', value: `${state.humidity}%`, hint: state.humidity > 78 ? 'Heavy — a watch for mould' : 'Within the expected measure' },
    { icon: Leaf, label: 'Plant health', value: state.plantHealth, hint: 'A reading of the simulated signs' },
    { icon: Sun, label: 'Solar power', value: `${state.solarPower} · ${state.solarWatts} W`, hint: 'Imagined panel intake' },
    { icon: Radio, label: 'Signal', value: state.connectivity, hint: 'An imagined link' },
  ]

  return (
    <div>
      <div className="card-paper flex flex-wrap items-center gap-2 p-4 text-sm">
        <Badge value="simulated" />
        <p className="text-[#3a2c1e]/80">
          Every measure and mechanism on this page is <strong className="text-[#2a1f14]">simulated</strong> —
          a rehearsal of the intended machine. Nothing here touches true equipment.
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sensors.map((s) => (
          <div key={s.label} className="card-paper p-5">
            <s.icon className="h-5 w-5 text-[#8a6a4d]" />
            <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#6f5f4c]">{s.label} · imagined</p>
            <p className="font-display mt-1 text-2xl font-light leading-snug">{s.value}</p>
            <p className="mt-0.5 text-xs text-[#6f5f4c]">{s.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="card-paper p-5 sm:p-6">
          <h3 className="font-display text-2xl font-light tracking-tight">The mechanisms</h3>
          <p className="text-xs text-[#6f5f4c]">Pumps change their state only within the rehearsal.</p>
          <div className="mt-4 space-y-2.5">
            {[
              { icon: SprayCan, label: 'Antifungal pump', value: state.antifungalPump },
              { icon: FlaskConical, label: 'Nutrient pump', value: state.nutrientPump },
            ].map((d) => (
              <div key={d.label} className="panel-inset flex items-center justify-between px-4 py-3">
                <span className="flex items-center gap-2.5 text-sm font-semibold">
                  <d.icon className="h-4 w-4 text-[#8a6a4d]" /> {d.label}{' '}
                  <span className="text-[10px] font-normal uppercase tracking-[0.18em] text-[#6f5f4c]">(imagined)</span>
                </span>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold tracking-widest ${
                    d.value === 'ON'
                      ? 'border-[#55622e]/55 bg-[#55622e]/15 text-[#3d471f]'
                      : 'border-[#8a6a4d]/40 bg-black/5 text-[#6f5f4c]'
                  }`}
                >
                  {d.value}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={handleCycle}
            disabled={running}
            className="pill pill-dark mt-4 w-full items-center justify-center px-5 py-3.5 text-xs font-bold uppercase tracking-[0.2em]"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? 'Walking the rows…' : 'Begin a simulated round'}
          </button>
          <p className="mt-2 text-xs text-[#6f5f4c]">
            {state.lastCycle ? `Last rehearsal: ${state.lastCycle}` : 'No round yet walked in this browser.'} This
            button moves figures only — no true mechanism stirs.
          </p>
        </div>

        <div className="card-espresso p-5 sm:p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#f4ecdd]/60">The chronicle</p>
          <h3 className="font-display mt-1 text-2xl font-light tracking-tight">What the round reported</h3>
          <div className="mt-4 min-h-40 rounded-2xl border border-[#f4ecdd]/15 bg-black/25 p-4 font-mono text-xs leading-relaxed">
            {log.length === 0 ? (
              <span className="text-[#f4ecdd]/50">
                Nothing yet inscribed. Begin a simulated round to fill this chronicle.
              </span>
            ) : (
              <ul className="space-y-1.5">
                {log.map((line, i) => (
                  <li key={i} className="text-[#f4ecdd]/85">
                    <span className="text-[#d3b78f]">›</span> {line}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
