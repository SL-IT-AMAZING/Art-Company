'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface ExhibitionMetadata {
  exhibitionDate: string
  exhibitionEndDate?: string
  venue: string
  location: string
  artistName: string
  openingHours?: string
  admissionFee?: string
  contactInfo?: string
}

interface ExhibitionMetadataFormProps {
  onSubmit: (metadata: ExhibitionMetadata) => void
  onBack?: () => void
  initialData?: Partial<ExhibitionMetadata>
}

export default function ExhibitionMetadataForm({ onSubmit, onBack, initialData }: ExhibitionMetadataFormProps) {
  const t = useTranslations('metadata')
  const tCommon = useTranslations('common')
  const [formData, setFormData] = useState<ExhibitionMetadata>({
    exhibitionDate: initialData?.exhibitionDate || '',
    exhibitionEndDate: initialData?.exhibitionEndDate || '',
    venue: initialData?.venue || '',
    location: initialData?.location || '',
    artistName: initialData?.artistName || '',
    openingHours: initialData?.openingHours || '',
    admissionFee: initialData?.admissionFee || '',
    contactInfo: initialData?.contactInfo || ''
  })

  const [errors, setErrors] = useState<Partial<Record<keyof ExhibitionMetadata, string>>>({})

  const handleChange = (field: keyof ExhibitionMetadata, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ExhibitionMetadata, string>> = {}

    if (!formData.exhibitionDate) {
      newErrors.exhibitionDate = t('startDateRequired')
    }
    if (!formData.venue) {
      newErrors.venue = t('venueRequired')
    }
    if (!formData.location) {
      newErrors.location = t('addressRequired')
    }
    if (!formData.artistName) {
      newErrors.artistName = t('artistNameRequired')
    }

    // Validate date logic if end date is provided
    if (formData.exhibitionEndDate && formData.exhibitionDate) {
      const startDate = new Date(formData.exhibitionDate)
      const endDate = new Date(formData.exhibitionEndDate)
      if (endDate < startDate) {
        newErrors.exhibitionEndDate = t('endDateAfterStart')
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Artist Name */}
        <div className="space-y-2">
          <Label htmlFor="artistName" className="text-sm font-medium">
            {t('artistName')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="artistName"
            type="text"
            value={formData.artistName}
            onChange={(e) => handleChange('artistName', e.target.value)}
            placeholder={t('artistNamePlaceholder')}
            className={errors.artistName ? 'border-red-500' : ''}
          />
          {errors.artistName && (
            <p className="text-sm text-red-500">{errors.artistName}</p>
          )}
        </div>

        {/* Exhibition Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="exhibitionDate" className="text-sm font-medium">
              {t('startDate')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="exhibitionDate"
              type="date"
              value={formData.exhibitionDate}
              onChange={(e) => handleChange('exhibitionDate', e.target.value)}
              className={errors.exhibitionDate ? 'border-red-500' : ''}
            />
            {errors.exhibitionDate && (
              <p className="text-sm text-red-500">{errors.exhibitionDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="exhibitionEndDate" className="text-sm font-medium">
              {t('endDate')}
            </Label>
            <Input
              id="exhibitionEndDate"
              type="date"
              value={formData.exhibitionEndDate}
              onChange={(e) => handleChange('exhibitionEndDate', e.target.value)}
              className={errors.exhibitionEndDate ? 'border-red-500' : ''}
            />
            {errors.exhibitionEndDate && (
              <p className="text-sm text-red-500">{errors.exhibitionEndDate}</p>
            )}
          </div>
        </div>

        {/* Venue */}
        <div className="space-y-2">
          <Label htmlFor="venue" className="text-sm font-medium">
            {t('venue')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="venue"
            type="text"
            value={formData.venue}
            onChange={(e) => handleChange('venue', e.target.value)}
            placeholder={t('venuePlaceholder')}
            className={errors.venue ? 'border-red-500' : ''}
          />
          {errors.venue && (
            <p className="text-sm text-red-500">{errors.venue}</p>
          )}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium">
            {t('address')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder={t('addressPlaceholder')}
            className={errors.location ? 'border-red-500' : ''}
          />
          {errors.location && (
            <p className="text-sm text-red-500">{errors.location}</p>
          )}
        </div>

        {/* Opening Hours */}
        <div className="space-y-2">
          <Label htmlFor="openingHours" className="text-sm font-medium">
            {t('hours')}
          </Label>
          <Input
            id="openingHours"
            type="text"
            value={formData.openingHours}
            onChange={(e) => handleChange('openingHours', e.target.value)}
            placeholder={t('hoursPlaceholder')}
          />
        </div>

        {/* Admission Fee */}
        <div className="space-y-2">
          <Label htmlFor="admissionFee" className="text-sm font-medium">
            {t('admission')}
          </Label>
          <Input
            id="admissionFee"
            type="text"
            value={formData.admissionFee}
            onChange={(e) => handleChange('admissionFee', e.target.value)}
            placeholder={t('admissionPlaceholder')}
          />
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          <Label htmlFor="contactInfo" className="text-sm font-medium">
            {t('contact')}
          </Label>
          <Textarea
            id="contactInfo"
            value={formData.contactInfo}
            onChange={(e) => handleChange('contactInfo', e.target.value)}
            placeholder={t('contactPlaceholder')}
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4">
          {onBack && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
            >
              {tCommon('previous')}
            </Button>
          )}
          <Button type="submit" className="min-w-32">
            {tCommon('continue')}
          </Button>
        </div>
      </form>
    </div>
  )
}
