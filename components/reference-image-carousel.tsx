import Image from 'next/image'
import type { ReferenceImage } from '@/lib/types'

interface ReferenceImageCarouselProps {
  images: ReferenceImage[]
}

export function ReferenceImageCarousel({
  images,
}: ReferenceImageCarouselProps) {
  return (
    <div
      className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
      role="list"
      aria-label="Reference images"
    >
      {images.map((img) => (
        <figure
          key={img.id}
          role="listitem"
          className="w-40 shrink-0 snap-start sm:w-44"
        >
          <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-card">
            <Image
              src={img.url || '/placeholder.svg'}
              alt={img.caption}
              fill
              className="object-cover"
              sizes="176px"
            />
          </div>
          <figcaption className="mt-2 text-xs text-muted-foreground">
            {img.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
