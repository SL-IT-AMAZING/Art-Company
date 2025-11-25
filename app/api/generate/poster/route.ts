import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import sharp from 'sharp'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Helper to create text overlay SVG
function createTextOverlaySVG(
  width: number,
  height: number,
  title: string,
  artistName: string,
  dateRange: string,
  venue: string,
  location: string
): string {
  // Escape special XML characters
  const escapeXml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')

  const safeTitle = escapeXml(title || '제목 없음')
  const safeArtist = escapeXml(artistName || '')
  const safeDateRange = escapeXml(dateRange || '')
  const safeVenue = escapeXml(venue || '')
  const safeLocation = escapeXml(location || '')

  // Calculate positions (portrait poster: 1024x1792)
  const titleY = height * 0.35
  const artistY = height * 0.45
  const detailsStartY = height * 0.75

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
          .title {
            font-family: 'Pretendard', sans-serif;
            font-size: 72px;
            font-weight: 700;
            fill: #1E293B;
          }
          .artist {
            font-family: 'Pretendard', sans-serif;
            font-size: 36px;
            font-weight: 500;
            fill: #475569;
          }
          .details {
            font-family: 'Pretendard', sans-serif;
            font-size: 28px;
            font-weight: 400;
            fill: #64748B;
          }
        </style>
        <!-- Semi-transparent overlay for text readability -->
        <linearGradient id="textBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:rgba(255,255,255,0.7)"/>
          <stop offset="50%" style="stop-color:rgba(255,255,255,0.85)"/>
          <stop offset="100%" style="stop-color:rgba(255,255,255,0.7)"/>
        </linearGradient>
      </defs>

      <!-- Semi-transparent background for text area -->
      <rect x="0" y="${titleY - 100}" width="${width}" height="${height * 0.25}" fill="url(#textBg)"/>
      <rect x="0" y="${detailsStartY - 60}" width="${width}" height="${height * 0.2}" fill="url(#textBg)"/>

      <!-- Title -->
      <text x="${width / 2}" y="${titleY}" class="title" text-anchor="middle">${safeTitle}</text>

      <!-- Artist Name -->
      ${safeArtist ? `<text x="${width / 2}" y="${artistY}" class="artist" text-anchor="middle">${safeArtist}</text>` : ''}

      <!-- Exhibition Details -->
      ${safeDateRange ? `<text x="${width / 2}" y="${detailsStartY}" class="details" text-anchor="middle">${safeDateRange}</text>` : ''}
      ${safeVenue ? `<text x="${width / 2}" y="${detailsStartY + 45}" class="details" text-anchor="middle">${safeVenue}</text>` : ''}
      ${safeLocation ? `<text x="${width / 2}" y="${detailsStartY + 90}" class="details" text-anchor="middle">${safeLocation}</text>` : ''}
    </svg>
  `
}

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

    const {
      exhibitionId,
      title,
      keywords,
      artistName,
      exhibitionDate,
      exhibitionEndDate,
      venue,
      location,
    } = await req.json()

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Format dates for display
    const formatDate = (dateStr: string) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }

    const dateRange = exhibitionDate
      ? exhibitionEndDate
        ? `${formatDate(exhibitionDate)} - ${formatDate(exhibitionEndDate)}`
        : formatDate(exhibitionDate)
      : ''

    // Create DALL-E prompt for BACKGROUND ONLY (no text)
    const keywordList = keywords?.join(', ') || 'contemporary art, modern, abstract'
    const backgroundPrompt = `Create an abstract, minimalist exhibition poster BACKGROUND design.

IMPORTANT: NO TEXT, NO LETTERS, NO WORDS, NO TYPOGRAPHY of any kind.

Style:
- Elegant, museum-quality aesthetic
- Subtle artistic patterns or gradients
- Color palette: warm beige (#F5F3F0), deep navy (#1E293B), muted earth tones
- Clean, sophisticated gallery feel
- Leave space in the center and bottom for text overlay
- Inspired by: ${keywordList}

The design should be a beautiful abstract background suitable for a high-end contemporary art exhibition poster.
Do NOT include any text, titles, names, dates, or letters.`

    // Generate background with DALL-E 3
    console.log('[Poster] Generating background with DALL-E 3...')
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: backgroundPrompt,
      size: '1024x1792', // Portrait format for poster
      quality: 'hd',
      n: 1,
      style: 'natural',
    })

    const backgroundUrl = response.data?.[0]?.url
    if (!backgroundUrl) {
      throw new Error('No image URL returned from DALL-E')
    }

    // Download the background image
    console.log('[Poster] Downloading background image...')
    const imageResponse = await fetch(backgroundUrl)
    if (!imageResponse.ok) {
      throw new Error('Failed to download background image')
    }
    const backgroundBuffer = Buffer.from(await imageResponse.arrayBuffer())

    // Get image dimensions
    const metadata = await sharp(backgroundBuffer).metadata()
    const width = metadata.width || 1024
    const height = metadata.height || 1792

    // Create text overlay SVG
    console.log('[Poster] Creating text overlay...')
    const textSvg = createTextOverlaySVG(
      width,
      height,
      title,
      artistName || '',
      dateRange,
      venue || '',
      location || ''
    )

    // Composite text over background
    console.log('[Poster] Compositing final image...')
    const finalImageBuffer = await sharp(backgroundBuffer)
      .composite([
        {
          input: Buffer.from(textSvg),
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toBuffer()

    // Upload to Supabase Storage
    console.log('[Poster] Uploading to Supabase Storage...')
    const fileName = `poster_${exhibitionId || 'temp'}_${Date.now()}.png`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('posters')
      .upload(fileName, finalImageBuffer, {
        contentType: 'image/png',
        upsert: false,
      })

    if (uploadError) {
      console.error('[Poster] Upload error:', uploadError)
      // Fall back to returning a data URL if upload fails
      const base64 = finalImageBuffer.toString('base64')
      const dataUrl = `data:image/png;base64,${base64}`

      return NextResponse.json({
        posterUrl: dataUrl,
        message: 'Poster generated (upload failed, using data URL)',
      })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('posters').getPublicUrl(uploadData.path)

    // Save poster record to database
    if (exhibitionId) {
      const { error: dbError } = await supabase.from('posters').insert({
        exhibition_id: exhibitionId,
        image_url: publicUrl,
        is_primary: true,
        created_at: new Date().toISOString(),
      })

      if (dbError) {
        console.error('[Poster] Failed to save poster to database:', dbError)
      }
    }

    console.log('[Poster] Success!')
    return NextResponse.json({
      posterUrl: publicUrl,
      message: 'Poster generated successfully with perfect Korean text',
    })
  } catch (error: any) {
    console.error('[Poster] Generate poster error:', error)

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
