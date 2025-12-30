'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/admin'

interface ContactFormData {
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
}

export async function submitContactInquiry(formData: ContactFormData) {
  const supabase = await createClient()

  const { error } = await supabase.from('contact_inquiries').insert({
    name: formData.name,
    email: formData.email,
    phone: formData.phone || null,
    subject: formData.subject || null,
    message: formData.message,
    is_read: false,
  })

  if (error) {
    console.error('Failed to submit contact inquiry:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/inquiries')
  return { success: true }
}

export async function markInquiryAsRead(id: string) {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('contact_inquiries')
    .update({ is_read: true })
    .eq('id', id)

  if (error) {
    console.error('Failed to mark inquiry as read:', error)
  }

  revalidatePath('/admin/inquiries')
  revalidatePath('/admin/dashboard')
}

export async function deleteInquiry(id: string) {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase.from('contact_inquiries').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/inquiries')
  return { success: true }
}
