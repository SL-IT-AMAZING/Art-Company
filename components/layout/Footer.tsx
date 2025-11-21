import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col gap-4 py-10 md:flex-row md:justify-between">
        <div>
          <h3 className="text-lg font-bold mb-2">Art Wizard</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            AI 기반 디지털 큐레이터 서비스
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <h4 className="font-semibold mb-3">서비스</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/curation" className="text-muted-foreground hover:text-foreground">
                  AI 큐레이터
                </Link>
              </li>
              <li>
                <Link href="/exhibition" className="text-muted-foreground hover:text-foreground">
                  온라인 전시
                </Link>
              </li>
              <li>
                <Link href="/salon" className="text-muted-foreground hover:text-foreground">
                  Art Salon
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">정보</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link href="/notice" className="text-muted-foreground hover:text-foreground">
                  공지사항
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">계정</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/auth/login" className="text-muted-foreground hover:text-foreground">
                  로그인
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="text-muted-foreground hover:text-foreground">
                  회원가입
                </Link>
              </li>
              <li>
                <Link href="/mypage" className="text-muted-foreground hover:text-foreground">
                  마이페이지
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container border-t py-6">
        <p className="text-center text-sm text-muted-foreground">
          © 2025 Art Wizard. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
