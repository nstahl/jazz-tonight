import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { DM_Sans } from 'next/font/google'
import Navbar from '@/components/Navbar'
import { Fugaz_One } from 'next/font/google'
// These styles apply to every route in the application
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
})

const fugazOne = Fugaz_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-fugaz',  // This makes it available as a CSS variable
});
 
export const metadata: Metadata = {
  title: 'Atrium Jazz',
  description: 'Nightly jazz events around NYC',
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
      </body>
    </html>
  )
}