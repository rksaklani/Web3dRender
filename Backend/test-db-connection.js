import { connectDB, getDB } from './config/database.js'

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...')
    console.log('Config:', {
      uri: process.env.MONGODB_URI ? process.env.MONGODB_URI.split('@')[1] || 'Connected' : 'Not set',
      database: process.env.DB_NAME || 'web3drender_db',
    })

    const db = await connectDB()
    console.log('✅ Successfully connected to MongoDB!')

    // Test if collections exist
    const collections = await db.listCollections().toArray()

    console.log('\n📊 Existing collections:')
    if (collections.length === 0) {
      console.log('⚠️  No collections found! Collections will be created automatically on first use.')
    } else {
      collections.forEach(col => {
        console.log(`  - ${col.name}`)
      })
    }

    // Check if users collection exists and get count
    if (collections.some(col => col.name === 'users')) {
      const userCount = await db.collection('users').countDocuments()
      console.log(`\n👤 Users collection: ${userCount} document(s)`)
      
      // Get sample user structure if exists
      const sampleUser = await db.collection('users').findOne({}, { projection: { password: 0 } })
      if (sampleUser) {
        console.log('\n📋 Sample user structure:')
        Object.keys(sampleUser).forEach(key => {
          const value = sampleUser[key]
          const type = value instanceof Date ? 'Date' : Array.isArray(value) ? 'Array' : typeof value
          console.log(`  - ${key}: ${type}`)
        })
      }
    }

    console.log('\n✅ Database connection test completed!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Database connection failed!')
    console.error('Error:', error.message)
    console.error('\nTroubleshooting:')
    console.error('1. Is MongoDB accessible?')
    console.error('2. Check your MONGODB_URI in .env file')
    console.error('3. Verify network connectivity to MongoDB')
    console.error('4. Check if MongoDB credentials are correct')
    process.exit(1)
  }
}

testConnection()
