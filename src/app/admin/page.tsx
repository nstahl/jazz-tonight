import { prisma } from '@/lib/prisma';

export default async function AdminDashboard() {
  const [eventsCount, artistsCount] = await Promise.all([
    prisma.event.count(),
    prisma.artistProfile.count(),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Events</h2>
          <p className="text-3xl font-bold text-blue-600">{eventsCount}</p>
          <p className="text-gray-600 mt-2">Total events in the system</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Artists</h2>
          <p className="text-3xl font-bold text-green-600">{artistsCount}</p>
          <p className="text-gray-600 mt-2">Total artists in the system</p>
        </div>
      </div>
    </div>
  );
} 