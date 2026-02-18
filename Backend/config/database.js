import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rohit_db_user:rohit_db_user@cluster0.hkey2du.mongodb.net/'
const DB_NAME = process.env.DB_NAME || 'web3drender_db'

let client = null
let db = null

/**
 * Connect to MongoDB
 * @returns {Promise<Object>} Database instance
 */
export async function connectDB() {
  if (db) {
    return db
  }

  try {
    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: parseInt(process.env.DB_POOL_MAX) || 10,
      minPoolSize: parseInt(process.env.DB_POOL_MIN) || 2,
      serverSelectionTimeoutMS: 5000,
    })

    await client.connect()
    db = client.db(DB_NAME)
    
    console.log('✅ Connected to MongoDB database')
    console.log(`Database: ${DB_NAME}`)
    console.log(`URI: ${MONGODB_URI.split('@')[1] || 'Connected'}`)
    
    // Create indexes for better performance
    await createIndexes(db)
    
    return db
  } catch (err) {
    console.error('❌ Database connection error:', err.message)
    console.error('Please check:')
    console.error('1. MongoDB is running and accessible')
    console.error('2. MONGODB_URI in .env file is correct')
    console.error('3. Network connectivity to MongoDB')
    throw err
  }
}

/**
 * Create indexes for collections
 * @param {Object} database - MongoDB database instance
 */
async function createIndexes(database) {
  try {
    // Users collection indexes
    await database.collection('users').createIndex({ email: 1 }, { unique: true })
    
    // Projects collection indexes
    await database.collection('projects').createIndex({ user_id: 1 })
    await database.collection('projects').createIndex({ status: 1 })
    await database.collection('projects').createIndex({ created_at: -1 })
    
    // Models collection indexes
    await database.collection('models').createIndex({ user_id: 1 })
    await database.collection('models').createIndex({ project_id: 1 })
    await database.collection('models').createIndex({ file_type: 1 })
    await database.collection('models').createIndex({ created_at: -1 })
    
    // Annotations collection indexes
    await database.collection('annotations').createIndex({ model_id: 1 })
    await database.collection('annotations').createIndex({ user_id: 1 })
    await database.collection('annotations').createIndex({ created_at: -1 })
    
    // Annotation images collection indexes
    await database.collection('annotation_images').createIndex({ annotation_id: 1 })
    await database.collection('annotation_images').createIndex({ display_order: 1 })
    
    // Photogrammetry projects collection indexes
    await database.collection('photogrammetry_projects').createIndex({ model_id: 1 })
    await database.collection('photogrammetry_projects').createIndex({ user_id: 1 })
    
    // Volumetric videos collection indexes
    await database.collection('volumetric_videos').createIndex({ model_id: 1 })
    await database.collection('volumetric_videos').createIndex({ user_id: 1 })
    
    // Volumetric video frames collection indexes
    await database.collection('volumetric_video_frames').createIndex({ volumetric_video_id: 1, frame_number: 1 }, { unique: true })
    
    console.log('✅ Database indexes created')
  } catch (err) {
    console.error('⚠️ Error creating indexes:', err.message)
    // Don't throw - indexes might already exist
  }
}

/**
 * Get database instance (connects if not already connected)
 * @returns {Promise<Object>} Database instance
 */
export async function getDB() {
  if (!db) {
    await connectDB()
  }
  return db
}

/**
 * Close database connection
 */
export async function closeDB() {
  if (client) {
    await client.close()
    db = null
    client = null
    console.log('Database connection closed')
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  await closeDB()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await closeDB()
  process.exit(0)
})

// Initialize connection
connectDB().catch(console.error)

export default { connectDB, getDB, closeDB }
