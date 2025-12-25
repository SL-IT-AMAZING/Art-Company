import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { getTranslations, setRequestLocale } from 'next-intl/server'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function Home({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('home')
  const tPricing = await getTranslations('pricing')

  return (
    <div className="bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section - Full Screen */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 -mt-16">
        <div className="text-center max-w-4xl w-full">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {t('heroTitle')}
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 mb-8 sm:mb-10 px-2">
            {t('heroSubtitle')}
          </p>

          <div className="flex justify-center">
            <Link href="/curation">
              <Button size="lg" className="text-base sm:text-lg px-8 py-4 h-auto">
                {t('startExhibition')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <main className="text-center max-w-6xl w-full mx-auto px-4 py-20 sm:py-24 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
          <div className="p-10 sm:p-12 bg-white rounded-xl shadow-md border-2 border-gray-200 text-center hover:shadow-lg transition-shadow flex items-center justify-center">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('aiCurator')}</h3>
          </div>
          <div className="p-10 sm:p-12 bg-white rounded-xl shadow-md border-2 border-gray-200 text-center hover:shadow-lg transition-shadow flex items-center justify-center">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('virtualExhibition')}</h3>
          </div>
          <div className="p-10 sm:p-12 bg-white rounded-xl shadow-md border-2 border-gray-200 text-center hover:shadow-lg transition-shadow flex items-center justify-center">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('exhibitionPackage')}</h3>
          </div>
        </div>
      </main>

      {/* Pricing Section */}
      <section className="w-full max-w-6xl mx-auto px-4 py-20 sm:py-24 md:py-28">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-center">{tPricing('title')}</h2>
        <p className="text-base sm:text-lg text-gray-500 mb-12 sm:mb-16 text-center max-w-2xl mx-auto">
          {tPricing('subtitle')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
          {/* Basic */}
          <div className="p-6 sm:p-8 bg-white rounded-lg shadow-sm border flex flex-col">
            <h3 className="text-xl sm:text-2xl font-bold mb-2">{tPricing('basic.name')}</h3>
            <p className="text-3xl sm:text-4xl font-bold mb-1">{tPricing('basic.price')}<span className="text-base font-normal text-gray-500">{tPricing('monthly')}</span></p>
            <p className="text-sm text-gray-500 mb-6">{tPricing('basic.description')}</p>
            <ul className="space-y-3 text-sm text-gray-600 flex-1">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {tPricing('basic.features.freeTrial')}
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {tPricing('basic.features.aiPlanning')}
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {tPricing('basic.features.basicPromo')}
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {tPricing('basic.features.onlineExhibition')}
              </li>
            </ul>
            <Link href="/signup" className="mt-6">
              <Button className="w-full" size="lg">{tPricing('getStarted')}</Button>
            </Link>
          </div>

          {/* Professional */}
          <div className="p-6 sm:p-8 bg-gray-900 text-white rounded-lg shadow-lg border-2 border-gray-800 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded-full border border-gray-700">
              {tPricing('popular')}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">{tPricing('professional.name')}</h3>
            <p className="text-3xl sm:text-4xl font-bold mb-1">{tPricing('professional.price')}<span className="text-base font-normal text-gray-400">{tPricing('monthly')}</span></p>
            <p className="text-sm text-gray-400 mb-6">{tPricing('professional.description')}</p>
            <ul className="space-y-3 text-sm text-gray-300 flex-1">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {tPricing('professional.features.freeTrial')}
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {tPricing('professional.features.aiPlanningUnlimited')}
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {tPricing('professional.features.proPromo')}
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {tPricing('professional.features.onlineExhibitionUnlimited')}
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {tPricing('professional.features.premiumTemplates')}
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {tPricing('professional.features.dataReport')}
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {tPricing('professional.features.prioritySupport')}
              </li>
            </ul>
            <Link href="/signup" className="mt-6">
              <Button className="w-full bg-white text-gray-900 hover:bg-gray-100" size="lg">{tPricing('getStarted')}</Button>
            </Link>
          </div>

          {/* Institution */}
          <div className="p-6 sm:p-8 bg-white rounded-lg shadow-sm border flex flex-col">
            <h3 className="text-xl sm:text-2xl font-bold mb-2">{tPricing('institution.name')}</h3>
            <p className="text-3xl sm:text-4xl font-bold mb-1">{tPricing('institution.price')}<span className="text-base font-normal text-gray-500">{tPricing('monthly')}</span></p>
            <p className="text-sm text-gray-500 mb-6">{tPricing('institution.description')}</p>
            <ul className="space-y-3 text-sm text-gray-600 flex-1">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {tPricing('institution.features.freeTrial')}
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {tPricing('institution.features.allProfessional')}
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {tPricing('institution.features.multipleIds')}
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {tPricing('institution.features.dedicatedManager')}
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {tPricing('institution.features.apiAccess')}
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {tPricing('institution.features.customDev')}
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {tPricing('institution.features.sla')}
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {tPricing('institution.features.onsiteTraining')}
              </li>
            </ul>
            <Link href="/about" className="mt-6">
              <Button variant="outline" className="w-full" size="lg">{tPricing('contactUs')}</Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-12 text-gray-500 text-sm sm:text-base">
        <nav className="flex flex-wrap gap-4 sm:gap-6 justify-center">
          <Link href="/about" className="hover:text-gray-900">About</Link>
          <Link href="/notice" className="hover:text-gray-900">Notice</Link>
        </nav>
      </footer>
    </div>
  )
}
