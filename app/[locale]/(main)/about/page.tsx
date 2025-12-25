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

          <Card>
            <CardHeader>
              <CardTitle>{t('techStack')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">{t('frontend')}</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Next.js 14</li>
                    <li>React 18</li>
                    <li>Tailwind CSS</li>
                    <li>Framer Motion</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{t('backend')}</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Supabase</li>
                    <li>OpenAI GPT-4o</li>
                    <li>Next.js API Routes</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{t('features')}</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>AI Streaming Chat</li>
                    <li>RAG System</li>
                    <li>2.5D Gallery</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
