import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/mypage'
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Get locale from cookie or default to 'ko'
  const cookieLocale = request.headers.get('cookie')?.match(/NEXT_LOCALE=(\w+)/)?.[1]
  const locale = cookieLocale || 'ko'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    // Magic Link 인증 성공 후 비밀번호 자동 설정
    if (!error && data.user) {
      const pendingPassword = data.user.user_metadata?.pending_password

      if (pendingPassword) {
        // 비밀번호 설정
        await supabase.auth.updateUser({
          password: pendingPassword,
          data: {
            full_name: data.user.user_metadata?.full_name,
            pending_password: null, // 사용 완료된 비밀번호 제거
          },
        })
      }

      // Create registration notification for new users
      // Check if notification already exists
      const { data: existingNotification, error: checkError } = await supabase
        .from('registration_notifications')
        .select('id')
        .eq('user_id', data.user.id)
        .maybeSingle() // Use maybeSingle instead of single to avoid error when no rows

      console.log('Checking existing notification:', { existingNotification, checkError, userId: data.user.id })

      if (!existingNotification) {
        console.log('Creating new notification for user:', data.user.email)
        // Create notification for admin
        const { error: insertError } = await supabase
          .from('registration_notifications')
          .insert({
            user_id: data.user.id,
            user_email: data.user.email,
            user_metadata: data.user.user_metadata || null,
            is_read: false,
          })

        if (insertError) {
          console.error('Failed to create notification:', insertError)
        } else {
          console.log('Notification created successfully')
        }
      } else {
        console.log('Notification already exists for user:', data.user.email)
      }
    }
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
