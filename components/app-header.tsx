'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/history', label: 'Saved' },
]

export function AppHeader() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <header className="safe-top sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="XULURY home"
        >
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                pathname === link.href && 'text-foreground',
              )}
            >
              {link.label}
            </Link>
          ))}
          <Button
            size="lg"
            className="ml-2 h-10 rounded-full px-5"
            render={<Link href="/scan">Scan a Bag</Link>}
          />
        </nav>

        {/* Mobile: compact scan action — hidden on home page */}
        {!isHome && (
          <Button
            size="sm"
            className="h-9 rounded-full px-4 md:hidden"
            render={<Link href="/scan">Scan</Link>}
          />
        )}
      </div>
    </header>
  )
}
