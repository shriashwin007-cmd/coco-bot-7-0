import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  title?: string
  subtitle?: string
  action?: ReactNode
  bordered?: boolean
  hoverable?: boolean
}

export default function Card({
  children, title, subtitle, action,
  bordered = true, hoverable = false, className = '', ...rest
}: CardProps) {
  return (
    <div
      className={`rounded-2xl transition-all duration-200 ${bordered ? 'border border-[#223027] bg-[#141A17]' : ''} ${hoverable ? 'hover:border-[#2A3A30] hover:shadow-lg' : ''} ${className}`}
      {...rest}
    >
      {(title || subtitle || action) && (
        <div className="px-5 py-4 border-b border-[#223027] flex items-start justify-between gap-4">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-[#F5F7F6]">{title}</h2>}
            {subtitle && <p className="mt-1 text-sm text-[#9CA3AF]">{subtitle}</p>}
          </div>
          {action ? <div className="shrink-0 ml-4">{action}</div> : null}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}

export function CardSection({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`space-y-4 ${className}`}>{children}</div>
}

export function CardRow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>{children}</div>
}
