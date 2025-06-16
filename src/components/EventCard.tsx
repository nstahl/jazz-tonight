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

// Helper function to extract track ID from Spotify URL
const getSpotifyTrackId = (url: string) => {
  const regExp = /track\/([a-zA-Z0-9]+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
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
      className={`
        flex flex-col sm:flex-row
        block p-0
        bg-[#18181b]
        rounded-2xl
        w-full max-w-screen-lg
        relative
        mx-auto
        border border-zinc-800
        shadow-xl shadow-black/40 transition-all duration-200
        overflow-hidden
      `}
      style={{
        background: selectedGradient
      }}
    >
      <div
        className={`flex-1 rounded-b-2xl transition-colors duration-200 p-3 sm:p-5 mt-0`}
      >
        <div className={`text-xl font-bold mb-2 text-white ${fugazOne.className} px-0 pt-0`}>
          <span>{event.name}</span>
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
    </div>
  );
}

export default EventCard; 