import { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { DM_Sans } from 'next/font/google'
import Navbar from '@/components/Navbar'
// These styles apply to every route in the application
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
})
 
export const metadata: Metadata = {
  title: 'Atrium Jazz | Nightly Jazz Events',
  description: 'Discover nightly jazz events, artists, and venues around New York City. Curated by Atrium Jazz.',
}
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={dmSans.className}>
      <body>
        <div className="sticky top-0 z-50">
          <Navbar />
        </div>
        <main>
          {children}
        </main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}