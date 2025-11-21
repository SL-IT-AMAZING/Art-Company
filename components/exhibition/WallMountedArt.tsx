import { useState, useRef, useMemo } from 'react'
import { Vector3, Euler } from 'three'
import * as THREE from 'three'
import ArtworkTexture from './ArtworkTexture'
import type { Artwork } from '@/types/exhibition'

interface WallMountedArtProps {
  artwork: Artwork
  position: Vector3
  rotation: Euler
  onClick?: () => void
}

/**
 * Wall-mounted artwork with voxel-style frame
 * Displays actual artwork image inside a 3D voxel frame
 */
export default function WallMountedArt({
  artwork,
  position,
  rotation,
  onClick
}: WallMountedArtProps) {
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef<THREE.Group>(null)

  // Frame dimensions
  const artworkWidth = 1.2
  const artworkHeight = 1.5
  const frameThickness = 0.08
  const frameDepth = 0.05
  const voxelSize = 0.04

  // Create voxel frame geometry
  const frameVoxels = useMemo(() => {
    const voxels: { position: [number, number, number] }[] = []

    // Top frame bar
    for (let x = -artworkWidth / 2; x <= artworkWidth / 2; x += voxelSize) {
      voxels.push({
        position: [x, artworkHeight / 2 + frameThickness / 2, frameDepth / 2]
      })
    }

    // Bottom frame bar
    for (let x = -artworkWidth / 2; x <= artworkWidth / 2; x += voxelSize) {
      voxels.push({
        position: [x, -artworkHeight / 2 - frameThickness / 2, frameDepth / 2]
      })
    }

    // Left frame bar
    for (let y = -artworkHeight / 2; y <= artworkHeight / 2; y += voxelSize) {
      voxels.push({
        position: [-artworkWidth / 2 - frameThickness / 2, y, frameDepth / 2]
      })
    }

    // Right frame bar
    for (let y = -artworkHeight / 2; y <= artworkHeight / 2; y += voxelSize) {
      voxels.push({
        position: [artworkWidth / 2 + frameThickness / 2, y, frameDepth / 2]
      })
    }

    return voxels
  }, [artworkWidth, artworkHeight, frameThickness, frameDepth, voxelSize])

  return (
    <group
      ref={groupRef}
      position={position.toArray()}
      rotation={rotation.toArray()}
    >
      {/* Artwork plane with texture - using custom texture loader */}
      <group
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <ArtworkTexture
          imageUrl={artwork.imageUrl}
          width={artworkWidth}
          height={artworkHeight}
        />

        {/* Hover glow effect */}
        {hovered && (
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[artworkWidth * 1.05, artworkHeight * 1.05]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.1}
            />
          </mesh>
        )}
      </group>

      {/* Voxel frame border */}
      {frameVoxels.map((voxel, index) => (
        <mesh key={index} position={voxel.position}>
          <boxGeometry args={[voxelSize, voxelSize, voxelSize]} />
          <meshStandardMaterial
            color={hovered ? '#ffffff' : '#f5f5f5'}
            roughness={0.5}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* White backing behind artwork */}
      <mesh position={[0, 0, -frameDepth / 2]}>
        <planeGeometry args={[artworkWidth + frameThickness * 2, artworkHeight + frameThickness * 2]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </mesh>

      {/* Spotlight on artwork */}
      <spotLight
        position={[0, 0, 1.5]}
        angle={0.5}
        penumbra={0.8}
        intensity={hovered ? 80 : 50}
        color="#ffffff"
        castShadow={false}
        target-position={[0, 0, 0]}
      />

      {/* Invisible label plane for raycasting */}
      {hovered && (
        <mesh position={[0, -artworkHeight / 2 - frameThickness - 0.2, frameDepth]}>
          <planeGeometry args={[artworkWidth * 0.8, 0.15]} />
          <meshBasicMaterial color="#000000" opacity={0.7} transparent />
        </mesh>
      )}

      {/* Title text when hovered (using HTML overlay would be better, but this is placeholder) */}
    </group>
  )
}
