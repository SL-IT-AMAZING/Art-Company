'use client'

import { Step } from '@/types/chat'

const STEP_ORDER: { id: Step; label: string }[] = [
  { id: 'welcome', label: '시작' },
  { id: 'keywords', label: '키워드' },
  { id: 'images', label: '이미지' },
  { id: 'titles', label: '타이틀' },
  { id: 'content', label: '본문 생성' },
  { id: 'press-release', label: '보도자료' },
  { id: 'poster', label: '포스터' },
  { id: 'marketing', label: '마케팅' },
  { id: 'virtual', label: '가상 전시' },
  { id: 'complete', label: '완료' },
]

interface StepProgressProps {
  currentStep: Step
}

export function StepProgress({ currentStep }: StepProgressProps) {
  const currentIndex = Math.max(
    STEP_ORDER.findIndex((step) => step.id === currentStep),
    0
  )

  return (
    <div className="overflow-x-auto">
      <ol className="flex items-center gap-4 min-w-max">
        {STEP_ORDER.map((step, index) => {
          const isComplete = index < currentIndex
          const isActive = index === currentIndex
          return (
            <li key={step.id} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : isComplete
                      ? 'bg-muted text-foreground'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`text-sm ${
                  isActive
                    ? 'font-semibold text-foreground'
                    : isComplete
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
              {index < STEP_ORDER.length - 1 && (
                <div
                  className={`w-8 border-t ${
                    index < currentIndex
                      ? 'border-primary'
                      : 'border-muted'
                  }`}
                />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
