import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, Loader } from '@react-three/drei'
import { FiX, FiZoomIn, FiZoomOut, FiRotateCw } from 'react-icons/fi'
import * as THREE from 'three'

// Model Loader Component
function Model({ url, onLoad }) {
  const [model, setModel] = useState(null)
  const groupRef = useRef()

  // Auto-rotate animation
  useFrame(() => {
    if (groupRef.current && model) {
      groupRef.current.rotation.y += 0.005
    }
  })

  // Load model based on file extension
  useEffect(() => {
    const loadModel = async () => {
      try {
        const extension = url.split('.').pop().toLowerCase()
        let loadedModel = null

        if (extension === 'glb' || extension === 'gltf') {
          const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
          const loader = new GLTFLoader()
          const gltf = await loader.loadAsync(url)
          loadedModel = gltf.scene
          
          // Traverse and ensure materials are properly set
          loadedModel.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true
              child.receiveShadow = true
              if (child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material]
                materials.forEach(mat => {
                  if (mat.map) {
                    mat.map.needsUpdate = true
                    mat.map.flipY = false
                  }
                  // Ensure proper material type
                  if (!(mat instanceof THREE.MeshStandardMaterial)) {
                    const newMat = new THREE.MeshStandardMaterial()
                    if (mat.color) newMat.color.copy(mat.color)
                    if (mat.map) newMat.map = mat.map
                    if (mat.emissive) newMat.emissive.copy(mat.emissive)
                    if (mat.roughness !== undefined) newMat.roughness = mat.roughness
                    if (mat.metalness !== undefined) newMat.metalness = mat.metalness
                    newMat.needsUpdate = true
                    if (Array.isArray(child.material)) {
                      const idx = child.material.indexOf(mat)
                      child.material[idx] = newMat
                    } else {
                      child.material = newMat
                    }
                  }
                })
              }
            }
          })
        } else if (extension === 'obj') {
          const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js')
          const { MTLLoader } = await import('three/examples/jsm/loaders/MTLLoader.js')
          
          // Try to load MTL file (material file) if it exists
          const baseUrl = url.substring(0, url.lastIndexOf('/') + 1)
          const objName = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'))
          const mtlUrl = `${baseUrl}${objName}.mtl`
          
          let loadedWithMaterials = false
          
          // Try loading MTL file first (but don't fail if it doesn't exist)
          try {
            // Check if MTL file exists by trying to fetch it
            const response = await fetch(mtlUrl, { method: 'HEAD' })
            if (response.ok) {
              const mtlLoader = new MTLLoader()
              mtlLoader.setMaterialOptions({ side: THREE.DoubleSide })
              mtlLoader.setPath(baseUrl) // Set path for texture loading
              const materials = await mtlLoader.loadAsync(mtlUrl)
              materials.preload()
              
              const objLoader = new OBJLoader()
              objLoader.setMaterials(materials)
              objLoader.setPath(baseUrl) // Set path for texture loading
              loadedModel = await objLoader.loadAsync(url)
              loadedWithMaterials = true
            } else {
              throw new Error('MTL file not found')
            }
          } catch (mtlError) {
            // MTL file doesn't exist or failed to load - load OBJ without materials
            const objLoader = new OBJLoader()
            loadedModel = await objLoader.loadAsync(url)
            loadedWithMaterials = false
          }
          
          // Apply materials (either enhance existing or create defaults)
          loadedModel.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true
              child.receiveShadow = true
              
              if (!loadedWithMaterials || !child.material || !child.material.map) {
                // No materials or no textures - create/update material
                const texture = child.material?.map
                
                if (texture) {
                  // Has texture but might need updating
                  texture.flipY = false
                  texture.needsUpdate = true
                  texture.colorSpace = THREE.SRGBColorSpace || 'srgb'
                  
                  child.material = new THREE.MeshStandardMaterial({
                    map: texture,
                    side: THREE.DoubleSide,
                    color: child.material?.color || 0xffffff
                  })
                } else {
                  // No texture - use default material with better color
                  const defaultColor = child.material?.color 
                    ? (child.material.color.isColor ? child.material.color.getHex() : child.material.color)
                    : 0xcccccc
                  
                  child.material = new THREE.MeshStandardMaterial({
                    color: defaultColor,
                    side: THREE.DoubleSide,
                    flatShading: false,
                    roughness: 0.7,
                    metalness: 0.1
                  })
                }
              } else {
                // Has material with texture - ensure it's properly configured
                if (child.material.map) {
                  child.material.map.flipY = false
                  child.material.map.needsUpdate = true
                  child.material.map.colorSpace = THREE.SRGBColorSpace || 'srgb'
                }
                // Convert to MeshStandardMaterial if needed
                if (!(child.material instanceof THREE.MeshStandardMaterial)) {
                  const newMat = new THREE.MeshStandardMaterial()
                  if (child.material.color) newMat.color.copy(child.material.color)
                  if (child.material.map) newMat.map = child.material.map
                  newMat.side = THREE.DoubleSide
                  child.material = newMat
                }
              }
            }
          })
        } else if (extension === 'fbx') {
          const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js')
          const loader = new FBXLoader()
          
          loadedModel = await loader.loadAsync(url)
          
          
          // Process FBX materials and textures
          loadedModel.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true
              child.receiveShadow = true
              
              if (child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material]
                
                materials.forEach((mat, index) => {
                  if (mat) {
                    
                    // Create new standard material
                    const newMat = new THREE.MeshStandardMaterial()
                    
                    // Handle textures
                    if (mat.map) {
                      // Texture exists - use it directly
                      newMat.map = mat.map
                      newMat.map.needsUpdate = true
                      newMat.map.flipY = false
                      newMat.map.colorSpace = THREE.SRGBColorSpace || 'srgb'
                    } else if (mat.diffuseMap) {
                      // Alternative texture property
                      newMat.map = mat.diffuseMap
                      newMat.map.needsUpdate = true
                      newMat.map.flipY = false
                    }
                    
                    // Handle colors
                    if (mat.color) {
                      newMat.color.copy(mat.color)
                    } else if (mat.diffuse) {
                      if (mat.diffuse.isColor) {
                        newMat.color.copy(mat.diffuse)
                      } else {
                        newMat.color.setHex(mat.diffuse)
                      }
                    }
                    
                    // Copy other material properties
                    if (mat.emissive) {
                      if (mat.emissive.isColor) {
                        newMat.emissive.copy(mat.emissive)
                      } else {
                        newMat.emissive.setHex(mat.emissive)
                      }
                    }
                    if (mat.roughness !== undefined) newMat.roughness = mat.roughness
                    if (mat.metalness !== undefined) newMat.metalness = mat.metalness
                    if (mat.opacity !== undefined) {
                      newMat.opacity = mat.opacity
                      newMat.transparent = mat.opacity < 1
                    }
                    
                    // Ensure material is visible
                    newMat.side = THREE.DoubleSide
                    newMat.needsUpdate = true
                    
                    // Replace material
                    if (Array.isArray(child.material)) {
                      child.material[index] = newMat
                    } else {
                      child.material = newMat
                    }
                  }
                })
              } else {
                // No material found - create default
                child.material = new THREE.MeshStandardMaterial({
                  color: 0x888888,
                  side: THREE.DoubleSide
                })
              }
            }
          })
          
        } else {
          throw new Error(`Format .${extension} not directly supported. Please convert to GLB/GLTF for best results.`)
        }

        // Center and scale model
        if (loadedModel) {
          const box = new THREE.Box3().setFromObject(loadedModel)
          const center = box.getCenter(new THREE.Vector3())
          const size = box.getSize(new THREE.Vector3())
          const maxDim = Math.max(size.x, size.y, size.z)
          const scale = 2 / maxDim

          loadedModel.scale.multiplyScalar(scale)
          loadedModel.position.sub(center.multiplyScalar(scale))

          setModel(loadedModel)
          if (onLoad) onLoad()
        }
        } catch (error) {
          // Silently handle model loading errors
        }
    }

    loadModel()
  }, [url, onLoad])

  if (!model) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    )
  }

  return (
    <group ref={groupRef}>
      <primitive object={model} />
    </group>
  )
}

