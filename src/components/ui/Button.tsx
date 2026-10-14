import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
  iconLeft?: ReactNode
  iconRight?: ReactNode
}

const variants = {
  primary: 'bg-[#B7F34A] text-[#0B0F0D] hover:bg-[#D9FB8A] active:bg-[#9DD63E] border border-[#B7F34A]',
  secondary: 'bg-[#141A17] text-[#F5F7F6] hover:bg-[#18201C] active:bg-[#1C2620] border border-[#2A3A30]',
  ghost: 'bg-transparent text-[#F5F7F6] hover:bg-[#141A17] active:bg-[#18201C] border border-transparent',
  danger: 'bg-transparent text-[#EF4444] hover:bg-[#EF44441A] active:bg-[#EF444426] border border-[#EF44444D]',
  outline: 'bg-transparent text-[#B7F34A] hover:bg-[#B7F34A1A] active:bg-[#B7F34A26] border border-[#B7F34A4D]',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled,
  children,
  iconLeft,
  iconRight,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl font-medium transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[#B7F34A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F0D] disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isDisabled}
      {...rest}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!loading && iconLeft ? <span className="shrink-0" aria-hidden="true">{iconLeft}</span> : null}
      <span className="truncate">{children}</span>
      {!loading && iconRight ? <span className="shrink-0" aria-hidden="true">{iconRight}</span> : null}
    </button>
  )
}
