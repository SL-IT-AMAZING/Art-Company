// API Response Types

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Exhibition Types
export interface Exhibition {
  id: string;
  userId: string;
  title: string;
  status: 'draft' | 'completed' | 'published';
  content: ExhibitionContent;
  createdAt: string;
  updatedAt: string;
}

export interface ExhibitionContent {
  artistName: string;
  keywords: string[];
  artworks: Artwork[];
  titleOptions?: string[];
  selectedTitle?: string;
  introduction?: string;
  foreword?: string;
  artistBio?: string;
  artworkDescriptions?: Record<string, string>;
  pressRelease?: string;
  marketingReport?: string;
  posterUrl?: string;
  pdfUrl?: string;
}

export interface Artwork {
  id: string;
  title: string;
  imageUrl: string;
  year?: string;
  medium?: string;
  dimensions?: string;
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  exhibitionId: string;
  messages: ChatMessage[];
  currentStep: number;
  createdAt: string;
}
