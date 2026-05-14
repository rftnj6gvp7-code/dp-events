import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'DP-Differdange Events',
  description: 'Plateforme d\'événements du Demokratesch Partei',
  manifest: '/manifest.json',
  themeColor: '#003F8A',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DP-Differdange Events',
  },
  icons: {
    apple: '/icons/icon-192x192.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#003F8A" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DP-Differdange Events" />
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              if (!window.location.pathname.startsWith('/auth')) {
                const theme = localStorage.getItem('dp-theme') || 'light';
                document.documentElement.classList.add(theme);
              }
            } catch(e) {}
          `
        }} />
      </head>
      <body>
        {children}
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </body>
    </html>
  )
}