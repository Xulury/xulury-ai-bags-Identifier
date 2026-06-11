import { cn } from '@/lib/utils'

interface ConfidenceIndicatorProps {
  /** 0 - 100 */
  value: number
  size?: number
  className?: string
}

/**
 * Compact circular confidence dial.
 */
export function ConfidenceIndicator({
  value,
  size = 72,
  className,
}: ConfidenceIndicatorProps) {
  const stroke = 6
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div
      className={cn('relative inline-flex shrink-0', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${value}% match confidence`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--gold)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-base font-semibold leading-none">
          {value}%
        </span>
      </span>
    </div>
  )
}
