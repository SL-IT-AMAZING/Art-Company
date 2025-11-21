import { openai } from '@/lib/openai/client'
import { PROMPTS } from '@/lib/openai/prompts'
import { getRAGContext } from '@/lib/rag/retrieval'

export async function POST(req: Request) {
  try {
    const { artistName, keywords, title } = await req.json()

    if (!artistName) {
      return new Response(
        JSON.stringify({ error: 'Artist name is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const artistInfo = {
      name: artistName,
      keywords: keywords || [],
      exhibitionTitle: title || '',
    }

    const ragContext = await getRAGContext('artist_bio')

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: PROMPTS.generateArtistBio(artistInfo, ragContext),
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
      return new Response(JSON.stringify({ artistBio: content }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    console.error('Generate artist bio error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate artist bio' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
