import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Quotecord - Turn Discord Messages into Beautiful Quotes',
  description: 'Transform any Discord message into stunning, shareable quote images in seconds. The easiest way to create memorable quotes from your favorite Discord moments.',
  keywords: ['Discord', 'quote', 'bot', 'image', 'generator', 'message', 'quotecord', 'quote this'],
  openGraph: {
    title: 'Quotecord - Turn Discord Messages into Beautiful Quotes',
    description: 'Transform any Discord message into stunning, shareable quote images in seconds.',
    type: 'website',
    siteName: 'Quotecord',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quotecord - Turn Discord Messages into Beautiful Quotes',
    description: 'Transform any Discord message into stunning, shareable quote images in seconds.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} bg-mesh antialiased`}>
        {children}
      </body>
    </html>
  )
}
