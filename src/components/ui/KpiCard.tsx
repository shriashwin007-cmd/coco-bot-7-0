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
    <div
      className={`rounded-2xl border border-[#223027] bg-[#141A17] p-5 transition-all duration-200 hover:border-[#2A3A30] hover:shadow-lg ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">{title}</p>
          {hint && <p className="mt-0.5 text-[10px] text-[#6B7280]">{hint}</p>}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#B7F34A1A] text-[#B7F34A]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-3xl font-semibold text-[#F5F7F6] tabular-nums">{value}</p>
      {trend && (
        <div className="mt-3 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              trend.positive
                ? 'bg-[#B7F34A1A] text-[#B7F34A]'
                : 'bg-[#EF44441A] text-[#EF4444]'
            }`}
          >
            {trend.positive ? (
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12l5 5 10-10" />
              </svg>
            ) : (
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12l-5 5-10-10" />
              </svg>
            )}
            {Math.abs(trend.value)}%
          </span>
          {trend.label && <span className="text-xs text-[#6B7280]">{trend.label}</span>}
        </div>
      )}
    </div>
  )
}