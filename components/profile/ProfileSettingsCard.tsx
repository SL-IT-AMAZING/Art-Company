'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ProfileSettingsCardProps {
  email: string
  initialDisplayName?: string
  initialBio?: string
}

export function ProfileSettingsCard({
  email,
  initialDisplayName = '',
  initialBio = '',
}: ProfileSettingsCardProps) {
  const supabase = useMemo(() => createClient(), [])
  const [displayName, setDisplayName] = useState(initialDisplayName)
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
          full_name: displayName || null,
          bio: bio || null,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('프로필이 업데이트되었습니다.')
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
            <label htmlFor="display-name" className="block text-sm font-medium mb-2">
              이름 / 닉네임
            </label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
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
