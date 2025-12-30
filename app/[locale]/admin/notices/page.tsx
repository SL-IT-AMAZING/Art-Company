import { requireAdmin } from '@/lib/utils/admin'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { NoticesTable } from '@/components/admin/NoticesTable'
import { Plus } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function AdminNoticesPage() {
  await requireAdmin()
  const supabase = await createClient()
  const t = await getTranslations('admin')

  const { data: notices } = await supabase
    .from('notices')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">{t('notices')}</h1>
        <Link href="/admin/notices/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {t('createNotice')}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('manageNotices')}</CardTitle>
        </CardHeader>
        <CardContent>
          <NoticesTable notices={notices || []} />
        </CardContent>
      </Card>
    </div>
  )
}
