import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ExhibitionViewer from '@/components/exhibition/ExhibitionViewer'
import { ViewPoint, Artwork } from '@/types/exhibition'

export default async function ExhibitionViewerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch exhibition data
  const { data: exhibition, error } = await supabase
    .from('exhibitions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !exhibition) {
    notFound()
  }

  // Check if exhibition is public or belongs to current user
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user && user.id === exhibition.user_id

  if (!exhibition.is_public && !isOwner) {
    notFound()
  }

  // Increment view count
  if (!isOwner) {
    await supabase
      .from('exhibitions')
      .update({ view_count: (exhibition.view_count || 0) + 1 })
      .eq('id', id)
  }

  // Fetch artworks
  const { data: artworks } = await supabase
    .from('artworks')
    .select('*')
    .eq('exhibition_id', id)
    .order('order_index', { ascending: true })

  // Transform artworks to match Artwork interface
  const transformedArtworks: Artwork[] = artworks?.map((artwork) => ({
    id: artwork.id,
    title: artwork.title,
    description: artwork.description || '',
    imageUrl: artwork.image_url,
  })) || []

  // Create viewpoints for the parallax gallery (2D view)
  let viewPoints: ViewPoint[] = [
    {
      id: 1,
      background: '',
      artworks: transformedArtworks,
    },
  ]

  // If there are many artworks, split them into multiple viewpoints
  if (transformedArtworks.length > 6) {
    viewPoints = []
    const artworksPerView = 6
    for (let i = 0; i < transformedArtworks.length; i += artworksPerView) {
      viewPoints.push({
        id: i / artworksPerView + 1,
        background: '',
        artworks: transformedArtworks.slice(i, i + artworksPerView),
      })
    }
  }

  return (
    <div>
      <ExhibitionViewer
        viewPoints={viewPoints}
        exhibitionTitle={exhibition.title || '제목 없음'}
        artworks={transformedArtworks}
      />
    </div>
  )
}
