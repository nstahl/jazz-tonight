import prisma from '../../lib/prisma';

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

export default async function Page() {
  const events = await prisma.event.findMany({
    where: {
      dateString: {
        gte: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        lte: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 5 days from today
      }
    },
    include: {
      venue: true,
      artist: true // Include artist data
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

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">NYC Edition</h1>
      {Object.entries(groupedEvents).map(([dateString, dateEvents]) => (
        <div key={dateString} className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-center">
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
          <div className="grid gap-4 place-items-center">
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
                    bg-white/60
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
                    <div className="text-lg font-medium mb-2">
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
                            <span className="text-gray-600">ET</span>
                          </>
                        ) : (
                          <span className="text-gray-600">Time TBA</span>
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
  );
}