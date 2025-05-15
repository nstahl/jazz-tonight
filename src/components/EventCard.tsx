// @ts-nocheck

import React from 'react';
import { useInView } from 'react-intersection-observer';
import { Fugaz_One } from 'next/font/google';
import YouTube from 'react-youtube';
import ShareButton from './ShareButton';

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

  return (
    <div
      id={id}
      ref={ref}
      className={`
        block p-4 
        bg-white/10
        rounded-lg
        w-full max-w-[700px]
        relative
        mx-auto
        border border-blue-500/30
        transition-all duration-400
        shadow-[6px_6px_3px_0px_rgba(59,130,246,0.2)]
        hover:translate-x-[-2px]
        hover:translate-y-[-2px]
        hover:shadow-[8px_8px_3px_2px_rgba(59,130,246,0.2)]
        backdrop-blur-sm
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
          {event.artist && (
            <div className="mt-1 text-sm text-gray-300 text-center">
            More about&nbsp;
              <a 
                href={`/artist/${event.artist.id}`}
                className="font-bold hover:underline"
              >
                {event.artist.name}
              </a>
            </div>
          )}
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
                      <span className="text-gray-400">{m.performer.instrument}</span>
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

      {/* CTAs */}
      <div className="flex justify-end mt-4">
        <button
          onClick={() => window.open(`/event/${event.id}`, '_self')}
          className={'flex-1 flex items-center justify-center px-4 py-2 bg-white text-black rounded-lg shadow hover:bg-gray-100 transition cursor-pointer mr-2 ' + fugazOne.className}
        >
          Tickets
        </button>
      
        <ShareButton url={`${window.location.origin}/event/${event.id}`} />
      </div>
    </div>
  );
}

export default EventCard; 