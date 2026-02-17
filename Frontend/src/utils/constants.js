/**
 * Application constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  UPLOAD_URL: import.meta.env.VITE_UPLOAD_URL || 'http://localhost:5000/uploads',
  TIMEOUT: 30000, // 30 seconds
}

// File Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: import.meta.env.VITE_MAX_FILE_SIZE || 1073741824, // 1GB
  ALLOWED_TYPES: [
    '.obj', '.fbx', '.gltf', '.glb', '.stl', '.usd', '.usdz', '.dae', '.3ds', '.3dm', '.ply',
    '.ifc', '.rvt', '.nwd', '.nwc', '.dwg',
    '.las', '.laz', '.e57', '.xyz', '.pts', '.rcp', '.rcs',
    '.jpg', '.jpeg', '.png', '.tiff', '.tif',
    '.csv', '.json', '.pdf'
  ]
}

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  VIEWER_SETTINGS: 'viewer_settings'
}

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  ABOUT: '/about',
  PRICING: '/pricing',
  CONTACT: '/contact'
}

// Animation Delays (for staggered animations)
export const ANIMATION_DELAYS = {
  FAST: 0.05,
  MEDIUM: 0.1,
  SLOW: 0.2
}
