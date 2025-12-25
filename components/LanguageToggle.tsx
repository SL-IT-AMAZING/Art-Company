'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'

export function LanguageToggle() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const toggleLocale = () => {
    const nextLocale = locale === 'ko' ? 'en' : 'ko'
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale })
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      disabled={isPending}
      className="text-xs font-medium px-2"
    >
      {isPending ? '...' : locale === 'ko' ? 'EN' : 'KO'}
    </Button>
  )
}
