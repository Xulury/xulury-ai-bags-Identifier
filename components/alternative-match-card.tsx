import Image from 'next/image'
import type { AlternativeMatch } from '@/lib/types'
import { Card } from '@/components/ui/card'

interface AlternativeMatchCardProps {
  match: AlternativeMatch
}

export function AlternativeMatchCard({ match }: AlternativeMatchCardProps) {
  return (
    <Card className="flex items-center gap-4 border-border/70 p-3">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
        <Image
          src={match.imageUrl || '/placeholder.svg'}
          alt={`${match.brand} ${match.model}`}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{match.brand}</p>
        <p className="truncate font-medium">{match.model}</p>
      </div>
      <div className="flex flex-col items-end">
        <span className="font-serif text-lg font-semibold text-[var(--gold)]">
          {match.confidence}%
        </span>
        <span className="text-[11px] text-muted-foreground">match</span>
      </div>
    </Card>
  )
}
