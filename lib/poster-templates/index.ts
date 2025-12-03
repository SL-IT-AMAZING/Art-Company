/**
 * Poster Template System - Main Export
 */

// Type definitions
export type {
  TemplateStyle,
  PosterMode,
  ArtworkLayout,
  ColorScheme,
  TypographyConfig,
  LayoutConfig,
  TemplateDefinition,
  PosterData,
  TemplateSelectionCriteria,
  PosterHTMLResult,
  FontConfig,
  TemplateRegistry,
  FontPresetId,
} from './types'

// Font presets
export type { FontPreset } from './font-presets'
export {
  FONT_PRESETS,
  getRecommendedFonts,
  getFontsByCategory,
  getAllFontPresets,
} from './font-presets'

// Templates
export { swissMinimalistTemplate, generateSwissMinimalistHTML } from './swiss-minimalist'
export { boldBrutalistTemplate, generateBoldBrutalistHTML } from './bold-brutalist'
export { classicElegantTemplate, generateClassicElegantHTML } from './classic-elegant'
export { vibrantContemporaryTemplate, generateVibrantContemporaryHTML } from './vibrant-contemporary'

// Artwork layouts
export {
  generateSingleArtworkHTML,
  generateCollageHTML,
  generatePatternHTML,
} from './artwork-layouts'

// Template selection
export {
  selectTemplateFromAnalysis,
  getRecommendedTemplates,
  getTemplateName,
  getTemplateDescription,
} from './template-selector'

// Helper imports for generatePosterHTML function
import { generateSwissMinimalistHTML } from './swiss-minimalist'
import { generateBoldBrutalistHTML } from './bold-brutalist'
import { generateClassicElegantHTML } from './classic-elegant'
import { generateVibrantContemporaryHTML } from './vibrant-contemporary'
import {
  generateSingleArtworkHTML,
  generateCollageHTML,
  generatePatternHTML,
} from './artwork-layouts'
import { TemplateStyle, PosterMode, ArtworkLayout, PosterData, FontPresetId } from './types'
import { FONT_PRESETS } from './font-presets'

/**
 * Main function to generate poster HTML
 */
export function generatePosterHTML(
  mode: PosterMode,
  templateStyle: TemplateStyle,
  posterData: PosterData,
  backgroundUrl?: string,
  artworkLayout?: ArtworkLayout,
  fontPresetId?: FontPresetId
): string {
  // Get font preset if provided
  const fontPreset = fontPresetId ? FONT_PRESETS[fontPresetId] : null
  if (mode === 'ai-background' && backgroundUrl) {
    // AI-generated background mode
    const { title, artistName, exhibitionDate, exhibitionEndDate, venue, location } = posterData

    const formatDate = (dateStr: string) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }

    const dateRange = exhibitionDate
      ? exhibitionEndDate
        ? `${formatDate(exhibitionDate)} - ${formatDate(exhibitionEndDate)}`
        : formatDate(exhibitionDate)
      : ''

    // Prepare custom fonts if font preset is selected
    const customFonts = fontPreset ? {
      titleFont: fontPreset.titleFont,
      bodyFont: fontPreset.bodyFont,
      googleFontUrl: fontPreset.googleFontUrl
    } : undefined

    switch (templateStyle) {
      case 'swiss-minimalist':
        return generateSwissMinimalistHTML(
          backgroundUrl,
          title,
          artistName || '',
          dateRange,
          venue || '',
          location || '',
          customFonts
        )
      case 'bold-brutalist':
        return generateBoldBrutalistHTML(
          backgroundUrl,
          title,
          artistName || '',
          dateRange,
          venue || '',
          location || '',
          customFonts
        )
      case 'classic-elegant':
        return generateClassicElegantHTML(
          backgroundUrl,
          title,
          artistName || '',
          dateRange,
          venue || '',
          location || ''
        )
      case 'vibrant-contemporary':
        return generateVibrantContemporaryHTML(
          backgroundUrl,
          title,
          artistName || '',
          dateRange,
          venue || '',
          location || ''
        )
      default:
        return generateSwissMinimalistHTML(
          backgroundUrl,
          title,
          artistName || '',
          dateRange,
          venue || '',
          location || '',
          customFonts
        )
    }
  } else if (mode === 'artwork-photo' && backgroundUrl) {
    // Artwork-inspired mode - now also uses AI-generated background
    // The background is inspired by the artworks but created by DALL-E
    const { title, artistName, exhibitionDate, exhibitionEndDate, venue, location } = posterData

    const formatDate = (dateStr: string) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }

    const dateRange = exhibitionDate
      ? exhibitionEndDate
        ? `${formatDate(exhibitionDate)} - ${formatDate(exhibitionEndDate)}`
        : formatDate(exhibitionDate)
      : ''

    // Prepare custom fonts if font preset is selected
    const customFonts = fontPreset ? {
      titleFont: fontPreset.titleFont,
      bodyFont: fontPreset.bodyFont,
      googleFontUrl: fontPreset.googleFontUrl
    } : undefined

    // Use the same template system as ai-background mode
    switch (templateStyle) {
      case 'swiss-minimalist':
        return generateSwissMinimalistHTML(
          backgroundUrl,
          title,
          artistName || '',
          dateRange,
          venue || '',
          location || '',
          customFonts
        )
      case 'bold-brutalist':
        return generateBoldBrutalistHTML(
          backgroundUrl,
          title,
          artistName || '',
          dateRange,
          venue || '',
          location || '',
          customFonts
        )
      case 'classic-elegant':
        return generateClassicElegantHTML(
          backgroundUrl,
          title,
          artistName || '',
          dateRange,
          venue || '',
          location || ''
        )
      case 'vibrant-contemporary':
        return generateVibrantContemporaryHTML(
          backgroundUrl,
          title,
          artistName || '',
          dateRange,
          venue || '',
          location || ''
        )
      default:
        return generateSwissMinimalistHTML(
          backgroundUrl,
          title,
          artistName || '',
          dateRange,
          venue || '',
          location || '',
          customFonts
        )
    }
  }

  throw new Error('Invalid poster generation parameters - missing background URL')
}
