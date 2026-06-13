'use client'

import { useRef, useState, type DragEvent } from 'react'
import { Camera, ImagePlus, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImagePreview } from '@/components/image-preview'
import { cn } from '@/lib/utils'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

interface ScanUploaderProps {
  file: File | null
  previewUrl: string | null
  onSelect: (file: File) => void
  onClear: () => void
}

export function ScanUploader({
  file,
  previewUrl,
  onSelect,
  onClear,
}: ScanUploaderProps) {
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  function validateAndSelect(selected: File | undefined | null) {
    if (!selected) return
    if (!ACCEPTED.includes(selected.type)) {
      setError('Please use a JPG, PNG or WEBP image.')
      return
    }
    if (selected.size > MAX_BYTES) {
      setError('Image is too large. Maximum size is 10 MB.')
      return
    }
    setError(null)
    onSelect(selected)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    validateAndSelect(e.dataTransfer.files?.[0])
  }

  if (previewUrl) {
    return (
      <ImagePreview
        src={previewUrl}
        fileName={file?.name}
        onRemove={onClear}
        onReplace={() => galleryInputRef.current?.click()}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => galleryInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            galleryInputRef.current?.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        aria-label="Upload a handbag photo"
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-card px-4 py-8 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
          dragging
            ? 'border-[var(--gold)] bg-[var(--gold)]/5'
            : 'border-border hover:border-[var(--gold)]/60',
        )}
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-[var(--gold)]/12 text-[var(--gold)]">
          <UploadCloud className="size-6" aria-hidden="true" />
        </span>
        <p className="font-serif text-lg font-semibold">
          Add a photo of your handbag
        </p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Tap to browse, or drag and drop an image here. JPG, PNG or WEBP up to
          10&nbsp;MB.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-12 rounded-xl"
          onClick={() => cameraInputRef.current?.click()}
        >
          <Camera className="size-4" aria-hidden="true" />
          Take a Photo
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-12 rounded-xl"
          onClick={() => galleryInputRef.current?.click()}
        >
          <ImagePlus className="size-4" aria-hidden="true" />
          Upload from Gallery
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Hidden inputs */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => validateAndSelect(e.target.files?.[0])}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="sr-only"
        onChange={(e) => validateAndSelect(e.target.files?.[0])}
      />
    </div>
  )
}
