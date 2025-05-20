import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function loadEventData() {
  try {
    // Read the new line-delimited JSON file
    const rawData = fs.readFileSync(path.join(process.cwd(), 'data/event_details.json'), 'utf-8')
    const events = rawData
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line))

    // Calculate min and max dates from all events
    const allDates = events.flatMap(event => 
      event.dates_and_times.map(dt => dt.date)
    ).filter(Boolean);

    const minDate = allDates.length > 0 ? allDates.reduce((min, date) => 
      date < min ? date : min
    ) : null;

    const maxDate = allDates.length > 0 ? allDates.reduce((max, date) =>
      date > max ? date : max  
    ) : null;

    console.log('Date range of events:');
    console.log(`Min date: ${minDate}`);
    console.log(`Max date: ${maxDate}`);

    // Update all dates to 2025
    events.forEach(event => {
        event.dates_and_times = event.dates_and_times.map(dt => {
          if (dt.date) {
            // Parse the date and set year to 2025 while preserving month and day
            const [year, month, day] = dt.date.split('-');
            dt.date = `2025-${month}-${day}`;
          }
          return dt;
        });
      });
  
    console.log('Updated all event dates to 2025');

    // Group events by venue
    const venueGroups = events.reduce((acc, event) => {
      if (!acc[event.venue]) {
        acc[event.venue] = {
          name: event.venue,
          url: event.url,
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

      // Sort venue events by date and time
      venueData.events.sort((a, b) => {
        // Compare dates first
        const aDate = a.dates_and_times[0]?.date || '';
        const bDate = b.dates_and_times[0]?.date || '';
        if (aDate !== bDate) {
          return aDate.localeCompare(bDate);
        }
        
        // If dates are equal, compare times
        const aTime = a.dates_and_times[0]?.time || '';
        const bTime = b.dates_and_times[0]?.time || '';
        return aTime.localeCompare(bTime);
      });

      // Process each event for the venue
      for (const eventData of venueData.events) {
        // Loop over each date/time entry
        for (const dt of eventData.dates_and_times) {
          if (!dt.time) continue; // Skip if time is null, undefined, or empty

          const dateString = dt.date
          const timeString = dt.time

          console.log(`Processing event: ${eventData.event_title} at ${venueName} on ${dateString}`);

          // Create or update the event
          const event = await prisma.event.upsert({
            where: { 
              name_dateString_timeString_venueId: {
                name: eventData.event_title,
                dateString: dateString,
                timeString: timeString,
                venueId: venue.id
              }
            },
            update: {
              name: eventData.event_title,
              url: eventData.url,
              logline: eventData.event_logline,
              dateString: dateString,
              timeString: timeString,
              venueId: venue.id,
            },
            create: {
              name: eventData.event_title,
              url: eventData.url,
              logline: eventData.event_logline,
              dateString: dateString,
              timeString: timeString,
              venueId: venue.id,
            },
          })

          // Process performers if they exist
          if (eventData.performers && eventData.performers.length > 0) {
            for (const performerData of eventData.performers) {
              // Convert instrument to lowercase, defaulting to 'unknown' if null
              performerData.instrument = (performerData.instrument || 'unknown').toLowerCase();
              // Create or update the performer
              const performer = await prisma.performer.upsert({
                where: {
                  name_instrument: {
                    name: performerData.name,
                    instrument: performerData.instrument
                  }
                },
                update: {
                  name: performerData.name,
                  instrument: performerData.instrument,
                },
                create: {
                  name: performerData.name,
                  instrument: performerData.instrument,
                },
              })

              // Create the EventPerformer relationship
              await prisma.eventPerformer.upsert({
                where: {
                  eventId_performerId: {
                    eventId: event.id,
                    performerId: performer.id
                  }
                },
                update: {},
                create: {
                  eventId: event.id,
                  performerId: performer.id,
                },
              })
            }
          }
        }
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

// Execute both functions in sequence
async function main() {
  await loadEventData()
}

main()