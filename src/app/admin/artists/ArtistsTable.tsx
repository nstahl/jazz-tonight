'use client';

import { ArtistProfile, Event } from '@prisma/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type ArtistWithEvents = ArtistProfile & {
  events: Event[];
};

interface ArtistsTableProps {
  artists: ArtistWithEvents[];
}

export default function ArtistsTable({ artists }: ArtistsTableProps) {
  const router = useRouter();

  const handleDelete = async (artistId: string) => {
    if (confirm('Are you sure you want to delete this artist?')) {
      try {
        const response = await fetch(`/api/artists/${artistId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete artist');
        }

        router.refresh();
      } catch (error) {
        console.error('Error deleting artist:', error);
        alert('Failed to delete artist. Please try again.');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Events
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              YouTube Videos
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {artists.map((artist) => (
            <tr key={artist.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{artist.name}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {artist.events.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {artist.events.map((event) => (
                        <li key={event.id} className="truncate max-w-xs">
                          <Link
                            href={`/admin/events/${event.id}/edit`}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {new Date(event.dateString).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })} - {event.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-500">No events</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {artist.youtubeUrls.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {artist.youtubeUrls.map((url, index) => (
                        <li key={index} className="truncate max-w-xs">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-500">No videos</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Link
                  href={`/admin/artists/${artist.id}/edit`}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(artist.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 