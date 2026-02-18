import { getDB } from '../config/database.js'
import { ObjectId } from 'mongodb'
import { getCache, setCache, clearCache } from '../utils/queryCache.js'

/**
 * Annotation Service - Business logic for annotation operations
 */
export const annotationService = {
  /**
   * Get all annotations for a model (with caching)
   * @param {string} modelId - Model ID (ObjectId string)
   * @param {boolean} useCache - Whether to use cache (default: true)
   * @returns {Promise<Array>} Array of annotations with images
   */
  async getByModelId(modelId, useCache = true) {
    const cacheKey = `annotations:model:${modelId}`
    
    // Check cache first
    if (useCache) {
      const cached = getCache(cacheKey)
      if (cached) return cached
    }
    
    const db = await getDB()
    const modelIdObj = new ObjectId(modelId)
    
    const annotations = await db.collection('annotations')
      .aggregate([
        { $match: { model_id: modelIdObj } },
        {
          $lookup: {
            from: 'annotation_images',
            localField: '_id',
            foreignField: 'annotation_id',
            as: 'images'
          }
        },
        {
          $addFields: {
            images: {
              $map: {
                input: { $sortArray: { input: '$images', sortBy: { display_order: 1 } } },
                as: 'img',
                in: {
                  id: { $toString: '$$img._id' },
                  image_path: '$$img.image_path',
                  image_name: '$$img.image_name',
                  image_identifier: '$$img.image_identifier',
                  thumbnail_path: '$$img.thumbnail_path',
                  camera_position_x: '$$img.camera_position_x',
                  camera_position_y: '$$img.camera_position_y',
                  camera_position_z: '$$img.camera_position_z',
                  display_order: '$$img.display_order'
                }
              }
            },
            image_count: { $size: '$images' }
          }
        },
        { $sort: { created_at: -1 } }
      ])
      .toArray()

    // Convert _id to id and handle ObjectIds
    const result = annotations.map(ann => ({
      id: ann._id.toString(),
      model_id: ann.model_id.toString(),
      user_id: ann.user_id.toString(),
      title: ann.title,
      description: ann.description,
      position_x: ann.position_x,
      position_y: ann.position_y,
      position_z: ann.position_z,
      normal_x: ann.normal_x,
      normal_y: ann.normal_y,
      normal_z: ann.normal_z,
      color: ann.color,
      annotation_type: ann.annotation_type,
      measurement_value: ann.measurement_value,
      measurement_unit: ann.measurement_unit,
      priority: ann.priority,
      status: ann.status,
      latitude: ann.latitude,
      longitude: ann.longitude,
      altitude: ann.altitude,
      georeferenced: ann.georeferenced,
      created_at: ann.created_at,
      updated_at: ann.updated_at,
      image_count: ann.image_count || 0,
      images: ann.images || []
    }))
    
    // Cache the result
    if (useCache) {
      setCache(cacheKey, result, 3 * 60 * 1000) // 3 minutes cache
    }
    
    return result
  },

  /**
   * Get a single annotation by ID
   * @param {string} id - Annotation ID (ObjectId string)
   * @param {string} userId - User ID (ObjectId string)
   * @returns {Promise<Object|null>} Annotation object or null if not found
   */
  async getById(id, userId) {
    const db = await getDB()
    const annotation = await db.collection('annotations')
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id),
            user_id: new ObjectId(userId)
          }
        },
        {
          $lookup: {
            from: 'annotation_images',
            localField: '_id',
            foreignField: 'annotation_id',
            as: 'images'
          }
        },
        {
          $addFields: {
            images: {
              $map: {
                input: { $sortArray: { input: '$images', sortBy: { display_order: 1 } } },
                as: 'img',
                in: {
                  id: { $toString: '$$img._id' },
                  image_path: '$$img.image_path',
                  image_name: '$$img.image_name',
                  image_identifier: '$$img.image_identifier',
                  thumbnail_path: '$$img.thumbnail_path',
                  camera_position_x: '$$img.camera_position_x',
                  camera_position_y: '$$img.camera_position_y',
                  camera_position_z: '$$img.camera_position_z',
                  display_order: '$$img.display_order'
                }
              }
            }
          }
        }
      ])
      .toArray()

    if (annotation.length === 0) {
      return null
    }

    const ann = annotation[0]
    return {
      id: ann._id.toString(),
      model_id: ann.model_id.toString(),
      user_id: ann.user_id.toString(),
      title: ann.title,
      description: ann.description,
      position_x: ann.position_x,
      position_y: ann.position_y,
      position_z: ann.position_z,
      normal_x: ann.normal_x,
      normal_y: ann.normal_y,
      normal_z: ann.normal_z,
      color: ann.color,
      annotation_type: ann.annotation_type,
      measurement_value: ann.measurement_value,
      measurement_unit: ann.measurement_unit,
      priority: ann.priority,
      status: ann.status,
      latitude: ann.latitude,
      longitude: ann.longitude,
      altitude: ann.altitude,
      georeferenced: ann.georeferenced,
      created_at: ann.created_at,
      updated_at: ann.updated_at,
      images: ann.images || []
    }
  },

  /**
   * Create a new annotation
   * @param {Object} annotationData - Annotation data
   * @returns {Promise<Object>} Created annotation
   */
  async create(annotationData) {
    const {
      model_id,
      user_id,
      title,
      description,
      position_x,
      position_y,
      position_z,
      normal_x,
      normal_y,
      normal_z,
      color,
      annotation_type,
      measurement_value,
      measurement_unit,
      priority,
      latitude,
      longitude,
      altitude,
      georeferenced
    } = annotationData

    const db = await getDB()
    const now = new Date()

    const annotation = {
      model_id: new ObjectId(model_id),
      user_id: new ObjectId(user_id),
      title: title || null,
      description: description || null,
      position_x,
      position_y,
      position_z,
      normal_x: normal_x || null,
      normal_y: normal_y || null,
      normal_z: normal_z || null,
      color: color || '#FF0000',
      annotation_type: annotation_type || 'marker',
      measurement_value: measurement_value || null,
      measurement_unit: measurement_unit || 'm',
      priority: priority || 'normal',
      status: 'active',
      latitude: latitude || null,
      longitude: longitude || null,
      altitude: altitude || null,
      georeferenced: georeferenced || false,
      created_at: now,
      updated_at: now
    }

    const result = await db.collection('annotations').insertOne(annotation)
    
    // Clear cache for this model's annotations
    clearCache(`annotations:model:${model_id}`)
    
    return {
      id: result.insertedId.toString(),
      ...annotation,
      model_id: annotation.model_id.toString(),
      user_id: annotation.user_id.toString()
    }
  },

  /**
   * Update an annotation
   * @param {string} id - Annotation ID (ObjectId string)
   * @param {string} userId - User ID (ObjectId string)
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated annotation or null if not found
   */
  async update(id, userId, updateData) {
    // Get model_id first (before update, in case update fails)
    const db = await getDB()
    const annotation = await db.collection('annotations').findOne({
      _id: new ObjectId(id),
      user_id: new ObjectId(userId)
    })
    
    if (!annotation) {
      return null
    }
    
    const model_id = annotation.model_id.toString()

    const {
      title,
      description,
      position_x,
      position_y,
      position_z,
      color,
      status,
      priority,
      measurement_value,
      measurement_unit,
    } = updateData

    const result = await db.collection('annotations').findOneAndUpdate(
      { _id: new ObjectId(id), user_id: new ObjectId(userId) },
      {
        $set: {
          title,
          description,
          position_x,
          position_y,
          position_z,
          color,
          status,
          priority,
          measurement_value,
          measurement_unit,
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    )
    
    // Clear cache for this model's annotations
    if (result.value) {
      clearCache(`annotations:model:${model_id}`)
      
      return {
        id: result.value._id.toString(),
        model_id: result.value.model_id.toString(),
        user_id: result.value.user_id.toString(),
        title: result.value.title,
        description: result.value.description,
        position_x: result.value.position_x,
        position_y: result.value.position_y,
        position_z: result.value.position_z,
        normal_x: result.value.normal_x,
        normal_y: result.value.normal_y,
        normal_z: result.value.normal_z,
        color: result.value.color,
        annotation_type: result.value.annotation_type,
        measurement_value: result.value.measurement_value,
        measurement_unit: result.value.measurement_unit,
        priority: result.value.priority,
        status: result.value.status,
        latitude: result.value.latitude,
        longitude: result.value.longitude,
        altitude: result.value.altitude,
        georeferenced: result.value.georeferenced,
        created_at: result.value.created_at,
        updated_at: result.value.updated_at
      }
    }
    
    return null
  },

  /**
   * Delete an annotation
   * @param {string} id - Annotation ID (ObjectId string)
   * @param {string} userId - User ID (ObjectId string)
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id, userId) {
    // Get model_id before deleting for cache clearing
    const db = await getDB()
    const annotation = await db.collection('annotations').findOne({
      _id: new ObjectId(id),
      user_id: new ObjectId(userId)
    })
    
    const result = await db.collection('annotations').deleteOne({
      _id: new ObjectId(id),
      user_id: new ObjectId(userId)
    })
    
    // Clear cache if deleted
    if (result.deletedCount > 0 && annotation) {
      clearCache(`annotations:model:${annotation.model_id.toString()}`)
    }
    
    return result.deletedCount > 0
  },

  /**
   * Verify annotation belongs to user
   * @param {string} annotationId - Annotation ID (ObjectId string)
   * @param {string} userId - User ID (ObjectId string)
   * @returns {Promise<boolean>} True if annotation belongs to user
   */
  async verifyOwnership(annotationId, userId) {
    const db = await getDB()
    const count = await db.collection('annotations').countDocuments({
      _id: new ObjectId(annotationId),
      user_id: new ObjectId(userId)
    })
    return count > 0
  }
}
