import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils/helpers'
import { createClient } from '@/lib/supabase/server'

export default async function NoticePage({
  params,
}: {
  params: { locale: string }
}) {
  const t = await getTranslations('notice')
  const supabase = await createClient()

  // Fetch published notices from database
  const { data: notices } = await supabase
    .from('notices')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  const locale = params.locale || 'ko'

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t('title')}</h1>

        <div className="space-y-4">
          {!notices || notices.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {t('noNotices')}
              </CardContent>
            </Card>
          ) : (
            notices.map((notice) => (
              <Card key={notice.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      {locale === 'ko' ? notice.title_ko : notice.title_en}
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(notice.published_at)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className="text-muted-foreground prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html:
                        locale === 'ko' ? notice.content_ko : notice.content_en,
                    }}
                  />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
