import { getDB } from './config/database.js'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

async function testAuth() {
  try {
    console.log('Testing authentication setup...\n')
    
    const db = await getDB()
    
    // Check if users collection exists and has data
    const userCount = await db.collection('users').countDocuments()
    console.log(`📊 Total users in database: ${userCount}`)
    
    if (userCount > 0) {
      console.log('\n👤 Existing users:')
      const users = await db.collection('users').find({}, { projection: { password: 0 } }).limit(5).toArray()
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (ID: ${user._id})`)
      })
    }
    
    // Test password hashing
    console.log('\n🔐 Testing password hashing...')
    const testPassword = 'Test1234@'
    const hashedPassword = await bcrypt.hash(testPassword, 10)
    console.log(`  Original: ${testPassword}`)
    console.log(`  Hashed: ${hashedPassword.substring(0, 30)}...`)
    
    const isMatch = await bcrypt.compare(testPassword, hashedPassword)
    console.log(`  Verification: ${isMatch ? '✅ Match' : '❌ No match'}`)
    
    // Check JWT_SECRET
    console.log('\n🔑 JWT Configuration:')
    console.log(`  JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Not set'}`)
    console.log(`  JWT_EXPIRE: ${process.env.JWT_EXPIRE || '7d (default)'}`)
    
    console.log('\n✅ Authentication setup test completed!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    process.exit(1)
  }
}

testAuth()
