'use client'

import Image from 'next/image'
import { BadgeCheck } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ConfidenceIndicator } from '@/components/confidence-indicator'
import { formatPriceRange } from '@/lib/identify-service'
import type { BagIdentificationResult } from '@/lib/types'

interface ResultCardProps {
  result: BagIdentificationResult
}

export function ResultCard({ result }: ResultCardProps) {
  return (
    <Card className="overflow-hidden border-border/70 p-0">
      <div className="flex flex-col sm:flex-row">
        {/* Uploaded image */}
        <div className="relative aspect-square w-full bg-background sm:w-2/5">
          {result.uploadedImage ? (
            <Image
              src={result.uploadedImage || '/placeholder.svg'}
              alt={`Your scan of the ${result.brand} ${result.model}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 240px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
          <Badge className="absolute left-3 top-3 gap-1 rounded-full bg-[var(--gold)] text-[var(--gold-foreground)]">
            <BadgeCheck className="size-3.5" aria-hidden="true" />
            Best Match
          </Badge>
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{result.brand}</p>
              <h2 className="font-serif text-2xl font-semibold leading-tight">
                {result.model}
              </h2>
              <Badge
                variant="secondary"
                className="mt-2 rounded-full font-normal"
              >
                {result.category}
              </Badge>
            </div>
            <div className="text-center">
              <ConfidenceIndicator value={result.confidence} />
              <p className="mt-1 text-[11px] text-muted-foreground">
                match
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background/60 p-4">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Estimated market price
            </p>
            <p className="mt-1 font-serif text-2xl font-semibold">
              {formatPriceRange(
                result.priceLow,
                result.priceHigh,
                result.currency,
              )}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Estimated price varies by condition, year and market availability.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
