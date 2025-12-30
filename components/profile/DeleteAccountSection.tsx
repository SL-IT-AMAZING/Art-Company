'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deleteOwnAccount } from '@/app/actions/user'
import { useToast } from '@/hooks/use-toast'

export function DeleteAccountSection() {
  const t = useTranslations('mypage')
  const router = useRouter()
  const { toast } = useToast()
  const [deleting, setDeleting] = useState(false)

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const result = await deleteOwnAccount()

      if (result.error) {
        toast({
          variant: 'destructive',
          title: t('deleteAccountError'),
          description: result.error,
        })
      } else {
        toast({
          title: t('deleteAccountSuccess'),
          duration: 3000,
        })
        // Redirect to home page after deletion
        setTimeout(() => {
          router.push('/')
        }, 1000)
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('deleteAccountError'),
        description: t('deleteAccountError'),
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex justify-center">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 border border-destructive" disabled={deleting}>
            {deleting ? '처리 중...' : t('deleteAccount')}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteAccountTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteAccountWarning')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('deleteAccountCancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive hover:bg-destructive/90"
            >
              {t('deleteAccountConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
