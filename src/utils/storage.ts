const SCANS_KEY = 'trashbots_scans'
const REPORTS_KEY = 'trashbots_reports'

export function loadScans(): import('../types').ScanRecord[] {
  try {
    const raw = localStorage.getItem(SCANS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveScans(scans: import('../types').ScanRecord[]): void {
  localStorage.setItem(SCANS_KEY, JSON.stringify(scans))
}

export function loadReports(): import('../types').WasteReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveReports(reports: import('../types').WasteReport[]): void {
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports))
}

export function clearAllDemoData(): void {
  // Remove only records tagged DEMO
  const scans = loadScans().filter((s) => s.source !== 'DEMO')
  const reports = loadReports().filter((r) => r.source !== 'DEMO')
  saveScans(scans)
  saveReports(reports)
}

export function clearAllData(): void {
  localStorage.removeItem(SCANS_KEY)
  localStorage.removeItem(REPORTS_KEY)
}
