import { useCallback, useEffect, useRef, useState } from 'react'
import {
  UploadCloud,
  ImagePlus,
  Loader2,
  Save,
  RotateCcw,
  FlaskConical,
  CircleCheck,
  TriangleAlert,
  Info,
} from 'lucide-react'
import Badge from '../components/ui/Badge'
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
      {/* Upload panel */}
      <div className="clay p-6">
        <h2 className="font-semibold">1 · Upload a leaf photo</h2>
        <p className="mt-1 text-sm text-[#9CA3AF]">
          Clear daylight photos of a single leaf work best. JPG, PNG, or WEBP up to {MAX_MB} MB.
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
            dragOver ? 'border-[#B7F34A] bg-[#B7F34A1A]' : 'border-[#2A3A30] hover:border-[#B7F34A66]'
          }`}
        >
          <UploadCloud className="h-9 w-9 text-[#B7F34A]" />
          <p className="mt-3 text-sm font-semibold">Drag & drop your leaf photo here</p>
          <p className="mt-1 text-xs text-[#9CA3AF]">or</p>
          <span className="clay-btn clay-btn-secondary mt-2 inline-flex items-center gap-2 px-5 py-2.5 text-sm">
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
          <div className="mt-4 overflow-hidden rounded-2xl border border-[#223027]">
            <img src={preview} alt="Uploaded leaf preview" className="max-h-80 w-full object-cover" />
            {file && (
              <p className="truncate border-t border-[#223027] bg-[#0B0F0D]/70 px-4 py-2 text-xs text-[#9CA3AF]">
                {file.name} · {(file.size / 1024).toFixed(0)} KB
              </p>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2.5">
          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            className="clay-btn clay-btn-primary inline-flex flex-1 items-center justify-center gap-2 px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            {loading ? 'Analyzing…' : 'Analyze Plant'}
          </button>
          <button
            onClick={handleDemo}
            disabled={loading}
            className="clay-btn clay-btn-outline inline-flex items-center gap-2 px-5 py-3 text-sm"
            title="Illustrative example only — not a real analysis"
          >
            <FlaskConical className="h-4 w-4" /> Demo result
          </button>
          {(file || result) && (
            <button
              onClick={handleReset}
              disabled={loading}
              className="clay-btn clay-btn-secondary inline-flex items-center gap-2 px-4 py-3 text-sm"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          )}
        </div>

        <div className="mt-4 rounded-2xl border border-[#223027] bg-[#0B0F0D]/60 p-3.5 text-xs text-[#9CA3AF]">
          {backend === null ? (
            <span>Checking AI service…</span>
          ) : backend.ok ? (
            <span className="text-[#B7F34A]">
              ● AI service connected{backend.backend ? ` (${backend.backend})` : ''}. Results will be tagged REAL AI.
            </span>
          ) : (
            <span>
              ○ AI service not detected{apiUrl ? ` at ${apiUrl}` : ' (VITE_AI_API_URL not set)'}. Start it with{' '}
              <code className="text-[#D1D5DB]">backend\start-cocobot.bat</code>, or use the labelled demo mode.
            </span>
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-[#EF44444D] bg-[#EF44441A] p-4 text-sm text-[#FECACA]">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* Results panel */}
      <div className="clay p-6">
        <h2 className="font-semibold">2 · AI result</h2>
        {!result && !loading && (
          <div className="mt-4 rounded-2xl border border-[#223027] bg-[#0B0F0D]/60 p-8 text-center">
            <Info className="mx-auto h-8 w-8 text-[#6B7280]" />
            <p className="mt-3 text-sm text-[#9CA3AF]">
              No analysis yet. Upload a photo and click <strong className="text-white">Analyze Plant</strong> for a
              real reading, or <strong className="text-white">Demo result</strong> for a labelled example.
            </p>
          </div>
        )}
        {loading && (
          <div className="mt-4 flex flex-col items-center rounded-2xl border border-[#223027] bg-[#0B0F0D]/60 p-10 text-center">
            <Loader2 className="h-9 w-9 animate-spin text-[#B7F34A]" />
            <p className="mt-3 text-sm font-medium">Analyzing leaf pixels…</p>
            <p className="mt-1 text-xs text-[#9CA3AF]">Measuring green vs discoloured areas. Usually a few seconds.</p>
          </div>
        )}
        {result && (
          <div className="animate-slide-up mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge value={result.status} />
              <Badge value={result.analysis_source} size="sm" />
            </div>
            <h3 className="mt-3 text-lg font-bold capitalize leading-snug">{result.predicted_label}</h3>

            <div className="mt-4 rounded-2xl border border-[#223027] bg-[#0B0F0D]/60 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#9CA3AF]">Model score</span>
                <span className="text-lg font-bold text-[#B7F34A]">{formatScore(result.model_score)}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-[#6B7280]">{result.score_description}</p>
              {result.metrics && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                  {[
                    { k: 'Green', v: `${Math.round(result.metrics.green_ratio * 100)}%` },
                    { k: 'Yellow', v: `${Math.round(result.metrics.yellow_ratio * 100)}%` },
                    { k: 'Brown', v: `${Math.round(result.metrics.brown_ratio * 100)}%` },
                    { k: 'Leaf fill', v: `${Math.round(result.metrics.leaf_coverage * 100)}%` },
                  ].map((m) => (
                    <div key={m.k} className="rounded-xl border border-[#223027] px-2.5 py-2 text-center">
                      <p className="font-bold text-white">{m.v}</p>
                      <p className="text-[#6B7280]">{m.k}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-3 rounded-2xl border border-[#223027] bg-[#0B0F0D]/60 p-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                {result.status === 'healthy' ? (
                  <CircleCheck className="h-3.5 w-3.5 text-[#B7F34A]" />
                ) : (
                  <TriangleAlert className="h-3.5 w-3.5 text-[#F59E0B]" />
                )}
                Explanation
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#D1D5DB]">{result.explanation}</p>
            </div>

            <div className="mt-3 rounded-2xl border border-[#B7F34A4D] bg-[#B7F34A1A] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#B7F34A]">Suggested next step</p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#E7F8C8]">{result.recommended_next_step}</p>
            </div>

            {result.analysis_source === 'DEMO' ? (
              <p className="mt-3 text-xs text-[#A855F7]">
                DEMO result — illustrative example only. It was not computed from your photo; do not act on it.
              </p>
            ) : (
              <p className="mt-3 text-xs text-[#6B7280]">
                REAL AI reading from leaf-pixel analysis. Supports healthy vs needs-inspection only — no specific
                disease diagnosed. Confirm uncertain cases with an expert.
              </p>
            )}

            {savedId ? (
              <p className="mt-4 flex items-center gap-2 text-sm font-medium text-[#B7F34A]">
                <CircleCheck className="h-4 w-4" /> Report saved — see Farm Dashboard and Scan History.
              </p>
            ) : (
              <button
                onClick={handleSave}
                className="clay-btn clay-btn-primary mt-4 inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-sm"
              >
                <Save className="h-4 w-4" /> Save Report
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
