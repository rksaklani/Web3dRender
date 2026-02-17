import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, Loader } from '@react-three/drei'
import { FiX, FiZoomIn, FiZoomOut, FiRotateCw, FiHome, FiGlobe, FiMove, FiUser, FiPlus, FiMoon, FiSun, FiCompass, FiImage, FiList, FiHelpCircle, FiSettings, FiLayers, FiNavigation, FiMap, FiCamera, FiVideo } from 'react-icons/fi'
import * as THREE from 'three'
import { annotationsAPI } from '../services/api'
import { showSuccess } from '../utils/toast.jsx'
import AnnotationMarker from './AnnotationMarker'
import AnnotationImages from './AnnotationImages'
import GeoreferencingPanel from './GeoreferencingPanel'
import PhotogrammetryUpload from './PhotogrammetryUpload'
import VolumetricVideoPlayer from './VolumetricVideoPlayer'

// Model Loader Component (same as before)
function Model({ url, onLoad, onModelClick, annotations, selectedAnnotation, onAnnotationClick }) {
  const [model, setModel] = useState(null)
  const groupRef = useRef()
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())

  const { camera, gl } = useThree()

  // Disable auto-rotate - model stays stable
  // useFrame(() => {
  //   if (groupRef.current && model) {
  //     groupRef.current.rotation.y += 0.005
  //   }
  // })

  // Handle model loading (same logic as before)
  useEffect(() => {
    const loadModel = async () => {
      try {
        const extension = url.split('.').pop().toLowerCase()
        let loadedModel = null

        // GLB/GLTF formats
        if (extension === 'glb' || extension === 'gltf') {
          const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
          const loader = new GLTFLoader()
          const gltf = await loader.loadAsync(url)
          loadedModel = gltf.scene
          
          loadedModel.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = false
              child.receiveShadow = false
              if (child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material]
                materials.forEach(mat => {
                  if (mat.map) {
                    mat.map.needsUpdate = true
                    mat.map.flipY = false
                  }
                })
              }
            }
          })
        } 
        // OBJ format
        else if (extension === 'obj') {
          const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js')
          const loader = new OBJLoader()
          loadedModel = await loader.loadAsync(url)
          
          loadedModel.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = false
              child.receiveShadow = false
              if (!child.material || !child.material.map) {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0xcccccc,
                  side: THREE.DoubleSide
                })
              }
            }
          })
        } 
        // FBX format
        else if (extension === 'fbx') {
          const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js')
          const loader = new FBXLoader()
          loadedModel = await loader.loadAsync(url)
          
          loadedModel.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = false
              child.receiveShadow = false
              
              if (!child.geometry) {
                return
              }
              
              if (child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material]
                const newMaterials = materials.map((oldMat) => {
                  const newMat = new THREE.MeshStandardMaterial({
                    side: THREE.DoubleSide,
                    color: oldMat.color ? oldMat.color.getHex() : 0xcccccc,
                  })
                  
                  if (oldMat.map) {
                    newMat.map = oldMat.map.clone()
                    newMat.map.needsUpdate = true
                    newMat.map.flipY = false
                  }
                  if (oldMat.normalMap) {
                    newMat.normalMap = oldMat.normalMap.clone()
                    newMat.normalMap.needsUpdate = true
                  }
                  if (oldMat.roughnessMap) {
                    newMat.roughnessMap = oldMat.roughnessMap.clone()
                    newMat.roughnessMap.needsUpdate = true
                  }
                  if (oldMat.metalnessMap) {
                    newMat.metalnessMap = oldMat.metalnessMap.clone()
                    newMat.metalnessMap.needsUpdate = true
                  }
                  
                  if (oldMat.roughness !== undefined) newMat.roughness = oldMat.roughness
                  if (oldMat.metalness !== undefined) newMat.metalness = oldMat.metalness
                  if (oldMat.emissive) newMat.emissive.copy(oldMat.emissive)
                  
                  newMat.needsUpdate = true
                  return newMat
                })
                
                child.material = Array.isArray(child.material) ? newMaterials : newMaterials[0]
              } else {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0xcccccc,
                  side: THREE.DoubleSide
                })
              }
              
              if (child.geometry) {
                child.geometry.computeVertexNormals()
                child.geometry.computeBoundingBox()
              }
            }
          })
        }
        // STL format
        else if (extension === 'stl') {
          const { STLLoader } = await import('three/examples/jsm/loaders/STLLoader.js')
          const loader = new STLLoader()
          const geometry = await loader.loadAsync(url)
          
          // Create a mesh from STL geometry
          const material = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            side: THREE.DoubleSide
          })
          loadedModel = new THREE.Mesh(geometry, material)
          loadedModel.castShadow = false
          loadedModel.receiveShadow = false
          geometry.computeVertexNormals()
        }
        // DAE (Collada) format
        else if (extension === 'dae') {
          const { ColladaLoader } = await import('three/examples/jsm/loaders/ColladaLoader.js')
          const loader = new ColladaLoader()
          const collada = await loader.loadAsync(url)
          loadedModel = collada.scene
          
          loadedModel.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = false
              child.receiveShadow = false
              if (child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material]
                materials.forEach(mat => {
                  if (mat.map) {
                    mat.map.needsUpdate = true
                    mat.map.flipY = false
                  }
                })
              }
            }
          })
        }
        // PLY format (can be mesh or point cloud)
        else if (extension === 'ply') {
          const { PLYLoader } = await import('three/examples/jsm/loaders/PLYLoader.js')
          const loader = new PLYLoader()
          const geometry = await loader.loadAsync(url)
          
          // Check if it's a point cloud (no faces) or mesh
          if (geometry.attributes.position && !geometry.index && geometry.attributes.position.count < 10000) {
            // Likely a mesh, create material
            const material = new THREE.MeshStandardMaterial({
              color: 0xcccccc,
              side: THREE.DoubleSide,
              vertexColors: geometry.hasAttribute('color')
            })
            loadedModel = new THREE.Mesh(geometry, material)
          } else {
            // Point cloud - render as points
            const material = new THREE.PointsMaterial({
              color: 0xcccccc,
              size: 0.01,
              vertexColors: geometry.hasAttribute('color')
            })
            loadedModel = new THREE.Points(geometry, material)
          }
          loadedModel.castShadow = false
          loadedModel.receiveShadow = false
          geometry.computeVertexNormals()
        }
        // Point cloud formats - XYZ
        else if (extension === 'xyz') {
          // XYZ is a simple text format - we'll create points from it
          const response = await fetch(url)
          const text = await response.text()
          const lines = text.trim().split('\n')
          const vertices = []
          
          for (const line of lines) {
            const parts = line.trim().split(/\s+/)
            if (parts.length >= 3) {
              vertices.push(
                parseFloat(parts[0]),
                parseFloat(parts[1]),
                parseFloat(parts[2])
              )
            }
          }
          
          const geometry = new THREE.BufferGeometry()
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
          const material = new THREE.PointsMaterial({
            color: 0xcccccc,
            size: 0.01
          })
          loadedModel = new THREE.Points(geometry, material)
        }
        // 3DS format
        else if (extension === '3ds') {
          const { TDSLoader } = await import('three/examples/jsm/loaders/TDSLoader.js')
          const loader = new TDSLoader()
          loadedModel = await loader.loadAsync(url)
          
          loadedModel.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = false
              child.receiveShadow = false
              if (child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material]
                materials.forEach(mat => {
                  if (mat.map) {
                    mat.map.needsUpdate = true
                    mat.map.flipY = false
                  }
                })
              }
            }
          })
        }
        // IFC format (BIM) - using web-ifc
        else if (extension === 'ifc') {
          try {
            // Dynamic import with error handling for Vite compatibility
            // Use a try-catch wrapper to handle module resolution gracefully
            let IFCLoader
            let webIfcThreeModule
            
            try {
              // Dynamic import - Vite will handle this at runtime
              webIfcThreeModule = await import('web-ifc-three')
            } catch (importError) {
              // If import fails, provide helpful message
              throw new Error('IFC loader package not available. Please convert IFC to GLB/GLTF format using IfcConvert or Blender.')
            }
            
            // Check for different export patterns
            IFCLoader = webIfcThreeModule.IFCLoader || 
                       webIfcThreeModule.default?.IFCLoader ||
                       (webIfcThreeModule.default && typeof webIfcThreeModule.default === 'function' ? webIfcThreeModule.default : null)
            
            if (!IFCLoader || typeof IFCLoader !== 'function') {
              throw new Error('IFC loader class not found. Please convert IFC to GLB/GLTF format.')
            }
            
            const ifcLoader = new IFCLoader()
            
            // Set WASM path for web-ifc
            const wasmPath = 'https://unpkg.com/web-ifc@0.0.53/'
            if (ifcLoader.ifcManager && typeof ifcLoader.ifcManager.setWasmPath === 'function') {
              ifcLoader.ifcManager.setWasmPath(wasmPath)
            }
            
            loadedModel = await ifcLoader.loadAsync(url)
            
            if (loadedModel) {
              loadedModel.traverse((child) => {
                if (child.isMesh) {
                  child.castShadow = false
                  child.receiveShadow = false
                }
              })
            } else {
              throw new Error('IFC file loaded but no model was created')
            }
          } catch (ifcError) {
            // Provide helpful error message
            const errorMsg = ifcError.message || 'Unknown error'
            throw new Error(`IFC file loading failed: ${errorMsg}. IFC files are complex BIM formats. For best results, convert to GLB/GLTF using IfcConvert, Blender, or other BIM conversion tools.`)
          }
        }
        // Point cloud formats - LAS/LAZ
        else if (extension === 'las' || extension === 'laz') {
          try {
            // Use fetch to get the file as array buffer
            const response = await fetch(url)
            const arrayBuffer = await response.arrayBuffer()
            
            // Parse LAS/LAZ file (simplified parser - for full support, use laslaz-loader)
            // For now, we'll create a basic point cloud representation
            const points = []
            const colors = []
            
            // LAS file format parsing (simplified)
            // Note: Full LAS/LAZ parsing requires specialized libraries
            // This is a basic implementation
            const dataView = new DataView(arrayBuffer)
            
            // Check LAS header (starts with "LASF")
            const header = String.fromCharCode(
              dataView.getUint8(0),
              dataView.getUint8(1),
              dataView.getUint8(2),
              dataView.getUint8(3)
            )
            
            if (header === 'LASF') {
              // Handle LAZ (compressed) - would need decompression library
              if (extension === 'laz') {
                throw new Error('LAZ (compressed LAS) format requires decompression. Please convert to LAS or PLY format using PDAL, CloudCompare, or laszip.')
              }
              
              // Parse LAS format
              const pointDataOffset = dataView.getUint32(32, true)
              const pointDataFormat = dataView.getUint8(104)
              const pointDataRecordLength = dataView.getUint16(105, true)
              const numPoints = dataView.getUint32(107, true)
              
              // Read scale and offset from header
              const scaleX = dataView.getFloat64(131, true) || 0.01
              const scaleY = dataView.getFloat64(139, true) || 0.01
              const scaleZ = dataView.getFloat64(147, true) || 0.01
              const offsetX = dataView.getFloat64(155, true) || 0
              const offsetY = dataView.getFloat64(163, true) || 0
              const offsetZ = dataView.getFloat64(171, true) || 0
              
              // Limit points for performance (sample if too many)
              const maxPoints = 500000
              const step = numPoints > maxPoints ? Math.ceil(numPoints / maxPoints) : 1
              
              for (let i = 0; i < numPoints; i += step) {
                const offset = pointDataOffset + (i * pointDataRecordLength)
                if (offset + pointDataRecordLength > arrayBuffer.byteLength) break
                
                // Read coordinates (format-dependent)
                let x, y, z
                if (pointDataFormat === 0 || pointDataFormat === 1 || pointDataFormat === 2) {
                  x = dataView.getInt32(offset, true) * scaleX + offsetX
                  y = dataView.getInt32(offset + 4, true) * scaleY + offsetY
                  z = dataView.getInt32(offset + 8, true) * scaleZ + offsetZ
                } else {
                  // For other formats, try different reading methods
                  x = dataView.getInt32(offset, true) * scaleX + offsetX
                  y = dataView.getInt32(offset + 4, true) * scaleY + offsetY
                  z = dataView.getInt32(offset + 8, true) * scaleZ + offsetZ
                }
                
                points.push(x, y, z)
                
                // Read color if available (formats 2, 3, 5, 7, 8, 10)
                if ([2, 3, 5, 7, 8, 10].includes(pointDataFormat)) {
                  const r = dataView.getUint16(offset + 20, true) / 65535
                  const g = dataView.getUint16(offset + 22, true) / 65535
                  const b = dataView.getUint16(offset + 24, true) / 65535
                  colors.push(r, g, b)
                } else {
                  colors.push(0.8, 0.8, 0.8)
                }
              }
              
              if (points.length === 0) {
                throw new Error('No points found in LAS file')
              }
            } else {
              throw new Error('Invalid LAS file format - header does not match')
            }
            
            const geometry = new THREE.BufferGeometry()
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
            
            const material = new THREE.PointsMaterial({
              size: 0.02,
              vertexColors: true,
              sizeAttenuation: true
            })
            
            loadedModel = new THREE.Points(geometry, material)
          } catch (lasError) {
            throw new Error(`LAS/LAZ file loading failed: ${lasError.message}. For compressed LAZ files, please convert to LAS or PLY format first.`)
          }
        }
        // E57 point cloud format (ASTM E57)
        else if (extension === 'e57') {
          try {
            const response = await fetch(url)
            const arrayBuffer = await response.arrayBuffer()
            const text = new TextDecoder().decode(arrayBuffer)
            
            // E57 files can be binary or XML - try XML first
            if (text.includes('<?xml') || text.includes('<e57')) {
              // XML-based E57
              const parser = new DOMParser()
              const xmlDoc = parser.parseFromString(text, 'text/xml')
              
              const points = []
              const colors = []
              
              // E57 structure: <e57><data3D><points>
              const pointNodes = xmlDoc.getElementsByTagName('point')
              
              if (pointNodes.length > 0) {
                for (let i = 0; i < Math.min(pointNodes.length, 500000); i++) {
                  const point = pointNodes[i]
                  const x = parseFloat(point.getAttribute('x') || point.getAttribute('cartesianX') || '0')
                  const y = parseFloat(point.getAttribute('y') || point.getAttribute('cartesianY') || '0')
                  const z = parseFloat(point.getAttribute('z') || point.getAttribute('cartesianZ') || '0')
                  
                  if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                    points.push(x, y, z)
                    
                    const r = parseFloat(point.getAttribute('red') || '204') / 255
                    const g = parseFloat(point.getAttribute('green') || '204') / 255
                    const b = parseFloat(point.getAttribute('blue') || '204') / 255
                    colors.push(r, g, b)
                  }
                }
              } else {
                // Try binary E57 format - would need specialized parser
                throw new Error('Binary E57 format detected. Please convert to PLY or XYZ format for web viewing.')
              }
              
              if (points.length === 0) {
                throw new Error('No points found in E57 file. The file may be in binary format or corrupted.')
              }
              
              const geometry = new THREE.BufferGeometry()
              geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
              geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
              
              const material = new THREE.PointsMaterial({
                size: 0.01,
                vertexColors: true
              })
              
              loadedModel = new THREE.Points(geometry, material)
            } else {
              // Binary E57 - too complex for direct parsing
              throw new Error('Binary E57 format detected. Please convert to PLY, XYZ, or LAS format using CloudCompare or PDAL.')
            }
          } catch (e57Error) {
            throw new Error(`E57 file loading failed: ${e57Error.message}. For binary E57 files, please convert to PLY or XYZ format first.`)
          }
        }
        // PTS point cloud format
        else if (extension === 'pts') {
          const response = await fetch(url)
          const text = await response.text()
          const lines = text.trim().split('\n')
          const points = []
          const colors = []
          
          for (const line of lines) {
            const parts = line.trim().split(/\s+/)
            if (parts.length >= 3) {
              points.push(
                parseFloat(parts[0]),
                parseFloat(parts[1]),
                parseFloat(parts[2])
              )
              
              // PTS can have RGB values
              if (parts.length >= 6) {
                colors.push(
                  parseFloat(parts[3]) / 255,
                  parseFloat(parts[4]) / 255,
                  parseFloat(parts[5]) / 255
                )
              } else {
                colors.push(0.8, 0.8, 0.8)
              }
            }
          }
          
          const geometry = new THREE.BufferGeometry()
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
          geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
          
          const material = new THREE.PointsMaterial({
            size: 0.01,
            vertexColors: true
          })
          
          loadedModel = new THREE.Points(geometry, material)
        }
        // RCP/RCS (ReCap) - Autodesk ReCap format
        else if (extension === 'rcp' || extension === 'rcs') {
          try {
            // RCP is a project file, RCS is a scan file
            // These are proprietary formats - try to extract point data
            const response = await fetch(url)
            const arrayBuffer = await response.arrayBuffer()
            
            // RCP/RCS files are binary - attempt basic parsing
            // Note: Full support requires Autodesk ReCap SDK
            const dataView = new DataView(arrayBuffer)
            const points = []
            const colors = []
            
            // Try to find point data patterns (this is a simplified approach)
            // RCP files contain references to RCS files
            if (extension === 'rcp') {
              throw new Error('RCP is a project file format. Please export individual scans as RCS, PLY, or LAS format from Autodesk ReCap.')
            }
            
            // For RCS, try to parse point cloud data
            // RCS format structure is complex - this is a basic attempt
            let pointCount = 0
            const maxPoints = 500000
            
            // Look for point data patterns in binary
            for (let i = 0; i < arrayBuffer.byteLength - 12 && pointCount < maxPoints; i += 4) {
              // Try to read as float coordinates
              try {
                const x = dataView.getFloat32(i, true)
                const y = dataView.getFloat32(i + 4, true)
                const z = dataView.getFloat32(i + 8, true)
                
                // Validate coordinates (reasonable range)
                if (!isNaN(x) && !isNaN(y) && !isNaN(z) &&
                    Math.abs(x) < 100000 && Math.abs(y) < 100000 && Math.abs(z) < 100000) {
                  points.push(x, y, z)
                  colors.push(0.8, 0.8, 0.8)
                  pointCount++
                  i += 11 // Skip ahead
                }
              } catch (e) {
                // Continue searching
              }
            }
            
            if (points.length === 0) {
              throw new Error('Could not parse RCS file. Please export from Autodesk ReCap as PLY, LAS, or XYZ format.')
            }
            
            const geometry = new THREE.BufferGeometry()
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
            
            const material = new THREE.PointsMaterial({
              size: 0.01,
              vertexColors: true
            })
            
            loadedModel = new THREE.Points(geometry, material)
          } catch (rcpError) {
            throw new Error(`RCP/RCS file loading failed: ${rcpError.message}. Please use Autodesk ReCap to export as PLY, LAS, or XYZ format.`)
          }
        }
        // USD/USDZ formats - Universal Scene Description
        else if (extension === 'usd' || extension === 'usdz') {
          try {
            // USD is a complex format - try to use Three.js USD loader if available
            // For now, attempt basic parsing or suggest conversion
            if (extension === 'usdz') {
              // USDZ is a zip file containing USD
              // Would need to unzip and parse - complex
              throw new Error('USDZ (compressed USD) format requires conversion. Please convert to GLB or GLTF using Blender, USD Composer, or online converters.')
            } else {
              // USD is text-based - try to parse
              const response = await fetch(url)
              const text = await response.text()
              
              // USD files are text-based - very complex format
              // For now, suggest conversion
              throw new Error('USD format is complex and requires specialized tools. Please convert to GLB or GLTF format using Blender (with USD addon) or USD Composer.')
            }
          } catch (usdError) {
            throw new Error(`USD/USDZ file loading failed: ${usdError.message}`)
          }
        }
        // BIM formats - RVT, NWD, NWC, DWG
        else if (extension === 'rvt') {
          throw new Error('RVT (Autodesk Revit) format requires conversion. Please export from Revit as IFC, GLB, GLTF, or OBJ format.')
        }
        else if (extension === 'nwd' || extension === 'nwc') {
          throw new Error('NWD/NWC (Autodesk Navisworks) format requires conversion. Please export from Navisworks as GLB, GLTF, or OBJ format.')
        }
        else if (extension === 'dwg') {
          throw new Error('DWG (AutoCAD) format requires conversion. Please export from AutoCAD as GLB, GLTF, OBJ, or DXF format.')
        }
        // Image formats - show as texture on a plane (for annotation images)
        else if (['jpg', 'jpeg', 'png', 'tiff', 'tif'].includes(extension)) {
          const textureLoader = new THREE.TextureLoader()
          const texture = await new Promise((resolve, reject) => {
            textureLoader.load(url, resolve, undefined, reject)
          })
          
          // Create a plane with the image texture
          const geometry = new THREE.PlaneGeometry(texture.image.width / 100, texture.image.height / 100)
          const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
          loadedModel = new THREE.Mesh(geometry, material)
        }
        // Unsupported format
        else {
          throw new Error(`Format .${extension} is not directly supported. Please convert to GLB, GLTF, OBJ, FBX, or STL format.`)
        }

        if (loadedModel) {
          // Center and scale the model
          const box = new THREE.Box3().setFromObject(loadedModel)
          const center = box.getCenter(new THREE.Vector3())
          const size = box.getSize(new THREE.Vector3())
          const maxDim = Math.max(size.x, size.y, size.z)
          
          if (maxDim > 0) {
            const scale = 2 / maxDim
            loadedModel.scale.multiplyScalar(scale)
            loadedModel.position.sub(center.multiplyScalar(scale))
          }

          setModel(loadedModel)
          if (onLoad) onLoad()
        } else {
          throw new Error('Failed to load model. The file format may not be supported or the file may be corrupted.')
        }
        } catch (error) {
          // Show user-friendly error message
          console.error('Model loading error:', error)
          // Error will be handled by the error state display
          console.error('Model loading error:', error)
        }
    }

    loadModel()
  }, [url, onLoad])

  // Handle click on model to add annotation - get surface position and normal
  const handleClick = (event) => {
    event.stopPropagation()
    if (onModelClick && model) {
      const intersection = event.intersections[0]
      if (intersection) {
        const worldPosition = intersection.point
        
        // Get surface normal - transform it to world space
        let faceNormal = null
        if (intersection.face && intersection.object) {
          // Get the face normal in local space
          const localNormal = intersection.face.normal.clone()
          
          // Transform normal from local to world space
          const normalMatrix = new THREE.Matrix3().getNormalMatrix(intersection.object.matrixWorld)
          faceNormal = localNormal.applyMatrix3(normalMatrix).normalize()
        }
        
        onModelClick({
          x: worldPosition.x,
          y: worldPosition.y,
          z: worldPosition.z,
          normal: faceNormal ? {
            x: faceNormal.x,
            y: faceNormal.y,
            z: faceNormal.z
          } : null
        })
      }
    }
  }

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
      <primitive object={model} onClick={handleClick} />
      
      {/* Render annotation markers */}
      {annotations && annotations.map((annotation) => (
        <AnnotationMarker
          key={annotation.id}
          annotation={annotation}
          isSelected={selectedAnnotation?.id === annotation.id}
          onClick={() => onAnnotationClick(annotation)}
        />
      ))}
    </group>
  )
}

