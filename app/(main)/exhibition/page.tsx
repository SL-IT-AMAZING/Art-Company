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
                    <CardDescription>
                      {exhibition.created_at
                        ? formatDate(exhibition.created_at)
                        : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {exhibition.keywords && exhibition.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {exhibition.keywords.slice(0, 5).map((keyword, index) => (
                          <span
                            key={index}
                            className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                      <span>조회수: {exhibition.view_count || 0}</span>
                      <span className="text-primary font-medium">관람하기 →</span>
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
