'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { ExhibitionData, MarketingReport } from '@/types/exhibition'
import { createClient } from '@/lib/supabase/client'

interface MarketingReportGeneratorProps {
  data: ExhibitionData
  onComplete: (report: MarketingReport) => void
}

export function MarketingReportGenerator({
  data,
  onComplete,
}: MarketingReportGeneratorProps) {
  const t = useTranslations('marketing')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const [isGenerating, setIsGenerating] = useState(false)
  const [report, setReport] = useState<MarketingReport | null>(null)
  const [error, setError] = useState('')

  const generateReport = async () => {
    setIsGenerating(true)
    setError('')

    try {
      const response = await fetch('/api/generate/marketing-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exhibitionId: data.id,
          title: data.selectedTitle,
          keywords: data.keywords,
          introduction: data.introduction,
          preface: data.preface,
          locale,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate marketing report')
      }

      const result = await response.json()
      setReport(result.marketingReport)

      // Save to database for PDF generation
      // Using delete-then-insert because the DB is missing UNIQUE constraint for upsert to work
      if (data.id && result.marketingReport) {
        const supabase = createClient()

        // First, delete any existing marketing report for this exhibition
        await supabase
          .from('exhibition_content')
          .delete()
          .eq('exhibition_id', data.id)
          .eq('content_type', 'marketing_report')

        // Then insert the new one
        const { error: saveError } = await supabase
          .from('exhibition_content')
          .insert({
            exhibition_id: data.id,
            content_type: 'marketing_report',
            content: result.marketingReport,
          })

        if (saveError) {
          console.error('Failed to save marketing report:', saveError)
          throw new Error(t('generationFailed'))
        }

        console.log('Marketing report saved successfully for exhibition:', data.id)
      } else if (!data.id) {
        console.warn('Marketing report not saved - missing exhibition ID')
        throw new Error(t('generationFailed'))
      }
    } catch (err) {
      console.error('Error generating marketing report:', err)
      setError(t('generationError'))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleComplete = () => {
    if (report) {
      onComplete(report)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {t('generatingDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!report && !isGenerating && (
          <Button onClick={generateReport} size="lg" className="w-full">
            {t('generate')}
          </Button>
        )}

        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-muted-foreground">
              {t('generating')}
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
            <p className="text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={generateReport}
              className="mt-2"
            >
              {t('retry')}
            </Button>
          </div>
        )}

        {report && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">{t('overview')}</h3>
              <p className="text-sm text-muted-foreground">{report.overview}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{t('targetAudience')}</h3>
              <ul className="list-disc list-inside space-y-1">
                {report.targetAudience.map((target, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {target}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{t('marketingPoints')}</h3>
              <ul className="list-disc list-inside space-y-1">
                {report.marketingPoints.map((point, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{t('pricingStrategy')}</h3>
              <p className="text-sm text-muted-foreground">
                {report.pricingStrategy}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{t('promotionStrategy')}</h3>
              <ul className="list-disc list-inside space-y-1">
                {report.promotionStrategy.map((strategy, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {strategy}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={generateReport}>
                {t('regenerate')}
              </Button>
              <Button onClick={handleComplete} size="lg" className="flex-1">
                {tCommon('confirm')}
              </Button>
            </div>
          </div>
        )}

        {/* Skip option */}
        <div className="text-center pt-4">
          <Button variant="ghost" onClick={() => onComplete({
            overview: '',
            targetAudience: [],
            marketingPoints: [],
            pricingStrategy: '',
            promotionStrategy: []
          })}>
            {t('skip')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
