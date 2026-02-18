import jwt from 'jsonwebtoken'
import { getDB } from '../config/database.js'
import { ObjectId } from 'mongodb'

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Get user from database
    const db = await getDB()
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(decoded.userId) },
      { projection: { password: 0 } } // Exclude password
    )

    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    // Convert _id to id for consistency
    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name
    }
    
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' })
    }
    res.status(500).json({ message: 'Authentication error' })
  }
}
