import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import EventsTable from './EventsTable';

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    include: {
      venue: true,
      artist: true,
    },
    orderBy: {
      dateString: 'desc',
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Events</h1>
        <Link
          href="/admin/events/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Event
        </Link>
      </div>

      <EventsTable events={events} />
    </div>
  );
} 