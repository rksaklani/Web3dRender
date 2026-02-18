import { getDB } from '../config/database.js'
import { ObjectId } from 'mongodb'

/**
 * Photogrammetry Service - Handles photogrammetry projects and camera calibration
 * Separates business logic from route handlers
 */
export const photogrammetryService = {
  /**
   * Create a photogrammetry project
   * @param {string} modelId - Model ID (ObjectId string)
   * @param {string} userId - User ID (ObjectId string)
   * @param {Object} settings - Project settings
   * @returns {Promise<Object>} Created project
   */
  async createProject(modelId, userId, settings) {
    const {
      project_id,
      reconstruction_method,
      quality_settings,
      input_images_count
    } = settings
    
    const db = await getDB()
    
    // Verify model ownership
    const modelCheck = await db.collection('models').findOne({
      _id: new ObjectId(modelId),
      user_id: new ObjectId(userId)
    })
    
    if (!modelCheck) {
      throw new Error('Model not found or access denied')
    }
    
    const now = new Date()
    const project = {
      model_id: new ObjectId(modelId),
      project_id: project_id ? new ObjectId(project_id) : null,
      user_id: new ObjectId(userId),
      reconstruction_method: reconstruction_method || 'SfM',
      quality_settings: quality_settings || null,
      input_images_count: input_images_count || 0,
      processing_status: 'pending',
      created_at: now,
      updated_at: now
    }
    
    const result = await db.collection('photogrammetry_projects').insertOne(project)
    
    return {
      id: result.insertedId.toString(),
      ...project,
      model_id: project.model_id.toString(),
      project_id: project.project_id ? project.project_id.toString() : null,
      user_id: project.user_id.toString()
    }
  },

  /**
   * Get photogrammetry project by ID
   * @param {string} projectId - Project ID (ObjectId string)
   * @param {string} userId - User ID (ObjectId string)
   * @returns {Promise<Object|null>} Project or null
   */
  async getProjectById(projectId, userId) {
    const db = await getDB()
    const project = await db.collection('photogrammetry_projects')
      .aggregate([
        {
          $match: {
            _id: new ObjectId(projectId),
            user_id: new ObjectId(userId)
          }
        },
        {
          $lookup: {
            from: 'models',
            localField: 'model_id',
            foreignField: '_id',
            as: 'model'
          }
        },
        {
          $unwind: {
            path: '$model',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            model_id: 1,
            project_id: 1,
            user_id: 1,
            reconstruction_method: 1,
            quality_settings: 1,
            input_images_count: 1,
            processing_status: 1,
            output_mesh_path: 1,
            processing_log: 1,
            created_at: 1,
            updated_at: 1,
            model_name: '$model.name',
            model_path: '$model.file_path'
          }
        }
      ])
      .toArray()
    
    if (project.length === 0) {
      return null
    }
    
    const p = project[0]
    return {
      id: p._id.toString(),
      model_id: p.model_id.toString(),
      project_id: p.project_id ? p.project_id.toString() : null,
      user_id: p.user_id.toString(),
      reconstruction_method: p.reconstruction_method,
      quality_settings: p.quality_settings,
      input_images_count: p.input_images_count,
      processing_status: p.processing_status,
      output_mesh_path: p.output_mesh_path,
      processing_log: p.processing_log,
      model_name: p.model_name,
      model_path: p.model_path,
      created_at: p.created_at,
      updated_at: p.updated_at
    }
  },

  /**
   * Get all photogrammetry projects for a model
   * @param {string} modelId - Model ID (ObjectId string)
   * @param {string} userId - User ID (ObjectId string)
   * @returns {Promise<Array>} Array of projects
   */
  async getProjectsByModelId(modelId, userId) {
    const db = await getDB()
    
    // Verify model ownership
    const modelCheck = await db.collection('models').findOne({
      _id: new ObjectId(modelId),
      user_id: new ObjectId(userId)
    })
    
    if (!modelCheck) {
      return []
    }
    
    const projects = await db.collection('photogrammetry_projects')
      .find({
        model_id: new ObjectId(modelId),
        user_id: new ObjectId(userId)
      })
      .sort({ created_at: -1 })
      .toArray()
    
    return projects.map(p => ({
      id: p._id.toString(),
      model_id: p.model_id.toString(),
      project_id: p.project_id ? p.project_id.toString() : null,
      user_id: p.user_id.toString(),
      reconstruction_method: p.reconstruction_method,
      quality_settings: p.quality_settings,
      input_images_count: p.input_images_count,
      processing_status: p.processing_status,
      output_mesh_path: p.output_mesh_path,
      processing_log: p.processing_log,
      created_at: p.created_at,
      updated_at: p.updated_at
    }))
  },

  /**
   * Update photogrammetry project status
   * @param {string} projectId - Project ID (ObjectId string)
   * @param {string} userId - User ID (ObjectId string)
   * @param {Object} updateData - Update data
   * @returns {Promise<Object|null>} Updated project or null
   */
  async updateProject(projectId, userId, updateData) {
    const {
      processing_status,
      output_mesh_path,
      processing_log
    } = updateData
    
    const db = await getDB()
    const updateFields = {
      updated_at: new Date()
    }
    
    if (processing_status !== undefined) updateFields.processing_status = processing_status
    if (output_mesh_path !== undefined) updateFields.output_mesh_path = output_mesh_path
    if (processing_log !== undefined) updateFields.processing_log = processing_log
    
    const result = await db.collection('photogrammetry_projects').findOneAndUpdate(
      {
        _id: new ObjectId(projectId),
        user_id: new ObjectId(userId)
      },
      { $set: updateFields },
      { returnDocument: 'after' }
    )
    
    if (!result.value) return null
    
    return {
      id: result.value._id.toString(),
      model_id: result.value.model_id.toString(),
      project_id: result.value.project_id ? result.value.project_id.toString() : null,
      user_id: result.value.user_id.toString(),
      reconstruction_method: result.value.reconstruction_method,
      quality_settings: result.value.quality_settings,
      input_images_count: result.value.input_images_count,
      processing_status: result.value.processing_status,
      output_mesh_path: result.value.output_mesh_path,
      processing_log: result.value.processing_log,
      created_at: result.value.created_at,
      updated_at: result.value.updated_at
    }
  },

  /**
   * Update camera calibration parameters
   * @param {string} cameraId - Camera viewpoint ID (ObjectId string)
   * @param {string} userId - User ID (ObjectId string)
   * @param {Object} calibrationData - Calibration data
   * @returns {Promise<Object|null>} Updated camera or null
   */
  async updateCameraCalibration(cameraId, userId, calibrationData) {
    const {
      calibration_matrix,
      distortion_coefficients,
      focal_length,
      sensor_width,
      sensor_height,
      image_width,
      image_height
    } = calibrationData
    
    const db = await getDB()
    
    // Verify camera ownership through model
    const camera = await db.collection('camera_viewpoints')
      .aggregate([
        {
          $match: { _id: new ObjectId(cameraId) }
        },
        {
          $lookup: {
            from: 'models',
            localField: 'model_id',
            foreignField: '_id',
            as: 'model'
          }
        },
        {
          $unwind: '$model'
        },
        {
          $match: {
            'model.user_id': new ObjectId(userId)
          }
        }
      ])
      .toArray()
    
    if (camera.length === 0) {
      return null
    }
    
    const updateFields = {}
    if (calibration_matrix !== undefined) updateFields.calibration_matrix = calibration_matrix
    if (distortion_coefficients !== undefined) updateFields.distortion_coefficients = distortion_coefficients
    if (focal_length !== undefined) updateFields.focal_length = focal_length
    if (sensor_width !== undefined) updateFields.sensor_width = sensor_width
    if (sensor_height !== undefined) updateFields.sensor_height = sensor_height
    if (image_width !== undefined) updateFields.image_width = image_width
    if (image_height !== undefined) updateFields.image_height = image_height
    
    const result = await db.collection('camera_viewpoints').findOneAndUpdate(
      { _id: new ObjectId(cameraId) },
      { $set: updateFields },
      { returnDocument: 'after' }
    )
    
    if (!result.value) return null
    
    return {
      id: result.value._id.toString(),
      model_id: result.value.model_id.toString(),
      calibration_matrix: result.value.calibration_matrix,
      distortion_coefficients: result.value.distortion_coefficients,
      focal_length: result.value.focal_length,
      sensor_width: result.value.sensor_width,
      sensor_height: result.value.sensor_height,
      image_width: result.value.image_width,
      image_height: result.value.image_height
    }
  }
}
