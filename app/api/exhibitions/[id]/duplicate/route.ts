import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const exhibitionId = params.id

    // Fetch original exhibition
    const { data: originalExhibition, error: exhibitionError } = await supabase
      .from('exhibitions')
      .select('*')
      .eq('id', exhibitionId)
      .single()

    if (exhibitionError || !originalExhibition) {
      return NextResponse.json(
        { error: 'Exhibition not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (originalExhibition.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Create duplicate exhibition
    const { data: newExhibition, error: createError } = await supabase
      .from('exhibitions')
      .insert({
        user_id: user.id,
        title: `${originalExhibition.title} (복사본)`,
        keywords: originalExhibition.keywords,
        status: 'draft',
        is_public: false, // Duplicates start as private
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (createError) {
      console.error('Create exhibition error:', createError)
      return NextResponse.json(
        { error: 'Failed to duplicate exhibition' },
        { status: 500 }
      )
    }

    // Duplicate exhibition content
    const { data: originalContent } = await supabase
      .from('exhibition_content')
      .select('*')
      .eq('exhibition_id', exhibitionId)

    if (originalContent && originalContent.length > 0) {
      const contentToDuplicate = originalContent.map((content: any) => ({
        exhibition_id: newExhibition.id,
        content_type: content.content_type,
        content: content.content,
        created_at: new Date().toISOString(),
      }))

      await supabase.from('exhibition_content').insert(contentToDuplicate)
    }

    // Duplicate artworks
    const { data: originalArtworks } = await supabase
      .from('artworks')
      .select('*')
      .eq('exhibition_id', exhibitionId)

    if (originalArtworks && originalArtworks.length > 0) {
      const artworksToDuplicate = originalArtworks.map((artwork: any) => ({
        exhibition_id: newExhibition.id,
        title: artwork.title,
        description: artwork.description,
        image_url: artwork.image_url,
        order_index: artwork.order_index,
        created_at: new Date().toISOString(),
      }))

      await supabase.from('artworks').insert(artworksToDuplicate)
    }

    // Note: Posters are NOT duplicated as they have generation costs
    // Users can regenerate posters for the duplicated exhibition if needed

    return NextResponse.json({
      message: 'Exhibition duplicated successfully',
      exhibitionId: newExhibition.id,
      exhibition: newExhibition,
    })
  } catch (error) {
    console.error('Duplicate exhibition error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
