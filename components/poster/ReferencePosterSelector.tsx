'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Image as ImageIcon, Check } from 'lucide-react'

interface ReferencePosterSelectorProps {
  selectedReference: string | null
  onReferenceChange: (reference: string | null) => void
  artworkImages: string[]
}

export function ReferencePosterSelector({
  selectedReference,
  onReferenceChange,
  artworkImages
}: ReferencePosterSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-4 h-4" />
        <label className="text-sm font-medium">참고 이미지 선택 (선택사항)</label>
      </div>
      <p className="text-xs text-muted-foreground">
        업로드한 작품 중 하나를 선택하면 해당 이미지의 색감과 분위기를 더욱 정확하게 반영합니다
      </p>

      <div className="grid grid-cols-3 gap-3">
        {/* No reference option */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-md relative ${
            selectedReference === null
              ? 'border-primary ring-2 ring-primary ring-offset-2'
              : 'border-gray-200 hover:border-primary/50'
          }`}
          onClick={() => onReferenceChange(null)}
        >
          <div className="aspect-square bg-gray-100 flex items-center justify-center rounded-t">
            <div className="text-center p-4">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-xs text-gray-600">자동 선택</p>
            </div>
          </div>
          {selectedReference === null && (
            <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
              <Check className="w-3 h-3" />
            </div>
          )}
        </Card>

        {/* Artwork images */}
        {artworkImages.slice(0, 8).map((imageUrl, index) => {
          const isSelected = selectedReference === imageUrl
          return (
            <Card
              key={index}
              className={`cursor-pointer transition-all hover:shadow-md relative overflow-hidden ${
                isSelected
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'border-gray-200 hover:border-primary/50'
              }`}
              onClick={() => onReferenceChange(imageUrl)}
            >
              <div className="aspect-square relative">
                <img
                  src={imageUrl}
                  alt={`작품 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                  <Check className="w-3 h-3" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                작품 {index + 1}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
