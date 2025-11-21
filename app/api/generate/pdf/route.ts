import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export async function POST(req: NextRequest) {
  let browser = null
  try {
    const { exhibitionId } = await req.json()

    if (!exhibitionId) {
      return NextResponse.json(
        { error: 'Exhibition ID is required' },
        { status: 400 }
      )
    }

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

    // Fetch artworks
    const { data: artworks } = await supabase
      .from('artworks')
      .select('*')
      .eq('exhibition_id', exhibitionId)
      .order('order_index', { ascending: true })

    // Fetch posters
    const { data: posters } = await supabase
      .from('posters')
      .select('*')
      .eq('exhibition_id', exhibitionId)
      .eq('is_primary', true)
      .limit(1)

    // Content mapping helper
    const getContent = (type: string) => {
      const item = content?.find((c: any) => c.content_type === type)
      return item?.content || ''
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
          }

          .artwork {
            margin: 40px 0;
            padding: 24px;
            background: #F8F9FA;
            border-radius: 8px;
            page-break-inside: avoid;
          }

          .artwork img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            margin-bottom: 16px;
          }

          .artwork-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #1E293B;
          }

          .artwork-desc {
            font-size: 15px;
            color: #64748B;
          }

          .poster-page {
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .poster-page img {
            max-width: 100%;
            max-height: 90vh;
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

        <!-- Artworks -->
        ${
          artworks && artworks.length > 0
            ? `
        <div class="page">
          <h2>작품</h2>
          ${artworks
            .map(
              (artwork: any) => `
            <div class="artwork">
              ${artwork.image_url ? `<img src="${artwork.image_url}" alt="${artwork.title || ''}">` : ''}
              <div class="artwork-title">${artwork.title || '무제'}</div>
              <div class="artwork-desc">${artwork.description || ''}</div>
            </div>
          `
            )
            .join('')}
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
          <h2>컬렉팅 포인트</h2>
          <p>${getContent('marketing_report')}</p>
        </div>
        `
            : ''
        }

        <!-- Poster -->
        ${
          posters && posters.length > 0 && posters[0].image_url
            ? `
        <div class="page poster-page">
          <img src="${posters[0].image_url}" alt="Exhibition Poster">
        </div>
        `
            : ''
        }
      </body>
      </html>
    `

    // Launch Puppeteer and generate PDF
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const page = await browser.newPage()
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    })

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
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`,
      },
    })
  } catch (error) {
    console.error('Generate PDF error:', error)

    if (browser) {
      await browser.close()
    }

    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}

