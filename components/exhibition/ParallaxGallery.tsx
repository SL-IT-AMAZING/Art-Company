'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ArtworkDetail } from './ArtworkDetail'
import { Artwork, ViewPoint } from '@/types/exhibition'

interface ParallaxGalleryProps {
  viewPoints: ViewPoint[]
  exhibitionTitle: string
  exhibitionId?: string
}

export function ParallaxGallery({
  viewPoints,
  exhibitionTitle,
  exhibitionId,
}: ParallaxGalleryProps) {
  const [currentView, setCurrentView] = useState(0)
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)

  const goToNextView = useCallback(() => {
    setCurrentView((prev) => (prev + 1) % viewPoints.length)
  }, [viewPoints.length])

  const goToPrevView = useCallback(() => {
    setCurrentView((prev) => (prev - 1 + viewPoints.length) % viewPoints.length)
  }, [viewPoints.length])

  return (
    <div className="relative w-full h-screen bg-gray-100 overflow-hidden">
      {/* Exhibition Title Header - More prominent */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{exhibitionTitle}</h1>
        </div>
      </div>

      {/* Background Layers */}
      <div className="absolute inset-0">
        {viewPoints.map((view, index) => (
          <motion.div
            key={view.id}
            className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-200"
            initial={false}
            animate={{
              opacity: currentView === index ? 1 : 0,
              scale: currentView === index ? 1 : 1.1,
            }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            {view.background && (
              <Image
                src={view.background}
                alt={`View ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Artworks Layer - with internal scroll */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          className="absolute inset-0 z-10 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="container mx-auto min-h-full px-6 py-8 pt-20 pb-24">
            {/* Improved grid with better spacing and responsive columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 max-w-7xl w-full">
              {viewPoints[currentView]?.artworks.map((artwork, artworkIndex) => (
                <motion.div
                  key={artwork.id}
                  className="cursor-pointer group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: artworkIndex * 0.08, duration: 0.4 }}
                  whileHover={{ y: -4 }}
                  onClick={() => setSelectedArtwork(artwork)}
                >
                  <div className="relative bg-white p-5 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
                    {/* Frame - fixed aspect ratio with object-contain to prevent cropping */}
                    <div
                      className="relative w-full flex items-center justify-center overflow-hidden bg-gray-50 rounded-lg"
                      style={{
                        aspectRatio: artwork.aspectRatio && artwork.aspectRatio > 0.5 && artwork.aspectRatio < 2
                          ? `${artwork.aspectRatio}`
                          : '4/3', // Default to 4:3 for unusual ratios
                        maxHeight: '280px',
                        minHeight: '180px',
                      }}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={artwork.imageUrl}
                          alt={artwork.title}
                          fill
                          className="object-contain"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    </div>
                    {/* Label with hover effect */}
                    <div className="mt-4 text-center">
                      <p className="font-semibold text-sm text-gray-800 group-hover:text-indigo-600 transition-colors duration-200">
                        {artwork.title}
                      </p>
                      {artwork.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {artwork.description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      {viewPoints.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
          <button
            onClick={goToPrevView}
            className="p-3 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-white transition"
            aria-label="Previous view"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* View Indicators */}
          <div className="flex gap-2">
            {viewPoints.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentView(index)}
                className={`w-3 h-3 rounded-full transition ${
                  currentView === index ? 'bg-black' : 'bg-gray-400'
                }`}
                aria-label={`Go to view ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={goToNextView}
            className="p-3 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-white transition"
            aria-label="Next view"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* View Counter */}
      <div className="absolute bottom-8 right-8 z-20 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg">
        <span className="text-sm font-medium">
          {currentView + 1} / {viewPoints.length}
        </span>
      </div>

      {/* Artwork Detail Modal */}
      <AnimatePresence>
        {selectedArtwork && (
          <ArtworkDetail
            artwork={selectedArtwork}
            exhibitionId={exhibitionId}
            onClose={() => setSelectedArtwork(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
