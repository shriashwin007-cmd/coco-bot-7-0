import { useCallback, useEffect, useRef, useState } from 'react'
import {
  UploadCloud,
  ImagePlus,
  Loader2,
  RotateCcw,
  FlaskConical,
  CircleCheck,
  TriangleAlert,
  Info,
} from 'lucide-react'
import Badge from '../components/ui/Badge'
import AssemblyButton from '../components/ui/AssemblyButton'
import {
  analyzeImage,
  checkBackendHealth,
  createDemoAnalysis,
  getAiApiUrl,
} from '../services/aiService'
import type { AIAnalysisResult, ScanRecord } from '../types'
import { addScan } from '../utils/storage'
import { generateId } from '../utils/id'
import { formatScore } from '../utils/format'

const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_MB = 8

function fileError(file: File): string | null {
  if (!ACCEPTED.includes(file.type)) return 'Unsupported file type. Please use JPG, PNG, or WEBP.'
  if (file.size > MAX_MB * 1024 * 1024) return `File too large. Maximum size is ${MAX_MB} MB.`
  if (file.size === 0) return 'This file appears to be empty.'
  return null
}

const outlineBtn =
  'pill border border-[#2a1f14]/35 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] hover:bg-[#2a1f14]/5'

export default function DoctorPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AIAnalysisResult | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [backend, setBackend] = useState<{ ok: boolean; backend?: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    checkBackendHealth().then(setBackend)
  }, [])

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const pickFile = useCallback(
    (f: File | undefined) => {
      setError(null)
      setResult(null)
      setSavedId(null)
      if (!f) return
      const err = fileError(f)
      if (err) {
        setError(err)
        return
      }
      if (preview) URL.revokeObjectURL(preview)
      setFile(f)
      setPreview(URL.createObjectURL(f))
    },
    [preview],
  )

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please choose a leaf photo first.')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    setSavedId(null)
    try {
      const r = await analyzeImage(file)
      setResult(r)
      const health = await checkBackendHealth()
      setBackend(health)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemo = () => {
    if (!file && !preview) {
      setError('Demo mode still needs a photo for the preview — choose any leaf image first.')
      return
    }
    setError(null)
    setSavedId(null)
    setResult(createDemoAnalysis())
  }

  const handleSave = () => {
    if (!result) return
    const record: ScanRecord = {
      id: generateId('scan'),
      createdAt: new Date().toISOString(),
      filename: file?.name,
      thumbnail: preview ?? undefined,
      predictedLabel: result.predicted_label,
      status: result.status,
      modelScore: result.model_score,
      explanation: result.explanation,
      recommendedNextStep: result.recommended_next_step,
      source: result.analysis_source,
    }
    addScan(record)
    setSavedId(record.id)
  }

  const handleReset = () => {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
    setSavedId(null)
  }

  const apiUrl = getAiApiUrl()

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Offering panel */}
      <div className="card-paper p-6 sm:p-7">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#8a6a4d]">The Offering</p>
        <h2 className="font-display mt-1 text-3xl font-light tracking-tight">Present a leaf</h2>
        <p className="mt-1 text-sm text-[#3a2c1e]/75">
          Clear daylight portraits of a single leaf read best. JPG, PNG, or WEBP up to {MAX_MB} MB.
        </p>

        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            pickFile(e.dataTransfer.files?.[0])
          }}
          onClick={() => inputRef.current?.click()}
          className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
            dragOver ? 'border-[#2a1f14] bg-[#2a1f14]/5' : 'border-[#8a6a4d]/60 hover:border-[#2a1f14]'
          }`}
        >
          <UploadCloud className="h-9 w-9 text-[#2a1f14]" />
          <p className="font-display mt-3 text-xl">Lay your photograph here</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-[#6f5f4c]">or</p>
          <span className={`${outlineBtn} mt-2 inline-flex items-center gap-2`}>
            <ImagePlus className="h-4 w-4" /> Browse image
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
        </div>

        {preview && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-[#8a6a4d]/40">
            <img src={preview} alt="Uploaded leaf preview" className="max-h-80 w-full object-cover" />
            {file && (
              <p className="truncate border-t border-[#8a6a4d]/30 bg-[#2a1f14]/5 px-4 py-2 text-xs text-[#6f5f4c]">
                {file.name} · {(file.size / 1024).toFixed(0)} KB
              </p>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2.5">
          <AssemblyButton
            label={loading ? 'Reading' : 'Analyze Plant'}
            onClick={handleAnalyze}
            disabled={!file || loading}
            loading={loading}
            variant="dark"
            arrow={!loading}
            className="flex-1 justify-center"
          />
          <button
            onClick={handleDemo}
            disabled={loading}
            className={outlineBtn}
            title="Illustrative example only — not a real analysis"
          >
            <FlaskConical className="h-4 w-4" /> Demo
          </button>
          {(file || result) && (
            <button onClick={handleReset} disabled={loading} className={outlineBtn}>
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          )}
        </div>

        <div className="panel-inset mt-4 p-3.5 text-xs text-[#3a2c1e]/80">
          {backend === null ? (
            <span>Consulting the AI service…</span>
          ) : backend.ok ? (
            <span className="font-semibold text-[#3d471f]">
              ● The service answers{backend.backend ? ` (${backend.backend})` : ''}. Findings will bear the REAL AI seal.
            </span>
          ) : (
            <span>
              ○ No service heard at {apiUrl}. Locally, run the backend and retry; on the
              deployed site the built-in /api route is used. Or proceed with the labelled demo.
            </span>
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-[#a4442e]/50 bg-[#a4442e]/10 p-4 text-sm text-[#7c3121]">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* Reading panel */}
      <div className="card-paper p-6 sm:p-7">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#8a6a4d]">The Reading</p>
        <h2 className="font-display mt-1 text-3xl font-light tracking-tight">What the leaves say</h2>
        {!result && !loading && (
          <div className="panel-inset mt-4 p-8 text-center">
            <Info className="mx-auto h-8 w-8 text-[#8a6a4d]" />
            <p className="mx-auto mt-3 max-w-sm text-sm text-[#3a2c1e]/75">
              Silence, so far. Present a photograph and press{' '}
              <strong className="text-[#2a1f14]">Analyze Plant</strong> for a true reading, or{' '}
              <strong className="text-[#2a1f14]">Demo</strong> for a labelled illustration.
            </p>
          </div>
        )}
        {loading && (
          <div className="panel-inset mt-4 flex flex-col items-center p-10 text-center">
            <Loader2 className="h-9 w-9 animate-spin text-[#2a1f14]" />
            <p className="font-display mt-3 text-xl">Reading the green…</p>
            <p className="mt-1 text-xs text-[#6f5f4c]">Weighing green against discoloured regions. A few seconds.</p>
          </div>
        )}
        {result && (
          <div className="animate-slide-up mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge value={result.status} />
              <Badge value={result.analysis_source} size="sm" />
            </div>
            <h3 className="font-display mt-3 text-3xl font-light capitalize leading-tight">{result.predicted_label}</h3>

            <div className="panel-inset mt-4 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#6f5f4c]">Model score</span>
                <span className="font-display text-3xl text-[#3d471f]">{formatScore(result.model_score)}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-[#6f5f4c]">{result.score_description}</p>
              {result.metrics && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                  {[
                    { k: 'Green', v: `${Math.round(result.metrics.green_ratio * 100)}%` },
                    { k: 'Yellow', v: `${Math.round(result.metrics.yellow_ratio * 100)}%` },
                    { k: 'Brown', v: `${Math.round(result.metrics.brown_ratio * 100)}%` },
                    { k: 'Leaf fill', v: `${Math.round(result.metrics.leaf_coverage * 100)}%` },
                  ].map((m) => (
                    <div key={m.k} className="rounded-xl border border-[#8a6a4d]/35 bg-[#fffdf6]/60 px-2.5 py-2 text-center">
                      <p className="font-display text-lg text-[#2a1f14]">{m.v}</p>
                      <p className="text-[#6f5f4c]">{m.k}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="panel-inset mt-3 p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#6f5f4c]">
                {result.status === 'healthy' ? (
                  <CircleCheck className="h-3.5 w-3.5 text-[#3d471f]" />
                ) : (
                  <TriangleAlert className="h-3.5 w-3.5 text-[#8a5d1c]" />
                )}
                The explanation
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#3a2c1e]">{result.explanation}</p>
            </div>

            <div className="mt-3 rounded-2xl border border-[#55622e]/50 bg-[#55622e]/10 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#3d471f]">Counselled next step</p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#33401b]">{result.recommended_next_step}</p>
            </div>

            {result.analysis_source === 'DEMO' ? (
              <p className="mt-3 text-xs font-medium text-[#6d3d5c]">
                A DEMO illustration — not computed from your photograph. Do not act upon it.
              </p>
            ) : (
              <p className="mt-3 text-xs text-[#6f5f4c]">
                A REAL AI finding from pixel analysis. Healthy vs needs-inspection only — no
                disease is named. Have uncertain cases confirmed by an expert.
              </p>
            )}

            {savedId ? (
              <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#3d471f]">
                <CircleCheck className="h-4 w-4" /> Entered into the ledger — see Dashboard and History.
              </p>
            ) : (
              <AssemblyButton
                label="Save Report"
                onClick={handleSave}
                variant="dark"
                className="mt-4 w-full justify-center"
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
