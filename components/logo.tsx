import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <span className={cn('inline-flex flex-col', className)}>
      <span className="font-sans text-xl font-bold leading-tight tracking-tight text-foreground">
        XULURY
      </span>
      <span className="text-[9px] font-semibold uppercase leading-none tracking-[0.14em] text-[var(--gold)]">
        LUXURY BAG IDENTIFIER
      </span>
    </span>
  )
}
