'use client'

import { useState } from 'react'
import { ExternalLink, ShoppingBag, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ShoppingSource } from '@/lib/types'

interface ShoppingSourceTileProps {
  source: ShoppingSource
}

export function ShoppingSourceTile({ source }: ShoppingSourceTileProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const showImage = source.imageUrl && source.imageUrl !== '/placeholder.svg' && !imgFailed

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
      {/* Product image */}
      <div className="relative aspect-square w-full overflow-hidden bg-background/60">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={source.imageUrl}
            alt={source.bagName}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag className="size-10 text-muted-foreground/25" />
          </div>
        )}
        {/* Source platform badge */}
        <span className="absolute left-2 top-2 rounded-full border border-border/60 bg-background/90 px-2 py-0.5 text-[10px] font-medium text-foreground/80 backdrop-blur-sm">
          {source.sourceName}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {source.brand}
          </p>
          <p className="line-clamp-2 text-sm font-medium leading-snug">
            {source.bagName}
          </p>
        </div>

        {source.price && (
          <p className="text-sm font-semibold text-[var(--gold)]">{source.price}</p>
        )}

        {source.rating != null && (
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'size-3 shrink-0',
                  i < Math.round(source.rating!)
                    ? 'fill-[var(--gold)] text-[var(--gold)]'
                    : 'fill-muted text-muted-foreground/30',
                )}
              />
            ))}
            <span className="ml-0.5 text-[11px] text-muted-foreground">
              {source.rating.toFixed(1)}
            </span>
          </div>
        )}

        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex h-8 items-center justify-center gap-1.5 rounded-full bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ExternalLink className="size-3" aria-hidden="true" />
          Source
        </a>
      </div>
    </div>
  )
}
