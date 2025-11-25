'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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
  const router = useRouter()
  const supabase = createClient()

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
        alert('제목 수정에 실패했습니다')
      }
    } catch (error) {
      console.error('Error updating title:', error)
      alert('제목 수정 중 오류가 발생했습니다')
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
          status: publish ? 'completed' : 'draft',
          is_public: publish
        })
      })

      if (res.ok) {
        setExhibition({
          ...exhibition,
          status: publish ? 'completed' : 'draft',
          is_public: publish
        })
      } else {
        alert(publish ? '전시 공개에 실패했습니다' : '비공개 전환에 실패했습니다')
      }
    } catch (error) {
      console.error('Error toggling publish:', error)
      alert('상태 변경 중 오류가 발생했습니다')
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
        alert('전시 삭제에 실패했습니다')
      }
    } catch (error) {
      console.error('Error deleting exhibition:', error)
      alert('전시 삭제 중 오류가 발생했습니다')
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
        alert('작품 제목 수정에 실패했습니다')
      }
    } catch (error) {
      console.error('Error updating artwork title:', error)
      alert('작품 제목 수정 중 오류가 발생했습니다')
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
        alert('작품 삭제에 실패했습니다')
      }
    } catch (error) {
      console.error('Error deleting artwork:', error)
      alert('작품 삭제 중 오류가 발생했습니다')
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
        formData.append('title', `작품 ${artworks.length + 1}`)

        const res = await fetch(`/api/exhibitions/${exhibition.id}/artworks`, {
          method: 'POST',
          body: formData
        })

        if (res.ok) {
          const { artwork } = await res.json()
          setArtworks([...artworks, artwork])
          setArtworkTitles({ ...artworkTitles, [artwork.id]: artwork.title })
        } else {
          alert(`${file.name} 업로드에 실패했습니다`)
        }
      } catch (error) {
        console.error('Error uploading artwork:', error)
        alert(`${file.name} 업로드 중 오류가 발생했습니다`)
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
          ← 마이페이지로 돌아가기
        </Button>
      </div>

      {/* Exhibition Title Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-sm font-medium text-gray-500 mb-2">전시 제목</h2>
        {editingTitle ? (
          <div className="flex gap-2">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1"
              autoFocus
            />
            <Button onClick={handleSaveTitle} size="sm">
              <Save size={16} className="mr-1" /> 저장
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
        <h2 className="text-sm font-medium text-gray-500 mb-2">전시 공개 상태</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {exhibition.is_public ? (
              <>
                <Globe className="text-green-600" size={24} />
                <div>
                  <p className="font-medium text-green-700">공개중</p>
                  <p className="text-sm text-gray-500">모든 사람이 이 전시를 볼 수 있습니다</p>
                </div>
              </>
            ) : (
              <>
                <Lock className="text-gray-400" size={24} />
                <div>
                  <p className="font-medium text-gray-700">비공개</p>
                  <p className="text-sm text-gray-500">나만 이 전시를 볼 수 있습니다</p>
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
                처리중...
              </>
            ) : exhibition.is_public ? (
              <>
                <Lock size={16} className="mr-2" />
                비공개로 전환
              </>
            ) : (
              <>
                <Globe size={16} className="mr-2" />
                전시 공개하기
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Artworks Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">작품 관리 ({artworks.length}개)</h2>
          <label>
            <Button disabled={isUploading} className="cursor-pointer">
              <Plus size={16} className="mr-1" />
              {isUploading ? '업로드 중...' : '작품 추가'}
            </Button>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
          </label>
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
        <h2 className="text-lg font-bold text-red-900 mb-2">위험 구역</h2>
        <p className="text-sm text-red-700 mb-4">
          전시를 삭제하면 모든 작품도 함께 삭제되며 복구할 수 없습니다.
        </p>
        <Button
          onClick={() => {
            setDeleteTarget({ type: 'exhibition' })
            setShowDeleteModal(true)
          }}
          className="bg-red-600 hover:bg-red-700"
        >
          <Trash2 size={16} className="mr-2" />
          전시 삭제
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
        title={deleteTarget?.type === 'exhibition' ? '전시 삭제' : '작품 삭제'}
        message={
          deleteTarget?.type === 'exhibition'
            ? '이 전시를 삭제하시겠습니까?\n모든 작품도 함께 삭제되며 복구할 수 없습니다.'
            : '이 작품을 삭제하시겠습니까?\n삭제된 작품은 복구할 수 없습니다.'
        }
        isDeleting={isDeleting}
      />
    </div>
  )
}
