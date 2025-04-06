import prisma from '../../../../lib/prisma';
import { notFound } from 'next/navigation'

// Add this type definition for the page props
type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function ArtistPage({ params, searchParams }: Props) {
  const artist = await prisma.artistProfile.findUnique({
    where: { id: params.id },
    include: { 
      events: {
        include: {
          venue: true
        }
      }
    }
  })

  if (!artist) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{artist.name}</h1>
      
      {artist.biography && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Biography</h2>
          <p className="whitespace-pre-wrap">{artist.biography}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        {artist.website && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Website</h2>
            <a href={artist.website} target="_blank" rel="noopener noreferrer" 
               className="text-blue-600 hover:underline">
              {artist.website}
            </a>
          </div>
        )}
        
        {artist.instagram && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Instagram</h2>
            <a href={`https://instagram.com/${artist.instagram}`} target="_blank" 
               rel="noopener noreferrer" className="text-blue-600 hover:underline">
              @{artist.instagram}
            </a>
          </div>
        )}
      </div>

      {artist.youtubeUrls.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">YouTube Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {artist.youtubeUrls.slice(0, 4).map((url: string, index: number) => {
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

      {artist.events.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Upcoming Events</h2>
          <ul className="space-y-2">
            {artist.events.map((event) => (
              <li key={event.id} className="border p-3 rounded">
                <h3 className="font-semibold">{event.name}</h3>
                <p className="text-gray-600">
                  {event.dateString} {event.timeString} • {event.venue.name}
                </p>
                <a 
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                >
                  Event details
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}