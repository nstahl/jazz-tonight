'use client';

import React, { createContext, useContext, useState } from 'react';

interface DateRangeContextType {
  startDate: string;
  endDate: string;
  setDateRange: (startDate: string, endDate: string) => void;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export function DateRangeProvider({ children }: { children: React.ReactNode }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
  if (context === undefined) {
    throw new Error('useDateRange must be used within a DateRangeProvider');
  }
  return context;
} 