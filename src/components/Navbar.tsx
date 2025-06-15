'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { EVENT_CONFIG } from '@/config/constants';
import { useState, useRef, useEffect } from 'react';
import { useDateRange } from '@/context/DateRangeContext';
import { DateRange } from 'react-date-range';
import { addDays, format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const Navbar = () => {
  const pathname = usePathname();
  const { setDateRange } = useDateRange();

  const today = new Date();
  const minDate = today;
  const maxDate = addDays(today, EVENT_CONFIG.DAYS_AHEAD);

  const [showCalendar, setShowCalendar] = useState(false);
  const [range, setRange] = useState({
    startDate: today,
    endDate: maxDate,
    key: 'selection',
  });

  const pickerRef = useRef<HTMLDivElement>(null);

  const formatDisplay = (date: Date) => format(date, 'MMM d');

  useEffect(() => {
    if (!showCalendar) {
      setDateRange(format(range.startDate, 'yyyy-MM-dd'), format(range.endDate, 'yyyy-MM-dd'));
    }
  }, [showCalendar, range.startDate, range.endDate, setDateRange]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (ranges: any) => {
    console.log("handleSelect", ranges);
    setRange({
      ...ranges.selection,
      key: 'selection',
    });
  };

  const [logoSrc, setLogoSrc] = useState('/atrium.svg');

  useEffect(() => {
    if (window.innerWidth < 1024 && pathname === '/') {
      setLogoSrc('/atrium.svg');
    } else {
      setLogoSrc('/atrium.svg');
    }
  }, [pathname]);

  return (
    <nav className="
    bg-black 
    text-white 
    py-4
    fixed
    w-full
    top-0 
    z-50
    h-20"
      style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.5)'
      }}
    >
      <div className="
      max-w-screen-lg
      mx-auto 
      flex 
      justify-between 
      items-center 
      h-full
      px-2">
        <Link href="/" className="flex items-center space-x-2 cursor-pointer">
          <div>
            <Image
              src={logoSrc}
              alt="Atrium Jazz Logo"
              width={550}
              height={110}
              priority
              className="h-8 w-auto hover:opacity-80"
            />
          </div>
        </Link>
        {pathname === '/' && (
          <>
            {/* Mobile Calendar Icon */}
            <div className="flex cursor-pointer select-none" 
              onClick={() => setShowCalendar(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            
            {showCalendar && (
              <div
                ref={pickerRef}
                className="fixed md:absolute right-0 top-20 md:top-12 z-40 bg-white rounded-md max-w-sm shadow-2xl transition-all duration-300 ease-out transform scale-95 opacity-0 animate-fadeIn"
                style={{
                  animation: 'fadeIn 0.3s forwards'
                }}
              >
                <DateRange
                  ranges={[range]}
                  onChange={handleSelect}
                  minDate={minDate}
                  maxDate={maxDate}
                  rangeColors={["#2563eb"]}
                  showDateDisplay={false}
                  direction="vertical"
                  className="!p-2 !pt-1 !pb-1"
                  months={1}
                  moveRangeOnFirstSelection={false}
                />
                <div className="flex justify-between items-center p-2 border-t border-gray-200">
                  <button
                    onClick={() => setShowCalendar(false)}
                    className="flex items-center gap-1 text-gray-800 px-3 py-1 rounded hover:bg-gray-200"
                  >
                    <span>✖</span> Close
                  </button>
                  <button
                    onClick={() => {
                      setDateRange(format(range.startDate, 'yyyy-MM-dd'), format(range.endDate, 'yyyy-MM-dd'));
                      setShowCalendar(false);
                    }}
                    className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    <span>✔</span> Apply
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </nav>
  );
};

export default Navbar;
