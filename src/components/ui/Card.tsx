import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  title?: string
  subtitle?: string
  action?: ReactNode
  hoverable?: boolean
}

export default function Card({
  children, title, subtitle, action,
  hoverable = false, className = '', ...rest
}: CardProps) {
  return (
    <div
      className={`clay transition-all duration-200 ${hoverable ? 'hover:brightness-[1.07]' : ''} ${className}`}
      {...rest}
    >
      {(title || subtitle || action) && (
        <div className="px-6 py-5 border-b border-white/[0.06] flex items-start justify-between gap-4">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-[#F5F7F6]">{title}</h2>}
            {subtitle && <p className="mt-1 text-sm text-[#9CA3AF]">{subtitle}</p>}
          </div>
          {action ? <div className="shrink-0 ml-4">{action}</div> : null}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}

export function CardSection({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`space-y-4 ${className}`}>{children}</div>
}

export function CardRow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>{children}</div>
}
