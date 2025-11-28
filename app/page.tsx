import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-b from-white to-gray-50">
      <main className="text-center max-w-4xl w-full">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Art Wizard
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-3 sm:mb-4 px-2">
          AI 큐레이터가 당신의 전시를 기획합니다
        </p>
        <p className="text-sm sm:text-base md:text-lg text-gray-500 mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
          키워드와 이미지만 입력하면 전시 타이틀, 서문, 보도자료, 포스터,
          가상 전시 공간까지 자동으로 생성됩니다.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
          <Link href="/curation" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8">
              전시 만들기 시작
            </Button>
          </Link>
          <Link href="/exhibition" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8">
              온라인 전시 둘러보기
            </Button>
          </Link>
        </div>

        <div className="mt-12 sm:mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 text-left px-4">
          <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-lg sm:text-xl font-bold mb-2">AI 큐레이터</h3>
            <p className="text-sm sm:text-base text-gray-600">
              챗봇과 대화하며 전시를 기획하세요.
              타이틀부터 서문, 보도자료까지 자동 생성됩니다.
            </p>
          </div>
          <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-lg sm:text-xl font-bold mb-2">가상 전시 공간</h3>
            <p className="text-sm sm:text-base text-gray-600">
              2.5D 가상 갤러리에서 작품을 전시하고
              전 세계와 공유하세요.
            </p>
          </div>
          <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-lg sm:text-xl font-bold mb-2">전시 패키지</h3>
            <p className="text-sm sm:text-base text-gray-600">
              포스터, PDF 도록, 마케팅 리포트까지
              한 번에 다운로드하세요.
            </p>
          </div>
        </div>

        {/* 요금제 섹션 */}
        <div className="mt-16 sm:mt-20 md:mt-24 w-full px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-center">SERVICE PRICE</h2>
          <p className="text-sm sm:text-base text-gray-500 mb-8 sm:mb-12 text-center max-w-2xl mx-auto">
            작가와 큐레이터를 위한 합리적인 요금제를 선택하세요
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
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
        </div>
      </main>

      <footer className="mt-12 sm:mt-16 md:mt-20 text-gray-500 text-xs sm:text-sm">
        <nav className="flex flex-wrap gap-4 sm:gap-6 justify-center">
          <Link href="/about" className="hover:text-gray-900">About</Link>
          <Link href="/notice" className="hover:text-gray-900">Notice</Link>
        </nav>
      </footer>
    </div>
  )
}
