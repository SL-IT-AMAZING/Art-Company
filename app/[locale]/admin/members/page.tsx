import { requireAdmin } from '@/lib/utils/admin'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MembersTable } from '@/components/admin/MembersTable'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getTranslations } from 'next-intl/server'

export default async function AdminMembersPage() {
  await requireAdmin()
  const t = await getTranslations('admin')

  // Use service role client to access auth.users
  const cookieStore = await cookies()
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  // Fetch all users using admin API
  const {
    data: { users },
    error,
  } = await supabaseAdmin.auth.admin.listUsers()

  if (error) {
    console.error('Error fetching users:', error)
    return (
      <div>
        <h1 className="text-4xl font-bold mb-6">{t('members')}</h1>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Error loading members
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch exhibition counts for each user
  const regularSupabase = await createClient()
  const usersWithStats = await Promise.all(
    users.map(async (user) => {
      const { data: exhibitions } = await regularSupabase
        .from('exhibitions')
        .select('id, is_public, view_count')
        .eq('user_id', user.id)

      return {
        ...user,
        total_exhibitions: exhibitions?.length || 0,
        public_exhibitions:
          exhibitions?.filter((e) => e.is_public).length || 0,
        total_views:
          exhibitions?.reduce((sum, e) => sum + (e.view_count || 0), 0) || 0,
      }
    })
  )

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">{t('members')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t('allMembers')}</CardTitle>
        </CardHeader>
        <CardContent>
          <MembersTable members={usersWithStats} />
        </CardContent>
      </Card>
    </div>
  )
}
