'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExhibitionData } from '@/types/exhibition'
import { Image, FileDown, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface VirtualExhibitionPromptProps {
  data: ExhibitionData
  onComplete: () => void
}

export function VirtualExhibitionPrompt({
  data,
  onComplete,
}: VirtualExhibitionPromptProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()

  const createVirtualExhibition = async () => {
    // This would create the virtual exhibition settings
    try {
      const response = await fetch('/api/exhibition/virtual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exhibitionId: data.id,
          templateType: '2.5d_fixed',
          artworks: data.images.map((url, i) => ({
            imageUrl: url,
            title: `작품 ${i + 1}`,
            description: '',
            order: i,
          })),
        }),
      })

      if (response.ok) {
        onComplete()
      }
    } catch (error) {
      console.error('Error creating virtual exhibition:', error)
    }
  }

  const downloadPDF = async () => {
    if (!data.id) {
      toast({
        title: '오류',
        description: '전시 ID가 없습니다. 전시를 먼저 생성해주세요.',
        variant: 'destructive',
      })
      return
    }

    setIsDownloading(true)

    try {
      const response = await fetch('/api/generate/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exhibitionId: data.id }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'PDF 생성 실패')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${data.selectedTitle || '전시패키지'}_패키지.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: 'PDF 다운로드 완료',
        description: '전시 패키지가 성공적으로 다운로드되었습니다.',
      })
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast({
        title: 'PDF 다운로드 실패',
        description: error instanceof Error ? error.message : 'PDF 다운로드 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>전시 완성</CardTitle>
          <CardDescription>
            전시 기획이 완료되었습니다! 가상 전시를 만들거나 패키지를 다운로드하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 border rounded-lg space-y-3 opacity-60">
              <Image className="w-10 h-10 text-muted-foreground" />
              <h3 className="font-semibold text-lg">온라인 가상 전시 생성</h3>
              <p className="text-sm text-muted-foreground">
                2.5D 가상 갤러리에서 작품을 전시하고 전 세계와 공유하세요.
              </p>
              <Button disabled className="w-full">
                개발 중
              </Button>
            </div>

            <div className="p-6 border rounded-lg space-y-3">
              <FileDown className="w-10 h-10 text-primary" />
              <h3 className="font-semibold text-lg">전시 패키지 다운로드</h3>
              <p className="text-sm text-muted-foreground">
                서문, 소개, 보도자료, 마케팅 리포트를 PDF로 다운로드하세요.
              </p>
              <Button
                onClick={downloadPDF}
                variant="outline"
                className="w-full"
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  'PDF 다운로드'
                )}
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2">생성된 콘텐츠</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✓ 전시 타이틀: {data.selectedTitle}</li>
              <li>✓ 키워드: {data.keywords.join(', ')}</li>
              {data.introduction && <li>✓ 전시 소개문</li>}
              {data.preface && <li>✓ 전시 서문</li>}
              {data.pressRelease && <li>✓ 보도자료</li>}
              {data.marketingReport && <li>✓ 마케팅 리포트</li>}
              <li>✓ 작품 이미지: {data.images.length}개</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onComplete} size="lg">
          완료
        </Button>
      </div>
    </div>
  )
}
