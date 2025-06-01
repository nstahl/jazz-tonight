'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { EVENT_CONFIG } from '@/config/constants';
import { useState } from 'react';
import { useDateRange } from '@/context/DateRangeContext';

const Navbar = () => {
  const pathname = usePathname();
  const { setDateRange } = useDateRange();
  
  // Calculate default and max date range
  const today = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const toDateInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const minDate = toDateInput(today);
  const maxDate = toDateInput(new Date(today.getTime() + EVENT_CONFIG.DAYS_AHEAD * 24 * 60 * 60 * 1000));
  const [startDate, setStartDate] = useState(minDate);
  const [endDate, setEndDate] = useState(maxDate);

  // Call setDateRange when dates change
  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    setDateRange(newStartDate, newEndDate);
  };

  return (
    <nav className="bg-black text-white py-10 relative"
      style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.5)'
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-4 lg:px-4 container mx-auto flex justify-center items-center">
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
          <div className="flex flex-col md:flex-row items-center justify-center bg-zinc-900 border border-zinc-700 rounded-full px-6 py-3 shadow-lg gap-4 md:gap-2 mx-8 min-w-[320px] max-w-[500px] w-full md:w-auto">
            <div className="flex flex-col md:flex-row items-center gap-2">
              <label className="text-zinc-300 text-xs font-semibold mr-2">From</label>
              <input
                type="date"
                className="bg-zinc-800 text-white rounded-md px-2 py-1 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={minDate}
                max={endDate}
                value={startDate}
                onChange={e => {
                  const newStartDate = e.target.value;
                  handleDateChange(newStartDate, newStartDate > endDate ? newStartDate : endDate);
                }}
              />
              <span className="mx-2 text-zinc-400">-</span>
              <label className="text-zinc-300 text-xs font-semibold mr-2">To</label>
              <input
                type="date"
                className="bg-zinc-800 text-white rounded-md px-2 py-1 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={startDate}
                max={maxDate}
                value={endDate}
                onChange={e => handleDateChange(startDate, e.target.value)}
              />
            </div>
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