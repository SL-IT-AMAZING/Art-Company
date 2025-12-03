'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Download, ChevronLeft } from 'lucide-react'
import { ExhibitionData } from '@/types/exhibition'
import { PosterMode, TemplateStyle, FontPresetId } from '@/lib/poster-templates'
import { PosterModeSelector } from './PosterModeSelector'
import { TemplatePreview } from './TemplatePreview'
import { FontSelector } from './FontSelector'

interface PosterGeneratorProps {
  data: ExhibitionData
  onComplete: () => void
}

export function PosterGenerator({ data, onComplete }: PosterGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [posterUrl, setPosterUrl] = useState<string>('')
  const [error, setError] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)

  // New state for poster configuration
  const [posterMode, setPosterMode] = useState<PosterMode>('ai-background')
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateStyle>('swiss-minimalist')
  const [selectedFont, setSelectedFont] = useState<FontPresetId>('helvetica-clean')
  const [recommendedTemplate, setRecommendedTemplate] = useState<TemplateStyle>()
  const [showConfig, setShowConfig] = useState(true)

  const allTemplates: TemplateStyle[] = [
    'swiss-minimalist',
    'vibrant-contemporary',
    'bold-brutalist',
    'classic-elegant',
  ]

  const handleDownload = async () => {
    if (!posterUrl) return
    setIsDownloading(true)
    try {
      const response = await fetch(posterUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `poster-${data.selectedTitle || 'exhibition'}-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setIsDownloading(false)
    }
  }

  const generatePoster = async () => {
    setIsGenerating(true)
    setError('')
    setShowConfig(false)

    try {
      const response = await fetch('/api/generate/poster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exhibitionId: data.id,
          title: data.selectedTitle,
          keywords: data.keywords,
          mainImage: data.images[0],
          artistName: data.artistName,
          exhibitionDate: data.exhibitionDate,
          exhibitionEndDate: data.exhibitionEndDate,
          venue: data.venue,
          location: data.location,
          openingHours: data.openingHours,
          admissionFee: data.admissionFee,
          // New parameters
          mode: posterMode,
          template: selectedTemplate,
          font: selectedFont,
          artworkUrls: data.images, // Send all uploaded images
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Poster generation failed:', result)
        const errorMessage = result.error || 'Failed to generate poster'
        const details = result.details || ''
        throw new Error(details ? `${errorMessage}: ${details}` : errorMessage)
      }

      if (!result.posterUrl) {
        throw new Error('No poster URL returned')
      }

      setPosterUrl(result.posterUrl)

      // Save recommended template if provided
      if (result.recommendedTemplate) {
        setRecommendedTemplate(result.recommendedTemplate)
      }
    } catch (err: any) {
      console.error('Error generating poster:', err)
      const message = err?.message || '포스터 생성 중 오류가 발생했습니다.'
      setError(message.includes('Failed') || message.includes('서비스')
        ? '포스터 생성 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.'
        : `포스터 생성 중 오류: ${message}`)
      setShowConfig(true)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = () => {
    setPosterUrl('')
    setError('')
    setShowConfig(true)
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
        {showConfig && !posterUrl && !isGenerating && (
          <div className="space-y-6">
            {/* Mode Selector */}
            <PosterModeSelector
              selectedMode={posterMode}
              onModeChange={setPosterMode}
            />

            {/* Template Selector */}
            <TemplatePreview
              templates={allTemplates}
              selectedTemplate={selectedTemplate}
              onTemplateChange={setSelectedTemplate}
              recommendedTemplate={recommendedTemplate}
            />

            {/* Font Selector */}
            <FontSelector
              selectedFont={selectedFont}
              onFontChange={setSelectedFont}
              templateStyle={selectedTemplate}
            />

            {/* Generate Button */}
            <Button onClick={generatePoster} size="lg" className="w-full">
              포스터 생성하기
            </Button>
          </div>
        )}

        {/* Generating State */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-muted-foreground">포스터를 생성하고 있습니다...</p>
            <p className="text-sm font-medium text-primary mt-2">
              {posterMode === 'ai-background'
                ? '예상 소요시간: 약 1-2분'
                : '예상 소요시간: 약 30초'}
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

        {/* Result State */}
        {posterUrl && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative max-w-sm w-full aspect-[1024/1792] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-lg">
                <img
                  src={posterUrl}
                  alt="Generated Poster"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRegenerate}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                다시 설정
              </Button>
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                다운로드
              </Button>
              <Button onClick={onComplete} size="lg" className="flex-1">
                포스터 확정
              </Button>
            </div>
          </div>
        )}

        {/* Skip option */}
        {!posterUrl && !isGenerating && (
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
