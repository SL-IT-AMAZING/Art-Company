'use client'

import { Suspense, useState, useMemo, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Loader } from '@react-three/drei'
import { Vector3, Euler } from 'three'

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
  exhibitionId?: string
}

/**
 * 3D voxel gallery with first-person walkthrough
 * Displays artworks in wall-mounted frames with voxel aesthetic
 */
export default function Gallery3D({ artworks, exhibitionId }: Gallery3DProps) {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [isLocked, setIsLocked] = useState(false)

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
    <div className="relative w-full h-screen" style={{ backgroundColor: '#2a2a2a' }}>
      {/* Instructions overlay - ART WIZARD branded with purple/blue theme */}
      {!isLocked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
             style={{ background: 'rgba(30, 27, 75, 0.7)' }}> {/* indigo-950 with opacity */}
          <div
            className="px-10 py-8 rounded-2xl text-center backdrop-blur-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.95), rgba(147, 51, 234, 0.9))',
              border: '1px solid rgba(165, 180, 252, 0.3)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <h3 className="text-2xl font-bold mb-4 text-white">가상 갤러리에 오신 것을 환영합니다</h3>
            <p className="mb-4" style={{ color: 'rgba(224, 231, 255, 0.9)' }}>
              화면을 클릭하여 갤러리에 입장하세요
            </p>
            <div className="text-sm space-y-2" style={{ color: 'rgba(224, 231, 255, 0.8)' }}>
              <p>• WASD 키로 이동</p>
              <p>• 마우스로 둘러보기</p>
              <p>• ESC 키로 나가기</p>
              <p>• 작품 클릭으로 상세보기</p>
            </div>
            <div
              className="mt-6 px-6 py-2 rounded-full text-white font-medium inline-block"
              style={{ backgroundColor: '#4f46e5' }} // indigo-600
            >
              클릭하여 시작
            </div>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{
          position: [0, 1.6, 0],
          fov: 65 // Reduced from 75 to reduce motion sickness
        }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
        style={{ background: '#2a2a2a' }} // Dark gray instead of black
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

        {/* Smooth first-person controls (mouse look with damping) */}
        <SmoothFirstPersonControls
          onLock={() => setIsLocked(true)}
          onUnlock={() => setIsLocked(false)}
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
          exhibitionId={exhibitionId}
          onClose={() => setSelectedArtwork(null)}
        />
      )}
    </div>
  )
}

/**
 * Keyboard controls for WASD movement with damping and collision detection
 */
