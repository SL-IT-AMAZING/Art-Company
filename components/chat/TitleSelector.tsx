'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils/helpers'
import { Loader2 } from 'lucide-react'

interface TitleSelectorProps {
  keywords: string[]
  images: string[]
  conversationContext?: string
  onSelect: (title: string) => void
}

export function TitleSelector({ keywords, images, conversationContext, onSelect }: TitleSelectorProps) {
  const t = useTranslations('titleSelector')
  const tCommon = useTranslations('common')
  const [titles, setTitles] = useState<string[]>([])
  const [selectedTitle, setSelectedTitle] = useState<string>('')
  const [customTitle, setCustomTitle] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    generateTitles()
  }, [])

  const generateTitles = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/generate/titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords,
          artworkDescriptions: images.map((_, i) => `작품 ${i + 1}`),
          conversationContext: conversationContext || '',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate titles')
      }

      const data = await response.json()
      setTitles(data.titles || [])
    } catch (err) {
      console.error('Error generating titles:', err)
      setError(t('generationError'))
      // Fallback titles
      setTitles([
        'Traces of Light',
        'Dissolving Boundaries',
        'Maps of Memory',
        'Urban Rhythms',
        "Nature's Time",
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = () => {
    const finalTitle = customTitle.trim() || selectedTitle
    if (!finalTitle) return
    onSelect(finalTitle)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">{t('generating')}</p>
            <p className="text-sm font-medium text-primary">{t('estimatedTime')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {t('subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
            <p className="text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={generateTitles}
              className="mt-2"
            >
              {t('regenerate')}
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {titles.map((title, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedTitle(title)
                setCustomTitle('')
              }}
              className={cn(
                'w-full text-left p-4 rounded-lg border-2 transition-all',
                selectedTitle === title
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <p className="text-lg font-medium">{title}</p>
            </button>
          ))}
        </div>

        {/* Custom input section */}
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">
            {t('orEnterDirectly')}
          </p>
          <input
            type="text"
            value={customTitle}
            onChange={(e) => {
              setCustomTitle(e.target.value)
              setSelectedTitle('')
            }}
            placeholder={t('customPlaceholder')}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={generateTitles}>
            {t('regenerate')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedTitle && !customTitle.trim()}
            size="lg"
          >
            {t('confirm')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
