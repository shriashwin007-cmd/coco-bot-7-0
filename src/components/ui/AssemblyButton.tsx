import { Link } from 'react-router-dom'
import { ArrowRight, Loader2 } from 'lucide-react'
import RollText from './RollText'

interface AssemblyButtonProps {
  label: string
  to?: string
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'cream' | 'dark' | 'outline' | 'danger'
  arrow?: boolean
  roll?: boolean
  className?: string
  type?: 'button' | 'submit'
}

/** Signature call-to-action: cream/espresso pill, rolling label, gliding arrow. */
export default function AssemblyButton({
  label,
  to,
  onClick,
  disabled,
  loading,
  variant = 'dark',
  arrow = true,
  roll = true,
  className = '',
  type = 'button',
}: AssemblyButtonProps) {
  const styles =
    variant === 'cream'
      ? 'pill-cream'
      : variant === 'outline'
        ? 'border border-[#2a1f14]/35 hover:bg-[#2a1f14]/5'
        : variant === 'danger'
          ? 'border border-[#a4442e]/60 text-[#7c3121] hover:bg-[#a4442e]/10'
          : 'pill-dark'
  const cls = `pill roll-hover ${styles} px-7 py-3.5 text-xs font-bold uppercase tracking-[0.22em] ${className}`

  const inner = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {roll ? <RollText text={label} /> : <span>{label}</span>}
      {arrow && !loading && <ArrowRight className="glide-arrow h-4 w-4" />}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={cls} aria-label={label}>
        {inner}
      </Link>
    )
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={cls} aria-label={label}>
      {inner}
    </button>
  )
}
