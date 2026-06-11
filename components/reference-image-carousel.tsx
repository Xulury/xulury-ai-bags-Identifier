'use client'

import { useState } from 'react'
import type { ReferenceImage } from '@/lib/types'

interface ReferenceImageCarouselProps {
  images: ReferenceImage[]
}

function ReferenceImageItem({ img }: { img: ReferenceImage }) {
  const [failed, setFailed] = useState(false)
  const src = img.url && img.url !== '/placeholder.svg' && !failed ? img.url : '/placeholder.svg'

  return (
    <figure role="listitem" className="w-40 shrink-0 snap-start sm:w-44">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={img.caption}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      </div>
      <figcaption className="mt-2 text-xs text-muted-foreground">
        {img.caption}
      </figcaption>
    </figure>
  )
}

export function ReferenceImageCarousel({ images }: ReferenceImageCarouselProps) {
  return (
    <div
      className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
      role="list"
      aria-label="Reference images"
    >
      {images.map((img) => (
        <ReferenceImageItem key={img.id} img={img} />
      ))}
    </div>
  )
}
