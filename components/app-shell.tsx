import type { ReactNode } from 'react'
import { AppHeader } from '@/components/app-header'
import { AppFooter } from '@/components/app-footer'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: ReactNode
  /** Hide the footer (e.g. on focused flows). */
  hideFooter?: boolean
  className?: string
}

export function AppShell({ children, hideFooter, className }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      {/* pb accounts for the mobile bottom nav height + safe area */}
      <main className={cn('flex-1 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-0', className)}>{children}</main>
      {!hideFooter && <AppFooter />}
      <MobileBottomNav />
    </div>
  )
}
