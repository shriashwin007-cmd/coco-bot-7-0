// COCO BOT 7.0 AI service module.
// Talks to the FastAPI backend (POST /analyze) when configured via
// VITE_AI_API_URL. Never fabricates predictions: backend errors are thrown
// to the caller, and demo results are only produced by createDemoAnalysis().

import type { AIAnalysisResult, LeafMetrics, PlantStatus } from '../types'

export const AI_SERVICE_UNAVAILABLE_MESSAGE =
  'The AI analysis service is not connected. Start the backend (backend\\start-cocobot.bat) or use the clearly labelled demo mode.'

export const SUPPORTED_LABELS_NOTE =
  'This system supports only healthy vs needs-inspection classification. It does not diagnose specific diseases.'

export function getAiApiUrl(): string | undefined {
  const url = import.meta.env.VITE_AI_API_URL as string | undefined
  return url && url.trim() ? url.trim().replace(/\/+$/, '') : undefined
}

function toStatus(value: unknown): PlantStatus {
  if (value === 'healthy' || value === 'needs_inspection') return value
  throw new Error('Invalid AI response: unknown "status" value.')
}

function toMetrics(value: unknown): LeafMetrics | null {
  if (!value || typeof value !== 'object') return null
  const m = value as Record<string, unknown>
  const num = (k: string) =>
    typeof m[k] === 'number' && Number.isFinite(m[k]) ? (m[k] as number) : 0
  return {
    green_ratio: num('green_ratio'),
    yellow_ratio: num('yellow_ratio'),
    brown_ratio: num('brown_ratio'),
    dark_spot_ratio: num('dark_spot_ratio'),
    stress_ratio: num('stress_ratio'),
    leaf_coverage: num('leaf_coverage'),
    mean_brightness: num('mean_brightness'),
    health_index: num('health_index'),
    pixels_analysed: num('pixels_analysed'),
  }
}

function validateResponse(data: unknown): AIAnalysisResult {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid AI response: expected a JSON object.')
  }
  const obj = data as Record<string, unknown>
  if (typeof obj.predicted_label !== 'string' || !obj.predicted_label.trim()) {
    throw new Error('Invalid AI response: missing "predicted_label".')
  }
  const status = toStatus(obj.status)
  const model_score =
    typeof obj.model_score === 'number' && Number.isFinite(obj.model_score)
      ? Math.min(1, Math.max(0, obj.model_score))
      : null
  if (typeof obj.explanation !== 'string' || !obj.explanation.trim()) {
    throw new Error('Invalid AI response: missing "explanation".')
  }
  if (typeof obj.recommended_next_step !== 'string' || !obj.recommended_next_step.trim()) {
    throw new Error('Invalid AI response: missing "recommended_next_step".')
  }
  return {
    predicted_label: obj.predicted_label as string,
    status,
    model_score,
    score_description:
      typeof obj.score_description === 'string' && obj.score_description.trim()
        ? (obj.score_description as string)
        : 'Leaf-greenness health index (0–1): visual vigour, not a disease probability.',
    explanation: obj.explanation as string,
    recommended_next_step: obj.recommended_next_step as string,
    metrics: toMetrics(obj.metrics),
    analysis_source: 'REAL AI',
  }
}

/**
 * Analyze a leaf image with the real backend.
 * Throws when unavailable or invalid — callers must handle the error and
 * must NOT substitute a fake result.
 */
export async function analyzeImage(file: File): Promise<AIAnalysisResult> {
  const apiUrl = getAiApiUrl()
  if (!apiUrl) throw new Error(AI_SERVICE_UNAVAILABLE_MESSAGE)

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 45000)
  const form = new FormData()
  form.append('file', file)

  let response: Response
  try {
    response = await fetch(`${apiUrl}/analyze`, {
      method: 'POST',
      body: form,
      signal: controller.signal,
    })
  } catch (err) {
    window.clearTimeout(timeoutId)
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('AI analysis timed out. Please try again.')
    }
    throw new Error(AI_SERVICE_UNAVAILABLE_MESSAGE)
  }
  window.clearTimeout(timeoutId)

  if (!response.ok) {
    let detail = ''
    try {
      const body = (await response.json()) as { detail?: string }
      if (body && typeof body.detail === 'string') detail = ` ${body.detail}`
    } catch {
      /* ignore */
    }
    throw new Error(`AI service returned an error (${response.status}).${detail}`)
  }

  let data: unknown
  try {
    data = await response.json()
  } catch {
    throw new Error('Invalid AI response: response was not valid JSON.')
  }
  return validateResponse(data)
}

export async function checkBackendHealth(): Promise<{
  ok: boolean
  backend?: string
  supported_labels?: string[]
}> {
  const apiUrl = getAiApiUrl()
  if (!apiUrl) return { ok: false }
  try {
    const res = await fetch(`${apiUrl}/health`)
    if (!res.ok) return { ok: false }
    const data = (await res.json()) as { backend?: string; supported_labels?: string[] }
    return { ok: true, backend: data.backend, supported_labels: data.supported_labels }
  } catch {
    return { ok: false }
  }
}

/**
 * Clearly-labelled demonstration result. NOT a real prediction — the UI must
 * always badge these as DEMO and keep them separate from REAL AI results.
 */
export function createDemoAnalysis(): AIAnalysisResult {
  const healthy = Math.random() < 0.5
  if (healthy) {
    return {
      predicted_label: 'healthy (demonstration)',
      status: 'healthy',
      model_score: null,
      score_description:
        'No model score in demo mode — demonstration only, not a real analysis.',
      explanation:
        'Demonstration example: a predominantly green leaf with no visible discolouration. This is illustrative sample text, not an analysis of your photo.',
      recommended_next_step:
        'Continue routine care and re-scan if symptoms appear. Confirm with an expert for any real concern.',
      metrics: null,
      analysis_source: 'DEMO',
    }
  }
  return {
    predicted_label: 'needs inspection (demonstration)',
    status: 'needs_inspection',
    model_score: null,
    score_description:
      'No model score in demo mode — demonstration only, not a real analysis.',
    explanation:
      'Demonstration example: visible yellowing used here only to illustrate the needs-inspection outcome. This is illustrative sample text, not an analysis of your photo.',
    recommended_next_step:
      'Inspect the plant in daylight, check water and drainage, and consult a local agronomist before any treatment. Do not treat based on demo output.',
    metrics: null,
    analysis_source: 'DEMO',
  }
}
