'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ResetPasswordRequestForm() {
  const t = useTranslations('auth')
  const supabase = useMemo(() => createClient(), [])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')
    setLoading(true)

    try {
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/reset-password/update`
          : undefined

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage(t('resetPasswordSent'))
        setEmail('')
      }
    } catch (err) {
      setError(t('resetPasswordError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t('resetPasswordTitle')}</CardTitle>
        <CardDescription>
          {t('resetPasswordDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reset-email" className="block text-sm font-medium mb-2">
              {t('email')}
            </label>
            <Input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          {message && <p className="text-sm text-green-600">{message}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('sending') : t('sendResetLink')}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link href="/login" className="text-primary hover:underline">
            {t('backToLogin')}
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
