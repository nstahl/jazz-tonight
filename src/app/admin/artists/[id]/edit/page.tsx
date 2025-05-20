import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ArtistEditForm from './ArtistEditForm';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditArtistPage({ params }: PageProps) {
  const artist = await prisma.artistProfile.findUnique({
    where: { id: params.id },
  });

  if (!artist) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit Artist: {artist.name}</h1>
      <ArtistEditForm artist={artist} />
    </div>
  );
} 