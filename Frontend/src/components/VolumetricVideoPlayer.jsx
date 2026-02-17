import { useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { FiPlay, FiPause, FiSkipForward, FiSkipBack, FiX } from 'react-icons/fi'
import * as THREE from 'three'
import { volumetricVideoAPI } from '../services/api'
import { showError } from '../utils/toast.jsx'

const VolumetricVideoPlayer = ({ modelId, isOpen, onClose }) => {
  const [video, setVideo] = useState(null)
  const [frames, setFrames] = useState([])
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const frameIntervalRef = useRef(null)

  useEffect(() => {
    if (isOpen && modelId) {
      loadVideo()
    }
    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current)
      }
    }
  }, [isOpen, modelId])

  const loadVideo = async () => {
    setLoading(true)
    try {
      const response = await volumetricVideoAPI.getVideoByModel(modelId)
      setVideo(response.data)
      
      // Load frames
      const framesResponse = await volumetricVideoAPI.getFrames(response.data.id, { limit: 100 })
      setFrames(framesResponse.data)
    } catch (error) {
      showError('Volumetric video not found for this model')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isPlaying && video && frames.length > 0) {
      const fps = video.fps || 30
      const interval = 1000 / fps
      
      frameIntervalRef.current = setInterval(() => {
        setCurrentFrame(prev => {
          const next = prev + 1
          if (next >= frames.length) {
            setIsPlaying(false)
            return 0
          }
          return next
        })
      }, interval)
    } else {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current)
      }
    }

    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current)
      }
    }
  }, [isPlaying, video, frames.length])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleNextFrame = () => {
    setCurrentFrame(prev => Math.min(prev + 1, frames.length - 1))
  }

  const handlePrevFrame = () => {
    setCurrentFrame(prev => Math.max(prev - 1, 0))
  }

  if (!isOpen) return null

  const currentFrameData = frames[currentFrame]

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
        <h2 className="text-xl font-bold">Volumetric Video Player</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <FiX size={24} />
        </button>
      </div>

      <div className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <p>Loading volumetric video...</p>
          </div>
        ) : currentFrameData ? (
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} />
            <ambientLight intensity={1.2} />
            <directionalLight position={[5, 5, 5]} intensity={1.5} />
            
            {/* Load and display current frame */}
            <FrameLoader framePath={currentFrameData.frame_path} />
            
            <OrbitControls enableDamping dampingFactor={0.05} />
          </Canvas>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <p>No frames available</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-4 flex items-center justify-center gap-4">
        <button
          onClick={handlePrevFrame}
          className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
          disabled={currentFrame === 0}
        >
          <FiSkipBack size={20} />
        </button>
        <button
          onClick={handlePlayPause}
          className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
        >
          {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
        </button>
        <button
          onClick={handleNextFrame}
          className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
          disabled={currentFrame >= frames.length - 1}
        >
          <FiSkipForward size={20} />
        </button>
        <div className="text-white ml-4">
          Frame {currentFrame + 1} / {frames.length}
        </div>
      </div>
    </div>
  )
}

// Component to load and display a single frame
function FrameLoader({ framePath }) {
  const [geometry, setGeometry] = useState(null)

  useEffect(() => {
    if (!framePath) return

    // Load PLY frame (simplified - in production, handle different formats)
    const loadFrame = async () => {
      try {
        const { PLYLoader } = await import('three/examples/jsm/loaders/PLYLoader.js')
        const loader = new PLYLoader()
        const loadedGeometry = await loader.loadAsync(framePath)
        setGeometry(loadedGeometry)
      } catch (error) {
        console.error('Error loading frame:', error)
        // Fallback: create a simple placeholder
        const placeholderGeometry = new THREE.BoxGeometry(1, 1, 1)
        setGeometry(placeholderGeometry)
      }
    }

    loadFrame()
  }, [framePath])

  if (!geometry) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={0xcccccc} />
      </mesh>
    )
  }

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={0xcccccc} />
    </mesh>
  )
}

export default VolumetricVideoPlayer
