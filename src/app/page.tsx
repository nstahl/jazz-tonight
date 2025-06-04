import { Metadata } from 'next';
import HomePageClient from './HomePageClient';

export const metadata: Metadata = {
  title: 'Atrium Jazz | Live Jazz Music in NYC',
  description: 'Discover live jazz music, artists, and venues around New York City. Curated by Atrium Jazz.',
  openGraph: {
    title: 'Atrium Jazz | Live Jazz Music in NYC',
    description: 'Discover live jazz music, artists, and venues in New York City. Curated by Atrium Jazz.',
    url: 'https://nycjazz.vercel.app/',
    images: [
      {
        url: 'https://nycjazz.vercel.app/og-atrium-main.jpg',
        width: 1200,
        height: 630,
        alt: 'Atrium Jazz NYC',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Atrium Jazz | Live Jazz Music in NYC',
    description: 'Discover live jazz music, artists, and venues in New York City. Curated by Atrium Jazz.',
    images: ['https://nycjazz.vercel.app/og-atrium-main.jpg'],
  },
};

export default function Home() {
  return <HomePageClient />;
}