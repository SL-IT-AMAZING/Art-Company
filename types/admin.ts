export type UserRole = 'admin' | 'user'

export interface AdminUser {
  id: string
  email: string
  role: UserRole
  created_at: string
  last_sign_in_at: string | null
  user_metadata: {
    full_name?: string
    username?: string
    bio?: string
    role?: UserRole
  }
}

export interface MemberStats {
  id: string
  email: string
  full_name?: string
  username?: string
  created_at: string
  last_sign_in_at: string | null
  total_exhibitions: number
  public_exhibitions: number
  total_views: number
}

export interface NoticeFormData {
  title_ko: string
  title_en: string
  content_ko: string
  content_en: string
  is_published: boolean
}

export interface RegistrationNotification {
  id: string
  user_id: string
  user_email: string
  user_metadata: any
  is_read: boolean
  created_at: string
}
