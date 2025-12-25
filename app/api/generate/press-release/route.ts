import { OpenAI } from 'openai'
import { getPrompts } from '@/lib/openai/prompts'
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
      locale = 'ko',
    } = await req.json()

    if (!title || !keywords || keywords.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const isEnglish = locale === 'en'

    // Format date range based on locale
    const formatDate = (dateStr: string) => {
      if (!dateStr) return null
      const date = new Date(dateStr)
      return date.toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR', {
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

    // Build exhibition info section with locale-aware labels
    const labels = isEnglish
      ? {
          period: 'Exhibition Period',
          venue: 'Venue',
          address: 'Address',
          hours: 'Hours',
          admission: 'Admission',
          exhibitionInfo: 'Exhibition Information',
          exhibitionTitle: 'Exhibition Title',
          artist: 'Artist',
        }
      : {
          period: '전시 기간',
          venue: '장소',
          address: '주소',
          hours: '운영 시간',
          admission: '입장료',
          exhibitionInfo: '전시 정보',
          exhibitionTitle: '전시명',
          artist: '작가명',
        }

    const exhibitionInfo = []
    if (dateRange) exhibitionInfo.push(`${labels.period}: ${dateRange}`)
    if (venue) exhibitionInfo.push(`${labels.venue}: ${venue}`)
    if (location) exhibitionInfo.push(`${labels.address}: ${location}`)
    if (openingHours) exhibitionInfo.push(`${labels.hours}: ${openingHours}`)
    if (admissionFee) exhibitionInfo.push(`${labels.admission}: ${admissionFee}`)

    const exhibitionInfoText = exhibitionInfo.length > 0
      ? `\n\n${labels.exhibitionInfo}:\n${exhibitionInfo.join('\n')}`
      : ''

    // Get RAG context for press releases
    const ragContext = await getRAGContext('press_release')

    // Build the prompt based on locale
    const prompt = isEnglish
      ? `You are a journalist writing a news article.

Based on the exhibition information below, write a press release in news article format.

Exhibition Title: ${title}
${artistName ? `Artist: ${artistName}` : ''}
Keywords: ${keywords.join(', ')}
${introduction ? `Exhibition Introduction: ${introduction}` : ''}
${exhibitionInfoText}

${ragContext}

**Important rules:**
- Start with the exhibition information in this format:

**Exhibition Information**

• ${labels.exhibitionTitle}: [Exhibition Title]
${artistName ? `• ${labels.artist}: ${artistName}` : ''}
${dateRange ? `• ${labels.period}: ${dateRange}` : ''}
${location ? `• ${labels.address}: ${location}` : ''}
${venue ? `• ${labels.venue}: ${venue}` : ''}
${openingHours ? `• ${labels.hours}: ${openingHours}` : ''}
${admissionFee ? `• ${labels.admission}: ${admissionFee}` : ''}

---

- After the exhibition info, write 3-4 paragraphs as continuous prose
- Do NOT use section titles/labels like "Headline", "Lead", "Body"
- 300-450 words
- Maintain a professional and formal tone`
      : `당신은 신문 기사를 작성하는 기자입니다.

아래 전시 정보를 바탕으로 뉴스 기사 형태의 보도자료를 작성해주세요.

전시 제목: ${title}
${artistName ? `작가: ${artistName}` : ''}
키워드: ${keywords.join(', ')}
${introduction ? `전시 소개: ${introduction}` : ''}
${exhibitionInfoText}

${ragContext}

**중요 규칙:**
- 맨 처음에 다음과 같은 형식으로 전시 정보를 정리해서 제시:

**전시 정보**

• 전시명: [전시 제목]
${artistName ? `• 작가명: ${artistName}` : ''}
${dateRange ? `• 전시기간: ${dateRange}` : ''}
${location ? `• 주소: ${location}` : ''}
${venue ? `• 전시장소: ${venue}` : ''}
${openingHours ? `• 운영시간: ${openingHours}` : ''}
${admissionFee ? `• 입장료: ${admissionFee}` : ''}

---

- 전시 정보 다음에 3~4개 문단으로 구성된 연속된 줄글 작성
- "헤드라인", "리드", "본문" 같은 섹션 제목/라벨 사용하지 않기
- 400~600자 분량
- 전문적이고 공식적인 톤 유지`

    const systemMessage = isEnglish
      ? 'You are a journalist writing news articles. Never use section titles like "Headline:", "Lead:", "Body:", "Exhibition Info:". Just write the article content directly.'
      : '당신은 뉴스 기사를 작성하는 기자입니다. 절대로 "헤드라인:", "리드:", "본문:", "전시 정보:" 같은 섹션 제목을 사용하지 마세요. 바로 기사 내용만 작성하세요.'

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemMessage,
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

    // Post-processing: Remove section titles
    pressRelease = pressRelease
      .replace(/^#+\s*.+\n+/gm, '') // Remove markdown headings
      .replace(/^(헤드라인|리드|본문|전시\s*정보)\s*[:：]\s*\n?/gim, '') // Remove Korean section labels
      .replace(/^(Headline|Lead|Body|Exhibition\s*Info)\s*[:：]\s*\n?/gim, '') // Remove English labels
      .replace(/\n{3,}/g, '\n\n') // Reduce 3+ blank lines to 2
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
