import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-white to-gray-50">
      <main className="text-center max-w-4xl">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Art Wizard
        </h1>
        <p className="text-2xl text-gray-600 mb-4">
          AI 큐레이터가 당신의 전시를 기획합니다
        </p>
        <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
          키워드와 이미지만 입력하면 전시 타이틀, 서문, 보도자료, 포스터,
          가상 전시 공간까지 자동으로 생성됩니다.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/curation">
            <Button size="lg" className="text-lg px-8">
              전시 만들기 시작
            </Button>
          </Link>
          <Link href="/exhibition">
            <Button size="lg" variant="outline" className="text-lg px-8">
              온라인 전시 둘러보기
            </Button>
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-xl font-bold mb-2">AI 큐레이터</h3>
            <p className="text-gray-600">
              챗봇과 대화하며 전시를 기획하세요.
              타이틀부터 서문, 보도자료까지 자동 생성됩니다.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-xl font-bold mb-2">가상 전시 공간</h3>
            <p className="text-gray-600">
              2.5D 가상 갤러리에서 작품을 전시하고
              전 세계와 공유하세요.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-xl font-bold mb-2">전시 패키지</h3>
            <p className="text-gray-600">
              포스터, PDF 도록, 마케팅 리포트까지
              한 번에 다운로드하세요.
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-20 text-gray-500 text-sm">
        <nav className="flex gap-6">
          <Link href="/about" className="hover:text-gray-900">About</Link>
          <Link href="/salon" className="hover:text-gray-900">Art Salon</Link>
          <Link href="/notice" className="hover:text-gray-900">Notice</Link>
        </nav>
      </footer>
    </div>
  )
}
