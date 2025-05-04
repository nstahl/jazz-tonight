import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET() {
  const events = await prisma.event.findMany({
    where: {
      dateString: {
        gte: new Date().toISOString().split('T')[0],
        lte: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    },
    include: {
      venue: true,
      artist: true
    },
    orderBy: [
      { dateString: 'asc' },
      { timeString: 'asc' }
    ]
  });

  return NextResponse.json(events);
} 