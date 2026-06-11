import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="flex h-full flex-col gap-3 border-border/70 bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <span className="flex size-11 items-center justify-center rounded-full bg-[var(--gold)]/12 text-[var(--gold)]">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3 className="font-serif text-lg font-semibold">{title}</h3>
      <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </Card>
  )
}
