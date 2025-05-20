import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function loadEventData() {
  try {
    // Read the new line-delimited JSON file
    const rawData = fs.readFileSync(path.join(process.cwd(), 'data/event_details.json'), 'utf-8')
    const eventDetailPages = rawData
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line))

    // Calculate min and max dates from all events
    const allDates = eventDetailPages.flatMap(event => 
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
    eventDetailPages.forEach(event => {
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

    // Group eventDetailPages by venue
    const venueGroups = eventDetailPages.reduce((acc, event) => {
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
    for (const [venueName, eventDetailPagesAtVenue] of Object.entries(venueGroups)) {
      console.log("*** Processing venue ***", venueName);
      // Create or update venue
      const venue = await prisma.venue.upsert({
        where: { name: venueName },
        update: {
          name: eventDetailPagesAtVenue.name,
          url: eventDetailPagesAtVenue.url,
        },
        create: {
          name: eventDetailPagesAtVenue.name,
          url: eventDetailPagesAtVenue.url,
        },
      })

      // Sort venue events by date and time
      eventDetailPagesAtVenue.events.sort((a, b) => {
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

      // Process each eventDetailPage for the venue
      for (const eventDetailPage of eventDetailPagesAtVenue.events) {
        // Skip events with null titles
        if (!eventDetailPage.event_title) {
          console.log(`Skipping event with null title at ${venueName}`);
          continue;
        }

        const date_to_times = {};
        for (const dts of eventDetailPage.dates_and_times) {
          if (!dts.date) {
            console.log(`Skipping event with missing date: ${eventDetailPage.event_title} at ${venueName}`);
            continue;
          }
          if (!date_to_times[dts.date]) {
            date_to_times[dts.date] = [];
          }
          if (dts.time) {
            date_to_times[dts.date].push(dts.time);
          }
        }

        const jazzEvents = [];

        for (const date in date_to_times) {
          const event = {
            event_title: eventDetailPage.event_title,
            event_logline: eventDetailPage.event_logline,
            dateString: date,
            setTimes: date_to_times[date],
            venueId: venue.id,
            url: eventDetailPage.url,
          }
          jazzEvents.push(event);
        }

        for (const jazzEvent of jazzEvents) {
          console.log(`Processing event: ${jazzEvent.event_title} at ${venueName} on ${jazzEvent.dateString}`);
          // Create or update the event
          const event = await prisma.event.upsert({
            where: { 
              name_dateString_venueId: {
                name: eventDetailPage.event_title,
                dateString: jazzEvent.dateString,
                venueId: venue.id
              }
            },
            update: {
              name: jazzEvent.event_title,
              url: jazzEvent.url,
              logline: jazzEvent.event_logline,
              dateString: jazzEvent.dateString,
              setTimes: jazzEvent.setTimes,
              venueId: venue.id,
            },
            create: {
              name: jazzEvent.event_title,
              url: jazzEvent.url,
              logline: jazzEvent.event_logline,
              dateString: jazzEvent.dateString,
              setTimes: jazzEvent.setTimes,
              venueId: venue.id,
            },
          });

          // Process performers if they exist
          if (eventDetailPage.performers && eventDetailPage.performers.length > 0) {
            for (const performerData of eventDetailPage.performers) {
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

export { loadEventData }