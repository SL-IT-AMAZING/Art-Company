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

    // Helper function to generate a single background
    const generateBackground = async (): Promise<string | null> => {
      if (mode !== 'ai-background' && mode !== 'artwork-photo') {
        return null
      }

      let backgroundPrompt: string

      if (artworkAnalysis) {
        backgroundPrompt = `Create a stunning vertical exhibition poster inspired by this reference artwork.

Exhibition: ${title || 'Art Exhibition'}
Artist: ${artistName || 'Featured Artist'}

CREATIVE DIRECTION:
- Reimagine this artwork as a dramatic vertical poster (9:16 format)
- Capture the essence, style, and mood of the reference image
- Recreate key visual elements, colors, and artistic techniques
- Compose specifically for vertical poster format (not just crop/extend)
- Think: "How would this artwork look if originally created as a tall poster?"

POSTER COMPOSITION:
- Full vertical canvas with intentional top-to-bottom flow
- Natural space at top and bottom thirds for text overlay
- Maintain artistic integrity while adapting to poster format
- Enhanced visual impact for exhibition display

REQUIREMENTS:
- Professional gallery poster aesthetic
- Strong visual presence from a distance
- Clear areas for title and event details
- NO text, logos, frames, or watermarks in the image
- Pure artwork background ready for text overlay

Style: Keep the original's artistic voice, colors, and technique but reimagined for vertical poster format.`
      } else {
        backgroundPrompt = `Create an abstract painting for exhibition poster.

TECHNICAL REQUIREMENTS:
- FULL-BLEED painting filling entire vertical canvas edge-to-edge
- NO white space, NO margins, NO borders, NO text
- All-over composition filling portrait rectangle
- Every pixel is part of the artwork`
      }

      try {
        const ideogramApiKey = process.env.IDEOGRAM_API_KEY

        if (!ideogramApiKey) {
          console.warn('[Poster] IDEOGRAM_API_KEY not found, falling back to DALL-E')
          const response = await openai.images.generate({
            model: 'dall-e-3',
            prompt: backgroundPrompt,
            size: '1024x1792',
            quality: 'hd',
            n: 1,
          })
          return response.data?.[0]?.url ?? null
        }

        console.log('[Poster] Using Ideogram API')
        let response

        if (referenceImage) {
          console.log('[Poster] Using Ideogram Remix API with reference image')
          const imageResponse = await fetch(referenceImage)
          const imageBlob = await imageResponse.blob()

          const formData = new FormData()
          formData.append('image_file', imageBlob, 'reference.png')
          formData.append('image_request', JSON.stringify({
            prompt: backgroundPrompt,
            aspect_ratio: 'ASPECT_9_16',
            model: 'V_2',
            image_weight: 65,
            magic_prompt_option: 'OFF',
          }))

          response = await fetch('https://api.ideogram.ai/remix', {
            method: 'POST',
            headers: { 'Api-Key': ideogramApiKey },
            body: formData
          })
        } else {
          response = await fetch('https://api.ideogram.ai/generate', {
            method: 'POST',
            headers: {
              'Api-Key': ideogramApiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image_request: {
                prompt: backgroundPrompt,
                aspect_ratio: 'ASPECT_9_16',
                model: 'V_2',
                magic_prompt_option: 'AUTO',
              }
            })
          })
        }

        if (!response.ok) {
          const errorText = await response.text()
          console.error('[Poster] Ideogram API error:', response.status, errorText)
          throw new Error(`Ideogram API error: ${response.status}`)
        }

        const data = await response.json()
        return data.data?.[0]?.url ?? null
      } catch (error: any) {
        console.error('[Poster] Failed to generate background:', error?.message)
        throw error
      }
    }

    // Generate posters with all 4 templates
    console.log(`[Poster] Generating posters with all 4 templates (each with unique background)`)
    const allTemplates: TemplateStyle[] = ['swiss-minimalist', 'vibrant-contemporary', 'classic-elegant', 'bold-brutalist']
    const posterUrls: { template: string; url: string }[] = []

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

    // Generate posters for all templates
    for (const templateName of allTemplates) {
      console.log(`[Poster] Generating ${templateName} poster...`)

      // Generate unique background for each template
      let backgroundUrl: string | null = null
      try {
        console.log(`[Poster] Generating unique background for ${templateName}...`)
        backgroundUrl = await generateBackground()
        if (backgroundUrl) {
          console.log(`[Poster] Background for ${templateName} generated successfully`)
        }
      } catch (imageError: any) {
        console.error(`[Poster] Failed to generate background for ${templateName}:`, imageError?.message)
        return NextResponse.json(
          {
            error: 'Failed to generate poster background. Please try again later.',
          },
          { status: 503 }
        )
      }

      if (!backgroundUrl && (mode === 'ai-background' || mode === 'artwork-photo')) {
        console.error(`[Poster] Background generation failed for ${templateName}`)
        return NextResponse.json(
          {
            error: 'Failed to generate poster background. Please try again later.',
          },
          { status: 503 }
        )
      }

      const posterHtml = generatePosterHTML(
        mode,
        templateName,
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
      const fileName = `poster_${exhibitionId || 'temp'}_${templateName}_${Date.now()}.png`
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
        posterUrls.push({ template: templateName, url: publicUrl })

        // Save poster to database
        if (exhibitionId) {
          const { error: dbError } = await supabase.from('posters').insert({
            exhibition_id: exhibitionId,
            image_url: publicUrl,
            template_name: templateName,
            is_primary: templateName === recommendedTemplate,
            created_at: new Date().toISOString(),
          })

          if (dbError) {
            console.error(`[Poster] Failed to save ${templateName} to database:`, dbError)
          }
        }
      } else {
        console.error(`[Poster] Upload error for ${templateName}:`, uploadError)
        const base64 = Buffer.from(imageBuffer).toString('base64')
        posterUrls.push({ template: templateName, url: `data:image/png;base64,${base64}` })
      }
    }

    await browser.close()
    browser = null

    console.log('[Poster] Success! Generated all 4 posters')
    return NextResponse.json({
      posters: posterUrls,
      message: `Generated ${posterUrls.length} posters successfully`,
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
