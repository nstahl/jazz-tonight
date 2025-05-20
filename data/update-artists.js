import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function loadArtistProfiles() {
  try {
    // Read the artist profiles file
    const rawData = fs.readFileSync(path.join(process.cwd(), 'data/artist_profiles.json'), 'utf-8')
    const profiles = rawData.split('\n')
      .filter(line => line.trim()) // Remove empty lines
      .map(line => JSON.parse(line))

    console.log(`Found ${profiles.length} artist profiles to process`);

    for (const profile of profiles) {
      console.log(`Processing artist profile: ${profile.artist_name}`);

      // Create or update artist profile
      const artist = await prisma.artistProfile.upsert({
        where: { name: profile.artist_name },
        update: {
          website: profile.website,
          instagram: profile.instagram,
          youtubeUrls: profile.youtube_search_results.map(result => result.watch_url),
          biography: profile.biography,
        },
        create: {
          name: profile.artist_name,
          website: profile.website,
          instagram: profile.instagram,
          youtubeUrls: profile.youtube_search_results.map(result => result.watch_url),
          biography: profile.biography,
        },
      })

      console.log(`Linking events for artist: ${profile.artist_name}`);

      // Find and link events that match the artist name
      const updateResult = await prisma.event.updateMany({
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

      console.log(`Linked ${updateResult.count} events to ${profile.artist_name}`);
    }

    console.log('Artist profiles import completed successfully')
  } catch (error) {
    console.error('Error importing artist profiles:', error)
    throw error
  }
}

// Execute both functions in sequence
async function main() {
  await loadArtistProfiles()
}

main()