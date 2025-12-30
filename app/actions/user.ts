'use server'

import { createClient } from '@/lib/supabase/server'

export async function deleteOwnAccount() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Use admin client to delete the user
  const { createClient: createAdminClient } = await import('@supabase/supabase-js')

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  // Delete user using admin API
  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)

  if (error) {
    return { error: error.message }
  }

  // Sign out the user
  await supabase.auth.signOut()

  return { success: true }
}
