'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'motion/react'

const STAGES = [
  { label: 'Brand recognition', key: 'brand' },
  { label: 'Variant analysis', key: 'variant' },
  { label: 'Price-source matching', key: 'price' },
]

const STATUS_TEXTS = [
  'Checking visual details…',
  'Matching model and variant…',
  'Finding trusted sources…',
]

const DURATION_MS = 2800

interface AnalysingOverlayProps {
  imageSrc: string
  isComplete?: boolean
  onComplete: () => void
}

type StageStatus = 'done' | 'in-progress' | 'queued'

function getStageStatus(progress: number, index: number): StageStatus {
  const threshold = (index + 1) * (100 / STAGES.length)
  const current = index * (100 / STAGES.length)
  if (progress >= threshold) return 'done'
  if (progress >= current) return 'in-progress'
  return 'queued'
}

export function AnalysingOverlay({ imageSrc, isComplete, onComplete }: AnalysingOverlayProps) {
  const [progress, setProgress] = useState(0)

  const isCompleteRef = useRef(isComplete)
  useEffect(() => {
    isCompleteRef.current = isComplete
  }, [isComplete])

  useEffect(() => {
    const start = performance.now()
    let raf = 0
    let accelStart = 0
    let accelProgress = 0

    const tick = (now: number) => {
      let pct = 0
      if (isCompleteRef.current) {
        if (!accelStart) {
          accelStart = now
          accelProgress = ((now - start) / DURATION_MS) * 100
        }
        const accelElapsed = now - accelStart
        pct = accelProgress + (accelElapsed / 300) * (100 - accelProgress)
      } else {
        pct = ((now - start) / DURATION_MS) * 100
      }

      pct = Math.min(100, pct)
      setProgress(pct)
      if (pct < 100) {
        raf = requestAnimationFrame(tick)
      } else {
        onComplete()
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [onComplete])

  const statusIndex = progress < 33 ? 0 : progress < 66 ? 1 : 2

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-1 flex-col items-center px-6 pt-8">
        <h1 className="mb-1 font-serif text-[1.6rem] font-semibold tracking-tight text-foreground">
          Analyzing your bag
        </h1>
        <p className="mb-6 text-center text-[13px] leading-relaxed text-muted-foreground">
          Our AI is checking visual details and matching trusted product
          references.
        </p>

        {/* Scanning frame: the user's own photo with a moving scan beam */}
        <div className="relative mx-auto aspect-square w-full max-w-[280px] overflow-hidden rounded-3xl border border-border bg-secondary shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt="Your uploaded handbag being analyzed"
            className="h-full w-full object-cover"
          />

          {/* Subtle darkening so the gold beam reads clearly on any photo */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/15" />

          {/* Viewfinder corner brackets */}
          <div className="pointer-events-none absolute inset-3" aria-hidden="true">
            <span className="absolute left-0 top-0 size-5 rounded-tl-lg border-l-2 border-t-2 border-[var(--gold)]" />
            <span className="absolute right-0 top-0 size-5 rounded-tr-lg border-r-2 border-t-2 border-[var(--gold)]" />
            <span className="absolute bottom-0 left-0 size-5 rounded-bl-lg border-b-2 border-l-2 border-[var(--gold)]" />
            <span className="absolute bottom-0 right-0 size-5 rounded-br-lg border-b-2 border-r-2 border-[var(--gold)]" />
          </div>

          {/* Scanning beam — sweeps top to bottom and back, continuously */}
          <motion.div
            className="pointer-events-none absolute inset-x-0 h-20"
            style={{ y: '-50%' }}
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity }}
            aria-hidden="true"
          >
            <div className="h-full w-full bg-gradient-to-b from-transparent via-[var(--gold)]/35 to-transparent" />
            <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-[var(--gold)] shadow-[0_0_14px_3px_var(--gold)]" />
          </motion.div>

          {/* Live status pill */}
          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-[11px] font-medium text-foreground shadow-sm backdrop-blur-sm">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--gold)] opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-[var(--gold)]" />
            </span>
            {progress >= 100 ? 'Finalizing results…' : STATUS_TEXTS[statusIndex]}
          </div>
        </div>

        {/* Thin progress bar */}
        <div className="mt-5 h-1 w-full max-w-xs overflow-hidden rounded-full bg-border">
          <div
            className={`h-full rounded-full bg-[var(--gold)] transition-all duration-150 ${progress >= 100 ? 'animate-pulse' : ''}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Stage checklist */}
        <div className="mt-4 w-full max-w-xs divide-y divide-border">
          {STAGES.map((stage, i) => {
            const status = getStageStatus(progress, i)
            return (
              <div key={stage.key} className="flex items-center justify-between py-2.5">
                <span className="text-sm font-medium text-foreground">
                  {stage.label}
                </span>
                {status === 'done' && (
                  <span className="text-sm font-semibold text-emerald-600">
                    Done
                  </span>
                )}
                {status === 'in-progress' && (
                  <span className="text-sm font-semibold text-[var(--gold)]">
                    In progress
                  </span>
                )}
                {status === 'queued' && (
                  <span className="text-sm text-muted-foreground">Queued</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
