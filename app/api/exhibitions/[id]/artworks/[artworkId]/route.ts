import { createClient } from '@/lib/supabase/server'
import { deleteImageFromStorage } from '@/lib/utils/storage'

/**
 * PATCH /api/exhibitions/[id]/artworks/[artworkId]
 * Update artwork title and description
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; artworkId: string }> }
) {
  try {
    const { id: exhibitionId, artworkId } = await params
    const { title, description } = await req.json()

    if (!title || typeof title !== 'string') {
      return new Response(
        JSON.stringify({ error: '유효한 제목을 입력해주세요' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (description !== undefined && description !== null && typeof description !== 'string') {
      return new Response(
        JSON.stringify({ error: '유효한 설명을 입력해주세요' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = await createClient()

    // Verify user owns the exhibition this artwork belongs to
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: '인증이 필요합니다' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verify artwork belongs to user's exhibition
    const { data: artwork } = await supabase
      .from('artworks')
      .select('exhibition_id, exhibitions!inner(user_id)')
      .eq('id', artworkId)
      .single()

    if (!artwork || (artwork.exhibitions as any).user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: '작품을 찾을 수 없거나 권한이 없습니다' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Update artwork title and description
    const updateData: { title: string; description?: string | null } = { title }
    if (description !== undefined) {
      updateData.description = description || null
    }

    const { data, error } = await supabase
      .from('artworks')
      .update(updateData)
      .eq('id', artworkId)
      .select()
      .single()

    if (error) {
      console.error('Error updating artwork:', error)
      return new Response(
        JSON.stringify({ error: '작품 제목 수정에 실패했습니다' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, artwork: data }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Artwork update error:', error)
    return new Response(
      JSON.stringify({ error: '작품 수정 중 오류가 발생했습니다' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

/**
 * DELETE /api/exhibitions/[id]/artworks/[artworkId]
 * Delete artwork from exhibition
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; artworkId: string }> }
) {
  try {
    const { artworkId } = await params
    const supabase = await createClient()

    // Verify user owns the exhibition this artwork belongs to
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: '인증이 필요합니다' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Fetch artwork with ownership verification
    const { data: artwork } = await supabase
      .from('artworks')
      .select('id, image_url, exhibitions!inner(user_id)')
      .eq('id', artworkId)
      .single()

    if (!artwork || (artwork.exhibitions as any).user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: '작품을 찾을 수 없거나 권한이 없습니다' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Delete artwork record
    const { error: deleteError } = await supabase
      .from('artworks')
      .delete()
      .eq('id', artworkId)

    if (deleteError) {
      console.error('Error deleting artwork:', deleteError)
      return new Response(
        JSON.stringify({ error: '작품 삭제에 실패했습니다' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Delete image from storage
    const deleted = await deleteImageFromStorage(artwork.image_url)
    if (!deleted) {
      console.warn('Failed to delete image from storage:', artwork.image_url)
    }

    return new Response(
      JSON.stringify({ success: true, message: '작품이 삭제되었습니다' }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Artwork deletion error:', error)
    return new Response(
      JSON.stringify({ error: '작품 삭제 중 오류가 발생했습니다' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
