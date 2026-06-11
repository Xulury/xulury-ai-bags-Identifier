'use client'

import Image from 'next/image'
import { X, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImagePreviewProps {
  src: string
  fileName?: string
  onRemove: () => void
  onReplace: () => void
}

export function ImagePreview({
  src,
  fileName,
  onRemove,
  onReplace,
}: ImagePreviewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
        <div className="relative aspect-square w-full">
          <Image
            src={src || '/placeholder.svg'}
            alt={fileName ? `Preview of ${fileName}` : 'Uploaded handbag preview'}
            fill
            className="object-contain"
            sizes="(max-width: 640px) 100vw, 480px"
          />
        </div>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          onClick={onRemove}
          aria-label="Remove image"
          className="absolute right-3 top-3 size-9 rounded-full bg-background/90 shadow-sm backdrop-blur"
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>
      <div className="flex items-center justify-between gap-3">
        {fileName && (
          <p className="truncate text-sm text-muted-foreground" title={fileName}>
            {fileName}
          </p>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReplace}
          className="ml-auto shrink-0"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Replace
        </Button>
      </div>
    </div>
  )
}
