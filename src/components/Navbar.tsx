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
  
  // Calculate default and max date range
  const today = new Date();
  const minDate = today;
  const maxDate = addDays(today, EVENT_CONFIG.DAYS_AHEAD);

  // Convert context date strings to Date objects for picker
  const [showCalendar, setShowCalendar] = useState(false);
  const [range, setRange] = useState({
    startDate: today,
    endDate: maxDate,
    key: 'selection',
  });

  // Update context and local state on date selection
  const handleSelect = (ranges: any) => {
    const { startDate, endDate } = ranges.selection;
    setRange({ ...range, startDate, endDate });
    setDateRange(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'));
  };

  // Format for display (e.g., Jun 4)
  const formatDisplay = (date: Date) => format(date, 'MMM d');

  // Click outside to close calendar
  const pickerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    }
    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

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
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-4 lg:px-4 container mx-auto flex justify-center items-center h-full">
        <Link href="/" className="absolute left-4 sm:left-4 lg:left-4 flex items-center space-x-2 cursor-pointer">
          <div>
            <Image
              src="/atrium.svg"
              alt="Atrium Jazz Logo"
              width={500}
              height={100}
              priority
              className="h-8 w-auto hover:opacity-80 px-15"
            />
          </div>
        </Link>
        {/* Center filter only on home page */}
        {pathname === '/' && (
          <div className="relative flex flex-col md:flex-row items-center justify-center bg-zinc-900 border border-zinc-700 rounded-2xl px-4 shadow-lg gap-1 mx-8 max-w-[340px] w-auto">
            <div
              className="flex items-center gap-0 cursor-pointer select-none"
              onClick={() => setShowCalendar((v) => !v)}
            >
              <div className="flex flex-col items-start px-1 py-2">
                <span className="text-zinc-400 text-xs font-semibold">From</span>
                <span className="text-white text-base font-medium leading-tight">{formatDisplay(range.startDate)}</span>
              </div>
              <div className="h-7 border-l border-zinc-700 mx-1" />
              <div className="flex flex-col items-start px-1 py-2">
                <span className="text-zinc-400 text-xs font-semibold">To</span>
                <span className="text-white text-base font-medium leading-tight">{formatDisplay(range.endDate)}</span>
              </div>
            </div>
            {showCalendar && (
              <div ref={pickerRef} className="absolute top-12 left-1/2 -translate-x-1/2 z-50 shadow-2xl">
                <DateRange
                  ranges={[range]}
                  onChange={handleSelect}
                  minDate={minDate}
                  maxDate={maxDate}
                  rangeColors={["#2563eb"]}
                  showDateDisplay={false}
                  moveRangeOnFirstSelection={false}
                  direction="horizontal"
                  className="!p-2 !pt-1 !pb-1"
                />
              </div>
            )}
          </div>
        )}
        <div className="absolute right-4 sm:right-4 lg:right-4 space-x-8 flex items-center">
          <Link href="/about" className="hover:text-gray-300 px-5">
            About
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 