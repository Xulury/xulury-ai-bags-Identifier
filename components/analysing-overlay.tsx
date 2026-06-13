'use client'

import { useEffect, useState } from 'react'

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

export function AnalysingOverlay({ onComplete }: AnalysingOverlayProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const pct = Math.min(100, ((now - start) / DURATION_MS) * 100)
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
  const circumference = 2 * Math.PI * 52

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background"
      role="status"
      aria-live="polite"
    >
      {/* Page content — centered column */}
      <div className="flex flex-1 flex-col items-center px-6 pt-6">
        <h1 className="mb-1 font-serif text-[1.6rem] font-semibold tracking-tight text-foreground">
          Analyzing your bag
        </h1>
        <p className="mb-6 text-center text-[13px] leading-relaxed text-muted-foreground">
          Our AI is checking visual details and matching trusted product
          references.
        </p>

        {/* Circular progress ring around bag icon */}
        <div className="relative flex items-center justify-center">
          {/* Inner bag card */}
          <div className="flex size-40 items-center justify-center rounded-2xl bg-secondary/60">
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              aria-hidden="true"
              className="text-foreground/60"
            >
              <path
                d="M27 32V25C27 19.477 31.477 15 37 15H43C48.523 15 53 19.477 53 25V32"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <rect
                x="9"
                y="32"
                width="62"
                height="40"
                rx="7"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <circle cx="40" cy="52" r="5.5" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </div>

          {/* SVG ring */}
          <svg
            className="absolute -rotate-90"
            width="196"
            height="196"
            viewBox="0 0 120 120"
            aria-hidden="true"
          >
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="var(--border)"
              strokeWidth="2"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="var(--gold)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (progress / 100) * circumference}
            />
          </svg>
        </div>

        {/* Status text */}
        <p className="mt-4 font-semibold text-foreground">
          {STATUS_TEXTS[statusIndex]}
        </p>

        {/* Thin progress bar */}
        <div className="mt-3 h-1 w-full max-w-xs overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-[var(--gold)] transition-all duration-150"
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
