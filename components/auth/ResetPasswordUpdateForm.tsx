'use client'

import { useMemo, useState, useEffect, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ResetPasswordUpdateForm() {
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
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('비밀번호가 변경되었습니다. 다시 로그인해주세요.')
        setTimeout(() => router.replace('/login'), 1500)
      }
    } catch (err) {
      setError('비밀번호 변경 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">새 비밀번호 설정</CardTitle>
        <CardDescription>
          이메일로 수신한 링크를 통해 접속한 경우에만 비밀번호를 변경할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sessionReady ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium mb-2">
                새 비밀번호
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
                새 비밀번호 확인
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
              {loading ? '변경 중...' : '비밀번호 변경'}
            </Button>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              유효한 재설정 링크 없이 접근했습니다. 이메일의 재설정 링크를 통해 다시 접속해주세요.
            </p>
            <Link href="/reset-password" className="text-primary hover:underline">
              재설정 링크 다시 받기
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
