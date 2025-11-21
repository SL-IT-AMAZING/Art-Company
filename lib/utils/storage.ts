import { createClient } from '@/lib/supabase/client'

/**
 * Extract file path from Supabase storage public URL
 * Example: https://...supabase.co/storage/v1/object/public/artworks/12345-image.jpg
 * Returns: 12345-image.jpg
 */
export function extractFilePathFromUrl(url: string): string | null {
  try {
    const match = url.match(/\/artworks\/(.+)$/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

/**
 * Delete a single image file from Supabase storage
 */
export async function deleteImageFromStorage(imageUrl: string): Promise<boolean> {
  const supabase = createClient()
  const filePath = extractFilePathFromUrl(imageUrl)

  if (!filePath) {
    console.error('Could not extract file path from URL:', imageUrl)
    return false
  }

  const { error } = await supabase.storage
    .from('artworks')
    .remove([filePath])

  if (error) {
    console.error('Error deleting file from storage:', error)
    return false
  }

  return true
}

/**
 * Delete multiple image files from Supabase storage
 */
export async function deleteImagesFromStorage(imageUrls: string[]): Promise<{
  success: boolean
  deletedCount: number
  failedUrls: string[]
}> {
  const results = await Promise.all(
    imageUrls.map(async (url) => ({
      url,
      success: await deleteImageFromStorage(url)
    }))
  )

  const failedUrls = results
    .filter(r => !r.success)
    .map(r => r.url)

  return {
    success: failedUrls.length === 0,
    deletedCount: results.filter(r => r.success).length,
    failedUrls
  }
}
