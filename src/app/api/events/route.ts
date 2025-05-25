import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { EVENT_CONFIG } from '@/config/constants';

export async function GET() {
  const events = await prisma.event.findMany({
    where: {
      dateString: {
        gte: new Date().toISOString().split('T')[0],
        lte: new Date(Date.now() + EVENT_CONFIG.DAYS_AHEAD * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }, 
      artist: {
        isNot: null
      }
    },
    include: {
      venue: true,
      artist: true,
      performers: {
        include: {
          performer: true
        }
      }
    },
    orderBy: [
      { dateString: 'asc' },
      { setTimes: 'asc' }
    ]
  });

  return NextResponse.json(events);
} 