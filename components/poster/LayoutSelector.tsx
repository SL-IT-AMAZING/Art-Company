'use client'

import { ArtworkLayout } from '@/lib/poster-templates'
import { Card } from '@/components/ui/card'

interface LayoutSelectorProps {
  selectedLayout: ArtworkLayout
  onLayoutChange: (layout: ArtworkLayout) => void
}

export function LayoutSelector({ selectedLayout, onLayoutChange }: LayoutSelectorProps) {
  const layouts: Array<{
    id: ArtworkLayout
    name: string
    description: string
    preview: string
  }> = [
    {
      id: 'single-large',
      name: '단일 작품 크게',
      description: '대표 작품 1개를 배경으로 크게 배치',
      preview: 'M2,2 L22,2 L22,22 L2,22 Z', // Full rectangle
    },
    {
      id: 'collage',
      name: '작품 콜라주',
      description: '2-4개 작품을 그리드로 조합',
      preview: 'M2,2 L11,2 L11,11 L2,11 Z M13,2 L22,2 L22,11 L13,11 Z M2,13 L11,13 L11,22 L2,22 Z M13,13 L22,13 L22,22 L13,22 Z',
    },
    {
      id: 'pattern',
      name: '작품 패턴',
      description: '작품을 패턴처럼 반복 배치',
      preview: 'M2,2 L6,2 L6,6 L2,6 Z M8,2 L12,2 L12,6 L8,6 Z M14,2 L18,2 L18,6 L14,6 Z M2,8 L6,8 L6,12 L2,12 Z M8,8 L12,8 L12,12 L8,12 Z M14,8 L18,8 L18,12 L14,12 Z M2,14 L6,14 L6,18 L2,18 Z M8,14 L12,14 L12,18 L8,18 Z M14,14 L18,14 L18,18 L14,18 Z',
    },
  ]

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">작품 레이아웃</label>
      <div className="grid grid-cols-3 gap-3">
        {layouts.map((layout) => (
          <Card
            key={layout.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedLayout === layout.id
                ? 'border-primary ring-2 ring-primary ring-offset-2'
                : 'border-gray-200 hover:border-primary/50'
            }`}
            onClick={() => onLayoutChange(layout.id)}
          >
            <div className="p-4 flex flex-col items-center text-center space-y-3">
              {/* Visual preview */}
              <div className="w-full aspect-[3/4] bg-gray-100 rounded flex items-center justify-center relative overflow-hidden">
                <svg
                  viewBox="0 0 24 24"
                  className={`w-full h-full p-2 ${
                    selectedLayout === layout.id ? 'text-primary' : 'text-gray-400'
                  }`}
                  fill="currentColor"
                  opacity="0.4"
                >
                  <path d={layout.preview} />
                </svg>
              </div>

              {/* Text */}
              <div className="w-full">
                <h4 className="font-medium text-sm mb-1">{layout.name}</h4>
                <p className="text-xs text-muted-foreground">{layout.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
