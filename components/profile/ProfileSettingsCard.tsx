'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('profile')
  const tCommon = useTranslations('common')
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
        setMessage(t('updated'))
        router.refresh()
        if (onProfileUpdate) {
          onProfileUpdate()
        }
      }
    } catch (err) {
      setError(t('updateError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('loginEmail')}</label>
            <Input value={email} disabled readOnly />
          </div>

          <div>
            <label htmlFor="full-name" className="block text-sm font-medium mb-2">
              {t('name')}
            </label>
            <Input
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t('namePlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              {t('nickname')}
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
              {t('bio')}
            </label>
            <Textarea
              id="profile-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder={t('bioPlaceholder')}
            />
          </div>

          {message && <p className="text-sm text-green-600">{message}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? tCommon('saving') : tCommon('save')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
