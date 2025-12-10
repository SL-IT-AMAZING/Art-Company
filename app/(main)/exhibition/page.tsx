import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils/helpers'

export default async function ExhibitionListPage() {
  const supabase = await createClient()

  // Fetch public exhibitions
  const { data: exhibitions } = await supabase
    .from('exhibitions')
    .select('*')
    .eq('is_public', true)
    .eq('status', 'complete')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">온라인 전시</h1>
          <p className="text-xl text-muted-foreground">
            AI가 기획한 다양한 전시를 가상 갤러리에서 감상하세요
          </p>
        </div>

        {!exhibitions || exhibitions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                아직 공개된 전시가 없습니다.
              </p>
              <Link href="/curation">
                <Button>첫 전시 만들기</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exhibitions.map((exhibition) => (
              <Link key={exhibition.id} href={`/exhibition/${exhibition.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">
                      {exhibition.title || '제목 없음'}
                    </CardTitle>
                    {exhibition.artist_name && (
                      <CardDescription className="font-medium">
                        작가: {exhibition.artist_name}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* 전시 기간 */}
                      {(exhibition.exhibition_date || exhibition.exhibition_end_date) && (
                        <div className="text-sm">
                          <span className="font-semibold">전시기간:</span>{' '}
                          {exhibition.exhibition_date && formatDate(exhibition.exhibition_date)}
                          {exhibition.exhibition_end_date && (
                            <> ~ {formatDate(exhibition.exhibition_end_date)}</>
                          )}
                        </div>
                      )}

                      {/* 주소 */}
                      {exhibition.location && (
                        <div className="text-sm">
                          <span className="font-semibold">주소:</span> {exhibition.location}
                        </div>
                      )}

                      {/* 전시장소 */}
                      {exhibition.venue && (
                        <div className="text-sm">
                          <span className="font-semibold">전시장소:</span> {exhibition.venue}
                        </div>
                      )}

                      {/* 운영시간 */}
                      {exhibition.opening_hours && (
                        <div className="text-sm">
                          <span className="font-semibold">운영시간:</span> {exhibition.opening_hours}
                        </div>
                      )}

                      {/* 입장료 */}
                      {exhibition.admission_fee && (
                        <div className="text-sm">
                          <span className="font-semibold">입장료:</span> {exhibition.admission_fee}
                        </div>
                      )}

                      {/* 키워드 */}
                      {exhibition.keywords && exhibition.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {exhibition.keywords.slice(0, 5).map((keyword: string, index: number) => (
                            <span
                              key={index}
                              className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* 조회수 및 관람하기 */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                        <span>조회수: {exhibition.view_count || 0}</span>
                        <span className="text-primary font-medium">관람하기 →</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
