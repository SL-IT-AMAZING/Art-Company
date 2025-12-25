'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

interface Artwork {
  id: string
  title: string
  description: string | null
  image_url: string
  order_index: number
}

interface ArtworkTitleEditorProps {
  exhibitionId: string
  onComplete: () => void
  onSkip: () => void
}

/**
 * Component for editing artwork titles after upload
 * Shows thumbnails with editable title fields
 */
export default function ArtworkTitleEditor({
  exhibitionId,
  onComplete,
  onSkip
}: ArtworkTitleEditorProps) {
  const t = useTranslations('artworkEditor')
  const tCommon = useTranslations('common')
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Memoize supabase client to prevent recreation on every render
  const supabase = useMemo(() => createClient(), [])

  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true

    const loadArtworks = async () => {
      const { data, error } = await supabase
        .from('artworks')
        .select('id, title, description, image_url, order_index')
        .eq('exhibition_id', exhibitionId)
        .order('order_index', { ascending: true })

      // Only update state if component is still mounted
      if (isMounted.current) {
        if (!error && data) {
          setArtworks(data)
        }
        setLoading(false)
      }
    }

    loadArtworks()

    // Cleanup: mark component as unmounted
    return () => {
      isMounted.current = false
    }
  }, [exhibitionId, supabase])

  const handleTitleChange = (id: string, newTitle: string) => {
    setArtworks(prev =>
      prev.map(artwork =>
        artwork.id === id ? { ...artwork, title: newTitle } : artwork
      )
    )
  }

  const handleDescriptionChange = (id: string, newDescription: string) => {
    setArtworks(prev =>
      prev.map(artwork =>
        artwork.id === id ? { ...artwork, description: newDescription } : artwork
      )
    )
  }

  const handleSave = async () => {
    setSaving(true)

    // Update all artwork titles and descriptions
    for (const artwork of artworks) {
      await supabase
        .from('artworks')
        .update({
          title: artwork.title,
          description: artwork.description || null
        })
        .eq('id', artwork.id)
    }

    setSaving(false)
    onComplete()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">{t('loading')}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 mb-4">
        <h2 className="text-2xl font-bold mb-2">{t('title')}</h2>
        <p className="text-gray-600">
          {t('subtitle')}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
        {artworks.map((artwork, index) => (
          <div
            key={artwork.id}
            className="flex gap-4 p-4 bg-gray-50 rounded-lg"
          >
            {/* Thumbnail */}
            <div className="relative w-24 h-24 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
              <Image
                src={artwork.image_url}
                alt={artwork.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Title and Description inputs */}
            <div className="flex-1 space-y-3">
              {/* Title input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('artworkTitle', { num: index + 1 })}
                </label>
                <input
                  type="text"
                  value={artwork.title}
                  onChange={(e) => handleTitleChange(artwork.id, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder={t('artworkTitlePlaceholder', { num: index + 1 })}
                />
              </div>

              {/* Description input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('description')}
                </label>
                <textarea
                  value={artwork.description || ''}
                  onChange={(e) => handleDescriptionChange(artwork.id, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                  placeholder={t('descriptionPlaceholder')}
                  rows={3}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex-shrink-0 flex gap-3 justify-end pt-4">
        <button
          onClick={onSkip}
          disabled={saving}
          className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {tCommon('skip')}
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-black text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? tCommon('saving') : tCommon('save')}
        </button>
      </div>
    </div>
  )
}
