'use client'

import { useEffect, useState } from 'react';
import { Fugaz_One } from 'next/font/google';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const fugazOne = Fugaz_One({
  weight: '400',
  subsets: ['latin'],
});

interface Event {
  id: string;
  name: string;
  url: string;
  dateString: string;
  timeString: string | null;
  venueId: string;
  venue: {
    name: string;
  };
  artist: {
    id: string;
    name: string;
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
      console.log("screenWidth", screenWidth);
      console.log("columns", columns);
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
        const events = await response.json();
        
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
                  if (!a.timeString) return 1;
                  if (!b.timeString) return -1;
                  return a.timeString.localeCompare(b.timeString);
                })
                .map((event) => (
                  <div 
                    key={event.id}
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
                          {event.timeString ? (
                            <>
                              {new Date(`2000-01-01T${event.timeString}`).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
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
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}