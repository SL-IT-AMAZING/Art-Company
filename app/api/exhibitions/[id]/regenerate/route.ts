import { openai } from '@/lib/openai/client'
import { getPrompts } from '@/lib/openai/prompts'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { getRAGContext } from '@/lib/rag/retrieval'
import { NextRequest } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { contentType, exhibitionData, locale = 'ko' } = await req.json()
    const supabase = await createClient()

    // Verify user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      })
    }

    // Verify user owns this exhibition
    const { data: exhibition } = await supabase
      .from('exhibitions')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (!exhibition || exhibition.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
      })
    }

    // Get RAG context based on content type
    const ragContext = await getRAGContext(contentType)
    const PROMPTS = getPrompts(locale)
    const isEnglish = locale === 'en'

    // Generate system prompt based on content type
    let systemPrompt = isEnglish
      ? 'You are a professional art curator.'
      : '당신은 전문 미술 큐레이터입니다.'

    const { title = '', keywords = [] } = exhibitionData

    switch (contentType) {
      case 'introduction':
        systemPrompt = PROMPTS.generateIntroduction(title, keywords, ragContext)
        break
      case 'preface':
        systemPrompt = PROMPTS.generatePreface(title, keywords, ragContext)
        break
      case 'pressRelease':
        systemPrompt = PROMPTS.generatePressRelease(exhibitionData, ragContext)
        break
      case 'marketingReport':
        systemPrompt = PROMPTS.generateMarketingReport(
          exhibitionData,
          ragContext
        )
        break
      default:
        systemPrompt = isEnglish
          ? `You are a professional art curator.
          Exhibition Title: ${title}
          Keywords: ${keywords.join(', ')}

          Based on the above information, please write the ${contentType}.`
          : `당신은 전문 미술 큐레이터입니다.
          전시 제목: ${title}
          키워드: ${keywords.join(', ')}

          위 정보를 바탕으로 ${contentType}를 작성해주세요.`
    }

    const userMessage = isEnglish
      ? `Please regenerate the ${contentType}.`
      : `${contentType}를 재생성해주세요.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      stream: true,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      temperature: 0.8, // Higher temperature for more creative regeneration
      max_tokens: 2000,
    })

    let fullCompletion = ''

    const stream = OpenAIStream(response as any, {
      onCompletion: async (completion) => {
        fullCompletion = completion

        // Save regenerated content to database
        try {
          // Check if content already exists
          const { data: existing } = await supabase
            .from('exhibition_content')
            .select('id')
            .eq('exhibition_id', params.id)
            .eq('content_type', contentType)
            .single()

          if (existing) {
            await supabase
              .from('exhibition_content')
              .update({
                content: { text: completion },
                updated_at: new Date().toISOString(),
              })
              .eq('id', existing.id)
          } else {
            await supabase.from('exhibition_content').insert({
              exhibition_id: params.id,
              content_type: contentType,
              content: { text: completion },
            })
          }

          // Update exhibition timestamp
          await supabase
            .from('exhibitions')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', params.id)
        } catch (error) {
          console.error('Error saving regenerated content:', error)
        }
      },
    })

    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('Regenerate API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to regenerate content' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
