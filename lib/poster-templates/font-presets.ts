/**
 * Font Presets for Poster Templates
 *
 * Professional font combinations for different poster styles
 */

export type FontPresetId =
  | 'helvetica-clean'        // Modern, clean
  | 'playfair-elegant'       // Classic, elegant
  | 'inter-modern'           // Contemporary, minimal
  | 'bebas-bold'             // Bold, impactful
  | 'cormorant-luxury'       // Luxury, sophisticated
  | 'poppins-friendly'       // Friendly, approachable
  | 'futura-gallery'         // Professional gallery
  | 'crimson-classic'        // Traditional, refined

export interface FontPreset {
  id: FontPresetId
  name: string
  description: string
  titleFont: string
  bodyFont: string
  googleFontUrl: string
  koreanTitleFont: string
  koreanBodyFont: string
  category: 'modern' | 'classic' | 'bold' | 'elegant'
  bestFor: string[]
}

export const FONT_PRESETS: Record<FontPresetId, FontPreset> = {
  'helvetica-clean': {
    id: 'helvetica-clean',
    name: 'Helvetica Clean',
    description: '깔끔하고 전문적인 모던 스타일',
    titleFont: "'Helvetica Neue', Arial, sans-serif",
    bodyFont: "'Helvetica Neue', Arial, sans-serif",
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap',
    koreanTitleFont: "'Noto Sans KR', sans-serif",
    koreanBodyFont: "'Noto Sans KR', sans-serif",
    category: 'modern',
    bestFor: ['Modern art', 'Minimalist', 'Professional'],
  },

  'playfair-elegant': {
    id: 'playfair-elegant',
    name: 'Playfair Elegant',
    description: '우아하고 클래식한 세리프',
    titleFont: "'Playfair Display', serif",
    bodyFont: "'Lato', sans-serif",
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Lato:wght@300;400;700&family=Nanum+Myeongjo:wght@400;700;800&display=swap',
    koreanTitleFont: "'Nanum Myeongjo', serif",
    koreanBodyFont: "'Nanum Myeongjo', serif",
    category: 'elegant',
    bestFor: ['Classical art', 'Luxury', 'Traditional'],
  },

  'inter-modern': {
    id: 'inter-modern',
    name: 'Inter Modern',
    description: '현대적이고 읽기 쉬운 산세리프',
    titleFont: "'Inter', sans-serif",
    bodyFont: "'Inter', sans-serif",
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=Noto+Sans+KR:wght@300;400;500;700&display=swap',
    koreanTitleFont: "'Noto Sans KR', sans-serif",
    koreanBodyFont: "'Noto Sans KR', sans-serif",
    category: 'modern',
    bestFor: ['Contemporary', 'Digital art', 'Modern'],
  },

  'bebas-bold': {
    id: 'bebas-bold',
    name: 'Bebas Bold',
    description: '강렬하고 임팩트 있는 디스플레이',
    titleFont: "'Bebas Neue', sans-serif",
    bodyFont: "'Roboto', sans-serif",
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto:wght@300;400;500&family=Black+Han+Sans&family=Noto+Sans+KR:wght@400;700&display=swap',
    koreanTitleFont: "'Black Han Sans', sans-serif",
    koreanBodyFont: "'Noto Sans KR', sans-serif",
    category: 'bold',
    bestFor: ['Pop art', 'Urban', 'Bold statements'],
  },

  'cormorant-luxury': {
    id: 'cormorant-luxury',
    name: 'Cormorant Luxury',
    description: '럭셔리하고 세련된 세리프',
    titleFont: "'Cormorant Garamond', serif",
    bodyFont: "'Montserrat', sans-serif",
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@300;400;600&family=Nanum+Myeongjo:wght@400;700;800&display=swap',
    koreanTitleFont: "'Nanum Myeongjo', serif",
    koreanBodyFont: "'Nanum Myeongjo', serif",
    category: 'elegant',
    bestFor: ['Fine art', 'Luxury galleries', 'Premium'],
  },

  'poppins-friendly': {
    id: 'poppins-friendly',
    name: 'Poppins Friendly',
    description: '친근하고 활기찬 라운드',
    titleFont: "'Poppins', sans-serif",
    bodyFont: "'Poppins', sans-serif",
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&family=Noto+Sans+KR:wght@300;400;500;700&display=swap',
    koreanTitleFont: "'Noto Sans KR', sans-serif",
    koreanBodyFont: "'Noto Sans KR', sans-serif",
    category: 'modern',
    bestFor: ['Contemporary', 'Vibrant', 'Friendly'],
  },

  'futura-gallery': {
    id: 'futura-gallery',
    name: 'Futura Gallery',
    description: '미술관 전문 지오메트릭',
    titleFont: "'Montserrat', sans-serif", // Futura alternative
    bodyFont: "'Lato', sans-serif",
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Lato:wght@300;400&family=Noto+Sans+KR:wght@400;500;700&display=swap',
    koreanTitleFont: "'Noto Sans KR', sans-serif",
    koreanBodyFont: "'Noto Sans KR', sans-serif",
    category: 'modern',
    bestFor: ['Museums', 'Galleries', 'Professional'],
  },

  'crimson-classic': {
    id: 'crimson-classic',
    name: 'Crimson Classic',
    description: '전통적이고 권위있는 세리프',
    titleFont: "'Crimson Text', serif",
    bodyFont: "'Source Sans Pro', sans-serif",
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&family=Source+Sans+Pro:wght@300;400;600&family=Nanum+Myeongjo:wght@400;700;800&display=swap',
    koreanTitleFont: "'Nanum Myeongjo', serif",
    koreanBodyFont: "'Nanum Myeongjo', serif",
    category: 'classic',
    bestFor: ['Historical', 'Traditional', 'Academic'],
  },
}

// Get recommended fonts for a template style
export function getRecommendedFonts(templateStyle: string): FontPresetId[] {
  const recommendations: Record<string, FontPresetId[]> = {
    'swiss-minimalist': ['helvetica-clean', 'inter-modern', 'futura-gallery'],
    'bold-brutalist': ['bebas-bold', 'helvetica-clean', 'inter-modern'],
    'classic-elegant': ['playfair-elegant', 'cormorant-luxury', 'crimson-classic'],
    'vibrant-contemporary': ['poppins-friendly', 'inter-modern', 'bebas-bold'],
  }

  return recommendations[templateStyle] || ['helvetica-clean', 'inter-modern', 'playfair-elegant']
}

// Get all fonts by category
export function getFontsByCategory(category: FontPreset['category']): FontPreset[] {
  return Object.values(FONT_PRESETS).filter(preset => preset.category === category)
}

// Get all font presets as array
export function getAllFontPresets(): FontPreset[] {
  return Object.values(FONT_PRESETS)
}
