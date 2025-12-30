'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Download, Loader2, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export interface PDFDownloadButtonProps {
  exhibitionId: string
  exhibitionTitle: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  locale?: string
}

export function PDFDownloadButton({
  exhibitionId,
  exhibitionTitle,
  variant = 'default',
  size = 'default',
  locale: localeProp,
}: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()
  const currentLocale = useLocale()
  const locale = localeProp || currentLocale

  const handleDownload = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch('/api/generate/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exhibitionId, locale }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('[PDF Download] Error response:', errorData)
        console.error('[PDF Download] Status:', response.status)
        console.error('[PDF Download] Locale:', locale)

        let errorMsg = errorData.error || 'PDF 생성에 실패했습니다.'

        if (errorData.details) {
          console.error('[PDF Download] Error details:', errorData.details)

          if (errorData.details === 'MARKDOWN_PARSE_ERROR') {
            errorMsg += '\n\n팁: 전시 콘텐츠를 다시 생성한 후 시도해보세요.'
          } else if (errorData.details === 'BROWSER_ERROR') {
            errorMsg += '\n\n일시적인 서버 문제입니다. 잠시 후 다시 시도해주세요.'
          }
        }

        if (errorData.debugInfo && process.env.NODE_ENV === 'development') {
          console.error('[PDF Download] Debug:', errorData.debugInfo)
        }

        throw new Error(errorMsg)
      }

      // Get PDF blob and download directly
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${exhibitionTitle || 'exhibition'}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: 'PDF 다운로드 완료',
        description: 'PDF 파일이 다운로드되었습니다.',
      })
    } catch (error) {
      console.error('PDF generation error:', error)
      toast({
        title: 'PDF 생성 실패',
        description: 'PDF 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating}
      variant={variant}
      size={size}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          생성 중...
        </>
      ) : (
        <>
          {size === 'sm' ? (
            <FileText className="w-4 h-4 mr-1" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          PDF 다운로드
        </>
      )}
    </Button>
  )
}
