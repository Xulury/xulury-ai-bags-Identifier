import { Camera, ScanSearch, BadgeCheck } from 'lucide-react'

const STEPS = [
  {
    icon: Camera,
    title: 'Upload a clear photo',
    description:
      'Capture or upload a single, well-lit photo of the handbag you want to identify.',
  },
  {
    icon: ScanSearch,
    title: 'AI identifies the closest match',
    description:
      'Our model compares shape, hardware and distinctive details against the catalogue.',
  },
  {
    icon: BadgeCheck,
    title: 'Review the model and price estimate',
    description:
      'See the brand, model, confidence score and an indicative market value range.',
  },
]

export function HowItWorksSteps() {
  return (
    <ol className="grid gap-6 sm:grid-cols-3">
      {STEPS.map((step, i) => {
        const Icon = step.icon
        return (
          <li key={step.title} className="relative flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 font-serif text-sm font-semibold text-[var(--gold)]">
                {i + 1}
              </span>
              <Icon
                className="size-5 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <h3 className="font-serif text-lg font-semibold">{step.title}</h3>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </li>
        )
      })}
    </ol>
  )
}
