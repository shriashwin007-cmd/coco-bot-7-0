import { Code2, Mail, Cpu, Database, Map, Shield, ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card, { CardSection } from '../components/ui/Card'
import Button from '../components/ui/Button'

const stack = [
  'React with Vite and TypeScript',
  'Tailwind CSS v4 (CSS-first config)',
  'React Router v7',
  'Recharts for analytics',
  'Leaflet / React Leaflet + OpenStreetMap',
  'localStorage for demo persistence',
]

const features = [
  { icon: Cpu, title: 'AI-ready architecture', text: 'A documented adapter in src/services/aiService.ts targets a future Python FastAPI endpoint. Swap the URL, keep the UI.' },
  { icon: Database, title: 'Local-first demo data', text: 'All sample records are clearly labelled DEMO and can be loaded or cleared in one click from the Dashboard.' },
  { icon: Map, title: 'Geospatial insights', text: 'Illustrative hotspot and bin markers plus optional manual locations help teams plan routes.' },
  { icon: Shield, title: 'No fabricated predictions', text: 'Confidence scores and waste categories only appear when the AI backend actually provides them.' },
]

export default function AboutPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card title="About TrashBots" subtitle="AI-powered smart waste management for cleaner cities." action={
        <Link to="/scanner"><Button size="sm" iconRight={<ArrowRight className="h-3.5 w-3.5" />}>Try the scanner</Button></Link>
      }>
        <CardSection>
          <p className="max-w-3xl text-sm leading-relaxed text-[#9CA3AF]">
            TrashBots is an AI-powered smart waste management platform designed for cities and
            sanitation teams. It identifies litter in street images, highlights waste hotspots, and
            helps prioritize cleanup operations through an operational dashboard.
          </p>
          <p className="max-w-3xl text-sm leading-relaxed text-[#9CA3AF]">
            This is a demonstration build. AI analysis runs only when an external backend is
            connected via <code className="rounded bg-[#0F1512] border border-[#223027] px-1.5 py-0.5 text-[#B7F34A] text-xs">VITE_AI_API_URL</code>.
            Otherwise, clearly labelled demonstration analyses are available.
          </p>
        </CardSection>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        {features.map((f) => (
          <Card key={f.title} title={f.title} hoverable>
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center clay-icon-tile text-[#B7F34A]">
                <f.icon className="h-5 w-5" />
              </div>
              <p className="text-sm leading-relaxed text-[#9CA3AF]">{f.text}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Technology stack" subtitle="Modern, maintainable, production-ready tooling.">
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {stack.map((s) => (
            <li key={s} className="clay-chip flex items-center gap-2.5 rounded-2xl border border-[#223027] bg-[#0F1512] px-4 py-3 text-sm font-medium text-[#F5F7F6]">
              <Check className="h-4 w-4 shrink-0 text-[#B7F34A]" />
              {s}
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Future AI backend integration" subtitle="Drop-in contract — no frontend rewrite needed.">
        <div className="rounded-xl border border-[#223027] bg-[#0B0F0D] p-4 font-mono text-xs leading-relaxed overflow-x-auto">
          <p className="text-[#B7F34A]">POST {'{VITE_AI_API_URL}'}/analyze</p>
          <p className="mt-2 text-[#9CA3AF]">Content-Type: multipart/form-data · field: <span className="text-[#F5F7F6]">file</span></p>
          <p className="mt-2 text-[#6B7280]">{`{ "cleanliness": "clean | moderately_littered | heavily_littered",`}</p>
          <p className="text-[#6B7280]">{`  "severity": "low | medium | high", "confidence": number | null, … }`}</p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-[#9CA3AF]">
          The frontend validates every response, enforces a 30s timeout, and surfaces clear errors for
          network failures, invalid JSON, and missing fields. See <code className="text-[#B7F34A]">.env.example</code> for the template.
        </p>
      </Card>

      <Card title="Contact">
        <div className="flex flex-wrap gap-3">
          <a href="#" className="inline-flex items-center gap-2 rounded-xl border border-[#2A3A30] bg-[#0F1512] px-4 py-2.5 text-sm text-[#9CA3AF] hover:text-[#F5F7F6] hover:border-[#B7F34A4D] transition-colors">
            <Code2 className="h-4 w-4" /> Repository
          </a>
          <a href="#" className="inline-flex items-center gap-2 rounded-xl border border-[#2A3A30] bg-[#0F1512] px-4 py-2.5 text-sm text-[#9CA3AF] hover:text-[#F5F7F6] hover:border-[#B7F34A4D] transition-colors">
            <Mail className="h-4 w-4" /> team@trashbots.example
          </a>
        </div>
      </Card>
    </div>
  )
}
