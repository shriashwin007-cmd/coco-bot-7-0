import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Button from './Button'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnOverlayClick?: boolean
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export default function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
}: ModalProps) {
  if (!open) return null

  const overlay = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        className={`w-full ${sizes[size]} rounded-2xl border border-[#223027] bg-[#141A17] shadow-xl animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#223027] px-5 py-4">
          <h3 id="modal-title" className="text-base font-semibold text-[#F5F7F6]">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#9CA3AF] hover:bg-[#18201C] hover:text-[#F5F7F6] transition-colors focus-visible:ring-2 focus-visible:ring-[#B7F34A]"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-[#223027] px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )

  if (typeof window === 'undefined') return null
  return createPortal(overlay, document.body)
}

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
}

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} onClose={onCancel} size="sm">
      <p className="text-sm text-[#9CA3AF]">{message}</p>
      <Modal.Footer>
        <Button variant="ghost" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

Modal.Footer = function ModalFooter({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-end gap-2">{children}</div>
}