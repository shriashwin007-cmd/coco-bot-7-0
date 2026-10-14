// COCO BOT 7.0 local persistence (prototype).
// Scan history lives in localStorage. Dashboard figures are always computed
// from these records — never hardcoded. Simulated sensor data is NOT stored here.

import type { DashboardStats, ScanRecord } from '../types'

const SCANS_KEY = 'cocobot_scans_v1'

export function loadScans(): ScanRecord[] {
  try {
    const raw = localStorage.getItem(SCANS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (s): s is ScanRecord =>
        !!s && typeof s === 'object' && typeof (s as ScanRecord).id === 'string',
    )
  } catch {
    return []
  }
}

export function saveScans(scans: ScanRecord[]): void {
  localStorage.setItem(SCANS_KEY, JSON.stringify(scans))
}

export function addScan(scan: ScanRecord): ScanRecord[] {
  const scans = [scan, ...loadScans()]
  saveScans(scans)
  return scans
}

export function deleteScan(id: string): ScanRecord[] {
  const scans = loadScans().filter((s) => s.id !== id)
  saveScans(scans)
  return scans
}

export function clearDemoScans(): ScanRecord[] {
  const scans = loadScans().filter((s) => s.source !== 'DEMO')
  saveScans(scans)
  return scans
}

export function clearAllScans(): ScanRecord[] {
  localStorage.removeItem(SCANS_KEY)
  return []
}

export function computeStats(scans: ScanRecord[]): DashboardStats {
  const healthyCount = scans.filter((s) => s.status === 'healthy').length
  const needsInspectionCount = scans.filter((s) => s.status === 'needs_inspection').length
  const scores = scans
    .map((s) => s.modelScore)
    .filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
  return {
    totalScans: scans.length,
    healthyCount,
    needsInspectionCount,
    avgHealthIndex:
      scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 1000) / 1000
        : null,
  }
}

export function exportScansJson(scans: ScanRecord[]): string {
  return JSON.stringify({ app: 'COCO BOT 7.0 demo', exportedAt: new Date().toISOString(), scans }, null, 2)
}
