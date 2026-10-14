import type { AnalysisSource, PlantStatus } from '../types'

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

export function formatStatus(value: PlantStatus): string {
  return value === 'healthy' ? 'Healthy' : 'Needs inspection'
}

export function formatScore(score: number | null): string {
  if (score === null || !Number.isFinite(score)) return '—'
  return `${Math.round(score * 100)}%`
}

export function statusColor(value: PlantStatus): string {
  return value === 'healthy' ? 'text-[#B7F34A]' : 'text-[#F59E0B]'
}

export function sourceLabel(source: AnalysisSource): string {
  return source === 'REAL AI' ? 'REAL AI' : 'DEMO'
}
