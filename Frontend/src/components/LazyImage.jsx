import { useState, useRef, useEffect } from 'react'

/**
 * Lazy loading image component
 * Loads images only when they enter the viewport
 */
const LazyImage = ({ 
  src, 
  alt = '', 
  className = '', 
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"%3E%3C/svg%3E',
  onLoad,
  onError,
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef(null)
  const observerRef = useRef(null)

  // Reset state when src changes
  useEffect(() => {
    setImageSrc(placeholder)
    setIsLoaded(false)
    setHasError(false)
  }, [src, placeholder])

  useEffect(() => {
    // If image is already loaded, don't set up intersection observer
    if (isLoaded) return

    // Create intersection observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Image is in viewport, start loading
            const img = new Image()
            img.src = src
            
            img.onload = () => {
              setImageSrc(src)
              setIsLoaded(true)
              if (onLoad) onLoad()
            }
            
            img.onerror = () => {
              setHasError(true)
              if (onError) onError()
            }
            
            // Stop observing once we start loading
            if (observer && imgRef.current) {
              observer.unobserve(imgRef.current)
            }
          }
        })
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
      }
    )

    // Store observer reference
    observerRef.current = observer

    // Start observing
    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    // Cleanup
    return () => {
      if (observer && imgRef.current) {
        observer.unobserve(imgRef.current)
      }
      observerRef.current = null
    }
  }, [src, isLoaded, onLoad, onError])

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${!isLoaded ? 'opacity-50 blur-sm' : 'opacity-100'} transition-opacity duration-300`}
      loading="lazy"
      {...props}
    />
  )
}

export default LazyImage
