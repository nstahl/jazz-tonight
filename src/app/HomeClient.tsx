'use client';

import { useEffect, useState, useRef } from 'react';
import EventCard from '@/components/EventCard';
import { Fugaz_One } from 'next/font/google';

const fugazOne = Fugaz_One({
  weight: '400',
  subsets: ['latin'],
});

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
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/events?startDate=${startDate}&endDate=${endDate}`);
        const events = await response.json();
        setEvents(events);
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

  // Group events by dateString
  const groupedEvents = events.reduce((acc, event) => {
    (acc[event.dateString] = acc[event.dateString] || []).push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  // Sort dates ascending
  const sortedDates = Object.keys(groupedEvents).sort();

  return (
    <div className="mx-auto pb-24">
      <div className="grid">
        {sortedDates.map((date) => (
          <div key={date}>
            <div className="sticky top-20 z-10 bg-black py-2 mb-2 border-t border-b border-zinc-400/30">    
            <div className="max-w-screen-lg mx-auto px-2">
              <span className={`text-xl font-bold text-white ${fugazOne.className}`}>
                {(() => {
                  // date is in YYYY-MM-DD
                  const [year, month, day] = date.split('-');
                  const d = new Date(Number(year), Number(month) - 1, Number(day));
                  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
                  const monthStr = d.toLocaleDateString('en-US', { month: 'short' });
                  return `${weekday}, ${monthStr} ${Number(day)}, ${year}`;
                })()}
              </span>
              </div>
            </div>
            {groupedEvents[date].map((event) => (
              <div key={event.id} className="mt-2 px-2">
                <EventCard key={event.id} event={event} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}