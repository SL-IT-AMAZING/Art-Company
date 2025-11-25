import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const pricingPlans = [
  {
    name: 'Personal',
    period: '월간',
    target: '일반 작가/큐레이터',
    price: '49,000',
    priceUnit: '원',
    billingPeriod: '/월',
    note: '정가',
    features: [
      'AI 큐레이팅 서비스',
      '온라인 전시 1개 생성',
      'PDF 전시 패키지 다운로드',
      '기본 고객 지원',
    ],
  },
  {
    name: 'Personal',
    period: '연간',
    target: '충성 고객',
    price: '490,000',
    priceUnit: '원',
    billingPeriod: '/년',
    note: '약 17% 할인 (2달 무료 혜택)',
    features: [
      'AI 큐레이팅 서비스',
      '무제한 온라인 전시 생성',
      'PDF 전시 패키지 다운로드',
      '우선 고객 지원',
      '전시 통계 분석',
    ],
  },
  {
    name: 'Enterprise',
    period: '기관',
    target: '문화재단/미술관',
    price: '1,000,000',
    priceUnit: '원',
    billingPeriod: '/년',
    note: '팀 공유 + 보안',
    features: [
      'AI 큐레이팅 서비스',
      '무제한 온라인 전시 생성',
      'PDF 전시 패키지 다운로드',
      '팀 계정 (최대 10명)',
      '보안 강화 및 데이터 관리',
      '전담 매니저 배정',
      '맞춤형 브랜딩 옵션',
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">요금제</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          작가와 큐레이터를 위한 합리적인 요금제를 선택하세요.
          <br />
          모든 플랜에서 AI 큐레이팅 서비스를 이용할 수 있습니다.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {pricingPlans.map((plan, index) => (
          <Card key={index} className="flex flex-col h-full">
            <CardHeader>
              <div className="space-y-1">
                <CardTitle className="text-2xl">
                  {plan.name}
                  <span className="text-lg font-normal text-muted-foreground ml-1">
                    ({plan.period})
                  </span>
                </CardTitle>
                <CardDescription className="text-base">
                  {plan.target}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-lg text-muted-foreground ml-1">
                    {plan.priceUnit}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    {plan.billingPeriod}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{plan.note}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={index === 2 ? 'default' : 'outline'}>
                시작하기
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* FAQ or Additional Info */}
      <div className="mt-16 text-center">
        <p className="text-muted-foreground">
          요금제에 대해 궁금한 점이 있으신가요?{' '}
          <a href="/about" className="text-primary hover:underline">
            문의하기
          </a>
        </p>
      </div>
    </div>
  )
}
