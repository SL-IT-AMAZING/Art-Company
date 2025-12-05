import VoxelSkylight from './VoxelSkylight'
import type { GalleryDimensions } from '@/lib/utils/galleryLayout'

interface VoxelGalleryRoomProps {
  dimensions: GalleryDimensions
}

/**
 * Realistic gallery room with smooth walls, textured floor, and skylights
 * Creates a professional contemporary art gallery space
 */
export default function VoxelGalleryRoom({ dimensions }: VoxelGalleryRoomProps) {
  const { width, height, depth } = dimensions
  const wallThickness = 0.3

  return (
    <group>
      {/* Floor - realistic concrete texture */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial
          color="#d4c4b0"
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* North Wall (facing south, -Z) */}
      <mesh position={[0, height / 2, -depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[width, height, wallThickness]} />
        <meshStandardMaterial
          color="#f8f8f8"
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* East Wall (facing west, +X) */}
      <mesh position={[width / 2, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial
          color="#f8f8f8"
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* West Wall (facing east, -X) */}
      <mesh position={[-width / 2, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial
          color="#f8f8f8"
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* Realistic Skylight Ceiling */}
      <VoxelSkylight width={width} depth={depth} height={height} />

      {/* Ambient lighting for soft fill */}
      <ambientLight intensity={0.4} color="#ffffff" />

      {/* Hemisphere light for natural sky/ground gradient */}
      <hemisphereLight
        color="#ffffff"
        groundColor="#d4c4b0"
        intensity={0.5}
        position={[0, height, 0]}
      />

      {/* Main directional light from skylight (softer shadows) */}
      <directionalLight
        position={[0, height - 0.5, 0]}
        intensity={1.0}
        color="#f8f8ff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-width}
        shadow-camera-right={width}
        shadow-camera-top={depth}
        shadow-camera-bottom={-depth}
        shadow-bias={-0.0001}
      />

      {/* Soft fill lights from corners */}
      <pointLight position={[width / 3, height * 0.7, depth / 3]} intensity={3} color="#fff5e6" distance={width} decay={2} />
      <pointLight position={[-width / 3, height * 0.7, -depth / 3]} intensity={3} color="#fff5e6" distance={width} decay={2} />
      <pointLight position={[width / 3, height * 0.7, -depth / 3]} intensity={2} color="#ffffff" distance={width} decay={2} />
      <pointLight position={[-width / 3, height * 0.7, depth / 3]} intensity={2} color="#ffffff" distance={width} decay={2} />
    </group>
  )
}
