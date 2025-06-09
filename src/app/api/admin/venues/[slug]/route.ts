import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';

export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    // Find the venue by slug
    const venue = await prisma.venue.findUniqueOrThrow({
      where: { slug: context.params.slug },
      select: { id: true }
    });

    // Find all event IDs for this venue
    const events = await prisma.event.findMany({
      where: { venueId: venue.id },
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
      where: { venueId: venue.id }
    });

    // Delete the venue
    await prisma.venue.delete({
      where: { id: venue.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting venue:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete venue' },
      { status: 500 }
    );
  }
} 