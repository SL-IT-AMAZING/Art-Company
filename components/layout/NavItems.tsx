'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/helpers'

export function NavItems() {
  const pathname = usePathname()

  const navItems = [
    { href: '/curation', label: 'AI 큐레이터' },
    { href: '/exhibition', label: '온라인 전시' },
    { href: '/salon', label: 'Art Salon' },
    { href: '/notice', label: '공지사항' },
    { href: '/about', label: 'About' },
  ]

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
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
