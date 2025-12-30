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
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('admin')

  const filtered = members.filter(
    (member) =>
      member.email?.toLowerCase().includes(search.toLowerCase()) ||
      member.user_metadata?.full_name
        ?.toLowerCase()
        .includes(search.toLowerCase())
  )

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
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
