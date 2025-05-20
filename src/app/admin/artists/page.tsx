import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ArtistsTable from './ArtistsTable';

export default async function ArtistsPage() {
  const artists = await prisma.artistProfile.findMany({
    include: {
      events: {
        orderBy: {
          dateString: 'asc'
        }
      },
    },
    orderBy: {
      events: {
        _count: 'asc'
      }
    },
  });

  // Sort artists by their first event date
  const sortedArtists = artists.sort((a, b) => {
    const aDate = a.events[0]?.dateString || '9999-12-31';
    const bDate = b.events[0]?.dateString || '9999-12-31';
    return aDate.localeCompare(bDate);
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Artists</h1>
        <Link
          href="/admin/artists/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Artist
        </Link>
      </div>

      <ArtistsTable artists={sortedArtists} />
    </div>
  );
} 