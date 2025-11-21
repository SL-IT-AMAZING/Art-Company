import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ParallaxGallery } from '@/components/exhibition/ParallaxGallery'
import { ViewPoint } from '@/types/exhibition'

export default async function ExhibitionViewerPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // Fetch exhibition data
  const { data: exhibition, error } = await supabase
    .from('exhibitions')
    .select('*')
    .eq('id', params.id)
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
      .eq('id', params.id)
  }

  // Fetch artworks
  const { data: artworks } = await supabase
    .from('artworks')
    .select('*')
    .eq('exhibition_id', params.id)
    .order('order_index', { ascending: true })

  // Create viewpoints for the parallax gallery
  // For MVP, we'll create a single viewpoint with all artworks
  let viewPoints: ViewPoint[] = [
    {
      id: 1,
      background: '', // Could use a default background image
      artworks:
        artworks?.map((artwork) => ({
          id: artwork.id,
          title: artwork.title,
          description: artwork.description || '',
          imageUrl: artwork.image_url,
        })) || [],
    },
  ]

  // If there are many artworks, split them into multiple viewpoints
  if (artworks && artworks.length > 6) {
    viewPoints = []
    const artworksPerView = 6
    for (let i = 0; i < artworks.length; i += artworksPerView) {
      viewPoints.push({
        id: i / artworksPerView + 1,
        background: '',
        artworks: artworks.slice(i, i + artworksPerView).map((artwork) => ({
          id: artwork.id,
          title: artwork.title,
          description: artwork.description || '',
          imageUrl: artwork.image_url,
        })),
      })
    }
  }

  return (
    <div>
      <ParallaxGallery
        viewPoints={viewPoints.length > 0 ? viewPoints : [{
          id: 1,
          background: '',
          artworks: artworks?.map((artwork) => ({
            id: artwork.id,
            title: artwork.title,
            description: artwork.description || '',
            imageUrl: artwork.image_url,
          })) || [],
        }]}
        exhibitionTitle={exhibition.title || '제목 없음'}
      />
    </div>
  )
}
