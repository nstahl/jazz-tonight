import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { name, website, instagram, biography, youtubeUrls } = data;

    const updatedArtist = await prisma.artistProfile.update({
      where: { id: params.id },
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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.artistProfile.delete({
      where: { id: params.id },
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