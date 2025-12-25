import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/mypage'
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Get locale from cookie or default to 'en'
  const cookieLocale = request.headers.get('cookie')?.match(/NEXT_LOCALE=(\w+)/)?.[1]
  const locale = cookieLocale || 'en'

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  if (errorDescription) {
    const loginUrl = new URL(`/${locale}/login`, requestUrl.origin)
    loginUrl.searchParams.set('auth_error', errorDescription)
    return NextResponse.redirect(loginUrl)
  }

  // Ensure next path has locale prefix
  const nextPath = next.startsWith('/') ? next : '/' + next
  const localizedPath = nextPath.startsWith(`/${locale}`) ? nextPath : `/${locale}${nextPath}`
  const redirectUrl = new URL(localizedPath, requestUrl.origin)
  return NextResponse.redirect(redirectUrl)
}
