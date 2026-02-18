import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import { body, validationResult } from 'express-validator'
import { getDB } from '../config/database.js'
import { asyncHandler, createError } from '../utils/errorHandler.js'
import { validatePasswordStrength } from '../utils/passwordValidator.js'

const router = express.Router()

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5, // Limit auth attempts to 5 per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful requests
  standardHeaders: true,
  legacyHeaders: false,
})

// Apply rate limiting to all auth routes
router.use(authLimiter)

// Register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
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

    const { name, email, password } = req.body

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors
      })
    }

    const db = await getDB()

    // Check if user exists (normalize email to lowercase)
    const normalizedEmail = email.toLowerCase().trim()
    const existingUser = await db.collection('users').findOne({ email: normalizedEmail })
    if (existingUser) {
      throw createError('User with this email already exists', 400)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user (normalize email to lowercase)
    const now = new Date()
    const user = {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      created_at: now,
      updated_at: now
    }

    const result = await db.collection('users').insertOne(user)

    // Generate token
    if (!process.env.JWT_SECRET) {
      throw createError('JWT_SECRET is not configured', 500)
    }
    
    const token = jwt.sign({ userId: result.insertedId.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    })

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: result.insertedId.toString(),
        name: user.name,
        email: user.email,
      },
    })
  })
)

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
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

    const { email, password } = req.body

    const db = await getDB()

    // Find user
    const user = await db.collection('users').findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      throw createError('Invalid email or password', 401)
    }

    // Check password
    if (!user.password) {
      throw createError('User account error - please contact support', 500)
    }
    
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      throw createError('Invalid email or password', 401)
    }

    // Generate token
    if (!process.env.JWT_SECRET) {
      throw createError('JWT_SECRET is not configured', 500)
    }
    
    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    })

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    })
  })
)

export default router
