// @ts-nocheck

'use client'

declare global {
  interface Window {
    YT: {
      Player: new (element: any, options: any) => any;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

import { useEffect, useState, useRef } from 'react';
import EventCard from '@/components/EventCard';

interface Event {
  id: string;
  name: string;
  logline: string;
  url: string;
  dateString: string;
  timeString: string;
  timeStrings: string[];
  venueId: string;
  venue: {
    name: string;
  };
  artist: {
    id: string;
    name: string;
    youtubeUrls?: string[];
  } | null;
}

export default function Page() {
  const [dateGroups, setDateGroups] = useState<[string, Event[]][]>([]);
  const [loading, setLoading] = useState(true);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        const eventsDisagreggated = await response.json();
        console.log("eventsDisagreggated", eventsDisagreggated);
        // Create a dictionary to track unique artist-date combinations
        const artistDateDict: Record<string, Event[]> = {};

        // Process each event and only add if artist-date combination is unique
        for (const event of eventsDisagreggated) {
          if (event.artist && event.dateString) {
            const key = `${event.artist.id}-${event.dateString}`;
            // Initialize set for this artist if not exists
            if (!artistDateDict[key]) {
              artistDateDict[key] = [event];
            } else {
              artistDateDict[key].push(event);
            }
          } else {
            // If no artist, just add the event
            console.log('No artist or date for for event:', event);
          }
        }
        const tempEvents = [];
        for (const key in artistDateDict) {
          const disaggregatedEventsForArtistDate = artistDateDict[key];
          const timeStrings = disaggregatedEventsForArtistDate.map(event => event.timeString);
          const artistDateEvent = {
            id: disaggregatedEventsForArtistDate[0].id,
            url: disaggregatedEventsForArtistDate[0].url,
            name: disaggregatedEventsForArtistDate[0].name,
            dateString: disaggregatedEventsForArtistDate[0].dateString,
            timeStrings: timeStrings,
            performers: disaggregatedEventsForArtistDate[0].performers,
            logline: disaggregatedEventsForArtistDate[0].logline,
            venueId: disaggregatedEventsForArtistDate[0].venueId,
            venue: disaggregatedEventsForArtistDate[0].venue,
            artist: disaggregatedEventsForArtistDate[0].artist,
          }
          tempEvents.push(artistDateEvent);
        }

        const events = tempEvents;

        // Group events by date
        const groupedEvents = events.reduce((acc: Record<string, Event[]>, event: Event) => {
          if (!acc[event.dateString]) {
            acc[event.dateString] = [];
          }
          acc[event.dateString].push(event);
          return acc;
        }, {});

        setDateGroups(Object.entries(groupedEvents));
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Modified useEffect for hash-based scrolling
  useEffect(() => {
    if (!loading && !hasScrolledRef.current) {
      const hash = window.location.hash;
      if (hash) {
        const element = document.getElementById(hash.slice(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          hasScrolledRef.current = true;
        }
      }
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-4 lg:px-4 pb-24">
        <div className="grid gap-8">
          {[1, 2, 3].map((column) => (
            <div key={column}>
              <div className="h-8 bg-white/10 rounded-lg mb-6 animate-pulse" />
              <div className="grid gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((card) => (
                  <div 
                    key={card}
                    className="block p-4 bg-white/10 backdrop-blur-sm rounded-lg shadow w-full max-w-[700px] relative mx-auto"
                  >
                    <div className="space-y-3">
                      <div className="h-6 bg-white/20 rounded animate-pulse" />
                      <div className="flex justify-between">
                        <div className="h-4 w-32 bg-white/20 rounded animate-pulse" />
                        <div className="h-4 w-24 bg-white/20 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-4 lg:px-4 pb-24">
      <div className="grid gap-8">
        {dateGroups.map(([dateString, dateEvents]) => (
          <div key={dateString}>
            <h2 className="text-xl font-semibold mb-6">
              <div className="text-center">
                {new Date(dateEvents[0].dateString).toLocaleDateString('en-US', {
                  weekday: 'long',
                  timeZone: 'UTC'
                })}
                {', '}
                {new Date(dateString).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  timeZone: 'UTC'
                })}
              </div>
            </h2>

            <div className="grid gap-4">
              {dateEvents
                .sort((a, b) => {
                  if (!a.timeStrings) return 1;
                  if (!b.timeStrings) return -1;
                  return (a.timeStrings[0] || '').localeCompare(b.timeStrings[0] || '');
                })
                .map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      id={`event-${event.id}`}
                    />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}