import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium-min'
import { postProcessLLMOutput, replaceTBDPlaceholders } from '@/lib/utils/textPostProcessor'

// Remote chromium URL for Vercel serverless (official Sparticuz release)
const CHROMIUM_URL = 'https://github.com/Sparticuz/chromium/releases/download/v131.0.0/chromium-v131.0.0-pack.tar'

export async function POST(req: NextRequest) {
  let browser = null
  try {
    let requestBody
    try {
      requestBody = await req.json()
    } catch (parseError) {
      console.error('[PDF] Failed to parse request body:', parseError)
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { exhibitionId } = requestBody

    if (!exhibitionId) {
      console.error('[PDF] Missing exhibition ID')
      return NextResponse.json(
        { error: 'Exhibition ID is required' },
        { status: 400 }
      )
    }

    console.log('[PDF] Starting PDF generation for exhibition:', exhibitionId)
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch exhibition data
    const { data: exhibition, error: exhibitionError } = await supabase
      .from('exhibitions')
      .select('*')
      .eq('id', exhibitionId)
      .single()

    if (exhibitionError || !exhibition) {
      return NextResponse.json(
        { error: 'Exhibition not found' },
        { status: 404 }
      )
    }

    // Fetch exhibition content
    const { data: content } = await supabase
      .from('exhibition_content')
      .select('*')
      .eq('exhibition_id', exhibitionId)

    console.log('[PDF] exhibition_content types found:', content?.map(c => c.content_type))

    // Fetch artworks
    const { data: artworks } = await supabase
      .from('artworks')
      .select('*')
      .eq('exhibition_id', exhibitionId)
      .order('order_index', { ascending: true })

    // Fetch posters - get the latest poster (not filtering by is_primary to ensure we always get one)
    const { data: posters } = await supabase
      .from('posters')
      .select('*')
      .eq('exhibition_id', exhibitionId)
      .order('created_at', { ascending: false })
      .limit(1)

    // Content mapping helper with post-processing for gender-neutral language
    const getContent = (type: string) => {
      // Check for both snake_case and camelCase versions (database has inconsistent naming)
      const snakeCase = type
      const camelCase = type.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())

      const item = content?.find((c: any) =>
        c.content_type === snakeCase || c.content_type === camelCase
      )
      if (!item?.content) return ''

      // Handle marketing report object format (saved directly as object, not wrapped in {text: ...})
      if (type === 'marketing_report' && typeof item.content === 'object' && !item.content.text) {
        const mr = item.content
        let formatted = ''
        if (mr.overview) formatted += mr.overview + '<br><br>'
        if (mr.targetAudience?.length) formatted += '<strong>주요 타깃:</strong><br>' + mr.targetAudience.join('<br>') + '<br><br>'
        if (mr.marketingPoints?.length) formatted += '<strong>마케팅 포인트:</strong><br>' + mr.marketingPoints.join('<br>') + '<br><br>'
        if (mr.pricingStrategy) formatted += '<strong>가격 전략:</strong><br>' + mr.pricingStrategy + '<br><br>'
        if (mr.promotionStrategy?.length) formatted += '<strong>추천 홍보 전략:</strong><br>' + mr.promotionStrategy.join('<br>')

        let result = formatted.trim()
        result = postProcessLLMOutput(result)
        result = replaceTBDPlaceholders(result, {
          exhibition_date: exhibition.exhibition_date,
          exhibition_end_date: exhibition.exhibition_end_date,
          venue: exhibition.venue,
          location: exhibition.location,
          admission_fee: exhibition.admission_fee,
        })
        return result
      }

      let text = typeof item.content === 'string' ? item.content : item.content.text || ''
      let result = text

      // Remove JSON formatting if present
      if (text.trim().startsWith('{') || text.trim().startsWith('```json')) {
        try {
          // Remove markdown code block if present
          text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()

          // Try to parse as JSON
          const parsed = JSON.parse(text)

          // Extract the actual content from common JSON response formats
          if (parsed.artistBio) result = parsed.artistBio
          else if (parsed.introduction) result = parsed.introduction
          else if (parsed.preface) result = parsed.preface
          else if (parsed.pressRelease) result = parsed.pressRelease
          else if (parsed.marketingReport) {
            // Format marketing report if it's an object
            if (typeof parsed.marketingReport === 'object') {
              const mr = parsed.marketingReport
              let formatted = ''
              if (mr.overview) formatted += mr.overview + '<br><br>'
              if (mr.targetAudience) formatted += '<strong>주요 타깃:</strong><br>' + mr.targetAudience.join('<br>') + '<br><br>'
              if (mr.marketingPoints) formatted += '<strong>마케팅 포인트:</strong><br>' + mr.marketingPoints.join('<br>') + '<br><br>'
              if (mr.pricingStrategy) formatted += '<strong>가격 전략:</strong><br>' + mr.pricingStrategy + '<br><br>'
              if (mr.promotionStrategy) formatted += '<strong>추천 홍보 전략:</strong><br>' + mr.promotionStrategy.join('<br>')
              result = formatted.trim()
            } else {
              result = parsed.marketingReport
            }
          }
        } catch (e) {
          // If parsing fails, use original text
          result = text
        }
      }

      // Apply post-processing: removes gendered language, cleans JSON artifacts, markdown, typos
      result = postProcessLLMOutput(result)

      // Replace [TBD] placeholders with actual exhibition data
      result = replaceTBDPlaceholders(result, {
        exhibition_date: exhibition.exhibition_date,
        exhibition_end_date: exhibition.exhibition_end_date,
        venue: exhibition.venue,
        location: exhibition.location,
        admission_fee: exhibition.admission_fee,
      })

      // Convert newlines to <br> tags for HTML rendering
      result = result.replace(/\n/g, '<br>')

      return result
    }

    // Create HTML with Korean font support
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

          * { margin: 0; padding: 0; box-sizing: border-box; }

          body {
            font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.8;
            color: #1E293B;
            background: #fff;
          }

          .page {
            padding: 60px 80px;
            page-break-after: always;
            min-height: 100vh;
          }

          .cover {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            background: linear-gradient(135deg, #F5F3F0 0%, #E8E0D5 100%);
          }

          h1 {
            font-size: 48px;
            font-weight: 700;
            margin-bottom: 30px;
            color: #1E293B;
            letter-spacing: -0.02em;
          }

          .keywords {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            justify-content: center;
            margin: 30px 0;
          }

          .keyword {
            background: #fff;
            padding: 8px 20px;
            border-radius: 24px;
            font-size: 14px;
            color: #64748B;
            border: 1px solid #D4C5B9;
          }

          h2 {
            font-size: 32px;
            font-weight: 600;
            margin-bottom: 24px;
            color: #1E293B;
            border-bottom: 2px solid #D4C5B9;
            padding-bottom: 12px;
          }

          h3 {
            font-size: 20px;
            font-weight: 600;
            margin: 24px 0 12px;
            color: #334155;
          }

          p {
            font-size: 16px;
            line-height: 1.9;
            margin-bottom: 20px;
            color: #475569;
            text-align: justify;
            word-break: keep-all;
            white-space: pre-wrap;
          }

          .artworks-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 24px;
            justify-content: flex-start;
          }

          .artwork-item {
            width: calc(50% - 12px);
            text-align: center;
            page-break-inside: avoid;
            margin-bottom: 20px;
          }

          .artwork-item img {
            max-width: 100%;
            max-height: 200px;
            width: auto;
            height: auto;
            object-fit: contain;
            border-radius: 4px;
            margin-bottom: 12px;
          }

          .artwork-title {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 4px;
            color: #1E293B;
          }

          .artwork-desc {
            font-size: 12px;
            color: #64748B;
            line-height: 1.5;
          }

          .planning-section {
            background: #F8F9FA;
            padding: 32px;
            border-radius: 8px;
            margin-top: 24px;
          }

          .planning-section p {
            margin: 12px 0;
            font-size: 16px;
          }

          .planning-section strong {
            color: #1E293B;
          }

          .poster-page {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 70vh;
          }

          .poster-page img {
            max-width: 80%;
            max-height: 65vh;
            width: auto;
            height: auto;
            object-fit: contain;
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          }

          .footer {
            margin-top: 60px;
            padding-top: 24px;
            border-top: 1px solid #E2E8F0;
            text-align: center;
            font-size: 14px;
            color: #94A3B8;
          }
        </style>
      </head>
      <body>
        <!-- Cover Page -->
        <div class="page cover">
          <h1>${exhibition.title || '제목 없음'}</h1>
          ${
            exhibition.keywords && exhibition.keywords.length > 0
              ? `<div class="keywords">${exhibition.keywords.map((k: string) => `<span class="keyword">${k}</span>`).join('')}</div>`
              : ''
          }
          <div class="footer">
            <p>Generated by Art Wizard</p>
            <p>${new Date().toLocaleDateString('ko-KR')}</p>
          </div>
        </div>

        <!-- Main Poster (moved here - after cover) -->
        ${
          posters && posters.length > 0 && posters[0].image_url
            ? `
        <div class="page">
          <h2>전시 포스터</h2>
          <div class="poster-page">
            <img src="${posters[0].image_url}" alt="Exhibition Poster">
          </div>
        </div>
        `
            : ''
        }

        <!-- Introduction -->
        ${
          getContent('introduction')
            ? `
        <div class="page">
          <h2>전시 소개</h2>
          <p>${getContent('introduction')}</p>
        </div>
        `
            : ''
        }

        <!-- Preface -->
        ${
          getContent('preface')
            ? `
        <div class="page">
          <h2>전시 서문</h2>
          <p>${getContent('preface')}</p>
        </div>
        `
            : ''
        }

        <!-- Artist Bio -->
        ${
          getContent('artist_bio')
            ? `
        <div class="page">
          <h2>작가 소개</h2>
          <p>${getContent('artist_bio')}</p>
        </div>
        `
            : ''
        }

        <!-- Exhibition Planning -->
        <div class="page">
          <h2>전시 기획</h2>
          <div class="planning-section">
            ${exhibition.keywords && exhibition.keywords.length > 0 ? `<p><strong>전시 키워드:</strong> ${exhibition.keywords.join(', ')}</p>` : ''}
            ${exhibition.exhibition_date ? `<p><strong>전시 기간:</strong> ${exhibition.exhibition_date}${exhibition.exhibition_end_date ? ` ~ ${exhibition.exhibition_end_date}` : ''}</p>` : ''}
            ${exhibition.venue ? `<p><strong>전시 장소:</strong> ${exhibition.venue}</p>` : ''}
            ${exhibition.location ? `<p><strong>주소:</strong> ${exhibition.location}</p>` : ''}
            ${exhibition.opening_hours ? `<p><strong>운영 시간:</strong> ${exhibition.opening_hours}</p>` : ''}
            ${exhibition.admission_fee ? `<p><strong>입장료:</strong> ${exhibition.admission_fee}</p>` : ''}
            ${exhibition.contact_info ? `<p><strong>문의:</strong> ${exhibition.contact_info}</p>` : ''}

            ${exhibition.curator_conversation && exhibition.curator_conversation.length > 0 ? `
            <div style="margin-top: 30px;">
              <h3 style="font-size: 18px; margin-bottom: 15px; color: #1E293B;">AI 큐레이터와의 대화</h3>
              <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; border-left: 4px solid #3B82F6;">
                ${exhibition.curator_conversation
                  .filter((msg: any) => msg.role !== 'system')
                  .map((msg: any) => `
                    <div style="margin-bottom: 15px;">
                      <strong style="color: ${msg.role === 'user' ? '#059669' : '#3B82F6'};">
                        ${msg.role === 'user' ? '사용자' : 'AI 큐레이터'}:
                      </strong>
                      <p style="margin: 5px 0 0 0; color: #475569; line-height: 1.6;">
                        ${msg.content}
                      </p>
                    </div>
                  `).join('')}
              </div>
            </div>
            ` : ''}
          </div>
        </div>

        <!-- Artworks -->
        ${
          artworks && artworks.length > 0
            ? `
        <div class="page">
          <h2>작품</h2>
          <div class="artworks-grid">
            ${artworks.map((artwork: any) => {
              const isDefaultTitle = /^작품\s*\d+$/.test(artwork.title || '')
              const displayTitle = isDefaultTitle ? '' : (artwork.title || '')
              return `
              <div class="artwork-item">
                ${artwork.image_url ? `<img src="${artwork.image_url}" alt="${displayTitle}">` : ''}
                ${displayTitle ? `<div class="artwork-title">${displayTitle}</div>` : ''}
                ${artwork.description ? `<div class="artwork-desc">${artwork.description}</div>` : ''}
              </div>
              `
            }).join('')}
          </div>
        </div>
        `
            : ''
        }

        <!-- Press Release -->
        ${
          getContent('press_release')
            ? `
        <div class="page">
          <h2>보도자료</h2>
          <p>${getContent('press_release')}</p>
        </div>
        `
            : ''
        }

        <!-- Marketing Report -->
        ${
          getContent('marketing_report')
            ? `
        <div class="page">
          <h2>마케팅 리포트</h2>
          <p>${getContent('marketing_report')}</p>
        </div>
        `
            : ''
        }
      </body>
      </html>
    `

    // Launch Puppeteer - detect environment
    console.log('[PDF] Launching browser...')
    const isDev = process.env.NODE_ENV === 'development'

    try {
      if (isDev) {
        // Local development - use regular puppeteer
        const puppeteerFull = await import('puppeteer')
        browser = await puppeteerFull.default.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        })
      } else {
        // Production (Vercel) - use puppeteer-core with remote chromium
        console.log('[PDF] Fetching Chromium executable...')
        const executablePath = await chromium.executablePath(CHROMIUM_URL)
        console.log('[PDF] Chromium path:', executablePath)
        browser = await puppeteer.launch({
          args: chromium.args,
          defaultViewport: {
            width: 1920,
            height: 1080,
          },
          executablePath,
          headless: true,
        })
      }
    } catch (browserError: any) {
      console.error('[PDF] Failed to launch browser:', browserError)
      return NextResponse.json(
        { error: 'PDF 생성 서비스를 시작할 수 없습니다. 잠시 후 다시 시도해주세요.' },
        { status: 503 }
      )
    }

    console.log('[PDF] Rendering HTML content...')
    const page = await browser.newPage()
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 30000, // 30 second timeout for content loading
    })

    console.log('[PDF] Generating PDF...')
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      },
    })

    console.log('[PDF] PDF generated successfully')
    await browser.close()


    // Ensure the filename we send in headers stays ASCII while still providing original title
    const baseTitle = exhibition.title || 'document'
    const titleForFilename = `exhibition_${baseTitle}`
    const asciiFallback = titleForFilename
      .normalize('NFKD')
      .replace(/[^\u0000-\u007f]/g, '')
      .replace(/[^A-Za-z0-9._-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
    const safeFilename = (asciiFallback || 'exhibition_document') + '.pdf'
    const encodedFilename = encodeURIComponent(`${titleForFilename}.pdf`)

    // Return PDF
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`,
      },
    })
  } catch (error: any) {
    console.error('[PDF] Generate PDF error:', error)
    console.error('[PDF] Error stack:', error?.stack)

    if (browser) {
      try {
        await browser.close()
      } catch (closeError) {
        console.error('[PDF] Error closing browser:', closeError)
      }
    }

    // Provide more specific error messages
    let errorMessage = 'PDF 생성 중 오류가 발생했습니다.'
    if (error?.message?.includes('timeout')) {
      errorMessage = 'PDF 생성 시간이 초과되었습니다. 이미지가 너무 많거나 크기가 클 수 있습니다.'
    } else if (error?.message?.includes('memory')) {
      errorMessage = '메모리 부족으로 PDF 생성에 실패했습니다.'
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

