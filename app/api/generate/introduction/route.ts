import { openai } from '@/lib/openai/client'
import { PROMPTS } from '@/lib/openai/prompts'
import { getRAGContext } from '@/lib/rag/retrieval'

export async function POST(req: Request) {
  try {
    const { title, keywords } = await req.json()

    if (!title || !keywords) {
      return new Response(
        JSON.stringify({ error: 'Title and keywords are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const ragContext = await getRAGContext('introduction')

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: PROMPTS.generateIntroduction(title, keywords, ragContext),
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content || ''

    // Try to parse JSON response
    try {
      const parsed = JSON.parse(content)
      return new Response(JSON.stringify(parsed), {
        headers: { 'Content-Type': 'application/json' },
      })
    } catch {
      // If not JSON, return as plain text
      return new Response(JSON.stringify({ introduction: content }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    console.error('Generate introduction error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate introduction' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
