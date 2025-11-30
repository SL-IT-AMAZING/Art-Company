'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export interface PDFDownloadButtonProps {
  exhibitionId: string
  exhibitionTitle: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

export function PDFDownloadButton({
  exhibitionId,
  exhibitionTitle,
  variant = 'default',
  size = 'default',
}: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleDownload = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch('/api/generate/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exhibitionId }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
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
