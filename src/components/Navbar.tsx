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
  const [selectedField, setSelectedField] = useState<'start' | 'end' | null>(null);
  const [range, setRange] = useState({
    startDate: today,
    endDate: maxDate,
    key: 'selection',
  });

  const pickerRef = useRef<HTMLDivElement>(null);

  const formatDisplay = (date: Date) => format(date, 'MMM d');

  useEffect(() => {
    if (!showCalendar) {
      console.log("Calendar closed, updating date range");
      console.log("range", range);
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
      container
      px-4 
      mx-auto 
      flex 
      md:justify-center 
      items-center 
      h-full">
        <Link href="/" className="absolute left-4 flex items-center space-x-2 cursor-pointer lg:px-5">
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
          <div className="md:flex md:relative absolute right-2 flex flex-col md:flex-row items-center justify-center 
          bg-zinc-900 border border-zinc-700 rounded-2xl px-4 shadow-lg gap-1 mx-2 max-w-[340px] w-auto">
            <div className="flex items-center gap-0 cursor-pointer select-none">
              <div 
                className="flex flex-col items-start px-1 py-2 w-[60px]"
                onClick={() => {
                  setSelectedField('start');
                  setShowCalendar(true);
                }}
              >
                <span className="text-zinc-400 text-xs font-semibold">From</span>
                <span className="text-white text-base font-medium leading-tight">{formatDisplay(range.startDate)}</span>
              </div>
              <div className="h-7 border-l border-zinc-700 mx-1" />
              <div 
                className="flex flex-col items-start px-1 py-2 w-[60px]"
                onClick={() => {
                  setSelectedField('end');
                  setShowCalendar(true);
                }}
              >
                <span className="text-zinc-400 text-xs font-semibold">To</span>
                <span className="text-white text-base font-medium leading-tight">{formatDisplay(range.endDate)}</span>
              </div>
            </div>
            {showCalendar && (
              <div
                ref={pickerRef}
                className="fixed md:absolute top-20 md:top-12 left-1/2 -translate-x-1/2 z-40 bg-white rounded-md w-[90vw] max-w-sm shadow-2xl transition-all duration-300 ease-out transform scale-95 opacity-0 animate-fadeIn"
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
          </div>
        )}
        <div className="absolute right-4 hidden md:block lg:right-4 space-x-8 flex items-center">
          <Link href="/about" className="hover:text-gray-300 lg:px-5">
            About
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
