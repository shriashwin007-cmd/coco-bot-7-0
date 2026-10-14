import type { Cleanliness, Severity, AnalysisSource, ReportStatus } from '../../types'

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
  kind: 'cleanliness' | 'severity' | 'source' | 'status'
  value: BadgeValue
  size?: 'sm' | 'md'
}

export default function Badge({ value, size = 'md' }: BadgeProps) {
  const style = styles[value] || 'bg-[#2A3A30] text-[#9CA3AF] border-[#2A3A30]'
  const label = labels[value] || value
  const sizeClasses = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs'

  return (
    <span
      className={`clay-badge inline-flex items-center rounded-full border ${style} ${sizeClasses} font-semibold tracking-wide`}
    >
      {label}
    </span>
  )
}
