import { getDB } from '../config/database.js'
import { ObjectId } from 'mongodb'

/**
 * Volumetric Video Service - Handles volumetric video sequences and frames
 * Separates business logic from route handlers
 */
export const volumetricVideoService = {
  /**
   * Create a volumetric video record
   * @param {string} modelId - Model ID (ObjectId string)
   * @param {string} userId - User ID (ObjectId string)
   * @param {Object} videoData - Video data
   * @returns {Promise<Object>} Created video record
   */
  async createVideo(modelId, userId, videoData) {
    const {
      video_path,
      frame_count,
      fps,
      resolution_width,
      resolution_height,
      format,
      metadata
    } = videoData
    
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
    const video = {
      model_id: new ObjectId(modelId),
      user_id: new ObjectId(userId),
      video_path,
      frame_count: frame_count || null,
      fps: fps || null,
      resolution_width: resolution_width || null,
      resolution_height: resolution_height || null,
      format: format || 'PLY_SEQUENCE',
      metadata: metadata || null,
      created_at: now,
      updated_at: now
    }
    
    const result = await db.collection('volumetric_videos').insertOne(video)
    
    return {
      id: result.insertedId.toString(),
      ...video,
      model_id: video.model_id.toString(),
      user_id: video.user_id.toString()
    }
  },

  /**
   * Get volumetric video by ID
   * @param {string} videoId - Video ID (ObjectId string)
   * @param {string} userId - User ID (ObjectId string)
   * @returns {Promise<Object|null>} Video or null
   */
  async getVideoById(videoId, userId) {
    const db = await getDB()
    const video = await db.collection('volumetric_videos')
      .aggregate([
        {
          $match: {
            _id: new ObjectId(videoId),
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
            user_id: 1,
            video_path: 1,
            frame_count: 1,
            fps: 1,
            resolution_width: 1,
            resolution_height: 1,
            format: 1,
            metadata: 1,
            created_at: 1,
            updated_at: 1,
            model_name: '$model.name',
            model_path: '$model.file_path'
          }
        }
      ])
      .toArray()
    
    if (video.length === 0) {
      return null
    }
    
    const v = video[0]
    return {
      id: v._id.toString(),
      model_id: v.model_id.toString(),
      user_id: v.user_id.toString(),
      video_path: v.video_path,
      frame_count: v.frame_count,
      fps: v.fps,
      resolution_width: v.resolution_width,
      resolution_height: v.resolution_height,
      format: v.format,
      metadata: v.metadata,
      model_name: v.model_name,
      model_path: v.model_path,
      created_at: v.created_at,
      updated_at: v.updated_at
    }
  },

  /**
   * Get volumetric video by model ID
   * @param {string} modelId - Model ID (ObjectId string)
   * @param {string} userId - User ID (ObjectId string)
   * @returns {Promise<Object|null>} Video or null
   */
  async getVideoByModelId(modelId, userId) {
    const db = await getDB()
    
    // Verify model ownership
    const modelCheck = await db.collection('models').findOne({
      _id: new ObjectId(modelId),
      user_id: new ObjectId(userId)
    })
    
    if (!modelCheck) {
      return null
    }
    
    const video = await db.collection('volumetric_videos')
      .findOne({
        model_id: new ObjectId(modelId),
        user_id: new ObjectId(userId)
      }, {
        sort: { created_at: -1 }
      })
    
    if (!video) {
      return null
    }
    
    return {
      id: video._id.toString(),
      model_id: video.model_id.toString(),
      user_id: video.user_id.toString(),
      video_path: video.video_path,
      frame_count: video.frame_count,
      fps: video.fps,
      resolution_width: video.resolution_width,
      resolution_height: video.resolution_height,
      format: video.format,
      metadata: video.metadata,
      created_at: video.created_at,
      updated_at: video.updated_at
    }
  },

  /**
   * Get frames for a volumetric video
   * @param {string} videoId - Video ID (ObjectId string)
   * @param {Object} options - Query options
   * @param {number} options.startFrame - Start frame number (optional)
   * @param {number} options.endFrame - End frame number (optional)
   * @param {number} options.limit - Maximum frames to return
   * @returns {Promise<Array>} Array of frames
   */
  async getFrames(videoId, options = {}) {
    const { startFrame, endFrame, limit = 100 } = options
    
    const db = await getDB()
    const query = { volumetric_video_id: new ObjectId(videoId) }
    
    if (startFrame !== undefined) {
      query.frame_number = { ...query.frame_number, $gte: startFrame }
    }
    
    if (endFrame !== undefined) {
      query.frame_number = { ...query.frame_number, $lte: endFrame }
    }
    
    const frames = await db.collection('volumetric_video_frames')
      .find(query)
      .sort({ frame_number: 1 })
      .limit(limit)
      .toArray()
    
    return frames.map(frame => ({
      id: frame._id.toString(),
      volumetric_video_id: frame.volumetric_video_id.toString(),
      frame_number: frame.frame_number,
      frame_path: frame.frame_path,
      timestamp: frame.timestamp
    }))
  },

  /**
   * Add frame to volumetric video
   * @param {string} videoId - Video ID (ObjectId string)
   * @param {Object} frameData - Frame data
   * @returns {Promise<Object>} Created frame
   */
  async addFrame(videoId, frameData) {
    const { frame_number, frame_path, timestamp } = frameData
    
    const db = await getDB()
    
    const frame = {
      volumetric_video_id: new ObjectId(videoId),
      frame_number,
      frame_path,
      timestamp: timestamp || null
    }
    
    // Use updateOne with upsert to handle ON CONFLICT equivalent
    const result = await db.collection('volumetric_video_frames').findOneAndUpdate(
      {
        volumetric_video_id: new ObjectId(videoId),
        frame_number
      },
      {
        $set: frame
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    
    return {
      id: result.value._id.toString(),
      volumetric_video_id: result.value.volumetric_video_id.toString(),
      frame_number: result.value.frame_number,
      frame_path: result.value.frame_path,
      timestamp: result.value.timestamp
    }
  },

  /**
   * Delete volumetric video
   * @param {string} videoId - Video ID (ObjectId string)
   * @param {string} userId - User ID (ObjectId string)
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteVideo(videoId, userId) {
    const db = await getDB()
    const result = await db.collection('volumetric_videos').deleteOne({
      _id: new ObjectId(videoId),
      user_id: new ObjectId(userId)
    })
    
    return result.deletedCount > 0
  }
}
