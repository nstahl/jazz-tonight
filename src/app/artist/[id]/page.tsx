import prisma from '../../../../lib/prisma';
import { notFound } from 'next/navigation'
import { Fugaz_One } from 'next/font/google';
import ShowsList from './ShowsList';
import { EVENT_CONFIG } from '@/config/constants';
import Biography from './Biography';

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

// Define the event type
type Event = {
  id: string;
  name: string;
  dateString: string;
  timeString: string | null;
  url: string;
  venue: { name: string };
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  const artist = await prisma.artistProfile.findUnique({
    where: { id: id },
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
          name: true,
          dateString: true,
          timeString: true,
          url: true,
          venue: {
            select: {
              name: true
            }
          }
        },
        where: {
          dateString: {
            gte: new Date().toISOString().split('T')[0]
          }
        },
        orderBy: {
          dateString: 'asc'
        }
      }
    }
  });

  if (!artist) {
    notFound();
  }

  // Filter YouTube URLs to only include valid ones and store both URL and videoId
  if (artist.youtubeUrls) {
    const validYoutubeVideos = artist.youtubeUrls
      .map(url => {
        const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/live\/)([^"&?\/\s]{11})/)?.[1];
        return videoId ? { url, videoId } : null;
      })
      .filter((item): item is YouTubeVideo => item !== null)
      .slice(0, 6);
    
    artist.youtubeVideos = validYoutubeVideos;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Artist Header Section */}
      <div className="rounded-lg mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${fugazOne.className}`}>{artist.name}</h1>
      </div>

      {/* Artist Content */}
      <div className="border-t pt-8">
        {/* Biography */}
        {artist.biography && (
          <Biography text={artist.biography} />
        )}

        {/* Links */}
        {(artist.website || artist.instagram) && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">More</h3>
            {artist.website && (
              <a href={artist.website} target="_blank" rel="noopener noreferrer" 
                 className="text-blue-300 hover:underline block mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
                {new URL(artist.website).hostname}
              </a>
            )}
            {artist.instagram && (
              <a href={artist.instagram.replace('@', '')} target="_blank" 
                 rel="noopener noreferrer" className="text-blue-300 hover:underline block flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
                @{artist.instagram.split('/').filter(Boolean).pop()}
              </a>
            )}
          </div>
        )}

        {/* YouTube Videos */}
        {artist.youtubeVideos && artist.youtubeVideos.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">YouTube</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {artist.youtubeVideos.map((video: YouTubeVideo, index: number) => (
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

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-300">
            This profile page was generated using AI and publicly available information. If you're the artist and would like to edit or update it,{' '}
            <a href="mailto:hello@jazzfinder.com" className="text-blue-300 hover:underline"> please get in touch</a>.
          </p>
        </div>

        {/* Upcoming Shows */}
        {artist.events && artist.events.length > 0 && (
          <div className="border-t pt-8 mt-8">
            <h2 className="text-2xl font-bold mb-6">Upcoming Shows</h2>
            <ShowsList events={artist.events.filter(event => {
              const eventDate = new Date(event.dateString);
              const cutoffDate = new Date(Date.now() + EVENT_CONFIG.DAYS_AHEAD * 24 * 60 * 60 * 1000);
              return eventDate <= cutoffDate;
            })} />
          </div>
        )}
      </div>
    </div>
  )
}