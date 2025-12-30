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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Mail, Phone } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { markInquiryAsRead, deleteInquiry } from '@/app/actions/contact'

interface Inquiry {
  id: string
  name: string
  email: string
  phone?: string | null
  subject?: string | null
  message: string
  is_read: boolean
  created_at: string
}

export function InquiriesTable({ inquiries }: { inquiries: Inquiry[] }) {
  const t = useTranslations('admin')
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleMarkAsRead = async (id: string) => {
    setLoading(id)
    await markInquiryAsRead(id)
    setLoading(null)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return

    setLoading(id)
    const result = await deleteInquiry(id)
    setLoading(null)

    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
  }

  const handleViewDetails = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry)
    setDialogOpen(true)
    if (!inquiry.is_read) {
      handleMarkAsRead(inquiry.id)
    }
  }

  const handleRowClick = (inquiry: Inquiry) => {
    handleViewDetails(inquiry)
  }

  if (inquiries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{t('noInquiries')}</p>
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('email')}</TableHead>
              <TableHead>{t('subject')}</TableHead>
              <TableHead>{t('createdAt')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.map((inquiry) => (
              <TableRow
                key={inquiry.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleRowClick(inquiry)}
              >
                <TableCell>
                  <Badge variant={inquiry.is_read ? 'secondary' : 'default'}>
                    {inquiry.is_read ? t('read') : t('unread')}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{inquiry.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {inquiry.email}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {inquiry.subject || '-'}
                </TableCell>
                <TableCell>{formatDate(inquiry.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(inquiry.id)
                      }}
                      disabled={loading === inquiry.id}
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

      {selectedInquiry && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedInquiry.subject || t('inquiryDetails')}</DialogTitle>
              <DialogDescription>
                {formatDate(selectedInquiry.created_at)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">{t('name')}</p>
                <p className="text-sm text-muted-foreground">{selectedInquiry.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">{t('email')}</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a
                    href={`mailto:${selectedInquiry.email}`}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    {selectedInquiry.email}
                  </a>
                </div>
              </div>
              {selectedInquiry.phone && (
                <div>
                  <p className="text-sm font-medium mb-1">{t('phone')}</p>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <a
                      href={`tel:${selectedInquiry.phone}`}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      {selectedInquiry.phone}
                    </a>
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm font-medium mb-1">{t('message')}</p>
                <div className="bg-secondary p-4 rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
