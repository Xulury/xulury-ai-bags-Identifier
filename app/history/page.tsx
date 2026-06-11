'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { HistoryCard } from '@/components/history-card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useScanHistory } from '@/hooks/use-scan-history'
import { clearScanHistory } from '@/lib/scan-storage'

export default function HistoryPage() {
  const history = useScanHistory()
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <AppShell>
      <section className="mx-auto w-full max-w-2xl px-5 py-8 md:py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
              Your archive
            </p>
            <h1 className="mt-1 font-serif text-3xl text-foreground md:text-4xl">
              Scan history
            </h1>
          </div>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmOpen(true)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="mt-12 flex flex-col items-center text-center">
            <div className="relative h-40 w-40">
              <Image
                src="/bags/empty-state.png"
                alt=""
                fill
                sizes="160px"
                className="object-contain opacity-90"
              />
            </div>
            <h2 className="mt-6 font-serif text-2xl text-foreground">
              No scans yet
            </h2>
            <p className="mt-2 max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
              Identify your first handbag and it will appear here for safe
              keeping.
            </p>
            <Button asChild className="mt-6 rounded-full px-8">
              <Link href="/scan">Start a scan</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            {history.map((item) => (
              <HistoryCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              Clear history?
            </DialogTitle>
            <DialogDescription>
              This permanently removes all {history.length} saved scans from this
              device. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearScanHistory()
                setConfirmOpen(false)
              }}
            >
              Clear everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
