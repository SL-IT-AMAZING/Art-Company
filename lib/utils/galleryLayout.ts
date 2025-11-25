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
 * Calculate artwork dimensions based on aspect ratio
 * Uses same logic as WallMountedArt component
 */
function calculateArtworkDimensions(aspectRatio: number): { width: number; height: number } {
  const MAX_SIZE = 2.0

  let width: number
  let height: number

  if (aspectRatio >= 1) {
    // Landscape or square
    width = Math.min(MAX_SIZE, MAX_SIZE)
    height = width / aspectRatio
  } else {
    // Portrait
    height = Math.min(MAX_SIZE, MAX_SIZE)
    width = height * aspectRatio
  }

  return { width, height }
}

/**
 * Calculate optimal gallery room dimensions based on artwork sizes
 */
export function calculateRoomDimensions(
  artworkCount: number,
  artworkAspectRatios: number[] = []
): GalleryDimensions {
  // Base dimensions for small galleries
  const minWidth = 8
  const minDepth = 8
  const height = 4 // Standard gallery height

  // Calculate total wall space needed based on actual artwork sizes
  let totalWallSpace = 0
  const MIN_SPACING = 0.5 // Minimum gap between artworks

  if (artworkAspectRatios.length > 0) {
    // Calculate based on actual artwork widths
    for (const aspectRatio of artworkAspectRatios) {
      const { width } = calculateArtworkDimensions(aspectRatio || 1.0)
      totalWallSpace += width + MIN_SPACING
    }
  } else {
    // Fallback: estimate with average width
    totalWallSpace = artworkCount * 2.5
  }

  // Distribute artworks across 4 walls
  const wallSpace = totalWallSpace / 4

  // Calculate width and depth with extra padding
  const width = Math.max(minWidth, Math.ceil(wallSpace) + 2)
  const depth = Math.max(minDepth, Math.ceil(wallSpace) + 2)

  return { width, height, depth }
}

/**
 * Auto-arrange artworks on gallery walls with dynamic spacing based on artwork sizes
 * Artworks are placed at 1.8m from floor with spacing based on actual dimensions
 */
export function autoArrangeArtworks(
  artworkIds: string[],
  dimensions: GalleryDimensions,
  artworkAspectRatios: number[] = []
): ArtworkPosition[] {
  const positions: ArtworkPosition[] = []
  const artHeight = 1.8 // Height from floor to center of artwork
  const MIN_GAP = 0.5 // Minimum gap between artworks
  const wallOffset = 0.35 // Distance from wall center

  const { width, depth } = dimensions
  const halfWidth = width / 2
  const halfDepth = depth / 2

  let artworkIndex = 0

  // Calculate artwork widths for each artwork
  const artworkWidths = artworkIds.map((_, index) => {
    const aspectRatio = artworkAspectRatios[index] || 1.0
    return calculateArtworkDimensions(aspectRatio).width
  })

  // Helper to calculate how many artworks fit on a wall and distribute them
  const distributeOnWall = (
    wall: 'north' | 'south' | 'east' | 'west',
    availableSpace: number,
    rotation: number,
    getPosition: (offset: number) => { x: number; z: number }
  ) => {
    const startIndex = artworkIndex
    let currentSpace = 0
    const artworksOnWall: number[] = []

    // Determine which artworks fit on this wall
    while (artworkIndex < artworkIds.length) {
      const artworkWidth = artworkWidths[artworkIndex]
      const spaceNeeded = artworkWidth + (artworksOnWall.length > 0 ? MIN_GAP : 0)

      if (currentSpace + spaceNeeded > availableSpace) break

      artworksOnWall.push(artworkIndex)
      currentSpace += spaceNeeded
      artworkIndex++
    }

    // Center the artworks on the wall
    let currentOffset = -currentSpace / 2

    for (const index of artworksOnWall) {
      const artworkWidth = artworkWidths[index]
      const centerOffset = currentOffset + artworkWidth / 2

      const { x, z } = getPosition(centerOffset)

      positions.push({
        id: artworkIds[index],
        position: new Vector3(x, artHeight, z),
        rotation: new Euler(0, rotation, 0),
        wall
      })

      currentOffset += artworkWidth + MIN_GAP
    }
  }

  // North wall (facing south, -Z) - horizontal distribution
  distributeOnWall(
    'north',
    width - 1, // Leave margin
    0,
    (offset) => ({ x: offset, z: -halfDepth + wallOffset })
  )

  // East wall (facing west, +X) - vertical distribution along depth
  distributeOnWall(
    'east',
    depth - 1,
    -Math.PI / 2,
    (offset) => ({ x: halfWidth - wallOffset, z: offset })
  )

  // South wall (facing north, +Z) - horizontal distribution
  distributeOnWall(
    'south',
    width - 1,
    Math.PI,
    (offset) => ({ x: -offset, z: halfDepth - wallOffset })
  )

  // West wall (facing east, -X) - vertical distribution along depth
  distributeOnWall(
    'west',
    depth - 1,
    Math.PI / 2,
    (offset) => ({ x: -halfWidth + wallOffset, z: -offset })
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
