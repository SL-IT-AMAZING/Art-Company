import { openai } from '@/lib/openai/client'
import { getRAGContext } from '@/lib/rag/retrieval'

export async function POST(req: Request) {
  try {
    const { artworks, title, keywords } = await req.json()

    if (!artworks || !Array.isArray(artworks) || artworks.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Artworks array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const ragContext = await getRAGContext('artwork_description')

    const descriptions = await Promise.all(
      artworks.map(async (artwork: any, index: number) => {
        const prompt = `
당신은 한국 현대미술 전문 큐레이터입니다.
다음 작품에 대한 설명을 작성해주세요.

전시 타이틀: ${title || ''}
전시 키워드: ${keywords?.join(', ') || ''}
작품 정보: ${JSON.stringify(artwork)}

참고 스타일: ${ragContext}

작품 설명 작성 원칙:
- 150~250자 분량
- 작품의 시각적 특징 설명
- 작품이 전달하는 메시지나 감정 해석
- 전시 전체 맥락과 연결
- 관람객의 이해를 돕는 명확한 표현

JSON 형식으로 응답:
{ "description": "작품 설명 내용" }
`

        try {
          const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'system', content: prompt }],
            temperature: 0.7,
            max_tokens: 600,
          })

          const content = response.choices[0]?.message?.content || ''

          try {
            const parsed = JSON.parse(content)
            return {
              artworkId: artwork.id || index,
              title: artwork.title || `작품 ${index + 1}`,
              description: parsed.description,
            }
          } catch {
            return {
              artworkId: artwork.id || index,
              title: artwork.title || `작품 ${index + 1}`,
              description: content,
            }
          }
        } catch (error) {
          console.error(`Error generating description for artwork ${index}:`, error)
          return {
            artworkId: artwork.id || index,
            title: artwork.title || `작품 ${index + 1}`,
            description: '작품 설명을 생성하는 중 오류가 발생했습니다.',
          }
        }
      })
    )

    return new Response(JSON.stringify({ descriptions }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Generate artwork descriptions error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate artwork descriptions' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
