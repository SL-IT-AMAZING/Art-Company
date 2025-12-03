/**
 * Poster Template System - Type Definitions
 * Professional art exhibition poster generation with multiple template styles
 */

import { FontPresetId } from './font-presets'

// Template style types
export type TemplateStyle =
  | 'swiss-minimalist'
  | 'bold-brutalist'
  | 'classic-elegant'
  | 'vibrant-contemporary'

// Poster generation mode
export type PosterMode =
  | 'ai-background'  // DALL-E generated background
  | 'artwork-photo'  // Use actual artwork images

// Artwork layout types (for artwork-photo mode)
export type ArtworkLayout =
  | 'single-large'    // Single artwork as background
  | 'collage'         // Multiple artworks in grid/composition
  | 'pattern'         // Artwork pattern/repetition

// Export FontPresetId for convenience
export type { FontPresetId } from './font-presets'

// Color scheme for templates
export interface ColorScheme {
  primary: string       // Main text color
  secondary: string     // Secondary text color
  accent?: string       // Accent color (optional)
  background: string    // Background overlay color (for artwork mode)
  backgroundOpacity: number  // Background overlay opacity (0-1)
}

// Typography configuration
export interface TypographyConfig {
  titleFont: string
  bodyFont: string
  titleWeight: number
  bodyWeight: number
  titleSize: {
    min: number      // Minimum size in px
    max: number      // Maximum size in px
    default: number  // Default size in px
  }
  subtitleSize: {
    min: number
    max: number
    default: number
  }
  detailsSize: {
    min: number
    max: number
    default: number
  }
  letterSpacing: string
  lineHeight: number
}

// Layout configuration
export interface LayoutConfig {
  alignment: 'left' | 'center' | 'right'
  titlePosition: 'top' | 'middle' | 'bottom'
  detailsPosition: 'top' | 'middle' | 'bottom'
  padding: {
    top: number
    right: number
    bottom: number
    left: number
  }
  spacing: number  // Gap between sections
  useGrid: boolean
  gridColumns?: number
  gridRows?: number
}

// Template definition
export interface TemplateDefinition {
  id: TemplateStyle
  name: string
  description: string
  colorScheme: ColorScheme
  typography: TypographyConfig
  layout: LayoutConfig
  // Custom CSS additions for specific template styles
  customCSS?: string
}

// Poster data (input)
export interface PosterData {
  exhibitionId: string
  title: string
  artistName?: string
  exhibitionDate?: string
  exhibitionEndDate?: string
  venue?: string
  location?: string
  keywords?: string[]
  artworkUrls?: string[]  // For artwork-photo mode
}

// Template selection criteria
export interface TemplateSelectionCriteria {
  artStyle: string
  mood: string
  dominantColors: string[]
  visualElements: string[]
  complexity: 'simple' | 'moderate' | 'complex'
}

// HTML generation result
export interface PosterHTMLResult {
  html: string
  template: TemplateStyle
  mode: PosterMode
  layout?: ArtworkLayout
}

// Font configuration
export interface FontConfig {
  family: string
  weights: number[]
  googleFontUrl: string
}

// Template registry
export interface TemplateRegistry {
  [key: string]: TemplateDefinition
}
