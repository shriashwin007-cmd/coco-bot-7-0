import type { AnalysisSource, PlantStatus } from '../../types'

const styles: Record<string, string> = {
  healthy: 'bg-[#55622e]/15 text-[#3d471f] border-[#55622e]/45',
  needs_inspection: 'bg-[#b97f2e]/15 text-[#8a5d1c] border-[#b97f2e]/50',
  'REAL AI': 'bg-[#38607e]/12 text-[#2c4f68] border-[#38607e]/45',
  DEMO: 'bg-[#7c4a68]/12 text-[#6d3d5c] border-[#7c4a68]/45',
  simulated: 'bg-transparent text-[#6d3d5c] border-[#7c4a68]/55 border-dashed',
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
  const style = styles[value] || 'bg-black/10 text-[#3a2c1e] border-black/15'
  const label = labels[value] || value
  const sizeClasses = size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
  return (
    <span
      className={`inline-flex items-center rounded-full border ${style} ${sizeClasses} font-semibold tracking-widest uppercase`}
    >
      {label}
    </span>
  )
}
