/**
 * Template Auto-Selection Logic
 *
 * Intelligently selects the best template based on artwork analysis
 */

import { TemplateStyle, TemplateSelectionCriteria } from './types'
import { ArtworkStyleAnalysis } from '@/lib/openai/artwork-analysis'

/**
 * Select optimal template based on artwork analysis
 */
export function selectTemplateFromAnalysis(
  analysis: ArtworkStyleAnalysis
): TemplateStyle {
  const { artStyle, mood, visualElements, dominantColors } = analysis

  // Combine all text for keyword matching
  const allText = `${artStyle} ${mood} ${visualElements.join(' ')}`.toLowerCase()

  // Score each template
  const scores = {
    'swiss-minimalist': scoreSwissMinimalist(allText, dominantColors),
    'bold-brutalist': scoreBoldBrutalist(allText, dominantColors),
    'classic-elegant': scoreClassicElegant(allText, dominantColors),
    'vibrant-contemporary': scoreVibrantContemporary(allText, dominantColors),
  }

  // Return template with highest score
  const selectedTemplate = Object.entries(scores).reduce((max, [template, score]) =>
    score > max.score ? { template: template as TemplateStyle, score } : max,
    { template: 'swiss-minimalist' as TemplateStyle, score: 0 }
  )

  console.log('[Template Selector] Scores:', scores)
  console.log('[Template Selector] Selected:', selectedTemplate.template)

  return selectedTemplate.template
}

/**
 * Score Swiss Minimalist template
 */
function scoreSwissMinimalist(text: string, colors: string[]): number {
  let score = 0

  // Style keywords
  const keywords = [
    'minimalist', 'minimal', 'clean', 'simple', 'geometric',
    'modern', 'contemporary', 'abstract', 'structured', 'grid',
    'precise', 'orderly', 'systematic', 'rational', 'functional'
  ]

  keywords.forEach(keyword => {
    if (text.includes(keyword)) score += 2
  })

  // Favor monochromatic or limited color palettes
  if (colors.length <= 3) score += 3

  // Look for neutral colors
  const neutrals = ['black', 'white', 'gray', 'grey', 'beige', 'neutral']
  neutrals.forEach(color => {
    if (colors.some(c => c.toLowerCase().includes(color))) score += 2
  })

  return score
}

/**
 * Score Bold Brutalist template
 */
function scoreBoldBrutalist(text: string, colors: string[]): number {
  let score = 0

  // Style keywords
  const keywords = [
    'bold', 'brutalist', 'raw', 'experimental', 'avant-garde',
    'unconventional', 'edgy', 'stark', 'industrial', 'urban',
    'contemporary', 'modern', 'expressive', 'dynamic', 'powerful',
    'abstract', 'minimalist', 'monochromatic'
  ]

  keywords.forEach(keyword => {
    if (text.includes(keyword)) score += 2
  })

  // Favor high-contrast or monochromatic schemes
  const hasBlackWhite = colors.some(c => {
    const lower = c.toLowerCase()
    return lower.includes('black') || lower.includes('white')
  })
  if (hasBlackWhite) score += 3

  // Favor bold or strong moods
  if (text.includes('strong') || text.includes('intense') || text.includes('dramatic')) {
    score += 3
  }

  return score
}

/**
 * Score Classic Elegant template
 */
function scoreClassicElegant(text: string, colors: string[]): number {
  let score = 0

  // Style keywords
  const keywords = [
    'classical', 'classic', 'traditional', 'elegant', 'refined',
    'sophisticated', 'timeless', 'formal', 'graceful', 'luxurious',
    'vintage', 'historical', 'renaissance', 'baroque', 'romantic',
    'portraiture', 'realistic', 'figurative', 'ornate'
  ]

  keywords.forEach(keyword => {
    if (text.includes(keyword)) score += 2
  })

  // Favor warm, muted, or elegant colors
  const elegantColors = ['gold', 'brown', 'cream', 'beige', 'burgundy', 'navy', 'bronze']
  elegantColors.forEach(color => {
    if (colors.some(c => c.toLowerCase().includes(color))) score += 2
  })

  // Favor calm, refined moods
  if (text.includes('calm') || text.includes('serene') || text.includes('peaceful')) {
    score += 2
  }

  return score
}

/**
 * Score Vibrant Contemporary template
 */
function scoreVibrantContemporary(text: string, colors: string[]): number {
  let score = 0

  // Style keywords
  const keywords = [
    'vibrant', 'colorful', 'bright', 'energetic', 'dynamic',
    'pop art', 'contemporary', 'modern', 'playful', 'lively',
    'digital', 'neon', 'gradient', 'bold colors', 'expressive',
    'abstract', 'street art', 'graffiti', 'psychedelic'
  ]

  keywords.forEach(keyword => {
    if (text.includes(keyword)) score += 2
  })

  // Favor multiple vibrant colors
  if (colors.length >= 4) score += 3

  // Look for vibrant color names
  const vibrantColors = [
    'red', 'orange', 'yellow', 'pink', 'purple', 'cyan',
    'magenta', 'lime', 'turquoise', 'violet', 'neon'
  ]
  let vibrantCount = 0
  vibrantColors.forEach(color => {
    if (colors.some(c => c.toLowerCase().includes(color))) vibrantCount++
  })
  score += vibrantCount * 2

  // Favor energetic moods
  if (text.includes('energetic') || text.includes('playful') || text.includes('dynamic')) {
    score += 3
  }

  return score
}

/**
 * Get all templates in recommended order for user selection
 */
export function getRecommendedTemplates(
  analysis?: ArtworkStyleAnalysis
): TemplateStyle[] {
  if (!analysis) {
    // Default order if no analysis
    return [
      'swiss-minimalist',
      'vibrant-contemporary',
      'bold-brutalist',
      'classic-elegant',
    ]
  }

  // Score all templates
  const allText = `${analysis.artStyle} ${analysis.mood} ${analysis.visualElements.join(' ')}`.toLowerCase()
  const scores = [
    { template: 'swiss-minimalist' as TemplateStyle, score: scoreSwissMinimalist(allText, analysis.dominantColors) },
    { template: 'bold-brutalist' as TemplateStyle, score: scoreBoldBrutalist(allText, analysis.dominantColors) },
    { template: 'classic-elegant' as TemplateStyle, score: scoreClassicElegant(allText, analysis.dominantColors) },
    { template: 'vibrant-contemporary' as TemplateStyle, score: scoreVibrantContemporary(allText, analysis.dominantColors) },
  ]

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score)

  return scores.map(s => s.template)
}

/**
 * Get template display name
 */
export function getTemplateName(style: TemplateStyle): string {
  const names: Record<TemplateStyle, string> = {
    'swiss-minimalist': 'Swiss Minimalist',
    'bold-brutalist': 'Bold Brutalist',
    'classic-elegant': 'Classic Elegant',
    'vibrant-contemporary': 'Vibrant Contemporary',
  }
  return names[style]
}

/**
 * Get template description
 */
export function getTemplateDescription(style: TemplateStyle): string {
  const descriptions: Record<TemplateStyle, string> = {
    'swiss-minimalist': 'Clean, grid-based design. Professional and timeless.',
    'bold-brutalist': 'Oversized typography. Modern and eye-catching.',
    'classic-elegant': 'Centered, refined design. Sophisticated and timeless.',
    'vibrant-contemporary': 'Bold gradients and dynamic layout. Energetic and modern.',
  }
  return descriptions[style]
}
