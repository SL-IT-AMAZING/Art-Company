import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import { NavItems } from './NavItems'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">Art Wizard</span>
          </Link>
        </div>

        <NavItems />

        <div className="flex items-center space-x-2">
          {user ? (
            <>
              <Link href="/mypage">
                <Button variant="ghost">{user.email}</Button>
              </Link>
              <form action={logout}>
                <Button variant="outline" type="submit">
                  로그아웃
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">로그인</Button>
              </Link>
              <Link href="/signup">
                <Button>회원가입</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
