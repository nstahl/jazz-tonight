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

import { useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import EventCard from '@/components/EventCard';

interface Event {
  id: string;
  name: string;
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
  const [columnsCount, setColumnsCount] = useState(1);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const calculateColumns = () => {
      const columnWidth = 400 + 24; // max width of each column
      const screenWidth = Math.min(window.innerWidth, 1536) - 32; // max width of container is 1536px; 16px padding on each side; 
      const columns = Math.max(1, Math.floor(screenWidth / columnWidth));
      setColumnsCount(columns);
    };

    // Calculate initially
    calculateColumns();

    // Add resize listener
    window.addEventListener('resize', calculateColumns);

    // Cleanup
    return () => window.removeEventListener('resize', calculateColumns);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        const eventsDisagreggated = await response.json();
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

  if (loading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-4 lg:px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-flow-col md:auto-cols-[minmax(300px,1fr)] gap-6 overflow-hidden">
          {[1, 2, 3].map((column) => (
            <div key={column}>
              <div className="h-8 bg-white/10 rounded-lg mb-6 animate-pulse" />
              <div className="grid gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((card) => (
                  <div 
                    key={card}
                    className="block p-4 bg-white/10 backdrop-blur-sm rounded-lg shadow w-full max-w-[500px] relative mx-auto"
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
      <div className="grid grid-flow-col auto-cols-[minmax(300px,1fr)] gap-6 overflow-hidden">
        {dateGroups.slice(startIndex, startIndex + columnsCount).map(([dateString, dateEvents]) => (
          <div key={dateString}>
            <h2 className="text-xl font-semibold mb-6 relative">
              
                  {dateGroups.findIndex(([date]) => date === dateString) === startIndex && (
                    <button 
                      onClick={() => setStartIndex(prev => Math.max(prev - 1, 0))}
                      className="absolute left-0 top-1/2 -translate-y-1/2 p-1 hover:text-gray-300 transition-colors cursor-pointer"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                  )}

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
                
                {dateGroups.findIndex(([date]) => date === dateString) === startIndex + columnsCount - 1 && (
                  <button 
                    onClick={() => setStartIndex(prev => Math.min(prev + 1, dateGroups.length - columnsCount))}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:text-gray-300 transition-colors cursor-pointer"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                )}
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
                    />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}