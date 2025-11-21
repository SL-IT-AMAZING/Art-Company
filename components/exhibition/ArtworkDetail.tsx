'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { X } from 'lucide-react'
import { Artwork } from '@/types/exhibition'

interface ArtworkDetailProps {
  artwork: Artwork
  onClose: () => void
}

export function ArtworkDetail({ artwork, onClose }: ArtworkDetailProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative max-w-5xl w-full bg-white rounded-2xl overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full hover:bg-white transition shadow-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative w-full md:w-3/5 aspect-square md:aspect-auto bg-gray-100">
            <Image
              src={artwork.imageUrl}
              alt={artwork.title}
              fill
              className="object-contain p-8"
            />
          </div>

          {/* Info */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[60vh] md:max-h-none">
            <h2 className="text-3xl font-bold mb-4">{artwork.title}</h2>
            {artwork.description && (
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {artwork.description}
              </p>
            )}
            {!artwork.description && (
              <p className="text-gray-400 italic">작품 설명이 없습니다.</p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
