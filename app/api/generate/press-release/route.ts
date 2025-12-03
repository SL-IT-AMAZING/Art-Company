import { OpenAI } from 'openai'
import { getRAGContext } from '@/lib/rag/retrieval'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const {
      title,
      keywords,
      introduction,
      preface,
      exhibitionDate,
      exhibitionEndDate,
      venue,
      location,
      artistName,
      openingHours,
      admissionFee,
    } = await req.json()

    if (!title || !keywords || keywords.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Format date range
    const formatDate = (dateStr: string) => {
      if (!dateStr) return null
      const date = new Date(dateStr)
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }

    const startDate = formatDate(exhibitionDate)
    const endDate = formatDate(exhibitionEndDate)
    const dateRange = startDate
      ? endDate
        ? `${startDate} - ${endDate}`
        : startDate
      : null

    // Build exhibition info section
    const exhibitionInfo = []
    if (dateRange) exhibitionInfo.push(`전시 기간: ${dateRange}`)
    if (venue) exhibitionInfo.push(`장소: ${venue}`)
    if (location) exhibitionInfo.push(`주소: ${location}`)
    if (openingHours) exhibitionInfo.push(`운영 시간: ${openingHours}`)
    if (admissionFee) exhibitionInfo.push(`입장료: ${admissionFee}`)

    const exhibitionInfoText = exhibitionInfo.length > 0
      ? `\n\n전시 정보:\n${exhibitionInfo.join('\n')}`
      : ''

    // Get RAG context for press releases
    const ragContext = await getRAGContext('press_release')

    const prompt = `당신은 신문 기사를 작성하는 기자입니다.

아래 전시 정보를 바탕으로 뉴스 기사 형태의 보도자료를 작성해주세요.

전시 제목: ${title}
${artistName ? `작가: ${artistName}` : ''}
키워드: ${keywords.join(', ')}
${introduction ? `전시 소개: ${introduction}` : ''}
${exhibitionInfoText}

${ragContext}

**중요 규칙:**
- "헤드라인", "리드", "본문", "전시 정보" 같은 섹션 제목/라벨 없이 작성
- 3~4개 문단으로 구성된 연속된 글로 작성
- 첫 문장부터 바로 내용 시작
- 마지막 문단에 전시 기간, 장소, 운영시간 등을 자연스럽게 포함
- 400~600자 분량
- 전문적이고 공식적인 톤 유지`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: '당신은 뉴스 기사를 작성하는 기자입니다. 절대로 "헤드라인:", "리드:", "본문:", "전시 정보:" 같은 섹션 제목을 사용하지 마세요. 바로 기사 내용만 작성하세요.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 1500,
    })

    let pressRelease = completion.choices[0]?.message?.content || ''

    // 후처리: 섹션 제목 제거
    pressRelease = pressRelease
      .replace(/^#+\s*.+\n+/gm, '') // 마크다운 헤딩 제거
      .replace(/^(헤드라인|리드|본문|전시\s*정보)\s*[:：]\s*\n?/gim, '') // 섹션 라벨 제거
      .replace(/^(Headline|Lead|Body)\s*[:：]\s*\n?/gim, '') // 영문 라벨 제거
      .replace(/\n{3,}/g, '\n\n') // 3줄 이상 빈줄을 2줄로
      .trim()

    return new Response(
      JSON.stringify({ pressRelease }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Press release generation error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate press release' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
