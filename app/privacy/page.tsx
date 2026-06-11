import type { Metadata } from 'next'
import { Lock, Server, Trash2, UserCheck } from 'lucide-react'
import { AppShell } from '@/components/app-shell'

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'How LuxeLens handles your photos and data. Your scans stay on your device.',
}

const highlights = [
  {
    icon: Lock,
    title: 'On-device by default',
    body: 'Your scan history and uploaded photos are stored locally in your browser. They never leave your device in this experience.',
  },
  {
    icon: Server,
    title: 'No account required',
    body: 'You can identify handbags without signing up, signing in, or sharing any personal information.',
  },
  {
    icon: UserCheck,
    title: 'Feedback is anonymous',
    body: 'When you confirm or correct a result, only the anonymized correction is used to improve matching — never your identity.',
  },
  {
    icon: Trash2,
    title: 'Delete anytime',
    body: 'Clear your entire history with a single tap from the history page. Once cleared, it is gone for good.',
  },
]

export default function PrivacyPage() {
  return (
    <AppShell>
      <section className="mx-auto w-full max-w-2xl px-5 py-10 md:py-16">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
          Your trust, protected
        </p>
        <h1 className="mt-2 text-balance font-serif text-4xl leading-tight text-foreground md:text-5xl">
          Privacy at LuxeLens
        </h1>
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
          We built LuxeLens to respect the privacy of your collection. Here is
          exactly how your information is handled.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {highlights.map((h) => (
            <div
              key={h.title}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/15">
                <h.icon className="h-5 w-5 text-accent" />
              </div>
              <h2 className="mt-4 font-serif text-xl text-foreground">
                {h.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {h.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <div>
            <h2 className="font-serif text-2xl text-foreground">
              What we collect
            </h2>
            <p className="mt-3">
              In this experience, the only data created is the photo you choose
              to scan and the identification results derived from it. Both are
              stored locally in your browser&apos;s storage. We do not collect
              names, emails, locations, or device identifiers.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-2xl text-foreground">
              How identification works
            </h2>
            <p className="mt-3">
              Photos are compared against a curated reference catalogue to
              estimate the likely brand and model. Results are provided for
              informational purposes and are not a certification of
              authenticity.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-2xl text-foreground">
              Your choices
            </h2>
            <p className="mt-3">
              You can delete individual scans or clear your full history at any
              time from the history page. Because data is stored locally,
              clearing your browser storage also removes everything LuxeLens has
              saved.
            </p>
          </div>
          <p className="border-t border-border pt-6 text-xs text-muted-foreground">
            This privacy summary is provided for a demonstration experience and
            does not constitute legal advice.
          </p>
        </div>
      </section>
    </AppShell>
  )
}
