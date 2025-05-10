// @ts-nocheck

import React from 'react';
import { useInView } from 'react-intersection-observer';
import { Fugaz_One } from 'next/font/google';
import YouTube from 'react-youtube';

// Helper function to extract video ID from YouTube URL
const getYoutubeVideoId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const fugazOne = Fugaz_One({
    weight: '400',
    subsets: ['latin'],
  });

function EventCard({ event }) {

  const { ref, inView } = useInView({
    threshold: 0.9,
  });


  return (
    <div
      ref={ref}
      className={`
        block p-4 
        bg-white/10
        backdrop-blur-sm
        rounded-lg shadow 
        w-full max-w-[500px]
        relative
        mx-auto
      `}
    >
        {inView ? 'Component is on screen' : 'Component is off screen'}
      <a 
        className="block hover:bg-gray-300/60 -m-4 p-4 rounded-lg transition-all"
        href={`/events/${event.id}`}
      >
        <div className={`text-lg font-medium mb-2 ${fugazOne.className}`}>
          <span>{event.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>
            {new Date(event.dateString).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              timeZone: 'UTC'
            })} • {' '}
            {event.timeStrings && event.timeStrings.length > 0 ? (
              <>
                {event.timeStrings.map((timeString, index) => (
                  <React.Fragment key={timeString}>
                    {new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                    {index < event.timeStrings.length - 1 && ' & '}
                  </React.Fragment>
                ))}
                {' '}
                <span className="text-gray-100">ET</span>
              </>
            ) : (
              <span className="text-gray-100">Time TBA</span>
            )}
          </span>
          <span>{event.venue.name}</span>
        </div>
      </a>

      {/* YouTube player embedded in card */}
      {event.artist?.youtubeUrls && event.artist.youtubeUrls.length > 0 && (
        <div className="mt-4">
          <div className="relative pb-[56.25%] h-0">
            {/* Always show navigation arrows if multiple videos */}
            {/* Video or thumbnail */}
            {inView ? (
              <div className="absolute top-0 left-0 w-full h-full rounded-lg grayscale">
                <YouTube
                  videoId={getYoutubeVideoId(event.artist.youtubeUrls[0])}
                  opts={{ playerVars: { autoplay: 0, playlist: event.artist.youtubeUrls.map(getYoutubeVideoId).join(',') } }}
                  className="w-full h-full"
                  iframeClassName="w-full h-full rounded-lg"
                />
              </div>
            ) : (
              <div
                className="absolute top-0 left-0 w-full h-full rounded-lg cursor-pointer"
              >
                <img
                  src={`./charcoal_vibes_455x260.png`}
                  alt={`${event.artist.name} preview`}
                  className="w-full h-full object-cover rounded-lg grayscale"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EventCard; 