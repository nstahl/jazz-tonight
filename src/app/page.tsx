import { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Atrium Jazz | Nightly Jazz Events',
  description: 'Discover nightly jazz events, artists, and venues around New York City. Curated by Atrium Jazz.',
  openGraph: {
    title: 'Atrium Jazz | Nightly Jazz Events',
    description: 'Discover nightly jazz events, artists, and venues around New York City. Curated by Atrium Jazz.',
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
    title: 'Atrium Jazz | Nightly Jazz Events',
    description: 'Discover nightly jazz events, artists, and venues around New York City. Curated by Atrium Jazz.',
    images: ['https://nycjazz.vercel.app/og-atrium-main.jpg'],
  },
};

export default function Page() {
  return <HomeClient />;
}