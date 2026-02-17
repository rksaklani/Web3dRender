import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const AnnotationMarker = ({ annotation, isSelected, onClick }) => {
  const markerRef = useRef()
  const dotRef = useRef()
  const { camera } = useThree()

  // Parse color - use red or orange like Web3DRender
  const color = annotation.color || (annotation.annotation_type === 'crack' ? '#FF6B35' : '#FF0000')
  
  // 3D position from database
  const basePosition = useMemo(() => new THREE.Vector3(
    annotation.position_x,
    annotation.position_y,
    annotation.position_z
  ), [annotation.position_x, annotation.position_y, annotation.position_z])

  // Calculate surface normal - use stored normal or default to up vector
  const normal = useMemo(() => {
    if (annotation.normal_x !== null && annotation.normal_x !== undefined &&
        annotation.normal_y !== null && annotation.normal_y !== undefined &&
        annotation.normal_z !== null && annotation.normal_z !== undefined) {
      return new THREE.Vector3(
        annotation.normal_x,
        annotation.normal_y,
        annotation.normal_z
      ).normalize()
    }
    // Default to up vector if no normal stored
    return new THREE.Vector3(0, 0, 1)
  }, [annotation.normal_x, annotation.normal_y, annotation.normal_z])

  // Offset along normal to sit on surface
  const offset = 0.005
  const surfacePosition = useMemo(() => {
    return basePosition.clone().add(normal.clone().multiplyScalar(offset))
  }, [basePosition, normal, offset])

  // Subtle pulse animation
  useFrame((state) => {
    if (markerRef.current && dotRef.current) {
      // Make marker face camera (billboard effect) but keep it oriented to surface
      const cameraDirection = camera.position.clone().sub(surfacePosition).normalize()
      
      // Create a rotation that faces camera but respects surface orientation
      // We want the marker to be perpendicular to the surface normal
      const right = new THREE.Vector3().crossVectors(normal, cameraDirection).normalize()
      const up = new THREE.Vector3().crossVectors(right, normal).normalize()
      
      // Build rotation matrix
      const matrix = new THREE.Matrix4()
      matrix.makeBasis(right, up, normal.clone().negate())
      markerRef.current.setRotationFromMatrix(matrix)
      
      // Dot always faces camera
      dotRef.current.lookAt(camera.position)
      
      // Very subtle pulse animation
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.03
      markerRef.current.scale.setScalar(pulse)
      dotRef.current.scale.setScalar(pulse)
    }
  })

  const handleClick = (e) => {
    e.stopPropagation()
    if (onClick) onClick()
  }

  return (
    <group position={surfacePosition.toArray()}>
      {/* Outer ring - positioned in 3D space on surface */}
      <mesh 
        ref={markerRef} 
        onClick={handleClick}
      >
        <ringGeometry args={[0.03, 0.04, 32]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={isSelected ? 0.9 : 0.75}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      
      {/* Center dot */}
      <mesh 
        ref={dotRef}
        onClick={handleClick}
      >
        <circleGeometry args={[0.015, 32]} />
        <meshBasicMaterial 
          color={color} 
          transparent
          opacity={isSelected ? 1 : 0.9}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      
      {/* Selection highlight ring */}
      {isSelected && (
        <mesh>
          <ringGeometry args={[0.045, 0.055, 32]} />
          <meshBasicMaterial 
            color="#FFFF00" 
            transparent 
            opacity={0.5}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  )
}

export default AnnotationMarker
