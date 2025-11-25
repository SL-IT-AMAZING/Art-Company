'use client'

import { Suspense, useState, useMemo, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls, Loader } from '@react-three/drei'
import { Vector3 } from 'three'

/**
 * Camera setup component to ensure camera looks forward (toward north wall)
 */
function CameraSetup() {
  const { camera } = useThree()

  useEffect(() => {
    // Point camera toward north wall (negative Z direction)
    camera.lookAt(0, 1.6, -5)
  }, [camera])

  return null
}
import VoxelGalleryRoom from './VoxelGalleryRoom'
import WallMountedArt from './WallMountedArt'
import { ArtworkDetail } from './ArtworkDetail'
import {
  calculateRoomDimensions,
  autoArrangeArtworks,
  type ArtworkPosition
} from '@/lib/utils/galleryLayout'
import type { Artwork } from '@/types/exhibition'

interface Gallery3DProps {
  artworks: Artwork[]
}

/**
 * 3D voxel gallery with first-person walkthrough
 * Displays artworks in wall-mounted frames with voxel aesthetic
 */
export default function Gallery3D({ artworks }: Gallery3DProps) {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const controlsRef = useRef<any>(null)

  // Cleanup pointer lock on unmount
  useEffect(() => {
    return () => {
      // Unlock pointer when component unmounts
      if (controlsRef.current && document.pointerLockElement) {
        document.exitPointerLock()
      }
    }
  }, [])

  // Calculate room dimensions and artwork positions
  const { dimensions, artworkPositions } = useMemo(() => {
    // Extract aspect ratios from artworks
    const aspectRatios = artworks.map(a => a.aspectRatio || 1.0)

    // Calculate room dimensions based on actual artwork sizes
    const dims = calculateRoomDimensions(artworks.length, aspectRatios)

    // Arrange artworks with proper spacing for variable sizes
    const positions = autoArrangeArtworks(
      artworks.map(a => a.id),
      dims,
      aspectRatios
    )

    return {
      dimensions: dims,
      artworkPositions: positions
    }
  }, [artworks])

  // Map artwork IDs to artwork data
  const artworkMap = useMemo(() => {
    return new Map(artworks.map(artwork => [artwork.id, artwork]))
  }, [artworks])

  // Get artwork for each position
  const positionedArtworks = useMemo(() => {
    return artworkPositions
      .map(pos => ({
        position: pos,
        artwork: artworkMap.get(pos.id)
      }))
      .filter((item): item is { position: ArtworkPosition; artwork: Artwork } =>
        item.artwork !== undefined
      )
  }, [artworkPositions, artworkMap])

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Instructions overlay */}
      {!isLocked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 pointer-events-none">
          <div className="bg-white/90 px-8 py-6 rounded-lg text-center pointer-events-auto">
            <h3 className="text-xl font-semibold mb-3">가상 갤러리에 오신 것을 환영합니다</h3>
            <p className="text-gray-700 mb-2">화면을 클릭하여 갤러리에 입장하세요</p>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• WASD 키로 이동</p>
              <p>• 마우스로 둘러보기</p>
              <p>• ESC 키로 나가기</p>
              <p>• 작품 클릭으로 상세보기</p>
            </div>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{
          position: [0, 1.6, 0],
          fov: 75
        }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        {/* Camera setup - ensure camera looks forward */}
        <CameraSetup />

        {/* Gallery Room (no suspense needed) */}
        <VoxelGalleryRoom dimensions={dimensions} />

        {/* Artworks with Suspense for texture loading */}
        <Suspense
          fallback={
            <mesh>
              <boxGeometry args={[0.5, 0.5, 0.5]} />
              <meshBasicMaterial color="#cccccc" />
            </mesh>
          }
        >
          {positionedArtworks.map(({ position, artwork }) => (
            <WallMountedArt
              key={artwork.id}
              artwork={artwork}
              position={position.position}
              rotation={position.rotation}
              onClick={() => isLocked && setSelectedArtwork(artwork)}
            />
          ))}
        </Suspense>

        {/* First-person controls */}
        <PointerLockControls
          ref={controlsRef}
          onLock={() => setIsLocked(true)}
          onUnlock={() => setIsLocked(false)}
          maxPolarAngle={Math.PI * 0.95}
          minPolarAngle={Math.PI * 0.05}
        />

        {/* Movement controls (WASD) */}
        <KeyboardControls />
      </Canvas>

      {/* Loading fallback */}
      <Loader
        containerStyles={{
          background: 'rgba(0, 0, 0, 0.9)'
        }}
        innerStyles={{
          background: '#333'
        }}
        barStyles={{
          background: '#fff'
        }}
        dataStyles={{
          color: '#fff'
        }}
      />

      {/* Artwork detail modal */}
      {selectedArtwork && (
        <ArtworkDetail
          artwork={selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
        />
      )}
    </div>
  )
}

/**
 * Keyboard controls for WASD movement
 */
function KeyboardControls() {
  const { camera } = useThree()
  const moveSpeed = 0.1

  useFrame(() => {
    // Get keyboard state
    const keys = {
      w: keyboard.current['KeyW'] || keyboard.current['w'],
      a: keyboard.current['KeyA'] || keyboard.current['a'],
      s: keyboard.current['KeyS'] || keyboard.current['s'],
      d: keyboard.current['KeyD'] || keyboard.current['d']
    }

    // Calculate movement direction
    const direction = new Vector3()

    if (keys.w) direction.z -= 1
    if (keys.s) direction.z += 1
    if (keys.a) direction.x -= 1
    if (keys.d) direction.x += 1

    // Normalize and apply speed
    if (direction.length() > 0) {
      direction.normalize().multiplyScalar(moveSpeed)

      // Apply camera rotation to movement direction
      direction.applyQuaternion(camera.quaternion)

      // Move only in XZ plane (no flying)
      camera.position.x += direction.x
      camera.position.z += direction.z
    }
  })

  // Keyboard state tracker
  const keyboard = useRef<Record<string, boolean>>({})

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keyboard.current[e.code] = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keyboard.current[e.code] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return null
}
