'use client'

import { useState, useMemo } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Download, ChevronLeft, Edit2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ExhibitionData } from '@/types/exhibition'
import { ReferencePosterSelector } from './ReferencePosterSelector'
import { cn } from '@/lib/utils/helpers'

interface PosterGeneratorProps {
  data: ExhibitionData
  onComplete: () => void
}

// 타이틀에서 한글/영어 분리
function parseBilingualTitle(title: string): { korean: string; english: string } | null {
  // 패턴 1: "한글 제목 / English Title" (슬래시, 콜론, 파이프 등 구분)
  const separatorMatch = title.match(/^(.+?)\s*[\/／\|｜:：]\s*(.+?)$/)
  if (separatorMatch) {
    const part1 = separatorMatch[1].trim()
    const part2 = separatorMatch[2].trim()
    // part2가 영어로 시작하는지 확인
    if (/^[A-Za-z]/.test(part2)) {
      return { korean: part1, english: part2 }
    }
  }

  // 패턴 2: "한글 제목 (English Title)" (괄호 구분)
  const parenMatch = title.match(/^(.+?)\s*[\(（](.+?)[\)）]$/)
  if (parenMatch) {
    const korean = parenMatch[1].trim()
    const english = parenMatch[2].trim()
    if (/^[A-Za-z]/.test(english)) {
      return { korean, english }
    }
  }

  return null
}

