import type { ReactNode } from 'react'
import { Inbox, Search, Image, CheckCircle2 } from 'lucide-react'
import Button from './Button'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  icon?: ReactNode
  variant?: 'default' | 'search' | 'upload' | 'success'
}

const icons = {
  default: Inbox,
  search: Search,
  upload: Image,
  success: CheckCircle2,
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  variant = 'default',
}: EmptyStateProps) {
  const Icon = icons[variant]

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#2A3A30] bg-[#0F1512] px-6 py-12 text-center animate-fade-in">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#141A17] text-[#6B7280]">
        {icon ?? <Icon className="h-7 w-7" />}
      </div>
      <h3 className="text-base font-semibold text-[#F5F7F6]">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-[#9CA3AF]">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button size="md" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  )
}