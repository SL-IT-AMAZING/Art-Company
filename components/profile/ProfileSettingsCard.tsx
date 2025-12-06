'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ProfileSettingsCardProps {
  email: string
  initialFullName?: string
  initialUsername?: string
  initialBio?: string
  onProfileUpdate?: () => void
}

export function ProfileSettingsCard({
  email,
  initialFullName = '',
  initialUsername = '',
  initialBio = '',
  onProfileUpdate,
}: ProfileSettingsCardProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [fullName, setFullName] = useState(initialFullName)
  const [username, setUsername] = useState(initialUsername)
  const [bio, setBio] = useState(initialBio)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName || null,
          username: username || null,
          bio: bio || null,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('프로필이 업데이트되었습니다.')
        // 페이지 새로고침하여 헤더의 닉네임 즉시 업데이트
        router.refresh()
        // 추가 콜백이 있다면 호출
        if (onProfileUpdate) {
          onProfileUpdate()
        }
      }
    } catch (err) {
      setError('프로필 업데이트 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>프로필 정보</CardTitle>
        <CardDescription>서비스 내에서 표시될 이름과 소개를 관리하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">로그인 이메일</label>
            <Input value={email} disabled readOnly />
          </div>

          <div>
            <label htmlFor="full-name" className="block text-sm font-medium mb-2">
              이름
            </label>
            <Input
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="홍길동"
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              닉네임
            </label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="AI Curator"
            />
          </div>

          <div>
            <label htmlFor="profile-bio" className="block text-sm font-medium mb-2">
              한 줄 소개
            </label>
            <Textarea
              id="profile-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="전시 기획자 / 작가 소개 문장을 입력하세요"
            />
          </div>

          {message && <p className="text-sm text-green-600">{message}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? '저장 중...' : '저장하기'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
