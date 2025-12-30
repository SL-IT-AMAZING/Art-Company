import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AboutPage() {
  const t = await getTranslations('about')

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t('pageTitle')}</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('serviceIntro')}</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>{t('serviceDesc')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('keyFeatures')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <div>
                    <strong>{t('aiCuratorTitle')}</strong> {t('aiCuratorDesc')}
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <div>
                    <strong>{t('virtualSpaceTitle')}</strong> {t('virtualSpaceDesc')}
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <div>
                    <strong>{t('exhibitionPackageTitle')}</strong> {t('exhibitionPackageDesc')}
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
