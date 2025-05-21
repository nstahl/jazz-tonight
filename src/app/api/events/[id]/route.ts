import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';

export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    await prisma.event.delete({
      where: { id: context.params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
} 