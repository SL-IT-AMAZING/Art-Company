import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { exhibitionId } = await req.json()

    if (!exhibitionId) {
      return new Response(
        JSON.stringify({ error: 'Exhibition ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = await createClient()

    // Fetch exhibition data
    const { data: exhibition, error: exhibitionError } = await supabase
      .from('exhibitions')
      .select('*')
      .eq('id', exhibitionId)
      .single()

    if (exhibitionError || !exhibition) {
      return new Response(
        JSON.stringify({ error: 'Exhibition not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Fetch exhibition content
    const { data: content } = await supabase
      .from('exhibition_content')
      .select('*')
      .eq('exhibition_id', exhibitionId)

    // For MVP, we'll create a simple HTML-based PDF
    // In production, use pdfkit with Korean fonts
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { font-size: 32px; margin-bottom: 20px; }
          h2 { font-size: 24px; margin-top: 30px; margin-bottom: 15px; }
          p { line-height: 1.8; margin-bottom: 15px; }
          .keywords { display: flex; gap: 10px; flex-wrap: wrap; }
          .keyword { background: #f0f0f0; padding: 5px 15px; border-radius: 20px; }
        </style>
      </head>
      <body>
        <h1>${exhibition.title || '제목 없음'}</h1>
        <div class="keywords">
          ${(exhibition.keywords || []).map((k: string) => `<span class="keyword">${k}</span>`).join('')}
        </div>

        ${content
          ?.map(
            (item: any) => `
          <h2>${item.content_type}</h2>
          <p>${typeof item.content === 'string' ? item.content : JSON.stringify(item.content)}</p>
        `
          )
          .join('') || ''}
      </body>
      </html>
    `

    // Return HTML for now (client can convert to PDF or print)
    return new Response(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="exhibition_${exhibitionId}.html"`,
      },
    })
  } catch (error) {
    console.error('Generate PDF error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate PDF' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