const AnnotationViewer = ({ isOpen, onClose, modelUrl, modelName, modelId }) => {
  const [autoRotate, setAutoRotate] = useState(false)
  const [annotations, setAnnotations] = useState([])
  const [selectedAnnotation, setSelectedAnnotation] = useState(null)
  const [showAddMarker, setShowAddMarker] = useState(false)
  const [clickPosition, setClickPosition] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [viewMode, setViewMode] = useState('3d') // '3d', 'pan', 'walkthrough', 'flythrough'
  const [showImages, setShowImages] = useState(false)
  const [showList, setShowList] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showCompass, setShowCompass] = useState(true)
  const [compassRotation, setCompassRotation] = useState(0)
  const [georeferencing, setGeoreferencing] = useState(null)
  const [showMap, setShowMap] = useState(false)
  const [showGeoreferencingPanel, setShowGeoreferencingPanel] = useState(false)
  const [showPhotogrammetryUpload, setShowPhotogrammetryUpload] = useState(false)
  const [showVolumetricPlayer, setShowVolumetricPlayer] = useState(false)
  const [modelData, setModelData] = useState(null)
  const controlsRef = useRef()

  // Load annotations and georeferencing when model opens
  useEffect(() => {
    if (isOpen && modelId) {
      loadAnnotations()
      loadGeoreferencing()
      loadModelData()
    }
  }, [isOpen, modelId])

  const loadAnnotations = async () => {
    try {
      const response = await annotationsAPI.getByModel(modelId)
      setAnnotations(response.data)
    } catch (error) {
      // Silently handle annotation loading errors
    }
  }

  const loadGeoreferencing = async () => {
    try {
      const { modelsAPI } = await import('../services/api')
      const response = await modelsAPI.getOne(modelId)
      if (response.data) {
        const model = response.data
        setModelData(model)
        if (model.crs || model.origin_lat || model.origin_lon) {
          setGeoreferencing({
            crs: model.crs,
            origin_lat: model.origin_lat,
            origin_lon: model.origin_lon,
            origin_altitude: model.origin_altitude
          })
        }
      }
    } catch (error) {
      // Silently handle georeferencing loading errors
    }
  }

  const loadModelData = async () => {
    try {
      const { modelsAPI } = await import('../services/api')
      const response = await modelsAPI.getOne(modelId)
      if (response.data) {
        setModelData(response.data)
      }
    } catch (error) {
      // Silently handle model data loading errors
    }
  }

  const handleModelClick = (position) => {
    if (showAddMarker) {
      setClickPosition(position)
      // Open add annotation modal
      const title = prompt('Enter annotation title (e.g., "Crack Detection"):')
      if (title) {
        createAnnotation(position, title)
      }
      setShowAddMarker(false)
    }
  }

  const createAnnotation = async (position, title) => {
    try {
      setLoading(true)
      const response = await annotationsAPI.create({
        model_id: modelId,
        title: title,
        description: '',
        position_x: position.x,
        position_y: position.y,
        position_z: position.z,
        normal_x: position.normal?.x || null,
        normal_y: position.normal?.y || null,
        normal_z: position.normal?.z || null,
        color: '#FF0000',
        annotation_type: 'marker'
      })
      await loadAnnotations()
      setSelectedAnnotation(response.data)
    } catch (error) {
      // Silently handle annotation creation errors
    } finally {
      setLoading(false)
    }
  }

  const handleAnnotationClick = async (annotation) => {
    // Load full annotation with images
    try {
      const response = await annotationsAPI.getOne(annotation.id)
      setSelectedAnnotation(response.data)
      
      // If no images, still show the annotation as selected
      if (!response.data.images || response.data.images.length === 0) {
        setSelectedAnnotation(response.data)
      }
    } catch (error) {
      // Fallback to annotation data we already have
      setSelectedAnnotation(annotation)
    }
  }

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
    setSelectedAnnotation(null)
  }

  // Update OrbitControls when autoRotate changes
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate
      if (autoRotate) {
        controlsRef.current.update()
      }
    }
  }, [autoRotate])

  if (!isOpen || !modelUrl) return null

  const bgColor = isDarkMode ? '#000000' : '#ffffff'
  const bgClass = isDarkMode ? 'bg-black' : 'bg-white'
  const headerBg = isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-r from-gray-50 to-white'
  const headerText = isDarkMode ? 'text-white' : 'text-gray-900'
  const sidebarBg = isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-b from-gray-50 to-white'
  const sidebarBorder = isDarkMode ? 'border-gray-700' : 'border-gray-200'
  const buttonHover = isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
  const iconColor = isDarkMode ? 'text-white' : 'text-gray-700'
  const footerBg = isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-r from-gray-50 to-white'
  const footerText = isDarkMode ? 'text-white' : 'text-gray-700'
  const footerBorder = isDarkMode ? 'border-gray-700' : 'border-gray-200'

  return (
    <div className={`fixed inset-0 ${bgClass} z-50 flex flex-col transition-colors duration-300`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 ${headerBg} border-b ${sidebarBorder} ${headerText} shadow-sm transition-colors duration-300`}>
        <h2 className="text-xl font-bold">{modelName || '3D Model Viewer'}</h2>
        <div className="flex items-center gap-4">
          {/* Georeferencing controls */}
          {georeferencing && (
            <>
              <button
                onClick={() => setShowMap(!showMap)}
                className={`p-2 ${buttonHover} rounded-lg transition-colors ${iconColor} flex items-center gap-2 ${showMap ? 'bg-blue-600 text-white' : ''}`}
                title="Toggle Map View"
              >
                <FiNavigation size={18} />
                <span className="text-sm">Map</span>
              </button>
              <button
                onClick={() => setShowGeoreferencingPanel(true)}
                className={`p-2 ${buttonHover} rounded-lg transition-colors ${iconColor}`}
                title="Edit Georeferencing"
              >
                <FiMap size={18} />
              </button>
            </>
          )}
          {/* Model type specific buttons */}
          {modelData?.model_type === 'photogrammetry' && (
            <button
              onClick={() => setShowPhotogrammetryUpload(true)}
              className={`p-2 ${buttonHover} rounded-lg transition-colors ${iconColor}`}
              title="Photogrammetry Tools"
            >
              <FiCamera size={18} />
            </button>
          )}
          {modelData?.model_type === 'volumetric_video' && (
            <button
              onClick={() => setShowVolumetricPlayer(true)}
              className={`p-2 ${buttonHover} rounded-lg transition-colors ${iconColor}`}
              title="Play Volumetric Video"
            >
              <FiVideo size={18} />
            </button>
          )}
          {/* Compass (Top Right) */}
          {showCompass && (
            <div className="relative">
              <div 
                className={`p-2 ${buttonHover} rounded-lg transition-colors ${iconColor} flex items-center justify-center`}
                style={{ transform: `rotate(${compassRotation}deg)` }}
                title="Compass (North)"
              >
                <FiCompass size={20} className={isDarkMode ? 'text-red-400' : 'text-red-600'} />
              </div>
            </div>
          )}
          <label className={`flex items-center gap-2 p-2 ${buttonHover} rounded-lg transition-colors cursor-pointer ${iconColor}`}>
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
            className={`p-2 ${isDarkMode ? 'hover:bg-red-900' : 'hover:bg-red-100'} rounded-lg transition-colors ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}
            title="Close"
          >
            <FiX size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className={`w-16 ${sidebarBg} border-r ${sidebarBorder} flex flex-col items-center py-4 gap-4 transition-colors duration-300`}>
          <button
            onClick={handleReset}
            className={`p-3 ${buttonHover} rounded-lg transition-colors`}
            title="Home"
          >
            <FiHome size={24} className={iconColor} />
          </button>
          <button
            onClick={() => setViewMode('3d')}
            className={`p-3 rounded-lg transition-colors ${
              viewMode === '3d'
                ? 'bg-blue-600 text-white'
                : `${buttonHover} ${iconColor}`
            }`}
            title="3D View"
          >
            <FiGlobe size={24} />
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'pan' ? '3d' : 'pan')}
            className={`p-3 rounded-lg transition-colors ${
              viewMode === 'pan'
                ? 'bg-blue-600 text-white'
                : `${buttonHover} ${iconColor}`
            }`}
            title="Pan"
          >
            <FiMove size={24} />
          </button>
          <button
            onClick={handleZoomIn}
            className={`p-3 ${buttonHover} rounded-lg transition-colors`}
            title="Zoom"
          >
            <FiZoomIn size={24} className={iconColor} />
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'walkthrough' ? '3d' : 'walkthrough')}
            className={`p-3 rounded-lg transition-colors ${
              viewMode === 'walkthrough'
                ? 'bg-blue-600 text-white'
                : `${buttonHover} ${iconColor}`
            }`}
            title="Walkthrough"
          >
            <FiUser size={24} />
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'flythrough' ? '3d' : 'flythrough')}
            className={`p-3 rounded-lg transition-colors ${
              viewMode === 'flythrough'
                ? 'bg-blue-600 text-white'
                : `${buttonHover} ${iconColor}`
            }`}
            title="Flythrough"
          >
            <FiNavigation size={24} />
          </button>
          <button
            onClick={() => setShowAddMarker(!showAddMarker)}
            className={`p-3 rounded-lg transition-colors ${
              showAddMarker 
                ? 'bg-blue-600 text-white' 
                : `${buttonHover} ${iconColor}`
            }`}
            title="Add Marker"
          >
            <FiPlus size={24} />
          </button>
        </div>

        {/* 3D Canvas */}
        <div className={`flex-1 relative ${bgClass} transition-colors duration-300`}>
          <Canvas 
            gl={{ 
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.2,
              outputColorSpace: THREE.SRGBColorSpace || 'srgb',
              powerPreference: 'high-performance',
              stencil: false,
              depth: true,
              alpha: false,
              clearColor: isDarkMode ? 0x000000 : 0xffffff
            }}
            style={{ background: bgColor, transition: 'background-color 0.3s ease' }}
          >
            <PerspectiveCamera makeDefault position={[0, 0, 5]} />
            
            {/* Dynamic background */}
            <color attach="background" args={[bgColor]} />
            
            <ambientLight intensity={1.2} />
            <directionalLight position={[5, 5, 5]} intensity={1.5} />
            <directionalLight position={[-5, 5, -5]} intensity={0.8} />
            <pointLight position={[0, 10, 0]} intensity={0.5} />
            <hemisphereLight 
              skyColor={isDarkMode ? 0x222222 : 0xffffff} 
              groundColor={isDarkMode ? 0x000000 : 0xeeeeee} 
              intensity={isDarkMode ? 0.4 : 0.8} 
            />

            <Environment preset={isDarkMode ? "night" : "studio"} />

            <Suspense fallback={null}>
              <Model 
                url={modelUrl} 
                annotations={annotations}
                selectedAnnotation={selectedAnnotation}
                onAnnotationClick={handleAnnotationClick}
                onModelClick={showAddMarker ? handleModelClick : undefined}
              />
            </Suspense>

            <OrbitControls
              ref={controlsRef}
              enableDamping
              dampingFactor={0.05}
              autoRotate={autoRotate}
              autoRotateSpeed={1.0}
              minDistance={1}
              maxDistance={10}
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
            />
          </Canvas>
          <Loader />
          
          {showAddMarker && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg border-2 border-blue-500">
              Click on the model to add a marker
            </div>
          )}

          {/* Bottom Right Icons */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-3 z-10">
            <button
              onClick={() => {
                setShowImages(!showImages)
                if (!showImages && selectedAnnotation) {
                  setShowList(false)
                }
              }}
              className={`p-3 ${buttonHover} rounded-lg transition-colors ${iconColor} shadow-lg ${
                showImages ? 'bg-blue-600 text-white' : ''
              }`}
              title="Gallery"
            >
              <FiImage size={20} />
            </button>
            <button
              onClick={() => {
                setShowList(!showList)
                if (!showList) {
                  setShowImages(false)
                }
              }}
              className={`p-3 ${buttonHover} rounded-lg transition-colors ${iconColor} shadow-lg ${
                showList ? 'bg-blue-600 text-white' : ''
              }`}
              title="Annotations List"
            >
              <FiList size={20} />
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-3 ${buttonHover} rounded-lg transition-colors ${iconColor} shadow-lg`}
              title="Lighting"
            >
              <FiSun size={20} />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-3 ${buttonHover} rounded-lg transition-colors ${iconColor} shadow-lg ${
                showSettings ? 'bg-blue-600 text-white' : ''
              }`}
              title="Settings"
            >
              <FiSettings size={20} />
            </button>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className={`p-3 ${buttonHover} rounded-lg transition-colors ${iconColor} shadow-lg ${
                showHelp ? 'bg-blue-600 text-white' : ''
              }`}
              title="Help"
            >
              <FiHelpCircle size={20} />
            </button>
          </div>

          {/* Bottom Left - Powered By */}
          <div className="absolute bottom-4 left-4 z-10">
            <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-700'} opacity-70`}>
              POWERED BY <span className={isDarkMode ? 'text-blue-400' : 'bg-gradient-to-r from-blue-600 to-blue-500 text-transparent bg-clip-text'}>Web3DRender</span>
            </p>
          </div>
        </div>
      </div>

      {/* Annotations List Panel */}
      {showList && (
        <div className={`absolute right-4 top-20 bottom-20 w-80 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-2xl border ${sidebarBorder} z-20 overflow-hidden flex flex-col`}>
          <div className={`p-4 border-b ${sidebarBorder} flex items-center justify-between`}>
            <h3 className={`text-lg font-bold ${iconColor}`}>Annotations</h3>
            <button
              onClick={() => setShowList(false)}
              className={`p-1 ${buttonHover} rounded ${iconColor}`}
            >
              <FiX size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {annotations.length === 0 ? (
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center py-8`}>
                No annotations yet
              </p>
            ) : (
              <div className="space-y-2">
                {annotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    onClick={() => {
                      handleAnnotationClick(annotation)
                      setShowList(false)
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedAnnotation?.id === annotation.id
                        ? 'bg-blue-600 text-white'
                        : `${buttonHover} ${iconColor}`
                    }`}
                  >
                    <div className="font-semibold">{annotation.title}</div>
                    {annotation.description && (
                      <div className="text-xs opacity-75 mt-1">{annotation.description}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className={`absolute right-4 top-20 w-80 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-2xl border ${sidebarBorder} z-20 overflow-hidden`}>
          <div className={`p-4 border-b ${sidebarBorder} flex items-center justify-between`}>
            <h3 className={`text-lg font-bold ${iconColor}`}>Settings</h3>
            <button
              onClick={() => setShowSettings(false)}
              className={`p-1 ${buttonHover} rounded ${iconColor}`}
            >
              <FiX size={18} />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className={`flex items-center justify-between ${iconColor}`}>
                <span>Background</span>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`px-3 py-1 rounded ${buttonHover}`}
                >
                  {isDarkMode ? 'Dark' : 'Light'}
                </button>
              </label>
            </div>
            <div>
              <label className={`flex items-center justify-between ${iconColor}`}>
                <span>Compass</span>
                <button
                  onClick={() => setShowCompass(!showCompass)}
                  className={`px-3 py-1 rounded ${buttonHover}`}
                >
                  {showCompass ? 'On' : 'Off'}
                </button>
              </label>
            </div>
            <div>
              <label className={`flex items-center justify-between ${iconColor}`}>
                <span>Auto Rotate</span>
                <input
                  type="checkbox"
                  checked={autoRotate}
                  onChange={(e) => setAutoRotate(e.target.checked)}
                  className="w-4 h-4"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Help Panel */}
      {showHelp && (
        <div className={`absolute right-4 top-20 w-96 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-2xl border ${sidebarBorder} z-20 overflow-hidden`}>
          <div className={`p-4 border-b ${sidebarBorder} flex items-center justify-between`}>
            <h3 className={`text-lg font-bold ${iconColor}`}>Help & Controls</h3>
            <button
              onClick={() => setShowHelp(false)}
              className={`p-1 ${buttonHover} rounded ${iconColor}`}
            >
              <FiX size={18} />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <h4 className={`font-semibold mb-2 ${iconColor}`}>Mouse Controls</h4>
              <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>• Left Click + Drag: Rotate model</li>
                <li>• Right Click + Drag: Pan model</li>
                <li>• Scroll Wheel: Zoom in/out</li>
                <li>• Click Marker: View annotation details</li>
              </ul>
            </div>
            <div>
              <h4 className={`font-semibold mb-2 ${iconColor}`}>Toolbar</h4>
              <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>• Home: Reset camera to default view</li>
                <li>• Globe: Switch to 3D view mode</li>
                <li>• Pan: Enable panning mode</li>
                <li>• Zoom: Zoom controls</li>
                <li>• Walkthrough: First-person walk mode</li>
                <li>• Flythrough: Free-fly camera mode</li>
                <li>• Add Marker: Click model to add annotation</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Annotation Images Panel - Show even if no images to indicate selection */}
      {selectedAnnotation && (
        <AnnotationImages 
          annotation={selectedAnnotation}
          onClose={() => setSelectedAnnotation(null)}
        />
      )}

      {/* Map Overlay */}
      {showMap && georeferencing && (
        <div className="absolute top-20 right-4 w-96 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-20 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Map View</h3>
            <button
              onClick={() => setShowMap(false)}
              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
            >
              <FiX size={18} />
            </button>
          </div>
          <div className="h-full bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <FiMap size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Map integration coming soon</p>
              <p className="text-xs mt-1">
                Origin: {georeferencing.origin_lat?.toFixed(6)}, {georeferencing.origin_lon?.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Georeferencing Panel */}
      {showGeoreferencingPanel && (
        <GeoreferencingPanel
          modelId={modelId}
          isOpen={showGeoreferencingPanel}
          onClose={() => setShowGeoreferencingPanel(false)}
          onUpdate={() => {
            loadGeoreferencing()
            setShowGeoreferencingPanel(false)
          }}
        />
      )}

      {/* Photogrammetry Upload */}
      {showPhotogrammetryUpload && modelData && (
        <PhotogrammetryUpload
          modelId={modelId}
          projectId={modelData.project_id}
          isOpen={showPhotogrammetryUpload}
          onClose={() => setShowPhotogrammetryUpload(false)}
          onSuccess={() => {
            setShowPhotogrammetryUpload(false)
            showSuccess('Photogrammetry project created successfully')
          }}
        />
      )}

      {/* Volumetric Video Player */}
      {showVolumetricPlayer && (
        <VolumetricVideoPlayer
          modelId={modelId}
          isOpen={showVolumetricPlayer}
          onClose={() => setShowVolumetricPlayer(false)}
        />
      )}

      {/* Instructions */}
      <div className={`${footerBg} border-t ${footerBorder} ${footerText} p-4 text-sm shadow-sm transition-colors duration-300`}>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Left Click + Drag: Rotate
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Right Click + Drag: Pan
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            Scroll: Zoom
          </span>
          {showAddMarker && (
            <span className={`flex items-center gap-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} font-semibold`}>
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              Click model to add marker
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnnotationViewer
