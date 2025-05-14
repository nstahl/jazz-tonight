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

function EventCard({ event, id }) {
  const [shouldLoadVideo, setShouldLoadVideo] = React.useState(false);
  const [shouldPreload, setShouldPreload] = React.useState(false);
  const viewTimerRef = React.useRef(null);
  const isInitialMount = React.useRef(true);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '1800px 0px', // Triggers when the card is X px away from entering the viewport
  });

  // Add a ref to store the player instance
  const playerRef = React.useRef(null);
  const hasSeekedRef = React.useRef(false);
  const [isPlayerInitialized, setIsPlayerInitialized] = React.useState(false);
  
  // Add onReady handler to store the player instance
  const onReady = (event) => {
    console.log('onReady');
    if (event && event.target) {
      playerRef.current = event.target;
      hasSeekedRef.current = false;
      setIsPlayerInitialized(true);  // Set to true when player is ready
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

  // Add state for toast visibility
  const [showToast, setShowToast] = React.useState(false);

  // Handle view state changes
  React.useEffect(() => {
    // If this is the initial mount and we have a hash match, load the video immediately
    if (isInitialMount.current && window.location.hash === `#${id}`) {
      setShouldLoadVideo(true);
      setShouldPreload(true);
      isInitialMount.current = false;
      return;
    }

    if (inView) {
      // Start preloading immediately when the element comes into the extended viewport
      setShouldPreload(true);
      
      // Start a timer when the card comes into view
      viewTimerRef.current = setTimeout(() => {
        setShouldLoadVideo(true);
      }, 300);
    } else {
      // Clear the timer if the card goes out of view
      if (viewTimerRef.current) {
        clearTimeout(viewTimerRef.current);
      }
      // Only reset states if we're not the target of the hash
      if (window.location.hash !== `#${id}`) {
        setShouldLoadVideo(false);
        setShouldPreload(false);
      }
    }

    return () => {
      if (viewTimerRef.current) {
        clearTimeout(viewTimerRef.current);
      }
    };
  }, [inView, id]);

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

  // Modify share handler to include the card ID in the URL
  const handleShareClick = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(shareUrl);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div
      id={id}
      ref={ref}
      className={`
        block p-4 
        bg-white/10
        backdrop-blur-sm
        rounded-lg shadow 
        w-full max-w-[700px]
        relative
        mx-auto
        border border-green-500/30
        shadow-[0_0_15px_rgba(34,197,94,0.2)]
      `}
    >
      {/* Event Name */}
      <div className={`text-lg font-medium mb-2 ${fugazOne.className}`}>
        {event.artist ? (
          <a href={`/artist/${event.artist.id}`} className="hover:underline">
            {event.name}
          </a>
        ) : (
          <span>{event.name}</span>
        )}
      </div>

      {/* Date, Times, Venue */}
      <div className="flex justify-between text-sm">
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
              <span className="text-gray-100">ET</span>
            </>
          ) : (
            <span className="text-gray-100">Time TBA</span>
          )}
          {event.venue?.name && (
            <> • Live at {event.venue.name}</>
          )}
        </span>
      </div>

      {/* Venue Logline */}
      {event.venue?.logline && (
        <div className="text-xs italic text-gray-300 mt-1 mb-2">
          {event.venue.logline}
        </div>
      )}

      {/* YouTube player embedded in card */}
      {event.artist?.youtubeUrls && event.artist.youtubeUrls.length > 0 && (
        <div className="mt-4">
          <div className="relative pb-[56.25%] h-0">
            {(shouldLoadVideo || isPlayerInitialized) ? (
              <div className="absolute top-0 left-0 w-full h-full rounded-lg">
                <YouTube
                  videoId={getYoutubeVideoId(event.artist.youtubeUrls[0])}
                  opts={{ 
                    playerVars: { 
                      autoplay: 0, 
                      playlist: event.artist.youtubeUrls.map(getYoutubeVideoId).join(','),
                      modestbranding: 1,
                      rel: 0,
                      start: 30,
                      playsinline: 1,
                      enablejsapi: 1,
                    } 
                  }}
                  className="w-full h-full"
                  iframeClassName="w-full h-full rounded-lg"
                  onReady={onReady}
                  onStateChange={onPlayerStateChange}
                  onError={onError}
                />
              </div>
            ) : shouldPreload ? (
              <div className="absolute top-0 left-0 w-full h-full rounded-lg">
                <img
                  src={`https://img.youtube.com/vi/${getYoutubeVideoId(event.artist.youtubeUrls[0])}/maxresdefault.jpg`}
                  alt={`${event.artist.name} preview`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute top-0 left-0 w-full h-full rounded-lg cursor-pointer">
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
      <div className="grid grid-cols-[24px_1fr] gap-x-2 gap-y-4 mt-4">
        {/* Event Logline */}
        {event.logline && (
          <>
            <svg className="w-4 h-4 mt-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            <div className="text-sm">
              <h3 className="font-semibold mb-1">What to expect</h3>
              <p>{event.logline}</p>
            </div>
          </>
        )}

        {/* Musicians List */}
        {event.performers && event.performers.length > 0 && (
          <>
            <svg className="w-4 h-4 mt-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
            <div className="text-sm">
              <h3 className="font-semibold mb-1">The Band</h3>
              <div className="inline-grid grid-cols-2 gap-x-1 gap-y-1">
                {event.performers.map((m) => (
                  <React.Fragment key={event.id + '-' + m.performer.id}>
                    <div className="flex">
                      <span className="text-green-500">{m.performer.instrument}</span>
                    </div>
                    <div className="flex">
                      <span>{m.performer.name}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
              </div>
          </>
        )}

        {/* Venue Info */}
        {event.venue && event.venue.name && (
          <>
            <svg className="w-4 h-4 mt-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <div className="text-sm">
              <h3 className="font-semibold mb-1">About {event.venue.name}</h3>
              <p>More info on the venue coming soon...</p>
            </div>
          </>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="absolute bottom-15 right-4 bg-black/80 text-white px-1 py-1 rounded-lg shadow-lg animate-fade-in-out">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
            </svg>
            <span className="text-sm">Link copied to clipboard</span>
          </div>
        </div>
      )}

      {/* Share Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={() => window.open(event.url, '_blank')}
          className={'flex-1 flex items-center justify-center px-4 py-2 bg-white text-black rounded-lg shadow hover:bg-gray-100 transition cursor-pointer mr-2 ' + fugazOne.className}
        >
          Attend
        </button>
      
        <button
          className={'flex items-center px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-400 transition cursor-pointer ' + fugazOne.className}
          onClick={handleShareClick}
        >
          <svg className="w-6 h-6 md:mr-1 -rotate-45 -mt-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
          </svg>
          <span className="hidden md:inline">Share</span>
        </button>
      </div>
    </div>
  );
}

export default EventCard; 