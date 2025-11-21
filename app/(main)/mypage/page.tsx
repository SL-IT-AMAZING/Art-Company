import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils/helpers'
import { ProfileSettingsCard } from '@/components/profile/ProfileSettingsCard'

export default async function MyPage() {
  const supabase = await createClient()

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's exhibitions
  const { data: exhibitions } = await supabase
    .from('exhibitions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">마이페이지</h1>
            <p className="text-xl text-muted-foreground">
              {user.email}
            </p>
          </div>
          <Link href="/curation">
            <Button size="lg">새 전시 만들기</Button>
          </Link>
        </div>

        <div className="mb-8">
          <ProfileSettingsCard
            email={user.email || ''}
            initialDisplayName={(user.user_metadata?.full_name as string) || ''}
            initialBio={(user.user_metadata?.bio as string) || ''}
          />
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>내 전시 목록</CardTitle>
              <CardDescription>
                생성한 전시를 관리하고 공개 설정을 변경할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!exhibitions || exhibitions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    아직 생성한 전시가 없습니다.
                  </p>
                  <Link href="/curation">
                    <Button>첫 전시 만들기</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {exhibitions.map((exhibition) => (
                    <div
                      key={exhibition.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {exhibition.title || '제목 없음'}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{formatDate(exhibition.created_at)}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              exhibition.status === 'complete'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {exhibition.status === 'complete' ? '완료' : '작업중'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              exhibition.is_public
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {exhibition.is_public ? '공개' : '비공개'}
                          </span>
                          <span>조회수: {exhibition.view_count || 0}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/exhibition/${exhibition.id}`}>
                          <Button variant="outline" size="sm">
                            보기
                          </Button>
                        </Link>
                        <Link href={`/mypage/exhibitions/${exhibition.id}`}>
                          <Button size="sm">관리</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>총 전시 수</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{exhibitions?.length || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>공개 전시</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">
                  {exhibitions?.filter((e) => e.is_public).length || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>총 조회수</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">
                  {exhibitions?.reduce((sum, e) => sum + (e.view_count || 0), 0) || 0}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
