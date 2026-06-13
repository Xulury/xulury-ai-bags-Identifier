'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ScanLine, Bookmark, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/scan', label: 'Scan', icon: ScanLine },
  { href: '/history', label: 'Saved', icon: Bookmark },
  { href: '/profile', label: 'Profile', icon: User },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur-md md:hidden"
      aria-label="Primary mobile"
    >
      <ul className="mx-auto flex w-full items-center justify-around px-2 py-1.5">
        {ITEMS.map((item) => {
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-w-[4rem] flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                  active ? 'text-[var(--gold)]' : 'text-muted-foreground',
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
