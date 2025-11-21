import { openai } from '@/lib/openai/client'
import { PROMPTS } from '@/lib/openai/prompts'
import { getRAGContext } from '@/lib/rag/retrieval'

export async function POST(req: Request) {
  try {
    const exhibitionData = await req.json()

    if (!exhibitionData.title && !exhibitionData.keywords) {
      return new Response(
        JSON.stringify({ error: 'Exhibition data is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const ragContext = await getRAGContext('marketing_report')

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: PROMPTS.generateMarketingReport(exhibitionData, ragContext),
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    let content = response.choices[0]?.message?.content || ''

    // Remove code block markers if present
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()

    // Try to parse JSON response
    try {
      const parsed = JSON.parse(content)
      return new Response(JSON.stringify(parsed), {
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (parseError) {
      console.error('Failed to parse marketing report JSON:', parseError)
      console.error('Content:', content)

      // If not JSON, create a basic structure
      return new Response(
        JSON.stringify({
          marketingReport: {
            overview: content.substring(0, 300),
            targetAudience: ['아트 컬렉터', '미술 애호가', '일반 관람객'],
            marketingPoints: ['독창적인 작품 세계', '현대적 해석', '감각적 표현'],
            pricingStrategy: '중저가 전략으로 접근성 확보',
            promotionStrategy: ['SNS 마케팅', '아트 커뮤니티 홍보', 'VIP 프리뷰'],
          },
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  } catch (error) {
    console.error('Generate marketing report error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate marketing report' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
