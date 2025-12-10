'use client'

import { useState, useEffect } from 'react'
import { ParallaxGallery } from './ParallaxGallery'
import Gallery3D from './Gallery3D'
import ViewModeToggle, { type ViewMode } from './ViewModeToggle'
import type { ViewPoint, Artwork } from '@/types/exhibition'

interface ExhibitionViewerProps {
  viewPoints: ViewPoint[]
  exhibitionTitle: string
  exhibitionId?: string
  artworks: Artwork[]
  exhibitionMetadata?: {
    venue?: string
    location?: string
    exhibitionDate?: string
    exhibitionEndDate?: string
    openingHours?: string
    admissionFee?: string
    artistName?: string
  }
}

const STORAGE_KEY = 'exhibition-view-mode'

/**
 * Client component wrapper for exhibition views
 * Allows switching between 2D parallax and 3D voxel gallery
 */
export default function ExhibitionViewer({
  viewPoints,
  exhibitionTitle,
  exhibitionId,
  artworks,
  exhibitionMetadata
}: ExhibitionViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('2d')
  const [mounted, setMounted] = useState(false)

  // Load saved preference from localStorage
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(STORAGE_KEY) as ViewMode | null
    if (saved === '2d' || saved === '3d') {
      setViewMode(saved)
    }
  }, [])

  // Save preference to localStorage
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem(STORAGE_KEY, mode)
  }

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading gallery...</div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* View mode toggle */}
      <ViewModeToggle mode={viewMode} onChange={handleViewModeChange} />

      {/* Render current view */}
      {viewMode === '2d' ? (
        <ParallaxGallery 
          viewPoints={viewPoints} 
          exhibitionTitle={exhibitionTitle} 
          exhibitionId={exhibitionId}
          exhibitionMetadata={exhibitionMetadata}
        />
      ) : (
        <Gallery3D 
          artworks={artworks} 
          exhibitionId={exhibitionId}
          exhibitionMetadata={exhibitionMetadata}
        />
      )}
    </div>
  )
}
