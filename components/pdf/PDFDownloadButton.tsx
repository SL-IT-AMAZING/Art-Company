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
      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exhibitionId }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      // Get HTML content
      const htmlContent = await response.text()

      // Open in new window for PDF print
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()

        // Trigger print dialog after load
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print()
          }, 500)
        }
      }

      toast({
        title: 'PDF 생성 완료',
        description: '인쇄 대화상자에서 "PDF로 저장"을 선택하세요.',
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
