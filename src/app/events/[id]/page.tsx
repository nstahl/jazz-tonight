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
      <div className="flex flex-col items-center py-10">
        <h1 className="text-2xl font-bold">Events</h1>
        <div className="list-inside list-disc pl-4 pt-8 mx-auto max-w-2xl w-full px-6">
          {events.map((event: Event) => (
            <div key={event.id} className="ml-4 py-16 px-6 my-4">
              {event.name}
            </div>
          ))}
        </div>
      </div>
    )
  }