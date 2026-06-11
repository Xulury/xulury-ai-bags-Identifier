import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  /** Size of the line icon in pixels. */
  iconSize?: number
  showWordmark?: boolean
}

/**
 * LuxeLens brand mark: a minimal line "lens over a bag" icon plus the wordmark.
 * Decorative icon — labelled via the wordmark text, hidden from AT.
 */
export function Logo({
  className,
  iconSize = 24,
  showWordmark = true,
}: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="text-[var(--gold)]"
      >
        {/* Handbag body */}
        <path d="M4 9.5h16l-1 10.5H5L4 9.5Z" />
        {/* Handle */}
        <path d="M8.5 9.5V7a3.5 3.5 0 0 1 7 0v2.5" />
        {/* Lens / focus dot */}
        <circle cx="12" cy="14.5" r="2.4" />
      </svg>
      {showWordmark && (
        <span className="font-serif text-lg font-semibold tracking-tight">
          LuxeLens
        </span>
      )}
    </span>
  )
}
