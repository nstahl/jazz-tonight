import prisma from '../../lib/prisma';

interface Event {
  id: string;
  name: string;
  url: string;
  dateTime: Date;
  venueId: string;
  venue: {
    name: string;
  };
}

export default async function Page() {
  const events = await prisma.event.findMany({
    where: {
      dateTime: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
        lt: new Date(new Date().setHours(0, 0, 0, 0) + 5 * 24 * 60 * 60 * 1000) // 5 days from start of today
      }
    },
    include: {
      venue: true
    },
    orderBy: [
      { dateTime: 'asc' }
    ]
  });
  
  // Group events by date only
  const groupedEvents = events.reduce((acc, event) => {
    const nyDate = new Date(event.dateTime).toLocaleDateString('en-US', {
      timeZone: 'America/New_York'
    });
    if (!acc[nyDate]) {
      acc[nyDate] = [];
    }
    acc[nyDate].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Jazz Tonight NYC</h1>
      {Object.entries(groupedEvents).map(([date, dateEvents]) => (
        <div key={date} className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-center">
            {new Date(dateEvents[0].dateTime).toLocaleDateString('en-US', {
              weekday: 'long',
              timeZone: 'America/New_York'
            })}
            <br />
            {date}
          </h2>
          <div className="grid gap-4 place-items-center">
            {dateEvents
              .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
              .map((event) => (
                <a 
                  key={event.id}
                  className={`
                    block p-4 
                    bg-white/60
                    backdrop-blur-sm
                    rounded-lg shadow 
                    hover:shadow-md hover:bg-gray-300/60
                    transition-all 
                    w-full max-w-[500px]
                  `}
                  href={event.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <div className="text-lg font-medium mb-2">{event.name}</div>
                  <div className="flex justify-between text-sm">
                    <span>
                      {!isNaN(event.dateTime.getTime()) && (
                        <>
                          {new Date(event.dateTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: 'America/New_York'
                          })}
                          {' '}
                          <span className="text-gray-600">ET</span>
                        </>
                      )}
                    </span>
                    <span>{event.venue.name}</span>
                  </div>
                </a>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}