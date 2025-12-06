import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section - Full Screen */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 -mt-16">
        <div className="text-center max-w-4xl w-full">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            AI 큐레이터
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 mb-8 sm:mb-10 px-2">
            대화만으로 완성되는 전시의 모든 것
          </p>

          <div className="flex justify-center">
            <Link href="/curation">
              <Button size="lg" className="text-base sm:text-lg px-8 py-4 h-auto">
                전시 만들기 시작
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <main className="text-center max-w-6xl w-full mx-auto px-4 py-20 sm:py-24 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
          <div className="p-10 sm:p-12 bg-white rounded-xl shadow-md border-2 border-gray-200 text-center hover:shadow-lg transition-shadow flex items-center justify-center">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">AI 큐레이터</h3>
          </div>
          <div className="p-10 sm:p-12 bg-white rounded-xl shadow-md border-2 border-gray-200 text-center hover:shadow-lg transition-shadow flex items-center justify-center">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">가상 전시 공간</h3>
          </div>
          <div className="p-10 sm:p-12 bg-white rounded-xl shadow-md border-2 border-gray-200 text-center hover:shadow-lg transition-shadow flex items-center justify-center">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">전시 패키지</h3>
          </div>
        </div>
      </main>

      {/* 요금제 섹션 */}
      <section className="w-full max-w-6xl mx-auto px-4 py-20 sm:py-24 md:py-28">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-center">SERVICE PRICE</h2>
        <p className="text-base sm:text-lg text-gray-500 mb-12 sm:mb-16 text-center max-w-2xl mx-auto">
          작가와 큐레이터를 위한 합리적인 요금제를 선택하세요
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
          {/* Basic */}
          <div className="p-6 sm:p-8 bg-white rounded-lg shadow-sm border flex flex-col">
            <h3 className="text-xl sm:text-2xl font-bold mb-2">Basic</h3>
            <p className="text-3xl sm:text-4xl font-bold mb-1">49,000<span className="text-base font-normal text-gray-500">/ 월</span></p>
            <p className="text-sm text-gray-500 mb-6">개인 작가와 소규모 갤러리를 위한 기본 플랜</p>
            <ul className="space-y-3 text-sm text-gray-600 flex-1">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                회원가입시 1회 무료 체험
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                AI 전시기획(월5회)
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                기본 홍보물 제작
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                온라인 전시(1개)
              </li>
            </ul>
            <Link href="/signup" className="mt-6">
              <Button className="w-full" size="lg">시작하기</Button>
            </Link>
          </div>

          {/* Professional */}
          <div className="p-6 sm:p-8 bg-gray-900 text-white rounded-lg shadow-lg border-2 border-gray-800 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded-full border border-gray-700">
              POPULAR
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">Professional</h3>
            <p className="text-3xl sm:text-4xl font-bold mb-1">490,000<span className="text-base font-normal text-gray-400">/ 월</span></p>
            <p className="text-sm text-gray-400 mb-6">전문 큐레이터와 중대형 갤러리를 위한 프로 플랜</p>
            <ul className="space-y-3 text-sm text-gray-300 flex-1">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                회원가입시 1회 무료 체험
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                AI전시기획(무제한)
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                전문 홍보물 제작
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                온라인 전시(무제한)
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                프리미엄 템플릿
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                데이터 분석 리포트
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                우선지원
              </li>
            </ul>
            <Link href="/signup" className="mt-6">
              <Button className="w-full bg-white text-gray-900 hover:bg-gray-100" size="lg">시작하기</Button>
            </Link>
          </div>

          {/* Institution */}
          <div className="p-6 sm:p-8 bg-white rounded-lg shadow-sm border flex flex-col">
            <h3 className="text-xl sm:text-2xl font-bold mb-2">Institution</h3>
            <p className="text-3xl sm:text-4xl font-bold mb-1">1,000,000<span className="text-base font-normal text-gray-500">/ 월</span></p>
            <p className="text-sm text-gray-500 mb-6">미술관, 대형 갤러리 등 기관을 위한 엔터프라이즈 플랜</p>
            <ul className="space-y-3 text-sm text-gray-600 flex-1">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                회원가입시 1회 무료 체험
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Professional 모든 기능
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ID 5개 제공
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                전용 계정 관리자
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                API 액세스
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                커스텀 개발 지원
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                SLA 보장
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                온사이트 교육
              </li>
            </ul>
            <Link href="/about" className="mt-6">
              <Button variant="outline" className="w-full" size="lg">문의하기</Button>
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
