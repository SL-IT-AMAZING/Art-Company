import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { exhibitionId, templateType, artworks } = await req.json()

    if (!exhibitionId) {
      return new Response(
        JSON.stringify({ error: 'Exhibition ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = await createClient()

    // Create virtual exhibition settings
    const { data: virtualExhibition, error: virtualError } = await supabase
      .from('virtual_exhibitions')
      .insert({
        exhibition_id: exhibitionId,
        template_type: templateType || '2.5d_fixed',
        settings: {},
      })
      .select()
      .single()

    if (virtualError) {
      console.error('Error creating virtual exhibition:', virtualError)
      return new Response(
        JSON.stringify({ error: 'Failed to create virtual exhibition' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create artwork records if provided
    if (artworks && Array.isArray(artworks)) {
      const artworkRecords = artworks.map((artwork: any, index: number) => ({
        exhibition_id: exhibitionId,
        title: artwork.title || `작품 ${index + 1}`,
        description: artwork.description || '',
        image_url: artwork.imageUrl,
        order_index: artwork.order !== undefined ? artwork.order : index,
      }))

      const { error: artworksError } = await supabase
        .from('artworks')
        .insert(artworkRecords)

      if (artworksError) {
        console.error('Error creating artworks:', artworksError)
      }
    }

    // Update exhibition status to complete and make it public
    await supabase
      .from('exhibitions')
      .update({
        status: 'complete',
        is_public: true
      })
      .eq('id', exhibitionId)

    return new Response(
      JSON.stringify({
        success: true,
        virtualExhibition,
        message: 'Virtual exhibition created successfully',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Virtual exhibition creation error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to create virtual exhibition' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
