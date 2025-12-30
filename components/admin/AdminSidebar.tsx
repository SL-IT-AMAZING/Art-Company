'use client'

import { Link } from '@/i18n/navigation'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/helpers'
import { LayoutDashboard, Users, FileText, Bell } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useTranslations } from 'next-intl'

const adminRoutes = [
  {
    labelKey: 'dashboard',
    icon: LayoutDashboard,
    href: '/admin/dashboard',
  },
  {
    labelKey: 'members',
    icon: Users,
    href: '/admin/members',
  },
  {
    labelKey: 'notices',
    icon: FileText,
    href: '/admin/notices',
  },
  {
    labelKey: 'notifications',
    icon: Bell,
    href: '/admin/notifications',
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const t = useTranslations('admin')

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">{t('adminPanel')}</h2>
      <nav className="space-y-2">
        {adminRoutes.map((route) => {
          const Icon = route.icon
          const isActive = pathname.includes(route.href)

          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{t(route.labelKey)}</span>
            </Link>
          )
        })}
      </nav>
    </Card>
  )
}
