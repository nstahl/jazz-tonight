import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';

export async function PUT(
  request: NextRequest,
  context: any
) {
  try {
    const data = await request.json();
    const { name, website, instagram, biography, youtubeUrls } = data;

    const updatedArtist = await prisma.artistProfile.update({
      where: { id: context.params.id },
      data: {
        name,
        website,
        instagram,
        biography,
        youtubeUrls,
      },
    });

    return NextResponse.json(updatedArtist);
  } catch (error) {
    console.error('Error updating artist:', error);
    return NextResponse.json(
      { error: 'Failed to update artist' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    await prisma.artistProfile.delete({
      where: { id: context.params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting artist:', error);
    return NextResponse.json(
      { error: 'Failed to delete artist' },
      { status: 500 }
    );
  }
} 