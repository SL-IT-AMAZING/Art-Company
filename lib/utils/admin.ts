import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Check if current user is admin
 * @returns boolean indicating admin status
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const role = user.user_metadata?.role
  return role === 'admin'
}

/**
 * Require admin authentication - redirect if not admin
 * Use in server components that require admin access
 */
export async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const role = user.user_metadata?.role
  if (role !== 'admin') {
    redirect('/') // Redirect to home if not admin
  }

  return user
}

/**
 * Get current admin user
 * Returns null if not authenticated or not admin
 */
export async function getAdminUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') {
    return null
  }

  return user
}
