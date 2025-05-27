import { prisma } from '@/lib/prisma';
import VenuesTable from './VenuesTable';

export default async function VenuesPage() {
  const venues = await prisma.venue.findMany({
    include: {
      _count: {
        select: {
          events: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Venues</h1>
      <VenuesTable venues={venues} />
    </div>
  );
} 