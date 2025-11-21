'use client'

import { ExhibitionData } from '@/types/exhibition'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ContentPreviewProps {
  data: ExhibitionData
  onNext: () => void
  onEdit?: (contentType: string) => void
}

export function ContentPreview({ data, onNext, onEdit }: ContentPreviewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>전시 정보 미리보기</CardTitle>
          <CardDescription>
            생성된 전시 정보를 확인하고 다음 단계로 진행하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              전시 타이틀
            </h3>
            <p className="text-xl font-bold">{data.selectedTitle}</p>
          </div>

          {/* Keywords */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              키워드
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Introduction */}
          {data.introduction && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  전시 소개문
                </h3>
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit('introduction')}
                  >
                    수정
                  </Button>
                )}
              </div>
              <p className="text-sm leading-relaxed">{data.introduction}</p>
            </div>
          )}

          {/* Preface */}
          {data.preface && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  전시 서문
                </h3>
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit('preface')}
                  >
                    수정
                  </Button>
                )}
              </div>
              <p className="text-sm leading-relaxed">{data.preface}</p>
            </div>
          )}


          {/* Images */}
          {data.images.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                업로드된 작품
              </h3>
              <p className="text-sm text-muted-foreground">
                {data.images.length}개의 작품 이미지
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onNext} size="lg">
          다음 단계로
        </Button>
      </div>
    </div>
  )
}
