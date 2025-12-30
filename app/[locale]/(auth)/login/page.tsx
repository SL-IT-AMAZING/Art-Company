'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const t = useTranslations('auth')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const authError = searchParams.get('auth_error')
    if (authError) {
      setError(authError)
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // 이메일 미인증 에러 구분
        if (error.message.includes('Email not confirmed')) {
          toast({
            variant: "destructive",
            title: t('loginError'),
            description: t('emailNotConfirmed'),
            duration: 8000,
          })
          setError(t('emailNotConfirmed'))
        } else if (error.message.includes('Invalid login credentials')) {
          toast({
            variant: "destructive",
            title: t('loginError'),
            description: t('invalidCredentials'),
          })
          setError(t('invalidCredentials'))
        } else {
          toast({
            variant: "destructive",
            title: t('loginError'),
            description: error.message,
          })
          setError(error.message)
        }
      } else {
        toast({
          title: t('loginSuccess'),
          description: t('redirectingToMypage'),
        })
        router.push('/mypage')
        router.refresh()
      }
    } catch (err) {
      console.error('Login error:', err)
      toast({
        variant: "destructive",
        title: t('loginError'),
        description: t('unknownError'),
      })
      setError(t('loginError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('loginTitle')}</CardTitle>
          <CardDescription>
            {t('loginWelcome')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <SocialLoginButtons nextPath="/mypage" />
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t('orContinueWithEmail')}
              </span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                {t('email')}
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                {t('password')}
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('loggingIn') : t('login')}
            </Button>
          </form>

          <div className="mt-4 text-right">
            <Link href="/reset-password" className="text-sm text-primary hover:underline">
              {t('forgotPassword')}
            </Link>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{t('noAccount')} </span>
            <Link href="/signup" className="text-primary hover:underline">
              {t('signup')}
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              {t('backToHome')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
