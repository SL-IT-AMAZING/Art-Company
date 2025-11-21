import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils/helpers'

const notices = [
  {
    id: 1,
    title: 'Art Wizard MVP 버전 출시',
    content:
      'Art Wizard의 첫 번째 버전이 출시되었습니다. AI 큐레이터와 함께 전시를 기획해보세요!',
    date: '2025-11-21',
  },
  {
    id: 2,
    title: '가상 전시 기능 오픈',
    content:
      '2.5D 가상 갤러리에서 작품을 전시하고 전 세계와 공유할 수 있습니다.',
    date: '2025-11-21',
  },
]

export default function NoticePage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">공지사항</h1>

        <div className="space-y-4">
          {notices.map((notice) => (
            <Card key={notice.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{notice.title}</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(notice.date)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{notice.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
