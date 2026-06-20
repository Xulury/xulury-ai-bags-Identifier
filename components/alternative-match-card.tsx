import { Tag } from 'lucide-react'
import type { AlternativeMatch } from '@/lib/types'

interface AlternativeMatchCardProps {
  match: AlternativeMatch
}

export function AlternativeMatchCard({ match }: AlternativeMatchCardProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-full border border-border bg-card px-4 py-2.5 shadow-sm">
      <Tag className="size-3.5 shrink-0 text-[var(--gold)]" aria-hidden="true" />
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {match.brand}
      </span>
      <span className="text-sm font-semibold text-foreground">{match.model}</span>
    </div>
  )
}
