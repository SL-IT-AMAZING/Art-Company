import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditableContent } from '@/components/content/EditableContent'
import { ContentPreview } from '@/components/content/ContentPreview'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, Eye, Globe } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditExhibitionPage({ params }: PageProps) {
  const supabase = await createClient()

  // Get exhibition data
  const { data: exhibition, error } = await supabase
    .from('exhibitions')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !exhibition) {
    redirect('/mypage')
  }

  // Check user ownership
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || exhibition.user_id !== user.id) {
    redirect('/mypage')
  }

  // Get exhibition content
  const { data: contents } = await supabase
    .from('exhibition_content')
    .select('*')
    .eq('exhibition_id', params.id)

  // Organize content by type
  const contentMap = new Map()
  contents?.forEach((content) => {
    contentMap.set(content.content_type, content)
  })

  const getContentText = (type: string): string => {
    const content = contentMap.get(type)
    if (!content?.content) return ''
    return typeof content.content === 'string'
      ? content.content
      : content.content.text || ''
  }

  const previewContent = {
    title: exhibition.title,
    introduction: getContentText('introduction'),
    preface: getContentText('preface'),
    artistBio: getContentText('artistBio'),
    pressRelease: getContentText('pressRelease'),
    marketingReport: getContentText('marketingReport'),
    artworkDescriptions: exhibition.images?.map((imageUrl: string, index: number) => ({
      imageUrl,
      title: `작품 ${index + 1}`,
      description: getContentText(`artwork_${index}`),
    })),
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/mypage">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{exhibition.title}</h1>
              <p className="text-muted-foreground">전시 콘텐츠 편집</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-1" />
              미리보기
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              PDF 다운로드
            </Button>
            <Button size="sm">
              <Globe className="w-4 h-4 mr-1" />
              온라인 전시 발행
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="edit" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">편집 모드</TabsTrigger>
            <TabsTrigger value="preview">미리보기</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-6">
            <Suspense fallback={<div>Loading...</div>}>
              <ContentEditor
                exhibitionId={params.id}
                exhibition={exhibition}
                contentMap={contentMap}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="preview">
            <ContentPreview
              content={previewContent}
              keywords={exhibition.keywords}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Separate client component for editing
function ContentEditor({
  exhibitionId,
  exhibition,
  contentMap,
}: {
  exhibitionId: string
  exhibition: any
  contentMap: Map<string, any>
}) {
  const getContentText = (type: string): string => {
    const content = contentMap.get(type)
    if (!content?.content) return ''
    return typeof content.content === 'string'
      ? content.content
      : content.content.text || ''
  }

  const handleSave = async (contentType: string, newContent: string) => {
    const response = await fetch(`/api/exhibitions/${exhibitionId}/content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentType,
        content: { text: newContent },
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to save content')
    }
  }

  const handleRegenerate = async (contentType: string) => {
    const response = await fetch(`/api/exhibitions/${exhibitionId}/regenerate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentType,
        exhibitionData: {
          title: exhibition.title,
          keywords: exhibition.keywords,
        },
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to regenerate content')
    }

    // Stream and update content
    const reader = response.body?.getReader()
    // TODO: Handle streaming response
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>콘텐츠 편집 가이드</CardTitle>
          <CardDescription>
            각 섹션을 클릭하여 내용을 수정하거나 AI로 재생성할 수 있습니다.
          </CardDescription>
        </CardHeader>
      </Card>

      <EditableContent
        title="전시 소개문"
        content={getContentText('introduction')}
        contentType="introduction"
        description="전시의 핵심 주제와 의도를 간단히 소개합니다."
        wordCount={{ min: 300, max: 500 }}
        onSave={(content) => handleSave('introduction', content)}
        onRegenerate={() => handleRegenerate('introduction')}
      />

      <EditableContent
        title="전시 서문"
        content={getContentText('preface')}
        contentType="preface"
        description="전시의 배경, 의미, 작가의 작업 세계를 심층적으로 다룹니다."
        wordCount={{ min: 800, max: 1200 }}
        onSave={(content) => handleSave('preface', content)}
        onRegenerate={() => handleRegenerate('preface')}
      />

      <EditableContent
        title="작가 소개"
        content={getContentText('artistBio')}
        contentType="artistBio"
        description="작가의 이력, 작업 방식, 예술 세계를 소개합니다."
        wordCount={{ min: 400, max: 600 }}
        onSave={(content) => handleSave('artistBio', content)}
        onRegenerate={() => handleRegenerate('artistBio')}
      />

      <EditableContent
        title="보도자료"
        content={getContentText('pressRelease')}
        contentType="pressRelease"
        description="언론 배포용 보도자료입니다."
        wordCount={{ min: 1000, max: 1500 }}
        onSave={(content) => handleSave('pressRelease', content)}
        onRegenerate={() => handleRegenerate('pressRelease')}
      />

      <EditableContent
        title="마케팅 리포트"
        content={getContentText('marketingReport')}
        contentType="marketingReport"
        description="컬렉터를 위한 수집 가치와 마케팅 포인트를 제시합니다."
        wordCount={{ min: 500, max: 800 }}
        onSave={(content) => handleSave('marketingReport', content)}
        onRegenerate={() => handleRegenerate('marketingReport')}
      />
    </div>
  )
}
