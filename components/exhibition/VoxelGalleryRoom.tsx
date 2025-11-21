import { useMemo } from 'react'
import VoxelSkylight from './VoxelSkylight'
import type { GalleryDimensions } from '@/lib/utils/galleryLayout'

interface VoxelGalleryRoomProps {
  dimensions: GalleryDimensions
}

/**
 * Voxel-style gallery room with walls, floor, and skylight
 * Creates an enclosed minimalist white gallery space
 */
export default function VoxelGalleryRoom({ dimensions }: VoxelGalleryRoomProps) {
  const { width, height, depth } = dimensions
  const wallThickness = 0.3
  const voxelSize = 0.1

  // Create voxel pattern for floor (subtle texture)
  const floorVoxels = useMemo(() => {
    const voxels: { position: [number, number, number]; shade: number }[] = []
    const spacing = 0.3

    for (let x = -width / 2; x < width / 2; x += spacing) {
      for (let z = -depth / 2; z < depth / 2; z += spacing) {
        // Random subtle shade variation for concrete look
        const shade = 0.9 + Math.random() * 0.1
        voxels.push({
          position: [x + spacing / 2, 0.01, z + spacing / 2],
          shade
        })
      }
    }

    return voxels
  }, [width, depth])

  return (
    <group>
      {/* Floor - concrete voxel texture */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial
          color="#d4c4b0"
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* Floor voxel details for concrete texture */}
      {floorVoxels.map((voxel, index) => (
        index % 5 === 0 && ( // Only render some for performance
          <mesh key={index} position={voxel.position}>
            <boxGeometry args={[voxelSize, voxelSize * 0.2, voxelSize]} />
            <meshStandardMaterial
              color={`rgb(${212 * voxel.shade}, ${196 * voxel.shade}, ${176 * voxel.shade})`}
              roughness={0.95}
            />
          </mesh>
        )
      ))}

      {/* North Wall (facing south, -Z) */}
      <group position={[0, height / 2, -depth / 2]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[width, height, wallThickness]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.8} />
        </mesh>

        {/* Voxel detail strips on wall */}
        {[...Array(5)].map((_, i) => (
          <mesh
            key={i}
            position={[-width / 2 + (width / 6) * (i + 1), height / 4, wallThickness / 2]}
          >
            <boxGeometry args={[voxelSize * 2, height / 2, voxelSize]} />
            <meshStandardMaterial color="#eeeeee" roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* South Wall (facing north, +Z) */}
      <group position={[0, height / 2, depth / 2]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[width, height, wallThickness]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.8} />
        </mesh>

        {/* Voxel detail strips */}
        {[...Array(5)].map((_, i) => (
          <mesh
            key={i}
            position={[-width / 2 + (width / 6) * (i + 1), height / 4, -wallThickness / 2]}
          >
            <boxGeometry args={[voxelSize * 2, height / 2, voxelSize]} />
            <meshStandardMaterial color="#eeeeee" roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* East Wall (facing west, +X) */}
      <group position={[width / 2, height / 2, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[wallThickness, height, depth]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.8} />
        </mesh>

        {/* Voxel detail strips */}
        {[...Array(5)].map((_, i) => (
          <mesh
            key={i}
            position={[-wallThickness / 2, height / 4, -depth / 2 + (depth / 6) * (i + 1)]}
          >
            <boxGeometry args={[voxelSize, height / 2, voxelSize * 2]} />
            <meshStandardMaterial color="#eeeeee" roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* West Wall (facing east, -X) */}
      <group position={[-width / 2, height / 2, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[wallThickness, height, depth]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.8} />
        </mesh>

        {/* Voxel detail strips */}
        {[...Array(5)].map((_, i) => (
          <mesh
            key={i}
            position={[wallThickness / 2, height / 4, -depth / 2 + (depth / 6) * (i + 1)]}
          >
            <boxGeometry args={[voxelSize, height / 2, voxelSize * 2]} />
            <meshStandardMaterial color="#eeeeee" roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* Voxel Skylight Ceiling */}
      <VoxelSkylight width={width} depth={depth} height={height} />

      {/* Ambient lighting for the space */}
      <ambientLight intensity={1.5} color="#ffffff" />

      {/* Main directional light from skylight */}
      <directionalLight
        position={[0, height - 0.5, 0]}
        intensity={2}
        color="#f0f8ff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-width}
        shadow-camera-right={width}
        shadow-camera-top={depth}
        shadow-camera-bottom={-depth}
      />

      {/* Corner accent lights */}
      <pointLight position={[width / 3, height * 0.8, depth / 3]} intensity={10} color="#ffffff" distance={5} />
      <pointLight position={[-width / 3, height * 0.8, -depth / 3]} intensity={10} color="#ffffff" distance={5} />
    </group>
  )
}
