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

export default function HomePage() {
  return (
    <AppShell>
      <div className="w-full">
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
