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

// Define the YouTube video type
type YouTubeVideo = {
  url: string;
  videoId: string;
}

// Extend the artist type to include youtubeVideos
type ArtistWithVideos = {
  youtubeUrls: string[];
  youtubeVideos?: YouTubeVideo[];
  [key: string]: any;
}

// Define the event type with the extended artist type
type EventWithArtist = {
  id: string;
  name: string;
  dateString: string;
  timeString: string | null;
  url: string;
  logline?: string;
  artist: ArtistWithVideos | null;
  venue: { name: string };
  performers?: { performer: { name: string; instrument: string } }[];
};

// Define the other event type
type OtherEvent = {
  id: string;
  name: string;
  dateString: string;
  timeString: string | null;
  venue: {
    name: string;
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id: id },
    select: {
      id: true,
      name: true,
      dateString: true,
      timeString: true,
      url: true,
      logline: true,
      artist: {
        select: {
          youtubeUrls: true,
          biography: true,
          website: true,
          instagram: true,
          events: {
            select: {
              id: true,
              name: true,
              dateString: true,
              timeString: true,
              venue: {
                select: {
                  name: true
                }
              }
            },
            where: {
              dateString: {
                gte: new Date().toISOString().split('T')[0]
              },
              NOT: {
                id: id
              }
            },
            orderBy: {
              dateString: 'asc'
            }
          }
        }
      },
      venue: {
        select: {
          name: true
        }
      },
      performers: {
        select: {
          performer: {
            select: {
              name: true,
              instrument: true,
            }
          }
        }
      }
    }
  }) as EventWithArtist | null;

  if (!event) {
    notFound();
  }

  // Filter YouTube URLs to only include valid ones and store both URL and videoId
  if (event.artist?.youtubeUrls) {
    const validYoutubeVideos = event.artist.youtubeUrls
      .map(url => {
        const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/live\/)([^"&?\/\s]{11})/)?.[1];
        return videoId ? { url, videoId } : null;
      })
      .filter((item): item is YouTubeVideo => item !== null)
      .slice(0, 6);
    
    // Store the filtered videos in the event object
    event.artist.youtubeVideos = validYoutubeVideos;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 pb-[calc(1.5rem+88px)] md:pb-6">
      {/* Event Header Section */}
      <div className="rounded-lg mb-8 flex justify-between items-start">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${fugazOne.className}`}>{event.name}</h1>

          <p className="text-gray-100 mt-2">
            {new Date(event.dateString).toLocaleDateString('en-US', {
              weekday: 'long',
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

      {event.artist && (
        <div className="border-t pt-8">
          
          {event.logline && (
            <div className="mb-6">
              <p className="italic text-xl">{event.logline}</p>
            </div>
          )}

<div className="border-t mb-6"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {event.performers && event.performers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Musicians</h3>
              <ul>
                {event.performers.map(({ performer }, idx) => (
                  <li key={idx}>
                    <span className="font-medium">{performer.name}</span>
                    {performer.instrument && (
                      <span className="text-gray-300"> // {performer.instrument}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
            
            {(event.artist.website || event.artist.instagram) && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Learn more</h3>
                <a href={event.artist.website} target="_blank" rel="noopener noreferrer" 
                   className="text-blue-300 hover:underline">
                  {new URL(event.artist.website).hostname}
                </a><br />
                <a href={event.artist.instagram.replace('@', '')} target="_blank" 
                   rel="noopener noreferrer" className="text-blue-300 hover:underline">
                  @{event.artist.instagram.split('/').filter(Boolean).pop()}
                </a>
              </div>
            )}
          </div>

          

          {event.artist?.youtubeVideos && event.artist.youtubeVideos.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">YouTube</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.artist.youtubeVideos.map((video: YouTubeVideo, index: number) => (
                  <div key={index} className="aspect-video">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${video.videoId}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ))}
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
            {event.artist.events.map((otherEvent: OtherEvent) => (
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