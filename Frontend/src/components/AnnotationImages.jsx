import { useState } from 'react'
import { FiX, FiChevronLeft, FiChevronRight, FiSend } from 'react-icons/fi'
import LazyImage from './LazyImage'

const AnnotationImages = ({ annotation, onClose }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const images = annotation.images || []

  // Show panel even if no images to indicate annotation is selected
  const currentImage = images.length > 0 ? images[selectedImageIndex] : null
  const uploadBaseUrl = import.meta.env.VITE_UPLOAD_URL || 'http://localhost:5000'
  const imageUrl = currentImage 
    ? (currentImage.image_path.startsWith('http')
        ? currentImage.image_path
        : `${uploadBaseUrl}/${currentImage.image_path}`)
    : null

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="absolute bottom-20 left-0 right-0 bg-gray-900 text-white p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">{annotation.title || 'Annotation'}</h3>
          {annotation.description && (
            <p className="text-sm text-gray-400">{annotation.description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded transition-colors"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Main Image Display */}
      {currentImage ? (
        <div className="mb-4 relative">
          <div className="flex items-center justify-center bg-black rounded-lg overflow-hidden" style={{ height: '300px' }}>
            <LazyImage
              src={imageUrl}
              alt={currentImage.image_name || 'Annotation image'}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          
          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 p-2 rounded-full hover:bg-gray-700"
              >
                <FiChevronLeft size={24} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 p-2 rounded-full hover:bg-gray-700"
              >
                <FiChevronRight size={24} />
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="mb-4 flex items-center justify-center bg-gray-800 rounded-lg" style={{ height: '200px' }}>
          <p className="text-gray-400">No images linked to this annotation yet</p>
        </div>
      )}

      {/* Thumbnail Strip - Only show if there are images */}
      {images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => {
          const thumbUrl = image.thumbnail_path 
            ? (image.thumbnail_path.startsWith('http') 
                ? image.thumbnail_path 
                : `${uploadBaseUrl}/${image.thumbnail_path}`)
            : (image.image_path.startsWith('http')
                ? image.image_path
                : `${uploadBaseUrl}/${image.image_path}`)

          return (
            <div
              key={image.id}
              className={`flex-shrink-0 cursor-pointer border-2 rounded ${
                index === selectedImageIndex ? 'border-blue-500' : 'border-gray-700'
              }`}
              onClick={() => setSelectedImageIndex(index)}
            >
              <div className="relative">
                <LazyImage
                  src={thumbUrl}
                  alt={image.image_name || `Image ${index + 1}`}
                  className="w-24 h-24 object-cover rounded"
                />
                {/* Target reticle overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-blue-400 rounded-full"></div>
                </div>
              </div>
              <div className="p-1 text-xs text-center bg-gray-800">
                <div className="flex items-center justify-center gap-1">
                  <span>{image.image_identifier || `P${String(index + 1).padStart(7, '0')}`}</span>
                  <FiSend size={12} className="text-gray-400" />
                </div>
              </div>
            </div>
          )
          })}
        </div>
      )}
    </div>
  )
}

export default AnnotationImages
