'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'

interface ProfileMenuProps {
  email: string
  username?: string
  logoutAction: (formData: FormData) => void
}

export function ProfileMenu({ email, username, logoutAction }: ProfileMenuProps) {
  const t = useTranslations('auth')
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <Button
        type="button"
        variant="ghost"
        className="flex items-center gap-2"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{username ? `${username}${t('nameSuffix')}` : email}</span>
        <ChevronDown className="w-4 h-4" />
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-popover shadow-lg z-50">
          <div className="p-3 border-b">
            <p className="text-sm font-semibold leading-tight">
              {username || t('user')}
            </p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
          <div className="flex flex-col p-2 text-sm">
            <Link
              href="/mypage"
              className="px-2 py-1.5 rounded hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              {t('myPage')}
            </Link>
            <Link
              href="/reset-password"
              className="px-2 py-1.5 rounded hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              {t('resetPassword')}
            </Link>
            <form action={logoutAction} className="mt-2">
              <Button type="submit" variant="outline" className="w-full">
                {t('logout')}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
