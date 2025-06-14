import prisma from '../../../../lib/prisma';
import { notFound } from 'next/navigation'
import { Fugaz_One } from 'next/font/google';
import ShowsList from '../../artist/[id]/ShowsList';
import Biography from '../../artist/[id]/Biography';
import { EVENT_CONFIG } from '@/config/constants';
import { Metadata } from 'next';
import ShareButton from '@/components/ShareButton';
import React from 'react';
import JsonLd from '@/components/JsonLd';
import { formatInTimeZone } from 'date-fns-tz';

const fugazOne = Fugaz_One({
  weight: '400',
  subsets: ['latin'],
});

// Helper function to get the correct ET offset
function getETOffset(date: string): string {
  const dateObj = new Date(date);
  const isDST = dateObj.getTimezoneOffset() < new Date(dateObj.getFullYear(), 0, 1).getTimezoneOffset();
  return isDST ? '-04:00' : '-05:00';
}

type PageProps = {
  params: Promise<{ slug: string }>
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
  slug: string;
  name: string;
  dateString: string;
  url: string;
  logline?: string;
  artist: ArtistWithVideos | null;
  venue: { name: string; slug: string; id: string; description: string; gMapsUrl: string; url: string; streetAddress: string; addressLocality: string; postalCode: string; addressRegion: string; addressCountry: string };
  performers?: { performer: { name: string; instrument: string } }[];
  setTimes?: string[];
};

// Define the other event type
type OtherEvent = {
  id: string;
  name: string;
  slug: string;
  dateString: string;
  venue: {
    name: string;
    slug: string;
  };
}

type MetadataProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    select: {
      name: true,
      logline: true,
      artist: {
        select: {
          name: true
        }
      },
      venue: {
        select: {
          name: true,
          description: true,
          slug: true,
          url: true,
        }
      }
    }
  });

  if (!event) return {};

  return {
    title: `${event.name} at ${event.venue.name} | Atrium Jazz`,
    description: event.logline || `Join ${event.artist?.name || 'us'} at ${event.venue.name} for an unforgettable jazz experience.`,
    openGraph: {
      title: `${event.name} at ${event.venue.name} | Atrium Jazz`,
      description: event.logline || `Join ${event.artist?.name || 'us'} at ${event.venue.name} for an unforgettable jazz experience.`,
      url: `https://www.atriumjazz.com/event/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${event.name} at ${event.venue.name} | Atrium Jazz`,
      description: event.logline || `Join ${event.artist?.name || 'us'} at ${event.venue.name} for an unforgettable jazz experience.`,
    }
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      dateString: true,
      url: true,
      logline: true,
      artist: {
        select: {
          id: true,
          name: true,
          youtubeUrls: true,
          biography: true,
          website: true,
          instagram: true,
          events: {
            select: {
              id: true,
              slug: true,
              name: true,
              dateString: true,
              setTimes: true,
              venue: {
                select: {
                  name: true,
                  slug: true,
                }
              }
            },
            where: {
              dateString: {
                gte: new Date().toISOString().split('T')[0],
                lt: new Date(Date.now() + EVENT_CONFIG.DAYS_AHEAD * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              },
              NOT: {
                slug: slug
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
          name: true,
          slug: true,
          id: true,
          description: true,
          url: true,
          streetAddress: true,
          addressLocality: true,
          postalCode: true,
          addressRegion: true,
          addressCountry: true,
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
      },
      setTimes: true
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
      .slice(0, 4);
    
    // Store the filtered videos in the event object
    event.artist.youtubeVideos = validYoutubeVideos;
  }

  return (
    <>
    <JsonLd json={{
      "@context": "https://schema.org",
      "@type": "Event",
      "name": event.name,
      "description": event.logline || `Join ${event.artist?.name || 'us'} at ${event.venue.name} for an unforgettable jazz experience.`,
      "startDate": event.setTimes && event.setTimes.length > 0 
        ? `${event.dateString}T${event.setTimes[0]}:00${getETOffset(event.dateString)}`
        : formatInTimeZone(new Date(`${event.dateString}T00:00:00`), 'America/New_York', "yyyy-MM-dd'T'HH:mm:ssXXX"),
      "endDate": event.setTimes && event.setTimes.length > 0 
        ? (() => {
            const [hours, minutes] = event.setTimes[event.setTimes.length - 1].split(':').map(Number);
            const endTime = new Date(`${event.dateString}T${hours}:${minutes}:00`);
            endTime.setMinutes(endTime.getMinutes() + 90);
            return `${event.dateString}T${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}:00${getETOffset(event.dateString)}`;
          })()
        : undefined,
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "location": {
        "@type": "Place",
        "name": event.venue.name,
        "url": event.venue.gMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(event.venue.name)}`,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": event.venue.streetAddress || "",
          "addressLocality": event.venue.addressLocality || "",
          "addressRegion": event.venue.addressRegion || "",
          "postalCode": event.venue.postalCode || "",
          "addressCountry": event.venue.addressCountry || ""
        }
      },
      "performer": event.artist ? {
        "@type": "MusicGroup",
        "name": event.artist.name
      } : undefined,
      "organizer": {
        "@type": "Organization",
        "name": event.venue.name,
        "url": event.venue.url
      }
    }} />
    <div className="max-w-4xl mx-auto p-6 pb-[calc(1.5rem+88px)] md:pb-6">
      {/* Event Header Section */}
      <div className="rounded-lg mb-8 flex justify-between items-start">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${fugazOne.className}`}>
          {event.name}
          </h1>

          <div className="flex justify-between text-sm text-zinc-400">
          <span>
            {new Date(event.dateString).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short', 
              day: 'numeric',
              timeZone: 'UTC'
            })} • {' '}
            {event.setTimes && event.setTimes.length > 0 ? (
              <>
                {event.setTimes!.map((timeString, index) => (
                  <React.Fragment key={timeString}>
                    {new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                    {index < event.setTimes!.length - 1 && ' & '}
                  </React.Fragment>
                ))}
                {' '}
                <span className="text-zinc-400">ET</span>
              </>
            ) : (
              <span className="text-zinc-400">Time TBA</span>
            )}
            {event.venue?.name && (
              <>
                <span className="hidden md:inline"> • </span>
                <span className="block md:inline mt-2 md:mt-0">
                  <svg className="inline-block w-4 h-4 mr-1 md:hidden" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Live at {
                  <a 
                    href={`/venue/${event.venue.slug}`} 
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:underline transition-colors"
                >
                  {event.venue.name}
                </a>
              }</span>
              </>
            )}
          </span>
        </div>



        </div>
        <div className="flex flex-row items-stretch gap-2 ml-4">
          <ShareButton url={`https://www.atriumjazz.com/event/${slug}`} className="w-16 h-16 p-0 text-xl font-bold rounded-lg flex items-center justify-center hidden md:flex" showText={false} />
          <a 
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:block bg-white text-black px-8 py-4 rounded-lg text-xl font-bold hover:bg-gray-200 transition-colors"
          >
            Tickets
          </a>
        </div>
      </div>

      {/* Mobile CTA with background */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black p-6 z-50 flex flex-row gap-2">
        <a 
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-white text-black py-3 text-lg font-bold hover:bg-gray-200 transition-colors text-center rounded-lg"
        >
          Tickets
        </a>
        <ShareButton url={`https://www.atriumjazz.com/event/${slug}`} className="w-14 h-14 p-0 text-xl font-bold rounded-lg flex items-center justify-center bg-blue-300 text-black" showText={false} />
      </div>

        <div className="border-t pt-8">
          
          {event.logline && (
            <div className="mb-6">
              <p className="italic text-lg">{event.logline}</p>
            </div>
          )}

          {event.artist && (
            <>
              {event.artist.biography && (
                <Biography text={event.artist.biography} />
              )}
            </>
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
              
            {(event.artist?.website || event.artist?.instagram) && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Learn more</h3>
                {event.artist?.website && (
                  <a href={event.artist.website} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-300 hover:underline block mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                    {new URL(event.artist.website).hostname}
                  </a>
                )}
                {event.artist.instagram && (
                  <a href={event.artist.instagram.replace('@', '')} target="_blank" 
                     rel="noopener noreferrer" className="text-blue-300 hover:underline block flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                    @{event.artist.instagram.split('/').filter(Boolean).pop()}
                  </a>
                )}
              </div>
            )}
          </div>

          {!event.artist && event.venue && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">About {event.venue.name}</h3>
                <p>{event.venue.description}</p>
              </div>
            )}

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

      {/* Upcoming Events Section */}
      {event.artist?.events && event.artist.events.length > 0 && (
        <div className="border-t pt-8 mt-8">
          <h2 className="text-2xl font-bold mb-6">More Dates</h2>
          <ShowsList events={event.artist.events.filter((event: OtherEvent) => {
            const eventDate = new Date(event.dateString);
            const cutoffDate = new Date(Date.now() + EVENT_CONFIG.DAYS_AHEAD * 24 * 60 * 60 * 1000);
            return eventDate <= cutoffDate;
          })} />
        </div>
      )}
    </div>
    </>
  )
}