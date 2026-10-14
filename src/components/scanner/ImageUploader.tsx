import { useRef, useState } from 'react'
import { Upload, ImagePlus, RefreshCw, X, FileImage } from 'lucide-react'
import Button from '../ui/Button'

interface ImageUploaderProps {
  file: File | null
  previewUrl: string | null
  onFileSelected: (file: File) => void
  onRemove: () => void
  disabled?: boolean
}

const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024

export default function ImageUploader({ file, previewUrl, onFileSelected, onRemove, disabled }: ImageUploaderProps) {
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File | null) {
    setLocalError(null)
    if (!f) return
    if (!ALLOWED.includes(f.type)) {
      setLocalError('Unsupported file type. Please use JPG, JPEG, PNG, or WEBP.')
      return
    }
    if (f.size > MAX_SIZE) {
      setLocalError('File too large. Maximum size is 5 MB.')
      return
    }
    onFileSelected(f)
  }

  return (
    <div className="space-y-3">
      {!previewUrl ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0] ?? null) }}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !disabled) inputRef.current?.click() }}
          role="button" tabIndex={0} aria-label="Upload street image"
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#B7F34A] ${dragging ? 'border-[#B7F34A] bg-[#B7F34A1A]' : 'border-[#2A3A30] bg-[#0F1512] hover:border-[#B7F34A4D] hover:bg-[#141A17]'}`}
        >
          <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${dragging ? 'bg-[#B7F34A1A] text-[#B7F34A]' : 'bg-[#141A17] text-[#9CA3AF]'}`}>
            {dragging ? <ImagePlus className="h-7 w-7" /> : <Upload className="h-7 w-7" />}
          </div>
          <p className="text-sm font-medium text-[#F5F7F6]">{dragging ? 'Drop the image to upload' : 'Drag and drop a street image here'}</p>
          <p className="mt-1 text-xs text-[#6B7280]">or click to browse — JPG, JPEG, PNG, WEBP up to 5 MB</p>
          <div className="mt-5" onClick={(e) => e.stopPropagation()}>
            <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={disabled} iconLeft={<Upload className="h-4 w-4" />}>
              Browse files
            </Button>
          </div>
          <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#223027] bg-[#0F1512]">
          <div className="relative">
            <img src={previewUrl} alt="Uploaded street preview" className="h-64 w-full object-cover" />
            <div className="absolute top-3 right-3 flex gap-2">
              <span className="rounded-full bg-black/60 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-white flex items-center gap-1.5">
                <FileImage className="h-3 w-3" /> Preview
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#F5F7F6]">{file?.name}</p>
              <p className="mt-0.5 text-xs text-[#6B7280] tabular-nums">{file ? `${(file.size / 1024).toFixed(1)} KB · ${file.type.split('/')[1]?.toUpperCase()}` : ''}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={disabled} iconLeft={<RefreshCw className="h-3.5 w-3.5" />}>Replace</Button>
              <Button variant="danger" size="sm" onClick={onRemove} disabled={disabled} iconLeft={<X className="h-3.5 w-3.5" />}>Remove</Button>
            </div>
            <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
          </div>
        </div>
      )}
      {localError && (
        <div className="rounded-xl border border-[#EF44444D] bg-[#EF44441A] px-4 py-2.5 text-sm text-[#EF4444] animate-slide-up">{localError}</div>
      )}
    </div>
  )
}
