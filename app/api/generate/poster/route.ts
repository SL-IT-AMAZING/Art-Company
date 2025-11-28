import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium-min'

// Remote chromium URL for Vercel serverless (official Sparticuz release)
const CHROMIUM_URL = 'https://github.com/Sparticuz/chromium/releases/download/v131.0.0/chromium-v131.0.0-pack.tar'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Helper to create poster HTML with text overlay
function createPosterHTML(
  backgroundUrl: string,
  title: string,
  artistName: string,
  dateRange: string,
  venue: string,
  location: string
): string {
  const safeTitle = title || '제목 없음'
  const safeArtist = artistName || ''
  const safeDateRange = dateRange || ''
  const safeVenue = venue || ''
  const safeLocation = location || ''

  // Calculate appropriate font size based on title length
  const getTitleFontSize = (text: string) => {
    const len = text.length
    if (len <= 8) return 72
    if (len <= 12) return 64
    if (len <= 18) return 54
    if (len <= 25) return 46
    if (len <= 35) return 38
    return 32
  }

  const titleFontSize = getTitleFontSize(safeTitle)

  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          width: 1024px;
          height: 1792px;
          overflow: hidden;
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .poster-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .text-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 60px 40px;
        }

        .title-section {
          background: linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.75) 100%);
          padding: 50px 30px;
          border-radius: 12px;
          text-align: center;
          max-width: 100%;
          overflow: hidden;
        }

        .title {
          font-size: ${titleFontSize}px;
          font-weight: 700;
          color: #1E293B;
          line-height: 1.3;
          margin-bottom: 20px;
          word-break: keep-all;
          overflow-wrap: break-word;
          max-width: 100%;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .artist {
          font-size: ${Math.max(24, titleFontSize * 0.5)}px;
          font-weight: 500;
          color: #475569;
          word-break: keep-all;
          overflow-wrap: break-word;
          max-width: 100%;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .details-section {
          background: linear-gradient(to top, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.75) 100%);
          padding: 35px 30px;
          border-radius: 12px;
          text-align: center;
          max-width: 100%;
          overflow: hidden;
        }

        .details {
          font-size: 26px;
          font-weight: 400;
          color: #64748B;
          line-height: 1.6;
        }

        .details p {
          margin: 6px 0;
          word-break: keep-all;
          overflow-wrap: break-word;
          max-width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .details .date {
          font-size: 28px;
          font-weight: 500;
          color: #475569;
          margin-bottom: 12px;
        }

        .details .venue {
          font-size: 24px;
        }

        .details .location {
          font-size: 22px;
          color: #94A3B8;
        }
      </style>
    </head>
    <body>
      <div class="poster-container">
        <img class="background" src="${backgroundUrl}" alt="Background" />

        <div class="text-overlay">
          <div class="title-section">
            <h1 class="title">${safeTitle}</h1>
            ${safeArtist ? `<p class="artist">${safeArtist}</p>` : ''}
          </div>

          <div class="details-section">
            <div class="details">
              ${safeDateRange ? `<p class="date">${safeDateRange}</p>` : ''}
              ${safeVenue ? `<p class="venue">${safeVenue}</p>` : ''}
              ${safeLocation ? `<p class="location">${safeLocation}</p>` : ''}
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

export async function POST(req: NextRequest) {
  let browser = null

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

    let requestBody
    try {
      requestBody = await req.json()
    } catch (parseError) {
      console.error('[Poster] Failed to parse request body:', parseError)
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
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
    } = requestBody

    // Validate exhibition ID
    if (!exhibitionId) {
      console.error('[Poster] Missing exhibition ID')
      return NextResponse.json({ error: 'Exhibition ID is required' }, { status: 400 })
    }

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

    // Generate background with DALL-E 3 (with retry)
    console.log('[Poster] Generating background with DALL-E 3...')
    let backgroundUrl: string | null = null
    let lastError: any = null
    const maxRetries = 2

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Poster] DALL-E attempt ${attempt}/${maxRetries}`)
        const response = await openai.images.generate({
          model: 'dall-e-3',
          prompt: backgroundPrompt,
          size: '1024x1792', // Portrait format for poster
          quality: 'hd',
          n: 1,
          style: 'natural',
        })

        backgroundUrl = response.data?.[0]?.url ?? null
        if (backgroundUrl) {
          console.log('[Poster] DALL-E generation successful')
          break
        }
      } catch (dalleError: any) {
        lastError = dalleError
        console.error(`[Poster] DALL-E attempt ${attempt} failed:`, dalleError?.message || dalleError)

        // Don't retry on certain errors
        if (dalleError?.status === 400 || dalleError?.status === 401) {
          break
        }

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt))
        }
      }
    }

    if (!backgroundUrl) {
      console.error('[Poster] All DALL-E attempts failed')
      return NextResponse.json(
        {
          error: 'Failed to generate poster background. Please try again later.',
          details: lastError?.message || 'Image generation service unavailable'
        },
        { status: 503 }
      )
    }

    // Create HTML with text overlay
    console.log('[Poster] Creating poster HTML with Korean text...')
    const posterHtml = createPosterHTML(
      backgroundUrl,
      title,
      artistName || '',
      dateRange,
      venue || '',
      location || ''
    )

    // Launch Puppeteer - detect environment
    console.log('[Poster] Launching browser for rendering...')
    const isDev = process.env.NODE_ENV === 'development'

    if (isDev) {
      // Local development - use regular puppeteer
      const puppeteerFull = await import('puppeteer')
      browser = await puppeteerFull.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
    } else {
      // Production (Vercel) - use puppeteer-core with remote chromium
      const executablePath = await chromium.executablePath(CHROMIUM_URL)
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: {
          width: 1024,
          height: 1792,
        },
        executablePath,
        headless: true,
      })
    }

    const page = await browser.newPage()
    await page.setViewport({ width: 1024, height: 1792 })

    // Set content and wait for fonts to load
    await page.setContent(posterHtml, {
      waitUntil: 'networkidle0', // Wait for all network requests (including fonts) to complete
    })

    // Take screenshot
    console.log('[Poster] Taking screenshot...')
    const imageBuffer = await page.screenshot({
      type: 'png',
      fullPage: true,
    })

    await browser.close()
    browser = null

    // Upload to Supabase Storage
    console.log('[Poster] Uploading to Supabase Storage...')
    const fileName = `poster_${exhibitionId || 'temp'}_${Date.now()}.png`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('posters')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false,
      })

    if (uploadError) {
      console.error('[Poster] Upload error:', uploadError)
      // Fall back to returning a data URL if upload fails
      const base64 = Buffer.from(imageBuffer).toString('base64')
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

    if (browser) {
      await browser.close()
    }

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
