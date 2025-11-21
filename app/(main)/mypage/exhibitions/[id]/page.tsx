import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ExhibitionManager from '@/components/exhibition/ExhibitionManager'

export default async function ExhibitionManagePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch exhibition
  const { data: exhibition, error: exhibitionError } = await supabase
    .from('exhibitions')
    .select('id, title, status, is_public, user_id')
    .eq('id', id)
    .single()

  if (exhibitionError || !exhibition) {
    notFound()
  }

  // Verify ownership
  if (exhibition.user_id !== user.id) {
    redirect('/mypage')
  }

  // Fetch artworks
  const { data: artworks } = await supabase
    .from('artworks')
    .select('id, title, image_url, order_index')
    .eq('exhibition_id', id)
    .order('order_index', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50">
      <ExhibitionManager
        exhibition={{
          id: exhibition.id,
          title: exhibition.title,
          status: exhibition.status,
          is_public: exhibition.is_public
        }}
        artworks={artworks || []}
      />
    </div>
  )
}
