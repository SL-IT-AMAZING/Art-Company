import { createClient } from '@/lib/supabase/server'
import { deleteImagesFromStorage } from '@/lib/utils/storage'

/**
 * PATCH /api/exhibitions/[id]
 * Update exhibition title
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { title } = await req.json()

    if (!title || typeof title !== 'string') {
      return new Response(
        JSON.stringify({ error: '유효한 제목을 입력해주세요' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = await createClient()

    // Verify user owns this exhibition
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: '인증이 필요합니다' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Update exhibition title
    const { data, error } = await supabase
      .from('exhibitions')
      .update({
        title,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns this exhibition
      .select()
      .single()

    if (error) {
      console.error('Error updating exhibition:', error)
      return new Response(
        JSON.stringify({ error: '전시 제목 수정에 실패했습니다' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, exhibition: data }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Exhibition update error:', error)
    return new Response(
      JSON.stringify({ error: '전시 수정 중 오류가 발생했습니다' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

/**
 * DELETE /api/exhibitions/[id]
 * Delete exhibition and all its artworks
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Verify user owns this exhibition
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: '인증이 필요합니다' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Fetch all artwork images to delete from storage
    const { data: artworks } = await supabase
      .from('artworks')
      .select('image_url')
      .eq('exhibition_id', id)

    // Delete exhibition (CASCADE will delete artwork records)
    const { error: deleteError } = await supabase
      .from('exhibitions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns this exhibition

    if (deleteError) {
      console.error('Error deleting exhibition:', deleteError)
      return new Response(
        JSON.stringify({ error: '전시 삭제에 실패했습니다' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Delete artwork images from storage
    if (artworks && artworks.length > 0) {
      const imageUrls = artworks.map(a => a.image_url)
      const { deletedCount, failedUrls } = await deleteImagesFromStorage(imageUrls)

      if (failedUrls.length > 0) {
        console.warn('Some images failed to delete from storage:', failedUrls)
      }

      console.log(`Deleted ${deletedCount} images from storage`)
    }

    return new Response(
      JSON.stringify({ success: true, message: '전시가 삭제되었습니다' }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Exhibition deletion error:', error)
    return new Response(
      JSON.stringify({ error: '전시 삭제 중 오류가 발생했습니다' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
