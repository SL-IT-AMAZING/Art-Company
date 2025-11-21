export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      exhibitions: {
        Row: {
          id: string
          user_id: string
          title: string | null
          keywords: string[] | null
          status: string
          is_public: boolean
          public_slug: string | null
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          keywords?: string[] | null
          status?: string
          is_public?: boolean
          public_slug?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          keywords?: string[] | null
          status?: string
          is_public?: boolean
          public_slug?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      exhibition_content: {
        Row: {
          id: string
          exhibition_id: string
          content_type: string
          content: Json
          version: number
          created_at: string
        }
        Insert: {
          id?: string
          exhibition_id: string
          content_type: string
          content: Json
          version?: number
          created_at?: string
        }
        Update: {
          id?: string
          exhibition_id?: string
          content_type?: string
          content?: Json
          version?: number
          created_at?: string
        }
      }
      artworks: {
        Row: {
          id: string
          exhibition_id: string
          title: string
          description: string | null
          image_url: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          exhibition_id: string
          title: string
          description?: string | null
          image_url: string
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          exhibition_id?: string
          title?: string
          description?: string | null
          image_url?: string
          order_index?: number
          created_at?: string
        }
      }
      posters: {
        Row: {
          id: string
          exhibition_id: string
          template_id: string | null
          image_url: string
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          exhibition_id: string
          template_id?: string | null
          image_url: string
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          exhibition_id?: string
          template_id?: string | null
          image_url?: string
          is_primary?: boolean
          created_at?: string
        }
      }
      virtual_exhibitions: {
        Row: {
          id: string
          exhibition_id: string
          template_type: string
          settings: Json
          created_at: string
        }
        Insert: {
          id?: string
          exhibition_id: string
          template_type?: string
          settings?: Json
          created_at?: string
        }
        Update: {
          id?: string
          exhibition_id?: string
          template_type?: string
          settings?: Json
          created_at?: string
        }
      }
    }
  }
}
