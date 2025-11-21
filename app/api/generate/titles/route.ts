import { openai } from '@/lib/openai/client'
import { PROMPTS } from '@/lib/openai/prompts'

export async function POST(req: Request) {
  try {
    const { keywords, artworkDescriptions } = await req.json()

    if (!keywords || keywords.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Keywords are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: PROMPTS.generateTitles(keywords, artworkDescriptions || []),
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
    })

    const content = response.choices[0]?.message?.content || ''

    // Try to parse JSON response
    try {
      const parsed = JSON.parse(content)
      return new Response(JSON.stringify(parsed), {
        headers: { 'Content-Type': 'application/json' },
      })
    } catch {
      // If not JSON, return as plain text wrapped in titles array
      const titles = content
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .slice(0, 5)

      return new Response(JSON.stringify({ titles }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    console.error('Generate titles error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate titles' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
