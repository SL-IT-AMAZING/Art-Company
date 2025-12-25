'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface KeywordsInputProps {
  onSubmit: (keywords: string[]) => void
  initialKeywords?: string[]
}

export function KeywordsInput({ onSubmit, initialKeywords = [] }: KeywordsInputProps) {
  const t = useTranslations('keywords')
  const [keywords, setKeywords] = useState<string[]>(initialKeywords)
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  const addKeyword = () => {
    const trimmedInput = input.trim()

    if (!trimmedInput) return

    if (keywords.length >= 10) {
      setError(t('maxKeywords'))
      return
    }

    if (keywords.includes(trimmedInput)) {
      setError(t('duplicateKeyword'))
      return
    }

    setKeywords([...keywords, trimmedInput])
    setInput('')
    setError('')
  }

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index))
    setError('')
  }

  const handleSubmit = () => {
    if (keywords.length < 3) {
      setError(t('minKeywords'))
      return
    }
    onSubmit(keywords)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword()
    }
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
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('placeholder')}
            maxLength={50}
          />
          <Button onClick={addKeyword} variant="outline">
            {t('add')}
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm"
              >
                <span>{keyword}</span>
                <button
                  onClick={() => removeKeyword(index)}
                  className="hover:bg-primary-foreground/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center pt-4">
          <p className="text-sm text-muted-foreground">
            {keywords.length}{t('keywordCount')}
          </p>
          <Button
            onClick={handleSubmit}
            disabled={keywords.length < 3}
            size="lg"
          >
            {t('nextStep')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