function KeyboardControls() {
  const { camera } = useThree()

  // Movement settings - reduced for less motion sickness
  const moveSpeed = 0.065 // Reduced from 0.1 (35% reduction)
  const damping = 0.85 // Smoothing factor for gradual stop
  const wallPadding = 0.5 // Distance from walls to stop

  // Velocity state for smooth movement
  const velocity = useRef(new Vector3())

  // Room boundaries (will be approximate, based on typical gallery size)
  const getBounds = () => {
    // These are approximate values - in a real scenario, pass dimensions as props
    return {
      minX: -4.5,
      maxX: 4.5,
      minZ: -4.5,
      maxZ: 4.5,
    }
  }

  useFrame(() => {
    // Get keyboard state
    const keys = {
      w: keyboard.current['KeyW'] || keyboard.current['w'],
      a: keyboard.current['KeyA'] || keyboard.current['a'],
      s: keyboard.current['KeyS'] || keyboard.current['s'],
      d: keyboard.current['KeyD'] || keyboard.current['d']
    }

    // Calculate target movement direction
    const targetDirection = new Vector3()

    if (keys.w) targetDirection.z -= 1
    if (keys.s) targetDirection.z += 1
    if (keys.a) targetDirection.x -= 1
    if (keys.d) targetDirection.x += 1

    // Apply input to velocity with acceleration
    if (targetDirection.length() > 0) {
      targetDirection.normalize().multiplyScalar(moveSpeed)
      targetDirection.applyQuaternion(camera.quaternion)

      // Smooth acceleration
      velocity.current.x += (targetDirection.x - velocity.current.x) * 0.15
      velocity.current.z += (targetDirection.z - velocity.current.z) * 0.15
    } else {
      // Apply damping when no input (smooth deceleration)
      velocity.current.x *= damping
      velocity.current.z *= damping

      // Stop completely when very slow
      if (Math.abs(velocity.current.x) < 0.001) velocity.current.x = 0
      if (Math.abs(velocity.current.z) < 0.001) velocity.current.z = 0
    }

    // Calculate new position
    const newX = camera.position.x + velocity.current.x
    const newZ = camera.position.z + velocity.current.z

    // Collision detection - clamp to room bounds
    const bounds = getBounds()
    const clampedX = Math.max(bounds.minX + wallPadding, Math.min(bounds.maxX - wallPadding, newX))
    const clampedZ = Math.max(bounds.minZ + wallPadding, Math.min(bounds.maxZ - wallPadding, newZ))

    // If we hit a wall, stop velocity in that direction
    if (clampedX !== newX) velocity.current.x = 0
    if (clampedZ !== newZ) velocity.current.z = 0

    // Apply clamped position
    camera.position.x = clampedX
    camera.position.z = clampedZ
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

/**
 * Smooth first-person controls with mouse rotation smoothing
 * Fixes the "skipping" issue and provides smooth camera movement
 */
interface SmoothFirstPersonControlsProps {
  onLock?: () => void
  onUnlock?: () => void
}

function SmoothFirstPersonControls({ onLock, onUnlock }: SmoothFirstPersonControlsProps) {
  const { camera, gl } = useThree()
  const isLockedRef = useRef(false)

  // Store callbacks in refs to avoid useEffect re-running on every render
  const onLockRef = useRef(onLock)
  const onUnlockRef = useRef(onUnlock)

  // Target rotation (where mouse is pointing) - updated immediately from mouse input
  const targetEuler = useRef(new Euler(0, 0, 0, 'YXZ'))
  // Current rotation (smoothly interpolates to target) - applied to camera
  const currentEuler = useRef(new Euler(0, 0, 0, 'YXZ'))

  // Settings
  const sensitivity = 0.0015 // Mouse sensitivity (reduced for less motion sickness)
  const smoothing = 0.12     // Interpolation factor (lower = smoother but slower response)
  const minPolarAngle = Math.PI * 0.05  // Looking up limit
  const maxPolarAngle = Math.PI * 0.95  // Looking down limit
  const maxMouseDelta = 100  // Cap mouse movement to prevent jumps from browser event batching

  // Helper function to normalize angle to [-PI, PI]
  const normalizeAngle = (angle: number): number => {
    while (angle > Math.PI) angle -= Math.PI * 2
    while (angle < -Math.PI) angle += Math.PI * 2
    return angle
  }

  // Update callback refs when props change (without triggering effect re-run)
  useEffect(() => {
    onLockRef.current = onLock
    onUnlockRef.current = onUnlock
  }, [onLock, onUnlock])

  // Initialize rotation from camera's initial orientation
  useEffect(() => {
    const initialEuler = new Euler(0, 0, 0, 'YXZ')
    initialEuler.setFromQuaternion(camera.quaternion, 'YXZ')
    targetEuler.current.copy(initialEuler)
    currentEuler.current.copy(initialEuler)
  }, [camera])

  // Handle pointer lock - NO onLock/onUnlock in dependencies to prevent re-running
  useEffect(() => {
    const canvas = gl.domElement

    const onClick = () => {
      canvas.requestPointerLock()
    }

    const onPointerLockChange = () => {
      if (document.pointerLockElement === canvas) {
        isLockedRef.current = true
        onLockRef.current?.()  // Use ref instead of prop
      } else {
        isLockedRef.current = false
        onUnlockRef.current?.()  // Use ref instead of prop
      }
    }

    const onPointerLockError = () => {
      console.error('Pointer lock error')
    }

    canvas.addEventListener('click', onClick)
    document.addEventListener('pointerlockchange', onPointerLockChange)
    document.addEventListener('pointerlockerror', onPointerLockError)

    return () => {
      canvas.removeEventListener('click', onClick)
      document.removeEventListener('pointerlockchange', onPointerLockChange)
      document.removeEventListener('pointerlockerror', onPointerLockError)
      // Exit pointer lock on unmount
      if (document.pointerLockElement === canvas) {
        document.exitPointerLock()
      }
    }
  }, [gl])  // Only gl in dependencies - callbacks are stored in refs

  // Handle mouse movement
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isLockedRef.current) return

      // Cap mouse movement to prevent jumps from browser event batching
      const movementX = Math.max(-maxMouseDelta, Math.min(maxMouseDelta, e.movementX))
      const movementY = Math.max(-maxMouseDelta, Math.min(maxMouseDelta, e.movementY))

      // Update target rotation based on mouse movement
      targetEuler.current.y -= movementX * sensitivity
      targetEuler.current.x -= movementY * sensitivity

      // Normalize Y rotation to prevent floating-point precision issues
      targetEuler.current.y = normalizeAngle(targetEuler.current.y)

      // Clamp vertical rotation (looking up/down)
      const halfPi = Math.PI / 2
      targetEuler.current.x = Math.max(
        halfPi - maxPolarAngle,
        Math.min(halfPi - minPolarAngle, targetEuler.current.x)
      )
    }

    document.addEventListener('mousemove', onMouseMove)
    return () => document.removeEventListener('mousemove', onMouseMove)
  }, [sensitivity, minPolarAngle, maxPolarAngle])

  // Smooth interpolation on each frame
  useFrame((_, delta) => {
    if (!isLockedRef.current) return

    // Frame-rate independent smoothing
    const smoothFactor = 1 - Math.pow(1 - smoothing, delta * 60)

    // For X (pitch), simple interpolation is fine since it's clamped
    currentEuler.current.x += (targetEuler.current.x - currentEuler.current.x) * smoothFactor

    // For Y (yaw), take the shorter path around the circle to prevent skipping
    let yDiff = targetEuler.current.y - currentEuler.current.y
    if (yDiff > Math.PI) yDiff -= Math.PI * 2
    if (yDiff < -Math.PI) yDiff += Math.PI * 2
    currentEuler.current.y += yDiff * smoothFactor

    // Normalize current Y rotation to keep it bounded
    currentEuler.current.y = normalizeAngle(currentEuler.current.y)

    // Apply smoothed rotation to camera
    camera.quaternion.setFromEuler(currentEuler.current)
  })

  return null
}
