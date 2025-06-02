// @ts-nocheck
"use client"

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

// Add this at the top level of the file, outside the component
let activePlayerId: string | null = null;

function EventCard({ event, linkToVenue = true }) {
  const [shouldLoadVideo, setShouldLoadVideo] = React.useState(false);
  const [isThumbnailClicked, setIsThumbnailClicked] = React.useState(false);
  const cardId = React.useId(); // Generate a unique ID for this card instance

  // Generate a unique gradient angle based on the card ID
  const gradientAngle = React.useMemo(() => {
    // Convert the card ID to a number and use it to generate an angle between 0 and 360
    const hash = cardId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    // If event.id exists, use it to generate a more stable hash
    if (event.id) {
      const idHash = event.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return (idHash % 360);
    }
    return (hash % 360);
  }, [cardId]);

  // Define a set of gradients
  const gradients = [
    `linear-gradient(120deg, rgba(10, 23, 253, 0.1) 0%, rgba(120, 138, 255, 0.1) 50%, rgba(168, 144, 254, 0.2) 100%)`,
    `linear-gradient(120deg, rgba(23, 10, 253, 0.1) 0%, rgba(138, 120, 255, 0.1) 50%, rgba(203, 190, 250, 0.2) 100%)`,
    `linear-gradient(120deg, rgba(123, 10, 253, 0.1) 0%, rgba(138, 120, 255, 0.1) 50%, rgba(210, 201, 246, 0.2) 100%)`,
  ];

  // Choose a gradient based on the angle
  const selectedGradient = React.useMemo(() => {
    const index = Math.floor((gradientAngle / 360) * gradients.length);
    return gradients[index];
  }, [gradientAngle]);

  // Add a ref to store the player instance
  const playerRef = React.useRef(null);
  const hasSeekedRef = React.useRef(false);
  
  // Update onPlayerStateChange handler
  const onPlayerStateChange = (event) => {
    if (event && event.target) {
      // YouTube.PlayerState.PLAYING = 1
      if (event.data === 1) {
        // If there's an active player that's not this one, pause it
        if (activePlayerId && activePlayerId !== cardId && window[`player_${activePlayerId}`]) {
          try {
            window[`player_${activePlayerId}`].pauseVideo();
          } catch (error) {
            console.error('Error pausing video:', error);
          }
        }
        // Set this as the active player
        activePlayerId = cardId;
        window[`player_${cardId}`] = event.target;
      }
    }
  };

  // Add onReady handler to store the player instance
  const onReady = (event) => {
    console.log('onReady');
    if (event && event.target) {
      playerRef.current = event.target;
      hasSeekedRef.current = false;
    }
  };

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
      id={cardId}
      onClick={() => window.open(`/event/${event.slug}`, '_self')}
      className={`
        flex flex-col md:flex-row
        block p-0
        bg-[#18181b]
        rounded-2xl
        w-full max-w-[900px]
        relative
        mx-auto
        border border-zinc-800
        shadow-xl shadow-black/40 transition-all duration-200
        cursor-pointer
        hover:bg-[#23232a]
        hover:border-zinc-400
        overflow-hidden
      `}
      style={{
        background: selectedGradient
      }}
    >
      {/* Left: YouTube player or image */}
      <div className="md:w-[45%] w-full md:min-w-[280px] md:max-w-[320px] mb-0 md:mb-0 md:mr-0">
        <div className="relative pb-[56.25%] md:pb-0 md:h-[225px] h-0 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none overflow-hidden">
          {event.artist?.youtubeUrls && event.artist.youtubeUrls.length > 0 ? (
            (shouldLoadVideo && isThumbnailClicked) ? (
              <div className="absolute top-0 left-0 w-full h-full rounded-xl overflow-hidden">
                <YouTube
                  videoId={getYoutubeVideoId(event.artist.youtubeUrls[0])}
                  opts={{ 
                    playerVars: { 
                      autoplay: 1, 
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
            )
          ) : (
            <div className="absolute top-0 left-0 w-full h-full rounded-xl overflow-hidden">
              <img
                src={event.venue?.thumbnail ? `/${event.venue.thumbnail}` : "/thumb_generic.jpg"}
                alt="Event preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
      {/* Right: Main info section */}
      <div
        className="flex-1 cursor-pointer rounded-b-2xl md:rounded-b-none md:rounded-r-2xl transition-colors duration-200 p-3 md:p-5 mt-0"
        onClick={() => window.open(`/event/${event.slug}`, '_self')}
      >
        <div className={`text-xl font-bold mb-2 text-white ${fugazOne.className} px-0 pt-0`}>
          <span>{event.name}</span>
        </div>
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
                {event.setTimes.map((timeString, index) => (
                  <React.Fragment key={timeString}>
                    {new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                    {index < event.setTimes.length - 1 && ' & '}
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
                linkToVenue ? (
                  <a 
                    href={`/venue/${event.venue.slug}`} 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-300 hover:underline transition-colors"
                >
                  {event.venue.name}
                </a>
              ) : (
                event.venue.name
              )}</span>
              </>
            )}
          </span>
        </div>

        <div className="flex flex-col gap-y-4 mt-2">
          {/* Event Logline */}
          {event.logline && (
            <>
              <div className="hidden md:block text-sm text-zinc-200">
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