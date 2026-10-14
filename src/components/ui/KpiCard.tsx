import type { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  trend?: {
    value: number
    label?: string
    positive?: boolean
  } | null
  hint?: string
  className?: string
}

export default function KpiCard({
  title,
  value,
  icon: Icon,
  trend,
  hint,
  className = '',
}: KpiCardProps) {
  return (
    <div className={`clay p-6 transition-all duration-200 hover:brightness-[1.07] ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">{title}</p>
          {hint && <p className="mt-0.5 text-[10px] text-[#6B7280]">{hint}</p>}
        </div>
        <div className="clay-icon-tile flex h-12 w-12 shrink-0 items-center justify-center text-[#B7F34A]">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <p className="mt-4 text-3xl font-bold text-[#F5F7F6] tabular-nums">{value}</p>
      {trend && (
        <div className="mt-3 flex items-center gap-2">
          <span className={`clay-badge inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${trend.positive ? 'bg-[#B7F34A1A] text-[#B7F34A]' : 'bg-[#EF44441A] text-[#EF4444]'}`}>
            {trend.positive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
          {trend.label && <span className="text-xs text-[#6B7280]">{trend.label}</span>}
        </div>
      )}
    </div>
  )
}
