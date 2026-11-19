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
  themeColor: '#07080d',
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
          theme="dark"
          toastOptions={{
            style: {
              background: 'rgba(16,18,28,0.92)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '14px',
              color: '#eef0f6',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '13.5px',
              boxShadow: '0 20px 50px -12px rgba(0,0,0,0.7)',
            },
          }}
        />
      </body>
    </html>
  )
}
