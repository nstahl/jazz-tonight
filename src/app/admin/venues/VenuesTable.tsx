'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Inline Venue type for client-side use
interface Venue {
  id: string;
  name: string;
  url: string;
  gMapsUrl?: string | null;
  description?: string | null;
  slug: string;
}

type VenueWithEventCount = Venue & {
  _count: {
    events: number;
  };
};

export default function VenuesTable({ venues }: { venues: VenueWithEventCount[] }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (venueSlug: string) => {
    if (!confirm('Are you sure you want to delete this venue and all its associated events? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(venueSlug);
    try {
      const response = await fetch(`/api/admin/venues/${venueSlug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete venue');
      }

      router.refresh();
    } catch (error) {
      console.error('Error deleting venue:', error);
      alert('Failed to delete venue. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Events</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {venues.map((venue) => (
            <tr key={venue.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{venue.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap max-w-xs">
                <a 
                  href={venue.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-900 truncate block"
                  title={venue.url}
                  style={{ maxWidth: 200, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {venue.url}
                </a>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{venue._count.events}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => handleDelete(venue.slug)}
                  disabled={isDeleting === venue.slug}
                  className={`text-red-600 hover:text-red-900 ${
                    isDeleting === venue.slug ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isDeleting === venue.slug ? 'Deleting...' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 