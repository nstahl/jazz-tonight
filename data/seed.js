import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Import the functions from the update scripts
import { loadEventData } from './update-events.js'
import { loadArtistProfiles } from './update-artists.js'

// Execute both functions in sequence
async function main() {
  await loadEventData()
  await loadArtistProfiles()
}

main()