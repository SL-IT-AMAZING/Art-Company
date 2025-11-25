import { createClient } from '@/lib/supabase/server'
import { deleteImagesFromStorage } from '@/lib/utils/storage'

/**
 * PATCH /api/exhibitions/[id]
 * Update exhibition title, status, and/or is_public
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { title, status, is_public } = body

    console.log('PATCH /api/exhibitions/[id] - Request:', { id, title, status, is_public })

    // At least one field must be provided
    if (title === undefined && status === undefined && is_public === undefined) {
      return new Response(
        JSON.stringify({ error: '수정할 내용을 입력해주세요' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validate title if provided
    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      return new Response(
        JSON.stringify({ error: '유효한 제목을 입력해주세요' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validate status if provided
    if (status !== undefined && !['draft', 'generating', 'complete'].includes(status)) {
      return new Response(
        JSON.stringify({ error: '유효하지 않은 상태입니다' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = await createClient()

    // Verify user owns this exhibition
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('Auth result:', { userId: user?.id, authError })

    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: '인증이 필요합니다', details: authError?.message }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Build update object with only provided fields
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    }
    if (title !== undefined) updateData.title = title
    if (status !== undefined) updateData.status = status
    if (is_public !== undefined) updateData.is_public = is_public

    console.log('Update data:', updateData)

    // Update exhibition
    const { data, error } = await supabase
      .from('exhibitions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns this exhibition
      .select()
      .single()

    console.log('Update result:', { data, error })

    if (error) {
      console.error('Error updating exhibition:', error)
      return new Response(
        JSON.stringify({ error: '전시 수정에 실패했습니다', details: error.message }),
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
      JSON.stringify({
        error: '전시 수정 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : String(error)
      }),
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
