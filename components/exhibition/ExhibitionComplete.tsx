'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExhibitionData } from '@/types/exhibition'
import { Check, Eye, Share2, FileText, Globe, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ExhibitionCompleteProps {
  data: ExhibitionData
}

export function ExhibitionComplete({ data }: ExhibitionCompleteProps) {
  const [isPublishing, setIsPublishing] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const supabase = createClient()

  const shareUrl = data.id
    ? `${window.location.origin}/exhibition/${data.id}`
    : ''

  const copyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      alert('링크가 복사되었습니다!')
    }
  }

  const publishExhibition = async () => {
    if (!data.id) {
      alert('전시 ID가 없습니다.')
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
      alert('전시가 온라인 갤러리에 공개되었습니다!')
    } catch (error) {
      console.error('Error publishing exhibition:', error)
      alert('전시 공개 중 오류가 발생했습니다.')
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
          <CardTitle className="text-2xl">전시 기획 완료!</CardTitle>
          <CardDescription>
            AI 큐레이터가 전시를 성공적으로 기획했습니다.
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
                  <h4 className="font-semibold mb-1">온라인 갤러리에 공개하기</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    전시를 공개하면 누구나 온라인 갤러리에서 감상할 수 있습니다.
                  </p>
                  <Button
                    onClick={publishExhibition}
                    disabled={isPublishing}
                    className="w-full"
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        공개 중...
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4 mr-2" />
                        전시 공개하기
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
              <p className="font-semibold text-green-900">온라인 갤러리에 공개되었습니다!</p>
              <p className="text-sm text-green-700 mt-1">
                이제 누구나 전시를 감상할 수 있습니다.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href={`/exhibition/${data.id}`}>
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Eye className="w-5 h-5" />
                <span className="font-semibold">가상 전시 보기</span>
                <span className="text-xs text-muted-foreground">
                  2.5D 갤러리에서 감상
                </span>
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={copyShareLink}
              className="w-full h-auto py-4 flex-col gap-2"
            >
              <Share2 className="w-5 h-5" />
              <span className="font-semibold">공유하기</span>
              <span className="text-xs text-muted-foreground">
                링크 복사
              </span>
            </Button>

            <Link href={`/mypage/exhibitions/${data.id}`}>
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <FileText className="w-5 h-5" />
                <span className="font-semibold">전시 관리</span>
                <span className="text-xs text-muted-foreground">
                  수정 및 설정
                </span>
              </Button>
            </Link>

            <Link href="/curation">
              <Button className="w-full h-auto py-4 flex-col gap-2">
                <span className="font-semibold">새 전시 만들기</span>
                <span className="text-xs opacity-80">
                  다음 프로젝트 시작
                </span>
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-3">생성된 콘텐츠 요약</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>전시 타이틀 및 키워드</span>
              </div>
              {data.introduction && (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>전시 소개문 ({data.introduction.length}자)</span>
                </div>
              )}
              {data.preface && (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>전시 서문 ({data.preface.length}자)</span>
                </div>
              )}
              {data.pressRelease && (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>보도자료</span>
                </div>
              )}
              {data.marketingReport && (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>마케팅 리포트</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>{data.images.length}개의 작품 이미지</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Link href="/">
          <Button variant="ghost">홈으로 돌아가기</Button>
        </Link>
      </div>
    </div>
  )
}