export function PosterGenerator({ data, onComplete }: PosterGeneratorProps) {
  const t = useTranslations('poster')
  const locale = useLocale()
  const [isGenerating, setIsGenerating] = useState(false)
  const [posters, setPosters] = useState<Array<{ template: string; url: string }>>([])
  const [error, setError] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)

  const [showConfig, setShowConfig] = useState(true)
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Editable poster info state
  const [editableTitle, setEditableTitle] = useState(data.selectedTitle || '')
  const [editableArtist, setEditableArtist] = useState(data.artistName || '')
  const [editableStartDate, setEditableStartDate] = useState(data.exhibitionDate || '')
  const [editableEndDate, setEditableEndDate] = useState(data.exhibitionEndDate || '')
  const [editableVenue, setEditableVenue] = useState(data.venue || '')
  const [isEditing, setIsEditing] = useState(false)
  const [titleLanguage, setTitleLanguage] = useState<'korean' | 'english'>('korean')

  // 원본 타이틀이 한글/영어 병기인지 확인 (직접 수정하지 않은 경우에만)
  const bilingualTitle = useMemo(() => {
    // 타이틀을 수정하지 않은 경우에만 병기 옵션 제공
    if (editableTitle === data.selectedTitle) {
      return parseBilingualTitle(editableTitle)
    }
    return null
  }, [editableTitle, data.selectedTitle])

  // 실제 포스터에 사용할 타이틀
  const posterTitle = useMemo(() => {
    if (bilingualTitle) {
      return titleLanguage === 'korean' ? bilingualTitle.korean : bilingualTitle.english
    }
    return editableTitle
  }, [bilingualTitle, titleLanguage, editableTitle])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleShowPreview = () => {
    setShowPreview(true)
    setShowConfig(false)
  }

  const handleBackToConfig = () => {
    setShowPreview(false)
    setShowConfig(true)
  }

  const handleDownload = async (posterUrl: string, templateName: string) => {
    if (!posterUrl) return
    setIsDownloading(true)
    try {
      const response = await fetch(posterUrl)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `poster-${data.selectedTitle || 'exhibition'}-${templateName}-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setIsDownloading(false)
    }
  }

  const generatePoster = async () => {
    if (!referenceImage) {
      setError(t('selectImageError'))
      return
    }

    setIsGenerating(true)
    setError('')
    setShowConfig(false)
    setShowPreview(false)

    console.log('[PosterGenerator] Starting poster generation with:', {
      exhibitionId: data.id,
      title: posterTitle,
      referenceImage: referenceImage?.substring(0, 50) + '...',
    })

    try {
      const response = await fetch('/api/generate/poster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exhibitionId: data.id,
          title: posterTitle,
          artistName: editableArtist,
          exhibitionDate: editableStartDate,
          exhibitionEndDate: editableEndDate,
          venue: editableVenue,
          referenceImage: referenceImage,
          locale: locale,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Poster generation failed:', result)
        const errorMessage = result.error || 'Failed to generate poster'
        throw new Error(errorMessage)
      }

      if (!result.posters || result.posters.length === 0) {
        throw new Error('No posters returned')
      }

      console.log('[PosterGenerator] API Response:', {
        savedToDb: result.savedToDb,
        dbError: result.dbError,
        uploadError: result.uploadError,
        exhibitionId: result.exhibitionId,
      })

      setPosters(result.posters)
    } catch (err: unknown) {
      console.error('Error generating poster:', err)
      const message = err instanceof Error ? err.message : t('generationError')
      setError(message.includes('Failed') || message.includes('서비스')
        ? t('serviceError')
        : `${t('generationError')}: ${message}`)
      setShowConfig(true)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = () => {
    setPosters([])
    setError('')
    setShowConfig(true)
    setShowPreview(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {t('subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration Section */}
        {showConfig && posters.length === 0 && !isGenerating && (
          <div className="space-y-6">
            {/* Description */}
            <div className="text-center space-y-2 py-4">
              <h3 className="font-semibold text-lg">{t('selectImage')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('selectImageDesc')}
              </p>
            </div>

            {/* Reference Image Selector */}
            <ReferencePosterSelector
              selectedReference={referenceImage}
              onReferenceChange={setReferenceImage}
              artworkImages={data.images}
            />

            {/* Generate Button */}
            <Button
              onClick={handleShowPreview}
              size="lg"
              className="w-full"
              disabled={!referenceImage}
            >
              {t('nextConfirmInfo')}
            </Button>
          </div>
        )}

        {/* Information Preview Section */}
        {showPreview && posters.length === 0 && !isGenerating && (
          <div className="space-y-6">
            <div className="flex items-center justify-between py-4">
              <div>
                <h3 className="font-semibold text-lg">{t('confirmInfo')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('confirmInfoDesc')}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit2 className="w-4 h-4 mr-1" />
                {isEditing ? t('done') : t('edit')}
              </Button>
            </div>

            <Card className="bg-gray-50">
              <CardContent className="pt-6 space-y-4">
                {/* Title */}
                <div>
                  <Label className="text-xs font-medium text-gray-500">{t('exhibitionTitle')}</Label>
                  {isEditing ? (
                    <Input
                      value={editableTitle}
                      onChange={(e) => setEditableTitle(e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg font-bold mt-1">{posterTitle || t('noTitle')}</p>
                  )}

                  {/* 한글/영어 선택 (병기 타이틀인 경우에만) */}
                  {bilingualTitle && !isEditing && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => setTitleLanguage('korean')}
                        className={cn(
                          'px-3 py-1 text-sm rounded-full border transition-all',
                          titleLanguage === 'korean'
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                        )}
                      >
                        {t('korean')}
                      </button>
                      <button
                        onClick={() => setTitleLanguage('english')}
                        className={cn(
                          'px-3 py-1 text-sm rounded-full border transition-all',
                          titleLanguage === 'english'
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                        )}
                      >
                        {t('english')}
                      </button>
                    </div>
                  )}
                </div>

                {/* Artist */}
                <div>
                  <Label className="text-xs font-medium text-gray-500">{t('artistName')}</Label>
                  {isEditing ? (
                    <Input
                      value={editableArtist}
                      onChange={(e) => setEditableArtist(e.target.value)}
                      className="mt-1"
                      placeholder={t('artistNamePlaceholder')}
                    />
                  ) : (
                    <p className="text-base mt-1">{editableArtist || '-'}</p>
                  )}
                </div>

                {/* Date Range */}
                <div>
                  <Label className="text-xs font-medium text-gray-500">{t('exhibitionPeriod')}</Label>
                  {isEditing ? (
                    <div className="space-y-2 mt-1">
                      <Input
                        type="date"
                        value={editableStartDate}
                        onChange={(e) => setEditableStartDate(e.target.value)}
                      />
                      <Input
                        type="date"
                        value={editableEndDate}
                        onChange={(e) => setEditableEndDate(e.target.value)}
                        placeholder={t('endDate')}
                      />
                    </div>
                  ) : (
                    <p className="text-base mt-1">
                      {editableStartDate ? formatDate(editableStartDate) : '-'}
                      {editableEndDate && ` - ${formatDate(editableEndDate)}`}
                    </p>
                  )}
                </div>

                {/* Venue */}
                <div>
                  <Label className="text-xs font-medium text-gray-500">{t('venue')}</Label>
                  {isEditing ? (
                    <Input
                      value={editableVenue}
                      onChange={(e) => setEditableVenue(e.target.value)}
                      className="mt-1"
                      placeholder={t('venuePlaceholder')}
                    />
                  ) : (
                    <p className="text-base mt-1">{editableVenue || '-'}</p>
                  )}
                </div>

                {/* Reference Image */}
                {referenceImage && (
                  <div>
                    <Label className="text-xs font-medium text-gray-500">{t('selectedImage')}</Label>
                    <div className="mt-2">
                      <img
                        src={referenceImage}
                        alt={t('selectedImage')}
                        className="w-32 h-32 object-cover rounded border"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBackToConfig} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-1" />
                {t('previous')}
              </Button>
              <Button onClick={generatePoster} size="lg" className="flex-1">
                {t('generatePoster')}
              </Button>
            </div>
          </div>
        )}

        {/* Generating State */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-muted-foreground">{t('generating')}</p>
            <p className="text-sm font-medium text-primary mt-2">
              {t('estimatedTime')}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
            <p className="text-sm">{error}</p>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {t('changeSettings')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={generatePoster}
              >
                {t('retry')}
              </Button>
            </div>
          </div>
        )}

        {/* Result State - Show all posters */}
        {posters.length > 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">{t('generatedPoster')}</h3>
              <p className="text-sm text-muted-foreground">{t('downloadPoster')}</p>
            </div>

            {/* Center-aligned posters */}
            <div className="flex flex-col items-center gap-6">
              {posters.map((poster) => (
                <div key={poster.template} className="w-full max-w-xs space-y-3">
                  <div className="relative aspect-[4961/7016] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-lg">
                    <img
                      src={poster.url}
                      alt={t('generatedPoster')}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleDownload(poster.url, poster.template)}
                    disabled={isDownloading}
                    className="w-full"
                  >
                    {isDownloading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    {t('download')}
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRegenerate}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                {t('regenerate')}
              </Button>
              <Button onClick={onComplete} size="lg" className="flex-1">
                {t('complete')}
              </Button>
            </div>
          </div>
        )}

        {/* Skip option */}
        {posters.length === 0 && !isGenerating && (
          <div className="text-center pt-4">
            <Button variant="ghost" onClick={onComplete}>
              {t('skip')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
