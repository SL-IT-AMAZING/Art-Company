'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface KeywordsInputProps {
  onSubmit: (keywords: string[]) => void
  initialKeywords?: string[]
}

export function KeywordsInput({ onSubmit, initialKeywords = [] }: KeywordsInputProps) {
  const [keywords, setKeywords] = useState<string[]>(initialKeywords)
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  const addKeyword = () => {
    const trimmedInput = input.trim()

    if (!trimmedInput) return

    if (keywords.length >= 10) {
      setError('최대 10개의 키워드만 입력할 수 있습니다.')
      return
    }

    if (keywords.includes(trimmedInput)) {
      setError('이미 추가된 키워드입니다.')
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
      setError('최소 3개 이상의 키워드를 입력해주세요.')
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
        <CardTitle>전시 키워드 입력</CardTitle>
        <CardDescription>
          전시의 핵심 주제나 컨셉을 나타내는 키워드를 3~10개 입력해주세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="예: 자연, 도시, 기억, 시간..."
            maxLength={50}
          />
          <Button onClick={addKeyword} variant="outline">
            추가
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
            {keywords.length}/10 키워드
          </p>
          <Button
            onClick={handleSubmit}
            disabled={keywords.length < 3}
            size="lg"
          >
            다음 단계
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
