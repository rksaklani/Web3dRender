import { connectDB } from '../config/database.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * MongoDB Migration Script
 * Note: MongoDB creates collections automatically on first insert.
 * This script verifies the connection and ensures indexes are created.
 */
const verifyConnection = async () => {
  try {
    console.log('Verifying MongoDB connection...')
    const db = await connectDB()
    
    // Test connection by listing collections
    await db.listCollections().toArray()
    console.log('✅ MongoDB connection verified')
    
    // Indexes are created automatically in database.js
    // Collections will be created automatically on first document insert
    
    return true
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error)
    throw error
  }
}

const createUploadsDir = () => {
  const uploadsDir = join(__dirname, '../uploads')
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
    console.log('✅ Uploads directory created')
  } else {
    console.log('✅ Uploads directory already exists')
  }
}

const runMigration = async () => {
  try {
    console.log('Starting MongoDB setup...')
    console.log('Note: MongoDB collections are created automatically on first use.')
    console.log('Indexes are created automatically in database.js\n')
    
    await verifyConnection()
    createUploadsDir()
    
    console.log('\n✅ Setup completed successfully')
    console.log('Collections will be created automatically when you:')
    console.log('  - Register a user (creates users collection)')
    console.log('  - Create a project (creates projects collection)')
    console.log('  - Upload a model (creates models collection)')
    console.log('  - Create an annotation (creates annotations collection)')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

runMigration()
