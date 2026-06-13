'use client'

import { useState } from 'react'
import { ExternalLink, ShoppingBag, Star, Info, ShieldCheck } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ShoppingSource } from '@/lib/types'

interface MobileSourceQuickViewProps {
  source: ShoppingSource | null
  onClose: () => void
}

export function MobileSourceQuickView({ source, onClose }: MobileSourceQuickViewProps) {
  const [imgFailed, setImgFailed] = useState(false)

  if (!source) return null

  const showImage = source.imageUrl && source.imageUrl !== '/placeholder.svg' && !imgFailed

  return (
    <Drawer open={!!source} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh] flex flex-col">
        <div className="flex-1 overflow-y-auto safe-bottom pb-4">
          <div className="relative aspect-square w-full bg-background/60">
            {showImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={source.imageUrl}
                alt={source.bagName}
                className="h-full w-full object-cover"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground/40">
                <ShoppingBag className="size-16" />
                <span className="text-sm">No image available</span>
              </div>
            )}
            <div className="absolute right-3 top-3 rounded-full bg-background/80 backdrop-blur-md border border-border/50 px-2.5 py-1 text-xs font-medium shadow-sm">
              {source.sourceName}
            </div>
          </div>

          <div className="px-5 pt-5 pb-2">
            <div className="flex flex-col gap-1.5 mb-5">
              <span className="text-xs font-semibold tracking-widest text-[var(--gold)] uppercase">
                {source.brand}
              </span>
              <DrawerTitle className="font-serif text-xl leading-snug">
                {source.bagName}
              </DrawerTitle>
            </div>

            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Listed Price</p>
                <p className="font-serif text-3xl font-semibold">
                  {source.price || 'N/A'}
                </p>
              </div>
              {source.rating != null && (
                <div className="flex items-center gap-1 rounded-lg bg-secondary/50 px-2.5 py-1.5">
                  <Star className="size-4 fill-[var(--gold)] text-[var(--gold)]" />
                  <span className="font-medium text-sm">{source.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            <div className="mb-6 rounded-xl border border-border/50 bg-secondary/20 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-500" />
                <div className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-foreground">Verified Source</span>
                  <span className="text-muted-foreground leading-relaxed">
                    This listing originates from a trusted secondary market platform.
                  </span>
                </div>
              </div>
            </div>

            <Button
              asChild
              size="lg"
              className="w-full h-14 rounded-full text-base font-medium shadow-md"
            >
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 size-5" />
                View Source Website
              </a>
            </Button>
            
            <p className="mt-4 text-center text-xs text-muted-foreground">
              You will be redirected to {source.sourceName}.
            </p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
