import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">About Art Wizard</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>서비스 소개</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                Art Wizard는 AI 기반 디지털 큐레이터 서비스입니다.
                챗봇 인터페이스를 통해 전시 기획의 전 과정을 자동화하며,
                사용자가 키워드와 이미지를 입력하면 전시 타이틀, 서문, 소개문,
                보도자료, 마케팅 리포트, 포스터, 그리고 2.5D 가상 전시 공간까지
                자동으로 생성합니다.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>주요 기능</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <div>
                    <strong>AI 큐레이터:</strong> 챗봇과 대화하며 전시를 기획하세요.
                    타이틀부터 서문, 보도자료까지 자동 생성됩니다.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <div>
                    <strong>가상 전시 공간:</strong> 2.5D 가상 갤러리에서 작품을
                    전시하고 전 세계와 공유하세요.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <div>
                    <strong>전시 패키지:</strong> 포스터, PDF 도록, 마케팅
                    리포트까지 한 번에 다운로드하세요.
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>기술 스택</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Frontend</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Next.js 14</li>
                    <li>React 18</li>
                    <li>Tailwind CSS</li>
                    <li>Framer Motion</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Backend</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Supabase</li>
                    <li>OpenAI GPT-4o</li>
                    <li>Next.js API Routes</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Features</h4>
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
