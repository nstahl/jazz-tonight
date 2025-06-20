// @ts-nocheck
"use client"

import React from 'react';
import { Fugaz_One } from 'next/font/google';

const fugazOne = Fugaz_One({
    weight: '400',
    subsets: ['latin'],
  });


function EventCard({ event, linkToVenue = true }) {

  let proxiedPreviewUrl = null;
  if (event.artist?.spotifyTopTrack) {
    proxiedPreviewUrl = `/api/deezer-proxy?url=${encodeURIComponent(event.artist.spotifyTopTrack)}`;
  }

  const cardId = React.useId(); // Generate a unique ID for this card instance
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef(null);

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

  // Only allow one audio preview at a time
  React.useEffect(() => {
    if (!isPlaying) return;
    // Pause all other audio elements
    document.querySelectorAll('audio.spotify-preview').forEach((audio) => {
      if (audio !== audioRef.current) {
        audio.pause();
      }
    });
  }, [isPlaying]);

  const handleSpotifyPlayPause = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Pause when audio ends
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // Pause if unmounting
  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div
      id={cardId}
      className={`
        flex 
        flex-row
        block
        w-full 
        max-w-screen-lg
        relative
        mx-auto
        shadow-xl 
        shadow-black/40 
        transition-all 
        duration-200
        overflow-hidden
      `}
    >
      <div
        className={`flex-1 rounded-b-2xl transition-colors duration-200 p-3 sm:p-5 mt-0`}
      >
        <div className={`text-xl font-bold mb-2 text-white ${fugazOne.className} px-0 pt-0`}>
          <a href={`/event/${event.slug}`} className="line-clamp-2 sm:line-clamp-1">{event.name}</a>
        </div>
        <div className="flex justify-between text-md text-zinc-400">
          <span>
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
                <span className="hidden sm:inline"> • </span>
                <span className="block sm:inline mt-2 sm:mt-0">
                  <svg className="inline-block w-4 h-4 mr-1 sm:hidden" viewBox="0 0 24 24" fill="currentColor">
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
      </div>
      {/* Tickets Button + Spotify Button */}
      <div className="flex items-center justify-center sm:p-4 sm:p-0 sm:pr-6 sm:gap-2">
        {/* Spotify Play Button */}
        {(event.artist?.spotifyTopTrack || true) && (
          <>
            <button
              onClick={handleSpotifyPlayPause}
              className="hidden sm:flex rounded-full bg-blue-200 hover:bg-blue-300 transition-colors w-12 h-12 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
            >
              {isPlaying ? (
                // Pause icon
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="6" width="5" height="16" rx="2" fill="#2563eb" />
                  <rect x="17" y="6" width="5" height="16" rx="2" fill="#2563eb" />
                </svg>
              ) : (
                // Play icon
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="14" cy="14" r="14" fill="#bfdbfe" />
                  <polygon points="11,8 22,14 11,20" fill="#2563eb" />
                </svg>
              )}
            </button>
            <audio
              ref={audioRef}
              className="deezer-preview"
              src="https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/86/3a/a7/863aa78c-6d5b-13b2-446a-179e0947ee5d/mzaf_7418669135393679219.plus.aac.p.m4a"
              preload="none"
              onEnded={handleAudioEnded}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onError={() => {
                console.warn("Deezer preview failed to load");
                setIsPlaying(false);
              }}
            />
          </>
        )}
        <a
          href={`/event/${event.slug}`}
          className="hidden sm:block bg-zinc-100 text-black font-bold rounded-xl sm:px-8 sm:py-4 text-lg hover:bg-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={e => e.stopPropagation()}
        >
          Tickets
        </a>
      </div>
    </div>
  );
}

export default EventCard; 