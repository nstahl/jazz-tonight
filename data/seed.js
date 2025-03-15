import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function loadData() {
  try {
    // Read the JSON file
    const rawData = fs.readFileSync(path.join(process.cwd(), 'data/data.json'), 'utf-8')
    const events = JSON.parse(rawData)

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
        // Parse date and time
        const year = new Date().getFullYear()
        const [month, day] = eventData.date.split('-')
        const timeStr = eventData.time || '00:00'
        const dateTimeStr = `${year}-${month}-${day}T${timeStr}:00`
        const dateTime = new Date(dateTimeStr)

        // Create unique identifier for event
        const eventIdentifier = `${eventData.event_name}-${dateTimeStr}-${venue.id}`

        await prisma.event.upsert({
          where: { 
            name_dateTime_venueId: {
              name: eventData.event_name,
              dateTime: dateTime,
              venueId: venue.id
            }
          },
          update: {
            name: eventData.event_name,
            url: eventData.event_url || eventData.events_url,
            dateTime: dateTime,
            venueId: venue.id,
          },
          create: {
            name: eventData.event_name,
            url: eventData.event_url || eventData.events_url,
            dateTime: dateTime,
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