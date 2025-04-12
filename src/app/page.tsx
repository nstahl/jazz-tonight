import prisma from '../../lib/prisma';
import { Fugaz_One } from 'next/font/google';

const fugazOne = Fugaz_One({
  weight: '400',
  subsets: ['latin'],
});

interface Event {
  id: string;
  name: string;
  url: string;
  dateString: string;
  timeString: string | null;
  venueId: string;
  venue: {
    name: string;
  };
  artist: {
    id: string;
    name: string;
  } | null;
}

export const revalidate = 300; // Revalidate every 5 minutes (in seconds)

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const currentPage = Number(searchParams.page) || 0;
  const events = await prisma.event.findMany({
    where: {
      dateString: {
        gte: new Date().toISOString().split('T')[0],
        lte: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Fetch 15 days
      }
    },
    include: {
      venue: true,
      artist: true
    },
    orderBy: [
      { dateString: 'asc' },
      { timeString: 'asc' }
    ]
  });
  
  // Group events by date only
  const groupedEvents = events.reduce((acc, event) => {
    if (!acc[event.dateString]) {
      acc[event.dateString] = [];
    }
    acc[event.dateString].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  // Convert to array of [date, events] pairs for easier slicing
  const dateGroups = Object.entries(groupedEvents);
  const totalPages = Math.ceil(dateGroups.length / 5);
  const startIdx = currentPage * 5;
  const hasNextPage = startIdx + 5 < dateGroups.length;
  const hasPrevPage = currentPage > 0;

  return (
    <div className="h-screen flex flex-col">
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-sm">
        <div className="px-4 md:px-36 py-2">
          <div className="grid grid-flow-col auto-cols-[minmax(300px,400px)] gap-6">
            {dateGroups.map(([dateString, dateEvents]) => (
              <h2 key={dateString} className="text-xl font-semibold text-center">
                {new Date(dateEvents[0].dateString).toLocaleDateString('en-US', {
                  weekday: 'long',
                  timeZone: 'UTC'
                })}
                {', '}
                {new Date(dateString).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  timeZone: 'UTC'
                })}
              </h2>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 md:px-36 py-4">
          <div className="grid grid-flow-col auto-cols-[minmax(300px,400px)] gap-6 pb-4 overflow-x-auto">
            {dateGroups.map(([dateString, dateEvents]) => (
              <div key={dateString} className="mb-6 md:mb-0">
                <div className="grid gap-4">
                  {dateEvents
                    .sort((a, b) => {
                      if (!a.timeString) return 1;
                      if (!b.timeString) return -1;
                      return a.timeString.localeCompare(b.timeString);
                    })
                    .map((event) => (
                      <div 
                        key={event.id}
                        className={`
                          block p-4 
                          bg-white/10
                          backdrop-blur-sm
                          rounded-lg shadow 
                          w-full max-w-[500px]
                          relative
                        `}
                      >
                        <a 
                          className="block hover:bg-gray-300/60 -m-4 p-4 rounded-lg transition-all"
                          href={`/events/${event.id}`}
                        >
                          <div className={`text-lg font-medium mb-2 ${fugazOne.className}`}>
                            <span>{event.name}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>
                              {new Date(event.dateString).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                timeZone: 'UTC'
                              })} • {' '}
                              {event.timeString ? (
                                <>
                                  {new Date(`2000-01-01T${event.timeString}`).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                  {' '}
                                  <span className="text-gray-100">ET</span>
                                </>
                              ) : (
                                <span className="text-gray-100">Time TBA</span>
                              )}
                            </span>
                            <span>{event.venue.name}</span>
                          </div>
                        </a>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}