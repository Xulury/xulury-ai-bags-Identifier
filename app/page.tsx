import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Zap, BadgeDollarSign, Library, Users } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { HomeHero } from '@/components/home-hero'
import { HowItWorksSteps } from '@/components/how-it-works-steps'
import { FeatureCard } from '@/components/feature-card'
import { Logo } from '@/components/logo'
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
      {/* ─── Mobile: app-style home ─── */}
      <div className="flex flex-col md:hidden">
        {/* Wordmark + tagline */}
        <div className="flex flex-col items-center px-6 pt-6 pb-1 text-center">
          <Logo withTagline height={50} />
        </div>

        {/* Demo GIF */}
        <div className="mt-5 px-5">
          <div className="overflow-hidden rounded-3xl border border-border bg-secondary shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Assets/xulury-demo.gif"
              alt="XULURY scanning a handbag and returning a brand match"
              className="aspect-square w-full object-cover"
            />
          </div>
        </div>

        {/* Upload CTA */}
        <div className="mt-5 px-5">
          <Link href="/scan" className="block w-full" aria-label="Upload bag image">
            <div className="flex h-14 w-full items-center justify-center rounded-2xl bg-foreground text-base font-semibold tracking-wide text-background shadow-md transition-transform active:scale-[0.98]">
              Upload Bag Image
            </div>
          </Link>
          <p className="mt-3 text-center text-[13px] italic leading-relaxed text-muted-foreground">
            Upload a photo to discover the brand, model, specifications and
            estimated market value instantly.
          </p>
        </div>

        {/* How it works */}
        <div className="mt-7 px-5 pb-2">
          <Link
            href="/how-it-works"
            className="flex items-center justify-between rounded-md py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="text-sm font-semibold text-foreground">
              How it works?
            </span>
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
          </Link>
          <HowItWorksSteps compact className="mt-3" />
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
        <section className="border-y border-border bg-secondary/40">
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
