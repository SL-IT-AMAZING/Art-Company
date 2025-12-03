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
      referenceImage = null as string | null,
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

    // Use artworkUrls from request (images uploaded by user)
    let artworkImageUrls: string[] = artworkUrls.filter(Boolean)

    // If no artworks in request, try fetching from database (for existing exhibitions)
    if (artworkImageUrls.length === 0 && exhibitionId) {
      const { data: artworks, error: artworksError } = await supabase
        .from('artworks')
        .select('image_url')
        .eq('exhibition_id', exhibitionId)
        .order('order_index', { ascending: true })

      if (artworksError) {
        console.error('[Poster] Failed to fetch artworks:', artworksError)
      } else {
        artworkImageUrls = artworks?.map((a) => a.image_url).filter(Boolean) || []
        console.log(`[Poster] Found ${artworkImageUrls.length} artworks from database`)
      }
    } else {
      console.log(`[Poster] Using ${artworkImageUrls.length} artworks from request`)
    }

    // Analyze artworks for style-informed poster generation
    let artworkAnalysis: ArtworkStyleAnalysis | null = null
    let recommendedTemplate: TemplateStyle | undefined = undefined

    // Use only reference image if provided, otherwise analyze up to 4 artworks
    const imagesToAnalyze = referenceImage
      ? [referenceImage]
      : artworkImageUrls.slice(0, 4)

    if (imagesToAnalyze.length > 0) {
      try {
        console.log(`[Poster] Analyzing ${Math.min(imagesToAnalyze.length, 4)} artworks for style...`)
        if (referenceImage) {
          console.log(`[Poster] Using reference image as primary guide: ${referenceImage}`)
        }
        artworkAnalysis = await analyzeArtworksForPoster(imagesToAnalyze)
        console.log('[Poster] Artwork analysis complete:', JSON.stringify(artworkAnalysis, null, 2))

        // Auto-select template based on artwork analysis
        recommendedTemplate = selectTemplateFromAnalysis(artworkAnalysis)
        console.log(`[Poster] Recommended template: ${recommendedTemplate}`)
      } catch (analysisError: unknown) {
        const errorMessage = analysisError instanceof Error ? analysisError.message : String(analysisError)
        console.error('[Poster] Artwork analysis failed, proceeding without:', errorMessage)
      }
    }

    // Generate single background based on the artwork
    let backgroundUrl: string | null = null

    if (mode === 'ai-background' || mode === 'artwork-photo') {
      console.log(`[Poster] Generating background based on artwork...`)

      let backgroundPrompt: string

      if (artworkAnalysis) {
        backgroundPrompt = `Create a poster background based on the reference image.

CRITICAL: The image MUST fill the ENTIRE canvas from edge to edge
- Full-bleed composition with NO empty space, NO margins, NO borders
- Extend the artwork to completely fill vertical 1024x1792 format
- Every pixel of the canvas must be filled with the artwork
- The image should bleed off all four edges
- No white space, no gaps, no borders whatsoever
- Keep the style and colors of the reference`
      } else {
        backgroundPrompt = `Create an abstract painting for exhibition poster.

TECHNICAL REQUIREMENTS:
- FULL-BLEED painting filling entire vertical canvas edge-to-edge
- NO white space, NO margins, NO borders, NO text
- All-over composition filling portrait rectangle
- Every pixel is part of the artwork`
      }

      try {
        const response = await openai.images.generate({
          model: 'dall-e-3',
          prompt: backgroundPrompt,
          size: '1024x1792',
          quality: 'hd',
          n: 1,
        })

        backgroundUrl = response.data?.[0]?.url ?? null
        if (backgroundUrl) {
          console.log(`[Poster] Background generated successfully`)
        }
      } catch (imageError: any) {
        console.error(`[Poster] Failed to generate background:`, imageError?.message)
        return NextResponse.json(
          {
            error: 'Failed to generate poster background. Please try again later.',
          },
          { status: 503 }
        )
      }

      if (!backgroundUrl) {
        console.error('[Poster] Background generation failed')
        return NextResponse.json(
          {
            error: 'Failed to generate poster background. Please try again later.',
          },
          { status: 503 }
        )
      }
    }

    // Generate single poster with the selected template
    console.log(`[Poster] Generating poster with ${template} template`)
    let posterUrl: string | null = null

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

    // Generate single poster
    console.log(`[Poster] Generating ${template} poster...`)

    const posterHtml = generatePosterHTML(
      mode,
      template,
      posterData,
      backgroundUrl || '',
      undefined,
      font
    )

    const page = await browser.newPage()
    await page.setViewport({ width: 1024, height: 1792 })

    await page.setContent(posterHtml, {
      waitUntil: 'networkidle0',
    })

    const imageBuffer = await page.screenshot({
      type: 'png',
      fullPage: true,
    })

    await page.close()

    // Upload to Supabase Storage
    const fileName = `poster_${exhibitionId || 'temp'}_${template}_${Date.now()}.png`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('posters')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false,
      })

    if (!uploadError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from('posters').getPublicUrl(uploadData.path)
      posterUrl = publicUrl
    } else {
      console.error(`[Poster] Upload error:`, uploadError)
      const base64 = Buffer.from(imageBuffer).toString('base64')
      posterUrl = `data:image/png;base64,${base64}`
    }

    await browser.close()
    browser = null

    // Save poster to database
    if (exhibitionId && posterUrl) {
      const { error: dbError } = await supabase.from('posters').insert({
        exhibition_id: exhibitionId,
        image_url: posterUrl,
        is_primary: true,
        created_at: new Date().toISOString(),
      })

      if (dbError) {
        console.error(`[Poster] Failed to save to database:`, dbError)
      }
    }

    console.log('[Poster] Success! Generated poster')
    return NextResponse.json({
      posterUrl,
      message: `Generated poster successfully`,
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
