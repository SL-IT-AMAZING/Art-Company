import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ArtworkStyleAnalysis {
  dominantColors: string[]
  colorPalette: string
  artStyle: string
  mood: string
  visualElements: string[]
  suggestedPosterStyle: string
  detailedDescription: string
  brushworkStyle: string
  compositionStyle: string
}

/**
 * Analyzes artwork images using GPT-4o Vision and returns
 * a unified style guide for poster generation.
 *
 * @param imageUrls - Array of artwork image URLs from Supabase
 * @returns ArtworkStyleAnalysis object with colors, style, mood, etc.
 */
export async function analyzeArtworksForPoster(
  imageUrls: string[]
): Promise<ArtworkStyleAnalysis> {
  // Limit to first 4 images to manage costs and API context limits
  const limitedUrls = imageUrls.slice(0, 4)

  const imageContent = limitedUrls.map((url) => ({
    type: 'image_url' as const,
    image_url: {
      url: url,
      detail: 'low' as const, // Use low detail to reduce costs
    },
  }))

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You are designing an exhibition poster background that should CLOSELY RESEMBLE the provided artworks.

${limitedUrls.length > 1 ? 'IMPORTANT: The FIRST image is the PRIMARY REFERENCE. Focus most heavily on matching its colors, textures, and style. Other images provide supporting context.' : ''}

Analyze these artworks in EXTREME DETAIL to recreate a similar visual style:

Return JSON:
{
  "dominantColors": ["exact color names with descriptors like 'deep navy blue #1a3a52', 'warm burnt sienna', 'soft cream white'"],
  "colorPalette": "Precise color relationships and gradients (e.g., 'warm earth tones transitioning to cool blue-grays with touches of golden yellow')",
  "artStyle": "VERY specific style description (e.g., 'loose impressionistic brushwork with visible texture', 'hard-edge geometric abstraction', 'layered mixed media with collage elements')",
  "mood": "Emotional quality (e.g., 'contemplative and serene', 'energetic and dynamic')",
  "visualElements": ["highly specific visual patterns like 'horizontal sweeping brushstrokes', 'overlapping circular forms', 'dripping paint effects', 'sharp angular intersections'"],
  "suggestedPosterStyle": "2-3 sentences describing EXACTLY how to recreate this artwork's visual language as a full-bleed background",
  "detailedDescription": "A detailed 3-4 sentence description of the artwork's visual appearance, textures, layering, and spatial composition that would allow someone to recreate a very similar piece",
  "brushworkStyle": "Describe the mark-making technique (e.g., 'thick impasto with palette knife', 'smooth airbrushed gradients', 'gestural calligraphic strokes')",
  "compositionStyle": "Describe the spatial arrangement (e.g., 'centered focal point with radiating elements', 'all-over field composition', 'asymmetric diagonal movement')"
}

CRITICAL: Be EXTREMELY specific and detailed. The goal is to create a background that looks like it came from the SAME ARTIST and SAME SERIES as these artworks.`,
          },
          ...imageContent,
        ],
      },
    ],
    max_tokens: 1200,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0].message.content
  if (!content) {
    throw new Error('No response from artwork analysis')
  }

  return JSON.parse(content)
}
