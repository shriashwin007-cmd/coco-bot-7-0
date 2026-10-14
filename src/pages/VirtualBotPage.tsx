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
    setLog(['Starting simulated monitoring cycle…'])
    // Small staged delay so the demo feels like a real cycle, without blocking.
    window.setTimeout(() => {
      const { state: next, log: lines } = runMonitoringCycle(state)
      setState(next)
      setLog(lines)
      setRunning(false)
    }, 900)
  }

  const sensors = [
    { icon: Droplets, label: 'Soil moisture', value: `${state.soilMoisture}%`, hint: state.soilMoisture < 35 ? 'Dry — irrigation suggested' : 'Within expected range' },
    { icon: Thermometer, label: 'Temperature', value: `${state.temperature}°C`, hint: 'Canopy air temperature' },
    { icon: Wind, label: 'Humidity', value: `${state.humidity}%`, hint: state.humidity > 78 ? 'High — fungal-risk watch' : 'Within expected range' },
    { icon: Leaf, label: 'Plant health status', value: state.plantHealth, hint: 'Interpretation of simulated readings' },
    { icon: Sun, label: 'Solar power', value: `${state.solarPower} · ${state.solarWatts} W`, hint: 'Simulated panel input' },
    { icon: Radio, label: 'Connectivity', value: state.connectivity, hint: 'Simulated link state' },
  ]

  return (
    <div>
      <div className="clay flex flex-wrap items-center gap-2 p-4 text-sm">
        <Badge value="simulated" />
        <p className="text-[#9CA3AF]">
          Every reading and device state on this page is <strong className="text-white">simulated</strong> to
          demonstrate the intended COCO BOT hardware. Nothing here reads or controls real equipment.
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sensors.map((s) => (
          <div key={s.label} className="clay p-5">
            <span className="clay-icon-tile inline-flex h-10 w-10 items-center justify-center">
              <s.icon className="h-5 w-5 text-[#B7F34A]" />
            </span>
            <p className="mt-3 text-xs uppercase tracking-wide text-[#9CA3AF]">{s.label} · simulated</p>
            <p className="mt-1 font-semibold leading-snug">{s.value}</p>
            <p className="mt-0.5 text-xs text-[#6B7280]">{s.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="clay p-5">
          <h3 className="font-semibold">Virtual device states</h3>
          <p className="text-xs text-[#9CA3AF]">Pump states change only inside the simulation.</p>
          <div className="mt-4 space-y-2.5">
            {[
              { icon: SprayCan, label: 'Antifungal pump', value: state.antifungalPump },
              { icon: FlaskConical, label: 'Nutrient pump', value: state.nutrientPump },
            ].map((d) => (
              <div
                key={d.label}
                className="flex items-center justify-between rounded-2xl border border-[#223027] bg-[#0B0F0D]/60 px-4 py-3"
              >
                <span className="flex items-center gap-2.5 text-sm font-medium">
                  <d.icon className="h-4 w-4 text-[#B7F34A]" /> {d.label}{' '}
                  <span className="text-[10px] text-[#6B7280]">(simulated)</span>
                </span>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${
                    d.value === 'ON'
                      ? 'border-[#B7F34A4D] bg-[#B7F34A1A] text-[#B7F34A]'
                      : 'border-[#223027] bg-[#141A17] text-[#6B7280]'
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
            className="clay-btn clay-btn-primary mt-4 inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-sm disabled:opacity-60"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? 'Running simulated cycle…' : 'Run simulated monitoring cycle'}
          </button>
          <p className="mt-2 text-xs text-[#6B7280]">
            {state.lastCycle ? `Last simulated cycle: ${state.lastCycle}` : 'No cycle run yet in this browser.'} This
            button only updates the simulation — it does not operate hardware.
          </p>
        </div>

        <div className="clay p-5">
          <h3 className="font-semibold">Cycle log</h3>
          <p className="text-xs text-[#9CA3AF]">Step-by-step record of the latest simulation run.</p>
          <div className="mt-4 min-h-40 rounded-2xl border border-[#223027] bg-[#0B0F0D]/80 p-4 font-mono text-xs leading-relaxed">
            {log.length === 0 ? (
              <span className="text-[#6B7280]">
                No cycle run yet. Press “Run simulated monitoring cycle” to generate a log.
              </span>
            ) : (
              <ul className="space-y-1.5">
                {log.map((line, i) => (
                  <li key={i} className="text-[#D1D5DB]">
                    <span className="text-[#B7F34A]">›</span> {line}
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
