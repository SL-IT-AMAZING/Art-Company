'use client'

import { useTranslations } from 'next-intl'
import { ExhibitionData } from '@/types/exhibition'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ContentPreviewProps {
  data: ExhibitionData
  onNext: () => void
  onEdit?: (contentType: string) => void
}

export function ContentPreview({ data, onNext, onEdit }: ContentPreviewProps) {
  const t = useTranslations('contentPreview')
  const tCommon = useTranslations('common')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>
            {t('subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              {t('exhibitionTitle')}
            </h3>
            <p className="text-xl font-bold">{data.selectedTitle}</p>
          </div>

          {/* Keywords */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              {t('keywords')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Introduction */}
          {data.introduction && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  {t('introduction')}
                </h3>
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit('introduction')}
                  >
                    {tCommon('edit')}
                  </Button>
                )}
              </div>
              <p className="text-sm leading-relaxed">{data.introduction}</p>
            </div>
          )}

          {/* Preface */}
          {data.preface && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  {t('preface')}
                </h3>
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit('preface')}
                  >
                    {tCommon('edit')}
                  </Button>
                )}
              </div>
              <p className="text-sm leading-relaxed">{data.preface}</p>
            </div>
          )}


          {/* Images */}
          {data.images.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                {t('uploadedArtworks')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {data.images.length} {t('artworkImages')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onNext} size="lg">
          {t('nextStep')}
        </Button>
      </div>
    </div>
  )
}
