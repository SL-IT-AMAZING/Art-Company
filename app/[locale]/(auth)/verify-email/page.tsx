'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function VerifyEmailPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  useEffect(() => {
    if (!email) {
      router.push('/signup')
    }
  }, [email, router])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t('checkYourEmail')}</CardTitle>
          <CardDescription>
            {t('verifyLinkSentTo', { email })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-muted bg-muted/50 p-4">
            <h3 className="font-medium mb-2">{t('nextSteps')}</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-medium">1.</span>
                <span>{t('checkEmailInbox')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">2.</span>
                <span>{t('clickVerificationLink')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">3.</span>
                <span>{t('automaticLogin')}</span>
              </li>
            </ol>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>{t('didNotReceiveEmail')}</p>
            <p className="mt-1">{t('checkSpamFolder')}</p>
          </div>

          <div className="flex flex-col gap-2">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                {t('backToLogin')}
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="ghost" className="w-full">
                {t('backToSignup')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
