'use client'

import { PosterMode } from '@/lib/poster-templates'
import { Card } from '@/components/ui/card'
import { Sparkles, Image } from 'lucide-react'

interface PosterModeSelectorProps {
  selectedMode: PosterMode
  onModeChange: (mode: PosterMode) => void
}

export function PosterModeSelector({ selectedMode, onModeChange }: PosterModeSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">포스터 생성 방식</label>
      <div className="grid grid-cols-2 gap-4">
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedMode === 'ai-background'
              ? 'border-primary ring-2 ring-primary ring-offset-2'
              : 'border-gray-200 hover:border-primary/50'
          }`}
          onClick={() => onModeChange('ai-background')}
        >
          <div className="p-6 flex flex-col items-center text-center space-y-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                selectedMode === 'ai-background'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">AI 배경 생성</h3>
              <p className="text-xs text-muted-foreground">
                작품 스타일을 분석하여<br />AI가 맞춤형 배경을 생성합니다
              </p>
            </div>
          </div>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedMode === 'artwork-photo'
              ? 'border-primary ring-2 ring-primary ring-offset-2'
              : 'border-gray-200 hover:border-primary/50'
          }`}
          onClick={() => onModeChange('artwork-photo')}
        >
          <div className="p-6 flex flex-col items-center text-center space-y-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                selectedMode === 'artwork-photo'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Image className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">작품 영감 배경</h3>
              <p className="text-xs text-muted-foreground">
                작품 스타일을 분석하여<br />맞춤형 AI 배경을 생성합니다
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
