'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sun, Maximize, CloudOff, Sparkles, Loader2 } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { ScanUploader } from '@/components/scan-uploader'
import { AnalysingOverlay } from '@/components/analysing-overlay'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { identifyHandbag } from '@/lib/identify-service'
import { addScanToHistory, setLastResult } from '@/lib/scan-storage'
import type { BagIdentificationResult } from '@/lib/types'
import { toast } from 'sonner'

const TIPS = [
  { icon: Sun, text: 'Use natural lighting' },
  { icon: Maximize, text: 'Capture the full handbag' },
  { icon: CloudOff, text: 'Avoid heavy shadows' },
  { icon: Sparkles, text: 'Keep logos and details visible' },
]

type Phase = 'idle' | 'analysing'

export default function ScanPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [result, setResult] = useState<BagIdentificationResult | null>(null)
  const [analysisDone, setAnalysisDone] = useState(false)

  // Manage object URL lifecycle for the preview.
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function handleClear() {
    setFile(null)
  }

  async function handleIdentify() {
    if (!file) return
    setPhase('analysing')
    setAnalysisDone(false)
    try {
      // Kick off the identification request immediately. The overlay
      // animation runs in parallel; we route once BOTH finish.
      const res = await identifyHandbag(file)
      setResult(res)
    } catch (err: any) {
      console.error('[v0] identify error:', err)
      toast.error(err.message || 'Failed to identify handbag. Please try again.')
      setPhase('idle')
      setAnalysisDone(false)
    }
  }

  // When both the analysing animation AND the request have completed, persist
  // and route to the result page.
  useEffect(() => {
    if (phase === 'analysing' && analysisDone && result) {
      setLastResult(result)
      addScanToHistory(result, 'needs-review')
      router.push(`/result?id=${result.id}`)
    }
  }, [phase, analysisDone, result, router])

  return (
    <>
      {phase === 'analysing' && previewUrl && (
        <AnalysingOverlay
          imageSrc={previewUrl}
          onComplete={() => setAnalysisDone(true)}
        />
      )}

      <AppShell hideFooter>
        <div className="mx-auto w-full max-w-xl px-4 py-4 sm:px-6 sm:py-10">
          <header className="mb-4 text-center sm:text-left">
            <h1 className="text-balance font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Scan your handbag
            </h1>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
              Use a clear front-facing photo with good lighting.
            </p>
          </header>

          <ScanUploader
            file={file}
            previewUrl={previewUrl}
            onSelect={setFile}
            onClear={handleClear}
          />

          {/* Tips */}
          <Card className="mt-4 border-border/70 bg-card/60 p-4">
            <h2 className="mb-3 text-sm font-semibold">For the best results</h2>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {TIPS.map((tip) => {
                const Icon = tip.icon
                return (
                  <li
                    key={tip.text}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground"
                  >
                    <Icon
                      className="size-4 shrink-0 text-[var(--gold)]"
                      aria-hidden="true"
                    />
                    {tip.text}
                  </li>
                )
              })}
            </ul>
          </Card>

          <Button
            size="lg"
            className="mt-4 h-12 w-full rounded-full text-base"
            disabled={!file || phase === 'analysing'}
            onClick={handleIdentify}
          >
            {phase === 'analysing' ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Identifying…
              </>
            ) : (
              'Identify This Bag'
            )}
          </Button>
        </div>
      </AppShell>
    </>
  )
}
