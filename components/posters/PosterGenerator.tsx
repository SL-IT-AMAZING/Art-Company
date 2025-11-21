'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Wand2, Download, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

export interface PosterGeneratorProps {
  exhibitionId: string
  title: string
  artistName?: string
  keywords?: string[]
  onPosterGenerated?: (imageUrl: string) => void
}

export function PosterGenerator({
  exhibitionId,
  title,
  artistName,
  keywords,
  onPosterGenerated,
}: PosterGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [posterUrl, setPosterUrl] = useState<string | null>(null)
  const { toast } = useToast()

  const handleGenerate = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch('/api/posters/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exhibitionId,
          title,
          artistName,
          keywords,
          style: 'Modern Contemporary Art',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate poster')
      }

      const data = await response.json()

      setPosterUrl(data.imageUrl)
      onPosterGenerated?.(data.imageUrl)

      toast({
        title: '포스터 생성 완료!',
        description: 'AI가 전시 포스터를 생성했습니다.',
      })
    } catch (error) {
      console.error('Poster generation error:', error)
      toast({
        title: '포스터 생성 실패',
        description: '포스터 생성 중 오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (!posterUrl) return

    try {
      const response = await fetch(posterUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title}-poster.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: '다운로드 완료',
        description: '포스터가 다운로드되었습니다.',
      })
    } catch (error) {
      toast({
        title: '다운로드 실패',
        description: '포스터 다운로드 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5" />
          AI 포스터 생성
        </CardTitle>
        <CardDescription>
          DALL-E 3를 사용하여 전문적인 전시 포스터를 자동 생성합니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!posterUrl ? (
          <div className="space-y-4">
            <div className="bg-muted p-6 rounded-lg text-center">
              <p className="text-muted-foreground mb-4">
                전시 제목과 키워드를 바탕으로 AI가 고품질 포스터를 생성합니다
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {keywords?.map((keyword, index) => (
                  <span
                    key={index}
                    className="bg-background px-3 py-1 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  포스터 생성 중... (약 15초 소요)
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  AI 포스터 생성하기
                </>
              )}
            </Button>

            {isGenerating && (
              <div className="text-sm text-muted-foreground text-center">
                <p>AI가 전시 포스터를 디자인하고 있습니다...</p>
                <p className="mt-1">
                  DALL-E 3 HD 품질로 생성됩니다 (1024x1792)
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative aspect-[1024/1792] max-w-md mx-auto rounded-lg overflow-hidden border-2 border-border">
              <Image
                src={posterUrl}
                alt="Generated poster"
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              포스터 생성 완료!
            </div>

            <div className="flex gap-2">
              <Button onClick={handleDownload} className="flex-1" size="lg">
                <Download className="w-4 h-4 mr-2" />
                포스터 다운로드
              </Button>
              <Button
                onClick={handleGenerate}
                variant="outline"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
