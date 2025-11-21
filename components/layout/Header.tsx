import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import { NavItems } from './NavItems'
import { MobileNav } from './MobileNav'
import { ProfileMenu } from './ProfileMenu'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
            <span className="text-lg sm:text-xl md:text-2xl font-bold">Art Wizard</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1">
          <NavItems />
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-2 ml-auto">
          {user ? (
            <ProfileMenu
              email={user.email || ''}
              displayName={(user.user_metadata?.full_name as string) || undefined}
              logoutAction={logout}
            />
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline-block">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">로그인</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="text-xs sm:text-sm">회원가입</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
