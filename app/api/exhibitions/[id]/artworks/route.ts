import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/exhibitions/[id]/artworks
 * Add new artwork to exhibition
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: exhibitionId } = await params
    const formData = await req.formData()

    const file = formData.get('file') as File
    const title = formData.get('title') as string

    if (!file) {
      return new Response(
        JSON.stringify({ error: '이미지 파일이 필요합니다' }),
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

    // Verify exhibition exists and belongs to user
    const { data: exhibition } = await supabase
      .from('exhibitions')
      .select('id')
      .eq('id', exhibitionId)
      .eq('user_id', user.id)
      .single()

    if (!exhibition) {
      return new Response(
        JSON.stringify({ error: '전시를 찾을 수 없거나 권한이 없습니다' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Upload image to Supabase Storage
    // Use safe filename (avoid Korean/special characters)
    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('artworks')
      .upload(fileName, file)

    if (uploadError || !uploadData) {
      console.error('Storage upload error:', uploadError)
      return new Response(
        JSON.stringify({
          error: '이미지 업로드에 실패했습니다',
          details: uploadError?.message || 'Unknown storage error',
          hint: 'Supabase Storage에 "artworks" bucket이 생성되어 있는지 확인하세요'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('artworks')
      .getPublicUrl(uploadData.path)

    // Get current max order_index
    const { data: artworks } = await supabase
      .from('artworks')
      .select('order_index')
      .eq('exhibition_id', exhibitionId)
      .order('order_index', { ascending: false })
      .limit(1)

    const nextOrderIndex = artworks && artworks.length > 0
      ? (artworks[0].order_index || 0) + 1
      : 0

    // Insert artwork record
    const { data: artwork, error: insertError } = await supabase
      .from('artworks')
      .insert({
        exhibition_id: exhibitionId,
        image_url: publicUrl,
        title: title || `작품 ${nextOrderIndex + 1}`,
        order_index: nextOrderIndex
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting artwork:', insertError)
      // Cleanup uploaded image
      await supabase.storage.from('artworks').remove([fileName])

      return new Response(
        JSON.stringify({ error: '작품 저장에 실패했습니다' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, artwork }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Artwork creation error:', error)
    return new Response(
      JSON.stringify({ error: '작품 추가 중 오류가 발생했습니다' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
