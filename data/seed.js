import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import * as dateFnsTz from 'date-fns-tz';

const prisma = new PrismaClient()

async function loadData() {
  try {
    // Read the JSON file
    const rawData = fs.readFileSync(path.join(process.cwd(), 'data/data.json'), 'utf-8')
    const events = JSON.parse(rawData)
    // console.log("Printing all events");
    // console.log(events);

    // Group events by venue
    const venueGroups = events.reduce((acc, event) => {
      if (!acc[event.venue]) {
        acc[event.venue] = {
          name: event.venue,
          url: event.events_url,
          events: []
        }
      }
      acc[event.venue].events.push(event)
      return acc
    }, {})

    // Process each venue and its events
    for (const [venueName, venueData] of Object.entries(venueGroups)) {
      // Create or update venue
      const venue = await prisma.venue.upsert({
        where: { name: venueName },
        update: {
          name: venueData.name,
          url: venueData.url,
        },
        create: {
          name: venueData.name,
          url: venueData.url,
        },
      })

      // Process each event for the venue
      for (const eventData of venueData.events) {

        // Parse date
        const year = new Date().getFullYear();
        const [month, day] = eventData.date.split('-');
        const dateString = `${year}-${month}-${day}`;

        // Handle optional time
        let timeString = eventData.time || '';

        console.log(`Processing event: ${eventData.event_name} on ${dateString}`);
        console.log('eventData', eventData);
        console.log('extracted date', dateString);
        console.log('extracted time', timeString);

        await prisma.event.upsert({
          where: { 
            name_dateString_timeString_venueId: {
              name: eventData.event_name,
              dateString: dateString,
              timeString: timeString,
              venueId: venue.id
            }
          },
          update: {
            name: eventData.event_name,
            url: eventData.event_url || eventData.events_url,
            dateString: dateString,
            timeString: timeString,
            venueId: venue.id,
          },
          create: {
            name: eventData.event_name,
            url: eventData.event_url || eventData.events_url,
            dateString: dateString,
            timeString: timeString,
            venueId: venue.id,
          },
        })
      }
    }

    console.log('Data import completed successfully')
  } catch (error) {
    console.error('Error importing data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

loadData()