import { useMemo } from 'react'
import * as THREE from 'three'

interface VoxelSkylightProps {
  width: number
  depth: number
  height: number
}

/**
 * Voxel-style skylight ceiling with light panels
 * Creates an illuminated ceiling similar to the reference gallery image
 */
export default function VoxelSkylight({ width, depth, height }: VoxelSkylightProps) {
  const voxelSize = 0.1

  // Create skylight panels (bright strips in the ceiling)
  const lightPanels = useMemo(() => {
    const panels: THREE.Vector3[] = []
    const numPanels = 4
    const panelWidth = width * 0.8
    const panelDepth = depth * 0.15
    const spacing = depth / (numPanels + 1)

    for (let i = 0; i < numPanels; i++) {
      const z = -depth / 2 + spacing * (i + 1)
      panels.push(new THREE.Vector3(0, height - voxelSize, z))
    }

    return panels
  }, [width, depth, height, voxelSize])

  return (
    <group>
      {/* Ceiling base - white voxel texture */}
      <mesh position={[0, height, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.8} />
      </mesh>

      {/* Skylight panels - bright emissive rectangles */}
      {lightPanels.map((pos, index) => (
        <group key={index} position={pos.toArray()}>
          {/* Light panel */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[width * 0.8, depth * 0.15]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.8}
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>

          {/* Soft light source above panel */}
          <spotLight
            color="#ffffff"
            intensity={100}
            position={[0, 0.5, 0]}
            angle={Math.PI / 3}
            penumbra={1}
            distance={10}
            castShadow={false}
          />
        </group>
      ))}

      {/* Ceiling border - voxel detail */}
      {/* North border */}
      <mesh position={[0, height - voxelSize / 2, -depth / 2]}>
        <boxGeometry args={[width, voxelSize, voxelSize * 2]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>

      {/* South border */}
      <mesh position={[0, height - voxelSize / 2, depth / 2]}>
        <boxGeometry args={[width, voxelSize, voxelSize * 2]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>

      {/* East border */}
      <mesh position={[width / 2, height - voxelSize / 2, 0]}>
        <boxGeometry args={[voxelSize * 2, voxelSize, depth]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>

      {/* West border */}
      <mesh position={[-width / 2, height - voxelSize / 2, 0]}>
        <boxGeometry args={[voxelSize * 2, voxelSize, depth]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>
    </group>
  )
}
