'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExhibitionData } from '@/types/exhibition'
import { Check, Eye, Share2, FileText } from 'lucide-react'

interface ExhibitionCompleteProps {
  data: ExhibitionData
}

export function ExhibitionComplete({ data }: ExhibitionCompleteProps) {
  const shareUrl = data.id
    ? `${window.location.origin}/exhibition/${data.id}`
    : ''

  const copyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      alert('링크가 복사되었습니다!')
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
