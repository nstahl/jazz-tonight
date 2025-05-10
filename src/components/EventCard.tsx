// @ts-nocheck

import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Fugaz_One } from 'next/font/google';
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

function EventCard({ event, playingVideo, setPlayingVideo }) {
  const [previewIndex, setPreviewIndex] = useState(0);
  const isPlaying = playingVideo?.eventId === event.id;
  const currentIndex = isPlaying ? playingVideo.videoIndex : previewIndex;

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
            {event.artist.youtubeUrls.length > 1 && (
              <>
                {currentIndex > 0 && (
                  <button
                    className="absolute top-1/2 left-2 z-10 -translate-y-1/2 bg-white/90 hover:bg-blue-500/70 text-white rounded-full p-2 transition-colors"
                    style={{ backdropFilter: 'blur(2px)' }}
                    onClick={e => {
                      e.preventDefault();
                      if (isPlaying) {
                        setPlayingVideo({ eventId: event.id, videoIndex: currentIndex - 1 });
                      } else {
                        setPreviewIndex(currentIndex - 1);
                      }
                    }}
                    title="Previous video"
                  >
                    <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
                  </button>
                )}
                {currentIndex < event.artist.youtubeUrls.length - 1 && (
                  <button
                    className="absolute top-1/2 right-2 z-10 -translate-y-1/2 bg-white/90 hover:bg-blue-500/70 text-white rounded-full p-2 transition-colors"
                    style={{ backdropFilter: 'blur(2px)' }}
                    onClick={e => {
                      e.preventDefault();
                      if (isPlaying) {
                        setPlayingVideo({ eventId: event.id, videoIndex: currentIndex + 1 });
                      } else {
                        setPreviewIndex(currentIndex + 1);
                      }
                    }}
                    title="Next video"
                  >
                    <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" /></svg>
                  </button>
                )}
              </>
            )}
            {/* Video or thumbnail */}
            {isPlaying || inView ? (
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-lg grayscale"
                src={`https://www.youtube.com/embed/${getYoutubeVideoId(event.artist.youtubeUrls[currentIndex])}?playsinline=1&enablejsapi=1&start=${60 + Math.floor(Math.random() * 31)}`}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div
                className="absolute top-0 left-0 w-full h-full rounded-lg cursor-pointer"
                onClick={e => {
                  e.preventDefault();
                  setPlayingVideo({ eventId: event.id, videoIndex: currentIndex });
                }}
              >
                <img
                  src={`https://img.youtube.com/vi/${getYoutubeVideoId(event.artist.youtubeUrls[currentIndex])}/maxresdefault.jpg`}
                  alt={`${event.artist.name} preview`}
                  className="w-full h-full object-cover rounded-lg grayscale"
                  onLoad={e => {
                    const img = e.currentTarget;
                    // YouTube fallback is usually 120x90 or 480x360
                    if (img.naturalWidth === 120 && img.naturalHeight === 90) {
                      img.src = [ './placeholder-charcoal-455x260.png',
                                  './charcoal_vibes_455x260.png',
                                  './charcoal_guitar_bass_drums_455x260.png',
                                  'charcoal_snare_accordion_bass_violin_455x260.png'
                                ][Math.floor(Math.random() * 3)];
                    }
                  }}
                  onError={e => {
                    // This will only fire for true network errors
                    const img = e.currentTarget;
                    console.log('Error loading image:', img.src);
                  }}
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
          {/* Dots for multiple videos */}
          {event.artist?.youtubeUrls && event.artist.youtubeUrls.length > 1 && (
            <div className="flex justify-center gap-1 mt-2">
              {event.artist.youtubeUrls.map((_, idx) => (
                <span
                  key={`${idx}-${event.id}`}
                  className={`inline-block w-2 h-2 rounded-full ${currentIndex === idx ? 'bg-white' : 'bg-white/40'}`}
                  style={{ transition: 'background 0.2s' }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EventCard; 