'use client'

import { useMemo, useState, type ComponentType } from 'react'
import { Loader2, Chrome } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface SocialLoginButtonsProps {
  nextPath?: string
}

type Provider = 'google'

const PROVIDERS: { id: Provider; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: 'google', label: 'Google', icon: Chrome },
]

export function SocialLoginButtons({ nextPath = '/mypage' }: SocialLoginButtonsProps) {
  const [loading, setLoading] = useState<Provider | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const handleSocialLogin = async (provider: Provider) => {
    try {
      setLoading(provider)

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${nextPath}`,
        },
      })

      if (error) {
        console.error(`${provider} login error:`, error)
        alert(`${provider} 로그인에 실패했습니다: ${error.message}`)
      }
    } catch (error) {
      console.error('Social login error:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      {PROVIDERS.map((provider) => {
        const Icon = provider.icon
        const isLoading = loading === provider.id

        return (
          <Button
            key={provider.id}
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleSocialLogin(provider.id)}
            disabled={isLoading || loading !== null}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icon className="mr-2 h-4 w-4" />
            )}
            {provider.label}로 계속하기
          </Button>
        )
      })}
    </div>
  )
}
