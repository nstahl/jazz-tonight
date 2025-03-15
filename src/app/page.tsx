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
      }
    });
    
    return (
      <div>
        <h1 className="text-2xl font-bold">Events</h1>
        <div>
          {events.map((event: Event) => (
            <div key={event.id}>
              <span>{event.name}</span>
              {' | '}
              <span>{event.dateTime.toLocaleDateString()}</span>
              {' | '}
              <span>{event.venue.name}</span>
              {' | '}
              <a 
                className="text-blue-500 visited:text-purple-500" 
                href={event.url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View
              </a>
            </div>
          ))}
        </div>
      </div>
    )
  }