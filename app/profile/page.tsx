'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  User,
  Bookmark,
  HelpCircle,
  ShieldCheck,
  Bell,
  LogOut,
  ChevronRight,
  Trash2,
  Sparkles,
} from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useScanHistory } from '@/hooks/use-scan-history'
import { clearScanHistory } from '@/lib/scan-storage'
import { toast } from 'sonner'

function demoToast() {
  toast('This is a demo session', {
    description: 'Account sign-in and sync aren’t available in this preview build.',
  })
}

const SETTINGS_LINKS = [
  { href: '/history', label: 'Saved Scans', icon: Bookmark },
  { href: '/how-it-works', label: 'How It Works', icon: HelpCircle },
  { href: '/privacy', label: 'Privacy', icon: ShieldCheck },
]

export default function ProfilePage() {
  const history = useScanHistory()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const total = history.length
  const confirmed = history.filter((h) => h.status === 'confirmed').length
  const needsReview = total - confirmed

  return (
    <AppShell>
      <section className="mx-auto w-full max-w-2xl px-5 py-8 md:py-12">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--gold)]">
          Your account
        </p>
        <h1 className="mt-1 font-serif text-3xl text-foreground md:text-4xl">
          Profile
        </h1>

        {/* Identity card */}
        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[var(--gold)]/12 text-[var(--gold)]">
            <User className="size-7" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-lg font-semibold text-foreground">
              Guest Collector
            </p>
            <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              <Sparkles className="size-3 text-[var(--gold)]" aria-hidden="true" />
              Demo session — no account required
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: 'Scans', value: total },
            { label: 'Confirmed', value: confirmed },
            { label: 'Pending', value: needsReview },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-0.5 rounded-2xl border border-border bg-card py-4 shadow-sm"
            >
              <span className="font-serif text-2xl font-semibold text-foreground">
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Settings list */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {SETTINGS_LINKS.map((item, i) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-accent/5 ${
                  i !== 0 ? 'border-t border-border' : ''
                }`}
              >
                <Icon className="size-4.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="flex-1 text-sm font-medium text-foreground">
                  {item.label}
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </Link>
            )
          })}
          <button
            type="button"
            onClick={demoToast}
            className="flex w-full items-center gap-3 border-t border-border px-4 py-3.5 text-left transition-colors hover:bg-accent/5"
          >
            <Bell className="size-4.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="flex-1 text-sm font-medium text-foreground">
              Notifications
            </span>
            <span className="text-xs text-muted-foreground">Off</span>
          </button>
        </div>

        {/* Data management */}
        {total > 0 && (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="mt-6 flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-left text-destructive shadow-sm transition-colors hover:bg-destructive/5"
          >
            <Trash2 className="size-4.5 shrink-0" aria-hidden="true" />
            <span className="flex-1 text-sm font-medium">Clear local scan data</span>
          </button>
        )}

        {/* Sign out (demo) */}
        <Button
          variant="outline"
          size="lg"
          className="mt-3 h-12 w-full rounded-2xl text-muted-foreground"
          onClick={demoToast}
        >
          <LogOut className="size-4" aria-hidden="true" />
          Sign Out
        </Button>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          XULURY · Demo build — identification and pricing are estimates only.
        </p>
      </section>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              Clear scan data?
            </DialogTitle>
            <DialogDescription>
              This permanently removes all {total} saved scans from this device.
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearScanHistory()
                setConfirmOpen(false)
              }}
            >
              Clear everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
