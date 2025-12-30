'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RichTextEditor } from './RichTextEditor'
import { createNotice, updateNotice } from '@/app/actions/admin'
import { useTranslations } from 'next-intl'

interface Notice {
  id?: string
  title_ko: string
  title_en: string
  content_ko: string
  content_en: string
  is_published: boolean
}

export function NoticeForm({
  notice,
  mode = 'create',
}: {
  notice?: Notice
  mode?: 'create' | 'edit'
}) {
  const router = useRouter()
  const t = useTranslations('admin')
  const [loading, setLoading] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [formData, setFormData] = useState<Notice>(
    notice || {
      title_ko: '',
      title_en: '',
      content_ko: '',
      content_en: '',
      is_published: true,
    }
  )

  const handleAutoTranslate = async () => {
    if (!formData.title_ko || !formData.content_ko) {
      alert('한국어 제목과 내용을 먼저 작성해주세요.')
      return
    }

    setTranslating(true)
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title_ko,
          content: formData.content_ko,
        }),
      })

      if (!response.ok) throw new Error('Translation failed')

      const { title_en, content_en } = await response.json()
      setFormData({
        ...formData,
        title_en,
        content_en,
      })
      alert('자동 번역 완료!')
    } catch (error) {
      alert('번역 중 오류가 발생했습니다.')
    } finally {
      setTranslating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent, publish: boolean) => {
    e.preventDefault()
    setLoading(true)

    try {
      const dataToSubmit = { ...formData, is_published: publish }
      const result =
        mode === 'create'
          ? await createNotice(dataToSubmit)
          : await updateNotice(notice!.id!, dataToSubmit)

      if (result.error) {
        alert(result.error)
      } else {
        alert(
          publish
            ? mode === 'create'
              ? '공지사항이 게시되었습니다.'
              : '공지사항이 업데이트되었습니다.'
            : '임시저장되었습니다.'
        )
        router.push('/admin/notices')
      }
    } catch (error) {
      alert('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <Tabs defaultValue="ko" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ko">{t('korean')}</TabsTrigger>
          <TabsTrigger value="en">{t('english')}</TabsTrigger>
        </TabsList>

        <TabsContent value="ko">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('korean')}</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoTranslate}
                disabled={translating}
              >
                {translating ? '번역 중...' : '영문 자동 번역'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title_ko">{t('title')}</Label>
                <Input
                  id="title_ko"
                  value={formData.title_ko}
                  onChange={(e) =>
                    setFormData({ ...formData, title_ko: e.target.value })
                  }
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="content_ko">{t('content')}</Label>
                <div className="mt-1">
                  <RichTextEditor
                    content={formData.content_ko}
                    onChange={(html) =>
                      setFormData({ ...formData, content_ko: html })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="en">
          <Card>
            <CardHeader>
              <CardTitle>{t('english')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title_en">{t('title')}</Label>
                <Input
                  id="title_en"
                  value={formData.title_en}
                  onChange={(e) =>
                    setFormData({ ...formData, title_en: e.target.value })
                  }
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="content_en">{t('content')}</Label>
                <div className="mt-1">
                  <RichTextEditor
                    content={formData.content_en}
                    onChange={(html) =>
                      setFormData({ ...formData, content_en: html })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-4">
        <Button
          type="button"
          onClick={(e) => handleSubmit(e, true)}
          disabled={loading}
        >
          {loading ? 'Saving...' : '게시'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={(e) => handleSubmit(e, false)}
          disabled={loading}
        >
          {loading ? 'Saving...' : '임시저장'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/notices')}
        >
          취소
        </Button>
      </div>
    </form>
  )
}
