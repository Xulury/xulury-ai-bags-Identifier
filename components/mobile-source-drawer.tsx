'use client'

import { useState } from 'react'
import Image from 'next/image'
import { BadgeCheck, ShoppingBag, Star, ExternalLink, ChevronRight } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { MobileSourceQuickView } from '@/components/mobile-source-quick-view'
import { cn } from '@/lib/utils'
import type { ShoppingSource } from '@/lib/types'

interface MobileSourceDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sources: ShoppingSource[]
  bagName: string
  bagImage?: string | null
}

export function MobileSourceDrawer({
  open,
  onOpenChange,
  sources,
  bagName,
  bagImage,
}: MobileSourceDrawerProps) {
  const [selectedSource, setSelectedSource] = useState<ShoppingSource | null>(null)

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh] flex flex-col">
          <DrawerHeader className="text-left border-b border-border/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-background">
                {bagImage ? (
                  <Image
                    src={bagImage}
                    alt={bagName}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ShoppingBag className="size-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <DrawerTitle className="font-serif text-lg leading-tight truncate">
                  {bagName}
                </DrawerTitle>
                <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  <BadgeCheck className="size-3.5 text-[var(--gold)]" />
                  <span>Verified matches</span>
                </div>
              </div>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 py-2 safe-bottom">
            {sources.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingBag className="size-12 text-muted-foreground/20" />
                <p className="mt-4 font-serif text-lg">No sources available</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  We couldn't find any verified listings for this bag right now.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pb-6 pt-2">
                {sources.map((source, idx) => (
                  <SourceListItem 
                    key={idx} 
                    source={source} 
                    onClick={() => setSelectedSource(source)} 
                  />
                ))}
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <MobileSourceQuickView 
        source={selectedSource} 
        onClose={() => setSelectedSource(null)} 
      />
    </>
  )
}

function SourceListItem({ source, onClick }: { source: ShoppingSource; onClick: () => void }) {
  const [imgFailed, setImgFailed] = useState(false)
  const showImage = source.imageUrl && source.imageUrl !== '/placeholder.svg' && !imgFailed

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card p-2.5 text-left transition-colors active:bg-accent/10"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-background/60">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={source.imageUrl}
            alt={source.bagName}
            className="h-full w-full object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag className="size-6 text-muted-foreground/25" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-secondary-foreground uppercase">
            {source.sourceName}
          </span>
          {source.rating != null && (
            <div className="flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground">
              <Star className="size-2.5 fill-[var(--gold)] text-[var(--gold)]" />
              {source.rating.toFixed(1)}
            </div>
          )}
        </div>
        <p className="truncate text-sm font-medium leading-snug">
          {source.bagName}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-[var(--gold)]">
          {source.price || 'Price unlisted'}
        </p>
      </div>

      <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
    </button>
  )
}
