'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/admin'
import type { NoticeFormData } from '@/types/admin'

// ==================== NOTICES MANAGEMENT ====================

export async function createNotice(formData: NoticeFormData) {
  const user = await requireAdmin()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notices')
    .insert({
      ...formData,
      author_id: user.id,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/notices')
  revalidatePath('/notice')
  return { data }
}

export async function updateNotice(id: string, formData: NoticeFormData) {
  await requireAdmin()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notices')
    .update(formData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/notices')
  revalidatePath(`/admin/notices/${id}/edit`)
  revalidatePath('/notice')
  return { data }
}

export async function deleteNotice(id: string) {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase.from('notices').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/notices')
  revalidatePath('/notice')
  return { success: true }
}

export async function toggleNoticePublish(id: string, isPublished: boolean) {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('notices')
    .update({ is_published: isPublished })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/notices')
  revalidatePath('/notice')
  return { success: true }
}

// ==================== NOTIFICATIONS MANAGEMENT ====================

export async function markNotificationAsRead(id: string) {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('registration_notifications')
    .update({ is_read: true })
    .eq('id', id)

  if (error) {
    console.error('Error marking notification as read:', error.message)
  }

  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/notifications')
}

export async function markAllNotificationsAsRead() {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('registration_notifications')
    .update({ is_read: true })
    .eq('is_read', false)

  if (error) {
    console.error('Error marking all notifications as read:', error.message)
  }

  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/notifications')
}

// ==================== MEMBERS MANAGEMENT ====================

export async function getMemberStats(userId: string) {
  await requireAdmin()
  const supabase = await createClient()

  // Get user's exhibition stats
  const { data: exhibitions, error } = await supabase
    .from('exhibitions')
    .select('id, is_public, view_count')
    .eq('user_id', userId)

  if (error) {
    return { error: error.message }
  }

  const stats = {
    total_exhibitions: exhibitions.length,
    public_exhibitions: exhibitions.filter((e) => e.is_public).length,
    total_views: exhibitions.reduce((sum, e) => sum + (e.view_count || 0), 0),
  }

  return { data: stats }
}