const ModelViewer = ({ isOpen, onClose, modelUrl, modelName }) => {
  const [autoRotate, setAutoRotate] = useState(true)
  const controlsRef = useRef()

  if (!isOpen || !modelUrl) return null

  const handleZoomIn = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyIn(1.2)
    }
  }

  const handleZoomOut = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyOut(1.2)
    }
  }

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
        <h2 className="text-xl font-bold">{modelName || '3D Model Viewer'}</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-800 rounded transition-colors"
            title="Zoom In"
          >
            <FiZoomIn size={20} />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-800 rounded transition-colors"
            title="Zoom Out"
          >
            <FiZoomOut size={20} />
          </button>
          <button
            onClick={handleReset}
            className="p-2 hover:bg-gray-800 rounded transition-colors"
            title="Reset View"
          >
            <FiRotateCw size={20} />
          </button>
          <label className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={(e) => setAutoRotate(e.target.checked)}
              className="sr-only"
            />
            <span className="text-sm">Auto Rotate</span>
          </label>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-600 rounded transition-colors"
            title="Close"
          >
            <FiX size={20} />
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Canvas 
          shadows 
          gl={{ 
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.2,
            outputColorSpace: THREE.SRGBColorSpace || 'srgb'
          }}
        >
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          
          {/* Enhanced Lighting for better color rendering */}
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
          <directionalLight position={[-5, 5, -5]} intensity={0.8} />
          <pointLight position={[0, 10, 0]} intensity={0.5} />
          <hemisphereLight skyColor={0xffffff} groundColor={0x444444} intensity={0.6} />

          {/* Environment for better lighting and reflections */}
          <Environment preset="studio" />

          {/* Model */}
          <Suspense fallback={null}>
            <Model url={modelUrl} />
          </Suspense>

          {/* Controls */}
          <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.05}
            autoRotate={autoRotate}
            autoRotateSpeed={1}
            minDistance={1}
            maxDistance={10}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
          />
        </Canvas>
        <Loader />
      </div>

      {/* Instructions */}
      <div className="bg-gray-900 text-white p-4 text-sm">
        <div className="flex items-center justify-center gap-6">
          <span>🖱️ Left Click + Drag: Rotate</span>
          <span>🖱️ Right Click + Drag: Pan</span>
          <span>🖱️ Scroll: Zoom</span>
          <span>⌨️ Space: Toggle Auto Rotate</span>
        </div>
      </div>
    </div>
  )
}

export default ModelViewer
