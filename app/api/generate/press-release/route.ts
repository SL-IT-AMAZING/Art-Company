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

    const prompt = `당신은 전문 미술 전시 보도자료 작성자입니다.

아래 정보를 바탕으로 전문적인 보도자료를 작성해주세요:

전시 제목: ${title}
${artistName ? `작가: ${artistName}` : ''}
키워드: ${keywords.join(', ')}
${introduction ? `전시 소개: ${introduction}` : ''}
${preface ? `서문: ${preface}` : ''}
${exhibitionInfoText}

${ragContext}

보도자료는 다음 형식을 따라야 합니다:
- 헤드라인 (간결하고 임팩트 있게)
- 리드 (핵심 내용 요약)
- 본문 (전시 상세 정보, 작가 소개, 전시 의의)
- 전시 정보 (위에 제공된 날짜, 장소, 입장료 정보를 정확히 포함)

한국어로 작성하고, 전문적이고 공식적인 톤을 유지하세요.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: '당신은 전문 미술 전시 보도자료 작성자입니다.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    })

    const pressRelease = completion.choices[0]?.message?.content || ''

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
