'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface Artwork {
  id: string
  title: string
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
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadArtworks()
  }, [exhibitionId])

  const loadArtworks = async () => {
    const { data, error } = await supabase
      .from('artworks')
      .select('id, title, image_url, order_index')
      .eq('exhibition_id', exhibitionId)
      .order('order_index', { ascending: true })

    if (!error && data) {
      setArtworks(data)
    }
    setLoading(false)
  }

  const handleTitleChange = (id: string, newTitle: string) => {
    setArtworks(prev =>
      prev.map(artwork =>
        artwork.id === id ? { ...artwork, title: newTitle } : artwork
      )
    )
  }

  const handleSave = async () => {
    setSaving(true)

    // Update all artwork titles
    for (const artwork of artworks) {
      await supabase
        .from('artworks')
        .update({ title: artwork.title })
        .eq('id', artwork.id)
    }

    setSaving(false)
    onComplete()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">작품 정보를 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">작품 제목 편집</h2>
        <p className="text-gray-600">
          각 작품의 제목을 수정할 수 있습니다. 건너뛰면 기본 제목("작품 1", "작품 2" 등)이 사용됩니다.
        </p>
      </div>

      <div className="space-y-4">
        {artworks.map((artwork, index) => (
          <div
            key={artwork.id}
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
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

            {/* Title input */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                작품 {index + 1} 제목
              </label>
              <input
                type="text"
                value={artwork.title}
                onChange={(e) => handleTitleChange(artwork.id, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder={`작품 ${index + 1}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 justify-end pt-4">
        <button
          onClick={onSkip}
          disabled={saving}
          className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          건너뛰기
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-black text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? '저장 중...' : '제목 저장'}
        </button>
      </div>
    </div>
  )
}
