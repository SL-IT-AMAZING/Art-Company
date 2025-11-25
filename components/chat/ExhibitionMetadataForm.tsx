'use client'

import { useState } from 'react'
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
}

export default function ExhibitionMetadataForm({ onSubmit, onBack }: ExhibitionMetadataFormProps) {
  const [formData, setFormData] = useState<ExhibitionMetadata>({
    exhibitionDate: '',
    exhibitionEndDate: '',
    venue: '',
    location: '',
    artistName: '',
    openingHours: '',
    admissionFee: '',
    contactInfo: ''
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
      newErrors.exhibitionDate = '전시 시작일을 입력해주세요'
    }
    if (!formData.venue) {
      newErrors.venue = '전시 장소를 입력해주세요'
    }
    if (!formData.location) {
      newErrors.location = '주소를 입력해주세요'
    }
    if (!formData.artistName) {
      newErrors.artistName = '작가 이름을 입력해주세요'
    }

    // Validate date logic if end date is provided
    if (formData.exhibitionEndDate && formData.exhibitionDate) {
      const startDate = new Date(formData.exhibitionDate)
      const endDate = new Date(formData.exhibitionEndDate)
      if (endDate < startDate) {
        newErrors.exhibitionEndDate = '종료일은 시작일 이후여야 합니다'
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
        <h2 className="text-2xl font-semibold">전시 정보</h2>
        <p className="text-sm text-muted-foreground">
          전시 정보를 입력해주세요. 입력하신 정보는 포스터 및 기타 자료 제작에 활용됩니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Artist Name */}
        <div className="space-y-2">
          <Label htmlFor="artistName" className="text-sm font-medium">
            작가 이름 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="artistName"
            type="text"
            value={formData.artistName}
            onChange={(e) => handleChange('artistName', e.target.value)}
            placeholder="작가 이름을 입력하세요"
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
              시작일 <span className="text-red-500">*</span>
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
              종료일 (선택)
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
            전시 장소 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="venue"
            type="text"
            value={formData.venue}
            onChange={(e) => handleChange('venue', e.target.value)}
            placeholder="예: 서울시립미술관"
            className={errors.venue ? 'border-red-500' : ''}
          />
          {errors.venue && (
            <p className="text-sm text-red-500">{errors.venue}</p>
          )}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium">
            주소 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="예: 서울시 중구 덕수궁길 61"
            className={errors.location ? 'border-red-500' : ''}
          />
          {errors.location && (
            <p className="text-sm text-red-500">{errors.location}</p>
          )}
        </div>

        {/* Opening Hours */}
        <div className="space-y-2">
          <Label htmlFor="openingHours" className="text-sm font-medium">
            운영 시간 (선택)
          </Label>
          <Input
            id="openingHours"
            type="text"
            value={formData.openingHours}
            onChange={(e) => handleChange('openingHours', e.target.value)}
            placeholder="예: 화-일 10:00-18:00"
          />
        </div>

        {/* Admission Fee */}
        <div className="space-y-2">
          <Label htmlFor="admissionFee" className="text-sm font-medium">
            입장료 (선택)
          </Label>
          <Input
            id="admissionFee"
            type="text"
            value={formData.admissionFee}
            onChange={(e) => handleChange('admissionFee', e.target.value)}
            placeholder="예: 무료, ₩10,000"
          />
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          <Label htmlFor="contactInfo" className="text-sm font-medium">
            연락처 (선택)
          </Label>
          <Textarea
            id="contactInfo"
            value={formData.contactInfo}
            onChange={(e) => handleChange('contactInfo', e.target.value)}
            placeholder="예: 이메일, 전화번호, 웹사이트"
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
              이전
            </Button>
          )}
          <Button type="submit" className="min-w-32">
            계속
          </Button>
        </div>
      </form>
    </div>
  )
}
