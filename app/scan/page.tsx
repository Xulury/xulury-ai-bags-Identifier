'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sun, Maximize, CloudOff, Sparkles, Loader2, AlertTriangle } from 'lucide-react'
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
  const [notBagWarning, setNotBagWarning] = useState<string | null>(null)

  // Stable reference — prevents AnalysingOverlay from restarting its RAF loop
  // when a React re-render (e.g. from setResult) creates a new inline function.
  const handleAnalysisComplete = useCallback(() => setAnalysisDone(true), [])

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
    setNotBagWarning(null)
  }

  async function handleIdentify() {
    if (!file) return
    setNotBagWarning(null)
    setPhase('analysing')
    setAnalysisDone(false)
    try {
      const res = await identifyHandbag(file)
      setResult(res)
    } catch (err: any) {
      console.error('[v0] identify error:', err)
      if (typeof err.message === 'string' && err.message.startsWith('NOT_A_BAG:')) {
        setNotBagWarning(err.message.slice(10))
      } else {
        toast.error(err.message || 'Failed to identify handbag. Please try again.')
      }
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
          onComplete={handleAnalysisComplete}
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
            onSelect={(f) => { setNotBagWarning(null); setFile(f) }}
            onClear={handleClear}
          />

          {/* Not-a-bag warning */}
          {notBagWarning && (
            <div className="mt-3 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/40 dark:bg-amber-900/20">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">No handbag detected</p>
                <p className="mt-0.5 text-sm text-amber-700 dark:text-amber-300">
                  {notBagWarning} Please upload a clear photo of a luxury handbag.
                </p>
              </div>
            </div>
          )}

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
