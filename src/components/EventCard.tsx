// @ts-nocheck

import React from 'react';
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

function EventCard({ event, id }) {
  const [shouldLoadVideo, setShouldLoadVideo] = React.useState(false);
  const [isThumbnailClicked, setIsThumbnailClicked] = React.useState(false);

  // Add a ref to store the player instance
  const playerRef = React.useRef(null);
  const hasSeekedRef = React.useRef(false);
  
  // Add onReady handler to store the player instance
  const onReady = (event) => {
    console.log('onReady');
    if (event && event.target) {
      playerRef.current = event.target;
      hasSeekedRef.current = false;
    }
  };

  const onPlayerStateChange = (event) => {
    console.log('onPlayerStateChange');
    if (event && event.target) {
      console.log("playerRef.current", playerRef.current);
      console.log(event.data);
    }
  }

  // Add error handler
  const onError = (error) => {
    console.error('YouTube player error:', error);
  };

  // Add cleanup effect
  React.useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.error('Error destroying player:', error);
        }
      }
    };
  }, []);

  const handleThumbnailClick = (e) => {
    e.stopPropagation(); // Prevent the card click event from firing
    setIsThumbnailClicked(true);
    setShouldLoadVideo(true);
  };

  return (
    <div
      id={id}
      onClick={() => window.open(`/event/${event.id}`, '_self')}
      className={`
        block p-5
        bg-[#18181b]
        rounded-2xl
        w-full max-w-[700px]
        relative
        mx-auto
        border border-zinc-800
        shadow-xl shadow-black/40 transition-all duration-200
        cursor-pointer
        hover:bg-[#23232a]
        hover:border-zinc-400
      `}
    >
      {/* YouTube player or image at the top */}
      {event.artist?.youtubeUrls && event.artist.youtubeUrls.length > 0 && (
        <div className="mb-4 -mx-5 mt-[-20px]">
          <div className="relative pb-[56.25%] h-0 rounded-t-2xl overflow-hidden">
            {(shouldLoadVideo && isThumbnailClicked) ? (
              <div className="absolute top-0 left-0 w-full h-full rounded-xl overflow-hidden">
                <YouTube
                  videoId={getYoutubeVideoId(event.artist.youtubeUrls[0])}
                  opts={{ 
                    playerVars: { 
                      autoplay: 1, 
                      playlist: event.artist.youtubeUrls.map(getYoutubeVideoId).join(','),
                      modestbranding: 1,
                      rel: 0,
                      start: 30,
                      playsinline: 1,
                      enablejsapi: 1,
                    } 
                  }}
                  className="w-full h-full"
                  iframeClassName="w-full h-full"
                  onReady={onReady}
                  onStateChange={onPlayerStateChange}
                  onError={onError}
                />
              </div>
            ) : (
              <div 
                className="absolute top-0 left-0 w-full h-full rounded-xl overflow-hidden cursor-pointer"
                onClick={handleThumbnailClick}
              >
                <img
                  src={`https://img.youtube.com/vi/${getYoutubeVideoId(event.artist.youtubeUrls[0])}/hqdefault.jpg`}
                  alt={`${event.artist.name} preview`}
                  className="w-full h-full object-cover"
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
      {/* Main info section below video */}
      <div
        className="cursor-pointer rounded-b-2xl transition-colors duration-200 p-0 mt-0"
        onClick={() => window.open(`/event/${event.id}`, '_self')}
      >
        <div className={`text-xl font-bold mb-2 text-white ${fugazOne.className} px-0 pt-0 px-1.5 pt-3`}>
          <span>{event.name}</span>
        </div>
        <div className="flex justify-between text-sm text-zinc-400 mb-2 px-1.5">
          <span>
            {new Date(event.dateString).toLocaleDateString('en-US', {
              weekday: 'long',
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
                <span className="text-zinc-400">ET</span>
              </>
            ) : (
              <span className="text-zinc-400">Time TBA</span>
            )}
            {event.venue?.name && (
              <> • Live at {event.venue.name}</>
            )}
          </span>
        </div>
        {event.venue?.logline && (
          <div className="text-xs italic text-zinc-400 mt-1 mb-3 px-1.5">
            {event.venue.logline}
          </div>
        )}
        <div className="flex flex-col gap-y-4 mt-2 px-1.5 pb-3"
        >
          {/* Event Logline */}
          {event.logline && (
            <>
              <div className="text-md text-zinc-200">
                <p>{event.logline}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventCard; 