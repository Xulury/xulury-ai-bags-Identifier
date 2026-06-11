'use client'

import Image from 'next/image'
import { motion } from 'motion/react'

interface FloatingBag {
  src: string
  alt: string
  className: string
  size: number
  delay: number
  duration: number
}

const BAGS: FloatingBag[] = [
  {
    src: '/bags/hero-bag-1.png',
    alt: 'Floating luxury top-handle handbag',
    className: 'left-1/2 top-2 -translate-x-1/2 z-20',
    size: 190,
    delay: 0,
    duration: 5.5,
  },
  {
    src: '/bags/hero-bag-2.png',
    alt: 'Floating quilted shoulder bag',
    className: 'left-2 top-28 z-10 sm:left-6',
    size: 130,
    delay: 0.8,
    duration: 6.5,
  },
  {
    src: '/bags/hero-bag-3.png',
    alt: 'Floating mini top-handle handbag',
    className: 'right-2 top-32 z-10 sm:right-6',
    size: 120,
    delay: 1.4,
    duration: 6,
  },
]

export function FloatingBagHero() {
  return (
    <div
      className="relative mx-auto h-72 w-full max-w-md sm:h-80"
      aria-hidden="true"
    >
      {/* Soft floor shadow */}
      <div className="absolute bottom-6 left-1/2 h-6 w-56 -translate-x-1/2 rounded-[100%] bg-foreground/10 blur-xl" />

      {BAGS.map((bag) => (
        <motion.div
          key={bag.src}
          className={`absolute ${bag.className}`}
          initial={{ y: 0 }}
          animate={{ y: [0, -14, 0] }}
          transition={{
            duration: bag.duration,
            delay: bag.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Decorative suspension cord */}
          <span
            className="absolute -top-16 left-1/2 h-16 w-px -translate-x-1/2 bg-gradient-to-b from-transparent to-[var(--gold)]/50"
            aria-hidden="true"
          />
          <Image
            src={bag.src || '/placeholder.svg'}
            alt={bag.alt}
            width={bag.size}
            height={bag.size}
            priority
            className="h-auto w-auto drop-shadow-[0_18px_24px_rgba(36,28,24,0.18)]"
            style={{ width: bag.size, height: 'auto' }}
          />
        </motion.div>
      ))}
    </div>
  )
}
