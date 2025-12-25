'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Trash2, Plus, Edit2, Save, X, Globe, Lock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import DeleteConfirmModal from './DeleteConfirmModal'
import { createClient } from '@/lib/supabase/client'

interface Artwork {
  id: string
  title: string
  image_url: string
  order_index: number
}

interface Exhibition {
  id: string
  title: string
  status: string
  is_public: boolean
}

interface ExhibitionManagerProps {
  exhibition: Exhibition
  artworks: Artwork[]
}

export default function ExhibitionManager({
  exhibition: initialExhibition,
  artworks: initialArtworks
}: ExhibitionManagerProps) {
  const t = useTranslations('exhibition')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [exhibition, setExhibition] = useState(initialExhibition)
  const [artworks, setArtworks] = useState(initialArtworks)
  const [editingTitle, setEditingTitle] = useState(false)
  const [newTitle, setNewTitle] = useState(exhibition.title)
  const [editingArtwork, setEditingArtwork] = useState<string | null>(null)
  const [artworkTitles, setArtworkTitles] = useState<Record<string, string>>(
    Object.fromEntries(artworks.map(a => [a.id, a.title]))
  )

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'exhibition' | 'artwork'; id?: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  // Update exhibition title
  const handleSaveTitle = async () => {
    try {
      const res = await fetch(`/api/exhibitions/${exhibition.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      })

      if (res.ok) {
        setExhibition({ ...exhibition, title: newTitle })
        setEditingTitle(false)
      } else {
        alert(t('titleUpdateFailed'))
      }
    } catch (error) {
      console.error('Error updating title:', error)
      alert(t('titleUpdateError'))
    }
  }

  // Toggle exhibition publish status
  const handleTogglePublish = async (publish: boolean) => {
    setIsPublishing(true)
    try {
      const res = await fetch(`/api/exhibitions/${exhibition.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: publish ? 'complete' : 'draft',
          is_public: publish
        })
      })

      if (res.ok) {
        setExhibition({
          ...exhibition,
          status: publish ? 'complete' : 'draft',
          is_public: publish
        })
      } else {
        alert(publish ? t('publishFailed') : t('unpublishFailed'))
      }
    } catch (error) {
      console.error('Error toggling publish:', error)
      alert(t('statusChangeError'))
    } finally {
      setIsPublishing(false)
    }
  }

  // Delete exhibition
  const handleDeleteExhibition = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/exhibitions/${exhibition.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        router.push('/mypage')
      } else {
        alert(t('deleteFailed'))
      }
    } catch (error) {
      console.error('Error deleting exhibition:', error)
      alert(t('deleteError'))
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  // Update artwork title
  const handleSaveArtworkTitle = async (artworkId: string) => {
    try {
      const res = await fetch(`/api/exhibitions/${exhibition.id}/artworks/${artworkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: artworkTitles[artworkId] })
      })

      if (res.ok) {
        setArtworks(artworks.map(a =>
          a.id === artworkId ? { ...a, title: artworkTitles[artworkId] } : a
        ))
        setEditingArtwork(null)
      } else {
        alert(t('artworkTitleUpdateFailed'))
      }
    } catch (error) {
      console.error('Error updating artwork title:', error)
      alert(t('artworkTitleUpdateError'))
    }
  }

  // Delete artwork
  const handleDeleteArtwork = async (artworkId: string) => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/exhibitions/${exhibition.id}/artworks/${artworkId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setArtworks(artworks.filter(a => a.id !== artworkId))
      } else {
        alert(t('artworkDeleteFailed'))
      }
    } catch (error) {
      console.error('Error deleting artwork:', error)
      alert(t('artworkDeleteError'))
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
      setDeleteTarget(null)
    }
  }

  // Add new artwork
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('title', tCommon('artworkNum', { num: artworks.length + 1 }))

        const res = await fetch(`/api/exhibitions/${exhibition.id}/artworks`, {
          method: 'POST',
          body: formData
        })

        if (res.ok) {
          const { artwork } = await res.json()
          setArtworks(prev => [...prev, artwork])
          setArtworkTitles(prev => ({ ...prev, [artwork.id]: artwork.title }))
        } else {
          const errorData = await res.json()
          console.error('Upload error:', errorData)
          alert(`${file.name} ${t('uploadFailed')}: ${errorData.details || errorData.error}`)
        }
      } catch (error) {
        console.error('Error uploading artwork:', error)
        alert(`${file.name} ${t('uploadError')}`)
      }
    }

    setIsUploading(false)
    e.target.value = '' // Reset input
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push('/mypage')}>
          {t('backToMypage')}
        </Button>
      </div>

      {/* Exhibition Title Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-sm font-medium text-gray-500 mb-2">{t('exhibitionTitle')}</h2>
        {editingTitle ? (
          <div className="flex gap-2">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1"
              autoFocus
            />
            <Button onClick={handleSaveTitle} size="sm">
              <Save size={16} className="mr-1" /> {tCommon('save')}
            </Button>
            <Button
              onClick={() => {
                setEditingTitle(false)
                setNewTitle(exhibition.title)
              }}
              variant="outline"
              size="sm"
            >
              <X size={16} />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{exhibition.title}</h1>
            <Button
              onClick={() => setEditingTitle(true)}
              variant="ghost"
              size="sm"
            >
              <Edit2 size={16} />
            </Button>
          </div>
        )}
      </div>

      {/* Publish Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-sm font-medium text-gray-500 mb-2">{t('publicStatus')}</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {exhibition.is_public ? (
              <>
                <Globe className="text-green-600" size={24} />
                <div>
                  <p className="font-medium text-green-700">{t('isPublic')}</p>
                  <p className="text-sm text-gray-500">{t('isPublicDesc')}</p>
                </div>
              </>
            ) : (
              <>
                <Lock className="text-gray-400" size={24} />
                <div>
                  <p className="font-medium text-gray-700">{t('isPrivate')}</p>
                  <p className="text-sm text-gray-500">{t('isPrivateDesc')}</p>
                </div>
              </>
            )}
          </div>
          <Button
            onClick={() => handleTogglePublish(!exhibition.is_public)}
            disabled={isPublishing}
            variant={exhibition.is_public ? 'outline' : 'default'}
          >
            {isPublishing ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                {tCommon('processing')}
              </>
            ) : exhibition.is_public ? (
              <>
                <Lock size={16} className="mr-2" />
                {t('makePrivate')}
              </>
            ) : (
              <>
                <Globe size={16} className="mr-2" />
                {t('makePublic')}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Artworks Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{t('artworkManagement')} ({t('artworkCount', { count: artworks.length })})</h2>
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            <Button
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus size={16} className="mr-1" />
              {isUploading ? tCommon('uploading') : t('addArtwork')}
            </Button>
          </>
        </div>

        {/* Artworks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {artworks.map((artwork) => (
            <div key={artwork.id} className="border rounded-lg p-4 space-y-3">
              <div className="relative w-full aspect-square bg-gray-100 rounded overflow-hidden">
                <Image
                  src={artwork.image_url}
                  alt={artwork.title}
                  fill
                  className="object-cover"
                />
              </div>

              {editingArtwork === artwork.id ? (
                <div className="flex gap-2">
                  <Input
                    value={artworkTitles[artwork.id]}
                    onChange={(e) =>
                      setArtworkTitles({ ...artworkTitles, [artwork.id]: e.target.value })
                    }
                    className="flex-1"
                    autoFocus
                  />
                  <Button onClick={() => handleSaveArtworkTitle(artwork.id)} size="sm">
                    <Save size={14} />
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingArtwork(null)
                      setArtworkTitles({ ...artworkTitles, [artwork.id]: artwork.title })
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <X size={14} />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <h3 className="font-medium truncate flex-1">{artwork.title}</h3>
                  <div className="flex gap-1">
                    <Button
                      onClick={() => setEditingArtwork(artwork.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      onClick={() => {
                        setDeleteTarget({ type: 'artwork', id: artwork.id })
                        setShowDeleteModal(true)
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
        <h2 className="text-lg font-bold text-red-900 mb-2">{t('dangerZone')}</h2>
        <p className="text-sm text-red-700 mb-4">
          {t('deleteWarning')}
        </p>
        <Button
          onClick={() => {
            setDeleteTarget({ type: 'exhibition' })
            setShowDeleteModal(true)
          }}
          className="bg-red-600 hover:bg-red-700"
        >
          <Trash2 size={16} className="mr-2" />
          {t('deleteExhibition')}
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeleteTarget(null)
        }}
        onConfirm={() => {
          if (deleteTarget?.type === 'exhibition') {
            handleDeleteExhibition()
          } else if (deleteTarget?.type === 'artwork' && deleteTarget.id) {
            handleDeleteArtwork(deleteTarget.id)
          }
        }}
        title={deleteTarget?.type === 'exhibition' ? t('deleteExhibition') : t('deleteArtwork')}
        message={
          deleteTarget?.type === 'exhibition'
            ? t('deleteExhibitionConfirm')
            : t('deleteArtworkConfirm')
        }
        isDeleting={isDeleting}
      />
    </div>
  )
}
