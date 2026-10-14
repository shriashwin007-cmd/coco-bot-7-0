import type { AIAnalysisResult, Cleanliness, Severity, WasteCategory } from '../types'

export const AI_SERVICE_UNAVAILABLE_MESSAGE =
  'The AI analysis service is not connected. Configure VITE_AI_API_URL or use the clearly labelled demo mode.'

export function getAiApiUrl(): string | undefined {
  const url = import.meta.env.VITE_AI_API_URL as string | undefined
  return url && url.trim() ? url.trim().replace(/\/+$/, '') : undefined
}

const VALID_CLEANLINESS: Cleanliness[] = ['clean', 'moderately_littered', 'heavily_littered']
const VALID_SEVERITY: Severity[] = ['low', 'medium', 'high']

function validateWasteCategories(input: unknown): WasteCategory[] {
  if (!Array.isArray(input)) return []
  const result: WasteCategory[] = []
  for (const item of input) {
    if (
      item &&
      typeof item === 'object' &&
      typeof (item as { name?: unknown }).name === 'string' &&
      typeof (item as { count?: unknown }).count === 'number'
    ) {
      result.push({
        name: (item as { name: string }).name,
        count: (item as { count: number }).count,
      })
    }
  }
  return result
}

function validateResponse(data: unknown): AIAnalysisResult {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid AI response: expected a JSON object.')
  }
  const obj = data as Record<string, unknown>

  if (!VALID_CLEANLINESS.includes(obj.cleanliness as Cleanliness)) {
    throw new Error('Invalid AI response: invalid or missing "cleanliness" value.')
  }
  if (!VALID_SEVERITY.includes(obj.severity as Severity)) {
    throw new Error('Invalid AI response: invalid or missing "severity" value.')
  }
  if (typeof obj.explanation !== 'string' || !obj.explanation.trim()) {
    throw new Error('Invalid AI response: missing "explanation".')
  }
  if (typeof obj.recommended_action !== 'string' || !obj.recommended_action.trim()) {
    throw new Error('Invalid AI response: missing "recommended_action".')
  }

  const confidence =
    obj.confidence === null || obj.confidence === undefined
      ? null
      : typeof obj.confidence === 'number' && Number.isFinite(obj.confidence)
        ? obj.confidence
        : null

  return {
    cleanliness: obj.cleanliness as Cleanliness,
    severity: obj.severity as Severity,
    explanation: obj.explanation as string,
    waste_categories: validateWasteCategories(obj.waste_categories),
    confidence,
    recommended_action: obj.recommended_action as string,
  }
}

/**
 * Analyze an image using the external AI backend (Python FastAPI).
 * Throws when the backend is unavailable or returns an invalid response.
 * Never fabricates a prediction.
 */
export async function analyzeImage(file: File): Promise<AIAnalysisResult> {
  const apiUrl = getAiApiUrl()
  if (!apiUrl) {
    throw new Error(AI_SERVICE_UNAVAILABLE_MESSAGE)
  }

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 30000)

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
    throw new Error(`AI service returned an error (${response.status}).`)
  }

  let data: unknown
  try {
    data = await response.json()
  } catch {
    throw new Error('Invalid AI response: response was not valid JSON.')
  }

  return validateResponse(data)
}

/**
 * Clearly-labelled demonstration result generator.
 * This is NOT a real AI prediction and must never be presented as one.
 */
export function createDemoAnalysis(): AIAnalysisResult {
  const scenarios: AIAnalysisResult[] = [
    {
      cleanliness: 'clean',
      severity: 'low',
      explanation:
        'The street appears clean with no visible litter. Surfaces are clear and waste bins are not overflowing.',
      waste_categories: [],
      confidence: null,
      recommended_action: 'Routine monitoring. No immediate action required.',
    },
    {
      cleanliness: 'moderately_littered',
      severity: 'medium',
      explanation:
        'Several small litter items are visible, including a plastic bottle and food packaging near the curb.',
      waste_categories: [
        { name: 'plastic bottle', count: 1 },
        { name: 'food packaging', count: 2 },
      ],
      confidence: null,
      recommended_action: 'Schedule a routine cleanup within the next 24 hours.',
    },
    {
      cleanliness: 'heavily_littered',
      severity: 'high',
      explanation:
        'Significant accumulation of waste including bags, bottles, and scattered debris across the street and sidewalk.',
      waste_categories: [
        { name: 'plastic bag', count: 3 },
        { name: 'plastic bottle', count: 4 },
        { name: 'food waste', count: 2 },
      ],
      confidence: null,
      recommended_action: 'Prioritize immediate cleanup and dispatch a sanitation team.',
    },
  ]
  return scenarios[Math.floor(Math.random() * scenarios.length)]
}
