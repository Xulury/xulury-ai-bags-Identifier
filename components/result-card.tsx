'use client'

import Image from 'next/image'
import { formatPriceRange } from '@/lib/identify-service'
import type { BagIdentificationResult } from '@/lib/types'

interface ResultCardProps {
  result: BagIdentificationResult
}

export function ResultCard({ result }: ResultCardProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Bag image — full width warm card */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-secondary/60">
        <div className="relative aspect-[4/3] w-full">
          {result.uploadedImage ? (
            <Image
              src={result.uploadedImage}
              alt={`Your scan of the ${result.brand} ${result.model}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 672px"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <svg
                width="80"
                height="80"
                viewBox="0 0 80 80"
                fill="none"
                aria-hidden="true"
                className="text-foreground/40"
              >
                <path
                  d="M27 32V25C27 19.477 31.477 15 37 15H43C48.523 15 53 19.477 53 25V32"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <rect x="9" y="32" width="62" height="40" rx="7" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="40" cy="52" r="5.5" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </div>
          )}
        </div>

        {/* Match confidence badge — bottom left */}
        <div className="absolute bottom-3 left-3 rounded-full border border-[var(--gold)] bg-background/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-foreground backdrop-blur-sm">
          {result.confidence}% Match
        </div>
      </div>

      {/* Brand / model / variant */}
      <div>
        <p className="text-sm font-semibold text-[var(--gold)]">{result.brand}</p>
        <h2 className="font-serif text-3xl font-bold leading-tight text-foreground">
          {result.model}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{result.category}</p>
      </div>

      {/* Price card */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground">Estimated market price</p>
        <p className="mt-1 font-serif text-2xl font-semibold text-foreground">
          {formatPriceRange(result.priceLow, result.priceHigh, result.currency)}
        </p>
      </div>

      {/* Identified Details */}
      <div>
        <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--gold)]">
          Identified Details
        </p>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-muted-foreground">Brand</span>
            <span className="text-sm font-semibold text-foreground">{result.brand}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-muted-foreground">Model</span>
            <span className="text-sm font-semibold text-foreground">{result.model}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-muted-foreground">Variant</span>
            <span className="text-sm font-semibold text-foreground">{result.category}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
