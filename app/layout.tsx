import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { AuthSessionProvider } from '@/components/auth-session-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lab Paper Archive',
  description: 'Research paper archive for the lab - Search, browse, and share papers with your colleagues',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthSessionProvider>{children}</AuthSessionProvider>
        <Analytics />
      </body>
    </html>
  )
}
