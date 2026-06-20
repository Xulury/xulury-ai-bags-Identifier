import Image from 'next/image'
import { cn } from '@/lib/utils'

const STEPS = [
  {
    image: '/Assets/hiw-1.png',
    label: 'Upload or capture',
    description:
      'Snap a clear photo of your handbag, or upload one straight from your gallery.',
  },
  {
    image: '/Assets/hiw-2.png',
    label: 'AI Analysis Details',
    description:
      'Our AI scans the silhouette, hardware and material to find the closest catalogue match.',
  },
  {
    image: '/Assets/hiw-3.jpg',
    label: 'Market References',
    description:
      'Get the brand, model, full specifications and an estimated market value.',
  },
]

interface HowItWorksStepsProps {
  /** Compact image-only cards for the mobile home page. */
  compact?: boolean
  className?: string
}

export function HowItWorksSteps({ compact, className }: HowItWorksStepsProps) {
  if (compact) {
    return (
      <ol className={cn('grid grid-cols-3 gap-3', className)}>
        {STEPS.map((step, i) => (
          <li key={step.label} className="flex flex-col gap-2">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-secondary shadow-sm">
              <Image
                src={step.image}
                alt={step.label}
                fill
                className="object-cover"
                sizes="33vw"
              />
              <span className="absolute left-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-background/95 text-[11px] font-bold text-foreground shadow-sm">
                {i + 1}
              </span>
            </div>
            <p className="text-center text-[11px] leading-snug font-medium text-foreground">
              {step.label}
            </p>
          </li>
        ))}
      </ol>
    )
  }

  return (
    <ol className={cn('grid gap-6 sm:grid-cols-3', className)}>
      {STEPS.map((step, i) => (
        <li key={step.label} className="flex flex-col gap-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-secondary shadow-sm">
            <Image
              src={step.image}
              alt={step.label}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <span className="absolute left-3 top-3 flex size-8 items-center justify-center rounded-full border border-[var(--gold)]/40 bg-background/95 font-serif text-sm font-semibold text-[var(--gold)] shadow-sm backdrop-blur-sm">
              {i + 1}
            </span>
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold">{step.label}</h3>
            <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
