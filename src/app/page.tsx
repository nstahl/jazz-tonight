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
    include: {
      venue: true
    },
    orderBy: [
      { dateTime: 'asc' }
    ]
  });
  
  // Group events by date only
  const groupedEvents = events.reduce((acc, event) => {
    const date = event.dateTime.toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Jazz Tonight NYC</h1>
      {Object.entries(groupedEvents).map(([date, dateEvents]) => (
        <div key={date} className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-center">{date}</h2>
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
                    <span>{event.dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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