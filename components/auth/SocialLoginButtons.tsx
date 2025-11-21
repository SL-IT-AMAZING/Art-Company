'use client'

import { useMemo, useState, type ComponentType } from 'react'
import { Loader2, Github, Chrome } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface SocialLoginButtonsProps {
  nextPath?: string
}

type Provider = 'google' | 'github'

const PROVIDERS: { id: Provider; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: 'google', label: 'Google', icon: Chrome },
  { id: 'github', label: 'GitHub', icon: Github },
]

export function SocialLoginButtons({ nextPath = '/mypage' }: SocialLoginButtonsProps) {
  const supabase = useMemo(() => createClient(), [])
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null)
  const [error, setError] = useState('')

  const getRedirectTo = () => {
    if (typeof window === 'undefined') return undefined
    const next = encodeURIComponent(nextPath)
    return `${window.location.origin}/auth/callback?next=${next}`
  }

  const handleSocialLogin = async (provider: Provider) => {
    setError('')
    setLoadingProvider(provider)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: getRedirectTo(),
        },
      })

      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('소셜 로그인 중 오류가 발생했습니다.')
    } finally {
      setLoadingProvider(null)
    }
  }

  return (
    <div className="space-y-3">
      {PROVIDERS.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          disabled={!!loadingProvider}
          onClick={() => handleSocialLogin(id)}
        >
          {loadingProvider === id ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Icon className="w-4 h-4" />
          )}
          <span>{label} 계정으로 계속하기</span>
        </Button>
      ))}

      {error && <p className="text-sm text-destructive text-center">{error}</p>}
    </div>
  )
}
