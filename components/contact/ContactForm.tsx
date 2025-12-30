'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { submitContactInquiry } from '@/app/actions/contact'

interface ContactFormProps {
  userEmail?: string
  userName?: string
}

export function ContactForm({ userEmail, userName }: ContactFormProps) {
  const t = useTranslations('contact')
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: userName || '',
    email: userEmail || '',
    phone: '',
    subject: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await submitContactInquiry(formData)

      if (result.error) {
        toast({
          variant: 'destructive',
          title: t('submitError'),
          description: result.error,
        })
      } else {
        toast({
          title: t('submitSuccess'),
          description: t('submitSuccessDesc'),
          duration: 5000,
        })
        // Reset form (except pre-filled email/name)
        setFormData({
          name: userName || '',
          email: userEmail || '',
          phone: '',
          subject: '',
          message: '',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('submitError'),
        description: t('unknownError'),
      })
    } finally {
      setLoading(false)
    }
  }

  const isEmailReadOnly = !!userEmail

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">{t('name')} *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={t('namePlaceholder')}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="email">{t('email')} *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder={t('emailPlaceholder')}
          required
          readOnly={isEmailReadOnly}
          disabled={isEmailReadOnly}
          className="mt-1"
        />
        {isEmailReadOnly && (
          <p className="text-xs text-muted-foreground mt-1">
            {t('emailAutoFilled')}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">{t('phone')}</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder={t('phonePlaceholder')}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="subject">{t('subject')}</Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder={t('subjectPlaceholder')}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="message">{t('message')} *</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder={t('messagePlaceholder')}
          required
          rows={6}
          className="mt-1"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? t('submitting') : t('submit')}
      </Button>
    </form>
  )
}
