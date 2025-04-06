import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
 
// These styles apply to every route in the application
import './globals.css'
 
export const metadata: Metadata = {
  title: 'Jazz Tonic',
  description: 'Nightly jazz events around NYC',
}
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}