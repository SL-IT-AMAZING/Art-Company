'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
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
  const t = useTranslations('virtual')
  const tCommon = useTranslations('common')
  const tErrors = useTranslations('errors')
  const locale = useLocale()
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
            title: tCommon('artworkNum', { num: i + 1 }),
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
        title: tCommon('error'),
        description: t('createExhibitionFirst'),
        variant: 'destructive',
      })
      return
    }

    setIsDownloading(true)

    try {
      const response = await fetch('/api/generate/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exhibitionId: data.id, locale }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('[PDF Client] Error response:', errorData)
        console.error('[PDF Client] Status:', response.status)
        console.error('[PDF Client] Locale:', locale)

        // Build detailed error message
        let errorMsg = errorData.error || t('pdfGenerationFailed')

        if (errorData.details) {
          console.error('[PDF Client] Error details:', errorData.details)

          // Add user-friendly guidance based on error type
          if (errorData.details === 'MARKDOWN_PARSE_ERROR') {
            const guidance = locale === 'en'
              ? '\n\nTip: Try regenerating the exhibition content (Introduction, Preface, etc.) and try again.'
              : '\n\n팁: 전시 콘텐츠(소개, 서문 등)를 다시 생성한 후 시도해보세요.'
            errorMsg += guidance
          } else if (errorData.details === 'BROWSER_ERROR') {
            const guidance = locale === 'en'
              ? '\n\nThis is a temporary server issue. Please try again in a few minutes.'
              : '\n\n일시적인 서버 문제입니다. 몇 분 후 다시 시도해주세요.'
            errorMsg += guidance
          }
        }

        if (errorData.debugInfo && process.env.NODE_ENV === 'development') {
          console.error('[PDF Client] Debug info:', errorData.debugInfo)
        }

        throw new Error(errorMsg)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${data.selectedTitle || t('exhibitionPackage')}_package.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: t('pdfDownloadComplete'),
        description: t('pdfDownloadSuccess'),
      })
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast({
        title: t('pdfDownloadFailed'),
        description: error instanceof Error ? error.message : tErrors('pdfGenerationFailed'),
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
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>
            {t('subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 border rounded-lg space-y-3">
              <Image className="w-10 h-10 text-primary" />
              <h3 className="font-semibold text-lg">{t('onlineExhibition')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('onlineExhibitionDesc')}
              </p>
              <div className="w-full py-2 px-4 bg-green-50 text-green-700 rounded-md text-center font-medium">
                {t('creationComplete')}
              </div>
            </div>

            <div className="p-6 border rounded-lg space-y-3">
              <FileDown className="w-10 h-10 text-primary" />
              <h3 className="font-semibold text-lg">{t('downloadPackage')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('downloadPackageDesc')}
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
                    {t('pdfGenerating')}
                  </>
                ) : (
                  t('pdfDownload')
                )}
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2">{t('generatedContent')}</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✓ {t('exhibitionTitle')}: {data.selectedTitle}</li>
              <li>✓ {t('keywords')}: {data.keywords.join(', ')}</li>
              {data.introduction && <li>✓ {t('exhibitionIntro')}</li>}
              {data.preface && <li>✓ {t('exhibitionPreface')}</li>}
              {data.pressRelease && <li>✓ {t('pressRelease')}</li>}
              {data.marketingReport && <li>✓ {t('marketingReport')}</li>}
              <li>✓ {t('artworkImages')}: {data.images.length}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onComplete} size="lg">
          {tCommon('complete')}
        </Button>
      </div>
    </div>
  )
}
