'use client';

import React, { createContext, useContext, useState } from 'react';
import { toZonedTime } from 'date-fns-tz';
import { addDays, format } from 'date-fns';
import { EVENT_CONFIG } from '@/config/constants';

interface DateRangeContextType {
  startDate: string;
  endDate: string;
  setDateRange: (startDate: string, endDate: string) => void;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export function DateRangeProvider({ children }: { children: React.ReactNode }) {
  // Calculate default dates using NYC timezone
  const nycTime = toZonedTime(new Date(), 'America/New_York');
  const defaultStartDate = format(nycTime, 'yyyy-MM-dd');
  const defaultEndDate = format(addDays(nycTime, EVENT_CONFIG.DAYS_AHEAD), 'yyyy-MM-dd');

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  const setDateRange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  return (
    <DateRangeContext.Provider value={{ startDate, endDate, setDateRange }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const context = useContext(DateRangeContext);
  console.log("useDateRange context", context);
  if (context === undefined) {
    throw new Error('useDateRange must be used within a DateRangeProvider');
  }
  return context;
} 