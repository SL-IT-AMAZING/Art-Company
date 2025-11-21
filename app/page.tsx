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
      </main>

      <footer className="mt-12 sm:mt-16 md:mt-20 text-gray-500 text-xs sm:text-sm">
        <nav className="flex flex-wrap gap-4 sm:gap-6 justify-center">
          <Link href="/about" className="hover:text-gray-900">About</Link>
          <Link href="/salon" className="hover:text-gray-900">Art Salon</Link>
          <Link href="/notice" className="hover:text-gray-900">Notice</Link>
        </nav>
      </footer>
    </div>
  )
}
