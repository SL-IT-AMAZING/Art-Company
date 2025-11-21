import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/mypage'
  const errorDescription = requestUrl.searchParams.get('error_description')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  if (errorDescription) {
    const loginUrl = new URL('/login', requestUrl.origin)
    loginUrl.searchParams.set('auth_error', errorDescription)
    return NextResponse.redirect(loginUrl)
  }

  const redirectUrl = new URL(next, requestUrl.origin)
  return NextResponse.redirect(redirectUrl)
}
