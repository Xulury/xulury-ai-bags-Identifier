'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { BadgeCheck, ChevronRight, CircleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ScanHistoryItem } from '@/lib/types'

function formatPrice(item: ScanHistoryItem) {
  const fmt = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: item.currency,
    maximumFractionDigits: 0,
  })
  return `${fmt.format(item.priceLow)} – ${fmt.format(item.priceHigh)}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function HistoryCard({ item }: { item: ScanHistoryItem }) {
  const router = useRouter()
  const confirmed = item.status === 'confirmed'

  return (
    <button
      type="button"
      onClick={() => router.push(`/result?id=${item.id}`)}
      className="group flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-3 text-left transition-colors hover:border-accent/50"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary">
        {item.uploadedImage ? (
          <Image
            src={item.uploadedImage || "/placeholder.svg"}
            alt={`${item.brand} ${item.model}`}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
              confirmed
                ? 'bg-accent/15 text-accent-foreground'
                : 'bg-secondary text-muted-foreground',
            )}
          >
            {confirmed ? (
              <BadgeCheck className="h-3 w-3 text-accent" />
            ) : (
              <CircleAlert className="h-3 w-3" />
            )}
            {confirmed ? 'Confirmed' : 'Needs review'}
          </span>
        </div>
        <h3 className="mt-1 truncate font-serif text-lg leading-tight text-foreground">
          {item.brand}
        </h3>
        <p className="truncate text-sm text-muted-foreground">{item.model}</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {formatDate(item.createdAt)}
          </span>
          <span className="text-xs font-medium text-foreground">
            {formatPrice(item)}
          </span>
        </div>
      </div>

      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </button>
  )
}
