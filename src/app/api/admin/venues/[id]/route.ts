import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Find all event IDs for this venue
    const events = await prisma.event.findMany({
      where: { venueId: params.id },
      select: { id: true },
    });
    const eventIds = events.map((e: { id: string }) => e.id);

    // Delete all event_performers for these events
    if (eventIds.length > 0) {
      await prisma.eventPerformer.deleteMany({
        where: { eventId: { in: eventIds } }
      });
    }

    // Delete all events for this venue
    await prisma.event.deleteMany({
      where: { venueId: params.id }
    });

    // Delete the venue
    await prisma.venue.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting venue:', error);
    return NextResponse.json(
      { error: 'Failed to delete venue' },
      { status: 500 }
    );
  }
} 