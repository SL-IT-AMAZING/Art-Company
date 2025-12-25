'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExhibitionData } from '@/types/exhibition'
import { Check, Eye, Share2, FileText, Globe, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ExhibitionCompleteProps {
  data: ExhibitionData
}

export function ExhibitionComplete({ data }: ExhibitionCompleteProps) {
  const t = useTranslations('complete')
  const tVirtual = useTranslations('virtual')
  const tErrors = useTranslations('errors')
  const [isPublishing, setIsPublishing] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const supabase = createClient()

  const shareUrl = data.id
    ? `${window.location.origin}/exhibition/${data.id}`
    : ''

  const copyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      alert(tVirtual('linkCopied'))
    }
  }

  const publishExhibition = async () => {
    if (!data.id) {
      alert(tVirtual('exhibitionIdMissing'))
      return
    }

    setIsPublishing(true)

    try {
      const { error } = await supabase
        .from('exhibitions')
        .update({
          status: 'complete',
          is_public: true,
        })
        .eq('id', data.id)

      if (error) {
        throw error
      }

      setIsPublished(true)
      alert(tVirtual('publishedSuccess'))
    } catch (error) {
      console.error('Error publishing exhibition:', error)
      alert(tVirtual('publishError'))
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>
            {t('subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-secondary/50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{data.selectedTitle}</h3>
            <div className="flex flex-wrap gap-2">
              {data.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="bg-background px-2 py-1 rounded text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Publish Button */}
          {!isPublished && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{t('publishToGallery')}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t('publishDesc')}
                  </p>
                  <Button
                    onClick={publishExhibition}
                    disabled={isPublishing}
                    className="w-full"
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('publishing')}
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4 mr-2" />
                        {t('publish')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isPublished && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-green-900">{t('published')}</p>
              <p className="text-sm text-green-700 mt-1">
                {t('publishedDesc')}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href={`/exhibition/${data.id}`}>
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Eye className="w-5 h-5" />
                <span className="font-semibold">{t('viewVirtual')}</span>
                <span className="text-xs text-muted-foreground">
                  {t('viewVirtualDesc')}
                </span>
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={copyShareLink}
              className="w-full h-auto py-4 flex-col gap-2"
            >
              <Share2 className="w-5 h-5" />
              <span className="font-semibold">{t('share')}</span>
              <span className="text-xs text-muted-foreground">
                {t('copyLink')}
              </span>
            </Button>

            <Link href={`/mypage/exhibitions/${data.id}`}>
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <FileText className="w-5 h-5" />
                <span className="font-semibold">{t('manage')}</span>
                <span className="text-xs text-muted-foreground">
                  {t('manageDesc')}
                </span>
              </Button>
            </Link>

            <Link href="/curation">
              <Button className="w-full h-auto py-4 flex-col gap-2">
                <span className="font-semibold">{t('createNew')}</span>
                <span className="text-xs opacity-80">
                  {t('createNewDesc')}
                </span>
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-3">{t('contentSummary')}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>{t('titleAndKeywords')}</span>
              </div>
              {data.introduction && (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>{t('exhibitionIntro')} ({data.introduction.length})</span>
                </div>
              )}
              {data.preface && (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>{t('exhibitionPreface')} ({data.preface.length})</span>
                </div>
              )}
              {data.pressRelease && (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>{t('pressRelease')}</span>
                </div>
              )}
              {data.marketingReport && (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>{t('marketingReport')}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>{t('artworkImages', { count: data.images.length })}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Link href="/">
          <Button variant="ghost">{t('backToHome')}</Button>
        </Link>
      </div>
    </div>
  )
}
