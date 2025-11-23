import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DisQuote - Turn Discord Messages into Beautiful Quotes',
  description: 'Transform any Discord message into stunning, shareable quote images. Right-click. Customize. Share.',
  keywords: ['Discord', 'quote', 'bot', 'image', 'generator', 'message'],
  openGraph: {
    title: 'DisQuote - Turn Discord Messages into Beautiful Quotes',
    description: 'Transform any Discord message into stunning, shareable quote images.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
