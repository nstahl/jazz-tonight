import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import * as dateFnsTz from 'date-fns-tz';

const prisma = new PrismaClient()

async function loadData() {
  try {
    // Read the new line-delimited JSON file
    const rawData = fs.readFileSync(path.join(process.cwd(), 'data/data.json'), 'utf-8')
    const events = rawData
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line))

    // Group events by venue
    const venueGroups = events.reduce((acc, event) => {
      if (!acc[event.venue]) {
        acc[event.venue] = {
          name: event.venue,
          url: event.url, // Use the first event's URL for the venue, or set to null
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
        // Loop over each date/time entry
        for (const dt of eventData.dates_and_times) {
          const dateString = dt.date
          const timeString = dt.time || ''

          console.log(`Processing event: ${eventData.event_title} on ${dateString}`);
          console.log('eventData', eventData);
          console.log('extracted date', dateString);
          console.log('extracted time', timeString);

          await prisma.event.upsert({
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
              dateString: dateString,
              timeString: timeString,
              venueId: venue.id,
            },
            create: {
              name: eventData.event_title,
              url: eventData.url,
              dateString: dateString,
              timeString: timeString,
              venueId: venue.id,
            },
          })
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

async function loadArtistProfiles() {
  try {
    // Read the artist profiles file
    const rawData = fs.readFileSync(path.join(process.cwd(), 'data/artist_profiles.json'), 'utf-8')
    const profiles = rawData.split('\n')
      .filter(line => line.trim()) // Remove empty lines
      .map(line => JSON.parse(line))

    for (const profile of profiles) {
      // Create or update artist profile
      const artist = await prisma.artistProfile.upsert({
        where: { name: profile.artist_name },
        update: {
          website: profile.website,
          instagram: profile.instagram,
          youtubeUrls: profile.youtube_urls,
          biography: profile.biography,
        },
        create: {
          name: profile.artist_name,
          website: profile.website,
          instagram: profile.instagram,
          youtubeUrls: profile.youtube_urls,
          biography: profile.biography,
        },
      })

      // Find and link events that match the artist name
      await prisma.event.updateMany({
        where: {
          name: {
            contains: profile.artist_name,
            mode: 'insensitive' // Case-insensitive matching
          }
        },
        data: {
          artistId: artist.id
        }
      })
    }

    console.log('Artist profiles import completed successfully')
  } catch (error) {
    console.error('Error importing artist profiles:', error)
    throw error
  }
}

// Execute both functions in sequence
async function main() {
  await loadData()
  await loadArtistProfiles()
}

main()