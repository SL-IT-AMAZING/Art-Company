import { requireAdmin } from '@/lib/utils/admin'
import { createClient } from '@/lib/supabase/server'
import { NoticeForm } from '@/components/admin/NoticeForm'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

export default async function EditNoticePage({
  params,
}: {
  params: { id: string }
}) {
  await requireAdmin()
  const supabase = await createClient()
  const t = await getTranslations('admin')

  const { data: notice, error } = await supabase
    .from('notices')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !notice) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">{t('editNotice')}</h1>
      <NoticeForm notice={notice} mode="edit" />
    </div>
  )
}
