import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Sparkles, ScanLine, Save, MapPin, Info } from 'lucide-react'
import ImageUploader from '../components/scanner/ImageUploader'
import Button from '../components/ui/Button'
import Card, { CardSection } from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import { analyzeImage, createDemoAnalysis } from '../services/aiService'
import type { AIAnalysisResult, WasteCategory } from '../types'
import { loadScans, saveScans, loadReports, saveReports } from '../utils/storage'
import { generateId } from '../utils/id'
import { formatCleanliness, formatSeverity } from '../utils/format'

export default function ScannerPage() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [result, setResult] = useState<AIAnalysisResult | null>(null)
  const [source, setSource] = useState<'REAL AI' | 'DEMO' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scanId, setScanId] = useState<string | null>(null)
  const [location, setLocation] = useState('')
  const [reportOpen, setReportOpen] = useState(false)
  const [reportSavedMsg, setReportSavedMsg] = useState<string | null>(null)

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

  function handleFileSelected(f: File) {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(f); setPreviewUrl(URL.createObjectURL(f))
    setResult(null); setSource(null); setError(null); setScanId(null); setReportSavedMsg(null)
  }

  function handleRemove() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(null); setPreviewUrl(null); setResult(null); setSource(null); setError(null); setScanId(null)
  }

  function persistScan(analysis: AIAnalysisResult, src: 'REAL AI' | 'DEMO') {
    const id = generateId('scan')
    const record = {
      id, createdAt: new Date().toISOString(), filename: file?.name,
      thumbnail: previewUrl ?? undefined, cleanliness: analysis.cleanliness,
      severity: analysis.severity, explanation: analysis.explanation,
      wasteCategories: analysis.waste_categories, confidence: analysis.confidence,
      recommendedAction: analysis.recommended_action, source: src,
      location: location.trim() || undefined,
    }
    const scans = loadScans()
    scans.unshift(record)
    saveScans(scans)
    setScanId(id)
    return id
  }

  async function handleAnalyze() {
    if (!file) { setError('Please select an image before running analysis.'); return }
    setLoading(true); setError(null); setResult(null); setSource(null)
    try {
      const analysis = await analyzeImage(file)
      setResult(analysis); setSource('REAL AI')
      persistScan(analysis, 'REAL AI')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed.')
    } finally {
      setLoading(false)
    }
  }

  function handleDemoAnalysis() {
    const analysis = createDemoAnalysis()
    setResult(analysis); setSource('DEMO')
    persistScan(analysis, 'DEMO'); setError(null)
  }

  function handleSaveReport() {
    if (!result || !scanId) return
    const scans = loadScans()
    const scan = scans.find((s) => s.id === scanId)
    const reports = loadReports()
    const report = {
      id: generateId('report'), scanId, scanCleanliness: result.cleanliness,
      location: location.trim() || scan?.location, severity: result.severity,
      description: result.explanation, recommendedAction: result.recommended_action,
      status: 'Open' as const, createdAt: new Date().toISOString(),
      source: (source ?? 'DEMO') as 'REAL AI' | 'DEMO',
    }
    reports.unshift(report)
    saveReports(reports)
    setReportOpen(false)
    setReportSavedMsg(`Report ${report.id} created.`)
  }

  const hasAiUrl = Boolean(import.meta.env.VITE_AI_API_URL)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Upload street image" subtitle="Supported formats: JPG, JPEG, PNG, WEBP up to 5 MB.">
          <CardSection>
            <ImageUploader file={file} previewUrl={previewUrl} onFileSelected={handleFileSelected} onRemove={handleRemove} disabled={loading} />
            <div className="flex flex-wrap items-center gap-2.5">
              <Button onClick={handleAnalyze} disabled={loading || !file} loading={loading} iconLeft={!loading ? <ScanLine className="h-4 w-4" /> : undefined}>
                {loading ? 'Analyzing…' : 'Analyze Image'}
              </Button>
              <Button variant="outline" onClick={handleDemoAnalysis} disabled={loading} iconLeft={<Sparkles className="h-4 w-4" />}>
                Demo Analysis
              </Button>
            </div>
            {!hasAiUrl && (
              <div className="flex items-start gap-2.5 rounded-xl border border-[#F59E0B4D] bg-[#F59E0B1A] px-4 py-3 text-xs leading-relaxed text-[#F59E0B]">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <span><strong>AI service not configured.</strong> Set <code className="rounded bg-black/30 px-1">VITE_AI_API_URL</code> to enable live analysis. Demonstration results are clearly labelled DEMO.</span>
              </div>
            )}
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-[#EF44444D] bg-[#EF44441A] px-4 py-3 text-sm text-[#EF4444] animate-slide-up">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div>
              <label htmlFor="scan-location" className="flex items-center gap-1.5 text-sm font-medium text-[#9CA3AF]">
                <MapPin className="h-3.5 w-3.5" /> Location <span className="font-normal text-[#6B7280]">(optional)</span>
              </label>
              <input
                id="scan-location" type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Demo Area – Main Street"
                className="mt-1.5 w-full clay-input border-[#2A3A30] px-3.5 py-2.5 text-sm text-[#F5F7F6] placeholder:text-[#6B7280] focus:border-[#B7F34A] focus:outline-none focus:ring-2 focus:ring-[#B7F34A]/20 transition-all"
              />
              <p className="mt-1.5 text-[11px] text-[#6B7280]">Used for map markers and report context. Never inferred from the photo.</p>
            </div>
          </CardSection>
        </Card>

        <Card title="Analysis results" subtitle={result ? `Scan ${scanId ?? ''}` : 'Results appear after analysis.'} action={source ? <Badge kind="source" value={source} /> : undefined}>
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F1512] text-[#6B7280]">
                <ScanLine className="h-7 w-7" />
              </div>
              <p className="text-sm font-medium text-[#F5F7F6]">No analysis yet</p>
              <p className="mt-1 max-w-xs text-xs text-[#6B7280]">Upload an image and run an analysis — or try a one-click demo analysis.</p>
            </div>
          )}
          {loading && (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#B7F34A] border-t-transparent" />
              <p className="mt-4 text-sm font-medium text-[#F5F7F6]">Analyzing image…</p>
              <p className="mt-1 text-xs text-[#6B7280]">Sending to AI backend with 30s timeout</p>
            </div>
          )}
          {result && source && (
            <CardSection>
              <div className="flex flex-wrap items-center gap-2">
                <Badge kind="cleanliness" value={result.cleanliness} />
                <Badge kind="severity" value={result.severity} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#223027] bg-[#0F1512] p-3.5">
                  <p className="text-[11px] uppercase tracking-wider text-[#6B7280]">Cleanliness</p>
                  <p className="mt-1 text-sm font-semibold text-[#F5F7F6]">{formatCleanliness(result.cleanliness)}</p>
                </div>
                <div className="rounded-xl border border-[#223027] bg-[#0F1512] p-3.5">
                  <p className="text-[11px] uppercase tracking-wider text-[#6B7280]">Severity</p>
                  <p className="mt-1 text-sm font-semibold text-[#F5F7F6]">{formatSeverity(result.severity)}</p>
                </div>
              </div>
              <div className="rounded-xl border border-[#223027] bg-[#0F1512] p-3.5">
                <p className="text-[11px] uppercase tracking-wider text-[#6B7280]">AI explanation</p>
                <p className="mt-1.5 text-sm leading-relaxed text-[#F5F7F6]">{result.explanation}</p>
              </div>
              {result.waste_categories.length > 0 && (
                <div className="rounded-xl border border-[#223027] bg-[#0F1512] p-3.5">
                  <p className="text-[11px] uppercase tracking-wider text-[#6B7280]">Waste categories</p>
                  <ul className="mt-2.5 space-y-2">
                    {result.waste_categories.map((c: WasteCategory, idx: number) => (
                      <li key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-[#F5F7F6] capitalize">{c.name}</span>
                        <span className="rounded-full bg-[#B7F34A1A] px-2.5 py-0.5 text-xs font-semibold text-[#B7F34A] tabular-nums">×{c.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {typeof result.confidence === 'number' && (
                <div className="flex items-center justify-between rounded-xl border border-[#223027] bg-[#0F1512] px-3.5 py-3">
                  <span className="text-sm text-[#9CA3AF]">Model confidence</span>
                  <span className="text-sm font-semibold text-[#B7F34A] tabular-nums">{Math.round(result.confidence * 100)}%</span>
                </div>
              )}
              <div className="clay-chip border-[#B7F34A4D] p-4">
                <p className="text-[11px] uppercase tracking-wider text-[#B7F34A]">Recommended action</p>
                <p className="mt-1.5 text-sm leading-relaxed text-[#F5F7F6]">{result.recommended_action}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <Button onClick={() => setReportOpen(true)} disabled={!scanId} iconLeft={<Save className="h-4 w-4" />}>Save Report</Button>
                {scanId && <span className="text-xs text-[#6B7280] font-mono">saved · {scanId}</span>}
              </div>
              {reportSavedMsg && (
                <p className="flex items-center gap-2 text-sm text-[#B7F34A] animate-slide-up">
                  <CheckCircle2 className="h-4 w-4" /> {reportSavedMsg}
                  <button className="text-xs text-[#9CA3AF] underline underline-offset-2 hover:text-[#F5F7F6]" onClick={() => navigate('/reports')}>View reports →</button>
                </p>
              )}
            </CardSection>
          )}
        </Card>
      </div>

      <Modal open={reportOpen} title="Create waste report" onClose={() => setReportOpen(false)} size="sm"
        footer={<><Button variant="ghost" onClick={() => setReportOpen(false)}>Cancel</Button><Button onClick={handleSaveReport} iconLeft={<Save className="h-4 w-4" />}>Create Report</Button></>}>
        <p className="text-sm leading-relaxed text-[#9CA3AF]">A report will be created from the current scan with status <strong className="text-[#F5F7F6]">Open</strong>. You can assign and resolve it from the Waste Reports page.</p>
      </Modal>
    </div>
  )
}
