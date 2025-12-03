import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium-min'
import { analyzeArtworksForPoster, ArtworkStyleAnalysis } from '@/lib/openai/artwork-analysis'
import {
  PosterMode,
  TemplateStyle,
  ArtworkLayout,
  PosterData,
  FontPresetId,
  generatePosterHTML,
  selectTemplateFromAnalysis,
} from '@/lib/poster-templates'

// Remote chromium URL for Vercel serverless (official Sparticuz release)
const CHROMIUM_URL = 'https://github.com/Sparticuz/chromium/releases/download/v131.0.0/chromium-v131.0.0-pack.tar'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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
      // New parameters
      mode = 'ai-background' as PosterMode,
      template = 'swiss-minimalist' as TemplateStyle,
      font = 'helvetica-clean' as FontPresetId,
      artworkLayout = 'single-large' as ArtworkLayout,
      artworkUrls = [] as string[],
    } = requestBody

    // Validate exhibition ID
    if (!exhibitionId) {
      console.error('[Poster] Missing exhibition ID')
      return NextResponse.json({ error: 'Exhibition ID is required' }, { status: 400 })
    }

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    console.log(`[Poster] Mode: ${mode}, Template: ${template}, Layout: ${artworkLayout}`)

    // Create poster data object
    const posterData: PosterData = {
      exhibitionId,
      title,
      artistName,
      exhibitionDate,
      exhibitionEndDate,
      venue,
      location,
      keywords,
      artworkUrls: artworkUrls.filter(Boolean),
    }

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
    let recommendedTemplate: TemplateStyle | undefined = undefined

    if (artworkImageUrls.length > 0) {
      try {
        console.log(`[Poster] Analyzing ${Math.min(artworkImageUrls.length, 4)} artworks for style...`)
        artworkAnalysis = await analyzeArtworksForPoster(artworkImageUrls)
        console.log('[Poster] Artwork analysis complete:', JSON.stringify(artworkAnalysis, null, 2))

        // Auto-select template based on artwork analysis
        recommendedTemplate = selectTemplateFromAnalysis(artworkAnalysis)
        console.log(`[Poster] Recommended template: ${recommendedTemplate}`)
      } catch (analysisError: unknown) {
        const errorMessage = analysisError instanceof Error ? analysisError.message : String(analysisError)
        console.error('[Poster] Artwork analysis failed, proceeding without:', errorMessage)
      }
    }

    // Determine background URL based on mode
    let backgroundUrl: string | null = null

    // Both modes now generate AI backgrounds based on artwork analysis
    if (mode === 'ai-background' || mode === 'artwork-photo') {
      console.log(`[Poster] Generating background with DALL-E 3 (mode: ${mode})...`)

      const keywordList = keywords?.join(', ') || 'contemporary art, modern, abstract'
      let backgroundPrompt: string

      if (artworkAnalysis) {
        // Use artwork analysis to create inspired background
        const inspirationNote = mode === 'artwork-photo'
          ? 'This background is INSPIRED BY the artwork style but creates a new composition suitable for a poster background.'
          : 'This background complements the exhibition theme.'

        backgroundPrompt = `Create a PURE PAINTING for exhibition poster background, NOT a mockup.

${inspirationNote}

Style: ${artworkAnalysis.artStyle}
Color palette: ${artworkAnalysis.dominantColors.join(', ')}
Mood: ${artworkAnalysis.mood}
Visual elements to incorporate: ${artworkAnalysis.visualElements.join(', ')}

CRITICAL REQUIREMENTS:
- Create a NEW composition inspired by these elements
- This must be a flat, 2D artistic painting that fills the ENTIRE canvas
- Paint directly on the canvas surface with no borders or edges visible
- NO frames, NO borders, NO shadows, NO 3D effects
- NO mockups, NO posters-on-walls, NO gallery scenes, NO text
- NO white space, NO margins
- The artwork must extend to ALL four edges seamlessly
- Suitable as a background for overlaying exhibition text
- Abstract or semi-abstract style that won't compete with text overlay`
      } else {
        backgroundPrompt = `Create a PURE ABSTRACT PAINTING for exhibition poster background.
Theme: ${keywordList}

CRITICAL: Flat 2D painting, NO mockups, NO frames, NO borders, NO text. Fills entire canvas edge-to-edge seamlessly. This is a background suitable for text overlay.`
      }

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
    }

    // Generate HTML using new template system
    console.log(`[Poster] Generating HTML with template: ${template}, font: ${font}`)
    const posterHtml = generatePosterHTML(
      mode,
      template,
      posterData,
      backgroundUrl || undefined,
      undefined, // artworkLayout is no longer used
      font
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
        recommendedTemplate,
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
      message: `Poster generated successfully with ${template} template`,
      template,
      mode,
      recommendedTemplate,
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
