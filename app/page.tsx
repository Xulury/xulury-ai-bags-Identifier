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
      <div className="flex flex-col md:hidden" style={{ padding: '4vw' }}>
        {/* Headline — scales with viewport width */}
        <h1
          className="font-serif font-semibold leading-tight tracking-tight text-foreground"
          style={{ fontSize: 'clamp(1.4rem, 6vw, 1.75rem)' }}
        >
          Identify your luxury bag from a single image.
        </h1>
        <p
          className="mt-2 leading-relaxed text-muted-foreground"
          style={{ fontSize: 'clamp(0.75rem, 3.5vw, 0.9rem)' }}
        >
          Scan the bag to find its brand, model, variant, estimated value and
          verified buying sources.
        </p>

        {/* Upload zone — width-relative padding so it scales on any phone */}
        <Link href="/scan" className="mt-4 block w-full" aria-label="Upload bag image">
          <div
            className="flex w-full flex-col items-center justify-center rounded-2xl bg-secondary/60"
            style={{ padding: '8vw 4vw' }}
          >
            <svg
              viewBox="0 0 88 88"
              fill="none"
              aria-hidden="true"
              className="text-foreground/70"
              style={{ width: 'clamp(56px, 18vw, 88px)', height: 'clamp(56px, 18vw, 88px)', marginBottom: '4vw' }}
            >
              <path
                d="M30 34V26C30 19.373 35.373 14 42 14H46C52.627 14 58 19.373 58 26V34"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <rect x="10" y="34" width="68" height="46" rx="8" stroke="currentColor" strokeWidth="2" />
              <circle cx="44" cy="57" r="6" stroke="currentColor" strokeWidth="2" />
            </svg>

            <span
              className="rounded-full bg-foreground font-bold uppercase tracking-widest text-background"
              style={{
                fontSize: 'clamp(0.6rem, 2.8vw, 0.75rem)',
                padding: 'clamp(8px, 2.5vw, 12px) clamp(20px, 6vw, 28px)',
              }}
            >
              Upload Bag Image
            </span>
          </div>
        </Link>

        {/* How it works */}
        <div className="mt-4">
          <p
            className="font-semibold uppercase text-[var(--gold)]"
            style={{ fontSize: 'clamp(0.55rem, 2.5vw, 0.7rem)', letterSpacing: '0.14em', marginBottom: '2vw' }}
          >
            How It Works
          </p>
          <div className="grid w-full grid-cols-3" style={{ gap: '2vw' }}>
            {MOBILE_STEPS.map(({ step, label }) => (
              <div
                key={step}
                className="flex flex-col rounded-xl border border-border bg-card"
                style={{ gap: '1.5vw', padding: '2.5vw' }}
              >
                <span
                  className="flex items-center justify-center rounded-full border border-border font-semibold text-foreground"
                  style={{
                    width: 'clamp(18px, 5vw, 24px)',
                    height: 'clamp(18px, 5vw, 24px)',
                    fontSize: 'clamp(0.55rem, 2.5vw, 0.7rem)',
                  }}
                >
                  {step}
                </span>
                <p
                  className="whitespace-pre-line leading-snug text-foreground"
                  style={{ fontSize: 'clamp(0.6rem, 2.8vw, 0.75rem)' }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Desktop: marketing layout ─── */}
      <div className="hidden w-full md:block">
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
