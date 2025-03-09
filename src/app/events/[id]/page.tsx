import prisma from '../../../../lib/prisma';

interface Event {
  id: string;
  name: string;
  url: string;
  dateTime: Date;
  venueId: string;
}

export default async function Page() {
    // const data = await fetch('https://api.vercel.app/blog')
    // const posts = await data.json()

    const events = await prisma.event.findMany();

    console.log(events);
    
    return (
      <ul>
        {events.map((event: Event) => (
          <li key={event.id}>{event.name}</li>
        ))}
      </ul>
    )
  }