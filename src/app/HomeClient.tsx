'use client';

import { useEffect, useState, useRef } from 'react';
import EventCard from '@/components/EventCard';

interface Event {
  id: string;
  name: string;
  logline: string;
  url: string;
  dateString: string;
  timeStrings: string[];
  venueId: string;
  venue: {
    name: string;
    slug: string;
    url: string;
    gMapsUrl: string;
  };
  artist: string;
  performers: {
    performer: string;
  }[];
}

interface HomeClientProps {
  startDate: string;
  endDate: string;
}

export default function HomeClient({ startDate, endDate }: HomeClientProps) {
  const [dateGroups, setDateGroups] = useState<[string, Event[]][]>([]);
  const [loading, setLoading] = useState(true);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/events?startDate=${startDate}&endDate=${endDate}`);
        const eventsDisagreggated = await response.json();

        // Group events by date
        const groupedEvents = eventsDisagreggated.reduce((acc: Record<string, Event[]>, event: Event) => {
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
  }, [startDate, endDate]);

  // Save scroll position before leaving the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem('homeScrollPosition', window.scrollY.toString());
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Restore scroll position when returning to the page
  useEffect(() => {
    if (!loading && !hasScrolledRef.current) {
      const hash = window.location.hash;
      if (hash) {
        const element = document.getElementById(hash.slice(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          hasScrolledRef.current = true;
        }
      } else {
        const savedPosition = sessionStorage.getItem('homeScrollPosition');
        if (savedPosition) {
          window.scrollTo(0, parseInt(savedPosition));
          hasScrolledRef.current = true;
        }
      }
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-4 lg:px-4 pb-24">
        <div className="grid gap-8">
          {[1].map((column) => (
            <div key={column}>
              <div className="grid gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((card) => (
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
      <div className="grid gap-2">
        {dateGroups.map(([dateString, dateEvents]) => (
            <div key={dateString} className="grid gap-2 mt-2">
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
        ))}
      </div>
    </div>
  );
}