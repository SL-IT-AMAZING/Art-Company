'use server'

import { createClient } from '@/lib/supabase/server'

export async function createRegistrationNotification(userId: string, userEmail: string, userMetadata: any) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('registration_notifications')
    .insert({
      user_id: userId,
      user_email: userEmail,
      user_metadata: userMetadata || null,
      is_read: false,
    })

  if (error) {
    console.error('Failed to create notification:', error)
    return { error: error.message }
  }

  return { success: true }
}
