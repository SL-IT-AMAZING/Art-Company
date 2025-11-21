import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { exhibitionId, title, keywords, artistName } = await req.json()

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Create poster prompt in Korean
    const posterPrompt = `Create a minimalist and elegant exhibition poster with the following details:

Exhibition Title: "${title}"
Artist: ${artistName || 'Contemporary Artist'}
Keywords: ${keywords?.join(', ') || 'contemporary art, modern, abstract'}

Style Guidelines:
- Modern and sophisticated art gallery aesthetic
- Clean typography with generous white space
- Subtle Korean influence in design elements
- Professional museum-quality appearance
- Elegant color palette (warm beige, deep navy, or muted earth tones)
- Large clear title text at the top
- Artist name in refined serif font
- No busy patterns or overwhelming details
- Gallery exhibition poster style

The poster should feel premium, timeless, and appropriate for a high-end contemporary art exhibition.`

    // Generate poster with DALL-E 3
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: posterPrompt,
      size: '1024x1792', // Portrait format for poster
      quality: 'hd',
      n: 1,
      style: 'natural', // More photorealistic/realistic style
    })

    const posterUrl = response.data?.[0]?.url

    if (!posterUrl) {
      throw new Error('No image URL returned from DALL-E')
    }

    // Save poster URL to database
    if (exhibitionId) {
      const { error: dbError } = await supabase.from('posters').insert({
        exhibition_id: exhibitionId,
        image_url: posterUrl,
        is_primary: true,
        created_at: new Date().toISOString(),
      })

      if (dbError) {
        console.error('Failed to save poster to database:', dbError)
        // Continue anyway, return the URL
      }
    }

    return NextResponse.json({
      posterUrl,
      message: 'Poster generated successfully with DALL-E 3',
    })
  } catch (error: any) {
    console.error('Generate poster error:', error)

    // Handle OpenAI API errors
    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    if (error?.status === 400) {
      return NextResponse.json(
        { error: 'Invalid request to image generation API' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate poster' },
      { status: 500 }
    )
  }
}
