'use client'

import { useMemo, useState, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ResetPasswordUpdateForm() {
  const t = useTranslations('auth')
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessionReady(!!data.session)
    })
  }, [supabase])

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (password.length < 6) {
      setError(t('passwordMinLength'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('passwordsNotMatch'))
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setError(error.message)
      } else {
        setMessage(t('passwordChanged'))
        setTimeout(() => router.replace('/login'), 1500)
      }
    } catch (err) {
      setError(t('passwordChangeError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t('newPasswordTitle')}</CardTitle>
        <CardDescription>
          {t('newPasswordDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sessionReady ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium mb-2">
                {t('newPassword')}
              </label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium mb-2">
                {t('confirmNewPassword')}
              </label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {message && <p className="text-sm text-green-600">{message}</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('changing') : t('changePassword')}
            </Button>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              {t('invalidResetLink')}
            </p>
            <Link href="/reset-password" className="text-primary hover:underline">
              {t('requestNewLink')}
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
