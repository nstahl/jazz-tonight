// app/api/sitemap/route.ts
import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { EVENT_CONFIG } from '@/config/constants';
import { toZonedTime } from 'date-fns-tz';
import { addDays, format } from 'date-fns';

const BASE_URL = 'https://atriumjazz.com';

export async function GET() {
  try {
    // Calculate date range
    const nycTime = toZonedTime(new Date(), 'America/New_York');
    const startDate = format(nycTime, 'yyyy-MM-dd');
    const endDate = format(addDays(nycTime, EVENT_CONFIG.DAYS_AHEAD), 'yyyy-MM-dd');

    const [events, venues] = await Promise.all([
      prisma.event.findMany({
        where: {
          dateString: {
            gte: startDate,
            lte: endDate
          },
          venue: {
            hide: false
          }
        },
        orderBy: [
          { dateString: 'asc' },
          { setTimes: 'asc' }
        ]
      }),
      prisma.venue.findMany({
        where: {
          hide: false
        }
      }),
    ]);

    const urls = [
      `${BASE_URL}/`,
      ...events.map((e) => `${BASE_URL}/event/${e.slug}`),
      ...venues.map((v) => `${BASE_URL}/venue/${v.slug}`),
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${urls
          .map(
            (url) => `
            <url>
              <loc>${url}</loc>
              <changefreq>daily</changefreq>
              <priority>0.7</priority>
            </url>`
          )
          .join('')}
      </urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, must-revalidate',
      },
    });
  } catch (err) {
    console.error('Error generating sitemap:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
