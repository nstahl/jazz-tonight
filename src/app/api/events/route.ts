import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { EVENT_CONFIG } from '@/config/constants';
import { toZonedTime } from 'date-fns-tz';
import { addDays, format } from 'date-fns';

export async function GET() {
  const nycTime = toZonedTime(new Date(), 'America/New_York');
  const today = format(nycTime, 'yyyy-MM-dd');
  const endDate = format(addDays(nycTime, EVENT_CONFIG.DAYS_AHEAD), 'yyyy-MM-dd');
  console.log(today);
  console.log(endDate);
  const events = await prisma.event.findMany({
    where: {
      dateString: {
        gte: today,
        lte: endDate
      }, 
      artist: {
        // isNot: null
      },
      venue: {
        hide: false
      }
    },
    include: {
      venue: {
        select: {
          id: true,
          name: true,
          url: true,
          gMapsUrl: true,
          thumbnail: true
        }
      },
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