'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/utils/helpers'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { deleteUserByAdmin } from '@/app/actions/admin'

interface Member {
  id: string
  email?: string
  created_at: string
  last_sign_in_at?: string | null
  user_metadata: any
  total_exhibitions: number
  public_exhibitions: number
  total_views: number
}

export function MembersTable({ members }: { members: Member[] }) {
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const t = useTranslations('admin')
  const router = useRouter()

  const filtered = members.filter(
    (member) =>
      member.email?.toLowerCase().includes(search.toLowerCase()) ||
      member.user_metadata?.full_name
        ?.toLowerCase()
        .includes(search.toLowerCase())
  )

  const handleDelete = async (userId: string, userEmail: string) => {
    if (!confirm(`정말로 ${userEmail} 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    setLoading(userId)
    const result = await deleteUserByAdmin(userId)
    setLoading(null)

    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder={t('searchMembers')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('email')}</TableHead>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('joined')}</TableHead>
              <TableHead>{t('lastSignIn')}</TableHead>
              <TableHead className="text-right">{t('exhibitions')}</TableHead>
              <TableHead className="text-right">{t('views')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-muted-foreground">{t('noMembers')}</p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.email || '-'}</TableCell>
                  <TableCell>
                    {member.user_metadata?.full_name || '-'}
                  </TableCell>
                  <TableCell>{formatDate(member.created_at)}</TableCell>
                  <TableCell>
                    {member.last_sign_in_at
                      ? formatDate(member.last_sign_in_at)
                      : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">
                      {member.total_exhibitions} ({member.public_exhibitions}{' '}
                      public)
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {member.total_views}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(member.id, member.email || 'Unknown')}
                      disabled={loading === member.id}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        {t('showingMembers', { count: filtered.length })} / {members.length}
      </p>
    </div>
  )
}
