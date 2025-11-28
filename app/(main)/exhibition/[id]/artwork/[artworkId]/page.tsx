import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ArtworkDetailClient from './ArtworkDetailClient'

export default async function ArtworkDetailPage({
  params,
}: {
  params: Promise<{ id: string; artworkId: string }>
}) {
  const { id, artworkId } = await params
  const supabase = await createClient()

  // Fetch exhibition data
  const { data: exhibition, error: exhibitionError } = await supabase
    .from('exhibitions')
    .select('*')
    .eq('id', id)
    .single()

  if (exhibitionError || !exhibition) {
    notFound()
  }

  // Check if exhibition is public or belongs to current user
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user && user.id === exhibition.user_id

  if (!exhibition.is_public && !isOwner) {
    notFound()
  }

  // Fetch current artwork
  const { data: artwork, error: artworkError } = await supabase
    .from('artworks')
    .select('*')
    .eq('id', artworkId)
    .eq('exhibition_id', id)
    .single()

  if (artworkError || !artwork) {
    notFound()
  }

  // Fetch all artworks for navigation
  const { data: allArtworks } = await supabase
    .from('artworks')
    .select('id, title, order_index')
    .eq('exhibition_id', id)
    .order('order_index', { ascending: true })

  // Find current index and prev/next artworks
  const currentIndex = allArtworks?.findIndex(a => a.id === artworkId) ?? -1
  const prevArtwork = currentIndex > 0 ? allArtworks?.[currentIndex - 1] : null
  const nextArtwork = currentIndex < (allArtworks?.length ?? 0) - 1 ? allArtworks?.[currentIndex + 1] : null

  return (
    <ArtworkDetailClient
      artwork={{
        id: artwork.id,
        title: artwork.title,
        description: artwork.description || '',
        imageUrl: artwork.image_url,
        imageWidth: artwork.image_width,
        imageHeight: artwork.image_height,
        aspectRatio: artwork.aspect_ratio,
      }}
      exhibition={{
        id: exhibition.id,
        title: exhibition.title,
        artistName: exhibition.artist_name,
      }}
      navigation={{
        currentIndex: currentIndex + 1,
        totalCount: allArtworks?.length ?? 0,
        prevId: prevArtwork?.id,
        nextId: nextArtwork?.id,
      }}
    />
  )
}
