import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils/helpers'
import { ProfileSettingsCard } from '@/components/profile/ProfileSettingsCard'

export default async function MyPage() {
  const t = await getTranslations('mypage')
  const tCommon = await getTranslations('common')
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
            <h1 className="text-4xl font-bold mb-2">{t('title')}</h1>
            <p className="text-xl text-muted-foreground">
              {user.email}
            </p>
          </div>
          <Link href="/curation">
            <Button size="lg">{t('createNew')}</Button>
          </Link>
        </div>

        <div className="mb-8">
          <ProfileSettingsCard
            email={user.email || ''}
            initialFullName={(user.user_metadata?.full_name as string) || ''}
            initialUsername={(user.user_metadata?.username as string) || ''}
            initialBio={(user.user_metadata?.bio as string) || ''}
          />
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('myExhibitions')}</CardTitle>
              <CardDescription>
                {t('myExhibitionsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!exhibitions || exhibitions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    {t('noExhibitions')}
                  </p>
                  <Link href="/curation">
                    <Button>{t('createFirst')}</Button>
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
                          {exhibition.title || tCommon('noTitle')}
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
                            {exhibition.status === 'complete' ? tCommon('complete') : tCommon('inProgress')}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              exhibition.is_public
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {exhibition.is_public ? tCommon('public') : tCommon('private')}
                          </span>
                          <span>{tCommon('views')}: {exhibition.view_count || 0}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/exhibition/${exhibition.id}`}>
                          <Button variant="outline" size="sm">
                            {tCommon('view')}
                          </Button>
                        </Link>
                        <Link href={`/mypage/exhibitions/${exhibition.id}`}>
                          <Button size="sm">{tCommon('manage')}</Button>
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
                <CardTitle>{t('totalExhibitions')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{exhibitions?.length || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('publicExhibitions')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">
                  {exhibitions?.filter((e) => e.is_public).length || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('totalViews')}</CardTitle>
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
