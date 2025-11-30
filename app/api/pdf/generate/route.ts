import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { exhibitionId } = await req.json()

    if (!exhibitionId) {
      return NextResponse.json(
        { error: 'Exhibition ID required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get exhibition data
    const { data: exhibition } = await supabase
      .from('exhibitions')
      .select('*')
      .eq('id', exhibitionId)
      .single()

    if (!exhibition) {
      return NextResponse.json(
        { error: 'Exhibition not found' },
        { status: 404 }
      )
    }

    // Fetch posters from posters table
    const { data: posters } = await supabase
      .from('posters')
      .select('image_url')
      .eq('exhibition_id', exhibitionId)
      .order('created_at', { ascending: false })

    // Fetch artworks from artworks table
    const { data: artworks } = await supabase
      .from('artworks')
      .select('title, description, image_url, order_index')
      .eq('exhibition_id', exhibitionId)
      .order('order_index', { ascending: true })

    // Get all content
    const { data: contents } = await supabase
      .from('exhibition_content')
      .select('*')
      .eq('exhibition_id', exhibitionId)

    // Organize content
    const contentMap = new Map()
    contents?.forEach((content) => {
      contentMap.set(content.content_type, content)
    })

    const getContentText = (type: string): string => {
      const content = contentMap.get(type)
      if (!content?.content) return ''

      let text = typeof content.content === 'string'
        ? content.content
        : content.content.text || ''

      // Remove JSON formatting if present
      if (text.trim().startsWith('{') || text.trim().startsWith('```json')) {
        try {
          // Remove markdown code block if present
          text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()

          // Try to parse as JSON
          const parsed = JSON.parse(text)

          // Extract the actual content from common JSON response formats
          if (type === 'artistBio' && parsed.artistBio) return parsed.artistBio
          if (type === 'introduction' && parsed.introduction) return parsed.introduction
          if (type === 'preface' && parsed.preface) return parsed.preface
          if (type === 'pressRelease' && parsed.pressRelease) return parsed.pressRelease
          if (type === 'marketingReport' && parsed.marketingReport) {
            // Format marketing report if it's an object
            if (typeof parsed.marketingReport === 'object') {
              const mr = parsed.marketingReport
              let formatted = ''
              if (mr.overview) formatted += mr.overview + '\n\n'
              if (mr.targetAudience) formatted += '주요 타깃:\n' + mr.targetAudience.join('\n') + '\n\n'
              if (mr.marketingPoints) formatted += '마케팅 포인트:\n' + mr.marketingPoints.join('\n') + '\n\n'
              if (mr.pricingStrategy) formatted += '가격 전략:\n' + mr.pricingStrategy + '\n\n'
              if (mr.promotionStrategy) formatted += '추천 홍보 전략:\n' + mr.promotionStrategy.join('\n')
              return formatted.trim()
            }
            return parsed.marketingReport
          }
        } catch (e) {
          // If parsing fails, return original text without JSON markers
          return text
        }
      }

      return text
    }

    // Generate HTML for PDF
    const htmlContent = generatePDFHTML({
      title: exhibition.title,
      keywords: exhibition.keywords || [],
      introduction: getContentText('introduction'),
      preface: getContentText('preface'),
      artistBio: getContentText('artistBio'),
      pressRelease: getContentText('pressRelease'),
      marketingReport: getContentText('marketingReport'),
      artworks: artworks || [],
      posters: posters || [],
    })

    // For MVP: Return HTML for client-side PDF generation
    // Future: Use Puppeteer or PDF library on server
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="${exhibition.title}.html"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}

interface Artwork {
  title: string
  description: string | null
  image_url: string
  order_index: number
}

interface Poster {
  image_url: string
}

function generatePDFHTML(data: {
  title: string | null
  keywords: string[]
  introduction: string
  preface: string
  artistBio: string
  pressRelease: string
  marketingReport: string
  artworks: Artwork[]
  posters: Poster[]
}): string {
  const {
    title,
    keywords,
    introduction,
    preface,
    artistBio,
    pressRelease,
    marketingReport,
    artworks,
    posters,
  } = data

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - 전시 자료집</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }

    body {
      font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.8;
      color: #1E293B;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      border-bottom: 3px solid #1E293B;
      padding-bottom: 1rem;
    }

    h2 {
      font-size: 1.8rem;
      font-weight: 600;
      margin-top: 3rem;
      margin-bottom: 1rem;
      color: #334155;
    }

    h3 {
      font-size: 1.3rem;
      font-weight: 600;
      margin-top: 2rem;
      margin-bottom: 0.5rem;
    }

    p {
      margin-bottom: 1rem;
      text-align: justify;
      white-space: pre-wrap;
    }

    .keywords {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 1.5rem 0;
    }

    .keyword {
      background: #F5F3F0;
      padding: 0.3rem 0.8rem;
      border-radius: 999px;
      font-size: 0.9rem;
      color: #64748B;
    }

    .section {
      margin-bottom: 3rem;
      page-break-inside: avoid;
    }

    .cover {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      page-break-after: always;
    }

    .poster {
      max-width: 100%;
      height: auto;
      margin: 2rem 0;
      page-break-inside: avoid;
    }

    .artwork-page {
      min-height: 90vh;
      display: flex;
      flex-direction: column;
      page-break-after: always;
    }

    .artwork-page:last-of-type {
      page-break-after: auto;
    }

    .artwork-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .artwork-content img {
      max-width: 100%;
      max-height: 60vh;
      object-fit: contain;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }

    .artwork-title {
      font-size: 1.3rem;
      font-weight: 600;
      margin: 0.5rem 0;
      text-align: center;
    }

    .artwork-desc {
      font-size: 1rem;
      color: #64748B;
      text-align: center;
      max-width: 600px;
      line-height: 1.6;
    }

    @media print {
      body {
        padding: 0;
      }

      .page-break {
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="cover">
    <h1>${title}</h1>
    ${keywords.length > 0 ? `
      <div class="keywords">
        ${keywords.map((k: string) => `<span class="keyword">${k}</span>`).join('')}
      </div>
    ` : ''}
    <p style="margin-top: 2rem; font-size: 1.2rem; color: #64748B;">
      전시 자료집
    </p>
  </div>

  ${posters.length > 0 ? `
    <div class="section page-break">
      <h2>전시 포스터</h2>
      ${posters.map((poster: Poster) => `
        <img src="${poster.image_url}" alt="전시 포스터" class="poster" />
      `).join('')}
    </div>
  ` : ''}

  ${introduction ? `
    <div class="section">
      <h2>전시 소개</h2>
      <p>${introduction}</p>
    </div>
  ` : ''}

  ${preface ? `
    <div class="section page-break">
      <h2>전시 서문</h2>
      <p>${preface}</p>
    </div>
  ` : ''}

  ${artistBio ? `
    <div class="section">
      <h2>작가 소개</h2>
      <p>${artistBio}</p>
    </div>
  ` : ''}

  ${artworks.length > 0 ? artworks.map((artwork: Artwork, idx: number) => `
    <div class="section artwork-page ${idx > 0 ? 'page-break' : ''}">
      <h2>작품</h2>
      <div class="artwork-content">
        <img src="${artwork.image_url}" alt="${artwork.title}" />
        ${!/^작품\s*\d+$/.test(artwork.title) ? `<h3 class="artwork-title">${artwork.title}</h3>` : ''}
        ${artwork.description ? `<p class="artwork-desc">${artwork.description}</p>` : ''}
      </div>
    </div>
  `).join('') : ''}

  ${pressRelease ? `
    <div class="section page-break">
      <h2>보도자료</h2>
      <p>${pressRelease}</p>
    </div>
  ` : ''}

  ${marketingReport ? `
    <div class="section page-break">
      <h2>마케팅 리포트</h2>
      <p>${marketingReport}</p>
    </div>
  ` : ''}

  <script>
    // Auto-print on load for PDF generation
    window.onload = function() {
      // Comment out for manual download
      // window.print();
    }
  </script>
</body>
</html>
  `.trim()
}
