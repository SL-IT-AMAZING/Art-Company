export interface MarketingReport {
  overview: string
  targetAudience: string[]
  marketingPoints: string[]
  pricingStrategy: string
  promotionStrategy: string[]
}

export interface ExhibitionData {
  id?: string
  keywords: string[]
  images: string[]
  selectedTitle: string
  introduction?: string
  preface?: string
  artistBio?: string
  pressRelease?: string
  marketingReport?: MarketingReport
}

export interface Artwork {
  id: string
  title: string
  description: string
  imageUrl: string
  position?: { x: number; y: number }
  size?: { width: number; height: number }
}

export interface ViewPoint {
  id: number
  background: string
  artworks: Artwork[]
}

export interface PosterTemplate {
  id: string
  name: string
  layout: 'minimal' | 'classic' | 'modern'
  backgroundColor: string
  titlePosition: 'top' | 'center' | 'bottom'
  imagePosition: { x: number; y: number; width: number; height: number }
  fonts: {
    title: string
    subtitle: string
    body: string
  }
}

export interface ExhibitionPDFData {
  title: string
  introduction: string
  preface: string
  artworks: Array<{
    title: string
    description: string
    imageUrl: string
  }>
  pressRelease: string
  marketingReport: MarketingReport
}
