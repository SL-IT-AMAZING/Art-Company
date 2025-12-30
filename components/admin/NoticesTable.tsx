'use client'

import { formatDate } from '@/lib/utils/helpers'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { deleteNotice, toggleNoticePublish } from '@/app/actions/admin'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'

interface Notice {
  id: string
  title_ko: string
  title_en: string
  is_published: boolean
  created_at: string
  updated_at: string
}

export function NoticesTable({ notices }: { notices: Notice[] }) {
  const t = useTranslations('admin')
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return

    setLoading(id)
    const result = await deleteNotice(id)
    setLoading(null)

    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
  }

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    setLoading(id)
    const result = await toggleNoticePublish(id, !currentStatus)
    setLoading(null)

    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
  }

  if (notices.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{t('noNotices')}</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('title')} (KO)</TableHead>
            <TableHead>{t('title')} (EN)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>{t('createdAt')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notices.map((notice) => (
            <TableRow key={notice.id}>
              <TableCell className="font-medium max-w-xs truncate">
                {notice.title_ko}
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {notice.title_en}
              </TableCell>
              <TableCell>
                <Badge variant={notice.is_published ? 'default' : 'secondary'}>
                  {notice.is_published ? t('published') : t('draft')}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(notice.created_at)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleTogglePublish(notice.id, notice.is_published)
                    }
                    disabled={loading === notice.id}
                  >
                    {notice.is_published ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Link href={`/admin/notices/${notice.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(notice.id)}
                    disabled={loading === notice.id}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
