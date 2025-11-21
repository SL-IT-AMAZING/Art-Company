import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'

interface ArtworkTextureProps {
  imageUrl: string
  width: number
  height: number
  onTextureLoad?: (texture: THREE.Texture) => void
  onError?: () => void
}

/**
 * Component that loads artwork texture with proper error handling
 * Handles blob URLs, CORS, and loading failures gracefully
 */
export default function ArtworkTexture({
  imageUrl,
  width,
  height,
  onTextureLoad,
  onError
}: ArtworkTextureProps) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [error, setError] = useState(false)
  const loaderRef = useRef(new THREE.TextureLoader())

  useEffect(() => {
    let mounted = true
    const loader = loaderRef.current

    // Create image element with CORS handling
    const loadTexture = async () => {
      try {
        // Load texture with proper configuration
        const loadedTexture = await new Promise<THREE.Texture>((resolve, reject) => {
          loader.load(
            imageUrl,
            (tex) => {
              // Configure texture
              tex.colorSpace = THREE.SRGBColorSpace
              tex.minFilter = THREE.LinearFilter
              tex.magFilter = THREE.LinearFilter
              tex.generateMipmaps = false
              resolve(tex)
            },
            undefined, // onProgress
            (err) => {
              console.error('Texture load error:', err)
              reject(err)
            }
          )
        })

        if (mounted) {
          setTexture(loadedTexture)
          onTextureLoad?.(loadedTexture)
        }
      } catch (err) {
        console.error('Failed to load artwork texture:', imageUrl, err)
        if (mounted) {
          setError(true)
          onError?.()
        }
      }
    }

    loadTexture()

    return () => {
      mounted = false
      // Dispose texture on unmount
      if (texture) {
        texture.dispose()
      }
    }
  }, [imageUrl])

  // Show error fallback
  if (error) {
    return (
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color="#e0e0e0"
          roughness={0.8}
        />
      </mesh>
    )
  }

  // Show loading fallback
  if (!texture) {
    return (
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color="#f5f5f5"
          roughness={0.9}
        />
      </mesh>
    )
  }

  // Show artwork with loaded texture
  return (
    <mesh>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        map={texture}
        side={THREE.FrontSide}
        toneMapped={false}
      />
    </mesh>
  )
}
