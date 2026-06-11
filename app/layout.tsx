import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Inter, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'LuxeLens — Identify luxury handbags in seconds',
  description:
    'Upload a single photo to identify the brand, model and estimated market value of a luxury handbag with AI-powered recognition.',
  generator: 'v0.app',
  keywords: [
    'luxury handbag',
    'bag identification',
    'designer bag',
    'AI recognition',
    'handbag value',
  ],
  openGraph: {
    title: 'LuxeLens — Identify luxury handbags in seconds',
    description:
      'AI-powered luxury handbag recognition. Identify the brand, model and estimated value from a single photo.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#F7F3EE',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-center" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
