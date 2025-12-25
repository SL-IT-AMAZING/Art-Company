'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export interface PreviewContent {
  title: string
  introduction?: string
  preface?: string
  artistBio?: string
  artworkDescriptions?: Array<{
    imageUrl: string
    title: string
    description: string
  }>
  pressRelease?: string
  marketingReport?: string
}

export interface ContentPreviewProps {
  content: PreviewContent
  keywords?: string[]
}

export function ContentPreview({ content, keywords }: ContentPreviewProps) {
  const t = useTranslations('content')
  const tCommon = useTranslations('common')

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            {content.title || tCommon('noTitle')}
          </CardTitle>
          {keywords && keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary">
                  {keyword}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Introduction */}
      {content.introduction && (
        <Card>
          <CardHeader>
            <CardTitle>{t('exhibitionIntro')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap font-serif leading-relaxed">
              {content.introduction}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Preface */}
      {content.preface && (
        <Card>
          <CardHeader>
            <CardTitle>{t('exhibitionPreface')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap font-serif leading-relaxed">
              {content.preface}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Artist Bio */}
      {content.artistBio && (
        <Card>
          <CardHeader>
            <CardTitle>{t('artistIntro')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap font-serif leading-relaxed">
              {content.artistBio}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Artwork Descriptions */}
      {content.artworkDescriptions && content.artworkDescriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('artworkIntro')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {content.artworkDescriptions.map((artwork, index) => (
              <div key={index}>
                {index > 0 && <Separator className="my-6" />}
                <div className="grid md:grid-cols-2 gap-4">
                  {artwork.imageUrl && (
                    <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
                      <img
                        src={artwork.imageUrl}
                        alt={artwork.title || tCommon('artworkNum', { num: index + 1 })}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{artwork.title}</h3>
                    <p className="whitespace-pre-wrap font-serif leading-relaxed text-muted-foreground">
                      {artwork.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Press Release */}
      {content.pressRelease && (
        <Card>
          <CardHeader>
            <CardTitle>{t('pressRelease')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap font-serif leading-relaxed">
              {content.pressRelease}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Marketing Report */}
      {content.marketingReport && (
        <Card>
          <CardHeader>
            <CardTitle>{t('marketingReport')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap font-serif leading-relaxed">
              {content.marketingReport}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
