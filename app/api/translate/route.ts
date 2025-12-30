import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { title, content } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Remove HTML tags for better translation
    const stripHtml = (html: string) => {
      return html.replace(/<[^>]*>/g, '')
    }

    const plainContent = stripHtml(content)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional translator. Translate Korean to English naturally and professionally. Maintain the same tone and style. For HTML content, preserve all HTML tags and only translate the text content.',
        },
        {
          role: 'user',
          content: `Translate the following Korean notice to English:

Title: ${title}

Content (HTML):
${content}

Please respond in JSON format:
{
  "title_en": "translated title",
  "content_en": "translated content with HTML tags preserved"
}`,
        },
      ],
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')

    return NextResponse.json({
      title_en: result.title_en || title,
      content_en: result.content_en || content,
    })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    )
  }
}
