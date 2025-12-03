import { openai } from '@/lib/openai/client'
import { PROMPTS } from '@/lib/openai/prompts'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { getRAGContext } from '@/lib/rag/retrieval'

// DO NOT use edge runtime - it conflicts with some dependencies
// export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { messages, exhibitionId, step, data } = await req.json()

    const supabase = await createClient()

    // Get RAG context based on step
    const ragContext = await getRAGContext(step)

    let systemPrompt = '당신은 전문 미술 큐레이터입니다.'

    switch (step) {
      case 'titles':
        systemPrompt = PROMPTS.generateTitles(
          data.keywords || [],
          data.artworkDescriptions || []
        )
        break
      case 'introduction':
        systemPrompt = PROMPTS.generateIntroduction(
          data.title || '',
          data.keywords || [],
          ragContext
        )
        break
      case 'preface':
        systemPrompt = PROMPTS.generatePreface(
          data.title || '',
          data.keywords || [],
          ragContext
        )
        break
      case 'pressRelease':
        systemPrompt = PROMPTS.generatePressRelease(data, ragContext)
        break
      case 'marketingReport':
        systemPrompt = PROMPTS.generateMarketingReport(data, ragContext)
        break
      default:
        systemPrompt = '당신은 전문 미술 큐레이터입니다.'
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      stream: true,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const stream = OpenAIStream(response as any, {
      onCompletion: async (completion) => {
        // Save to database if exhibition ID and step are provided
        if (exhibitionId && step) {
          try {
            await supabase.from('exhibition_content').insert({
              exhibition_id: exhibitionId,
              content_type: step,
              content: { text: completion },
            })
          } catch (error) {
            console.error('Error saving to database:', error)
          }
        }

        // Save conversation history to exhibitions table
        if (exhibitionId) {
          try {
            // Get current conversation
            const { data: exhibition } = await supabase
              .from('exhibitions')
              .select('curator_conversation')
              .eq('id', exhibitionId)
              .single()

            const currentConversation = exhibition?.curator_conversation || []

            // Add new messages
            const newConversation = [
              ...currentConversation,
              ...messages.map((msg: any) => ({
                role: msg.role,
                content: msg.content,
                timestamp: new Date().toISOString(),
                step,
              })),
              {
                role: 'assistant',
                content: completion,
                timestamp: new Date().toISOString(),
                step,
              }
            ]

            // Update exhibition with new conversation
            await supabase
              .from('exhibitions')
              .update({ curator_conversation: newConversation })
              .eq('id', exhibitionId)
          } catch (error) {
            console.error('Error saving conversation:', error)
          }
        }
      },
    })

    return new StreamingTextResponse(stream)
  } catch (error: any) {
    console.error('Chat API error:', error)
    const errorMessage = error?.message || 'Unknown error'
    const errorDetails = {
      error: 'Failed to process chat request',
      message: errorMessage,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    }
    console.error('Error details:', errorDetails)
    return new Response(
      JSON.stringify(errorDetails),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
