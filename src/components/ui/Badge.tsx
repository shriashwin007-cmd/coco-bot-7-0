import type { Cleanliness, Severity, AnalysisSource, ReportStatus } from '../../types'

type BadgeKind = 'cleanliness' | 'severity' | 'source' | 'status'
type BadgeValue = Cleanliness | Severity | AnalysisSource | ReportStatus

const labels: Record<string, string> = {
  clean: 'Clean',
  moderately_littered: 'Moderately Littered',
  heavily_littered: 'Heavily Littered',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  'REAL AI': 'REAL AI',
  DEMO: 'DEMO',
  Open: 'Open',
  Assigned: 'Assigned',
  'In Progress': 'In Progress',
  Resolved: 'Resolved',
}

const styles: Record<string, string> = {
  clean: 'bg-[#B7F34A1A] text-[#B7F34A] border-[#B7F34A4D]',
  moderately_littered: 'bg-[#F59E0B1A] text-[#F59E0B] border-[#F59E0B4D]',
  heavily_littered: 'bg-[#EF44441A] text-[#EF4444] border-[#EF44444D]',
  low: 'bg-[#B7F34A1A] text-[#B7F34A] border-[#B7F34A4D]',
  medium: 'bg-[#F59E0B1A] text-[#F59E0B] border-[#F59E0B4D]',
  high: 'bg-[#EF44441A] text-[#EF4444] border-[#EF44444D]',
  'REAL AI': 'bg-[#38BDF81A] text-[#38BDF8] border-[#38BDF84D]',
  DEMO: 'bg-[#A855F71A] text-[#A855F7] border-[#A855F74D]',
  Open: 'bg-[#EF44441A] text-[#EF4444] border-[#EF44444D]',
  Assigned: 'bg-[#F59E0B1A] text-[#F59E0B] border-[#F59E0B4D]',
  'In Progress': 'bg-[#38BDF81A] text-[#38BDF8] border-[#38BDF84D]',
  Resolved: 'bg-[#B7F34A1A] text-[#B7F34A] border-[#B7F34A4D]',
}

interface BadgeProps {
  kind: BadgeKind
  value: BadgeValue
  size?: 'sm' | 'md'
  dot?: boolean
}

export default function Badge({ value, size = 'md', dot = false }: BadgeProps) {
  const style = styles[value] || 'bg-[#2A3A30] text-[#9CA3AF] border-[#2A3A30]'
  const label = labels[value] || value

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${style} ${sizeClasses} font-medium`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />}
      {label}
    </span>
  )
}