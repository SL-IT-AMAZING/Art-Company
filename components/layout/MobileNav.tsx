'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'

interface MobileNavProps {
  user: User | null
  logoutAction: () => Promise<void>
}

export function MobileNav({ user, logoutAction }: MobileNavProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/curation', label: 'AI 큐레이터' },
    { href: '/exhibition', label: '온라인 전시' },
    { href: '/salon', label: 'Art Salon' },
    { href: '/notice', label: '공지사항' },
    { href: '/about', label: 'About' },
  ]

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">메뉴 열기</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>
            <Link href="/" className="text-xl font-bold">
              Art Wizard
            </Link>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col space-y-4 mt-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-lg py-2 px-4 rounded-md transition-colors',
                pathname === item.href
                  ? 'bg-secondary text-foreground font-medium'
                  : 'text-foreground/70 hover:text-foreground hover:bg-secondary/50'
              )}
            >
              {item.label}
            </Link>
          ))}

          <div className="border-t pt-4 mt-4 space-y-2">
            {user ? (
              <>
                <div className="px-4 py-2">
                  <p className="text-sm text-muted-foreground">로그인됨</p>
                  <p className="text-sm font-medium truncate">{user.email}</p>
                </div>
                <Link href="/mypage" className="block">
                  <Button variant="outline" className="w-full">
                    마이페이지
                  </Button>
                </Link>
                <form action={logoutAction}>
                  <Button variant="ghost" type="submit" className="w-full">
                    로그아웃
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full">
                    로그인
                  </Button>
                </Link>
                <Link href="/signup" className="block">
                  <Button className="w-full">
                    회원가입
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
