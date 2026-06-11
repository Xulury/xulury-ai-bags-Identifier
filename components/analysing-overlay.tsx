'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Sparkles } from 'lucide-react'
import { motion } from 'motion/react'

const STATUSES = [
  'Examining shape and silhouette',
  'Comparing distinctive details',
  'Searching the luxury catalogue',
  'Preparing your match',
]

const DURATION_MS = 2800

interface AnalysingOverlayProps {
  imageSrc: string
  onComplete: () => void
}

export function AnalysingOverlay({
  imageSrc,
  onComplete,
}: AnalysingOverlayProps) {
  const [statusIndex, setStatusIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  // Rotate the status text.
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((i) => (i + 1) % STATUSES.length)
    }, DURATION_MS / STATUSES.length)
    return () => clearInterval(interval)
  }, [])

  // Drive the circular progress + completion.
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

  const circumference = 2 * Math.PI * 52

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--charcoal)] px-6 text-[var(--charcoal-foreground)]"
      role="status"
      aria-live="polite"
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        {/* Image with scanning line + circular progress overlay */}
        <div className="relative size-60 sm:size-64">
          <div className="relative size-full overflow-hidden rounded-2xl border border-white/10">
            <Image
              src={imageSrc || '/placeholder.svg'}
              alt="Analysing your handbag"
              fill
              className="object-cover opacity-90"
              sizes="256px"
            />
            {/* Scanning line */}
            <span
              className="absolute inset-x-0 h-0.5 bg-[var(--gold)] shadow-[0_0_18px_4px_var(--gold)]"
              style={{ animation: 'scan-line 2.2s ease-in-out infinite' }}
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--charcoal)]/40 to-transparent" />
          </div>

          {/* Circular progress ring */}
          <svg
            className="absolute -inset-3 size-[calc(100%+1.5rem)] -rotate-90"
            viewBox="0 0 120 120"
            aria-hidden="true"
          >
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-white/10"
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

          {/* Magical Sprinkles Effect */}
          <motion.div
            className="absolute -right-4 -top-4 z-10 text-[var(--gold)] drop-shadow-md"
            animate={{ rotate: 180, scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            <Sparkles className="size-7" />
          </motion.div>
          
          <motion.div
            className="absolute top-1/2 -left-5 z-10 text-[var(--gold)]/80 drop-shadow-sm"
            animate={{ rotate: -180, scale: [0.8, 1.1, 0.8], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            <Sparkles className="size-5" />
          </motion.div>
          
          <motion.div
            className="absolute -bottom-2 right-8 z-10 text-[var(--gold)]/90 drop-shadow-sm"
            animate={{ rotate: 90, scale: [0.9, 1.2, 0.9], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 1, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            <Sparkles className="size-4" />
          </motion.div>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <p className="font-serif text-xl font-semibold">Identifying…</p>
          <motion.p
            key={statusIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-sm text-[var(--charcoal-foreground)]/70"
          >
            {STATUSES[statusIndex]}
          </motion.p>
        </div>
      </div>
    </div>
  )
}
