import { requireAdmin } from '@/lib/utils/admin'
import { NoticeForm } from '@/components/admin/NoticeForm'
import { getTranslations } from 'next-intl/server'

export default async function NewNoticePage() {
  await requireAdmin()
  const t = await getTranslations('admin')

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">{t('createNotice')}</h1>
      <NoticeForm mode="create" />
    </div>
  )
}
