import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium-min'
import { generateSimplePosterHTML } from '@/lib/poster-templates/simple-poster'

// Remote chromium URL for Vercel serverless (official Sparticuz release)
const CHROMIUM_URL = 'https://github.com/Sparticuz/chromium/releases/download/v131.0.0/chromium-v131.0.0-pack.tar'

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
      artistName,
      exhibitionDate,
      exhibitionEndDate,
      venue,
      referenceImage = null as string | null,
      locale = 'ko',
    } = requestBody

    // Validate required fields
    if (!exhibitionId) {
      console.error('[Poster] Missing exhibition ID')
      return NextResponse.json({ error: 'Exhibition ID is required' }, { status: 400 })
    }

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (!referenceImage) {
      return NextResponse.json({ error: 'Reference image is required' }, { status: 400 })
    }

    console.log(`[Poster] Generating simple poster with original image, exhibitionId: ${exhibitionId}`)

    // 이미지 비율 체크 및 여백 계산 (A2 규격: 4961 x 7016px)
    const POSTER_WIDTH = 4961
    const POSTER_HEIGHT = 7016
    let isVertical = true
    let imageWidth = 0
    let imageHeight = 0

    try {
      const imageResponse = await fetch(referenceImage)
      const arrayBuffer = await imageResponse.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // PNG/JPEG/WebP 헤더에서 이미지 크기 읽기
      if (buffer[0] === 0x89 && buffer[1] === 0x50) {
        // PNG
        imageWidth = buffer.readUInt32BE(16)
        imageHeight = buffer.readUInt32BE(20)
        isVertical = imageWidth <= imageHeight
        console.log(`[Poster] PNG image: ${imageWidth}x${imageHeight}, isVertical: ${isVertical}`)
      } else if (buffer[0] === 0xff && buffer[1] === 0xd8) {
        // JPEG - SOF0 마커 찾기
        let offset = 2
        while (offset < buffer.length) {
          if (buffer[offset] === 0xff) {
            const marker = buffer[offset + 1]
            if (marker === 0xc0 || marker === 0xc2) {
              imageHeight = buffer.readUInt16BE(offset + 5)
              imageWidth = buffer.readUInt16BE(offset + 7)
              isVertical = imageWidth <= imageHeight
              console.log(`[Poster] JPEG image: ${imageWidth}x${imageHeight}, isVertical: ${isVertical}`)
              break
            }
            const segmentLength = buffer.readUInt16BE(offset + 2)
            offset += 2 + segmentLength
          } else {
            offset++
          }
        }
      } else if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
        // WebP - RIFF header
        // WebP format: RIFF....WEBPVP8 or VP8L or VP8X
        const webpMarker = buffer.toString('ascii', 8, 12)
        if (webpMarker === 'WEBP') {
          const chunkType = buffer.toString('ascii', 12, 16)
          if (chunkType === 'VP8 ') {
            // Lossy WebP
            // Width and height at offset 26-27 and 28-29 (little endian, 14 bits each)
            const bits = buffer.readUInt32LE(26)
            imageWidth = bits & 0x3fff
            imageHeight = (bits >> 16) & 0x3fff
          } else if (chunkType === 'VP8L') {
            // Lossless WebP
            // Signature byte at 21, then width-1 (14 bits) and height-1 (14 bits)
            const bits = buffer.readUInt32LE(21)
            imageWidth = (bits & 0x3fff) + 1
            imageHeight = ((bits >> 14) & 0x3fff) + 1
          } else if (chunkType === 'VP8X') {
            // Extended WebP
            // Canvas width at 24-26 (24 bits, little endian) + 1
            // Canvas height at 27-29 (24 bits, little endian) + 1
            imageWidth = (buffer[24] | (buffer[25] << 8) | (buffer[26] << 16)) + 1
            imageHeight = (buffer[27] | (buffer[28] << 8) | (buffer[29] << 16)) + 1
          }
          isVertical = imageWidth <= imageHeight
          console.log(`[Poster] WebP image (${chunkType}): ${imageWidth}x${imageHeight}, isVertical: ${isVertical}`)
        }
      }
    } catch (err) {
      console.error('[Poster] Failed to check image dimensions, defaulting to vertical:', err)
    }

    // 이미지가 포스터에 맞춰졌을 때 실제 크기 계산
    const MIN_MARGIN = 600 // 최소 여백 높이
    let headerHeight = MIN_MARGIN
    let footerHeight = MIN_MARGIN

    if (imageWidth > 0 && imageHeight > 0) {
      const availableWidth = isVertical ? POSTER_WIDTH - 2320 : POSTER_WIDTH // 세로면 좌우 1160px 패딩
      const availableHeight = POSTER_HEIGHT - (MIN_MARGIN * 2) // 최소 여백 확보
      const imageAspectRatio = imageWidth / imageHeight

      // 이미지가 포스터에 contain되었을 때 실제 렌더링 크기
      let renderedWidth = availableWidth
      let renderedHeight = availableWidth / imageAspectRatio

      if (renderedHeight > availableHeight) {
        renderedHeight = availableHeight
        renderedWidth = availableHeight * imageAspectRatio
      }

      // 위아래 여백 계산 (균등 분배, 최소값 보장)
      const totalVerticalMargin = POSTER_HEIGHT - renderedHeight
      headerHeight = Math.max(MIN_MARGIN, Math.floor(totalVerticalMargin / 2))
      footerHeight = Math.max(MIN_MARGIN, Math.floor(totalVerticalMargin / 2))

      console.log(`[Poster] Rendered size: ${renderedWidth}x${renderedHeight}, margins: ${headerHeight}px top/bottom`)
    }

    // Generate poster HTML
    const posterHtml = generateSimplePosterHTML({
      title,
      exhibitionDate,
      exhibitionEndDate,
      venue,
      imageUrl: referenceImage,
      isVertical,
      headerHeight,
      footerHeight,
      locale,
    })

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
          width: 4961,
          height: 7016,
        },
        executablePath,
        headless: true,
      })
    }

    const page = await browser.newPage()
    await page.setViewport({ width: 4961, height: 7016 })

    await page.setContent(posterHtml, {
      waitUntil: 'networkidle0',
    })

    const imageBuffer = await page.screenshot({
      type: 'png',
      fullPage: true,
    })

    await page.close()

    // Upload to Supabase Storage
    const fileName = `poster_${exhibitionId}_simple_${Date.now()}.png`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('posters')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false,
      })

    let posterUrl: string
    let savedToDb = false
    let dbErrorMsg = ''
    let uploadErrorMsg = ''

    if (!uploadError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from('posters').getPublicUrl(uploadData.path)
      posterUrl = publicUrl

      // Save poster to database
      const { error: dbError } = await supabase.from('posters').insert({
        exhibition_id: exhibitionId,
        image_url: publicUrl,
        is_primary: true,
        created_at: new Date().toISOString(),
      })

      if (dbError) {
        console.error('[Poster] Failed to save to database:', dbError)
        dbErrorMsg = dbError.message
      } else {
        console.log(`[Poster] Successfully saved poster to database for exhibition: ${exhibitionId}`)
        savedToDb = true
      }
    } else {
      console.error('[Poster] Upload error:', uploadError)
      uploadErrorMsg = uploadError.message
      const base64 = Buffer.from(imageBuffer).toString('base64')
      posterUrl = `data:image/png;base64,${base64}`
    }

    await browser.close()
    browser = null

    console.log('[Poster] Success! Generated simple poster')
    return NextResponse.json({
      posters: [{ template: 'simple', url: posterUrl }],
      message: 'Generated simple poster successfully',
      savedToDb,
      dbError: dbErrorMsg,
      uploadError: uploadErrorMsg,
      exhibitionId,
    })
  } catch (error: unknown) {
    console.error('[Poster] Generate poster error:', error)

    if (browser) {
      await browser.close()
    }

    return NextResponse.json(
      { error: 'Failed to generate poster' },
      { status: 500 }
    )
  }
}
