import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SalonPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Art Salon</h1>
        <p className="text-xl text-muted-foreground mb-8">
          미술 애호가들이 모여 작품과 전시에 대해 이야기하는 공간
        </p>

        <Card>
          <CardHeader>
            <CardTitle>커뮤니티 기능 준비중</CardTitle>
            <CardDescription>
              곧 다양한 전시 정보와 작가 이야기를 공유할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-6">
              Art Salon 커뮤니티는 현재 개발 중입니다.
              <br />
              빠른 시일 내에 오픈 예정이니 조금만 기다려주세요!
            </p>
            <Button variant="outline">알림 받기</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
