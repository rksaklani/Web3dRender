import { getDB } from '../config/database.js'
import { ObjectId } from 'mongodb'
import { getCache, setCache, clearCache } from '../utils/queryCache.js'

/**
 * Model Service - Business logic for model operations
 * Separates business logic from route handlers
 */
export const modelService = {
  /**
   * Get all models for a user (with caching and pagination)
   * @param {string} userId - User ID (ObjectId string)
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 50, max: 100)
   * @param {boolean} options.useCache - Whether to use cache (default: true)
   * @returns {Promise<Object>} Object with models array, pagination info
   */
  async getByUserId(userId, options = {}) {
    const { page = 1, limit = 50, useCache = true } = options
    const safeLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 100)
    const safePage = Math.max(parseInt(page) || 1, 1)
    const skip = (safePage - 1) * safeLimit
    
    const cacheKey = `models:user:${userId}:page:${safePage}:limit:${safeLimit}`
    
    // Check cache first
    if (useCache) {
      const cached = getCache(cacheKey)
      if (cached) return cached
    }
    
    const db = await getDB()
    const userIdObj = new ObjectId(userId)
    
    // Get total count and paginated results with project lookup
    const [total, models] = await Promise.all([
      db.collection('models').countDocuments({ user_id: userIdObj }),
      db.collection('models')
        .aggregate([
          { $match: { user_id: userIdObj } },
          {
            $lookup: {
              from: 'projects',
              localField: 'project_id',
              foreignField: '_id',
              as: 'project'
            }
          },
          {
            $unwind: {
              path: '$project',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $project: {
              _id: 1,
              name: 1,
              description: 1,
              file_path: 1,
              file_size: 1,
              file_type: 1,
              project_id: 1,
              user_id: 1,
              crs: 1,
              origin_lat: 1,
              origin_lon: 1,
              origin_altitude: 1,
              transform_matrix: 1,
              model_type: 1,
              metadata: 1,
              created_at: 1,
              updated_at: 1,
              project_name: '$project.name'
            }
          },
          { $sort: { created_at: -1 } },
          { $skip: skip },
          { $limit: safeLimit }
        ])
        .toArray()
    ])
    
    const totalPages = Math.ceil(total / safeLimit)
    
    // Convert _id to id and handle ObjectIds
    const modelsList = models.map(model => ({
      id: model._id.toString(),
      name: model.name,
      description: model.description,
      file_path: model.file_path,
      file_size: model.file_size,
      file_type: model.file_type,
      project_id: model.project_id ? model.project_id.toString() : null,
      user_id: model.user_id.toString(),
      project_name: model.project_name || null,
      crs: model.crs,
      origin_lat: model.origin_lat,
      origin_lon: model.origin_lon,
      origin_altitude: model.origin_altitude,
      transform_matrix: model.transform_matrix,
      model_type: model.model_type,
      metadata: model.metadata,
      created_at: model.created_at,
      updated_at: model.updated_at
    }))
    
    const result = {
      models: modelsList,
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
   * Get a single model by ID
   * @param {string} id - Model ID (ObjectId string)
   * @param {string} userId - User ID (ObjectId string)
   * @returns {Promise<Object|null>} Model object or null if not found
   */
  async getById(id, userId) {
    const db = await getDB()
    const model = await db.collection('models')
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id),
            user_id: new ObjectId(userId)
          }
        },
        {
          $lookup: {
            from: 'projects',
            localField: 'project_id',
            foreignField: '_id',
            as: 'project'
          }
        },
        {
          $unwind: {
            path: '$project',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            file_path: 1,
            file_size: 1,
            file_type: 1,
            project_id: 1,
            user_id: 1,
            crs: 1,
            origin_lat: 1,
            origin_lon: 1,
            origin_altitude: 1,
            transform_matrix: 1,
            model_type: 1,
            metadata: 1,
            created_at: 1,
            updated_at: 1,
            project_name: '$project.name'
          }
        }
      ])
      .toArray()
    
    if (model.length === 0) {
      return null
    }
    
    const m = model[0]
    return {
      id: m._id.toString(),
      name: m.name,
      description: m.description,
      file_path: m.file_path,
      file_size: m.file_size,
      file_type: m.file_type,
      project_id: m.project_id ? m.project_id.toString() : null,
      user_id: m.user_id.toString(),
      project_name: m.project_name || null,
      crs: m.crs,
      origin_lat: m.origin_lat,
      origin_lon: m.origin_lon,
      origin_altitude: m.origin_altitude,
      transform_matrix: m.transform_matrix,
      model_type: m.model_type,
      metadata: m.metadata,
      created_at: m.created_at,
      updated_at: m.updated_at
    }
  },

  /**
   * Create a new model
   * @param {Object} modelData - Model data
   * @returns {Promise<Object>} Created model
   */
  async create(modelData) {
    const { 
      name, description, file_path, file_size, file_type, project_id, user_id,
      crs, origin_lat, origin_lon, origin_altitude, transform_matrix, model_type, metadata
    } = modelData
    
    const db = await getDB()
    const now = new Date()
    
    const model = {
      name,
      description: description || null,
      file_path,
      file_size: file_size || null,
      file_type,
      project_id: project_id ? new ObjectId(project_id) : null,
      user_id: new ObjectId(user_id),
      crs: crs || null,
      origin_lat: origin_lat || null,
      origin_lon: origin_lon || null,
      origin_altitude: origin_altitude || null,
      transform_matrix: transform_matrix || null,
      model_type: model_type || 'static',
      metadata: metadata || null,
      created_at: now,
      updated_at: now
    }
    
    const result = await db.collection('models').insertOne(model)
    
    // Clear cache for this user's models (all pages)
    clearCache(`models:user:${user_id}*`)
    
    return {
      id: result.insertedId.toString(),
      ...model,
      project_id: model.project_id ? model.project_id.toString() : null,
      user_id: model.user_id.toString()
    }
  },

  /**
   * Update a model
   * @param {string} id - Model ID (ObjectId string)
   * @param {string} userId - User ID (ObjectId string)
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated model or null if not found
   */
  async update(id, userId, updateData) {
    const { name, description, project_id } = updateData
    
    const db = await getDB()
    const updateFields = {
      name,
      description,
      updated_at: new Date()
    }
    
    if (project_id !== undefined) {
      updateFields.project_id = project_id ? new ObjectId(project_id) : null
    }
    
    const result = await db.collection('models').findOneAndUpdate(
      { _id: new ObjectId(id), user_id: new ObjectId(userId) },
      { $set: updateFields },
      { returnDocument: 'after' }
    )
    
    // Clear cache for this user's models (all pages)
    if (result.value) {
      clearCache(`models:user:${userId}*`)
      
      return {
        id: result.value._id.toString(),
        ...result.value,
        project_id: result.value.project_id ? result.value.project_id.toString() : null,
        user_id: result.value.user_id.toString()
      }
    }
    
    return null
  },

  /**
   * Delete a model
   * @param {string} id - Model ID (ObjectId string)
   * @param {string} userId - User ID (ObjectId string)
   * @returns {Promise<Object|null>} Deleted model info or null if not found
   */
  async delete(id, userId) {
    const db = await getDB()
    const model = await db.collection('models').findOne({
      _id: new ObjectId(id),
      user_id: new ObjectId(userId)
    })
    
    if (!model) return null
    
    const result = await db.collection('models').deleteOne({
      _id: new ObjectId(id),
      user_id: new ObjectId(userId)
    })
    
    // Clear cache for this user's models (all pages)
    if (result.deletedCount > 0) {
      clearCache(`models:user:${userId}*`)
      return {
        id: model._id.toString(),
        file_path: model.file_path
      }
    }
    
    return null
  },

  /**
   * Verify model belongs to user
   * @param {string} modelId - Model ID (ObjectId string)
   * @param {string} userId - User ID (ObjectId string)
   * @returns {Promise<boolean>} True if model belongs to user
   */
  async verifyOwnership(modelId, userId) {
    const db = await getDB()
    const count = await db.collection('models').countDocuments({
      _id: new ObjectId(modelId),
      user_id: new ObjectId(userId)
    })
    return count > 0
  },

  /**
   * Get model statistics for a user
   * @param {string} userId - User ID (ObjectId string)
   * @returns {Promise<Object>} Statistics object
   */
  async getStats(userId) {
    const db = await getDB()
    const stats = await db.collection('models').aggregate([
      { $match: { user_id: new ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total_models: { $sum: 1 },
          total_size: { $sum: { $ifNull: ['$file_size', 0] } },
          unique_types: { $addToSet: '$file_type' }
        }
      },
      {
        $project: {
          total_models: 1,
          total_size: 1,
          unique_types: { $size: '$unique_types' }
        }
      }
    ]).toArray()
    
    return stats[0] || { total_models: 0, total_size: 0, unique_types: 0 }
  }
}
