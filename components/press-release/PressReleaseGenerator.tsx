'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { ExhibitionData } from '@/types/exhibition'
import { createClient } from '@/lib/supabase/client'
import { mapStepToContentType } from '@/lib/utils/helpers'
import ReactMarkdown from 'react-markdown'

interface PressReleaseGeneratorProps {
  data: ExhibitionData
  onComplete: () => void
}

export function PressReleaseGenerator({
  data,
  onComplete,
}: PressReleaseGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [pressRelease, setPressRelease] = useState<string | null>(null)
  const [error, setError] = useState('')
  const supabase = createClient()

  const generatePressRelease = async () => {
    setIsGenerating(true)
    setError('')

    try {
      const response = await fetch('/api/generate/press-release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exhibitionId: data.id,
          title: data.selectedTitle,
          keywords: data.keywords,
          introduction: data.introduction,
          preface: data.preface,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate press release')
      }

      const result = await response.json()
      setPressRelease(result.pressRelease)

      // Save press release to database
      if (data.id && result.pressRelease) {
        await supabase
          .from('exhibition_content')
          .insert({
            exhibition_id: data.id,
            content_type: 'press_release',
            content: result.pressRelease,
          })
      }
    } catch (err) {
      console.error('Error generating press release:', err)
      setError('보도자료 생성 중 오류가 발생했습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleComplete = () => {
    onComplete()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>보도자료 생성</CardTitle>
        <CardDescription>
          전시를 위한 전문적인 보도자료를 생성합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!pressRelease && !isGenerating && (
          <Button onClick={generatePressRelease} size="lg" className="w-full">
            보도자료 생성하기
          </Button>
        )}

        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-muted-foreground">
              보도자료를 생성하고 있습니다...
            </p>
            <p className="text-sm font-medium text-primary mt-2">예상 소요시간: 약 10-15초</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
            <p className="text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={generatePressRelease}
              className="mt-2"
            >
              다시 시도
            </Button>
          </div>
        )}

        {pressRelease && (
          <div className="space-y-6">
            <div className="p-6 bg-muted rounded-lg">
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-3 prose-headings:my-4 prose-ul:my-3 prose-ol:my-3 prose-li:my-1">
                <ReactMarkdown>{pressRelease}</ReactMarkdown>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={generatePressRelease}>
                다시 생성
              </Button>
              <Button onClick={handleComplete} size="lg" className="flex-1">
                보도자료 확정
              </Button>
            </div>
          </div>
        )}

        {/* Skip option */}
        <div className="text-center pt-4">
          <Button variant="ghost" onClick={() => onComplete()}>
            보도자료 건너뛰기
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
