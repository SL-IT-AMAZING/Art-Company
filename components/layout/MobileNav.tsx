'use client'

import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
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
  logoutAction: () => Promise<{ error: string } | void>
}

export function MobileNav({ user, logoutAction }: MobileNavProps) {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const tAuth = useTranslations('auth')

  const navItems = [
    { href: '/curation', label: t('aiCurator') },
    { href: '/exhibition', label: t('onlineExhibition') },
    { href: '/notice', label: t('notice') },
    { href: '/about', label: t('about') },
  ]

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">{tAuth('openMenu')}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>
            <Link href="/" className="text-xl font-bold">
              ART WIZARD
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
                  <p className="text-sm text-muted-foreground">{tAuth('loggedIn')}</p>
                  <p className="text-sm font-medium truncate">{user.email}</p>
                </div>
                <Link href="/mypage" className="block">
                  <Button variant="outline" className="w-full">
                    {tAuth('myPage')}
                  </Button>
                </Link>
                <form action={logoutAction as any}>
                  <Button variant="ghost" type="submit" className="w-full">
                    {tAuth('logout')}
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full">
                    {tAuth('login')}
                  </Button>
                </Link>
                <Link href="/signup" className="block">
                  <Button className="w-full">
                    {tAuth('signup')}
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
