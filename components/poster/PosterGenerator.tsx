'use client'

import { useState, useMemo } from 'react'
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
  // 패턴 1: "한글 제목 / English Title" (슬래시 구분)
  const slashMatch = title.match(/^(.+?)\s*[\/／]\s*(.+?)$/)
  if (slashMatch) {
    const part1 = slashMatch[1].trim()
    const part2 = slashMatch[2].trim()
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
    return date.toLocaleDateString('ko-KR', {
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
      setError('포스터에 사용할 이미지를 선택해주세요.')
      return
    }

    setIsGenerating(true)
    setError('')
    setShowConfig(false)
    setShowPreview(false)

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

      setPosters(result.posters)
    } catch (err: unknown) {
      console.error('Error generating poster:', err)
      const message = err instanceof Error ? err.message : '포스터 생성 중 오류가 발생했습니다.'
      setError(message.includes('Failed') || message.includes('서비스')
        ? '포스터 생성 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.'
        : `포스터 생성 중 오류: ${message}`)
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
        <CardTitle>전시 포스터 생성</CardTitle>
        <CardDescription>
          전문적인 포스터를 생성하여 전시회를 홍보하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration Section */}
        {showConfig && posters.length === 0 && !isGenerating && (
          <div className="space-y-6">
            {/* Description */}
            <div className="text-center space-y-2 py-4">
              <h3 className="font-semibold text-lg">포스터 이미지 선택</h3>
              <p className="text-sm text-muted-foreground">
                포스터에 사용할 이미지를 선택하세요
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
              다음: 정보 확인
            </Button>
          </div>
        )}

        {/* Information Preview Section */}
        {showPreview && posters.length === 0 && !isGenerating && (
          <div className="space-y-6">
            <div className="flex items-center justify-between py-4">
              <div>
                <h3 className="font-semibold text-lg">포스터 정보 확인</h3>
                <p className="text-sm text-muted-foreground">
                  아래 정보가 포스터에 표시됩니다
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit2 className="w-4 h-4 mr-1" />
                {isEditing ? '완료' : '수정'}
              </Button>
            </div>

            <Card className="bg-gray-50">
              <CardContent className="pt-6 space-y-4">
                {/* Title */}
                <div>
                  <Label className="text-xs font-medium text-gray-500">전시회 제목</Label>
                  {isEditing ? (
                    <Input
                      value={editableTitle}
                      onChange={(e) => setEditableTitle(e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg font-bold mt-1">{posterTitle || '제목 없음'}</p>
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
                        한글
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
                        English
                      </button>
                    </div>
                  )}
                </div>

                {/* Artist */}
                <div>
                  <Label className="text-xs font-medium text-gray-500">작가명</Label>
                  {isEditing ? (
                    <Input
                      value={editableArtist}
                      onChange={(e) => setEditableArtist(e.target.value)}
                      className="mt-1"
                      placeholder="작가명 입력 (선택사항)"
                    />
                  ) : (
                    <p className="text-base mt-1">{editableArtist || '-'}</p>
                  )}
                </div>

                {/* Date Range */}
                <div>
                  <Label className="text-xs font-medium text-gray-500">전시 기간</Label>
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
                        placeholder="종료일 (선택사항)"
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
                  <Label className="text-xs font-medium text-gray-500">장소</Label>
                  {isEditing ? (
                    <Input
                      value={editableVenue}
                      onChange={(e) => setEditableVenue(e.target.value)}
                      className="mt-1"
                      placeholder="장소 입력 (선택사항)"
                    />
                  ) : (
                    <p className="text-base mt-1">{editableVenue || '-'}</p>
                  )}
                </div>

                {/* Reference Image */}
                {referenceImage && (
                  <div>
                    <Label className="text-xs font-medium text-gray-500">선택한 이미지</Label>
                    <div className="mt-2">
                      <img
                        src={referenceImage}
                        alt="선택한 이미지"
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
                이전
              </Button>
              <Button onClick={generatePoster} size="lg" className="flex-1">
                포스터 생성하기
              </Button>
            </div>
          </div>
        )}

        {/* Generating State */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-muted-foreground">포스터를 생성하고 있습니다...</p>
            <p className="text-sm font-medium text-primary mt-2">
              예상 소요시간: 약 10초
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
                설정 변경
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={generatePoster}
              >
                다시 시도
              </Button>
            </div>
          </div>
        )}

        {/* Result State - Show all posters */}
        {posters.length > 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">생성된 포스터</h3>
              <p className="text-sm text-muted-foreground">포스터를 다운로드하세요</p>
            </div>

            {/* Center-aligned posters */}
            <div className="flex flex-col items-center gap-6">
              {posters.map((poster) => (
                <div key={poster.template} className="w-full max-w-xs space-y-3">
                  <div className="relative aspect-[4961/7016] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-lg">
                    <img
                      src={poster.url}
                      alt="생성된 포스터"
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
                    다운로드
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRegenerate}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                다시 생성
              </Button>
              <Button onClick={onComplete} size="lg" className="flex-1">
                완료
              </Button>
            </div>
          </div>
        )}

        {/* Skip option */}
        {posters.length === 0 && !isGenerating && (
          <div className="text-center pt-4">
            <Button variant="ghost" onClick={onComplete}>
              포스터 생성 건너뛰기
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
