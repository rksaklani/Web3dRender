import { getDB } from '../config/database.js'
import { ObjectId } from 'mongodb'

/**
 * User Service - Business logic for user operations
 */
export const userService = {
  /**
   * Get user profile by ID
   * @param {string} userId - User ID (ObjectId string)
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async getProfile(userId) {
    const db = await getDB()
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } } // Exclude password
    )
    
    if (!user) return null
    
    // Convert _id to id for consistency
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      created_at: user.created_at
    }
  },

  /**
   * Update user profile
   * @param {string} userId - User ID (ObjectId string)
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated user or null if not found
   */
  async updateProfile(userId, updateData) {
    const db = await getDB()
    const { name, email } = updateData
    
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $set: {
          name,
          email,
          updated_at: new Date()
        }
      },
      { returnDocument: 'after', projection: { password: 0 } }
    )
    
    if (!result.value) return null
    
    return {
      id: result.value._id.toString(),
      name: result.value.name,
      email: result.value.email,
      created_at: result.value.created_at
    }
  },

  /**
   * Get user statistics
   * @param {string} userId - User ID (ObjectId string)
   * @returns {Promise<Object>} Statistics object
   */
  async getStats(userId) {
    const db = await getDB()
    const userIdObj = new ObjectId(userId)
    
    const [projectsCount, modelsStats] = await Promise.all([
      db.collection('projects').countDocuments({ user_id: userIdObj }),
      db.collection('models').aggregate([
        { $match: { user_id: userIdObj } },
        {
          $group: {
            _id: null,
            total_models: { $sum: 1 },
            total_size: { $sum: { $ifNull: ['$file_size', 0] } }
          }
        }
      ]).toArray()
    ])

    const stats = modelsStats[0] || { total_models: 0, total_size: 0 }

    return {
      totalProjects: projectsCount,
      totalModels: stats.total_models || 0,
      totalStorage: stats.total_size || 0,
    }
  }
}
