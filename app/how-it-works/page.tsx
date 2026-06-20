import type { Metadata } from 'next'
import Link from 'next/link'
import { Camera, ScanSearch, ShieldCheck, Sparkles } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { HowItWorksSteps } from '@/components/how-it-works-steps'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'Learn how XULURY identifies luxury handbags from a single photo using visual matching against a curated reference catalogue.',
}

const principles = [
  {
    icon: ScanSearch,
    title: 'Visual matching',
    body: 'We compare the silhouette, hardware, stitching, and material of your photo against a curated catalogue of reference pieces.',
  },
  {
    icon: Sparkles,
    title: 'Confidence scoring',
    body: 'Every result includes a transparent confidence score, so you always know how certain the identification is.',
  },
  {
    icon: ShieldCheck,
    title: 'You stay in control',
    body: 'Disagree with a match? Correct it in seconds. Your feedback refines future results without ever exposing your data.',
  },
]

const faqs = [
  {
    q: 'Is XULURY an authentication service?',
    a: 'No. XULURY identifies the likely brand and model of a handbag for reference and valuation context. It does not certify authenticity. For authentication, consult a qualified expert or the brand directly.',
  },
  {
    q: 'How accurate is the identification?',
    a: 'Accuracy depends on photo quality and how distinctive the piece is. Clear, well-lit photos that show the full silhouette and hardware produce the most confident results. We always show a confidence score so you can judge for yourself.',
  },
  {
    q: 'What photos work best?',
    a: 'A straight-on shot of the full bag in good lighting, plus close-ups of the hardware, logo, and interior lining. Avoid heavy filters, shadows, or cropped angles.',
  },
  {
    q: 'Where do the price estimates come from?',
    a: 'Estimates reflect typical resale ranges for the identified model in good condition. Actual value varies with condition, rarity, season, and provenance.',
  },
  {
    q: 'Do you store my photos?',
    a: 'Your scans are saved only on your device. Nothing is uploaded to a server in this experience. See our privacy page for details.',
  },
]

export default function HowItWorksPage() {
  return (
    <AppShell>
      <section className="mx-auto w-full max-w-3xl px-5 py-10 md:py-16">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
            The method
          </p>
          <h1 className="mt-2 text-balance font-serif text-4xl leading-tight text-foreground md:text-5xl">
            Identify any handbag in three considered steps
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            XULURY turns a single photograph into a confident identification,
            a price range, and a set of reference images — without the guesswork.
          </p>
        </div>

        <div className="mt-12">
          <HowItWorksSteps />
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {principles.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/15">
                <p.icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="mt-4 font-serif text-xl text-foreground">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {p.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <div className="flex items-center gap-3">
            <Camera className="h-5 w-5 text-accent" />
            <h2 className="font-serif text-2xl text-foreground">
              Frequently asked
            </h2>
          </div>
          <Accordion className="mt-4">
            {faqs.map((faq, i) => (
              <AccordionItem key={faq.q} value={`item-${i}`}>
                <AccordionTrigger className="text-left font-medium">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="leading-relaxed text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-16 rounded-3xl bg-charcoal px-8 py-12 text-center text-charcoal-foreground">
          <h2 className="text-balance font-serif text-3xl">
            Ready to identify your piece?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty leading-relaxed text-charcoal-foreground/70">
            Upload a photo and get a confident match in moments.
          </p>
          <Button
            size="lg"
            className="mt-6 rounded-full bg-accent px-10 text-accent-foreground hover:bg-accent/90"
            render={<Link href="/scan">Start a scan</Link>}
          />
        </div>
      </section>
    </AppShell>
  )
}
