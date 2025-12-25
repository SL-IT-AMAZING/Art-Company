import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils/helpers'

export default async function ExhibitionListPage() {
  const t = await getTranslations('exhibition')
  const tCommon = await getTranslations('common')
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
          <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
          <p className="text-xl text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {!exhibitions || exhibitions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                {t('noPublicExhibitions')}
              </p>
              <Link href="/curation">
                <Button>{t('createFirst')}</Button>
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
                      {exhibition.title || tCommon('noTitle')}
                    </CardTitle>
                    {exhibition.artist_name && (
                      <CardDescription className="font-medium">
                        {t('artistLabel')} {exhibition.artist_name}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Exhibition period */}
                      {(exhibition.exhibition_date || exhibition.exhibition_end_date) && (
                        <div className="text-sm">
                          <span className="font-semibold">{t('periodLabel')}</span>{' '}
                          {exhibition.exhibition_date && formatDate(exhibition.exhibition_date)}
                          {exhibition.exhibition_end_date && (
                            <> ~ {formatDate(exhibition.exhibition_end_date)}</>
                          )}
                        </div>
                      )}

                      {/* Address */}
                      {exhibition.location && (
                        <div className="text-sm">
                          <span className="font-semibold">{t('addressLabel')}</span> {exhibition.location}
                        </div>
                      )}

                      {/* Venue */}
                      {exhibition.venue && (
                        <div className="text-sm">
                          <span className="font-semibold">{t('venueLabel')}</span> {exhibition.venue}
                        </div>
                      )}

                      {/* Opening hours */}
                      {exhibition.opening_hours && (
                        <div className="text-sm">
                          <span className="font-semibold">{t('hoursLabel')}</span> {exhibition.opening_hours}
                        </div>
                      )}

                      {/* Admission */}
                      {exhibition.admission_fee && (
                        <div className="text-sm">
                          <span className="font-semibold">{t('admissionLabel')}</span> {exhibition.admission_fee}
                        </div>
                      )}

                      {/* Keywords */}
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

                      {/* Views and view button */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                        <span>{tCommon('views')}: {exhibition.view_count || 0}</span>
                        <span className="text-primary font-medium">{t('viewExhibition')}</span>
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
