'use client'

import { useEffect, useState } from 'react';
import { Fugaz_One } from 'next/font/google';
import styles from './page.module.css';

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
    return <div>Loading...</div>;
  }

  return (
      <div>
          <div className="grid grid-flow-col auto-cols-[minmax(300px,400px)] gap-6">
            {dateGroups.map(([dateString, dateEvents]) => (
              <h2 key={dateString} className="text-xl font-semibold text-center">
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
              </h2>
            ))}
          </div>

          <div className="grid grid-flow-col auto-cols-[minmax(300px,400px)] gap-6">
            {dateGroups.map(([dateString, dateEvents]) => (
              <div key={dateString} className="mb-6 md:mb-0">
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