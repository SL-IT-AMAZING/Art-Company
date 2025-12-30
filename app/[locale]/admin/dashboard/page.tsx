import { requireAdmin } from '@/lib/utils/admin'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, Bell } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { formatDate } from '@/lib/utils/helpers'

// Admin client for accessing auth.users
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AdminDashboard() {
  await requireAdmin()
  const supabase = await createClient()
  const t = await getTranslations('admin')

  // Fetch stats
  const [
    { data: exhibitions },
    { data: notifications },
    { data: { users } },
  ] = await Promise.all([
    supabase.from('exhibitions').select('user_id'),
    supabase
      .from('registration_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10),
    supabaseAdmin.auth.admin.listUsers(),
  ])

  const totalUsers = users?.length || 0
  const totalExhibitions = exhibitions?.length || 0
  const unreadCount =
    notifications?.filter((n) => !n.is_read).length || 0

  const stats = [
    {
      title: t('totalMembers'),
      value: totalUsers,
      icon: Users,
    },
    {
      title: t('totalExhibitions'),
      value: totalExhibitions,
      icon: FileText,
    },
    {
      title: t('unreadNotifications'),
      value: unreadCount,
      icon: Bell,
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">{t('dashboard')}</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>{t('recentRegistrations')}</CardTitle>
        </CardHeader>
        <CardContent>
          {!notifications || notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('noNotifications')}
            </p>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{notification.user_email}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
