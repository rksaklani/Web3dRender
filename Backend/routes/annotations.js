import express from 'express'
import { body, validationResult } from 'express-validator'
import { authenticate } from '../middleware/auth.js'
import { annotationService } from '../services/annotationService.js'
import { modelService } from '../services/modelService.js'
import { asyncHandler, createError } from '../utils/errorHandler.js'
import { getDB } from '../config/database.js'
import { ObjectId } from 'mongodb'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

// Get all annotations for a model
router.get('/model/:modelId', asyncHandler(async (req, res) => {
  // Verify model belongs to user
  const modelExists = await modelService.verifyOwnership(req.params.modelId, req.user.id)
  
  if (!modelExists) {
    throw createError('Model not found', 404)
  }

  const annotations = await annotationService.getByModelId(req.params.modelId)
  res.json(annotations)
}))

// Get single annotation with all images
router.get('/:id', asyncHandler(async (req, res) => {
  const annotation = await annotationService.getById(req.params.id, req.user.id)

  if (!annotation) {
    throw createError('Annotation not found', 404)
  }

  res.json(annotation)
}))

// Create annotation
router.post(
  '/',
  [
    body('model_id').notEmpty().withMessage('Model ID is required'),
    body('position_x').isFloat().withMessage('Position X is required'),
    body('position_y').isFloat().withMessage('Position Y is required'),
    body('position_z').isFloat().withMessage('Position Z is required'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      })
    }

    const {
      model_id,
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
    } = req.body

    // Verify model belongs to user
    const modelExists = await modelService.verifyOwnership(model_id, req.user.id)
    if (!modelExists) {
      throw createError('Model not found', 404)
    }

    const annotation = await annotationService.create({
      model_id,
      user_id: req.user.id,
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
    })

    res.status(201).json(annotation)
  })
)

// Update annotation
router.put('/:id', asyncHandler(async (req, res) => {
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
  } = req.body

  const annotation = await annotationService.update(req.params.id, req.user.id, {
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
  })

  if (!annotation) {
    throw createError('Annotation not found', 404)
  }

  res.json(annotation)
}))

// Delete annotation
router.delete('/:id', asyncHandler(async (req, res) => {
  const deleted = await annotationService.delete(req.params.id, req.user.id)

  if (!deleted) {
    throw createError('Annotation not found', 404)
  }

  res.json({ message: 'Annotation deleted successfully' })
}))

// Add image to annotation
router.post(
  '/:id/images',
  [
    body('image_path').notEmpty().withMessage('Image path is required'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      })
    }

    // Verify annotation belongs to user
    const annotationExists = await annotationService.verifyOwnership(req.params.id, req.user.id)
    if (!annotationExists) {
      throw createError('Annotation not found', 404)
    }

    const {
      image_path,
      image_name,
      thumbnail_path,
      image_identifier,
      camera_position_x,
      camera_position_y,
      camera_position_z,
      display_order,
    } = req.body

    const db = await getDB()
    const image = {
      annotation_id: new ObjectId(req.params.id),
      image_path,
      image_name: image_name || null,
      thumbnail_path: thumbnail_path || null,
      image_identifier: image_identifier || null,
      camera_position_x: camera_position_x || null,
      camera_position_y: camera_position_y || null,
      camera_position_z: camera_position_z || null,
      display_order: display_order || 0,
      uploaded_by: new ObjectId(req.user.id),
      created_at: new Date()
    }

    const result = await db.collection('annotation_images').insertOne(image)

    res.status(201).json({
      id: result.insertedId.toString(),
      ...image,
      annotation_id: image.annotation_id.toString(),
      uploaded_by: image.uploaded_by.toString()
    })
  })
)

// Delete image from annotation
router.delete('/images/:imageId', asyncHandler(async (req, res) => {
  // Verify image belongs to user's annotation
  const db = await getDB()
  const imageCheck = await db.collection('annotation_images')
    .aggregate([
      {
        $match: { _id: new ObjectId(req.params.imageId) }
      },
      {
        $lookup: {
          from: 'annotations',
          localField: 'annotation_id',
          foreignField: '_id',
          as: 'annotation'
        }
      },
      {
        $unwind: '$annotation'
      },
      {
        $match: {
          'annotation.user_id': new ObjectId(req.user.id)
        }
      }
    ])
    .toArray()

  if (imageCheck.length === 0) {
    throw createError('Image not found', 404)
  }

  await db.collection('annotation_images').deleteOne({
    _id: new ObjectId(req.params.imageId)
  })

  res.json({ message: 'Image deleted successfully' })
}))

export default router
