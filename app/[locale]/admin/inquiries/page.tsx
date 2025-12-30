import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { InquiriesTable } from '@/components/admin/InquiriesTable'

export default async function InquiriesPage() {
  await requireAdmin()
  const t = await getTranslations('admin')
  const supabase = await createClient()

  // Fetch all contact inquiries
  const { data: inquiries } = await supabase
    .from('contact_inquiries')
    .select('*')
    .order('created_at', { ascending: false })

  // Count unread inquiries
  const unreadCount = inquiries?.filter((i) => !i.is_read).length || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('inquiries')}</h1>
        <p className="text-muted-foreground">
          {t('inquiriesDesc')} ({t('unreadCount')}: {unreadCount})
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('allInquiries')}</CardTitle>
          <CardDescription>
            {t('totalInquiries', { count: inquiries?.length || 0 })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InquiriesTable inquiries={inquiries || []} />
        </CardContent>
      </Card>
    </div>
  )
}
