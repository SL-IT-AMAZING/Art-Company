import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils/helpers'

export default async function NoticePage() {
  const t = await getTranslations('notice')

  const notices = [
    {
      id: 1,
      titleKey: 'mvpRelease',
      contentKey: 'mvpReleaseDesc',
      date: '2025-11-21',
    },
    {
      id: 2,
      titleKey: 'virtualFeature',
      contentKey: 'virtualFeatureDesc',
      date: '2025-11-21',
    },
  ]

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t('title')}</h1>

        <div className="space-y-4">
          {notices.map((notice) => (
            <Card key={notice.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t(notice.titleKey)}</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(notice.date)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t(notice.contentKey)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
