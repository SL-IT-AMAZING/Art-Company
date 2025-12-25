import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export async function Footer() {
  const t = await getTranslations('footer')

  return (
    <footer className="border-t">
      <div className="container flex flex-col gap-4 py-10 md:flex-row md:justify-between">
        <div>
          <h3 className="text-lg font-bold mb-2">ART WIZARD</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {t('tagline')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <h4 className="font-semibold mb-3">{t('services')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/curation" className="text-muted-foreground hover:text-foreground">
                  {t('aiCurator')}
                </Link>
              </li>
              <li>
                <Link href="/exhibition" className="text-muted-foreground hover:text-foreground">
                  {t('onlineExhibition')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">{t('info')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link href="/notice" className="text-muted-foreground hover:text-foreground">
                  {t('notice')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">{t('account')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="text-muted-foreground hover:text-foreground">
                  {t('login')}
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-muted-foreground hover:text-foreground">
                  {t('signup')}
                </Link>
              </li>
              <li>
                <Link href="/mypage" className="text-muted-foreground hover:text-foreground">
                  {t('myPage')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container border-t py-6">
        <p className="text-center text-sm text-muted-foreground">
          {t('copyright')}
        </p>
      </div>
    </footer>
  )
}
