'use client';

import React from 'react';

interface SpotifyPlayerProps {
  trackId: string;
}

export default function SpotifyPlayer({ trackId }: SpotifyPlayerProps) {
  return (
    <div className="mb-8">
      <iframe 
        src={`https://open.spotify.com/embed/track/${trackId}`}
        width="100%" 
        height="152" 
        frameBorder="0" 
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
        loading="lazy"
        className="rounded-lg"
      />
    </div>
  );
} 

