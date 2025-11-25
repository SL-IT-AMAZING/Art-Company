import { useMemo } from 'react'
import * as THREE from 'three'

interface VoxelSkylightProps {
  width: number
  depth: number
  height: number
}

/**
 * Realistic skylight ceiling with bright light panels
 * Creates an illuminated ceiling similar to modern gallery spaces
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
      {/* Ceiling base - smooth white surface */}
      <mesh position={[0, height, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#f8f8f8" roughness={0.9} metalness={0} />
      </mesh>

      {/* Skylight panels - bright emissive rectangles */}
      {lightPanels.map((pos, index) => (
        <group key={index} position={pos.toArray()}>
          {/* Light panel - brighter and more prominent */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[width * 0.8, depth * 0.15]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={1.5}
              roughness={0.1}
              metalness={0.05}
            />
          </mesh>

          {/* Soft light source above panel - increased intensity */}
          <spotLight
            color="#ffffff"
            intensity={150}
            position={[0, 0.5, 0]}
            angle={Math.PI / 3}
            penumbra={1}
            distance={12}
            castShadow={false}
          />
        </group>
      ))}

    </group>
  )
}
