import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium-min'
import { analyzeArtworksForPoster, ArtworkStyleAnalysis } from '@/lib/openai/artwork-analysis'

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
          height: 1792px;  /* DALL-E 3 portrait ratio */
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
          background: transparent;
          padding: 60px 50px;
          text-align: center;
          max-width: 100%;
        }

        .title {
          font-size: ${titleFontSize}px;
          font-weight: 700;
          color: #FFFFFF;
          line-height: 1.2;
          margin-bottom: 24px;
          word-break: keep-all;
          overflow-wrap: break-word;
          max-width: 100%;
          text-shadow: 0 2px 20px rgba(0,0,0,0.5), 0 4px 40px rgba(0,0,0,0.3);
          letter-spacing: -0.02em;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .artist {
          font-size: ${Math.max(28, titleFontSize * 0.45)}px;
          font-weight: 400;
          color: #FFFFFF;
          word-break: keep-all;
          overflow-wrap: break-word;
          max-width: 100%;
          text-shadow: 0 2px 15px rgba(0,0,0,0.5);
          letter-spacing: 0.05em;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .details-section {
          background: transparent;
          padding: 50px;
          text-align: center;
          max-width: 100%;
        }

        .details {
          font-size: 26px;
          font-weight: 400;
          color: #FFFFFF;
          line-height: 1.6;
          text-shadow: 0 2px 15px rgba(0,0,0,0.5);
        }

        .details p {
          margin: 8px 0;
          word-break: keep-all;
          overflow-wrap: break-word;
          max-width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .details .date {
          font-size: 30px;
          font-weight: 500;
          color: #FFFFFF;
          margin-bottom: 16px;
          letter-spacing: 0.02em;
        }

        .details .venue {
          font-size: 26px;
          font-weight: 400;
        }

        .details .location {
          font-size: 22px;
          color: rgba(255,255,255,0.85);
          margin-top: 8px;
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

    // Fetch artworks for the exhibition (for style analysis)
    let artworkImageUrls: string[] = []
    const { data: artworks, error: artworksError } = await supabase
      .from('artworks')
      .select('image_url')
      .eq('exhibition_id', exhibitionId)
      .order('order_index', { ascending: true })

    if (artworksError) {
      console.error('[Poster] Failed to fetch artworks:', artworksError)
    } else {
      artworkImageUrls = artworks?.map((a) => a.image_url).filter(Boolean) || []
      console.log(`[Poster] Found ${artworkImageUrls.length} artworks for analysis`)
    }

    // Analyze artworks for style-informed poster generation
    let artworkAnalysis: ArtworkStyleAnalysis | null = null

    if (artworkImageUrls.length > 0) {
      try {
        console.log(`[Poster] Analyzing ${Math.min(artworkImageUrls.length, 4)} artworks for style...`)
        artworkAnalysis = await analyzeArtworksForPoster(artworkImageUrls)
        console.log('[Poster] Artwork analysis complete:', JSON.stringify(artworkAnalysis, null, 2))
      } catch (analysisError: unknown) {
        const errorMessage = analysisError instanceof Error ? analysisError.message : String(analysisError)
        console.error('[Poster] Artwork analysis failed, proceeding without:', errorMessage)
      }
    }

    // Create DALL-E 3 prompt with strong anti-mockup instructions
    const keywordList = keywords?.join(', ') || 'contemporary art, modern, abstract'
    let backgroundPrompt: string

    if (artworkAnalysis) {
      backgroundPrompt = `Create a PURE PAINTING, NOT a mockup or product image.

Style: ${artworkAnalysis.artStyle}
Colors: ${artworkAnalysis.dominantColors.join(', ')}
Mood: ${artworkAnalysis.mood}
Visual elements: ${artworkAnalysis.visualElements.join(', ')}

CRITICAL REQUIREMENTS:
- This must be a flat, 2D artistic painting that fills the ENTIRE canvas
- Paint directly on the canvas surface with no borders or edges visible
- NO frames, NO borders, NO shadows, NO 3D effects
- NO mockups, NO posters-on-walls, NO gallery scenes
- NO white space, NO margins
- The artwork must extend to ALL four edges seamlessly
- Think of this as an original abstract painting, not a poster design`
    } else {
      backgroundPrompt = `Create a PURE ABSTRACT PAINTING for exhibition background.
Theme: ${keywordList}

CRITICAL: Flat 2D painting, NO mockups, NO frames, NO borders, fills entire canvas edge-to-edge seamlessly. This is NOT a poster mockup, it's an original painting.`
    }

    // Generate background with DALL-E 3
    console.log('[Poster] Generating background with DALL-E 3...')
    let backgroundUrl: string | null = null
    let lastError: any = null
    const maxRetries = 2

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Poster] DALL-E 3 attempt ${attempt}/${maxRetries}`)

        const response = await openai.images.generate({
          model: 'dall-e-3',
          prompt: backgroundPrompt,
          size: '1024x1792',
          quality: 'hd',
          n: 1,
        })

        backgroundUrl = response.data?.[0]?.url ?? null
        if (backgroundUrl) {
          console.log('[Poster] DALL-E 3 generation successful')
          break
        }
      } catch (imageError: any) {
        lastError = imageError
        console.error(`[Poster] DALL-E 3 attempt ${attempt} failed:`, imageError?.message || imageError)

        // Don't retry on certain errors
        if (imageError?.status === 400 || imageError?.status === 401) {
          break
        }

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt))
        }
      }
    }

    if (!backgroundUrl) {
      console.error('[Poster] All DALL-E 3 attempts failed')
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
          height: 1792,  // DALL-E 3 portrait ratio
        },
        executablePath,
        headless: true,
      })
    }

    const page = await browser.newPage()
    await page.setViewport({ width: 1024, height: 1792 })  // DALL-E 3 portrait ratio

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

      // Still save to database with data URL so PDF can find it
      if (exhibitionId) {
        const { error: dbError } = await supabase.from('posters').insert({
          exhibition_id: exhibitionId,
          image_url: dataUrl,
          is_primary: true,
          created_at: new Date().toISOString(),
        })

        if (dbError) {
          console.error('[Poster] Failed to save poster to database:', dbError)
        } else {
          console.log('[Poster] Saved poster with data URL to database')
        }
      }

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
