import prisma from '../../../../lib/prisma';
import { notFound } from 'next/navigation'
import { Fugaz_One } from 'next/font/google';

const fugazOne = Fugaz_One({
  weight: '400',
  subsets: ['latin'],
});

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id: id },
    include: {
      artist: {
        include: {
          events: {
            where: {
              dateString: {
                gte: new Date().toISOString().split('T')[0]
              },
              NOT: {
                id: id // Exclude current event
              }
            },
            include: {
              venue: true
            },
            orderBy: {
              dateString: 'asc'
            }
          }
        }
      },
      venue: true
    }
  })

  if (!event) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto p-6 pb-[calc(1.5rem+88px)] md:pb-6">
      {/* Event Header Section */}
      <div className="rounded-lg mb-8 flex justify-between items-start">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${fugazOne.className}`}>{event.name}</h1>

          <p className="text-gray-100 mt-2">
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
            )} • {event.venue.name}
          </p>
        </div>

        <a 
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:block bg-white text-black px-8 py-4 rounded-lg text-xl font-bold hover:bg-gray-200 transition-colors"
        >
          Attend
        </a>
      </div>

      {/* Mobile CTA with background */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black p-6">
        <a 
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white text-black py-3 text-lg font-bold hover:bg-gray-200 transition-colors text-center rounded-lg"
        >
          Attend
        </a>
      </div>

      {/* Artist Profile Section */}
      {event.artist && (
        <div className="border-t pt-8">
          
          {event.artist.biography && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Biography</h3>
              <p className="whitespace-pre-wrap">{event.artist.biography}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {event.artist.website && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Website</h3>
                <a href={event.artist.website} target="_blank" rel="noopener noreferrer" 
                   className="text-blue-300 hover:underline">
                  {event.artist.website.length > 40 
                    ? `${new URL(event.artist.website).hostname}/...`
                    : event.artist.website
                  }
                </a>
              </div>
            )}
            
            {event.artist.instagram && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Instagram</h3>
                <a href={event.artist.instagram.replace('@', '')} target="_blank" 
                   rel="noopener noreferrer" className="text-blue-300 hover:underline">
                  @{event.artist.instagram.split('/').filter(Boolean).pop()}
                </a>
              </div>
            )}
          </div>

          {event.artist.youtubeUrls?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">YouTube Videos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.artist.youtubeUrls
                  .slice(0, Math.min(6, event.artist.youtubeUrls.length))
                  .map((url: string, index: number) => {
                    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
                    
                  if (!videoId) return null;

                  return (
                    <div key={index} className="aspect-video">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upcoming Events Section */}
      {event.artist?.events && event.artist.events.length > 0 && (
        <div className="border-t pt-8 mt-8">
          <h2 className="text-2xl font-bold mb-6">More Sets</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.artist.events.map((otherEvent) => (
              <li key={otherEvent.id}>
                <div className="block p-4 bg-white/10 backdrop-blur-sm rounded-lg shadow w-full relative">
                  <a 
                    className="block hover:bg-gray-300/60 -m-4 p-4 rounded-lg transition-all"
                    href={`/events/${otherEvent.id}`}
                  >
                    <div className={`text-lg font-medium mb-2 ${fugazOne.className}`}>
                      <span>{otherEvent.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>
                        {new Date(otherEvent.dateString).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          timeZone: 'UTC'
                        })} • {' '}
                        {otherEvent.timeString ? (
                          <>
                            {new Date(`2000-01-01T${otherEvent.timeString}`).toLocaleTimeString('en-US', {
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
                      <span>{otherEvent.venue.name}</span>
                    </div>
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}