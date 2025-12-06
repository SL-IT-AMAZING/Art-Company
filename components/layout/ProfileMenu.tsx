'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProfileMenuProps {
  email: string
  username?: string
  logoutAction: (formData: FormData) => void
}

export function ProfileMenu({ email, username, logoutAction }: ProfileMenuProps) {
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
        <span>{username ? `${username}님` : email}</span>
        <ChevronDown className="w-4 h-4" />
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-popover shadow-lg z-50">
          <div className="p-3 border-b">
            <p className="text-sm font-semibold leading-tight">
              {username || '사용자'}
            </p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
          <div className="flex flex-col p-2 text-sm">
            <Link
              href="/mypage"
              className="px-2 py-1.5 rounded hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              마이페이지
            </Link>
            <Link
              href="/reset-password"
              className="px-2 py-1.5 rounded hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              비밀번호 재설정
            </Link>
            <form action={logoutAction} className="mt-2">
              <Button type="submit" variant="outline" className="w-full">
                로그아웃
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
