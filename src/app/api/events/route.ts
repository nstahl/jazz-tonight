import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { EVENT_CONFIG } from '@/config/constants';
import { toZonedTime } from 'date-fns-tz';
import { addDays, format } from 'date-fns';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  // Use provided dates or fall back to default range
  const nycTime = toZonedTime(new Date(), 'America/New_York');
  const defaultStartDate = format(nycTime, 'yyyy-MM-dd');
  const defaultEndDate = format(addDays(nycTime, EVENT_CONFIG.DAYS_AHEAD), 'yyyy-MM-dd');

  console.log("startDate", startDate);
  console.log("endDate", endDate);  
  console.log("defaultStartDate", defaultStartDate);
  console.log("defaultEndDate", defaultEndDate);

  const events = await prisma.event.findMany({
    where: {
      dateString: {
        gte: startDate || defaultStartDate,
        lte: endDate || defaultEndDate
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

  console.log(events);

  return NextResponse.json(events);
} 