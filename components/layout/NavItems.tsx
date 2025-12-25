'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils/helpers'

export function NavItems() {
  const pathname = usePathname()
  const t = useTranslations('nav')

  const navItems = [
    { href: '/curation', labelKey: 'aiCurator' },
    { href: '/exhibition', labelKey: 'onlineExhibition' },
    { href: '/notice', labelKey: 'notice' },
    { href: '/about', labelKey: 'about' },
  ] as const

  return (
    <nav className="flex items-center space-x-6 text-sm font-medium flex-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'transition-colors hover:text-foreground/80',
            pathname === item.href
              ? 'text-foreground'
              : 'text-foreground/60'
          )}
        >
          {t(item.labelKey)}
        </Link>
      ))}
    </nav>
  )
}
