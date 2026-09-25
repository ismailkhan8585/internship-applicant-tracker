import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'MentorTechz Internship Manager',
  description: 'Manage internship applicants, read Gmail inbox, send confirmation emails — MentorTechz',
  keywords: 'MentorTechz, internship, manager, applicants, Gmail',
  authors: [{ name: 'MentorTechz' }],
  robots: 'noindex, nofollow',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1a1a2e',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e2a4a',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#e2e8f0',
              fontFamily: 'Inter, sans-serif',
            },
          }}
          richColors
        />
      </body>
    </html>
  )
}
