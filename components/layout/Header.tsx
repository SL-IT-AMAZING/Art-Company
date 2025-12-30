import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import { NavItems } from './NavItems'
import { MobileNav } from './MobileNav'
import { ProfileMenu } from './ProfileMenu'
import { LanguageToggle } from '@/components/LanguageToggle'
import { getTranslations } from 'next-intl/server'
import { isAdmin } from '@/lib/utils/admin'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const t = await getTranslations('auth')
  const isAdminUser = await isAdmin()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        {/* Mobile Menu */}
        <div className="mr-4 md:hidden">
          <MobileNav user={user} logoutAction={logout} />
        </div>

        {/* Logo */}
        <div className="mr-4 md:mr-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-lg sm:text-xl md:text-2xl font-bold">ART WIZARD</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1">
          <NavItems />
        </div>

        {/* Auth Buttons & Language Toggle */}
        <div className="flex items-center space-x-2 ml-auto">
          <LanguageToggle />
          {user ? (
            <>
              {isAdminUser && (
                <Link href="/admin/dashboard">
                  <Button variant="outline" size="sm">
                    Admin
                  </Button>
                </Link>
              )}
              <ProfileMenu
                email={user.email || ''}
                username={(user.user_metadata?.username as string) || undefined}
                logoutAction={logout}
              />
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline-block">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">{t('login')}</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="text-xs sm:text-sm">{t('signup')}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
