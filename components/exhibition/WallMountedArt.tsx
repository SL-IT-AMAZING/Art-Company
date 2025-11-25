import { useState, useRef, useMemo } from 'react'
import { Vector3, Euler } from 'three'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import ArtworkTexture from './ArtworkTexture'
import type { Artwork } from '@/types/exhibition'

interface WallMountedArtProps {
  artwork: Artwork
  position: Vector3
  rotation: Euler
  onClick?: () => void
}

/**
 * Wall-mounted artwork with realistic frame
 * Displays actual artwork image inside a 3D frame with dynamic sizing based on aspect ratio
 */
export default function WallMountedArt({
  artwork,
  position,
  rotation,
  onClick
}: WallMountedArtProps) {
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef<THREE.Group>(null)

  // Calculate dynamic frame dimensions based on aspect ratio
  const MAX_SIZE = 2.0 // Maximum width or height in meters
  const aspectRatio = artwork.aspectRatio || 1.0

  let artworkWidth: number
  let artworkHeight: number

  if (aspectRatio >= 1) {
    // Landscape or square: wider than tall
    artworkWidth = Math.min(MAX_SIZE, MAX_SIZE)
    artworkHeight = artworkWidth / aspectRatio
  } else {
    // Portrait: taller than wide
    artworkHeight = Math.min(MAX_SIZE, MAX_SIZE)
    artworkWidth = artworkHeight * aspectRatio
  }

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
  }, [artworkWidth, artworkHeight, frameThickness, frameDepth, voxelSize, aspectRatio])

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

      {/* Title label above artwork */}
      <Html
        position={[0, artworkHeight / 2 + frameThickness + 0.15, 0]}
        center
        distanceFactor={1.5}
        style={{ pointerEvents: 'none' }}
      >
        <p
          className="text-white font-bold whitespace-nowrap"
          style={{
            fontSize: '48px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.9), -2px -2px 4px rgba(0,0,0,0.9), 2px -2px 4px rgba(0,0,0,0.9), -2px 2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.8)'
          }}
        >
          {artwork.title}
        </p>
      </Html>

      {/* Description label below artwork */}
      {artwork.description && (
        <Html
          position={[0, -artworkHeight / 2 - frameThickness - 0.15, 0]}
          center
          distanceFactor={1.5}
          style={{ pointerEvents: 'none' }}
        >
          <p
            className="text-white text-center line-clamp-2"
            style={{
              fontSize: '33px',
              maxWidth: '600px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.9), -2px -2px 4px rgba(0,0,0,0.9), 2px -2px 4px rgba(0,0,0,0.9), -2px 2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.8)'
            }}
          >
            {artwork.description}
          </p>
        </Html>
      )}
    </group>
  )
}
