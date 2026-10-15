// COCO BOT 7.0 shared types.
// Scan history persists in localStorage; simulated sensor data is kept separate.

export type PlantStatus = 'healthy' | 'needs_inspection'
export type AnalysisSource = 'REAL AI' | 'DEMO'

export interface LeafMetrics {
  green_ratio: number
  yellow_ratio: number
  brown_ratio: number
  dark_spot_ratio: number
  stress_ratio: number
  leaf_coverage: number
  mean_brightness: number
  health_index: number
  pixels_analysed: number
}

export interface RunnerUp {
  label: string
  confidence: number
}

export interface AIAnalysisResult {
  predicted_label: string
  status: PlantStatus
  /** Softmax confidence for the top class (0-1), or null in demo mode. */
  confidence: number | null
  confidence_description: string
  crop?: string
  condition?: string
  runner_up?: RunnerUp | null
  explanation: string
  recommended_next_step: string
  metrics?: LeafMetrics | null
  analysis_source: AnalysisSource
}

export interface ScanRecord {
  id: string
  createdAt: string
  filename?: string
  thumbnail?: string
  predictedLabel: string
  status: PlantStatus
  modelScore: number | null
  explanation: string
  recommendedNextStep: string
  source: AnalysisSource
}

export interface DashboardStats {
  totalScans: number
  healthyCount: number
  needsInspectionCount: number
  avgHealthIndex: number | null
}

/** Simulated hardware readings — NEVER mixed with real AI results. */
export interface VirtualBotState {
  soilMoisture: number // %
  temperature: number // °C
  humidity: number // %
  plantHealth: string
  solarPower: string
  solarWatts: number
  connectivity: string
  antifungalPump: 'OFF' | 'ON'
  nutrientPump: 'OFF' | 'ON'
  lastCycle: string | null
}
