import type { AnalysisSource, PlantStatus } from '../../types'

const styles: Record<string, string> = {
  healthy: 'bg-[#B7F34A1A] text-[#B7F34A] border-[#B7F34A4D]',
  needs_inspection: 'bg-[#F59E0B1A] text-[#F59E0B] border-[#F59E0B4D]',
  'REAL AI': 'bg-[#38BDF81A] text-[#38BDF8] border-[#38BDF84D]',
  DEMO: 'bg-[#A855F71A] text-[#A855F7] border-[#A855F74D]',
  simulated: 'bg-[#A855F71A] text-[#D8B4FE] border-[#A855F74D]',
}

const labels: Record<string, string> = {
  healthy: 'Healthy',
  needs_inspection: 'Needs inspection',
  'REAL AI': 'REAL AI',
  DEMO: 'DEMO',
  simulated: 'SIMULATED',
}

interface BadgeProps {
  value: PlantStatus | AnalysisSource | 'simulated'
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
