import Link from 'next/link'
import { Logo } from '@/components/logo'

const FOOTER_LINKS = [
  { href: '/how-it-works', label: 'About' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/how-it-works', label: 'Contact' },
]

export function AppFooter() {
  return (
    <footer className="border-t border-border/70 bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <Link
            href="/"
            className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="LuxeLens home"
          >
            <Logo />
          </Link>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {FOOTER_LINKS.map((link, i) => (
                <li key={`${link.label}-${i}`}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-8 max-w-xl text-pretty text-xs leading-relaxed text-muted-foreground">
          Identification and price estimates are provided for informational
          purposes only.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          © {new Date().getFullYear()} LuxeLens. A demonstration project.
        </p>
      </div>
    </footer>
  )
}
