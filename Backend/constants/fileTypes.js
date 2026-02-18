import path from 'path'

/**
 * File Types Constants
 * Defines allowed file extensions, file size limits, and file categories
 */

// Maximum file size: 1GB (1073741824 bytes)
export const MAX_FILE_SIZE = 1073741824

// All allowed file extensions for uploads
export const ALLOWED_EXTENSIONS = [
  // 3D Model Formats
  '.obj',
  '.fbx',
  '.gltf',
  '.glb',
  '.stl',
  '.usd',
  '.usdz',
  '.dae',
  '.3ds',
  '.3dm',
  '.ply',
  // BIM Formats
  '.ifc',
  '.rvt',
  '.nwd',
  '.nwc',
  '.dwg',
  // Point Cloud Formats
  '.las',
  '.laz',
  '.e57',
  '.xyz',
  '.pts',
  '.rcp',
  '.rcs',
  // Image Formats
  '.jpg',
  '.jpeg',
  '.png',
  '.tiff',
  '.tif',
  // Other Formats
  '.csv',
  '.json',
  '.pdf'
]

/**
 * File categories for different model types
 */
export const FILE_CATEGORIES = {
  // Static 3D models
  STATIC_MODELS: [
    '.obj',
    '.fbx',
    '.gltf',
    '.glb',
    '.stl',
    '.dae',
    '.3ds',
    '.3dm',
    '.ply'
  ],
  
  // BIM models
  BIM_MODELS: [
    '.ifc',
    '.rvt',
    '.nwd',
    '.nwc',
    '.dwg'
  ],
  
  // Point cloud formats
  POINT_CLOUDS: [
    '.las',
    '.laz',
    '.e57',
    '.xyz',
    '.pts',
    '.rcp',
    '.rcs'
  ],
  
  // Volumetric video formats
  VOLUMETRIC_VIDEO: [
    '.ply', // PLY sequences for volumetric video
    '.obj'  // OBJ sequences for volumetric video
  ],
  
  // Photogrammetry formats
  PHOTOGRAMMETRY: [
    '.jpg',
    '.jpeg',
    '.png',
    '.tiff',
    '.tif'
  ],
  
  // Image formats
  IMAGES: [
    '.jpg',
    '.jpeg',
    '.png',
    '.tiff',
    '.tif'
  ],
  
  // Data formats
  DATA: [
    '.csv',
    '.json',
    '.pdf'
  ]
}

/**
 * Get file category for a given file extension
 * @param {string} extension - File extension (e.g., '.obj')
 * @returns {string|null} Category name or null
 */
export const getFileCategory = (extension) => {
  const ext = extension.toLowerCase()
  
  for (const [category, extensions] of Object.entries(FILE_CATEGORIES)) {
    if (extensions.includes(ext)) {
      return category
    }
  }
  
  return null
}

/**
 * Check if file extension is allowed
 * @param {string} extension - File extension
 * @returns {boolean} True if allowed
 */
export const isAllowedExtension = (extension) => {
  return ALLOWED_EXTENSIONS.includes(extension.toLowerCase())
}

/**
 * Get file type description
 * @param {string} extension - File extension
 * @returns {string} File type description
 */
export const getFileTypeDescription = (extension) => {
  const descriptions = {
    '.obj': 'Wavefront OBJ',
    '.fbx': 'Autodesk FBX',
    '.gltf': 'glTF 2.0',
    '.glb': 'glTF Binary',
    '.stl': 'STL (Stereolithography)',
    '.ifc': 'Industry Foundation Classes',
    '.ply': 'PLY (Polygon File Format)',
    '.dae': 'Collada DAE',
    '.3ds': '3D Studio',
    '.las': 'LAS (Point Cloud)',
    '.laz': 'LAZ (Compressed Point Cloud)'
  }
  
  return descriptions[extension.toLowerCase()] || extension.toUpperCase().substring(1)
}
