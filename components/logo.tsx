import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  /** Show the "XULURY IS LUXURY" tagline beneath the wordmark. */
  withTagline?: boolean
  /** Rendered height in pixels — width is derived from the asset's aspect ratio. */
  height?: number
}

const WORDMARK_RATIO = 1493 / 294 // logo-compact.png
const FULL_RATIO = 1493 / 424 // logo-mark.png

export function Logo({ className, withTagline = false, height = 28 }: LogoProps) {
  const ratio = withTagline ? FULL_RATIO : WORDMARK_RATIO
  return (
    <Image
      src={withTagline ? '/Assets/logo-mark.png' : '/Assets/logo-compact.png'}
      alt="XULURY"
      height={height}
      width={Math.round(height * ratio)}
      priority
      className={cn('h-auto w-auto object-contain', className)}
      style={{ height, width: 'auto' }}
    />
  )
}
