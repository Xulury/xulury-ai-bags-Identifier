import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FloatingBagHero } from '@/components/floating-bag-hero'

export function HomeHero() {
  return (
    <section className="relative overflow-hidden">
      {/* faint radial accent */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, color-mix(in oklch, var(--gold) 14%, transparent), transparent 70%)',
        }}
        aria-hidden="true"
      />
      <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-4 sm:px-6 sm:pt-16">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div className="flex flex-col items-start gap-5 text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-3 py-1 text-xs font-medium tracking-wide text-[var(--gold)] uppercase">
              AI-Powered Luxury Recognition
            </span>
            <h1 className="text-balance font-serif text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Discover the story behind every bag.
            </h1>
            <p className="max-w-md text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Upload a single photo to identify the brand, model and estimated
              market value of a luxury handbag.
            </p>
            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="h-12 rounded-full px-6 text-base"
                render={
                  <Link href="/scan">
                    Scan a Handbag
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                }
              />
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full px-6 text-base"
                render={<Link href="/how-it-works">See How It Works</Link>}
              />
            </div>
          </div>

          <div className="order-first md:order-last">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-secondary/50 shadow-sm">
              <FloatingBagHero />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
