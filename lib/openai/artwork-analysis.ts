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
            text: `You are designing an exhibition poster background. Analyze these artworks to extract visual elements for the poster.

Return JSON:
{
  "dominantColors": ["specific color names like 'deep navy blue', 'warm coral', 'muted sage green'"],
  "colorPalette": "How colors work together (e.g., 'warm earth tones with cool blue accents')",
  "artStyle": "Specific style (e.g., 'fluid abstract with organic shapes', 'geometric minimalism', 'expressive brushwork')",
  "mood": "Emotional quality (e.g., 'contemplative and serene', 'energetic and vibrant')",
  "visualElements": ["specific motifs like 'flowing curves', 'sharp geometric shapes', 'soft gradients', 'textured surfaces'"],
  "suggestedPosterStyle": "Describe the ideal poster background in 1-2 sentences, focusing on how to translate the artwork's essence into an abstract full-bleed background"
}

Be specific and descriptive - these will be used to generate the actual poster background with DALL-E.`,
          },
          ...imageContent,
        ],
      },
    ],
    max_tokens: 800,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0].message.content
  if (!content) {
    throw new Error('No response from artwork analysis')
  }

  return JSON.parse(content)
}
