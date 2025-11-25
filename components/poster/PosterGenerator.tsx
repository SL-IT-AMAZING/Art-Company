'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { ExhibitionData } from '@/types/exhibition'

interface PosterGeneratorProps {
  data: ExhibitionData
  onComplete: () => void
}

export function PosterGenerator({ data, onComplete }: PosterGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [posterUrl, setPosterUrl] = useState<string>('')
  const [error, setError] = useState('')

  const generatePoster = async () => {
    setIsGenerating(true)
    setError('')

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
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate poster')
      }

      const result = await response.json()
      setPosterUrl(result.posterUrl)
    } catch (err) {
      console.error('Error generating poster:', err)
      setError('포스터 생성 중 오류가 발생했습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>전시 포스터 생성</CardTitle>
        <CardDescription>
          전시 타이틀과 대표 이미지로 포스터를 생성합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!posterUrl && !isGenerating && (
          <Button onClick={generatePoster} size="lg" className="w-full">
            포스터 생성하기
          </Button>
        )}

        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-muted-foreground">포스터를 생성하고 있습니다...</p>
            <p className="text-sm font-medium text-primary mt-2">예상 소요시간: 약 1-2분</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
            <p className="text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={generatePoster}
              className="mt-2"
            >
              다시 시도
            </Button>
          </div>
        )}

        {posterUrl && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative w-1/4 aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={posterUrl}
                  alt="Generated Poster"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={generatePoster}>
                다시 생성
              </Button>
              <Button onClick={onComplete} size="lg" className="flex-1">
                포스터 확정
              </Button>
            </div>
          </div>
        )}

        {/* Skip option */}
        <div className="text-center pt-4">
          <Button variant="ghost" onClick={onComplete}>
            포스터 생성 건너뛰기
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
