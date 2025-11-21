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

    // Update existing artworks with numbered titles (don't create duplicates)
    // Artworks are already created during image upload in ChatContainer
    const { data: existingArtworks, error: fetchError } = await supabase
      .from('artworks')
      .select('id')
      .eq('exhibition_id', exhibitionId)
      .order('order_index', { ascending: true })

    if (!fetchError && existingArtworks && existingArtworks.length > 0) {
      // Update existing artworks with numbered titles if they don't have custom titles
      for (let i = 0; i < existingArtworks.length; i++) {
        await supabase
          .from('artworks')
          .update({ title: `작품 ${i + 1}` })
          .eq('id', existingArtworks[i].id)
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
