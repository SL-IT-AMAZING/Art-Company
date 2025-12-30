import { requireAdmin } from '@/lib/utils/admin'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils/helpers'
import { getTranslations } from 'next-intl/server'
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/app/actions/admin'

export default async function NotificationsPage() {
  await requireAdmin()
  const supabase = await createClient()
  const t = await getTranslations('admin')

  const { data: notifications } = await supabase
    .from('registration_notifications')
    .select('*')
    .order('created_at', { ascending: false })

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">{t('notifications')}</h1>
        {unreadCount > 0 && (
          <form action={markAllNotificationsAsRead}>
            <Button type="submit" variant="outline">
              {t('markAllAsRead')}
            </Button>
          </form>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t('recentRegistrations')} ({unreadCount} {t('unreadNotifications')})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!notifications || notifications.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              {t('noNotifications')}
            </p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{notification.user_email}</p>
                      {!notification.is_read && (
                        <Badge variant="default" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(notification.created_at)}
                    </p>
                    {notification.user_metadata?.full_name && (
                      <p className="text-sm mt-1">
                        Name: {notification.user_metadata.full_name}
                      </p>
                    )}
                  </div>
                  {!notification.is_read && (
                    <form action={markNotificationAsRead.bind(null, notification.id)}>
                      <Button type="submit" variant="ghost" size="sm">
                        {t('markAsRead')}
                      </Button>
                    </form>
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
