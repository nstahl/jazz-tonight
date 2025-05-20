'use client';

import { Fugaz_One } from 'next/font/google';
import React from 'react';

const fugazOne = Fugaz_One({
  weight: '400',
  subsets: ['latin'],
});

type Event = {
  id: string;
  name: string;
  dateString: string;
  timeString: string | null;
  url: string;
  venue: { name: string };
  setTimes: string[];
};

type ShowsListProps = {
  events: Event[];
};

export default function ShowsList({ events }: ShowsListProps) {
  return (
    <>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((event: Event, index: number) => (
          <li key={event.id} className={index >= 4 ? "hidden additional-show" : ""}>
            <div className="block p-4 bg-white/10 backdrop-blur-sm rounded-lg shadow w-full relative">
              <a 
                className="block hover:bg-gray-300/60 -m-4 p-4 rounded-lg transition-all"
                href={`/event/${event.id}`}
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
          </li>
        ))}
      </ul>
      {events.length > 4 && (
        <div className="text-center mt-6">
          <button 
            onClick={(e) => {
              const button = e.currentTarget;
              document.querySelectorAll('.additional-show').forEach(el => el.classList.toggle('hidden'));
              button.textContent = button.textContent?.includes('Show all') ? 'Show less' : 'Show all shows';
            }}
            className="text-blue-300 hover:underline"
          >
            Show all {events.length} upcoming shows
          </button>
        </div>
      )}
    </>
  );
} 