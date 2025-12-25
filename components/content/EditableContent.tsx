'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Pencil, RotateCcw, Check, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export interface EditableContentProps {
  title: string
  content: string
  contentType: string
  onSave: (newContent: string) => Promise<void>
  onRegenerate?: () => Promise<void>
  isGenerating?: boolean
  description?: string
  wordCount?: { min: number; max: number }
}

export function EditableContent({
  title,
  content,
  contentType,
  onSave,
  onRegenerate,
  isGenerating = false,
  description,
  wordCount,
}: EditableContentProps) {
  const t = useTranslations('content')
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(content)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleStartEdit = () => {
    setIsEditing(true)
    setEditedContent(content)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedContent(content)
  }

  const handleSave = async () => {
    if (editedContent.trim() === content.trim()) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      await onSave(editedContent)
      setIsEditing(false)
      toast({
        title: t('saved'),
        description: t('savedDesc'),
      })
    } catch (error) {
      toast({
        title: t('saveFailed'),
        description: t('saveError'),
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRegenerate = async () => {
    if (!onRegenerate) return

    try {
      await onRegenerate()
      toast({
        title: t('regenerationStarted'),
        description: t('regenerationDesc'),
      })
    } catch (error) {
      toast({
        title: t('regenerationFailed'),
        description: t('regenerationError'),
        variant: 'destructive',
      })
    }
  }

  const currentWordCount = editedContent.length

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{contentType}</Badge>
              {wordCount && (
                <Badge
                  variant={
                    currentWordCount >= wordCount.min &&
                    currentWordCount <= wordCount.max
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {t('charCountRecommended', {
                    count: currentWordCount,
                    min: wordCount.min,
                    max: wordCount.max
                  })}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditing && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartEdit}
                  disabled={isGenerating}
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  {t('edit')}
                </Button>
                {onRegenerate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerate}
                    disabled={isGenerating}
                  >
                    <RotateCcw
                      className={`w-4 h-4 mr-1 ${isGenerating ? 'animate-spin' : ''}`}
                    />
                    {t('regenerate')}
                  </Button>
                )}
              </>
            )}
            {isEditing && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-1" />
                  {t('cancel')}
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  <Check className="w-4 h-4 mr-1" />
                  {isSaving ? t('saving') : t('save')}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[200px] font-serif leading-relaxed"
              placeholder={t('enterContent')}
              disabled={isSaving}
            />
            <p className="text-sm text-muted-foreground">
              {t('liveCharCount')}: {t('charCount', { count: currentWordCount })}
              {wordCount &&
                ` (${t('charCountRecommended', { count: currentWordCount, min: wordCount.min, max: wordCount.max })})`}
            </p>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap font-serif leading-relaxed">
              {content || t('noContent')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
