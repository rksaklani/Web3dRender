import { getDB } from '../config/database.js'
import { ObjectId } from 'mongodb'
import { getCache, setCache, clearCache } from '../utils/queryCache.js'

/**
 * Project Service - Business logic for project operations
 */
export const projectService = {
  /**
   * Get all projects for a user (with caching and pagination)
   * @param {string} userId - User ID (ObjectId string)
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 50, max: 100)
   * @param {boolean} options.useCache - Whether to use cache (default: true)
   * @returns {Promise<Object>} Object with projects array, pagination info
   */
  async getByUserId(userId, options = {}) {
    const { page = 1, limit = 50, useCache = true } = options
    const safeLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 100)
    const safePage = Math.max(parseInt(page) || 1, 1)
    const skip = (safePage - 1) * safeLimit
    
    const cacheKey = `projects:user:${userId}:page:${safePage}:limit:${safeLimit}`
    
    // Check cache first
    if (useCache) {
      const cached = getCache(cacheKey)
      if (cached) return cached
    }
    
    const db = await getDB()
    const userIdObj = new ObjectId(userId)
    
    // Get total count and paginated results
    const [total, projects] = await Promise.all([
      db.collection('projects').countDocuments({ user_id: userIdObj }),
      db.collection('projects')
        .find({ user_id: userIdObj })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(safeLimit)
        .toArray()
    ])
    
    const totalPages = Math.ceil(total / safeLimit)
    
    // Convert _id to id for consistency
    const projectsList = projects.map(project => ({
      id: project._id.toString(),
      name: project.name,
      description: project.description,
      status: project.status,
      user_id: project.user_id.toString(),
      created_at: project.created_at,
      updated_at: project.updated_at
    }))
    
    const result = {
      projects: projectsList,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages,
        hasNext: safePage < totalPages,
        hasPrev: safePage > 1
      }
    }
    
    // Cache the result
    if (useCache) {
      setCache(cacheKey, result, 2 * 60 * 1000) // 2 minutes cache
    }
    
    return result
  },

  /**
   * Get a single project by ID
   * @param {string} id - Project ID (ObjectId string)
   * @param {string} userId - User ID (ObjectId string)
   * @returns {Promise<Object|null>} Project object or null if not found
   */
  async getById(id, userId) {
    const db = await getDB()
    const project = await db.collection('projects').findOne({
      _id: new ObjectId(id),
      user_id: new ObjectId(userId)
    })
    
    if (!project) return null
    
    return {
      id: project._id.toString(),
      name: project.name,
      description: project.description,
      status: project.status,
      user_id: project.user_id.toString(),
      created_at: project.created_at,
      updated_at: project.updated_at
    }
  },

  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @returns {Promise<Object>} Created project
   */
  async create(projectData) {
    const { name, description, user_id } = projectData
    
    const db = await getDB()
    const now = new Date()
    
    const project = {
      name,
      description: description || null,
      status: 'active',
      user_id: new ObjectId(user_id),
      created_at: now,
      updated_at: now
    }
    
    const result = await db.collection('projects').insertOne(project)
    
    // Clear cache for this user's projects (all pages)
    clearCache(`projects:user:${user_id}*`)
    
    return {
      id: result.insertedId.toString(),
      ...project,
      user_id: project.user_id.toString()
    }
  },

  /**
   * Update a project
   * @param {string} id - Project ID (ObjectId string)
   * @param {string} userId - User ID (ObjectId string)
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated project or null if not found
   */
  async update(id, userId, updateData) {
    const { name, description, status } = updateData
    
    const db = await getDB()
    const result = await db.collection('projects').findOneAndUpdate(
      { _id: new ObjectId(id), user_id: new ObjectId(userId) },
      {
        $set: {
          name,
          description,
          status,
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    )
    
    // Clear cache for this user's projects (all pages)
    if (result.value) {
      clearCache(`projects:user:${userId}*`)
      
      return {
        id: result.value._id.toString(),
        name: result.value.name,
        description: result.value.description,
        status: result.value.status,
        user_id: result.value.user_id.toString(),
        created_at: result.value.created_at,
        updated_at: result.value.updated_at
      }
    }
    
    return null
  },

  /**
   * Delete a project
   * @param {string} id - Project ID (ObjectId string)
   * @param {string} userId - User ID (ObjectId string)
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id, userId) {
    const db = await getDB()
    const result = await db.collection('projects').deleteOne({
      _id: new ObjectId(id),
      user_id: new ObjectId(userId)
    })
    
    // Clear cache for this user's projects (all pages)
    if (result.deletedCount > 0) {
      clearCache(`projects:user:${userId}*`)
    }
    
    return result.deletedCount > 0
  },

  /**
   * Verify project belongs to user
   * @param {string} projectId - Project ID (ObjectId string)
   * @param {string} userId - User ID (ObjectId string)
   * @returns {Promise<boolean>} True if project belongs to user
   */
  async verifyOwnership(projectId, userId) {
    const db = await getDB()
    const count = await db.collection('projects').countDocuments({
      _id: new ObjectId(projectId),
      user_id: new ObjectId(userId)
    })
    return count > 0
  }
}
