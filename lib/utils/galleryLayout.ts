import { Vector3, Euler } from 'three'

export interface ArtworkPosition {
  id: string
  position: Vector3
  rotation: Euler
  wall: 'north' | 'south' | 'east' | 'west' | 'center'
}

export interface GalleryDimensions {
  width: number
  height: number
  depth: number
}

/**
 * Calculate optimal gallery room dimensions based on artwork count
 */
export function calculateRoomDimensions(artworkCount: number): GalleryDimensions {
  // Base dimensions for small galleries
  const minWidth = 8
  const minDepth = 8
  const height = 4 // Standard gallery height

  // Scale room size based on artwork count
  // Each artwork needs ~2m of wall space
  const totalWallSpace = artworkCount * 2.5

  // Distribute artworks across 4 walls
  const wallSpace = totalWallSpace / 4

  // Calculate width and depth
  const width = Math.max(minWidth, Math.ceil(wallSpace))
  const depth = Math.max(minDepth, Math.ceil(wallSpace))

  return { width, height, depth }
}

/**
 * Auto-arrange artworks on gallery walls
 * Artworks are placed at eye level (1.5m from floor) with 2m spacing
 */
export function autoArrangeArtworks(
  artworkIds: string[],
  dimensions: GalleryDimensions
): ArtworkPosition[] {
  const positions: ArtworkPosition[] = []
  const artHeight = 1.5 // Height from floor to center of artwork
  const spacing = 2 // Minimum spacing between artworks
  const wallOffset = 0.35 // Distance from wall center

  const { width, depth } = dimensions
  const halfWidth = width / 2
  const halfDepth = depth / 2

  // Calculate how many artworks fit on each wall
  const northWallCapacity = Math.floor(width / spacing)
  const southWallCapacity = Math.floor(width / spacing)
  const eastWallCapacity = Math.floor(depth / spacing)
  const westWallCapacity = Math.floor(depth / spacing)

  let artworkIndex = 0

  // Helper to add artwork to a wall
  const addToWall = (
    wall: 'north' | 'south' | 'east' | 'west',
    capacity: number,
    positionFn: (index: number, total: number) => { x: number; z: number },
    rotation: number
  ) => {
    const count = Math.min(capacity, artworkIds.length - artworkIndex)

    for (let i = 0; i < count; i++) {
      if (artworkIndex >= artworkIds.length) break

      const { x, z } = positionFn(i, count)

      positions.push({
        id: artworkIds[artworkIndex],
        position: new Vector3(x, artHeight, z),
        rotation: new Euler(0, rotation, 0),
        wall
      })

      artworkIndex++
    }
  }

  // North wall (facing south, -Z)
  addToWall(
    'north',
    northWallCapacity,
    (i, total) => {
      const startX = -(total - 1) * spacing / 2
      return { x: startX + i * spacing, z: -halfDepth + wallOffset }
    },
    0
  )

  // East wall (facing west, +X)
  addToWall(
    'east',
    eastWallCapacity,
    (i, total) => {
      const startZ = -(total - 1) * spacing / 2
      return { x: halfWidth - wallOffset, z: startZ + i * spacing }
    },
    -Math.PI / 2
  )

  // South wall (facing north, +Z)
  addToWall(
    'south',
    southWallCapacity,
    (i, total) => {
      const startX = (total - 1) * spacing / 2
      return { x: startX - i * spacing, z: halfDepth - wallOffset }
    },
    Math.PI
  )

  // West wall (facing east, -X)
  addToWall(
    'west',
    westWallCapacity,
    (i, total) => {
      const startZ = (total - 1) * spacing / 2
      return { x: -halfWidth + wallOffset, z: startZ - i * spacing }
    },
    Math.PI / 2
  )

  // If there are leftover artworks, place them on center pedestals
  while (artworkIndex < artworkIds.length) {
    const pedestalIndex = artworkIndex - (positions.length - artworkIndex)
    const angle = (pedestalIndex * Math.PI * 2) / 3 // Max 3 pedestals
    const radius = 2

    positions.push({
      id: artworkIds[artworkIndex],
      position: new Vector3(
        Math.cos(angle) * radius,
        1, // Lower height for pedestal
        Math.sin(angle) * radius
      ),
      rotation: new Euler(0, -angle, 0),
      wall: 'center'
    })

    artworkIndex++
  }

  return positions
}
