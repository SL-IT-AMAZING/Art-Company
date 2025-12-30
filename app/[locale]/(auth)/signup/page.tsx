'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons'
import { useToast } from '@/hooks/use-toast'

export default function SignupPage() {
  const t = useTranslations('auth')
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [showResendButton, setShowResendButton] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const checkEmailExists = async (email: string) => {
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      return await response.json()
    } catch (error) {
      console.error('Email check failed:', error)
      return { exists: false } // Fail open
    }
  }

  const handleResendVerification = async () => {
    setResendingEmail(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: t('verificationEmailResent'),
          description: t('verifyLinkMessage'),
          duration: 8000,
        })
        router.push(`/verify-email?email=${encodeURIComponent(email)}`)
      } else {
        toast({
          variant: "destructive",
          title: t('resendFailed'),
          description: data.error || t('unknownError'),
        })
      }
    } catch (error) {
      console.error('Resend error:', error)
      toast({
        variant: "destructive",
        title: t('resendFailed'),
        description: t('unknownError'),
      })
    } finally {
      setResendingEmail(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setShowResendButton(false)

    if (password !== confirmPassword) {
      setError(t('passwordsNotMatch'))
      return
    }

    if (password.length < 6) {
      setError(t('passwordMinLength'))
      return
    }

    setLoading(true)
    setCheckingEmail(true)

    try {
      // Step 1: Check if email already exists
      const emailCheck = await checkEmailExists(email)
      setCheckingEmail(false)

      if (emailCheck.exists) {
        if (emailCheck.isConfirmed) {
          // Email exists and is confirmed - redirect to login
          toast({
            variant: "destructive",
            title: t('emailAlreadyExists'),
            description: t('emailAlreadyRegistered'),
          })
          setError(t('emailAlreadyExists'))
          setLoading(false)
          return
        } else {
          // Email exists but not confirmed - offer resend
          toast({
            variant: "destructive",
            title: t('accountNotVerified'),
            description: t('verifyLinkMessage'),
            duration: 8000,
          })
          setError(t('accountNotVerified'))
          setShowResendButton(true)
          setLoading(false)
          return
        }
      }

      // Step 2: Email doesn't exist, proceed with signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/mypage`,
          data: {
            full_name: displayName || undefined,
          },
        },
      })

      // Handle signup errors
      if (error) {
        toast({
          variant: "destructive",
          title: t('signupError'),
          description: error.message,
        })
        setError(error.message)
      } else {
        toast({
          title: t('verifyLinkSent'),
          description: t('verifyLinkMessage'),
          duration: 10000,
        })

        // Redirect to verification page
        router.push(`/verify-email?email=${encodeURIComponent(email)}`)
      }
    } catch (err) {
      console.error('Signup error:', err)
      toast({
        variant: "destructive",
        title: t('signupError'),
        description: t('unknownError'),
      })
      setError(t('signupError'))
    } finally {
      setLoading(false)
      setCheckingEmail(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('signupTitle')}</CardTitle>
          <CardDescription>
            {t('signupWelcome')}
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

          <form onSubmit={handleSignup} className="space-y-4">
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
              <label htmlFor="displayName" className="block text-sm font-medium mb-2">
                {t('displayName')}
              </label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t('displayNamePlaceholder')}
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

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-2"
              >
                {t('confirmPassword')}
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="space-y-3">
                <p className="text-sm text-destructive">{error}</p>
                {showResendButton && (
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResendVerification}
                      disabled={resendingEmail}
                      className="w-full"
                    >
                      {resendingEmail ? t('checkingEmail') : t('resendVerification')}
                    </Button>
                  </div>
                )}
                {error === t('emailAlreadyExists') && (
                  <Link href="/login">
                    <Button type="button" variant="outline" className="w-full">
                      {t('goToLogin')}
                    </Button>
                  </Link>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || checkingEmail}>
              {checkingEmail ? t('checkingEmail') : loading ? t('signingUp') : t('signup')}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{t('alreadyHaveAccount')} </span>
            <Link href="/login" className="text-primary hover:underline">
              {t('login')}
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
