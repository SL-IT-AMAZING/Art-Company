'use client'

import { useState } from 'react'
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
        title: '저장 완료',
        description: '콘텐츠가 성공적으로 저장되었습니다.',
      })
    } catch (error) {
      toast({
        title: '저장 실패',
        description: '콘텐츠 저장 중 오류가 발생했습니다.',
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
        title: '재생성 시작',
        description: 'AI가 새로운 콘텐츠를 생성하고 있습니다.',
      })
    } catch (error) {
      toast({
        title: '재생성 실패',
        description: '콘텐츠 재생성 중 오류가 발생했습니다.',
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
                  {currentWordCount}자
                  {wordCount && ` (권장: ${wordCount.min}-${wordCount.max}자)`}
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
                  편집
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
                    재생성
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
                  취소
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  <Check className="w-4 h-4 mr-1" />
                  {isSaving ? '저장 중...' : '저장'}
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
              placeholder="콘텐츠를 입력하세요..."
              disabled={isSaving}
            />
            <p className="text-sm text-muted-foreground">
              실시간 글자 수: {currentWordCount}자
              {wordCount &&
                ` (권장: ${wordCount.min}-${wordCount.max}자)`}
            </p>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap font-serif leading-relaxed">
              {content || '콘텐츠가 아직 생성되지 않았습니다.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
