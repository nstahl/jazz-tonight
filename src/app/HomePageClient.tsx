'use client';

import HomeClient from './HomeClient';
import { useDateRange } from '@/context/DateRangeContext';

export default function HomePageClient() {
  const { startDate, endDate } = useDateRange();

  return (
    <main>
      <HomeClient startDate={startDate} endDate={endDate} />
    </main>
  );
}