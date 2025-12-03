'use client'

import { TemplateStyle, getTemplateName, getTemplateDescription } from '@/lib/poster-templates'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'

interface TemplatePreviewProps {
  templates: TemplateStyle[]
  selectedTemplate: TemplateStyle
  onTemplateChange: (template: TemplateStyle) => void
  recommendedTemplate?: TemplateStyle
}

export function TemplatePreview({
  templates,
  selectedTemplate,
  onTemplateChange,
  recommendedTemplate,
}: TemplatePreviewProps) {
  // Template preview illustrations
  const templatePreviews: Record<TemplateStyle, { color: string; pattern: string }> = {
    'swiss-minimalist': {
      color: 'from-gray-100 to-gray-200',
      pattern: 'grid grid-cols-12 grid-rows-12 gap-1 p-2',
    },
    'bold-brutalist': {
      color: 'from-gray-900 to-gray-800',
      pattern: 'flex items-center justify-center p-4',
    },
    'classic-elegant': {
      color: 'from-amber-50 to-stone-100',
      pattern: 'flex flex-col items-center justify-between p-4',
    },
    'vibrant-contemporary': {
      color: 'from-purple-500 via-pink-500 to-cyan-500',
      pattern: 'flex items-center justify-center p-4',
    },
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">포스터 템플릿</label>
      <div className="grid grid-cols-2 gap-4">
        {templates.map((template) => {
          const preview = templatePreviews[template]
          const isRecommended = template === recommendedTemplate

          return (
            <Card
              key={template}
              className={`cursor-pointer transition-all hover:shadow-md relative ${
                selectedTemplate === template
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'border-gray-200 hover:border-primary/50'
              }`}
              onClick={() => onTemplateChange(template)}
            >
              {isRecommended && (
                <div className="absolute -top-2 -right-2 z-10">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
                    <Sparkles className="w-3 h-3 mr-1" />
                    추천
                  </Badge>
                </div>
              )}

              <div className="p-4 flex flex-col space-y-3">
                {/* Visual preview */}
                <div
                  className={`w-full aspect-[3/4] bg-gradient-to-br ${preview.color} rounded overflow-hidden relative`}
                >
                  {template === 'swiss-minimalist' && (
                    <div className="absolute inset-0 p-4 flex flex-col justify-between text-left">
                      <div>
                        <div className="h-3 w-3/4 bg-gray-700 rounded mb-2"></div>
                        <div className="h-2 w-1/2 bg-gray-500 rounded"></div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-2 w-2/3 bg-gray-600 rounded"></div>
                        <div className="h-1.5 w-1/2 bg-gray-500 rounded"></div>
                      </div>
                    </div>
                  )}

                  {template === 'bold-brutalist' && (
                    <div className="absolute inset-0 p-4 flex flex-col justify-between">
                      <div></div>
                      <div>
                        <div className="h-6 w-full bg-white rounded mb-2"></div>
                        <div className="h-2 w-2/3 bg-red-500 rounded mx-auto"></div>
                      </div>
                      <div className="border-t-2 border-white pt-2 space-y-1">
                        <div className="h-1.5 w-3/4 bg-white rounded"></div>
                        <div className="h-1.5 w-1/2 bg-white rounded"></div>
                      </div>
                    </div>
                  )}

                  {template === 'classic-elegant' && (
                    <div className="absolute inset-0 p-6 flex flex-col justify-between items-center text-center">
                      <div className="w-full">
                        <div className="h-3 w-3/4 bg-gray-700 rounded mb-2 mx-auto"></div>
                        <div className="h-1 w-16 bg-amber-700 rounded mx-auto my-2"></div>
                        <div className="h-2 w-1/2 bg-gray-600 rounded mx-auto"></div>
                      </div>
                      <div className="w-full space-y-1">
                        <div className="h-2 w-2/3 bg-gray-700 rounded mx-auto"></div>
                        <div className="h-1.5 w-1/2 bg-gray-600 rounded mx-auto"></div>
                      </div>
                    </div>
                  )}

                  {template === 'vibrant-contemporary' && (
                    <div className="absolute inset-0 p-4 flex flex-col justify-between">
                      <div className="absolute top-0 right-0 w-1/3 h-full bg-white/10 transform skew-x-[-10deg]"></div>
                      <div></div>
                      <div>
                        <div className="h-5 w-full bg-white rounded mb-2"></div>
                        <div className="h-2 w-2/3 bg-white/80 rounded px-3 py-1 inline-block"></div>
                      </div>
                      <div className="bg-black/30 backdrop-blur-sm rounded p-2 space-y-1">
                        <div className="h-1.5 w-3/4 bg-cyan-300 rounded"></div>
                        <div className="h-1.5 w-1/2 bg-white rounded"></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className="w-full">
                  <h4 className="font-semibold text-sm mb-1">{getTemplateName(template)}</h4>
                  <p className="text-xs text-muted-foreground">
                    {getTemplateDescription(template)}
                  </p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
