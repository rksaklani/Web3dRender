import { getDB } from '../config/database.js'
import { ObjectId } from 'mongodb'
import { clearCache } from '../utils/queryCache.js'

/**
 * Georeferencing Service - Handles coordinate transformations and georeferencing
 * Separates business logic from route handlers
 */
export const georeferencingService = {
  /**
   * Get model georeferencing data
   * @param {string} modelId - Model ID (ObjectId string)
   * @returns {Promise<Object|null>} Georeferencing data or null
   */
  async getModelGeoreferencing(modelId) {
    const db = await getDB()
    const model = await db.collection('models').findOne(
      { _id: new ObjectId(modelId) },
      {
        projection: {
          crs: 1,
          origin_lat: 1,
          origin_lon: 1,
          origin_altitude: 1,
          transform_matrix: 1
        }
      }
    )
    
    if (!model) {
      return null
    }
    
    return {
      crs: model.crs,
      origin_lat: model.origin_lat ? parseFloat(model.origin_lat) : null,
      origin_lon: model.origin_lon ? parseFloat(model.origin_lon) : null,
      origin_altitude: model.origin_altitude ? parseFloat(model.origin_altitude) : null,
      transform_matrix: model.transform_matrix || null
    }
  },

  /**
   * Update model georeferencing
   * @param {string} modelId - Model ID (ObjectId string)
   * @param {string} userId - User ID (ObjectId string)
   * @param {Object} georefData - Georeferencing data
   * @returns {Promise<Object|null>} Updated georeferencing or null
   */
  async updateGeoreferencing(modelId, userId, georefData) {
    const { crs, origin_lat, origin_lon, origin_altitude, transform_matrix } = georefData
    
    const db = await getDB()
    
    // Verify model ownership
    const ownershipCheck = await db.collection('models').findOne({
      _id: new ObjectId(modelId),
      user_id: new ObjectId(userId)
    })
    
    if (!ownershipCheck) {
      return null
    }
    
    const result = await db.collection('models').findOneAndUpdate(
      {
        _id: new ObjectId(modelId),
        user_id: new ObjectId(userId)
      },
      {
        $set: {
          crs: crs || null,
          origin_lat: origin_lat || null,
          origin_lon: origin_lon || null,
          origin_altitude: origin_altitude || null,
          transform_matrix: transform_matrix || null,
          updated_at: new Date()
        }
      },
      {
        returnDocument: 'after',
        projection: {
          crs: 1,
          origin_lat: 1,
          origin_lon: 1,
          origin_altitude: 1,
          transform_matrix: 1
        }
      }
    )
    
    // Clear cache
    clearCache(`models:*`)
    
    if (!result.value) return null
    
    return {
      crs: result.value.crs,
      origin_lat: result.value.origin_lat,
      origin_lon: result.value.origin_lon,
      origin_altitude: result.value.origin_altitude,
      transform_matrix: result.value.transform_matrix
    }
  },

  /**
   * Convert 3D local coordinates to geographic coordinates (lat/lon/alt)
   * @param {string} modelId - Model ID (ObjectId string)
   * @param {number} x - Local X coordinate
   * @param {number} y - Local Y coordinate
   * @param {number} z - Local Z coordinate
   * @returns {Promise<Object|null>} Geographic coordinates or null
   */
  async convertToGeographic(modelId, x, y, z) {
    const georef = await this.getModelGeoreferencing(modelId)
    
    if (!georef || !georef.origin_lat || !georef.origin_lon) {
      return null // Model not georeferenced
    }
    
    // Simple offset conversion (can be enhanced with proper CRS transformation)
    // For now, assuming local coordinates are in meters relative to origin
    const EARTH_RADIUS = 6378137 // meters
    
    // Convert local offset to lat/lon (simplified - assumes small distances)
    const latOffset = y / EARTH_RADIUS * (180 / Math.PI)
    const lonOffset = x / (EARTH_RADIUS * Math.cos(georef.origin_lat * Math.PI / 180)) * (180 / Math.PI)
    
    return {
      latitude: georef.origin_lat + latOffset,
      longitude: georef.origin_lon + lonOffset,
      altitude: georef.origin_altitude ? georef.origin_altitude + z : z
    }
  },

  /**
   * Convert geographic coordinates (lat/lon/alt) to 3D local coordinates
   * @param {string} modelId - Model ID (ObjectId string)
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {number} altitude - Altitude
   * @returns {Promise<Object|null>} Local 3D coordinates or null
   */
  async convertToLocal(modelId, lat, lon, altitude) {
    const georef = await this.getModelGeoreferencing(modelId)
    
    if (!georef || !georef.origin_lat || !georef.origin_lon) {
      return null // Model not georeferenced
    }
    
    // Simple offset conversion (can be enhanced with proper CRS transformation)
    const EARTH_RADIUS = 6378137 // meters
    
    // Convert lat/lon difference to local coordinates (simplified)
    const latDiff = lat - georef.origin_lat
    const lonDiff = lon - georef.origin_lon
    
    const y = latDiff * (Math.PI / 180) * EARTH_RADIUS
    const x = lonDiff * (Math.PI / 180) * EARTH_RADIUS * Math.cos(georef.origin_lat * Math.PI / 180)
    const z = georef.origin_altitude ? altitude - georef.origin_altitude : altitude
    
    return { x, y, z }
  },

  /**
   * Auto-convert annotation coordinates if model is georeferenced
   * @param {string} modelId - Model ID (ObjectId string)
   * @param {number} x - Local X coordinate
   * @param {number} y - Local Y coordinate
   * @param {number} z - Local Z coordinate
   * @returns {Promise<Object>} Object with both local and geographic coordinates
   */
  async convertAnnotationCoordinates(modelId, x, y, z) {
    const geographic = await this.convertToGeographic(modelId, x, y, z)
    
    return {
      position_x: x,
      position_y: y,
      position_z: z,
      latitude: geographic?.latitude || null,
      longitude: geographic?.longitude || null,
      altitude: geographic?.altitude || null,
      georeferenced: !!geographic
    }
  }
}
