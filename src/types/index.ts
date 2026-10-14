export type Cleanliness = 'clean' | 'moderately_littered' | 'heavily_littered'
export type Severity = 'low' | 'medium' | 'high'
export type AnalysisSource = 'REAL AI' | 'DEMO'
export type ReportStatus = 'Open' | 'Assigned' | 'In Progress' | 'Resolved'

export interface WasteCategory {
  name: string
  count: number
}

export interface AIAnalysisResult {
  cleanliness: Cleanliness
  severity: Severity
  explanation: string
  waste_categories: WasteCategory[]
  confidence: number | null
  recommended_action: string
}

export interface ScanRecord {
  id: string
  createdAt: string
  filename?: string
  thumbnail?: string
  cleanliness: Cleanliness
  severity: Severity
  explanation: string
  wasteCategories: WasteCategory[]
  confidence: number | null
  recommendedAction: string
  source: AnalysisSource
  location?: string
}

export interface WasteReport {
  id: string
  scanId: string
  scanCleanliness?: Cleanliness
  location?: string
  severity: Severity
  description: string
  recommendedAction: string
  status: ReportStatus
  createdAt: string
  source?: AnalysisSource
}

export interface DashboardStats {
  totalAnalyzed: number
  cleanStreets: number
  litteredStreets: number
  highPriorityReports: number
}
