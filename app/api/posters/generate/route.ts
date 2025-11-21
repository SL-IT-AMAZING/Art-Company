import { openai } from '@/lib/openai/client'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { exhibitionId, title, artistName, style, keywords } = await req.json()

    if (!title) {
      return NextResponse.json(
        { error: 'Exhibition title is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate poster prompt
    const posterPrompt = `
Create a sophisticated exhibition poster with the following details:

Title: ${title}
Artist: ${artistName || '현대 작가'}
Style: ${style || 'Modern Contemporary Art'}
Keywords: ${keywords?.join(', ') || 'art, exhibition'}

Design requirements:
- Clean, minimalist aesthetic with elegant typography
- Warm beige/cream background (#F5F3F0)
- Deep navy text (#1E293B) for title
- Professional gallery poster layout
- Include exhibition title prominently
- Subtle artistic elements that complement the theme
- High-end gallery aesthetic
- Korean and English text if applicable

The poster should evoke a sense of sophistication and artistic excellence, suitable for a contemporary art gallery.
`.trim()

    console.log('Generating poster with DALL-E 3...')

    // Generate poster with DALL-E 3
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: posterPrompt,
      n: 1,
      size: '1024x1792', // Portrait format for poster
      quality: 'hd',
      style: 'natural',
    })

    const imageUrl = response.data?.[0]?.url

    if (!imageUrl) {
      throw new Error('Failed to generate poster image')
    }

    console.log('Poster generated:', imageUrl)

    // Save poster URL to database
    if (exhibitionId) {
      const { data: exhibition } = await supabase
        .from('exhibitions')
        .select('posters')
        .eq('id', exhibitionId)
        .single()

      const existingPosters = exhibition?.posters || []

      await supabase
        .from('exhibitions')
        .update({
          posters: [...existingPosters, imageUrl],
          updated_at: new Date().toISOString(),
        })
        .eq('id', exhibitionId)
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt: posterPrompt,
    })
  } catch (error: any) {
    console.error('Poster generation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate poster',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Get existing posters for an exhibition
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const exhibitionId = searchParams.get('exhibitionId')

    if (!exhibitionId) {
      return NextResponse.json(
        { error: 'Exhibition ID required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: exhibition } = await supabase
      .from('exhibitions')
      .select('posters')
      .eq('id', exhibitionId)
      .single()

    return NextResponse.json({
      posters: exhibition?.posters || [],
    })
  } catch (error) {
    console.error('Error fetching posters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posters' },
      { status: 500 }
    )
  }
}
