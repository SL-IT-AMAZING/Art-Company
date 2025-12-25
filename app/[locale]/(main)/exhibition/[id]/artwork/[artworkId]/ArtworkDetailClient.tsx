'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Share2,
  Download,
  X,
  Copy,
  Check,
  Twitter,
  Facebook,
} from 'lucide-react'

interface ArtworkDetailClientProps {
  artwork: {
    id: string
    title: string
    description: string
    imageUrl: string
    imageWidth?: number
    imageHeight?: number
    aspectRatio?: number
  }
  exhibition: {
    id: string
    title: string
    artistName?: string
  }
  navigation: {
    currentIndex: number
    totalCount: number
    prevId?: string
    nextId?: string
  }
}

export default function ArtworkDetailClient({
  artwork,
  exhibition,
  navigation,
}: ArtworkDetailClientProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  // Zoom state
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false)
  const [copied, setCopied] = useState(false)

  // Info panel state
  const [showInfo, setShowInfo] = useState(true)

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.5, 4))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom(prev => {
      const newZoom = Math.max(prev - 0.5, 1)
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 })
      }
      return newZoom
    })
  }, [])

  const handleResetZoom = useCallback(() => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  // Drag to pan when zoomed
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }, [zoom, position])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }, [isDragging, dragStart, zoom])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Double-click to zoom
  const handleDoubleClick = useCallback(() => {
    if (zoom === 1) {
      setZoom(2)
    } else {
      handleResetZoom()
    }
  }, [zoom, handleResetZoom])

  // Share functionality
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/exhibition/${exhibition.id}/artwork/${artwork.id}`
    : ''

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [shareUrl])

  const handleShareTwitter = useCallback(() => {
    const text = `"${artwork.title}" - ${exhibition.title}`
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank'
    )
  }, [artwork.title, exhibition.title, shareUrl])

  const handleShareFacebook = useCallback(() => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank'
    )
  }, [shareUrl])

  // Download functionality
  const handleDownload = useCallback(async () => {
    try {
      const response = await fetch(artwork.imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${artwork.title || 'artwork'}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download:', err)
    }
  }, [artwork.imageUrl, artwork.title])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && navigation.prevId) {
      router.push(`/exhibition/${exhibition.id}/artwork/${navigation.prevId}`)
    } else if (e.key === 'ArrowRight' && navigation.nextId) {
      router.push(`/exhibition/${exhibition.id}/artwork/${navigation.nextId}`)
    } else if (e.key === 'Escape') {
      if (zoom > 1) {
        handleResetZoom()
      } else {
        router.push(`/exhibition/${exhibition.id}`)
      }
    } else if (e.key === '+' || e.key === '=') {
      handleZoomIn()
    } else if (e.key === '-') {
      handleZoomOut()
    }
  }, [navigation, exhibition.id, router, zoom, handleResetZoom, handleZoomIn, handleZoomOut])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black flex flex-col"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between p-4">
          {/* Back button */}
          <Link
            href={`/exhibition/${exhibition.id}`}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Exhibition</span>
          </Link>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-2 py-1">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 1}
                className="p-2 text-white/80 hover:text-white disabled:opacity-30 transition-colors"
                title="Zoom out (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-white/80 text-sm min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 4}
                className="p-2 text-white/80 hover:text-white disabled:opacity-30 transition-colors"
                title="Zoom in (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Share button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Download button */}
            <button
              onClick={handleDownload}
              className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Toggle info */}
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`p-2.5 backdrop-blur-sm rounded-full transition-all ${
                showInfo
                  ? 'bg-indigo-500/50 text-white'
                  : 'bg-white/10 text-white/80 hover:text-white hover:bg-white/20'
              }`}
              title="Toggle info"
            >
              <span className="text-xs font-bold">i</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main image area */}
      <div
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      >
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            scale: zoom,
            x: position.x,
            y: position.y,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="relative max-w-[90vw] max-h-[85vh]">
            <Image
              src={artwork.imageUrl}
              alt={artwork.title}
              width={artwork.imageWidth || 1200}
              height={artwork.imageHeight || 800}
              className="object-contain max-w-full max-h-[85vh]"
              priority
              draggable={false}
            />
          </div>
        </motion.div>

        {/* Zoom hint */}
        {zoom === 1 && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-white/50 text-sm">
            Double-click or use +/- to zoom
          </div>
        )}
      </div>

      {/* Navigation arrows */}
      {navigation.prevId && (
        <Link
          href={`/exhibition/${exhibition.id}/artwork/${navigation.prevId}`}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 backdrop-blur-sm rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all"
          title="Previous artwork"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
      )}

      {navigation.nextId && (
        <Link
          href={`/exhibition/${exhibition.id}/artwork/${navigation.nextId}`}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 backdrop-blur-sm rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all"
          title="Next artwork"
        >
          <ChevronRight className="w-6 h-6" />
        </Link>
      )}

      {/* Bottom info panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/70 to-transparent"
          >
            <div className="p-6 pt-16">
              <div className="max-w-3xl mx-auto">
                {/* Artwork title */}
                <h1 className="text-2xl font-bold text-white mb-2">
                  {artwork.title}
                </h1>

                {/* Exhibition info */}
                <p className="text-white/60 text-sm mb-3">
                  {exhibition.title}
                  {exhibition.artistName && ` - ${exhibition.artistName}`}
                </p>

                {/* Description */}
                {artwork.description && (
                  <p className="text-white/80 text-sm leading-relaxed mb-4">
                    {artwork.description}
                  </p>
                )}

                {/* Navigation info */}
                <div className="flex items-center justify-between text-white/50 text-sm">
                  <span>
                    {navigation.currentIndex} / {navigation.totalCount}
                  </span>
                  {artwork.imageWidth && artwork.imageHeight && (
                    <span>
                      {artwork.imageWidth} x {artwork.imageHeight}px
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl border border-white/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Share Artwork</h2>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Share preview */}
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <p className="text-white font-medium">{artwork.title}</p>
                <p className="text-white/60 text-sm">{exhibition.title}</p>
              </div>

              {/* Copy link */}
              <div className="mb-4">
                <label className="text-white/60 text-sm mb-2 block">Share Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 bg-gray-800 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Social share */}
              <div>
                <label className="text-white/60 text-sm mb-2 block">Share to</label>
                <div className="flex gap-3">
                  <button
                    onClick={handleShareTwitter}
                    className="flex-1 py-3 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </button>
                  <button
                    onClick={handleShareFacebook}
                    className="flex-1 py-3 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
