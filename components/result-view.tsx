'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Check,
  PencilLine,
  RotateCcw,
  Share2,
  ArrowLeft,
} from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { ResultCard } from '@/components/result-card'
import { ReferenceImageCarousel } from '@/components/reference-image-carousel'
import { AlternativeMatchCard } from '@/components/alternative-match-card'
import { CorrectionSheet } from '@/components/correction-sheet'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getLastResult, updateScanStatus } from '@/lib/scan-storage'
import { submitIdentificationFeedback } from '@/lib/identify-service'
import type { BagIdentificationResult } from '@/lib/types'
import { toast } from 'sonner'

export function ResultView() {
  const router = useRouter()
  const [result, setResult] = useState<BagIdentificationResult | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [correctionOpen, setCorrectionOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setResult(getLastResult())
    setLoaded(true)
  }, [])

  async function handleConfirm() {
    if (!result) return
    setSubmitting(true)
    await submitIdentificationFeedback({ scanId: result.id, type: 'confirm' })
    updateScanStatus(result.id, 'confirmed')
    setSubmitting(false)
    setConfirmOpen(true)
  }

  async function handleCorrection(data: {
    correctBrand: string
    correctModel: string
    note?: string
  }) {
    if (!result) return
    setSubmitting(true)
    await submitIdentificationFeedback({
      scanId: result.id,
      type: 'correction',
      correctBrand: data.correctBrand,
      correctModel: data.correctModel,
      note: data.note,
    })
    updateScanStatus(result.id, 'confirmed')
    setSubmitting(false)
    setCorrectionOpen(false)
    toast.success('Thank you — your correction has been submitted.')
  }

  async function handleShare() {
    if (!result) return
    const shareData = {
      title: 'LuxeLens result',
      text: `Identified: ${result.brand} ${result.model} (${result.confidence}% match)`,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareData.text)
        toast.success('Result copied to clipboard.')
      }
    } catch {
      /* user dismissed */
    }
  }

  if (loaded && !result) {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 px-4 py-24 text-center">
          <h1 className="font-serif text-2xl font-semibold">
            No result to show
          </h1>
          <p className="text-sm text-muted-foreground">
            Start a new scan to identify a handbag.
          </p>
          <Button
            size="lg"
            className="rounded-full"
            render={<Link href="/scan">Scan a Bag</Link>}
          />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2"
          render={
            <Link href="/scan">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Scan another
            </Link>
          }
        />

        {result && (
          <div className="flex flex-col gap-8">
            <ResultCard result={result} />

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  size="lg"
                  className="h-12 rounded-full"
                  disabled={submitting}
                  onClick={handleConfirm}
                >
                  <Check className="size-4" aria-hidden="true" />
                  Confirm Match
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full"
                  onClick={() => setCorrectionOpen(true)}
                >
                  <PencilLine className="size-4" aria-hidden="true" />
                  Suggest a Correction
                </Button>
              </div>
              <div className="flex gap-3">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-11 flex-1 rounded-full"
                  render={
                    <Link href="/scan">
                      <RotateCcw className="size-4" aria-hidden="true" />
                      Scan Another Bag
                    </Link>
                  }
                />
                <Button
                  size="icon-lg"
                  variant="outline"
                  className="size-11 rounded-full"
                  aria-label="Share this result"
                  onClick={handleShare}
                >
                  <Share2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>

            {/* Reference images */}
            <section>
              <h2 className="mb-3 font-serif text-xl font-semibold">
                Detailed view
              </h2>
              <ReferenceImageCarousel images={result.referenceImages} />
            </section>

            {/* Shopping Sources */}
            {result.sources && result.sources.length > 0 && (
              <section>
                <h2 className="mb-3 font-serif text-xl font-semibold">
                  Where to find it
                </h2>
                <div className="flex flex-col gap-2">
                  {result.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <span className="font-medium">{source.name}</span>
                      <span className="text-xs text-muted-foreground underline underline-offset-2">
                        View source
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Alternatives */}
            <section>
              <h2 className="mb-3 font-serif text-xl font-semibold">
                All the possible matches
              </h2>
              <div className="flex flex-col gap-3">
                {result.alternativeMatches.map((m) => (
                  <AlternativeMatchCard key={m.id} match={m} />
                ))}
              </div>
            </section>

            <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
              LuxeLens provides visual identification and indicative pricing
              only. Results do not confirm authenticity.
            </p>
          </div>
        )}
      </div>

      {/* Confirmation success modal */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="text-center">
          <DialogHeader className="items-center">
            <span className="mb-1 flex size-14 items-center justify-center rounded-full bg-[var(--gold)]/15 text-[var(--gold)]">
              <Check className="size-7" aria-hidden="true" />
            </span>
            <DialogTitle className="font-serif text-xl">Thank you</DialogTitle>
            <DialogDescription>
              Your feedback helps improve future results.
            </DialogDescription>
          </DialogHeader>
          <Button
            size="lg"
            className="h-11 w-full rounded-full"
            onClick={() => setConfirmOpen(false)}
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>

      {/* Correction sheet/modal */}
      <CorrectionSheet
        open={correctionOpen}
        onOpenChange={setCorrectionOpen}
        onSubmit={handleCorrection}
        submitting={submitting}
      />
    </AppShell>
  )
}
