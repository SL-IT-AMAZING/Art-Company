'use client'

import { useEffect } from 'react'
import { FontPresetId, FONT_PRESETS, getRecommendedFonts } from '@/lib/poster-templates/font-presets'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Type, Sparkles } from 'lucide-react'
import { TemplateStyle } from '@/lib/poster-templates'

interface FontSelectorProps {
  selectedFont: FontPresetId
  onFontChange: (font: FontPresetId) => void
  templateStyle?: TemplateStyle
}

export function FontSelector({ selectedFont, onFontChange, templateStyle }: FontSelectorProps) {
  const allFonts = Object.values(FONT_PRESETS)
  const recommendedFonts = templateStyle ? getRecommendedFonts(templateStyle) : []

  // Load all Google Fonts when component mounts
  useEffect(() => {
    const loadedLinks = new Set<string>()

    allFonts.forEach(font => {
      if (font.googleFontUrl && !loadedLinks.has(font.googleFontUrl)) {
        const link = document.createElement('link')
        link.href = font.googleFontUrl
        link.rel = 'stylesheet'
        document.head.appendChild(link)
        loadedLinks.add(font.googleFontUrl)
      }
    })
  }, [])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Type className="w-4 h-4" />
        <label className="text-sm font-medium">폰트 선택</label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {allFonts.map((font) => {
          const isRecommended = recommendedFonts.includes(font.id)
          const isSelected = selectedFont === font.id

          return (
            <Card
              key={font.id}
              className={`cursor-pointer transition-all hover:shadow-md relative ${
                isSelected
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'border-gray-200 hover:border-primary/50'
              }`}
              onClick={() => onFontChange(font.id)}
            >
              {isRecommended && (
                <div className="absolute -top-2 -right-2 z-10">
                  <Badge className="bg-amber-500 text-white text-xs px-2 py-0.5">
                    <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                    추천
                  </Badge>
                </div>
              )}

              <div className="p-4 space-y-3">
                {/* Font preview - longer sample with Korean and English */}
                <div className="bg-gray-50 rounded p-4 space-y-3">
                  {/* English preview */}
                  <div className="space-y-1.5">
                    <div
                      className="text-xl font-bold leading-tight"
                      style={{ fontFamily: font.titleFont }}
                    >
                      EXHIBITION
                    </div>
                    <div
                      className="text-sm leading-relaxed"
                      style={{ fontFamily: font.bodyFont }}
                    >
                      Contemporary Art
                    </div>
                  </div>

                  {/* Korean preview */}
                  <div className="border-t pt-2 space-y-1">
                    <div className="text-base font-bold" style={{ fontFamily: font.koreanTitleFont }}>
                      현대미술전시회
                    </div>
                    <div className="text-xs text-gray-600" style={{ fontFamily: font.koreanBodyFont }}>
                      2024년 12월 3일 - 31일
                    </div>
                  </div>
                </div>

                {/* Font info */}
                <div>
                  <h4 className="font-semibold text-sm mb-0.5">{font.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {font.description}
                  </p>
                </div>

                {/* Category badge */}
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    {font.category}
                  </Badge>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Quick filter by category */}
      <div className="flex flex-wrap gap-2 pt-2">
        <span className="text-xs text-muted-foreground">카테고리:</span>
        {(['modern', 'classic', 'bold', 'elegant'] as const).map((category) => {
          const categoryFonts = allFonts.filter(f => f.category === category)
          const hasSelected = categoryFonts.some(f => f.id === selectedFont)

          return (
            <Badge
              key={category}
              variant={hasSelected ? "default" : "outline"}
              className="text-xs cursor-pointer hover:bg-primary/10"
              onClick={() => {
                const firstFont = categoryFonts[0]
                if (firstFont) onFontChange(firstFont.id)
              }}
            >
              {category}
            </Badge>
          )
        })}
      </div>
    </div>
  )
}
