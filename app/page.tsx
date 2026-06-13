import Link from 'next/link'
import { Zap, BadgeDollarSign, Library, Users } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { HomeHero } from '@/components/home-hero'
import { HowItWorksSteps } from '@/components/how-it-works-steps'
import { FeatureCard } from '@/components/feature-card'
import { Button } from '@/components/ui/button'

const FEATURES = [
  {
    icon: Zap,
    title: 'Instant Identification',
    description:
      'Get a brand and model match in seconds from a single, clear photograph.',
  },
  {
    icon: BadgeDollarSign,
    title: 'Estimated Price Range',
    description:
      'See an indicative market value to understand what a piece may be worth.',
  },
  {
    icon: Library,
    title: 'Growing Catalogue',
    description:
      'Accuracy improves as our reference catalogue of luxury houses expands.',
  },
  {
    icon: Users,
    title: 'Community-Verified Results',
    description:
      'Confirmations and corrections from collectors help refine every match.',
  },
]

const MOBILE_STEPS = [
  { step: 1, label: 'Upload\nor capture' },
  { step: 2, label: 'AI scans\ndetails' },
  { step: 3, label: 'Review\nsources' },
]

export default function HomePage() {
  return (
    <AppShell>
      {/* ─── Mobile: iOS-style home ─── */}
      <div className="flex flex-col px-4 pt-6 pb-4 md:hidden">
        <h1 className="font-serif text-[1.85rem] font-semibold leading-tight tracking-tight text-foreground">
          Identify your luxury bag from a single image.
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Scan the bag to find its brand, model, variant, estimated value and
          verified buying sources.
        </p>

        {/* Upload zone */}
        <Link href="/scan" className="mt-5 block" aria-label="Upload bag image">
          <div className="flex flex-col items-center justify-center rounded-2xl bg-secondary/60 px-6 py-10">
            {/* Bag illustration */}
            <svg
              width="88"
              height="88"
              viewBox="0 0 88 88"
              fill="none"
              aria-hidden="true"
              className="mb-5 text-foreground/70"
            >
              <path
                d="M30 34V26C30 19.373 35.373 14 42 14H46C52.627 14 58 19.373 58 26V34"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <rect
                x="10"
                y="34"
                width="68"
                height="46"
                rx="8"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle
                cx="44"
                cy="57"
                r="6"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>

            <span className="rounded-full bg-foreground px-7 py-3 text-xs font-bold uppercase tracking-widest text-background">
              Upload Bag Image
            </span>
          </div>
        </Link>

        {/* How it works */}
        <div className="mt-6">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--gold)]">
            How It Works
          </p>
          <div className="grid grid-cols-3 gap-2">
            {MOBILE_STEPS.map(({ step, label }) => (
              <div
                key={step}
                className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3"
              >
                <span className="flex size-6 items-center justify-center rounded-full border border-border text-[11px] font-semibold text-foreground">
                  {step}
                </span>
                <p className="whitespace-pre-line text-xs leading-snug text-foreground">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Desktop: marketing layout ─── */}
      <div className="hidden md:block">
        <HomeHero />

        {/* How it works */}
        <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <header className="mb-10 max-w-2xl">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--gold)]">
              How It Works
            </p>
            <h2 className="text-balance font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Three steps to a confident match
            </h2>
          </header>
          <HowItWorksSteps />
        </section>

        {/* Features */}
        <section className="border-y border-border/70 bg-card/50">
          <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <header className="mb-10 max-w-2xl">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--gold)]">
                Designed for collectors and shoppers
              </p>
              <h2 className="text-balance font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                Thoughtful tools for the discerning eye
              </h2>
            </header>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f) => (
                <FeatureCard key={f.title} {...f} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="relative overflow-hidden rounded-3xl bg-[var(--charcoal)] px-6 py-14 text-center text-[var(--charcoal-foreground)] sm:px-12 sm:py-20">
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  'radial-gradient(50% 60% at 50% 0%, color-mix(in oklch, var(--gold) 30%, transparent), transparent 70%)',
              }}
              aria-hidden="true"
            />
            <h2 className="relative text-balance font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Have a bag in mind?
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-pretty text-sm leading-relaxed text-[var(--charcoal-foreground)]/70 sm:text-base">
              Identify it in seconds. No account required to get started.
            </p>
            <Button
              size="lg"
              className="relative mt-7 h-12 rounded-full bg-[var(--gold)] px-8 text-base text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
              render={<Link href="/scan">Start Scanning</Link>}
            />
          </div>
        </section>
      </div>
    </AppShell>
  )
}
